/* biometric.js - Face & Voice sign-in and voice commands for NovaClip.
   ----------------------------------------------------------------------
   Everything runs in the browser. No face image, no voice clip and no
   descriptor is ever uploaded: profiles live in this device's localStorage
   under the key nc_bio_profiles, so 'sign in with your face' here means
   'unlock on THIS browser' - the same model as a password manager's
   fingerprint prompt, not a server-side identity.

   Face:    face-api.js (tiny face detector + landmarks + a 128-dimension
            descriptor). The library and its model weights come from a CDN
            with a fallback; if both are unreachable the panel says so
            instead of pretending to work (school networks block CDNs).

   Voice:   a demo-grade voiceprint. The Web Audio analyser averages the
            log-scaled spectral shape of ~2.5s of speech into a 24-number
            vector, and sign-in compares cosine similarity. This is NOT
            forensic speaker ID - a good impersonation can beat it - but
            for a teen toolkit that has to live entirely in the tab it is
            honest, fast and private.

   Commands: the Web Speech API listens continuously (when turned on) and
            matches phrases like 'open studio' or 'go home' against the
            site's pages. Pages can add their own phrases through
            window.ncBiometric.addCommands().

   The panel is a floating button bottom-right, styled to match the site.
   Self-guard: embed contexts (?embed=1) and pages that opt out with
   <script data-biometric='off'> never mount any of this.
   ---------------------------------------------------------------------- */
(function () {
  'use strict';

  if (window.ncBiometric) return;

  /* Pages that render inside iframes (typing.html, game.html?embed=1) must
     not show a second floating panel inside a floating panel, and a plain
     script tag that wants out can say so. */
  var scr = document.currentScript;
  if (scr && scr.dataset && scr.dataset.biometric === 'off') return;
  if (/[?&]embed=1/.test(location.search)) return;

  /* ------------------------------------------------------------------
   * Storage helpers (localStorage can throw in private mode)
   * ------------------------------------------------------------------ */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  var PROFILES_KEY = 'nc_bio_profiles';
  var SESSION_KEY = 'nc_bio_session';
  var VCMD_KEY = 'nc_bio_vcmd';
  var SESSION_TTL = 12 * 60 * 60 * 1000;

  function langCode() {
    try { var L = localStorage.getItem('nc_lang'); if (L) return L; } catch (e) {}
    return 'en';
  }
  function ui(key) {
    var s = UI[key] || {};
    return s[langCode()] || s.en || key;
  }
  function ui2(key, rep) {
    var s = ui(key);
    for (var k in rep) s = s.replace(k, rep[k]);
    return s;
  }

  /* ------------------------------------------------------------------
   * Panel dictionary. English and Persian (فارسی) cover the whole panel;
   * Spanish / Portuguese / French / German / Arabic cover the primary
   * labels, and anything missing falls back to English.
   * ------------------------------------------------------------------ */
  var UI = {
    fab: { en: 'Face & Voice', fa: 'صورت و صدا', es: 'Rostro y voz', pt: 'Rosto e voz', fr: 'Visage et voix', de: 'Gesicht und Stimme', ar: 'الوجه والصوت' },
    title: { en: 'Face & Voice sign-in', fa: 'ورود با صورت و صدا', es: 'Inicio con rostro y voz', pt: 'Entrar com rosto e voz', fr: 'Connexion visage et voix', de: 'Anmeldung per Gesicht und Stimme', ar: 'تسجيل الدخول بالوجه والصوت' },
    signedOut: { en: 'Not signed in', fa: 'وارد نشده‌اید', es: 'Sin sesión', pt: 'Não autenticado', fr: 'Non connecté', de: 'Nicht angemeldet', ar: 'غير مسجل الدخول' },
    signedInAs: { en: 'Signed in as {n}', fa: 'وارد شده‌اید به‌عنوان {n}', es: 'Conectado como {n}', pt: 'Autenticado como {n}', fr: 'Connecté en tant que {n}', de: 'Angemeldet als {n}', ar: 'مسجل الدخول باسم {n}' },
    btnSignIn: { en: 'Sign in with face & voice', fa: 'ورود با صورت و صدا', es: 'Iniciar con rostro y voz', pt: 'Entrar com rosto e voz', fr: 'Se connecter', de: 'Anmelden', ar: 'تسجيل الدخول' },
    btnFaceOnly: { en: 'Face only', fa: 'فقط صورت', es: 'Solo rostro', pt: 'Só rosto', fr: 'Visage seul', de: 'Nur Gesicht', ar: 'الوجه فقط' },
    btnVoiceOnly: { en: 'Voice only', fa: 'فقط صدا', es: 'Solo voz', pt: 'Só voz', fr: 'Voix seule', de: 'Nur Stimme', ar: 'الصوت فقط' },
    btnEnroll: { en: 'Enroll face & voice', fa: 'ثبت صورت و صدا', es: 'Registrar rostro y voz', pt: 'Registar rosto e voz', fr: 'Enregistrer un profil', de: 'Gesicht und Stimme anlegen', ar: 'تسجيل جديد' },
    enrollName: { en: 'Your creator name', fa: 'نام سازنده', es: 'Tu nombre', pt: 'O teu nome', fr: 'Ton nom', de: 'Dein Name', ar: 'اسمك' },
    enrollStart: { en: 'Start enrollment', fa: 'شروع ثبت', es: 'Empezar', pt: 'Começar', fr: 'Commencer', de: 'Starten', ar: 'ابدأ' },
    lookAtCam: { en: 'Look at the camera, then press capture', fa: 'به دوربین نگاه کنید، بعد دکمه را بزنید', es: 'Mira a la cámara y pulsa capturar', pt: 'Olha para a câmara e toca em capturar', fr: 'Regarde la caméra, puis capture', de: 'Schau in die Kamera, dann aufnehmen', ar: 'انظر إلى الكاميرا ثم اضغط' },
    captureFace: { en: 'Capture face', fa: 'گرفتن صورت', es: 'Capturar', pt: 'Capturar', fr: 'Capturer', de: 'Gesicht aufnehmen', ar: 'التقاط الوجه' },
    sayPhrase: { en: 'Say the passphrase: NovaClip, open the studio', fa: 'عبارت را بگویید: NovaClip، استودیو را باز کن', es: 'Di la frase: NovaClip, abre el estudio', pt: 'Diz: NovaClip, abre o estúdio', fr: 'Dis la phrase: NovaClip, ouvre le studio', de: 'Sprich: NovaClip, öffne das Studio', ar: 'قل العبارة: NovaClip، افتح الاستوديو' },
    saveProfile: { en: 'Save my profile', fa: 'ذخیره پروفایل', es: 'Guardar', pt: 'Guardar', fr: 'Enregistrer', de: 'Speichern', ar: 'حفظ' },
    listeningForFace: { en: 'Scanning for your face...', fa: 'در حال یافتن صورت...', es: 'Buscando tu rostro...', pt: 'À procura do teu rosto...', fr: 'Recherche de ton visage...', de: 'Suche dein Gesicht...', ar: 'جارٍ البحث عن وجهك...' },
    faceCaptured: { en: 'Face captured', fa: 'صورت ثبت شد', es: 'Rostro capturado', pt: 'Rosto capturado', fr: 'Visage capturé', de: 'Gesicht erfasst', ar: 'تم التقاط الوجه' },
    recording: { en: 'Recording...', fa: 'در حال ضبط...', es: 'Grabando...', pt: 'A gravar...', fr: 'Enregistrement...', de: 'Aufnahme...', ar: 'جارٍ التسجيل...' },
    noFace: { en: 'No face detected. Get in good light and face the camera.', fa: 'چهره‌ای یافت نشد. رو به دوربین و در نور کافی باشید.', es: 'No se detectó tu rostro. Busca buena luz.', pt: 'Rosto não detetado. Tenta com melhor luz.', fr: 'Visage non détecté. Mieux éclairé, face à la caméra.', de: 'Kein Gesicht erkannt. Heller und zur Kamera schauen.', ar: 'لم يُرصد وجه. واجه الكاميرا بإضاءة جيدة.' },
    noVoice: { en: 'Could not hear you. Speak clearly and close to the mic.', fa: 'صدایتان شنیده نشد. واضح و نزدیک میکروفون صحبت کنید.', es: 'No te oí. Habla cerca del micrófono.', pt: 'Não te ouvi. Fala perto do microfone.', fr: 'Je ne t’entends pas. Parle près du micro.', de: 'Nicht gehört. Sprich nah am Mikrofon.', ar: 'لم أسمعك. تحدث بوضوح قرب الميكروفون.' },
    notSignedInFace: { en: 'Face did not match any profile.', fa: 'صورت با هیچ پروفایلی مطابقت نداشت.', es: 'El rostro no coincide.', pt: 'O rosto não coincide.', fr: 'Visage non reconnu.', de: 'Gesicht nicht erkannt.', ar: 'الوجه غير مطابق.' },
    notSignedInVoice: { en: 'Voice did not match any profile.', fa: 'صدا با هیچ پروفایلی مطابقت نداشت.', es: 'La voz no coincide.', pt: 'A voz não coincide.', fr: 'Voix non reconnue.', de: 'Stimme nicht erkannt.', ar: 'الصوت غير مطابق.' },
    signedIn: { en: 'Welcome back, {n}!', fa: 'خوش برگشتید، {n}!', es: '¡Hola de nuevo, {n}!', pt: 'Bem-vindo de volta, {n}!', fr: 'Bon retour, {n} !', de: 'Willkommen zurück, {n}!', ar: 'مرحباً بعودتك، {n}!' },
    camError: { en: 'Camera unavailable - check permissions and that a camera exists.', fa: 'دوربین در دسترس نیست - دسترسی را بررسی کنید.', es: 'Cámara no disponible.', pt: 'Câmara indisponível.', fr: 'Caméra indisponible.', de: 'Kamera nicht verfügbar.', ar: 'الكاميرا غير متاحة.' },
    micError: { en: 'Microphone unavailable - check permissions.', fa: 'میکروفون در دسترس نیست - دسترسی را بررسی کنید.', es: 'Micrófono no disponible.', pt: 'Microfone indisponível.', fr: 'Micro indisponible.', de: 'Mikrofon nicht verfügbar.', ar: 'الميكروفون غير متاح.' },
    voiceUnsupported: { en: 'This browser has no speech recognition (voice commands need Chrome or Edge).', fa: 'مرورگر شما تشخیص صدا ندارد (فرمان‌های صوتی به کروم یا اج نیاز دارند).', es: 'Este navegador no soporta reconocimiento de voz.', pt: 'Este navegador não suporta reconhecimento de voz.', fr: 'Navigateur sans reconnaissance vocale.', de: 'Dieser Browser kann keine Sprache erkennen.', ar: 'المتصفح لا يدعم التعرف على الصوت.' },
    faceApiFailed: { en: 'Could not load the face engine from the CDN. This network is blocking it - try another network.', fa: 'موتور تشخیص چهره بارگذاری نشد. این شبکه آن را مسدود کرده است.', es: 'No se pudo cargar el motor facial.', pt: 'Não foi possível carregar o motor facial.', fr: 'Moteur facial indisponible.', de: 'Gesichts-Engine konnte nicht geladen werden.', ar: 'تعذر تحميل محرك الوجه.' },
    vcmdOn: { en: 'Voice commands are ON. Try: open studio, go home, open analytics, stop listening.', fa: 'فرمان‌های صوتی روشن است. بگویید: استودیو را باز کن، برو خانه.', es: 'Comandos de voz activados.', pt: 'Comandos de voz ligados.', fr: 'Commandes vocales activées.', de: 'Sprachbefehle aktiv.', ar: 'الأوامر الصوتية مفعّلة.' },
    vcmdOff: { en: 'Voice commands are off.', fa: 'فرمان‌های صوتی خاموش است.', es: 'Comandos de voz desactivados.', pt: 'Comandos de voz desligados.', fr: 'Commandes vocales désactivées.', de: 'Sprachbefehle aus.', ar: 'الأوامر الصوتية متوقفة.' },
    vcmdToggle: { en: 'Voice commands', fa: 'فرمان‌های صوتی', es: 'Comandos de voz', pt: 'Comandos de voz', fr: 'Commandes vocales', de: 'Sprachbefehle', ar: 'الأوامر الصوتية' },
    noProfiles: { en: 'No face & voice profiles on this device yet.', fa: 'هنوز پروفایلی ثبت نشده.', es: 'Aún no hay perfiles.', pt: 'Ainda não há perfis.', fr: 'Aucun profil encore.', de: 'Noch keine Profile.', ar: 'لا توجد ملفات بعد.' },
    priv: { en: 'Your face and voice never leave this device - nothing is uploaded.', fa: 'صورت و صدای شما هرگز از این دستگاه خارج نمی‌شود.', es: 'Tu rostro y tu voz nunca salen de este dispositivo.', pt: 'O teu rosto e a tua voz nunca saem deste aparelho.', fr: 'Ton visage et ta voix ne quittent jamais cet appareil.', de: 'Dein Gesicht und deine Stimme verlassen dieses Gerät nie.', ar: 'وجهك وصوتك لا يغادران جهازك أبداً.' },
    err: { en: 'Something went wrong: ', fa: 'خطا: ', es: 'Algo falló: ', pt: 'Algo correu mal: ', fr: 'Une erreur est survenue: ', de: 'Etwas ist schiefgelaufen: ', ar: 'حدث خطأ: ' },
    close: { en: 'Close', fa: 'بستن', es: 'Cerrar', pt: 'Fechar', fr: 'Fermer', de: 'Schließen', ar: 'إغلاق' },
    cancel: { en: 'Cancel', fa: 'انصراف', es: 'Cancelar', pt: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', ar: 'إلغاء' },
    delete: { en: 'Delete', fa: 'حذف', es: 'Eliminar', pt: 'Apagar', fr: 'Supprimer', de: 'Löschen', ar: 'حذف' },
    signOut: { en: 'Sign out', fa: 'خروج', es: 'Salir', pt: 'Sair', fr: 'Déconnexion', de: 'Abmelden', ar: 'تسجيل الخروج' },
    busy: { en: 'Working...', fa: 'در حال انجام...', es: 'Trabajando...', pt: 'A trabalhar...', fr: 'En cours...', de: 'Arbeite...', ar: 'جارٍ العمل...' },
    giveMicForFace: { en: 'Face captured. Now allow the microphone.', fa: 'صورت ثبت شد. حالا اجازه میکروفون را بدهید.', es: 'Rostro capturado. Permite el micrófono.', pt: 'Rosto capturado. Autoriza o microfone.', fr: 'Visage capturé. Autorise le micro.', de: 'Gesicht erfasst. Mikrofon erlauben.', ar: 'تم التقاط الوجه. اسمح بالميكروفون.' },
    listenReady: { en: 'Listening for commands...', fa: 'در حال گوش دادن...', es: 'Escuchando...', pt: 'A ouvir...', fr: 'À l’écoute...', de: 'Höre zu...', ar: 'جارٍ الاستماع...' },
    cmdGo: { en: 'Taking you to {p}...', fa: 'در حال رفتن به {p}...', es: 'Yendo a {p}...', pt: 'A ir para {p}...', fr: 'Direction {p}...', de: 'Gehe zu {p}...', ar: 'جاري الانتقال إلى {p}...' },
    cmdLang: { en: 'Switching to {l}...', fa: 'تغییر به {l}...', es: 'Cambiando a {l}...', pt: 'A mudar para {l}...', fr: 'Passage en {l}...', de: 'Wechsle zu {l}...', ar: 'التبديل إلى {l}...' },
    cmdFxOn: { en: 'Applied the {f} effect.', fa: 'افکت {f} اعمال شد.', es: 'Efecto {f} aplicado.', pt: 'Efeito {f} aplicado.', fr: 'Effet {f} appliqué.', de: 'Effekt {f} angewendet.', ar: 'تم تطبيق تأثير {f}.' },
    cmdFxNo: { en: 'Opened Effects, but {f} is not on screen — pick a clip first.', fa: 'پنل افکت باز شد، اما {f} دیده نمی‌شود — اول یک کلیپ را انتخاب کنید.', es: 'Abrí Efectos, pero {f} no aparece — elige un clip primero.', pt: 'Abri Efeitos, mas {f} não aparece — escolhe um clipe primeiro.', fr: 'Effets ouvert, mais {f} n’apparaît pas — choisis un clip d’abord.', de: 'Effekte geöffnet, aber {f} ist nicht sichtbar — wähle zuerst einen Clip.', ar: 'تم فتح التأثيرات، لكن {f} غير ظاهر — اختر مقطعًا أولًا.' },
    cmdUnknown: { en: 'Command not recognized. Try: open studio, go home, help.', fa: 'فرمان شناسایی نشد. بگویید: استودیو را باز کن، برو خانه، کمک.', es: 'Comando no reconocido.', pt: 'Comando não reconhecido.', fr: 'Commande inconnue.', de: 'Befehl unbekannt.', ar: 'أمر غير معروف.' },
    speechLang: { en: 'Commands are matched in all 20 languages the picker offers; anything unlisted falls back to English.', fa: 'فرمان‌ها در هر ۲۰ زبان شناسایی می‌شوند.', es: 'Los comandos se reconocen en los 20 idiomas.', pt: 'Os comandos são reconhecidos nas 20 línguas.', fr: 'Les commandes sont reconnues dans les 20 langues.', de: 'Befehle werden in allen 20 Sprachen erkannt.', ar: 'تُفهم الأوامر بجميع اللغات العشرين.' },
    micListening: { en: 'Mic listening', fa: 'میکروفون فعال', es: 'Micrófono activo', pt: 'Microfone ativo', fr: 'Micro actif', de: 'Mikrofon aktiv', ar: 'الميكروفون يعمل' }
  };

  /* Language -> BCP-47 tag for speech recognition and synthesis. */
  var BCP47 = {
    en: 'en-US', zh: 'zh-CN', hi: 'hi-IN', es: 'es-ES', ar: 'ar-SA', fr: 'fr-FR',
    bn: 'bn-IN', pt: 'pt-PT', ru: 'ru-RU', ur: 'ur-PK', id: 'id-ID', de: 'de-DE',
    ja: 'ja-JP', tr: 'tr-TR', ko: 'ko-KR', fa: 'fa-IR', uk: 'uk-UA', it: 'it-IT',
    pl: 'pl-PL', vi: 'vi-VN'
  };

  /* ------------------------------------------------------------------
   * Voice-command vocabulary. Each page lists phrases per language; the
   * transcript is matched loosely (any phrase appearing inside the words).
   * ------------------------------------------------------------------ */
  var NAV = [
    { url: 'studio-ai.html', say: {
      en: ['studio ai', 'ai studio', 'creator studio'],
      zh: ['智能工作室', '人工智能工作室'],
      hi: ['स्टूडियो एआई'],
      es: ['estudio ia'],
      ar: ['استوديو الذكاء'],
      fr: ['studio ia'],
      bn: ['স্টুডিও এআই'],
      pt: ['estúdio ia'],
      ru: ['студия ии'],
      ur: ['اسٹوڈیو اے آئی'],
      id: ['studio ai'],
      de: ['ki studio'],
      ja: ['スタジオエーアイ'],
      tr: ['stüdyo yapay zeka'],
      ko: ['스튜디오 인공지능'],
      fa: ['استودیو هوش مصنوعی'],
      uk: ['студія штучного інтелекту'],
      it: ['studio ia'],
      pl: ['studio ai'],
      vi: ['xưởng ai']
    } },
    { url: 'index.html', say: {
      en: ['home', 'main page', 'homepage', 'go home', 'front page', 'start page', 'take me home'],
      zh: ['首页', '主页', '回到首页'],
      hi: ['होम', 'मुख्य पृष्ठ', 'होम पेज'],
      es: ['inicio', 'página principal', 'portada'],
      ar: ['الرئيسية', 'الصفحة الرئيسية'],
      fr: ['accueil', 'page principale', 'page d accueil'],
      bn: ['হোম', 'প্রধান পাতা'],
      pt: ['início', 'página inicial', 'principal'],
      ru: ['главная', 'домой', 'главная страница'],
      ur: ['ہوم', 'مرکزی صفحہ'],
      id: ['beranda', 'halaman utama'],
      de: ['startseite', 'hauptseite', 'start'],
      ja: ['ホーム', 'ホームページ', 'トップページ'],
      tr: ['ana sayfa', 'anasayfa'],
      ko: ['홈', '홈페이지', '메인'],
      fa: ['خانه', 'صفحه اصلی', 'برو خانه'],
      uk: ['головна', 'домівка', 'головна сторінка'],
      it: ['home', 'pagina principale', 'inizio'],
      pl: ['strona główna', 'główna'],
      vi: ['trang chủ', 'trang chính']
    } },
    { url: 'app.html', say: {
      en: ['studio', 'open studio', 'the studio', 'workspace', 'open the studio'],
      zh: ['工作室', '打开工作室'],
      hi: ['स्टूडियो'],
      es: ['estudio', 'abrir estudio'],
      ar: ['استوديو', 'الاستوديو'],
      fr: ['studio', 'ouvre le studio'],
      bn: ['স্টুডিও'],
      pt: ['estúdio', 'abrir estúdio'],
      ru: ['студия', 'открой студию'],
      ur: ['اسٹوڈیو'],
      id: ['studio', 'buka studio'],
      de: ['studio', 'arbeitsbereich'],
      ja: ['スタジオ'],
      tr: ['stüdyo'],
      ko: ['스튜디오'],
      fa: ['استودیو', 'استودیو را باز کن'],
      uk: ['студія', 'відкрий студію'],
      it: ['studio', 'apri lo studio'],
      pl: ['studio', 'otwórz studio'],
      vi: ['xưởng', 'studio']
    } },
    { url: 'analytics.html', say: {
      en: ['analytics', 'stats', 'statistics', 'my stats', 'insights', 'numbers'],
      zh: ['分析', '数据分析', '统计'],
      hi: ['विश्लेषण', 'आँकड़े'],
      es: ['analíticas', 'analítica', 'estadísticas'],
      ar: ['التحليلات', 'الإحصائيات'],
      fr: ['analytique', 'analyses', 'statistiques'],
      bn: ['বিশ্লেষণ', 'পরিসংখ্যান'],
      pt: ['análises', 'analítica', 'estatísticas'],
      ru: ['аналитика', 'статистика'],
      ur: ['تجزیات', 'اعداد و شمار'],
      id: ['analitik', 'statistik'],
      de: ['analysen', 'analyse', 'statistiken'],
      ja: ['分析', 'アナリティクス', '統計'],
      tr: ['analitik', 'istatistikler'],
      ko: ['분석', '통계'],
      fa: ['تحلیل', 'آمار'],
      uk: ['аналітика', 'статистика'],
      it: ['analisi', 'statistiche'],
      pl: ['analityka', 'statystyki'],
      vi: ['phân tích', 'thống kê']
    } },
    { url: 'trends.html', say: {
      en: ['trend spotter', 'trends', 'trend radar', 'trending', 'what is trending'],
      zh: ['趋势', '热门趋势'],
      hi: ['ट्रेंड', 'रुझान'],
      es: ['tendencias', 'tendencia'],
      ar: ['الاتجاهات', 'الرائج'],
      fr: ['tendances', 'tendance'],
      bn: ['ট্রেন্ড', 'প্রবণতা'],
      pt: ['tendências', 'tendência'],
      ru: ['тренды', 'тенденции'],
      ur: ['رجحانات', 'ٹرینڈ'],
      id: ['tren', 'tren populer'],
      de: ['trends', 'trend'],
      ja: ['トレンド', '流行'],
      tr: ['trendler', 'akımlar'],
      ko: ['트렌드', '인기'],
      fa: ['ترند', 'روندها'],
      uk: ['тренди', 'тенденції'],
      it: ['tendenze', 'trend'],
      pl: ['trendy'],
      vi: ['xu hướng']
    } },
    { url: 'editor.html', say: {
      en: ['editor', 'video editor', 'open the editor', 'timeline', 'edit my video'],
      zh: ['编辑器', '视频编辑'],
      hi: ['एडिटर', 'संपादक'],
      es: ['editor', 'editor de video'],
      ar: ['المحرر', 'محرر الفيديو'],
      fr: ['éditeur', 'montage'],
      bn: ['এডিটর', 'সম্পাদক'],
      pt: ['editor', 'editor de vídeo'],
      ru: ['редактор', 'видеоредактор'],
      ur: ['ایڈیٹر', 'مدیر'],
      id: ['editor', 'penyunting'],
      de: ['editor', 'videoeditor'],
      ja: ['エディタ', '編集'],
      tr: ['editör', 'düzenleyici'],
      ko: ['편집기', '에디터'],
      fa: ['ویرایشگر', 'ادیتور'],
      uk: ['редактор', 'відеоредактор'],
      it: ['editor', 'montaggio'],
      pl: ['edytor'],
      vi: ['trình sửa', 'biên tập']
    } },
    { url: 'typing.html', say: {
      en: ['typing race', 'type master', 'typing test', 'typing'],
      zh: ['打字', '打字比赛'],
      hi: ['टाइपिंग'],
      es: ['mecanografía'],
      ar: ['سباق الكتابة', 'الكتابة'],
      fr: ['dactylographie', 'frappe'],
      bn: ['টাইপিং'],
      pt: ['digitação', 'datilografia'],
      ru: ['набор текста', 'печать'],
      ur: ['ٹائپنگ'],
      id: ['mengetik'],
      de: ['tippen', 'schreibtrainer'],
      ja: ['タイピング'],
      tr: ['klavye', 'yazma'],
      ko: ['타자', '타이핑'],
      fa: ['تایپ', 'مسابقه تایپ'],
      uk: ['набір тексту', 'друк'],
      it: ['digitazione', 'dattilografia'],
      pl: ['pisanie', 'maszynopisanie'],
      vi: ['gõ phím', 'đánh máy']
    } },
    { url: 'flap.html', say: {
      en: ['nova flap', 'flappy', 'flap'],
      zh: ['飞翔小鸟', '小鸟'],
      hi: ['फ्लैप'],
      es: ['aleteo'],
      ar: ['فلاب'],
      fr: ['flap'],
      bn: ['ফ্ল্যাপ'],
      pt: ['flap'],
      ru: ['флап'],
      ur: ['فلیپ'],
      id: ['flap'],
      de: ['flap'],
      ja: ['フラップ'],
      tr: ['flap'],
      ko: ['플랩'],
      fa: ['فلپ'],
      uk: ['флап'],
      it: ['flap'],
      pl: ['flap'],
      vi: ['flap']
    } },
    { url: 'game.html', say: {
      en: ['games', 'game hub', 'play a game', 'arcade', 'game'],
      zh: ['游戏', '玩游戏'],
      hi: ['गेम', 'खेल'],
      es: ['juegos', 'jugar'],
      ar: ['الألعاب', 'ألعاب'],
      fr: ['jeux', 'jouer'],
      bn: ['গেম', 'খেলা'],
      pt: ['jogos', 'jogar'],
      ru: ['игры', 'играть'],
      ur: ['کھیل', 'گیمز'],
      id: ['permainan', 'game'],
      de: ['spiele', 'spielen'],
      ja: ['ゲーム', '遊ぶ'],
      tr: ['oyunlar', 'oyun'],
      ko: ['게임', '게임하기'],
      fa: ['بازی', 'بازی ها'],
      uk: ['ігри', 'грати'],
      it: ['giochi', 'giocare'],
      pl: ['gry', 'graj'],
      vi: ['trò chơi', 'chơi game']
    } },
    { url: 'ai.html', say: {
      en: ['nova clip ai', 'ask the ai', 'assistant', 'chat', 'artificial intelligence'],
      zh: ['人工智能', '助手', '聊天'],
      hi: ['एआई', 'सहायक'],
      es: ['la ia', 'asistente', 'inteligencia artificial'],
      ar: ['الذكاء الاصطناعي', 'المساعد الذكي'],
      fr: ['assistant', 'intelligence artificielle'],
      bn: ['এআই', 'সহকারী'],
      pt: ['a ia', 'assistente', 'inteligência artificial'],
      ru: ['искусственный интеллект', 'помощник'],
      ur: ['اے آئی', 'معاون'],
      id: ['asisten', 'kecerdasan buatan'],
      de: ['künstliche intelligenz', 'ki assistent', 'assistent'],
      ja: ['エーアイ', 'アシスタント'],
      tr: ['yapay zeka', 'asistan'],
      ko: ['인공지능', '어시스턴트'],
      fa: ['هوش مصنوعی', 'دستیار'],
      uk: ['штучний інтелект', 'помічник'],
      it: ['assistente', 'intelligenza artificiale'],
      pl: ['sztuczna inteligencja', 'asystent'],
      vi: ['trí tuệ nhân tạo', 'trợ lý']
    } },
    { url: 'progress.html', say: {
      en: ['progress', 'my progress', 'rewards', 'achievements', 'certificates', 'my points'],
      zh: ['进度', '成就', '奖励'],
      hi: ['प्रगति', 'उपलब्धियाँ'],
      es: ['progreso', 'logros', 'recompensas'],
      ar: ['التقدم', 'الإنجازات'],
      fr: ['progression', 'récompenses', 'succès'],
      bn: ['অগ্রগতি', 'অর্জন'],
      pt: ['progresso', 'conquistas', 'recompensas'],
      ru: ['прогресс', 'достижения', 'награды'],
      ur: ['پیش رفت', 'کامیابیاں'],
      id: ['kemajuan', 'pencapaian'],
      de: ['fortschritt', 'erfolge', 'belohnungen'],
      ja: ['進捗', '実績', '報酬'],
      tr: ['ilerleme', 'başarılar', 'ödüller'],
      ko: ['진행', '업적', '보상'],
      fa: ['پیشرفت', 'دستاوردها'],
      uk: ['прогрес', 'досягнення'],
      it: ['progressi', 'obiettivi', 'ricompense'],
      pl: ['postęp', 'osiągnięcia', 'nagrody'],
      vi: ['tiến độ', 'thành tích']
    } },
    { url: 'pricing.html', say: {
      en: ['pricing', 'upgrade', 'pro plan', 'plans', 'subscribe', 'prices'],
      zh: ['价格', '升级', '套餐'],
      hi: ['मूल्य', 'अपग्रेड'],
      es: ['precios', 'premium', 'planes'],
      ar: ['الأسعار', 'الترقية', 'الخطط'],
      fr: ['tarifs', 'premium', 'abonnement'],
      bn: ['মূল্য', 'আপগ্রেড'],
      pt: ['preços', 'premium', 'planos'],
      ru: ['цены', 'тарифы', 'подписка'],
      ur: ['قیمتیں', 'اپ گریڈ'],
      id: ['harga', 'langganan', 'paket'],
      de: ['preise', 'premium', 'tarife'],
      ja: ['料金', 'プラン', 'アップグレード'],
      tr: ['fiyatlar', 'planlar', 'yükselt'],
      ko: ['요금제', '업그레이드'],
      fa: ['قیمت', 'ارتقا', 'حق عضویت'],
      uk: ['ціни', 'тарифи', 'підписка'],
      it: ['prezzi', 'piani', 'abbonamento'],
      pl: ['cennik', 'plany', 'subskrypcja'],
      vi: ['giá', 'gói', 'nâng cấp']
    } },
    { url: 'tools.html', say: {
      en: ['tools', 'toolbox', 'utilities', 'tool'],
      zh: ['工具', '工具箱'],
      hi: ['उपकरण', 'टूल'],
      es: ['herramientas'],
      ar: ['الأدوات'],
      fr: ['outils'],
      bn: ['টুল', 'সরঞ্জাম'],
      pt: ['ferramentas'],
      ru: ['инструменты'],
      ur: ['اوزار', 'ٹولز'],
      id: ['alat', 'perkakas'],
      de: ['werkzeuge', 'tools'],
      ja: ['ツール', '道具'],
      tr: ['araçlar'],
      ko: ['도구', '툴'],
      fa: ['ابزار', 'ابزارها'],
      uk: ['інструменти'],
      it: ['strumenti'],
      pl: ['narzędzia'],
      vi: ['công cụ']
    } },
    { url: 'community.html', say: {
      en: ['community', 'friends', 'groups', 'comments'],
      zh: ['社区', '好友'],
      hi: ['समुदाय', 'दोस्त'],
      es: ['comunidad', 'amigos'],
      ar: ['المجتمع', 'الأصدقاء'],
      fr: ['communauté', 'amis'],
      bn: ['কমিউনিটি', 'বন্ধুরা'],
      pt: ['comunidade', 'amigos'],
      ru: ['сообщество', 'друзья'],
      ur: ['کمیونٹی', 'دوست'],
      id: ['komunitas', 'teman'],
      de: ['gemeinschaft', 'freunde', 'community'],
      ja: ['コミュニティ', '友達'],
      tr: ['topluluk', 'arkadaşlar'],
      ko: ['커뮤니티', '친구'],
      fa: ['انجمن', 'دوستان'],
      uk: ['спільнота', 'друзі'],
      it: ['comunità', 'amici'],
      pl: ['społeczność', 'znajomi'],
      vi: ['cộng đồng', 'bạn bè']
    } },
    { url: 'socials.html', say: {
      en: ['socials', 'social media', 'share'],
      zh: ['社交', '分享'],
      hi: ['सोशल', 'साझा'],
      es: ['redes sociales', 'compartir'],
      ar: ['التواصل الاجتماعي', 'مشاركة'],
      fr: ['réseaux sociaux', 'partager'],
      bn: ['সোশ্যাল', 'শেয়ার'],
      pt: ['redes sociais', 'partilhar'],
      ru: ['соцсети', 'поделиться'],
      ur: ['سوشل', 'شیئر'],
      id: ['sosial', 'bagikan'],
      de: ['soziale netzwerke', 'teilen'],
      ja: ['ソーシャル', '共有'],
      tr: ['sosyal', 'paylaş'],
      ko: ['소셜', '공유'],
      fa: ['شبکه های اجتماعی', 'اشتراک گذاری'],
      uk: ['соцмережі', 'поділитися'],
      it: ['social', 'condividi'],
      pl: ['społecznościowe', 'udostępnij'],
      vi: ['mạng xã hội', 'chia sẻ']
    } },
    { url: 'coder.html', say: {
      en: ['coder', 'code lab', 'write code', 'programming'],
      zh: ['编程', '代码'],
      hi: ['कोडर', 'प्रोग्रामिंग'],
      es: ['programar', 'código'],
      ar: ['البرمجة', 'الكود'],
      fr: ['coder', 'programmation'],
      bn: ['কোডার', 'প্রোগ্রামিং'],
      pt: ['programar', 'código'],
      ru: ['код', 'программирование'],
      ur: ['کوڈر', 'پروگرامنگ'],
      id: ['koding', 'pemrograman'],
      de: ['codieren', 'programmieren'],
      ja: ['コーダー', 'プログラミング'],
      tr: ['kodlama', 'programlama'],
      ko: ['코더', '프로그래밍'],
      fa: ['برنامه نویسی', 'کد'],
      uk: ['код', 'програмування'],
      it: ['programmare', 'codice'],
      pl: ['kodowanie', 'programowanie'],
      vi: ['lập trình', 'mã']
    } },
    { url: 'novalife.html', say: {
      en: ['nova life', 'virtual life', 'my life', 'life'],
      zh: ['生活', '虚拟生活'],
      hi: ['नोवा लाइफ', 'जीवन'],
      es: ['vida', 'nova life'],
      ar: ['الحياة', 'نوفا لايف'],
      fr: ['vie', 'nova life'],
      bn: ['জীবন', 'নোভা লাইফ'],
      pt: ['vida', 'nova life'],
      ru: ['жизнь', 'нова лайф'],
      ur: ['زندگی', 'نووا لائف'],
      id: ['kehidupan', 'nova life'],
      de: ['leben', 'nova life'],
      ja: ['ライフ', '生活'],
      tr: ['yaşam', 'hayat'],
      ko: ['라이프', '생활'],
      fa: ['زندگی', 'نوا لایف'],
      uk: ['життя', 'нова лайф'],
      it: ['vita', 'nova life'],
      pl: ['życie', 'nova life'],
      vi: ['cuộc sống', 'nova life']
    } },
    { url: 'publish.html', say: {
      en: ['publish', 'upload', 'post video', 'schedule a post'],
      zh: ['发布', '上传'],
      hi: ['प्रकाशित', 'अपलोड'],
      es: ['publicar', 'subir'],
      ar: ['نشر', 'رفع'],
      fr: ['publier', 'téléverser'],
      bn: ['প্রকাশ', 'আপলোড'],
      pt: ['publicar', 'carregar'],
      ru: ['опубликовать', 'загрузить'],
      ur: ['شائع', 'اپ لوڈ'],
      id: ['terbitkan', 'unggah'],
      de: ['veröffentlichen', 'hochladen'],
      ja: ['公開', 'アップロード'],
      tr: ['yayınla', 'yükle'],
      ko: ['게시', '업로드'],
      fa: ['انتشار', 'آپلود'],
      uk: ['опублікувати', 'завантажити'],
      it: ['pubblica', 'carica'],
      pl: ['opublikuj', 'prześlij'],
      vi: ['đăng bài', 'tải lên']
    } },
    { url: 'gift.html', say: {
      en: ['nova gift', 'gifts', 'send a gift', 'gift'],
      zh: ['礼物', '送礼'],
      hi: ['उपहार', 'गिफ्ट'],
      es: ['regalo', 'regalos'],
      ar: ['هدية', 'هدايا'],
      fr: ['cadeau', 'cadeaux'],
      bn: ['উপহার'],
      pt: ['presente', 'presentes'],
      ru: ['подарок', 'подарки'],
      ur: ['تحفہ', 'تحائف'],
      id: ['hadiah'],
      de: ['geschenk', 'geschenke'],
      ja: ['ギフト', '贈り物'],
      tr: ['hediye', 'hediyeler'],
      ko: ['선물'],
      fa: ['هدیه', 'کادو'],
      uk: ['подарунок', 'подарунки'],
      it: ['regalo', 'regali'],
      pl: ['prezent', 'prezenty'],
      vi: ['quà', 'quà tặng']
    } },
    { url: 'parent.html', say: {
      en: ['parents', 'parent zone', 'family', 'parental controls'],
      zh: ['家长', '家庭'],
      hi: ['माता पिता', 'परिवार'],
      es: ['padres', 'familia', 'control parental'],
      ar: ['الآباء', 'العائلة'],
      fr: ['parents', 'famille', 'contrôle parental'],
      bn: ['অভিভাবক', 'পরিবার'],
      pt: ['pais', 'família', 'controlo parental'],
      ru: ['родители', 'семья'],
      ur: ['والدین', 'خاندان'],
      id: ['orang tua', 'keluarga'],
      de: ['eltern', 'familie', 'kindersicherung'],
      ja: ['保護者', '家族'],
      tr: ['ebeveyn', 'aile'],
      ko: ['부모', '가족'],
      fa: ['والدین', 'خانواده'],
      uk: ['батьки', 'родина'],
      it: ['genitori', 'famiglia'],
      pl: ['rodzice', 'rodzina'],
      vi: ['phụ huynh', 'gia đình']
    } },
    { url: 'pro.html', say: {
      en: ['nova clip pro', 'go pro', 'pro'],
      zh: ['专业版', '会员'],
      hi: ['प्रो'],
      es: ['pro'],
      ar: ['برو'],
      fr: ['pro'],
      bn: ['প্রো'],
      pt: ['pro'],
      ru: ['про'],
      ur: ['پرو'],
      id: ['pro'],
      de: ['pro'],
      ja: ['プロ'],
      tr: ['pro'],
      ko: ['프로'],
      fa: ['حرفه ای', 'پرو'],
      uk: ['про'],
      it: ['pro'],
      pl: ['pro'],
      vi: ['pro']
    } }
  ];

  var SAY_SIGNIN = {
    en: ['sign in', 'log in', 'sign me in', 'log me in', 'login', 'authenticate'],
    zh: ['登录', '登陆'],
    hi: ['साइन इन', 'लॉग इन'],
    es: ['iniciar sesión', 'inicia sesión', 'entrar', 'conectar'],
    ar: ['تسجيل الدخول', 'دخول'],
    fr: ['connecte moi', 'se connecter'],
    bn: ['সাইন ইন', 'লগ ইন'],
    pt: ['iniciar sessão', 'inicia sessão', 'entrar'],
    ru: ['войти', 'вход'],
    ur: ['سائن ان', 'لاگ ان'],
    id: ['masuk', 'login'],
    de: ['anmelden', 'einloggen', 'melde mich an'],
    ja: ['ログイン', 'サインイン'],
    tr: ['giriş yap', 'oturum aç', 'giriş'],
    ko: ['로그인'],
    fa: ['ورود', 'وارد شو'],
    uk: ['увійти', 'вхід'],
    it: ['accedi', 'entra'],
    pl: ['zaloguj', 'logowanie'],
    vi: ['đăng nhập']
  };
  var SAY_SIGNOUT = {
    en: ['sign out', 'log out', 'logout', 'sign me out'],
    zh: ['退出', '登出'],
    hi: ['साइन आउट', 'लॉग आउट'],
    es: ['cerrar sesión', 'salir'],
    ar: ['تسجيل الخروج', 'خروج'],
    fr: ['deconnexion', 'se déconnecter'],
    bn: ['সাইন আউট', 'লগ আউট'],
    pt: ['terminar sessão', 'sair'],
    ru: ['выйти', 'выход'],
    ur: ['سائن آؤٹ', 'لاگ آؤٹ'],
    id: ['keluar', 'logout'],
    de: ['abmelden', 'ausloggen'],
    ja: ['ログアウト', 'サインアウト'],
    tr: ['çıkış yap', 'oturumu kapat'],
    ko: ['로그아웃'],
    fa: ['خروج', 'خارج شو'],
    uk: ['вийти', 'вихід'],
    it: ['esci', 'disconnetti'],
    pl: ['wyloguj'],
    vi: ['đăng xuất']
  };
  var SAY_STOP = {
    en: ['stop listening', 'go to sleep', 'stop the mic', 'be quiet', 'mute the mic'],
    zh: ['停止聆听', '别听了'],
    hi: ['सुनना बंद करो'],
    es: ['deja de escuchar', 'silencio'],
    ar: ['توقف عن الاستماع', 'توقف'],
    fr: ['arrête d écouter', 'arrête'],
    bn: ['শোনা বন্ধ করো'],
    pt: ['para de ouvir', 'silêncio'],
    ru: ['прекрати слушать', 'стоп'],
    ur: ['سننا بند کرو'],
    id: ['berhenti mendengar', 'diam'],
    de: ['hör auf zu hören', 'schlafen'],
    ja: ['聞くのをやめて'],
    tr: ['dinlemeyi bırak', 'sus'],
    ko: ['그만 들어'],
    fa: ['گوش نده', 'خاموش'],
    uk: ['припини слухати', 'стоп'],
    it: ['smetti di ascoltare', 'silenzio'],
    pl: ['przestań słuchać', 'cisza'],
    vi: ['ngừng nghe', 'im lặng']
  };
  var SAY_HELP = {
    en: ['what can i say', 'list commands', 'commands', 'help'],
    zh: ['帮助', '我能说什么'],
    hi: ['मदद', 'सहायता'],
    es: ['ayuda', 'qué puedo decir'],
    ar: ['مساعدة', 'ماذا أقول'],
    fr: ['aide', 'que puis je dire'],
    bn: ['সাহায্য'],
    pt: ['ajuda', 'o que posso dizer'],
    ru: ['помощь', 'что сказать'],
    ur: ['مدد'],
    id: ['bantuan', 'apa yang bisa saya katakan'],
    de: ['hilfe', 'was kann ich sagen'],
    ja: ['ヘルプ', '何が言える'],
    tr: ['yardım', 'ne diyebilirim'],
    ko: ['도움말'],
    fa: ['کمک', 'چه بگویم'],
    uk: ['допомога', 'що сказати'],
    it: ['aiuto', 'cosa posso dire'],
    pl: ['pomoc', 'co mogę powiedzieć'],
    vi: ['trợ giúp', 'tôi có thể nói gì']
  };

  function sayList(item) {
    var L = langCode();
    return (item.say && (item.say[L] || item.say.en)) || item.say || [];
  }

  /* ------------------------------------------------------------------
   * Clean a transcript into lower-case letters/spaces only. A hand-rolled
   * loop (instead of regex \p classes) keeps Persian, Arabic, accents and
   * CJK intact across every browser.
   * ------------------------------------------------------------------ */
  function clean(t) {
    var out = '', c, i;
    for (i = 0; i < t.length; i++) {
      c = t.charCodeAt(i);
      if (c === 32 || (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
          (c >= 0x00C0 && c <= 0x02AF) || (c >= 0x0370 && c <= 0x04FF) ||
          (c >= 0x0600 && c <= 0x06FF) || (c >= 0x0900 && c <= 0x0DFF) ||
          (c >= 0x0E00 && c <= 0x0EFF) || (c >= 0x3040 && c <= 0x30FF) ||
          (c >= 0x2E80 && c <= 0x9FFF) || (c >= 0xAC00 && c <= 0xD7AF)) {
        out += t.charAt(i);
      }
    }
    var words = out.split(' '), f = [];
    for (i = 0; i < words.length; i++) if (words[i]) f.push(words[i]);
    return f.join(' ').toLowerCase();
  }
  function hasPhrase(text, list) {
    var i, p;
    for (i = 0; i < list.length; i++) {
      p = clean(list[i]);
      if (p && text.indexOf(p) !== -1) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------
   * Session + profiles
   * ------------------------------------------------------------------ */
  function profiles() { var p = store.get(PROFILES_KEY, []); return Array.isArray(p) ? p : []; }
  function saveProfiles(p) { store.set(PROFILES_KEY, p); }
  function session() { var s = store.get(SESSION_KEY, null); if (s && s.exp > Date.now()) return s; return null; }
  function signedInName() { var s = session(); return s ? s.name : ''; }
  function setSession(p) { store.set(SESSION_KEY, { name: p.name, id: p.id, at: Date.now(), exp: Date.now() + SESSION_TTL }); }
  function clearSession() { store.remove(SESSION_KEY); }

  function fire(name, detail) {
    try { document.dispatchEvent(new CustomEvent('nc:bio-' + name, { detail: detail || {} })); } catch (e) {}
  }

  /* ------------------------------------------------------------------
   * Face engine: face-api.js from a CDN with a fallback. Loaded once and
   * only when the user actually asks for a face action, so pages that never
   * use it never pay for it.
   * ------------------------------------------------------------------ */
  var faceApiReady = false, faceApiTried = false;
  var FACE_CDNS = [
    { lib: 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js', w: 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights' },
    { lib: 'https://unpkg.com/face-api.js@0.22.2/dist/face-api.min.js', w: 'https://unpkg.com/face-api.js@0.22.2/weights' }
  ];
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { s.remove(); reject(new Error('script')); };
      document.head.appendChild(s);
    });
  }
  function loadFaceApi() {
    if (faceApiReady) return Promise.resolve(true);
    if (faceApiTried) return Promise.resolve(false);
    faceApiTried = true;
    var step = Promise.reject();
    var i;
    for (i = 0; i < FACE_CDNS.length; i++) {
      (function (cdn) {
        step = step.catch(function () { return loadScript(cdn.lib); }).then(function () {
          if (!window.faceapi) return Promise.reject(new Error('lib'));
          return Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(cdn.w),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(cdn.w),
            window.faceapi.nets.faceRecognitionNet.loadFromUri(cdn.w)
          ]).then(function () { faceApiReady = true; });
        });
      })(FACE_CDNS[i]);
    }
    return step.then(function () { return true; }).catch(function () { return false; });
  }
  function detectDescriptor(video) {
    return window.faceapi.detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor()
      .then(function (res) { return res && res.descriptor ? Array.prototype.slice.call(res.descriptor) : null; });
  }
  function meanVec(list) {
    var n = list[0].length, out = new Array(n), i, j;
    for (i = 0; i < n; i++) out[i] = 0;
    for (i = 0; i < list.length; i++) for (j = 0; j < n; j++) out[j] += list[i][j] / list.length;
    return out;
  }

  /* ------------------------------------------------------------------
   * Voiceprint: log-scaled spectral shape averaged over ~2.5s.
   * ------------------------------------------------------------------ */
  function normalize(v) {
    var m = 0, i;
    for (i = 0; i < v.length; i++) m += v[i] * v[i];
    m = Math.sqrt(m) || 1;
    for (i = 0; i < v.length; i++) v[i] /= m;
    return v;
  }
  function vecFromFrame(data, bins, bands) {
    var v = new Array(bands), b, lo, hi, s, n, i;
    for (b = 0; b < bands; b++) {
      lo = Math.floor(Math.pow(b / bands, 1.6) * bins);
      hi = Math.floor(Math.pow((b + 1) / bands, 1.6) * bins);
      if (hi <= lo) hi = lo + 1;
      s = 0; n = 0;
      for (i = lo; i < hi && i < bins; i++) { s += data[i]; n++; }
      v[b] = n ? Math.sqrt(s / n / 255) : 0;
    }
    return normalize(v);
  }
  function captureVoiceprint(stream, durationMs, onTick) {
    return new Promise(function (resolve, reject) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) { reject(new Error('no audio')); return; }
      var ctx = new Ctx();
      ctx.resume().then(function () {
        var src = ctx.createMediaStreamSource(stream);
        var an = ctx.createAnalyser();
        an.fftSize = 2048;
        src.connect(an);
        var bins = an.frequencyBinCount;
        var data = new Uint8Array(bins);
        var total = new Array(24).fill(0);
        var frames = 0, start = performance.now();
        var iv = setInterval(function () {
          an.getByteFrequencyData(data);
          var v = vecFromFrame(data, bins, 24), i;
          for (i = 0; i < 24; i++) total[i] += v[i];
          frames++;
          if (onTick) onTick(Math.min(1, (performance.now() - start) / durationMs));
          if (performance.now() - start >= durationMs) {
            clearInterval(iv);
            try { src.disconnect(); an.disconnect(); } catch (e) {}
            if (ctx.close) ctx.close().catch(function () {});
            var mean = new Array(24).fill(0);
            for (i = 0; i < 24; i++) mean[i] = total[i] / Math.max(1, frames);
            resolve(normalize(mean));
          }
        }, 60);
      }).catch(function () { reject(new Error('no audio')); });
    });
  }
  function cosine(a, b) {
    var d = 0, i;
    for (i = 0; i < a.length; i++) d += a[i] * b[i];
    return d;
  }
  function euclid(a, b) {
    var d = 0, x, i;
    for (i = 0; i < a.length; i++) { x = a[i] - b[i]; d += x * x; }
    return Math.sqrt(d);
  }

  var FACE_OK = 0.55;   // Euclidean distance, smaller = closer (face-api suggests <0.6)
  var VOICE_OK = 0.86;  // cosine similarity, larger = closer

  /* ------------------------------------------------------------------
   * Media streams (created on demand, always stopped on cleanup)
   * ------------------------------------------------------------------ */
  var activeStream = null;
  function stopStream() {
    if (activeStream) {
      try { activeStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      activeStream = null;
    }
  }
  function openStream(opts) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject(new Error('no media'));
    }
    return navigator.mediaDevices.getUserMedia(opts).then(function (s) {
      stopStream();
      activeStream = s;
      return s;
    });
  }

  /* ------------------------------------------------------------------
   * Voice-command engine (Web Speech API)
   * ------------------------------------------------------------------ */
  UI.profiles = { en: 'Profiles on this device', fa: 'پروفایل های روی این دستگاه' };
  UI.signedOutDone = { en: 'Signed out', fa: 'از حساب خارج شدید' };

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, listening = false;
  var extraCommands = [];

  function addCommands(list) {
    if (Array.isArray(list)) extraCommands = extraCommands.concat(list);
  }

  /* ------------------------------------------------------------------
   * Commands that carry a value.
   * NAV matching is a plain substring test. It can tell that the words
   * "the language" were said, but not which language was asked for, so
   * these run before NAV and read the value out of the transcript
   * themselves. Each one only fires when its trigger AND its value are
   * both present, which is what keeps them from swallowing ordinary
   * navigation.
   * ------------------------------------------------------------------ */

  /* Endonym first, then English, then the exonyms people actually say
     when their own interface is in another language. */
  var LANGNAMES = {
    en: ['english','inglés','ingles','anglais','englisch','inglese','angielski','английский','انگلیسی','الإنجليزية','英語','英语','영어','अंग्रेज़ी','ingilizce','tiếng anh'],
    zh: ['中文','chinese','mandarin','chino','chinois','chinesisch','cinese','chiński','китайский','چینی','الصينية','中国語','중국어','चीनी','çince','tiếng trung'],
    hi: ['हिन्दी','hindi','hindou','hindisch','хинди','ہندی','الهندية','ヒンディー語','힌디어','hintçe','tiếng hindi'],
    es: ['español','espanol','spanish','espagnol','spanisch','spagnolo','hiszpański','испанский','اسپانیایی','الإسبانية','スペイン語','스페인어','स्पेनिश','ispanyolca','tiếng tây ban nha'],
    ar: ['العربية','arabic','árabe','arabe','arabisch','arabo','arabski','арабский','عربی','アラビア語','아랍어','अरबी','arapça','tiếng ả rập'],
    fr: ['français','francais','french','francés','französisch','francese','francuski','французский','فرانسوی','الفرنسية','フランス語','프랑스어','फ़्रेंच','fransızca','tiếng pháp'],
    bn: ['বাংলা','bengali','bangla','bengalí','bengalisch','бенгальский','بنگالی','البنغالية','ベンガル語','벵골어','बंगाली','bengalce','tiếng bengal'],
    pt: ['português','portugues','portuguese','portugués','portugiesisch','portoghese','portugalski','португальский','پرتغالی','البرتغالية','ポルトガル語','포르투갈어','पुर्तगाली','portekizce','tiếng bồ đào nha'],
    ru: ['русский','russian','ruso','russe','russisch','russo','rosyjski','روسی','الروسية','ロシア語','러시아어','रूसी','rusça','tiếng nga'],
    ur: ['اردو','urdu','ourdou','урду','الأردية','ウルドゥー語','우르두어','उर्दू','urduca','tiếng urdu'],
    id: ['bahasa indonesia','indonesian','indonesio','indonésien','indonesisch','indonesiano','индонезийский','اندونزیایی','الإندونيسية','インドネシア語','인도네시아어','endonezce','tiếng indonesia'],
    de: ['deutsch','german','alemán','aleman','allemand','tedesco','niemiecki','немецкий','آلمانی','الألمانية','ドイツ語','독일어','जर्मन','almanca','tiếng đức'],
    ja: ['日本語','japanese','japonés','japonais','japanisch','giapponese','japoński','японский','ژاپنی','اليابانية','일본어','जापानी','japonca','tiếng nhật'],
    tr: ['türkçe','turkce','turkish','turco','turc','türkisch','turecki','турецкий','ترکی','التركية','トルコ語','터키어','तुर्की','tiếng thổ nhĩ kỳ'],
    ko: ['한국어','korean','coreano','coréen','koreanisch','koreański','корейский','کره ای','الكورية','韓国語','कोरियाई','korece','tiếng hàn'],
    fa: ['فارسی','persian','farsi','persa','perse','persisch','персидский','الفارسية','ペルシャ語','페르시아어','फ़ारसी','farsça','tiếng ba tư'],
    uk: ['українська','ukrainian','ucraniano','ukrainien','ukrainisch','ukraiński','украинский','اوکراینی','الأوكرانية','ウクライナ語','우크라이나어','ukraynaca','tiếng ukraina'],
    it: ['italiano','italian','italien','italienisch','włoski','итальянский','ایتالیایی','الإيطالية','イタリア語','이탈리아어','इतालवी','italyanca','tiếng ý'],
    pl: ['polski','polish','polaco','polonais','polnisch','polacco','польский','لهستانی','البولندية','ポーランド語','폴란드어','polonyaca','tiếng ba lan'],
    vi: ['tiếng việt','vietnamese','vietnamita','vietnamien','vietnamesisch','wietnamski','вьетнамский','ویتنامی','الفيتنامية','ベトナム語','베트남어','vietnamca']
  };

  /* "change the language" and friends. The value is found separately, so
     these only have to spot the intent. */
  var SAY_LANGSET = {
    en: ['change the language','switch the language','set the language','change language','switch language','language to','speak to me in','talk to me in','say it in'],
    zh: ['切换语言','更改语言','改成','换语言'],
    hi: ['भाषा बदलो','भाषा बदलें','भाषा करो'],
    es: ['cambia el idioma','cambiar el idioma','cambiar idioma','idioma a','habla en'],
    ar: ['غير اللغة','تغيير اللغة','اللغة إلى'],
    fr: ['change la langue','changer la langue','langue en','parle en'],
    bn: ['ভাষা পরিবর্তন','ভাষা বদলাও'],
    pt: ['mudar o idioma','muda o idioma','mudar idioma','idioma para','fala em'],
    ru: ['смени язык','измени язык','поменяй язык','язык на'],
    ur: ['زبان تبدیل','زبان بدلو'],
    id: ['ganti bahasa','ubah bahasa','bahasa ke'],
    de: ['sprache ändern','ändere die sprache','wechsle die sprache','sprache auf','sprich'],
    ja: ['言語を変更','言語を切り替え','言語にして'],
    tr: ['dili değiştir','dil değiştir','diline geç'],
    ko: ['언어 변경','언어 바꿔','언어로'],
    fa: ['زبان را عوض کن','تغییر زبان','زبان به'],
    uk: ['зміни мову','змінити мову','мову на'],
    it: ['cambia lingua','cambiare lingua','lingua in','parla in'],
    pl: ['zmień język','zmiana języka','język na'],
    vi: ['đổi ngôn ngữ','thay đổi ngôn ngữ','ngôn ngữ sang']
  };

  /* Google writes its own name in the local script in plenty of places. */
  var SAY_GOOGLE = ['google','جوجل','گوگل','гугл','グーグル','구글','谷歌','गूगल','গুগল','гуґл'];

  /* The editor's own panel names, and what people call them out loud. */
  var EDITOR_PANELS = {
    Effects:     ['effect','effects','efecto','effet','effekt','effetto','эффект','efekt','افکت','تأثير','エフェクト','효과','प्रभाव','efek','hiệu ứng','特效'],
    Transitions: ['transition','transitions','transición','transizione','übergang','переход','przejście','ترنزیشن','انتقال','トランジション','전환','chuyển cảnh','转场'],
    Text:        ['text','texto','texte','testo','текст','tekst','متن','نص','テキスト','텍스트','chữ','文字'],
    Memes:       ['meme','memes','мем','ميم','ミーム','밈','chế'],
    SFX:         ['sound effect','sound effects','sfx','sonido','son','geräusch','звук','dźwięk','صدا','صوت','効果音','효과음','âm thanh','音效'],
    Stickers:    ['sticker','stickers','pegatina','autocollant','aufkleber','стикер','naklejka','استیکر','ملصق','ステッカー','스티커','nhãn dán','贴纸'],
    Audio:       ['audio','música','music','musique','musik','музыка','muzyka','موسیقی','موسيقى','オーディオ','오디오','nhạc','音频'],
    Media:       ['media','clip','clips','medios','médias','medien','медиа','media'],
    AI:          ['ai panel','ai tools']
  };

  /* Effects the editor actually ships. Spoken by name, matched by name. */
  var EDITOR_FX = ['glitch','vhs','shake','zoom','blur','invert','sepia','mirror','neon','spin','bounce','fade','speed'];

  /* "edit this video with this effect" — the generic form, where no
     particular effect is named. Opens the editor on the Effects panel. */
  var SAY_EDITFX = {
    en: ['edit this video','edit the video','add an effect','apply an effect','put an effect','with this effect','with an effect','effect on this'],
    zh: ['编辑这个视频','加特效','添加特效'],
    hi: ['यह वीडियो एडिट','प्रभाव जोड़ो'],
    es: ['edita este video','editar este video','añadir un efecto','aplicar un efecto','con este efecto'],
    ar: ['عدل هذا الفيديو','أضف تأثير'],
    fr: ['modifie cette vidéo','monter cette vidéo','ajoute un effet','avec cet effet'],
    bn: ['এই ভিডিও এডিট','প্রভাব যোগ'],
    pt: ['edita este vídeo','editar este vídeo','adicionar um efeito','com este efeito'],
    ru: ['отредактируй это видео','добавь эффект','с этим эффектом'],
    ur: ['یہ ویڈیو ایڈیٹ','اثر شامل'],
    id: ['edit video ini','tambah efek','dengan efek ini'],
    de: ['bearbeite dieses video','füge einen effekt hinzu','mit diesem effekt'],
    ja: ['この動画を編集','エフェクトを追加'],
    tr: ['bu videoyu düzenle','efekt ekle','bu efektle'],
    ko: ['이 영상 편집','효과 추가'],
    fa: ['این ویدیو را ویرایش کن','افکت اضافه کن'],
    uk: ['відредагуй це відео','додай ефект'],
    it: ['modifica questo video','aggiungi un effetto','con questo effetto'],
    pl: ['edytuj to wideo','dodaj efekt','z tym efektem'],
    vi: ['sửa video này','thêm hiệu ứng','với hiệu ứng này']
  };

  /* Longest name first, so "tiếng tây ban nha" is not beaten by "tiếng anh"
     and "bahasa indonesia" is not beaten by a bare "indonesia". */
  var LANGNAME_INDEX = (function () {
    var rows = [], code, i;
    for (code in LANGNAMES) {
      for (i = 0; i < LANGNAMES[code].length; i++) rows.push([clean(LANGNAMES[code][i]), code]);
    }
    rows.sort(function (a, b) { return b[0].length - a[0].length; });
    return rows;
  })();

  function pickLang(t) {
    for (var i = 0; i < LANGNAME_INDEX.length; i++) {
      if (LANGNAME_INDEX[i][0] && t.indexOf(LANGNAME_INDEX[i][0]) !== -1) return LANGNAME_INDEX[i][1];
    }
    return null;
  }

  function pickFrom(t, list) {
    var best = null, i, p;
    for (i = 0; i < list.length; i++) {
      p = clean(list[i]);
      if (p && t.indexOf(p) !== -1 && (!best || p.length > best.length)) best = p;
    }
    return best;
  }

  function pickPanel(t) {
    var name, hit, best = null;
    for (name in EDITOR_PANELS) {
      hit = pickFrom(t, EDITOR_PANELS[name]);
      if (hit && (!best || hit.length > best.hit.length)) best = { panel: name, hit: hit };
    }
    return best;
  }

  var HERE = (location.pathname.split('/').pop() || 'index.html').split('?')[0];

  /* The editor is a React page: its panels are buttons with visible
     labels, and an effect is only clickable once its panel is open. So
     this drives the same controls a person would, and says so plainly
     when the control is not there rather than pretending it worked. */
  function runEditorIntent(panel, fx) {
    function byText(txt) {
      var els = document.querySelectorAll('button,[role="button"],li,div[class]'), i, el, s;
      for (i = 0; i < els.length; i++) {
        el = els[i];
        s = (el.textContent || '').trim().toLowerCase();
        if (s === txt.toLowerCase() && el.offsetParent !== null) return el;
      }
      return null;
    }
    var tab = byText(panel);
    if (tab) tab.click();
    if (!fx) return;
    setTimeout(function () {
      var b = byText(fx);
      if (b) { b.click(); flash(ui2('cmdFxOn', { '{f}': fx })); }
      else flash(ui2('cmdFxNo', { '{f}': fx }));
    }, 450);
  }

  function goEditor(panel, fx) {
    if (HERE === 'editor.html') { runEditorIntent(panel || 'Effects', fx); return; }
    try { sessionStorage.setItem('nc_editor_intent', JSON.stringify({ panel: panel || 'Effects', fx: fx || '' })); } catch (e) {}
    flash(ui2('cmdGo', { '{p}': 'editor.html' }));
    setTimeout(function () { location.href = 'editor.html'; }, 650);
  }

  function goGoogle() {
    if (HERE === 'app.html') {
      var b = document.getElementById('gbtn');
      if (b) { b.click(); return; }
    }
    try { sessionStorage.setItem('nc_signin_intent', 'google'); } catch (e) {}
    flash(ui2('cmdGo', { '{p}': 'app.html' }));
    setTimeout(function () { location.href = 'app.html'; }, 650);
  }

  /* Run whatever the last page was asked to do, now that we are here. */
  function claimIntent() {
    var v;
    try { v = sessionStorage.getItem('nc_signin_intent'); } catch (e) { v = null; }
    if (v === 'google' && HERE === 'app.html') {
      try { sessionStorage.removeItem('nc_signin_intent'); } catch (e) {}
      setTimeout(function () { var b = document.getElementById('gbtn'); if (b) b.click(); }, 900);
    }
    try { v = sessionStorage.getItem('nc_editor_intent'); } catch (e) { v = null; }
    if (v && HERE === 'editor.html') {
      try { sessionStorage.removeItem('nc_editor_intent'); } catch (e) {}
      var o = {};
      try { o = JSON.parse(v) || {}; } catch (e) {}
      setTimeout(function () { runEditorIntent(o.panel || 'Effects', o.fx || ''); }, 2200);
    }
  }

  function smartCmd(t) {
    var L = langCode(), code, fx, panel;

    /* Sign in with a named provider. Reuses the sign-in phrases already
       written for every language, so only the provider is new. */
    if (pickFrom(t, SAY_GOOGLE) && hasPhrase(t, sayList({ say: SAY_SIGNIN }))) {
      return { type: 'smart', run: goGoogle };
    }

    /* Change the language to a named one. */
    if (hasPhrase(t, (SAY_LANGSET[L] || SAY_LANGSET.en))) {
      code = pickLang(t);
      if (code) return { type: 'smart', run: function () {
        flash(ui2('cmdLang', { '{l}': (typeof LANGS !== 'undefined' && LANGS[code]) || code }));
        if (typeof applyLang === 'function') applyLang(code);
      } };
    }

    /* A named effect, with or without a verb around it. */
    fx = pickFrom(t, EDITOR_FX);
    panel = pickPanel(t);
    if (fx && (panel || hasPhrase(t, (SAY_EDITFX[L] || SAY_EDITFX.en)))) {
      return { type: 'smart', run: function () { goEditor('Effects', fx); } };
    }
    /* "edit this video with this effect" — no effect named, so just open
       the editor on the panel they asked for. */
    if (hasPhrase(t, (SAY_EDITFX[L] || SAY_EDITFX.en))) {
      return { type: 'smart', run: function () { goEditor(panel ? panel.panel : 'Effects', ''); } };
    }
    if (panel && HERE === 'editor.html') {
      return { type: 'smart', run: function () { runEditorIntent(panel.panel, fx || ''); } };
    }
    return null;
  }

  function matchCmd(text) {
    var t = clean(text), i, k, sm;
    sm = smartCmd(t);
    if (sm) return sm;
    for (i = 0; i < extraCommands.length; i++) {
      if (hasPhrase(t, extraCommands[i].say)) return { type: 'custom', cmd: extraCommands[i] };
    }
    for (k = 0; k < NAV.length; k++) {
      if (hasPhrase(t, sayList(NAV[k]))) return { type: 'nav', page: NAV[k].url };
    }
    if (hasPhrase(t, sayList({ say: SAY_SIGNIN }))) return { type: 'signin' };
    if (hasPhrase(t, sayList({ say: SAY_SIGNOUT }))) return { type: 'signout' };
    if (hasPhrase(t, sayList({ say: SAY_STOP }))) return { type: 'stop' };
    if (hasPhrase(t, sayList({ say: SAY_HELP }))) return { type: 'help' };
    return null;
  }

  function handleCommand(raw) {
    if (!raw || !raw.trim()) return;
    var r = matchCmd(raw);
    if (!r) { flash(ui('cmdUnknown')); return; }
    if (r.type === 'custom') {
      try { r.cmd.action(raw); } catch (e) {}
      fire('command', { phrase: raw, name: r.cmd.name || 'custom' });
      return;
    }
    if (r.type === 'nav') {
      var here = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
      if (here === r.page) { flash(ui('busy')); return; }
      flash(ui2('cmdGo', { '{p}': r.page }));
      fire('command', { phrase: raw, page: r.page });
      setTimeout(function () { location.href = r.page; }, 650);
      return;
    }
    if (r.type === 'smart') { try { r.run(); } catch (e) {} fire('command', { phrase: raw, name: 'smart' }); return; }
    if (r.type === 'signin') openPanel();
    else if (r.type === 'signout') signOut();
    else if (r.type === 'stop') { stopVoice(); flash(ui('vcmdOff')); }
    else if (r.type === 'help') speak(helpText());
  }

  function helpText() {
    var parts = [];
    NAV.forEach(function (n) { var l = sayList(n); if (l.length) parts.push(l[0]); });
    return ui('vcmdOn') + ' ' + parts.slice(0, 7).join(', ');
  }

  function startVoice() {
    if (!SR) { setStatus(ui('voiceUnsupported'), 'err'); return; }
    if (listening) return;
    listening = true;
    store.set(VCMD_KEY, '1');
    if ($id('ncb-fab')) $id('ncb-fab').classList.add('live');
    renderVcmd();
    var started = false;
    try {
      rec = new SR();
      rec.lang = BCP47[langCode()] || 'en-US';
      rec.continuous = true;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = function (e) {
        var text = '', i;
        for (i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
        handleCommand(text);
      };
      rec.onerror = function () {};
      rec.onend = function () {
        if (listening) {
          setTimeout(function () { try { rec.start(); } catch (e) {} }, 250);
        }
      };
      rec.start();
      started = true;
    } catch (e) {}
    if (!started) { listening = false; setStatus(ui('voiceUnsupported'), 'err'); }
    else setStatus(ui('listenReady'), 'ok');
  }

  function stopVoice() {
    listening = false;
    store.set(VCMD_KEY, '0');
    if ($id('ncb-fab')) $id('ncb-fab').classList.remove('live');
    if (rec) { try { rec.onend = null; rec.onerror = null; rec.abort(); } catch (e) {} rec = null; }
    renderVcmd();
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = BCP47[langCode()] || 'en-US';
      u.rate = 1.02;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ------------------------------------------------------------------
   * Panel styles
   * ------------------------------------------------------------------ */
  var CSS1 = [
    '.ncb-fab{position:fixed;right:18px;bottom:18px;z-index:99990;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;background:linear-gradient(135deg,#FF2E97,#7209B7,#00F0FF);color:#fff;font-weight:800;font-size:11px;letter-spacing:.5px;box-shadow:0 8px 30px rgba(0,0,0,.5);transition:transform .2s;font-family:inherit}',
    '.ncb-fab:hover{transform:scale(1.07)}',
    '.ncb-fab .ncb-dot{width:8px;height:8px;border-radius:50%;background:#B6FF3C;box-shadow:0 0 8px #B6FF3C}',
    '.ncb-fab.live .ncb-dot{animation:ncbPulse 1s ease-in-out infinite}',
    '@keyframes ncbPulse{0%,100%{opacity:.3}50%{opacity:1}}',
    '.ncb-panel{position:fixed;right:18px;bottom:86px;z-index:99991;width:min(360px,calc(100vw - 24px));max-height:min(620px,calc(100vh - 120px));overflow:auto;background:#0A0C14;border:1px solid rgba(120,140,200,.18);border-radius:18px;color:#EAF2FF;font-family:inherit;box-shadow:0 24px 70px rgba(0,0,0,.6);display:none}',
    '.ncb-panel.open{display:block}',
    '.ncb-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(120,140,200,.14);position:sticky;top:0;background:#0A0C14;border-radius:18px 18px 0 0}',
    '.ncb-head b{font-size:1rem}',
    '.ncb-close{background:none;border:none;color:#7E8AA6;font-size:1.3rem;cursor:pointer;line-height:1;padding:0 4px}',
    '.ncb-body{padding:14px 16px}',
    '.ncb-status{padding:10px 12px;border-radius:10px;font-size:.86rem;line-height:1.55;border:1px solid rgba(120,140,200,.14);background:rgba(120,140,200,.06);color:#B9C4DE}',
    '.ncb-status.ok{border-color:rgba(182,255,60,.4);background:rgba(182,255,60,.07);color:#D8FFA8}',
    '.ncb-status.err{border-color:rgba(255,46,151,.45);background:rgba(255,46,151,.08);color:#FFD3E7}',
    '.ncb-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '.ncb-btn{padding:10px 14px;border-radius:12px;border:none;cursor:pointer;font-weight:700;font-size:.88rem;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;transition:transform .15s}',
    '.ncb-btn:hover{transform:translateY(-1px)}',
    '.ncb-btn.ghost{background:rgba(255,255,255,.06);color:#EAF2FF;border:1px solid rgba(255,255,255,.14)}',
    '.ncb-btn.danger{background:rgba(255,46,151,.15);color:#FF8FC0;border:1px solid rgba(255,46,151,.35)}',
    '.ncb-btn:disabled{opacity:.5;cursor:default;transform:none}'
  ].join(' ');

  var CSS2 = [
    '.ncb-media{display:none;margin-top:12px}',
    '.ncb-media.open{display:block}',
    '.ncb-media video{width:100%;border-radius:12px;background:#000;transform:scaleX(-1);border:1px solid rgba(120,140,200,.2);outline:none}',
    '.ncb-media video.ncb-ok{box-shadow:0 0 0 3px #B6FF3C}',
    '.ncb-medialine{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:.8rem;color:#7E8AA6}',
    '.ncb-bar{flex:1;height:6px;border-radius:3px;background:#161B28;overflow:hidden}',
    '.ncb-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#B6FF3C,#00F0FF);border-radius:3px;transition:width .1s}',
    '.ncb-sec{margin-top:16px}',
    '.ncb-sec > b{display:block;font-size:.76rem;letter-spacing:2px;text-transform:uppercase;color:#7E8AA6;margin-bottom:8px}',
    '.ncb-input{width:100%;padding:11px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#0E1117;color:#EAF2FF;font-size:.92rem;margin-top:8px;font-family:inherit}',
    '.ncb-prof{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border:1px solid rgba(120,140,200,.14);border-radius:10px;margin-bottom:8px;font-size:.9rem}',
    '.ncb-prof small{color:#7E8AA6;font-size:.72rem}',
    '.ncb-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid rgba(120,140,200,.16);border-radius:12px;font-size:.9rem}',
    '.ncb-sw{width:44px;height:24px;border-radius:12px;background:#161B28;border:none;position:relative;cursor:pointer;padding:0}',
    '.ncb-sw::after{content:\'\';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#7E8AA6;transition:left .2s}',
    '.ncb-sw.on{background:linear-gradient(90deg,#00F0FF,#4CC9F0)}',
    '.ncb-sw.on::after{left:23px;background:#04121a}',
    '.ncb-hint{font-size:.78rem;color:#7E8AA6;line-height:1.55;margin-top:8px}',
    '.ncb-priv{margin-top:14px;font-size:.76rem;color:#5F6B85;line-height:1.5;border-top:1px solid rgba(120,140,200,.12);padding-top:12px}',
    '.ncb-toast{position:fixed;right:18px;bottom:80px;z-index:99992;background:rgba(12,14,20,.96);border:1px solid rgba(0,240,255,.4);color:#EAF2FF;padding:10px 14px;border-radius:12px;font-size:.85rem;box-shadow:0 10px 30px rgba(0,0,0,.5);opacity:0;transform:translateY(8px);transition:.25s;pointer-events:none;max-width:300px;font-family:inherit}',
    '.ncb-toast.show{opacity:1;transform:none}'
  ].join(' ');

  var mode = 'idle';          /* idle | enrolling | signing */
  var flowCancel = false;
  var toastTimer = null;

  function $id(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[<>&]/g, function (c) {
      return c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;';
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function setStatus(text, kind) {
    var s = $id('ncb-status');
    if (!s) return;
    s.textContent = text;
    s.className = 'ncb-status' + (kind ? ' ' + kind : '');
  }
  function flash(text) {
    var t = $id('ncb-toast');
    if (!t) return;
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function setBar(p) {
    var f = $id('ncb-fill');
    var tx = $id('ncb-mediatxt');
    if (f) f.style.width = Math.round(p * 100) + '%';
    if (tx) tx.textContent = Math.round(p * 100) + '%';
  }
  function showMedia(label) {
    var m = $id('ncb-media');
    if (m) m.classList.add('open');
    var tx = $id('ncb-mediatxt');
    if (tx) tx.textContent = label || '';
    setBar(0);
  }
  function hideMedia() {
    var m = $id('ncb-media');
    if (m) m.classList.remove('open');
    var v = $id('ncb-video');
    if (v) { try { v.srcObject = null; } catch (e) {} v.classList.remove('ncb-ok'); }
  }
  function showVideo(stream) {
    var v = $id('ncb-video');
    if (!v) return Promise.resolve();
    v.classList.remove('ncb-ok');
    v.srcObject = stream;
    return v.play().catch(function () {});
  }
  function setVideoOk(on) {
    var v = $id('ncb-video');
    if (v) v.classList.toggle('ncb-ok', on);
  }
  function resetIdle() {
    mode = 'idle';
    stopStream();
    hideMedia();
    render();
  }
  function cancelFlow() {
    flowCancel = true;
    resetIdle();
  }

  function renderActions() {
    var box = $id('ncb-actions');
    if (!box) return;
    var h = '';
    if (mode === 'idle') {
      h += '<button class="ncb-btn" data-act="signin">' + esc(ui('btnSignIn')) + '</button>';
      h += '<button class="ncb-btn ghost" data-act="face">' + esc(ui('btnFaceOnly')) + '</button>';
      h += '<button class="ncb-btn ghost" data-act="voice">' + esc(ui('btnVoiceOnly')) + '</button>';
      h += '<button class="ncb-btn ghost" data-act="enroll">' + esc(ui('btnEnroll')) + '</button>';
    } else {
      h += '<button class="ncb-btn ghost" data-act="cancel">' + esc(ui('cancel')) + '</button>';
    }
    box.innerHTML = h;
    var buttons = box.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].onclick = function () { act(this.dataset.act); };
    }
  }

  function renderEnroll() {
    var box = $id('ncb-enrollsec');
    if (!box) return;
    if (mode === 'enrolling') {
      var cur = '';
      try { cur = localStorage.getItem('nc_name') || ''; } catch (e) {}
      box.innerHTML = '<b>' + esc(ui('btnEnroll')) + '</b>' +
        '<input class="ncb-input" id="ncb-enname" maxlength="24" placeholder="' + esc(ui('enrollName')) + '" value="' + esc(cur) + '">' +
        '<div class="ncb-row"><button class="ncb-btn" id="ncb-enstart">' + esc(ui('enrollStart')) + '</button></div>';
      var go = $id('ncb-enstart');
      if (go) go.onclick = doEnroll;
    } else {
      box.innerHTML = '';
    }
  }

  function renderProfiles() {
    var box = $id('ncb-profiles');
    if (!box) return;
    if (mode !== 'idle') { box.innerHTML = ''; return; }
    var ps = profiles();
    if (!ps.length) {
      box.innerHTML = '<b>' + esc(ui('profiles')) + '</b><div class="ncb-hint">' + esc(ui('noProfiles')) + '</div>';
      return;
    }
    var h = '<b>' + esc(ui('profiles')) + '</b>';
    for (var i = 0; i < ps.length; i++) {
      h += '<div class="ncb-prof"><span><b>' + esc(ps[i].name) + '</b><br><small>' +
        new Date(ps[i].created || Date.now()).toLocaleDateString() + '</small></span>' +
        '<button class="ncb-btn danger" data-del="' + i + '">' + esc(ui('delete')) + '</button></div>';
    }
    box.innerHTML = h;
    var dels = box.querySelectorAll('[data-del]');
    for (var d = 0; d < dels.length; d++) {
      dels[d].onclick = function () { deleteProfile(parseInt(this.dataset.del, 10)); };
    }
  }

  function deleteProfile(idx) {
    var ps = profiles();
    if (idx < 0 || idx >= ps.length) return;
    var s = session();
    ps.splice(idx, 1);
    saveProfiles(ps);
    if (s && !ps.length) signOut();
    render();
  }

  function renderVcmd() {
    var sec = $id('ncb-vcmd');
    if (!sec) return;
    sec.innerHTML = '<b>' + esc(ui('vcmdToggle')) + '</b>' +
      '<div class="ncb-toggle"><span>' + esc(ui('micListening')) + '</span>' +
      '<button class="ncb-sw' + (listening ? ' on' : '') + '" id="ncb-vtoggle" aria-label="' + esc(ui('vcmdToggle')) + '"></button></div>' +
      '<div class="ncb-hint">' + esc(listening ? ui('vcmdOn') : ui('vcmdOff')) + '<br>' + esc(ui('speechLang')) + '</div>';
    var tg = $id('ncb-vtoggle');
    if (tg) tg.onclick = function () { listening ? stopVoice() : startVoice(); };
  }

  function render() {
    var fab = $id('ncb-fab');
    if (fab) fab.classList.toggle('live', listening);
    var s = session();
    if (s) setStatus(ui2('signedInAs', { '{n}': s.name }), 'ok');
    else setStatus(ui('signedOut'));
    renderActions();
    renderEnroll();
    renderProfiles();
    renderVcmd();
  }

  function openPanel() {
    var p = $id('ncb-panel');
    if (!p) return;
    p.classList.add('open');
    render();
  }
  function closePanel() {
    if (mode !== 'idle') cancelFlow();
    var p = $id('ncb-panel');
    if (p) p.classList.remove('open');
  }
  function togglePanel() {
    var p = $id('ncb-panel');
    if (!p) return;
    if (p.classList.contains('open')) closePanel(); else openPanel();
  }

  function buildUI() {
    var st = document.createElement('style');
    st.textContent = CSS1 + CSS2;
    document.head.appendChild(st);

    var fab = document.createElement('button');
    fab.id = 'ncb-fab';
    fab.className = 'ncb-fab';
    fab.setAttribute('aria-label', ui('fab'));
    fab.innerHTML = '<span class="ncb-dot"></span>FV';
    fab.onclick = togglePanel;
    document.body.appendChild(fab);

    var pan = document.createElement('div');
    pan.id = 'ncb-panel';
    pan.className = 'ncb-panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-label', ui('title'));
    pan.innerHTML =
      '<div class="ncb-head"><b>' + esc(ui('title')) + '</b>' +
      '<button class="ncb-close" aria-label="' + esc(ui('close')) + '">x</button></div>' +
      '<div class="ncb-body">' +
        '<div class="ncb-status" id="ncb-status"></div>' +
        '<div class="ncb-row" id="ncb-actions"></div>' +
        '<div class="ncb-media" id="ncb-media">' +
          '<video id="ncb-video" playsinline muted autoplay></video>' +
          '<div class="ncb-medialine"><div class="ncb-bar" id="ncb-bar"><i id="ncb-fill"></i></div>' +
          '<span id="ncb-mediatxt"></span></div>' +
        '</div>' +
        '<div class="ncb-sec" id="ncb-enrollsec"></div>' +
        '<div class="ncb-sec" id="ncb-profiles"></div>' +
        '<div class="ncb-sec" id="ncb-vcmd"></div>' +
        '<div class="ncb-priv">' + esc(ui('priv')) + '</div>' +
      '</div>';
    document.body.appendChild(pan);
    var cl = pan.querySelector('.ncb-close');
    if (cl) cl.onclick = closePanel;

    var toast = document.createElement('div');
    toast.id = 'ncb-toast';
    toast.className = 'ncb-toast';
    document.body.appendChild(toast);
  }

  function act(name) {
    if (name === 'signin') beginSignIn(true, true);
    else if (name === 'face') beginSignIn(true, false);
    else if (name === 'voice') beginSignIn(false, true);
    else if (name === 'enroll') showEnroll();
    else if (name === 'cancel') cancelFlow();
  }

  function showEnroll() {
    mode = 'enrolling';
    render();
  }

  function doEnroll() {
    var input = $id('ncb-enname');
    var name = input ? input.value.trim() : '';
    if (name.length < 2) { setStatus(ui('enrollName'), 'err'); return; }
    enrollFlow(name);
  }

  async function enrollFlow(name) {
    mode = 'enrolling';
    flowCancel = false;
    render();
    var ok = await loadFaceApi();
    if (!ok) { setStatus(ui('faceApiFailed'), 'err'); resetIdle(); return; }
    var faces = [];
    try {
      var vs = await openStream({ video: { facingMode: 'user', width: { ideal: 640 } }, audio: false });
      showMedia(ui('lookAtCam'));
      await showVideo(vs);
      var desc, tries = 0;
      while (tries < 5 && faces.length < 3) {
        if (flowCancel) return;
        tries++;
        setStatus(ui('listeningForFace') + ' (' + (faces.length + 1) + '/3)');
        desc = await detectDescriptor($id('ncb-video'));
        if (desc) {
          faces.push(desc);
          setVideoOk(true);
          await sleep(500);
        } else {
          setVideoOk(false);
          await sleep(700);
        }
      }
      stopStream();
    } catch (e) {
      stopStream();
      setStatus(ui('camError'), 'err');
      resetIdle();
      return;
    }
    if (flowCancel) return;
    if (!faces.length) { setStatus(ui('noFace'), 'err'); resetIdle(); return; }
    var face = meanVec(faces);
    setStatus(ui('faceCaptured') + '. ' + ui('giveMicForFace'), 'ok');
    var voice = null;
    try {
      var ms = await openStream({ audio: true, video: false });
      hideMedia();
      setStatus(ui('sayPhrase'), 'ok');
      voice = await captureVoiceprint(ms, 2600, setBar);
      stopStream();
    } catch (e) {
      stopStream();
      setStatus(ui('micError'), 'err');
      resetIdle();
      return;
    }
    if (flowCancel) return;
    if (!voice) { setStatus(ui('noVoice'), 'err'); resetIdle(); return; }
    var ps = profiles();
    var prof = { id: 'bio' + Date.now().toString(36), name: name, face: face, voice: voice, created: Date.now() };
    ps.push(prof);
    saveProfiles(ps);
    setSession(prof);
    mode = 'idle';
    hideMedia();
    render();
    setStatus(ui2('signedIn', { '{n}': name }), 'ok');
    speak(ui2('signedIn', { '{n}': name }));
    fire('signin', { name: name, source: 'enroll' });
    flash(ui2('signedIn', { '{n}': name }));
  }

  async function beginSignIn(useFace, useVoice) {
    if (!profiles().length) { setStatus(ui('noProfiles'), 'err'); return; }
    mode = 'signing';
    flowCancel = false;
    render();
    var face = null, voice = null;
    try {
      var opts = {
        video: useFace ? { facingMode: 'user', width: { ideal: 640 } } : false,
        audio: useVoice
      };
      if (useFace && !(await loadFaceApi())) { setStatus(ui('faceApiFailed'), 'err'); resetIdle(); return; }
      var stream = await openStream(opts);
      if (flowCancel) { stopStream(); return; }
      if (useFace) {
        showMedia(ui('listeningForFace'));
        await showVideo(stream);
        var desc = null, tries = 0;
        while (tries < 5 && !desc) {
          if (flowCancel) return;
          tries++;
          setVideoOk(false);
          desc = await detectDescriptor($id('ncb-video'));
          if (!desc) await sleep(700);
        }
        face = desc;
        setVideoOk(!!face);
      }
      if (useVoice) {
        if (!useFace) showMedia(ui('recording'));
        setStatus(ui('sayPhrase'), 'ok');
        voice = await captureVoiceprint(stream, 2400, setBar);
      }
      stopStream();
    } catch (e) {
      stopStream();
      setStatus(ui(useFace && !voice ? 'camError' : 'micError'), 'err');
      resetIdle();
      return;
    }
    hideMedia();
    if (flowCancel) { mode = 'idle'; render(); return; }
    if (useFace && !face) { setStatus(ui('noFace'), 'err'); resetIdle(); return; }
    if (useVoice && !voice) { setStatus(ui('noVoice'), 'err'); resetIdle(); return; }
    var ps = profiles();
    var best = null, bestScore = -1, faceSeen = false, voiceSeen = false;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      var fOK = !useFace || (p.face && face && euclid(face, p.face) <= FACE_OK);
      var vOK = !useVoice || (p.voice && voice && cosine(voice, p.voice) >= VOICE_OK);
      if (fOK) faceSeen = true;
      if (vOK) voiceSeen = true;
      if (fOK && vOK) {
        var score = (useFace ? Math.max(0, 1 - euclid(face, p.face) / FACE_OK) : 0) +
                    (useVoice ? Math.max(0, cosine(voice, p.voice) - VOICE_OK) : 0);
        if (score > bestScore) { bestScore = score; best = p; }
      }
    }
    if (best) {
      setSession(best);
      mode = 'idle';
      render();
      setStatus(ui2('signedIn', { '{n}': best.name }), 'ok');
      speak(ui2('signedIn', { '{n}': best.name }));
      fire('signin', { name: best.name, source: 'bio' });
      flash(ui2('signedIn', { '{n}': best.name }));
    } else {
      mode = 'idle';
      render();
      if (useFace && !faceSeen) setStatus(ui('notSignedInFace'), 'err');
      else setStatus(ui('notSignedInVoice'), 'err');
    }
  }

  function signOut() {
    clearSession();
    fire('signout', {});
    render();
    setStatus(ui('signedOutDone'));
    flash(ui('signOut'));
  }

  /* ------------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------------ */
  window.ncBiometric = {
    open: openPanel,
    close: closePanel,
    toggle: togglePanel,
    signedInName: signedInName,
    isSignedIn: function () { return !!session(); },
    signOut: signOut,
    signIn: function () { openPanel(); setTimeout(function () { beginSignIn(true, true); }, 60); },
    enroll: function () { openPanel(); setTimeout(showEnroll, 60); },
    startVoice: startVoice,
    stopVoice: stopVoice,
    voiceOn: function () { return listening; },
    addCommands: addCommands,
    speak: speak
  };

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
    if (e.altKey && (e.key === 'b' || e.key === 'B')) togglePanel();
  });

  function boot() {
    buildUI();
    render();
    /* A command spoken on the last page may have been asking for something
       that only exists on this one — the Google button, an editor panel.
       Finish it here. */
    claimIntent();
    if (store.get(VCMD_KEY, '0') === '1') setTimeout(startVoice, 800);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
