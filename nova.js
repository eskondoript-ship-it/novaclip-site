const THEMES = { 'Dark':['#0E1117','#1E2130','#FAFAFA'], 'Light':['#FFFFFF','#F0F2F6','#111111'], 'Blue':['#0A1A3F','#14295E','#D6E4FF'], 'Red':['#2B0A0A','#4A1414','#FFD6D6'], 'Green':['#0A2B14','#14472A','#D6FFE0'], 'Rainbow':['#1A0A2B','#2B1450','#FFFFFF'], 'Rainy Window':['#0B1016','#161E28','#D8E4F0'] };
const LANGS = { en:'English', zh:'中文', hi:'हिन्दी', es:'Español', ar:'العربية', fr:'Français', bn:'বাংলা', pt:'Português', ru:'Русский', ur:'اردو', id:'Bahasa Indonesia', de:'Deutsch', ja:'日本語', tr:'Türkçe', ko:'한국어', fa:'فارسی', uk:'Українська', it:'Italiano', pl:'Polski', vi:'Tiếng Việt' };
const RTL = ["ar", "fa", "ur"];
const T = {
  home: { en:"Home", zh:"首页", hi:"होम", es:"Inicio", ar:"الرئيسية", fr:"Accueil", bn:"হোম", pt:"Início", ru:"Главная", ur:"ہوم", id:"Beranda", de:"Start", ja:"ホーム", tr:"Ana Sayfa", ko:"홈", fa:"خانه", uk:"Головна", it:"Home", pl:"Start", vi:"Trang chủ" },
  studio: { en:"Studio", zh:"工作室", hi:"स्टूडियो", es:"Estudio", ar:"استوديو", fr:"Studio", bn:"স্টুডিও", pt:"Estúdio", ru:"Студия", ur:"اسٹوڈیو", id:"Studio", de:"Studio", ja:"スタジオ", tr:"Stüdyo", ko:"스튜디오", fa:"استودیو", uk:"Студія", it:"Studio", pl:"Studio", vi:"Studio" },
  trends: { en:"Trend Spotter", zh:"趋势雷达", hi:"ट्रेंड स्पॉटर", es:"Detector de Tendencias", ar:"راصد الاتجاهات", fr:"Détecteur de Tendances", bn:"ট্রেন্ড স্পটার", pt:"Radar de Tendências", ru:"Радар трендов", ur:"ٹرینڈ اسپاٹر", id:"Pemantau Tren", de:"Trend-Radar", ja:"トレンド探知", tr:"Trend Radarı", ko:"트렌드 탐지기", fa:"ردیاب ترند", uk:"Радар трендів", it:"Rileva Tendenze", pl:"Radar Trendów", vi:"Dò Xu Hướng" },
  ai: { en:"NovaClip AI", zh:"NovaClip 智能", hi:"NovaClip एआई", es:"IA NovaClip", ar:"ذكاء NovaClip", fr:"IA NovaClip", bn:"NovaClip এআই", pt:"IA NovaClip", ru:"ИИ NovaClip", ur:"NovaClip اے آئی", id:"AI NovaClip", de:"NovaClip KI", ja:"NovaClip AI", tr:"NovaClip YZ", ko:"NovaClip AI", fa:"هوش مصنوعی NovaClip", uk:"ШІ NovaClip", it:"IA NovaClip", pl:"AI NovaClip", vi:"AI NovaClip" },
  editor: { en:"Editor", zh:"编辑器", hi:"एडिटर", es:"Editor", ar:"المحرر", fr:"Éditeur", bn:"এডিটর", pt:"Editor", ru:"Редактор", ur:"ایڈیٹر", id:"Editor", de:"Editor", ja:"エディター", tr:"Editör", ko:"에디터", fa:"ویرایشگر", uk:"Редактор", it:"Editor", pl:"Edytor", vi:"Trình chỉnh sửa" },
  sniper: { en:"Games", zh:"游戏", hi:"गेम्स", es:"Juegos", ar:"الألعاب", fr:"Jeux", bn:"গেমস", pt:"Jogos", ru:"Игры", ur:"گیمز", id:"Gim", de:"Spiele", ja:"ゲーム", tr:"Oyunlar", ko:"게임", fa:"بازی‌ها", uk:"Ігри", it:"Giochi", pl:"Gry", vi:"Trò chơi" },
  family: { en:"Family", zh:"家庭", hi:"परिवार", es:"Familia", ar:"العائلة", fr:"Famille", bn:"পরিবার", pt:"Família", ru:"Семья", ur:"خاندان", id:"Keluarga", de:"Familie", ja:"家族", tr:"Aile", ko:"가족", fa:"خانواده", uk:"Сім’я", it:"Famiglia", pl:"Rodzina", vi:"Gia đình" },
  pricing: { en:"Pricing", zh:"定价", hi:"मूल्य", es:"Precios", ar:"الأسعار", fr:"Tarifs", bn:"মূল্য", pt:"Preços", ru:"Цены", ur:"قیمتیں", id:"Harga", de:"Preise", ja:"料金", tr:"Fiyat", ko:"요금", fa:"قیمت‌گذاری", uk:"Ціни", it:"Prezzi", pl:"Cennik", vi:"Giá" },
  eyebrow: { en:"For teen creators · 13–18", zh:"面向青少年创作者 · 13–18", hi:"किशोर क्रिएटर्स के लिए · 13–18", es:"Para creadores adolescentes · 13–18", ar:"لصناع المحتوى المراهقين · 13–18", fr:"Pour les jeunes créateurs · 13–18", bn:"কিশোর নির্মাতাদের জন্য · 13–18", pt:"Para criadores adolescentes · 13–18", ru:"Для юных авторов · 13–18", ur:"نوجوان تخلیق کاروں کے لیے · 13–18", id:"Untuk kreator remaja · 13–18", de:"Für junge Creator · 13–18", ja:"10代のクリエイター向け · 13–18", tr:"Genç içerik üreticileri için · 13–18", ko:"청소년 크리에이터를 위해 · 13–18", fa:"برای سازندگان نوجوان · 13–18", uk:"Для юних авторів · 13–18", it:"Per giovani creator · 13–18", pl:"Dla młodych twórców · 13–18", vi:"Cho nhà sáng tạo trẻ · 13–18" },
  startchannel: { en:"Start your channel →", zh:"开启你的频道 →", hi:"अपना चैनल शुरू करें →", es:"Inicia tu canal →", ar:"ابدأ قناتك →", fr:"Lance ta chaîne →", bn:"আপনার চ্যানেল শুরু করুন →", pt:"Começa o teu canal →", ru:"Начни свой канал →", ur:"اپنا چینل شروع کریں →", id:"Mulai channel-mu →", de:"Starte deinen Kanal →", ja:"チャンネルを始めよう →", tr:"Kanalını başlat →", ko:"채널을 시작하세요 →", fa:"کانالت را شروع کن →", uk:"Почни свій канал →", it:"Avvia il tuo canale →", pl:"Załóż swój kanał →", vi:"Bắt đầu kênh của bạn →" },
  seerewards: { en:"See the rewards", zh:"查看奖励", hi:"रिवॉर्ड्स देखें", es:"Ver recompensas", ar:"شاهد الجوائز", fr:"Voir les récompenses", bn:"পুরস্কার দেখুন", pt:"Ver recompensas", ru:"Смотреть награды", ur:"انعامات دیکھیں", id:"Lihat hadiah", de:"Belohnungen ansehen", ja:"リワードを見る", tr:"Ödülleri gör", ko:"보상 보기", fa:"جوایز را ببین", uk:"Дивитись нагороди", it:"Vedi le ricompense", pl:"Zobacz nagrody", vi:"Xem phần thưởng" },
  meta_ai: { en:"AI tutors on call", zh:"AI 导师随时待命", hi:"एआई ट्यूटर उपलब्ध", es:"tutores de IA disponibles", ar:"مدرسو ذكاء اصطناعي", fr:"tuteurs IA disponibles", bn:"এআই টিউটর প্রস্তুত", pt:"tutores de IA disponíveis", ru:"ИИ-наставника на связи", ur:"AI ٹیوٹر دستیاب", id:"tutor AI siap", de:"KI-Tutoren bereit", ja:"AIチューター待機", tr:"yapay zeka eğitmeni", ko:"AI 튜터 대기", fa:"مربی هوش مصنوعی", uk:"ШІ-наставники", it:"tutor IA disponibili", pl:"tutorzy AI", vi:"gia sư AI trực" },
  meta_editor: { en:"browser editor", zh:"浏览器编辑器", hi:"ब्राउज़र एडिटर", es:"editor en navegador", ar:"محرر في المتصفح", fr:"éditeur navigateur", bn:"ব্রাউজার এডিটর", pt:"editor no browser", ru:"редактор в браузере", ur:"براؤزر ایڈیٹر", id:"editor peramban", de:"Browser-Editor", ja:"ブラウザ編集", tr:"tarayıcı editörü", ko:"브라우저 편집기", fa:"ویرایشگر مرورگر", uk:"редактор у браузері", it:"editor nel browser", pl:"edytor w przeglądarce", vi:"trình sửa trên web" },
  meta_rewards: { en:"quests & rewards", zh:"任务与奖励", hi:"क्वेस्ट और रिवॉर्ड", es:"misiones y recompensas", ar:"مهام وجوائز", fr:"quêtes et récompenses", bn:"কোয়েস্ট ও পুরস্কার", pt:"missões e recompensas", ru:"квесты и награды", ur:"کوئسٹ اور انعامات", id:"misi & hadiah", de:"Quests & Belohnungen", ja:"クエストと報酬", tr:"görevler ve ödüller", ko:"퀘스트와 보상", fa:"ماموریت‌ها و جوایز", uk:"квести й нагороди", it:"missioni e premi", pl:"zadania i nagrody", vi:"nhiệm vụ & thưởng" },
  scrolldown: { en:"▼ SCROLL", zh:"▼ 向下滚动", hi:"▼ स्क्रॉल", es:"▼ DESLIZA", ar:"▼ مرّر", fr:"▼ DÉFILER", bn:"▼ স্ক্রোল", pt:"▼ DESLIZA", ru:"▼ ВНИЗ", ur:"▼ اسکرول", id:"▼ GULIR", de:"▼ SCROLLEN", ja:"▼ スクロール", tr:"▼ KAYDIR", ko:"▼ 스크롤", fa:"▼ اسکرول", uk:"▼ ГОРТАЙ", it:"▼ SCORRI", pl:"▼ PRZEWIŃ", vi:"▼ CUỘN" },
  background: { en:"Background", zh:"背景", hi:"बैकग्राउंड", es:"Fondo", ar:"الخلفية", fr:"Arrière-plan", bn:"ব্যাকগ্রাউন্ড", pt:"Fundo", ru:"Фон", ur:"پس منظر", id:"Latar", de:"Hintergrund", ja:"背景", tr:"Arka Plan", ko:"배경", fa:"پس‌زمینه", uk:"Тло", it:"Sfondo", pl:"Tło", vi:"Nền" },
  language: { en:"Language", zh:"语言", hi:"भाषा", es:"Idioma", ar:"اللغة", fr:"Langue", bn:"ভাষা", pt:"Idioma", ru:"Язык", ur:"زبان", id:"Bahasa", de:"Sprache", ja:"言語", tr:"Dil", ko:"언어", fa:"زبان", uk:"Мова", it:"Lingua", pl:"Język", vi:"Ngôn ngữ" },
  welcome: { en:"Welcome to NovaClip!", zh:"欢迎来到 NovaClip！", hi:"NovaClip में आपका स्वागत है!", es:"¡Bienvenido a NovaClip!", ar:"مرحبًا بك في NovaClip!", fr:"Bienvenue sur NovaClip !", bn:"NovaClip-এ স্বাগতম!", pt:"Bem-vindo ao NovaClip!", ru:"Добро пожаловать в NovaClip!", ur:"NovaClip میں خوش آمدید!", id:"Selamat datang di NovaClip!", de:"Willkommen bei NovaClip!", ja:"NovaClipへようこそ！", tr:"NovaClip'e hoş geldin!", ko:"NovaClip에 오신 것을 환영합니다!", fa:"به NovaClip خوش آمدید!", uk:"Ласкаво просимо до NovaClip!", it:"Benvenuto su NovaClip!", pl:"Witamy w NovaClip!", vi:"Chào mừng đến với NovaClip!" },
  card_ai: { en:"NovaClip AI", zh:"NovaClip 智能", hi:"NovaClip एआई", es:"IA NovaClip", ar:"ذكاء NovaClip", fr:"IA NovaClip", bn:"NovaClip এআই", pt:"IA NovaClip", ru:"ИИ NovaClip", ur:"NovaClip اے آئی", id:"AI NovaClip", de:"NovaClip KI", ja:"NovaClip AI", tr:"NovaClip YZ", ko:"NovaClip AI", fa:"هوش مصنوعی NovaClip", uk:"ШІ NovaClip", it:"IA NovaClip", pl:"AI NovaClip", vi:"AI NovaClip" },
  card_ai_d: { en:"Three tutors — YouTube, Space and Business — answer in your language, tuned for teen creators.", zh:"三位导师——YouTube、太空和商业——用你的语言回答，为青少年创作者定制。", hi:"तीन ट्यूटर — YouTube, स्पेस और बिज़नेस — आपकी भाषा में जवाब देते हैं।", es:"Tres tutores — YouTube, Espacio y Negocios — responden en tu idioma, hechos para creadores jóvenes.", ar:"ثلاثة معلمين — يوتيوب والفضاء والأعمال — يجيبون بلغتك، مصمّمون للمبدعين الشباب.", fr:"Trois tuteurs — YouTube, Espace et Business — répondent dans ta langue, pensés pour les jeunes créateurs.", bn:"তিনজন টিউটর — YouTube, স্পেস ও বিজনেস — আপনার ভাষায় উত্তর দেয়।", pt:"Três tutores — YouTube, Espaço e Negócios — respondem na tua língua, feitos para jovens criadores.", ru:"Три наставника — YouTube, космос и бизнес — отвечают на твоём языке.", ur:"تین ٹیوٹر — یوٹیوب، خلا اور کاروبار — آپ کی زبان میں جواب دیتے ہیں۔", id:"Tiga tutor — YouTube, Luar Angkasa, dan Bisnis — menjawab dalam bahasamu.", de:"Drei Tutoren — YouTube, Weltraum und Business — antworten in deiner Sprache, gemacht für junge Creator.", ja:"3人のチューター — YouTube・宇宙・ビジネス — があなたの言語で答えます。", tr:"Üç eğitmen — YouTube, Uzay ve İş — senin dilinde cevap verir.", ko:"세 명의 튜터 — YouTube, 우주, 비즈니스 — 가 당신의 언어로 답합니다.", fa:"سه مربی — یوتیوب، فضا و کسب‌وکار — به زبان شما پاسخ می‌دهند.", uk:"Три наставники — YouTube, космос і бізнес — відповідають твоєю мовою.", it:"Tre tutor — YouTube, Spazio e Business — rispondono nella tua lingua.", pl:"Trzech tutorów — YouTube, Kosmos i Biznes — odpowiada w Twoim języku.", vi:"Ba gia sư — YouTube, Vũ trụ và Kinh doanh — trả lời bằng ngôn ngữ của bạn." },
  card_duel: { en:"Channel Duels", zh:"频道对决", hi:"चैनल ड्यूल", es:"Duelos de Canales", ar:"مبارزات القنوات", fr:"Duels de Chaînes", bn:"চ্যানেল ডুয়েল", pt:"Duelos de Canais", ru:"Дуэли каналов", ur:"چینل ڈوئل", id:"Duel Kanal", de:"Kanal-Duelle", ja:"チャンネル対決", tr:"Kanal Düelloları", ko:"채널 대결", fa:"دوئل کانال‌ها", uk:"Дуелі каналів", it:"Duelli tra Canali", pl:"Pojedynki Kanałów", vi:"Đấu Kênh" },
  card_duel_d: { en:"Battle channels within 20k subs of you. Subs and views decide the winner — win and bank points.", zh:"挑战与你相差2万订阅以内的频道。订阅和播放量决定胜负——获胜赚积分。", hi:"अपने से 20k सब्स के अंदर के चैनलों से लड़ें। जीतें और पॉइंट कमाएँ।", es:"Lucha contra canales a menos de 20k subs de ti. Gana y suma puntos.", ar:"نافس قنوات ضمن 20 ألف مشترك منك. اربح واجمع النقاط.", fr:"Affronte des chaînes à moins de 20k abonnés de toi. Gagne et empoche des points.", bn:"আপনার থেকে ২০ হাজার সাবের মধ্যে চ্যানেলের সাথে লড়ুন। জিতুন, পয়েন্ট নিন।", pt:"Batalha canais até 20k subs de diferença. Ganha e acumula pontos.", ru:"Сражайся с каналами в пределах 20 тыс. подписчиков. Побеждай и получай очки.", ur:"اپنے سے 20 ہزار سبس کے اندر چینلز سے مقابلہ کریں۔ جیتیں اور پوائنٹس کمائیں۔", id:"Lawan kanal dalam selisih 20k subs. Menang dan kumpulkan poin.", de:"Kämpfe gegen Kanäle mit max. 20k Abo-Abstand. Gewinne und sammle Punkte.", ja:"登録者差2万以内のチャンネルと対決。勝ってポイント獲得。", tr:"Senden en fazla 20k abone farkı olan kanallarla savaş. Kazan, puan topla.", ko:"당신과 2만 구독자 이내의 채널과 대결하세요. 이기고 포인트를 받으세요.", fa:"با کانال‌های تا ۲۰ هزار مشترک اختلاف مبارزه کن. ببر و امتیاز بگیر.", uk:"Бийся з каналами в межах 20 тис. підписників. Перемагай і збирай бали.", it:"Sfida canali entro 20k iscritti da te. Vinci e accumula punti.", pl:"Walcz z kanałami w granicach 20 tys. subów. Wygrywaj i zbieraj punkty.", vi:"Đấu với các kênh chênh lệch dưới 20k sub. Thắng và nhận điểm." },
  card_ana: { en:"Analytics", zh:"数据分析", hi:"एनालिटिक्स", es:"Analíticas", ar:"التحليلات", fr:"Analytique", bn:"অ্যানালিটিক্স", pt:"Análises", ru:"Аналитика", ur:"تجزیات", id:"Analitik", de:"Analysen", ja:"分析", tr:"Analizler", ko:"분석", fa:"تحلیل‌ها", uk:"Аналітика", it:"Analisi", pl:"Analityka", vi:"Phân tích" },
  card_ana_d: { en:"Your stats, best videos, and closest rivals — at a glance.", zh:"你的数据、最佳视频和最接近的对手，一目了然。", hi:"आपके आँकड़े, बेस्ट वीडियो और करीबी राइवल — एक नज़र में।", es:"Tus estadísticas, mejores vídeos y rivales más cercanos — de un vistazo.", ar:"إحصاءاتك وأفضل فيديوهاتك وأقرب منافسيك — بنظرة واحدة.", fr:"Tes stats, tes meilleures vidéos et tes rivaux les plus proches — en un clin d’œil.", bn:"আপনার পরিসংখ্যান, সেরা ভিডিও ও নিকটতম প্রতিদ্বন্দ্বী — এক নজরে।", pt:"As tuas estatísticas, melhores vídeos e rivais mais próximos — num relance.", ru:"Твоя статистика, лучшие видео и ближайшие соперники — с первого взгляда.", ur:"آپ کے اعداد و شمار، بہترین ویڈیوز اور قریبی حریف — ایک نظر میں۔", id:"Statistikmu, video terbaik, dan rival terdekat — sekilas.", de:"Deine Statistiken, besten Videos und nächsten Rivalen — auf einen Blick.", ja:"あなたの統計、ベスト動画、最接近のライバルを一目で。", tr:"İstatistiklerin, en iyi videoların ve en yakın rakiplerin — bir bakışta.", ko:"내 통계, 최고의 영상, 가장 가까운 라이벌 — 한눈에.", fa:"آمار تو، بهترین ویدیوها و نزدیک‌ترین رقبا — در یک نگاه.", uk:"Твоя статистика, найкращі відео та найближчі суперники — з першого погляду.", it:"Le tue statistiche, i migliori video e i rivali più vicini — a colpo d’occhio.", pl:"Twoje statystyki, najlepsze filmy i najbliżsi rywale — w mgnieniu oka.", vi:"Số liệu, video hay nhất và đối thủ gần nhất — trong nháy mắt." },
  card_quest: { en:"Rewards and Achievements", zh:"奖励与成就", hi:"रिवॉर्ड और अचीवमेंट", es:"Recompensas y Logros", ar:"الجوائز والإنجازات", fr:"Récompenses et Succès", bn:"পুরস্কার ও অর্জন", pt:"Recompensas e Conquistas", ru:"Награды и достижения", ur:"انعامات اور کامیابیاں", id:"Hadiah dan Pencapaian", de:"Belohnungen und Erfolge", ja:"リワードと実績", tr:"Ödüller ve Başarılar", ko:"보상과 업적", fa:"جوایز و دستاوردها", uk:"Нагороди та досягнення", it:"Ricompense e Obiettivi", pl:"Nagrody i Osiągnięcia", vi:"Phần thưởng và Thành tựu" },
  card_quest_d: { en:"Every action earns points. Hit the milestones, unlock free NovaClip Pro time.", zh:"每个操作都能赚积分。达到里程碑，解锁免费 NovaClip Pro。", hi:"हर एक्शन से पॉइंट मिलते हैं। माइलस्टोन पूरे करें, फ्री Pro पाएं।", es:"Cada acción suma puntos. Alcanza las metas y desbloquea NovaClip Pro gratis.", ar:"كل إجراء يكسبك نقاطًا. حقق الأهداف وافتح NovaClip Pro مجانًا.", fr:"Chaque action rapporte des points. Atteins les paliers, débloque du Pro gratuit.", bn:"প্রতিটি কাজে পয়েন্ট। মাইলস্টোন ছুঁয়ে ফ্রি Pro আনলক করুন।", pt:"Cada ação dá pontos. Atinge as metas e desbloqueia NovaClip Pro grátis.", ru:"Каждое действие даёт очки. Достигай целей — открывай бесплатный Pro.", ur:"ہر عمل پوائنٹس دیتا ہے۔ سنگ میل عبور کریں، مفت Pro کھولیں۔", id:"Setiap aksi menghasilkan poin. Capai target, buka Pro gratis.", de:"Jede Aktion bringt Punkte. Erreiche die Meilensteine, schalte gratis Pro frei.", ja:"行動すればポイント。マイルストーン達成で無料Proを解放。", tr:"Her eylem puan kazandırır. Hedeflere ulaş, ücretsiz Pro aç.", ko:"모든 행동이 포인트가 됩니다. 목표를 달성하고 무료 Pro를 열어보세요.", fa:"هر اقدامی امتیاز می‌دهد. به نقاط عطف برس و Pro رایگان باز کن.", uk:"Кожна дія дає бали. Досягай цілей — відкривай безплатний Pro.", it:"Ogni azione dà punti. Raggiungi i traguardi, sblocca Pro gratis.", pl:"Każda akcja daje punkty. Osiągaj cele, odblokuj darmowe Pro.", vi:"Mỗi hành động đều có điểm. Đạt mốc, mở khóa Pro miễn phí." },
  footer: { en:"Classic app with quizzes and streaks", zh:"带测验和连胜的经典应用", hi:"क्विज़ और स्ट्रीक वाला क्लासिक ऐप", es:"App clásica con quizzes y rachas", ar:"التطبيق الكلاسيكي مع الاختبارات", fr:"App classique avec quiz et séries", bn:"কুইজ ও স্ট্রিক সহ ক্লাসিক অ্যাপ", pt:"App clássica com quizzes e sequências", ru:"Классическое приложение с квизами", ur:"کوئز اور سٹریکس والی کلاسک ایپ", id:"Aplikasi klasik dengan kuis", de:"Klassische App mit Quiz und Serien", ja:"クイズと連続記録のクラシック版", tr:"Quiz ve serilerle klasik uygulama", ko:"퀴즈와 스트릭이 있는 클래식 앱", fa:"اپ کلاسیک با آزمون‌ها", uk:"Класичний застосунок із квізами", it:"App classica con quiz e serie", pl:"Klasyczna apka z quizami", vi:"Ứng dụng cổ điển với quiz" },
  signin: { en:"Sign in with Google", zh:"使用 Google 登录", hi:"Google से साइन इन करें", es:"Iniciar sesión con Google", ar:"تسجيل الدخول بجوجل", fr:"Se connecter avec Google", bn:"Google দিয়ে সাইন ইন", pt:"Entrar com Google", ru:"Войти через Google", ur:"گوگل سے سائن ان کریں", id:"Masuk dengan Google", de:"Mit Google anmelden", ja:"Googleでログイン", tr:"Google ile giriş yap", ko:"Google로 로그인", fa:"ورود با گوگل", uk:"Увійти через Google", it:"Accedi con Google", pl:"Zaloguj przez Google", vi:"Đăng nhập bằng Google" },
  signout: { en:"Sign out", zh:"退出登录", hi:"साइन आउट", es:"Cerrar sesión", ar:"تسجيل الخروج", fr:"Se déconnecter", bn:"সাইন আউট", pt:"Terminar sessão", ru:"Выйти", ur:"سائن آؤٹ", id:"Keluar", de:"Abmelden", ja:"ログアウト", tr:"Çıkış yap", ko:"로그아웃", fa:"خروج", uk:"Вийти", it:"Esci", pl:"Wyloguj", vi:"Đăng xuất" },
  t_stats: { en:"My analytics", zh:"我的数据", hi:"मेरी एनालिटिक्स", es:"Mis analíticas", ar:"تحليلاتي", fr:"Mes analytiques", bn:"আমার অ্যানালিটিক্স", pt:"As minhas análises", ru:"Моя аналитика", ur:"میرے تجزیات", id:"Analitik saya", de:"Meine Analysen", ja:"マイ分析", tr:"Analizlerim", ko:"내 분석", fa:"تحلیل‌های من", uk:"Моя аналітика", it:"Le mie analisi", pl:"Moja analityka", vi:"Phân tích của tôi" },
  t_comp: { en:"Closest competitors", zh:"最接近的对手", hi:"करीबी प्रतिद्वंद्वी", es:"Competidores cercanos", ar:"أقرب المنافسين", fr:"Concurrents proches", bn:"নিকটতম প্রতিযোগী", pt:"Concorrentes próximos", ru:"Ближайшие соперники", ur:"قریبی حریف", id:"Pesaing terdekat", de:"Nächste Konkurrenten", ja:"最接近のライバル", tr:"En yakın rakipler", ko:"가장 가까운 경쟁자", fa:"نزدیک‌ترین رقبا", uk:"Найближчі суперники", it:"Concorrenti più vicini", pl:"Najbliżsi rywale", vi:"Đối thủ gần nhất" },
  t_duel: { en:"Duel a channel", zh:"频道对决", hi:"चैनल से ड्यूल", es:"Duelo con un canal", ar:"نازل قناة", fr:"Défier une chaîne", bn:"চ্যানেল ডুয়েল", pt:"Desafiar um canal", ru:"Дуэль с каналом", ur:"چینل سے ڈوئل", id:"Duel dengan kanal", de:"Kanal herausfordern", ja:"チャンネル対決", tr:"Bir kanalla düello", ko:"채널과 대결", fa:"دوئل با یک کانال", uk:"Дуель із каналом", it:"Sfida un canale", pl:"Pojedynek z kanałem", vi:"Đấu với một kênh" },
  t_trend: { en:"Trending topics", zh:"热门话题", hi:"ट्रेंडिंग टॉपिक्स", es:"Temas en tendencia", ar:"المواضيع الرائجة", fr:"Sujets tendance", bn:"ট্রেন্ডিং টপিক", pt:"Tópicos em tendência", ru:"В тренде", ur:"ٹرینڈنگ موضوعات", id:"Topik tren", de:"Trend-Themen", ja:"トレンドの話題", tr:"Trend konular", ko:"인기 주제", fa:"موضوعات پرطرفدار", uk:"У тренді", it:"Argomenti di tendenza", pl:"Popularne tematy", vi:"Chủ đề thịnh hành" },
  studio_h: { en:"NovaClip Studio", zh:"NovaClip 工作室", hi:"NovaClip स्टूडियो", es:"Estudio NovaClip", ar:"استوديو NovaClip", fr:"Studio NovaClip", bn:"NovaClip স্টুডিও", pt:"Estúdio NovaClip", ru:"Студия NovaClip", ur:"NovaClip اسٹوڈیو", id:"Studio NovaClip", de:"NovaClip Studio", ja:"NovaClipスタジオ", tr:"NovaClip Stüdyo", ko:"NovaClip 스튜디오", fa:"استودیو NovaClip", uk:"Студія NovaClip", it:"Studio NovaClip", pl:"Studio NovaClip", vi:"Studio NovaClip" },
  hero_line1: { en:"Run your <b class=\"n\">channel</b>", zh:"<b class=\"n\">频道</b>像游戏一样运营", hi:"अपना <b class=\"n\">चैनल</b> चलाएँ", es:"Gestiona tu <b class=\"n\">canal</b>", ar:"أدر <b class=\"n\">قناتك</b>", fr:"Gérez votre <b class=\"n\">chaîne</b>", bn:"আপনার <b class=\"n\">চ্যানেল</b> চালান", pt:"Gere o seu <b class=\"n\">canal</b>", ru:"Веди свой <b class=\"n\">канал</b>", ur:"اپنا <b class=\"n\">چینل</b> چلائیں", id:"Kelola <b class=\"n\">channel</b> Anda", de:"Führe deinen <b class=\"n\">Kanal</b>", ja:"<b class=\"n\">チャンネル</b>を運営しよう", tr:"<b class=\"n\">Kanalını</b> yönet", ko:"<b class=\"n\">채널</b>을 운영하세요", fa:"<b class=\"n\">کانال</b> خود را اداره کنید", uk:"Веди свій <b class=\"n\">канал</b>", it:"Gestisci il tuo <b class=\"n\">canale</b>", pl:"Prowadź swój <b class=\"n\">kanał</b>", vi:"Quản lý <b class=\"n\">kênh</b> của bạn" },
  hero_line2: { en:"like a <b class=\"m\">game.</b>", zh:"就像玩<b class=\"m\">游戏</b>。", hi:"एक <b class=\"m\">गेम</b> की तरह।", es:"como un <b class=\"m\">juego.</b>", ar:"مثل <b class=\"m\">لعبة.</b>", fr:"comme un <b class=\"m\">jeu.</b>", bn:"একটি <b class=\"m\">গেমের</b> মতো।", pt:"como um <b class=\"m\">jogo.</b>", ru:"как <b class=\"m\">игру.</b>", ur:"ایک <b class=\"m\">گیم</b> کی طرح۔", id:"seperti <b class=\"m\">game.</b>", de:"wie ein <b class=\"m\">Spiel.</b>", ja:"<b class=\"m\">ゲーム</b>のように。", tr:"bir <b class=\"m\">oyun</b> gibi.", ko:"<b class=\"m\">게임</b>처럼.", fa:"مثل یک <b class=\"m\">بازی.</b>", uk:"як <b class=\"m\">гру.</b>", it:"come un <b class=\"m\">gioco.</b>", pl:"jak <b class=\"m\">grę.</b>", vi:"như một <b class=\"m\">trò chơi.</b>" },
  sec1_tag: { en:"LEARN & BUILD", zh:"学习与构建", hi:"सीखें और बनाएँ", es:"APRENDE Y CREA", ar:"تعلّم وابنِ", fr:"APPRENDRE & CRÉER", bn:"শিখুন ও গড়ুন", pt:"APRENDA E CRIE", ru:"УЧИСЬ И СОЗДАВАЙ", ur:"سیکھیں اور بنائیں", id:"BELAJAR & BANGUN", de:"LERNEN & BAUEN", ja:"学び、作る", tr:"ÖĞREN & OLUŞTUR", ko:"배우고 만들기", fa:"یاد بگیر و بساز", uk:"ВЧИСЬ І СТВОРЮЙ", it:"IMPARA E CREA", pl:"UCZ SIĘ I TWÓRZ", vi:"HỌC & XÂY DỰNG" },
  sec1_h1: { en:"Smart", zh:"智能", hi:"स्मार्ट", es:"Inteligente", ar:"ذكي", fr:"Intelligent", bn:"স্মার্ট", pt:"Inteligente", ru:"Умный", ur:"سمارٹ", id:"Cerdas", de:"Intelligentes", ja:"スマート", tr:"Akıllı", ko:"스마트", fa:"هوشمند", uk:"Розумний", it:"Intelligente", pl:"Inteligentny", vi:"Thông minh" },
  sec1_h2: { en:"Coaching", zh:"指导", hi:"कोचिंग", es:"Entrenamiento", ar:"تدريب", fr:"Coaching", bn:"কোচিং", pt:"Treino", ru:"Наставничество", ur:"کوچنگ", id:"Pelatihan", de:"Coaching", ja:"コーチング", tr:"Koçluk", ko:"코칭", fa:"مربی‌گری", uk:"Наставництво", it:"Coaching", pl:"Coaching", vi:"Huấn luyện" },
  sec2_tag: { en:"FIGHT FAIR", zh:"公平竞争", hi:"निष्पक्ष मुकाबला", es:"LUCHA JUSTA", ar:"منافسة عادلة", fr:"COMBAT ÉQUITABLE", bn:"ন্যায্য লড়াই", pt:"LUTA JUSTA", ru:"ЧЕСТНЫЙ БОЙ", ur:"منصفانہ مقابلہ", id:"ADU ADIL", de:"FAIRER KAMPF", ja:"フェアな戦い", tr:"ADİL MÜCADELE", ko:"공정한 대결", fa:"مبارزه منصفانه", uk:"ЧЕСНИЙ БІЙ", it:"LOTTA LEALE", pl:"UCZCIWA WALKA", vi:"ĐẤU CÔNG BẰNG" },
  sec2_h1: { en:"Fair", zh:"公平", hi:"निष्पक्ष", es:"Justas", ar:"عادلة", fr:"Équitables", bn:"ন্যায্য", pt:"Justas", ru:"Честные", ur:"منصفانہ", id:"Adil", de:"Faire", ja:"フェアな", tr:"Adil", ko:"공정한", fa:"منصفانه", uk:"Чесні", it:"Leali", pl:"Uczciwe", vi:"Công bằng" },
  sec2_h2: { en:"Fights", zh:"对决", hi:"मुकाबले", es:"Peleas", ar:"معارك", fr:"Combats", bn:"লড়াই", pt:"Lutas", ru:"Бои", ur:"مقابلے", id:"Pertarungan", de:"Kämpfe", ja:"対決", tr:"Mücadeleler", ko:"대결", fa:"مبارزه‌ها", uk:"Бої", it:"Sfide", pl:"Walki", vi:"Trận đấu" },
  coach1: { en:"Channel Coach", zh:"频道教练", hi:"चैनल कोच", es:"Coach de canal", ar:"مدرب القناة", fr:"Coach de chaîne", bn:"চ্যানেল কোচ", pt:"Treinador de canal", ru:"Тренер канала", ur:"چینل کوچ", id:"Pelatih channel", de:"Kanal-Coach", ja:"チャンネルコーチ", tr:"Kanal koçu", ko:"채널 코치", fa:"مربی کانال", uk:"Тренер каналу", it:"Coach del canale", pl:"Trener kanału", vi:"Huấn luyện viên kênh" },
  coach2: { en:"Space Tutor", zh:"太空导师", hi:"अंतरिक्ष ट्यूटर", es:"Tutor espacial", ar:"معلّم الفضاء", fr:"Tuteur spatial", bn:"স্পেস টিউটর", pt:"Tutor espacial", ru:"Космический наставник", ur:"خلائی ٹیوٹر", id:"Tutor antariksa", de:"Weltraum-Tutor", ja:"宇宙チューター", tr:"Uzay eğitmeni", ko:"우주 튜터", fa:"مربی فضا", uk:"Космічний наставник", it:"Tutor spaziale", pl:"Korepetytor kosmosu", vi:"Gia sư vũ trụ" },
  coach3: { en:"Money Tutor", zh:"理财导师", hi:"मनी ट्यूटर", es:"Tutor de dinero", ar:"معلّم المال", fr:"Tuteur finances", bn:"মানি টিউটর", pt:"Tutor de dinheiro", ru:"Финансовый наставник", ur:"منی ٹیوٹر", id:"Tutor keuangan", de:"Finanz-Tutor", ja:"マネーチューター", tr:"Para eğitmeni", ko:"머니 튜터", fa:"مربی مالی", uk:"Фінансовий наставник", it:"Tutor finanziario", pl:"Korepetytor finansów", vi:"Gia sư tài chính" },
  coach1d: { en:"Titles, hooks, growth that actually works", zh:"标题、钩子和真正有效的增长", hi:"टाइटल, हुक और असली ग्रोथ", es:"Títulos, ganchos y crecimiento real", ar:"عناوين وجذب ونمو حقيقي", fr:"Titres, accroches et croissance réelle", bn:"টাইটেল, হুক ও প্রকৃত গ্রোথ", pt:"Títulos, ganchos e crescimento real", ru:"Заголовки, хуки и реальный рост", ur:"ٹائٹل، ہکس اور اصل گروتھ", id:"Judul, hook, dan pertumbuhan nyata", de:"Titel, Hooks und echtes Wachstum", ja:"タイトル・フック・実際に伸びる方法", tr:"Başlıklar, kancalar ve gerçek büyüme", ko:"제목, 후킹, 진짜 성장", fa:"عنوان، قلاب و رشد واقعی", uk:"Заголовки, гачки та реальне зростання", it:"Titoli, hook e crescita reale", pl:"Tytuły, haczyki i realny wzrost", vi:"Tiêu đề, mồi câu và tăng trưởng thật" },
  coach2d: { en:"Turn curiosity into content people watch", zh:"把好奇心变成有人看的内容", hi:"जिज्ञासा को देखने लायक कंटेंट बनाएँ", es:"Convierte la curiosidad en contenido", ar:"حوّل الفضول إلى محتوى يُشاهد", fr:"Transformez la curiosité en contenu", bn:"কৌতূহলকে দর্শনীয় কনটেন্টে বদলান", pt:"Transforme curiosidade em conteúdo", ru:"Преврати любопытство в контент", ur:"تجسس کو دیکھنے لائق مواد بنائیں", id:"Ubah rasa ingin tahu jadi konten", de:"Neugier in sehenswerte Inhalte verwandeln", ja:"好奇心を見られる動画に", tr:"Merakı izlenen içeriğe dönüştür", ko:"호기심을 볼만한 콘텐츠로", fa:"کنجکاوی را به محتوا تبدیل کن", uk:"Перетвори цікавість на контент", it:"Trasforma la curiosità in contenuti", pl:"Zamień ciekawość w treści", vi:"Biến tò mò thành nội dung" },
  coach3d: { en:"Side hustles and smart moves, explained simply", zh:"副业与聪明理财，简单讲解", hi:"साइड हसल और स्मार्ट मूव्स, आसान भाषा में", es:"Ingresos extra explicados simple", ar:"مشاريع جانبية بشرح بسيط", fr:"Revenus complémentaires expliqués simplement", bn:"সাইড হাসল ও স্মার্ট মুভ, সহজ ভাষায়", pt:"Rendas extra explicadas de forma simples", ru:"Подработки и умные шаги, просто", ur:"سائیڈ ہسل اور سمارٹ اقدامات، آسان", id:"Sampingan dan langkah cerdas, sederhana", de:"Nebenverdienste einfach erklärt", ja:"副業とお金の知恵をわかりやすく", tr:"Ek gelir ve akıllı adımlar, basitçe", ko:"부업과 현명한 선택, 쉽게", fa:"کسب درآمد جانبی، ساده", uk:"Підробітки та розумні кроки, просто", it:"Entrate extra spiegate semplicemente", pl:"Dodatkowe dochody, prosto", vi:"Nghề tay trái, giải thích đơn giản" },
  vs_you: { en:"YOU", zh:"你", hi:"आप", es:"TÚ", ar:"أنت", fr:"VOUS", bn:"আপনি", pt:"VOCÊ", ru:"ТЫ", ur:"آپ", id:"ANDA", de:"DU", ja:"あなた", tr:"SEN", ko:"당신", fa:"شما", uk:"ТИ", it:"TU", pl:"TY", vi:"BẠN" },
  vs_rival: { en:"RIVAL", zh:"对手", hi:"प्रतिद्वंद्वी", es:"RIVAL", ar:"منافس", fr:"RIVAL", bn:"প্রতিদ্বন্দ্বী", pt:"RIVAL", ru:"СОПЕРНИК", ur:"حریف", id:"SAINGAN", de:"RIVALE", ja:"ライバル", tr:"RAKİP", ko:"라이벌", fa:"رقیب", uk:"СУПЕРНИК", it:"RIVALE", pl:"RYWAL", vi:"ĐỐI THỦ" },
  e_media: { en:"Media", zh:"媒体", hi:"मीडिया", es:"Medios", ar:"الوسائط", fr:"Médias", bn:"মিডিয়া", pt:"Média", ru:"Медиа", ur:"میڈیا", id:"Media", de:"Medien", ja:"メディア", tr:"Medya", ko:"미디어", fa:"رسانه", uk:"Медіа", it:"Media", pl:"Media", vi:"Phương tiện" },
  e_effects: { en:"Effects", zh:"特效", hi:"प्रभाव", es:"Efectos", ar:"التأثيرات", fr:"Effets", bn:"ইফেক্ট", pt:"Efeitos", ru:"Эффекты", ur:"ایفیکٹس", id:"Efek", de:"Effekte", ja:"エフェクト", tr:"Efektler", ko:"효과", fa:"جلوه‌ها", uk:"Ефекти", it:"Effetti", pl:"Efekty", vi:"Hiệu ứng" },
  e_audio: { en:"Audio", zh:"音频", hi:"ऑडियो", es:"Audio", ar:"الصوت", fr:"Audio", bn:"অডিও", pt:"Áudio", ru:"Аудио", ur:"آڈیو", id:"Audio", de:"Audio", ja:"オーディオ", tr:"Ses", ko:"오디오", fa:"صدا", uk:"Аудіо", it:"Audio", pl:"Dźwięk", vi:"Âm thanh" },
  e_memes: { en:"Memes", zh:"表情包", hi:"मीम", es:"Memes", ar:"ميمز", fr:"Mèmes", bn:"মিম", pt:"Memes", ru:"Мемы", ur:"میمز", id:"Meme", de:"Memes", ja:"ミーム", tr:"Meme", ko:"밈", fa:"میم", uk:"Меми", it:"Meme", pl:"Memy", vi:"Meme" },
  e_text: { en:"Text", zh:"文字", hi:"टेक्स्ट", es:"Texto", ar:"النص", fr:"Texte", bn:"টেক্সট", pt:"Texto", ru:"Текст", ur:"متن", id:"Teks", de:"Text", ja:"テキスト", tr:"Metin", ko:"텍스트", fa:"متن", uk:"Текст", it:"Testo", pl:"Tekst", vi:"Văn bản" },
  e_voice: { en:"Voice", zh:"配音", hi:"आवाज़", es:"Voz", ar:"الصوت", fr:"Voix", bn:"ভয়েস", pt:"Voz", ru:"Голос", ur:"آواز", id:"Suara", de:"Stimme", ja:"音声", tr:"Ses", ko:"음성", fa:"صدا", uk:"Голос", it:"Voce", pl:"Głos", vi:"Giọng nói" },
  e_import: { en:"⊕ Import media", zh:"⊕ 导入媒体", hi:"⊕ मीडिया आयात करें", es:"⊕ Importar medios", ar:"⊕ استيراد الوسائط", fr:"⊕ Importer des médias", bn:"⊕ মিডিয়া ইমপোর্ট", pt:"⊕ Importar média", ru:"⊕ Импорт медиа", ur:"⊕ میڈیا درآمد", id:"⊕ Impor media", de:"⊕ Medien importieren", ja:"⊕ メディアを読み込む", tr:"⊕ Medya içe aktar", ko:"⊕ 미디어 가져오기", fa:"⊕ وارد کردن رسانه", uk:"⊕ Імпорт медіа", it:"⊕ Importa media", pl:"⊕ Importuj media", vi:"⊕ Nhập phương tiện" },
  e_effects_h: { en:"Effects & filters", zh:"特效与滤镜", hi:"प्रभाव और फ़िल्टर", es:"Efectos y filtros", ar:"التأثيرات والفلاتر", fr:"Effets et filtres", bn:"ইফেক্ট ও ফিল্টার", pt:"Efeitos e filtros", ru:"Эффекты и фильтры", ur:"ایفیکٹس اور فلٹرز", id:"Efek & filter", de:"Effekte & Filter", ja:"エフェクトとフィルター", tr:"Efektler ve filtreler", ko:"효과 및 필터", fa:"جلوه‌ها و فیلترها", uk:"Ефекти та фільтри", it:"Effetti e filtri", pl:"Efekty i filtry", vi:"Hiệu ứng & bộ lọc" },
  e_memes_h: { en:"Meme search", zh:"表情包搜索", hi:"मीम खोज", es:"Buscar memes", ar:"بحث الميمز", fr:"Recherche de mèmes", bn:"মিম সার্চ", pt:"Pesquisa de memes", ru:"Поиск мемов", ur:"میم تلاش", id:"Cari meme", de:"Meme-Suche", ja:"ミーム検索", tr:"Meme arama", ko:"밈 검색", fa:"جستجوی میم", uk:"Пошук мемів", it:"Ricerca meme", pl:"Szukaj memów", vi:"Tìm meme" },
  e_text_h: { en:"Text overlay", zh:"文字叠加", hi:"टेक्स्ट ओवरले", es:"Superposición de texto", ar:"تراكب النص", fr:"Superposition de texte", bn:"টেক্সট ওভারলে", pt:"Sobreposição de texto", ru:"Наложение текста", ur:"ٹیکسٹ اوورلے", id:"Overlay teks", de:"Text-Overlay", ja:"テキストオーバーレイ", tr:"Metin katmanı", ko:"텍스트 오버레이", fa:"لایه متن", uk:"Накладення тексту", it:"Sovrapposizione testo", pl:"Nakładka tekstowa", vi:"Lớp văn bản" },
  e_voice_h: { en:"AI voiceover", zh:"AI 配音", hi:"AI वॉयसओवर", es:"Voz en off IA", ar:"تعليق صوتي بالذكاء الاصطناعي", fr:"Voix off IA", bn:"এআই ভয়েসওভার", pt:"Narração de IA", ru:"ИИ озвучка", ur:"اے آئی وائس اوور", id:"Sulih suara AI", de:"KI-Sprachausgabe", ja:"AIナレーション", tr:"AI seslendirme", ko:"AI 보이스오버", fa:"صداگذاری هوش مصنوعی", uk:"ШІ озвучення", it:"Voce fuori campo IA", pl:"Lektor AI", vi:"Lồng tiếng AI" },
  e_clip_h: { en:"Selected clip", zh:"已选片段", hi:"चयनित क्लिप", es:"Clip seleccionado", ar:"المقطع المحدد", fr:"Clip sélectionné", bn:"নির্বাচিত ক্লিপ", pt:"Clipe selecionado", ru:"Выбранный клип", ur:"منتخب کلپ", id:"Klip terpilih", de:"Ausgewählter Clip", ja:"選択中のクリップ", tr:"Seçili klip", ko:"선택한 클립", fa:"کلیپ انتخابی", uk:"Вибраний кліп", it:"Clip selezionata", pl:"Wybrany klip", vi:"Clip đã chọn" },
  e_filter: { en:"Filter", zh:"滤镜", hi:"फ़िल्टर", es:"Filtro", ar:"فلتر", fr:"Filtre", bn:"ফিল্টার", pt:"Filtro", ru:"Фильтр", ur:"فلٹر", id:"Filter", de:"Filter", ja:"フィルター", tr:"Filtre", ko:"필터", fa:"فیلتر", uk:"Фільтр", it:"Filtro", pl:"Filtr", vi:"Bộ lọc" },
  e_trans: { en:"Transition in", zh:"入场转场", hi:"ट्रांज़िशन इन", es:"Transición de entrada", ar:"انتقال الدخول", fr:"Transition d’entrée", bn:"ট্রানজিশন", pt:"Transição de entrada", ru:"Переход на входе", ur:"ٹرانزیشن", id:"Transisi masuk", de:"Übergang", ja:"切り替え", tr:"Geçiş", ko:"전환", fa:"ترنزیشن ورود", uk:"Перехід", it:"Transizione", pl:"Przejście", vi:"Chuyển cảnh" },
  e_export: { en:"Export", zh:"导出", hi:"निर्यात", es:"Exportar", ar:"تصدير", fr:"Exporter", bn:"এক্সপোর্ট", pt:"Exportar", ru:"Экспорт", ur:"برآمد", id:"Ekspor", de:"Exportieren", ja:"書き出し", tr:"Dışa aktar", ko:"내보내기", fa:"خروجی", uk:"Експорт", it:"Esporta", pl:"Eksportuj", vi:"Xuất" },
  analytics: { en:"Analytics", zh:"分析", hi:"एनालिटिक्स", es:"Analíticas", ar:"التحليلات", fr:"Analytique", bn:"অ্যানালিটিক্স", pt:"Análises", ru:"Аналитика", ur:"تجزیات", id:"Analitik", de:"Analysen", ja:"分析", tr:"Analizler", ko:"분석", fa:"تحلیل‌ها", uk:"Аналітика", it:"Analisi", pl:"Analityka", vi:"Phân tích" },
  analytics_h: { en:"Analytics", zh:"分析", hi:"एनालिटिक्स", es:"Analíticas", ar:"التحليلات", fr:"Analytique", bn:"অ্যানালিটিক্স", pt:"Análises", ru:"Аналитика", ur:"تجزیات", id:"Analitik", de:"Analysen", ja:"分析", tr:"Analizler", ko:"분석", fa:"تحلیل‌ها", uk:"Аналітика", it:"Analisi", pl:"Analityka", vi:"Phân tích" },
  analytics_sub: { en:"Deep charts comparing your channel to your closest rivals.", zh:"将你的频道与最接近的对手进行深入图表对比。", hi:"अपने चैनल की तुलना करीबी प्रतिद्वंद्वियों से करें।", es:"Gráficos detallados comparando tu canal con tus rivales más cercanos.", ar:"رسوم بيانية معمّقة تقارن قناتك بأقرب منافسيك.", fr:"Des graphiques détaillés comparant ta chaîne à tes rivaux les plus proches.", bn:"আপনার চ্যানেলকে নিকটতম প্রতিদ্বন্দ্বীদের সাথে তুলনা করুন।", pt:"Gráficos detalhados a comparar o teu canal com os rivais mais próximos.", ru:"Подробные графики сравнения твоего канала с ближайшими соперниками.", ur:"اپنے چینل کا قریبی حریفوں سے تفصیلی موازنہ۔", id:"Grafik mendalam membandingkan kanalmu dengan rival terdekat.", de:"Detaillierte Diagramme, die deinen Kanal mit den nächsten Rivalen vergleichen.", ja:"あなたのチャンネルを最接近のライバルと比較する詳細なグラフ。", tr:"Kanalını en yakın rakiplerinle karşılaştıran ayrıntılı grafikler.", ko:"내 채널을 가장 가까운 라이벌과 비교하는 심층 차트.", fa:"نمودارهای عمیق برای مقایسه کانال شما با نزدیک‌ترین رقبا.", uk:"Детальні графіки порівняння твого каналу з найближчими суперниками.", it:"Grafici dettagliati che confrontano il tuo canale con i rivali più vicini.", pl:"Szczegółowe wykresy porównujące Twój kanał z najbliższymi rywalami.", vi:"Biểu đồ chi tiết so sánh kênh của bạn với đối thủ gần nhất." },
  analytics_hint: { en:"Connect your channel to load your analytics.", zh:"连接你的频道以加载分析数据。", hi:"अपना चैनल कनेक्ट करें।", es:"Conecta tu canal para cargar tus analíticas.", ar:"اربط قناتك لتحميل التحليلات.", fr:"Connecte ta chaîne pour charger tes analyses.", bn:"অ্যানালিটিক্স লোড করতে চ্যানেল সংযুক্ত করুন।", pt:"Liga o teu canal para carregar as análises.", ru:"Подключи канал, чтобы загрузить аналитику.", ur:"تجزیات لوڈ کرنے کے لیے چینل جوڑیں۔", id:"Hubungkan kanalmu untuk memuat analitik.", de:"Verbinde deinen Kanal, um die Analysen zu laden.", ja:"分析を読み込むにはチャンネルを接続してください。", tr:"Analizleri yüklemek için kanalını bağla.", ko:"분석을 불러오려면 채널을 연결하세요.", fa:"برای بارگذاری تحلیل‌ها کانالت را وصل کن.", uk:"Підключи канал, щоб завантажити аналітику.", it:"Collega il tuo canale per caricare le analisi.", pl:"Połącz kanał, aby wczytać analitykę.", vi:"Kết nối kênh để tải phân tích." },
  studio_sub: { en:"Connect your channel and scout the competition.", zh:"连接频道，侦察竞争对手。", hi:"अपना चैनल कनेक्ट करें और प्रतियोगिता देखें।", es:"Conecta tu canal y explora la competencia.", ar:"اربط قناتك واستكشف المنافسة.", fr:"Connecte ta chaîne et observe la concurrence.", bn:"চ্যানেল যুক্ত করুন ও প্রতিযোগিতা দেখুন।", pt:"Liga o teu canal e observa a concorrência.", ru:"Подключи канал и изучи конкурентов.", ur:"اپنا چینل جوڑیں اور مقابلہ دیکھیں۔", id:"Hubungkan kanal dan intai pesaing.", de:"Verbinde deinen Kanal und beobachte die Konkurrenz.", ja:"チャンネルを接続して競合を偵察。", tr:"Kanalını bağla ve rakipleri incele.", ko:"채널을 연결하고 경쟁자를 살펴보세요.", fa:"کانالت را وصل کن و رقبا را بررسی کن.", uk:"Підключи канал і вивчай конкурентів.", it:"Collega il canale e studia la concorrenza.", pl:"Połącz kanał i obserwuj konkurencję.", vi:"Kết nối kênh và do thám đối thủ." },
  t_comp_d: { en:"Channels closest to your size — full stats and links.", zh:"与你规模最接近的频道——完整数据和链接。", hi:"आपके आकार के करीबी चैनल — पूरे आँकड़े।", es:"Canales de tu tamaño — estadísticas completas.", ar:"قنوات بحجمك — إحصاءات كاملة.", fr:"Chaînes de ta taille — stats complètes.", bn:"আপনার আকারের চ্যানেল — সম্পূর্ণ পরিসংখ্যান।", pt:"Canais do teu tamanho — estatísticas completas.", ru:"Каналы твоего размера — полная статистика.", ur:"آپ کے سائز کے چینلز — مکمل اعداد و شمار۔", id:"Kanal seukuranmu — statistik lengkap.", de:"Kanäle deiner Größe — volle Statistiken.", ja:"あなたと同規模のチャンネル — 完全な統計。", tr:"Senin boyutundaki kanallar — tam istatistik.", ko:"내 규모에 가까운 채널 — 전체 통계.", fa:"کانال‌های هم‌اندازه تو — آمار کامل.", uk:"Канали твого розміру — повна статистика.", it:"Canali della tua taglia — statistiche complete.", pl:"Kanały Twojej wielkości — pełne statystyki.", vi:"Kênh cỡ bạn — thống kê đầy đủ." },
  t_duel_d: { en:"Challenge a channel within 20k subs and win points.", zh:"挑战2万订阅内的频道并赢积分。", hi:"20k सब्स के भीतर चैनल को चुनौती दें।", es:"Reta a un canal en 20k subs y gana puntos.", ar:"تحدَّ قناة ضمن 20 ألف مشترك واربح نقاطًا.", fr:"Défie une chaîne à 20k abonnés et gagne des points.", bn:"২০ হাজার সাবের চ্যানেলকে চ্যালেঞ্জ করুন।", pt:"Desafia um canal até 20k subs e ganha pontos.", ru:"Брось вызов каналу в пределах 20 тыс. и получи очки.", ur:"20 ہزار سبس کے چینل کو چیلنج کریں۔", id:"Tantang kanal dalam 20k subs, menangkan poin.", de:"Fordere einen Kanal bis 20k Abos heraus.", ja:"2万登録以内のチャンネルに挑戦してポイント獲得。", tr:"20k abone içindeki kanala meydan oku.", ko:"2만 구독 이내 채널에 도전해 포인트 획득.", fa:"کانالی تا ۲۰ هزار مشترک را به چالش بکش.", uk:"Кинь виклик каналу в межах 20 тис. і вигравай бали.", it:"Sfida un canale entro 20k iscritti e vinci punti.", pl:"Rzuć wyzwanie kanałowi do 20 tys. subów.", vi:"Thách đấu kênh trong 20k sub và thắng điểm." },
  t_trend_d: { en:"See what is blowing up on YouTube right now.", zh:"看看 YouTube 上正在爆火的内容。", hi:"देखें YouTube पर अभी क्या वायरल है।", es:"Mira qué está explotando en YouTube ahora.", ar:"شاهد ما ينتشر على يوتيوب الآن.", fr:"Vois ce qui explose sur YouTube maintenant.", bn:"এখন YouTube-এ কী ভাইরাল দেখুন।", pt:"Vê o que está a bombar no YouTube agora.", ru:"Смотри, что взрывается на YouTube сейчас.", ur:"دیکھیں یوٹیوب پر ابھی کیا وائرل ہے۔", id:"Lihat apa yang viral di YouTube sekarang.", de:"Sieh, was gerade auf YouTube explodiert.", ja:"今YouTubeでバズっているものを見る。", tr:"Şu an YouTube'da patlayanı gör.", ko:"지금 유튜브에서 뜨는 것을 확인하세요.", fa:"ببین الان چه چیزی در یوتیوب می‌ترکد.", uk:"Дивись, що зараз вибухає на YouTube.", it:"Guarda cosa sta esplodendo su YouTube ora.", pl:"Zobacz, co teraz podbija YouTube.", vi:"Xem gì đang bùng nổ trên YouTube." },
  t_analytics: { en:"Full analytics", zh:"完整分析", hi:"पूर्ण एनालिटिक्स", es:"Analíticas completas", ar:"تحليلات كاملة", fr:"Analyse complète", bn:"সম্পূর্ণ অ্যানালিটিক্স", pt:"Análises completas", ru:"Полная аналитика", ur:"مکمل تجزیات", id:"Analitik lengkap", de:"Volle Analysen", ja:"完全な分析", tr:"Tam analiz", ko:"전체 분석", fa:"تحلیل کامل", uk:"Повна аналітика", it:"Analisi complete", pl:"Pełna analityka", vi:"Phân tích đầy đủ" },
  t_analytics_d: { en:"Deep charts comparing you to rivals — on its own page.", zh:"深入图表对比对手——独立页面。", hi:"प्रतिद्वंद्वियों से गहन तुलना।", es:"Gráficos profundos vs. rivales.", ar:"رسوم معمّقة مقابل المنافسين.", fr:"Graphiques détaillés vs rivaux.", bn:"প্রতিদ্বন্দ্বীদের সাথে গভীর তুলনা।", pt:"Gráficos detalhados vs. rivais.", ru:"Подробные графики против соперников.", ur:"حریفوں سے گہرا موازنہ۔", id:"Grafik mendalam vs rival.", de:"Detaillierte Diagramme vs. Rivalen.", ja:"ライバルとの詳細比較。", tr:"Rakiplerle derin karşılaştırma.", ko:"라이벌과 심층 비교.", fa:"مقایسه عمیق با رقبا.", uk:"Глибокі графіки проти суперників.", it:"Grafici dettagliati vs rivali.", pl:"Szczegółowe wykresy vs rywale.", vi:"Biểu đồ sâu so với đối thủ." },
  compare: { en:"Compare with 2 competitors", zh:"与2个对手对比", hi:"2 प्रतिद्वंद्वियों से तुलना", es:"Comparar con 2 competidores", ar:"قارن مع منافسين اثنين", fr:"Comparer avec 2 concurrents", bn:"২ প্রতিযোগীর সাথে তুলনা", pt:"Comparar com 2 concorrentes", ru:"Сравнить с 2 соперниками", ur:"2 حریفوں سے موازنہ", id:"Bandingkan dengan 2 pesaing", de:"Mit 2 Konkurrenten vergleichen", ja:"ライバル2人と比較", tr:"2 rakiple karşılaştır", ko:"경쟁자 2명과 비교", fa:"مقایسه با ۲ رقیب", uk:"Порівняти з 2 суперниками", it:"Confronta con 2 concorrenti", pl:"Porównaj z 2 rywalami", vi:"So sánh với 2 đối thủ" },
  duel_label: { en:"Views and subs duel (max 20k subs difference)", zh:"播放与订阅对决（最多相差2万订阅）", hi:"व्यूज़ और सब्स ड्यूल (अधिकतम 20k अंतर)", es:"Duelo de vistas y subs (máx. 20k de diferencia)", ar:"مبارزة المشاهدات والمشتركين (فرق 20 ألف كحد أقصى)", fr:"Duel vues et abonnés (écart max 20k)", bn:"ভিউ ও সাব ডুয়েল (সর্বোচ্চ ২০ হাজার পার্থক্য)", pt:"Duelo de views e subs (máx. 20k de diferença)", ru:"Дуэль просмотров и подписчиков (макс. 20 тыс. разницы)", ur:"ویوز اور سبس ڈوئل (زیادہ سے زیادہ 20 ہزار فرق)", id:"Duel views dan subs (selisih maks 20k)", de:"Views- und Abo-Duell (max. 20k Unterschied)", ja:"再生数と登録者の対決（差2万まで）", tr:"İzlenme ve abone düellosu (en fazla 20k fark)", ko:"조회수·구독자 대결 (최대 2만 차이)", fa:"دوئل بازدید و مشترک (حداکثر ۲۰ هزار اختلاف)", uk:"Дуель переглядів і підписників (макс. 20 тис.)", it:"Duello di views e iscritti (max 20k di differenza)", pl:"Pojedynek wyświetleń i subów (maks. 20 tys. różnicy)", vi:"Đấu lượt xem và sub (chênh tối đa 20k)" },
  opp_ph: { en:"Opponent channel name...", zh:"对手频道名称...", hi:"विरोधी चैनल का नाम...", es:"Nombre del canal rival...", ar:"اسم قناة الخصم...", fr:"Nom de la chaîne adverse...", bn:"প্রতিপক্ষ চ্যানেলের নাম...", pt:"Nome do canal adversário...", ru:"Название канала соперника...", ur:"مخالف چینل کا نام...", id:"Nama kanal lawan...", de:"Name des Gegner-Kanals...", ja:"相手チャンネル名...", tr:"Rakip kanal adı...", ko:"상대 채널 이름...", fa:"نام کانال حریف...", uk:"Назва каналу суперника...", it:"Nome del canale avversario...", pl:"Nazwa kanału rywala...", vi:"Tên kênh đối thủ..." },
  fight: { en:"Fight!", zh:"开战！", hi:"लड़ो!", es:"¡Pelea!", ar:"قاتِل!", fr:"Combat !", bn:"লড়াই!", pt:"Lutar!", ru:"В бой!", ur:"لڑو!", id:"Lawan!", de:"Kämpfen!", ja:"対戦！", tr:"Savaş!", ko:"대결!", fa:"مبارزه!", uk:"У бій!", it:"Combatti!", pl:"Walcz!", vi:"Chiến!" },
  ai_h: { en:"NovaClip AI", zh:"NovaClip 智能", hi:"NovaClip एआई", es:"IA NovaClip", ar:"ذكاء NovaClip", fr:"IA NovaClip", bn:"NovaClip এআই", pt:"IA NovaClip", ru:"ИИ NovaClip", ur:"NovaClip اے آئی", id:"AI NovaClip", de:"NovaClip KI", ja:"NovaClip AI", tr:"NovaClip YZ", ko:"NovaClip AI", fa:"هوش مصنوعی NovaClip", uk:"ШІ NovaClip", it:"IA NovaClip", pl:"AI NovaClip", vi:"AI NovaClip" },
  /* ===== PROGRESS PAGE ===== */
  progress: { en:"Progress", zh:"进度", hi:"प्रगति", es:"Progreso", ar:"التقدّم", fr:"Progression", bn:"অগ্রগতি", pt:"Progresso", ru:"Прогресс", ur:"پیش رفت", id:"Progres", de:"Fortschritt", ja:"進捗", tr:"İlerleme", ko:"진행도", fa:"پیشرفت", uk:"Прогрес", it:"Progressi", pl:"Postęp", vi:"Tiến độ" },
  prog_h: { en:"Your progress", zh:"你的进度", hi:"आपकी प्रगति", es:"Tu progreso", ar:"تقدّمك", fr:"Ta progression", bn:"আপনার অগ্রগতি", pt:"O teu progresso", ru:"Твой прогресс", ur:"آپ کی پیش رفت", id:"Progresmu", de:"Dein Fortschritt", ja:"あなたの進捗", tr:"İlerlemen", ko:"내 진행도", fa:"پیشرفت تو", uk:"Твій прогрес", it:"I tuoi progressi", pl:"Twój postęp", vi:"Tiến độ của bạn" },
  prog_sub: { en:"Everything you have earned in one place — points, rewards, achievements, the skills that count towards a certificate, and your AI chat history.", zh:"你赚到的一切都在这里——积分、奖励、成就、计入证书的技能，以及你的 AI 聊天记录。", hi:"आपकी सारी कमाई एक जगह — पॉइंट, रिवॉर्ड, अचीवमेंट, सर्टिफिकेट में गिने जाने वाले स्किल, और एआई चैट हिस्ट्री।", es:"Todo lo que has ganado en un solo sitio: puntos, recompensas, logros, las habilidades que cuentan para un certificado y tu historial de chat con la IA.", ar:"كل ما كسبته في مكان واحد — النقاط والجوائز والإنجازات والمهارات التي تُحتسب للشهادة وسجل محادثاتك مع الذكاء الاصطناعي.", fr:"Tout ce que tu as gagné au même endroit : points, récompenses, succès, les compétences qui comptent pour un certificat et ton historique de chat avec l'IA.", bn:"আপনার সব অর্জন এক জায়গায় — পয়েন্ট, পুরস্কার, অ্যাচিভমেন্ট, সার্টিফিকেটে গণ্য দক্ষতা এবং এআই চ্যাট ইতিহাস।", pt:"Tudo o que ganhaste num só sítio — pontos, recompensas, conquistas, as competências que contam para um certificado e o teu histórico de conversas com a IA.", ru:"Всё заработанное в одном месте — очки, награды, достижения, навыки, которые идут в зачёт сертификата, и история чатов с ИИ.", ur:"آپ کی تمام کمائی ایک جگہ — پوائنٹس، انعامات، کامیابیاں، سرٹیفکیٹ میں شمار ہونے والی مہارتیں، اور اے آئی چیٹ ہسٹری۔", id:"Semua yang kamu dapat dalam satu tempat — poin, hadiah, pencapaian, keterampilan yang dihitung untuk sertifikat, dan riwayat obrolan AI-mu.", de:"Alles Erreichte an einem Ort — Punkte, Belohnungen, Erfolge, die für ein Zertifikat zählenden Fähigkeiten und dein KI-Chatverlauf.", ja:"獲得したすべてをここに — ポイント、リワード、実績、証明書に加算されるスキル、そしてAIとの会話履歴。", tr:"Kazandığın her şey tek yerde — puanlar, ödüller, başarılar, sertifikaya sayılan beceriler ve YZ sohbet geçmişin.", ko:"획득한 모든 것을 한곳에 — 포인트, 보상, 업적, 수료증에 반영되는 스킬, 그리고 AI 대화 기록.", fa:"هرچه به دست آورده‌ای یک‌جا — امتیازها، جوایز، دستاوردها، مهارت‌هایی که برای گواهی حساب می‌شوند، و تاریخچه گفتگوهایت با هوش مصنوعی.", uk:"Усе зароблене в одному місці — бали, нагороди, досягнення, навички, що зараховуються до сертифіката, та історія чатів зі ШІ.", it:"Tutto ciò che hai guadagnato in un unico posto: punti, premi, obiettivi, le competenze che contano per un certificato e la cronologia delle chat con l'IA.", pl:"Wszystko, co zdobyłeś, w jednym miejscu — punkty, nagrody, osiągnięcia, umiejętności liczące się do certyfikatu i historia rozmów z AI.", vi:"Mọi thứ bạn đạt được ở một nơi — điểm, phần thưởng, thành tựu, các kỹ năng tính vào chứng chỉ, và lịch sử trò chuyện với AI." },
  prog_rewards_d: { en:"Free NovaClip Pro time, unlocked by points.", zh:"用积分解锁的免费 NovaClip Pro 时长。", hi:"पॉइंट से अनलॉक होने वाला मुफ़्त NovaClip Pro समय।", es:"Tiempo gratis de NovaClip Pro, desbloqueado con puntos.", ar:"وقت مجاني من NovaClip Pro يُفتح بالنقاط.", fr:"Du temps NovaClip Pro gratuit, débloqué avec des points.", bn:"পয়েন্ট দিয়ে আনলক হওয়া ফ্রি NovaClip Pro সময়।", pt:"Tempo grátis de NovaClip Pro, desbloqueado com pontos.", ru:"Бесплатное время NovaClip Pro за очки.", ur:"پوائنٹس سے کھلنے والا مفت NovaClip Pro وقت۔", id:"Waktu NovaClip Pro gratis, dibuka dengan poin.", de:"Kostenlose NovaClip-Pro-Zeit, mit Punkten freigeschaltet.", ja:"ポイントで解放される無料のNovaClip Pro期間。", tr:"Puanlarla açılan ücretsiz NovaClip Pro süresi.", ko:"포인트로 잠금 해제하는 무료 NovaClip Pro 이용 기간.", fa:"زمان رایگان NovaClip Pro که با امتیاز باز می‌شود.", uk:"Безплатний час NovaClip Pro, який відкривають бали.", it:"Tempo gratis di NovaClip Pro, sbloccato con i punti.", pl:"Darmowy czas NovaClip Pro odblokowywany punktami.", vi:"Thời gian NovaClip Pro miễn phí, mở khóa bằng điểm." },
  prog_ach_d: { en:"Milestones you have passed.", zh:"你已达成的里程碑。", hi:"आपने पार किए माइलस्टोन।", es:"Hitos que ya has superado.", ar:"محطات تجاوزتها.", fr:"Les paliers que tu as franchis.", bn:"আপনি যেসব মাইলফলক পেরিয়েছেন।", pt:"Marcos que já ultrapassaste.", ru:"Пройденные вехи.", ur:"وہ سنگ میل جو آپ عبور کر چکے ہیں۔", id:"Tonggak yang sudah kamu lewati.", de:"Meilensteine, die du erreicht hast.", ja:"達成したマイルストーン。", tr:"Geçtiğin kilometre taşları.", ko:"지나온 마일스톤.", fa:"نقاط عطفی که رد کرده‌ای.", uk:"Пройдені віхи.", it:"I traguardi che hai superato.", pl:"Osiągnięte kamienie milowe.", vi:"Những cột mốc bạn đã vượt qua." },
  prog_skills: { en:"Certificate skills", zh:"证书技能", hi:"सर्टिफिकेट स्किल", es:"Habilidades del certificado", ar:"مهارات الشهادة", fr:"Compétences du certificat", bn:"সার্টিফিকেট দক্ষতা", pt:"Competências do certificado", ru:"Навыки для сертификата", ur:"سرٹیفکیٹ مہارتیں", id:"Keterampilan sertifikat", de:"Zertifikats-Fähigkeiten", ja:"証明書スキル", tr:"Sertifika becerileri", ko:"수료증 스킬", fa:"مهارت‌های گواهی", uk:"Навички для сертифіката", it:"Competenze del certificato", pl:"Umiejętności do certyfikatu", vi:"Kỹ năng chứng chỉ" },
  prog_skills_d: { en:"Hands-on work counts towards a NovaClip Creator Certificate. Points alone are not enough — these are the reps.", zh:"实际操作才计入 NovaClip 创作者证书。光有积分不够——这些才是真正的练习量。", hi:"असली काम ही NovaClip क्रिएटर सर्टिफिकेट में गिना जाता है। सिर्फ पॉइंट काफी नहीं — ये असली अभ्यास हैं।", es:"El trabajo práctico cuenta para el Certificado de Creador NovaClip. Los puntos por sí solos no bastan: estas son las repeticiones.", ar:"العمل التطبيقي هو ما يُحتسب لشهادة صانع NovaClip. النقاط وحدها لا تكفي — هذه هي التمارين الفعلية.", fr:"Le travail concret compte pour le Certificat Créateur NovaClip. Les points seuls ne suffisent pas : voici les répétitions.", bn:"হাতে-কলমে কাজই NovaClip ক্রিয়েটর সার্টিফিকেটে গণ্য হয়। শুধু পয়েন্ট যথেষ্ট নয় — এগুলোই আসল অনুশীলন।", pt:"O trabalho prático conta para o Certificado de Criador NovaClip. Só pontos não chega — estas são as repetições.", ru:"К сертификату создателя NovaClip идёт практическая работа. Одних очков мало — вот реальные повторения.", ur:"عملی کام ہی NovaClip کریئٹر سرٹیفکیٹ میں شمار ہوتا ہے۔ صرف پوائنٹس کافی نہیں — یہ اصل مشقیں ہیں۔", id:"Kerja nyata yang dihitung untuk Sertifikat Kreator NovaClip. Poin saja tidak cukup — ini repetisinya.", de:"Praktische Arbeit zählt für das NovaClip-Creator-Zertifikat. Punkte allein reichen nicht — das hier sind die Wiederholungen.", ja:"実際の作業がNovaClipクリエイター証明書に加算されます。ポイントだけでは足りません。これが実践量です。", tr:"NovaClip Yaratıcı Sertifikası için pratik iş sayılır. Sadece puan yetmez — asıl tekrarlar bunlar.", ko:"실제 작업이 NovaClip 크리에이터 수료증에 반영됩니다. 포인트만으로는 부족합니다 — 이것이 실전 횟수입니다.", fa:"کار عملی است که برای گواهی سازنده NovaClip حساب می‌شود. فقط امتیاز کافی نیست — این‌ها تمرین‌های واقعی‌اند.", uk:"До сертифіката творця NovaClip зараховується практична робота. Самих балів замало — ось реальні повторення.", it:"Il lavoro pratico conta per il Certificato Creator NovaClip. I punti da soli non bastano: queste sono le ripetizioni.", pl:"Do Certyfikatu Twórcy NovaClip liczy się praktyka. Same punkty nie wystarczą — oto powtórzenia.", vi:"Công việc thực tế mới tính vào Chứng chỉ Nhà sáng tạo NovaClip. Chỉ điểm thôi là chưa đủ — đây mới là số lần thực hành." },
  prog_hist_d: { en:"Your recent questions to the AI tutors.", zh:"你最近向 AI 导师提出的问题。", hi:"एआई ट्यूटर से आपके हाल के सवाल।", es:"Tus preguntas recientes a los tutores de IA.", ar:"أسئلتك الأخيرة لمدرّسي الذكاء الاصطناعي.", fr:"Tes questions récentes aux tuteurs IA.", bn:"এআই টিউটরদের কাছে আপনার সাম্প্রতিক প্রশ্ন।", pt:"As tuas perguntas recentes aos tutores de IA.", ru:"Твои недавние вопросы ИИ-наставникам.", ur:"اے آئی ٹیوٹرز سے آپ کے حالیہ سوالات۔", id:"Pertanyaan terbaru kamu ke tutor AI.", de:"Deine letzten Fragen an die KI-Tutoren.", ja:"AIチューターへの最近の質問。", tr:"YZ eğitmenlerine son sorduklarınız.", ko:"AI 튜터에게 한 최근 질문.", fa:"پرسش‌های اخیر تو از مربی‌های هوش مصنوعی.", uk:"Твої нещодавні запитання ШІ-наставникам.", it:"Le tue domande recenti ai tutor IA.", pl:"Twoje ostatnie pytania do korepetytorów AI.", vi:"Các câu hỏi gần đây của bạn cho gia sư AI." },

  /* ===== HOME PAGE: ticker, play & earn, stats, closing block, vibe switch ===== */
  ticker: { en:"<b>AI TUTORS</b> · <i>VIDEO EDITOR</i> · <u>CHANNEL DUELS</u> · <b>TREND RADAR</b> · <i>GAMES</i> · <u>ANALYTICS</u> · <b>REWARDS</b> · ", zh:"<b>AI 导师</b> · <i>视频编辑器</i> · <u>频道对决</u> · <b>趋势雷达</b> · <i>游戏</i> · <u>数据分析</u> · <b>奖励</b> · ", hi:"<b>एआई ट्यूटर</b> · <i>वीडियो एडिटर</i> · <u>चैनल ड्यूल</u> · <b>ट्रेंड रडार</b> · <i>गेम्स</i> · <u>एनालिटिक्स</u> · <b>रिवॉर्ड</b> · ", es:"<b>TUTORES IA</b> · <i>EDITOR DE VÍDEO</i> · <u>DUELOS DE CANALES</u> · <b>RADAR DE TENDENCIAS</b> · <i>JUEGOS</i> · <u>ANALÍTICAS</u> · <b>RECOMPENSAS</b> · ", ar:"<b>مدرّسو الذكاء الاصطناعي</b> · <i>محرّر الفيديو</i> · <u>مبارزات القنوات</u> · <b>رادار الاتجاهات</b> · <i>الألعاب</i> · <u>التحليلات</u> · <b>الجوائز</b> · ", fr:"<b>TUTEURS IA</b> · <i>ÉDITEUR VIDÉO</i> · <u>DUELS DE CHAÎNES</u> · <b>RADAR DE TENDANCES</b> · <i>JEUX</i> · <u>ANALYSES</u> · <b>RÉCOMPENSES</b> · ", bn:"<b>এআই টিউটর</b> · <i>ভিডিও এডিটর</i> · <u>চ্যানেল ডুয়েল</u> · <b>ট্রেন্ড রাডার</b> · <i>গেমস</i> · <u>অ্যানালিটিক্স</u> · <b>পুরস্কার</b> · ", pt:"<b>TUTORES IA</b> · <i>EDITOR DE VÍDEO</i> · <u>DUELOS DE CANAIS</u> · <b>RADAR DE TENDÊNCIAS</b> · <i>JOGOS</i> · <u>ANÁLISES</u> · <b>RECOMPENSAS</b> · ", ru:"<b>ИИ-НАСТАВНИКИ</b> · <i>ВИДЕОРЕДАКТОР</i> · <u>ДУЭЛИ КАНАЛОВ</u> · <b>РАДАР ТРЕНДОВ</b> · <i>ИГРЫ</i> · <u>АНАЛИТИКА</u> · <b>НАГРАДЫ</b> · ", ur:"<b>اے آئی ٹیوٹرز</b> · <i>ویڈیو ایڈیٹر</i> · <u>چینل ڈوئل</u> · <b>ٹرینڈ ریڈار</b> · <i>گیمز</i> · <u>اینالیٹکس</u> · <b>انعامات</b> · ", id:"<b>TUTOR AI</b> · <i>EDITOR VIDEO</i> · <u>DUEL KANAL</u> · <b>RADAR TREN</b> · <i>GIM</i> · <u>ANALITIK</u> · <b>HADIAH</b> · ", de:"<b>KI-TUTOREN</b> · <i>VIDEO-EDITOR</i> · <u>KANAL-DUELLE</u> · <b>TREND-RADAR</b> · <i>SPIELE</i> · <u>ANALYSEN</u> · <b>BELOHNUNGEN</b> · ", ja:"<b>AIチューター</b> · <i>動画エディター</i> · <u>チャンネル対決</u> · <b>トレンドレーダー</b> · <i>ゲーム</i> · <u>アナリティクス</u> · <b>リワード</b> · ", tr:"<b>YZ EĞİTMENLERİ</b> · <i>VİDEO EDİTÖRÜ</i> · <u>KANAL DÜELLOSU</u> · <b>TREND RADARI</b> · <i>OYUNLAR</i> · <u>ANALİTİK</u> · <b>ÖDÜLLER</b> · ", ko:"<b>AI 튜터</b> · <i>영상 편집기</i> · <u>채널 대결</u> · <b>트렌드 레이더</b> · <i>게임</i> · <u>애널리틱스</u> · <b>보상</b> · ", fa:"<b>مربی‌های هوش مصنوعی</b> · <i>ویرایشگر ویدیو</i> · <u>دوئل کانال‌ها</u> · <b>رادار ترند</b> · <i>بازی‌ها</i> · <u>تحلیل‌ها</u> · <b>جوایز</b> · ", uk:"<b>ШІ-НАСТАВНИКИ</b> · <i>ВІДЕОРЕДАКТОР</i> · <u>ДУЕЛІ КАНАЛІВ</u> · <b>РАДАР ТРЕНДІВ</b> · <i>ІГРИ</i> · <u>АНАЛІТИКА</u> · <b>НАГОРОДИ</b> · ", it:"<b>TUTOR IA</b> · <i>EDITOR VIDEO</i> · <u>DUELLI TRA CANALI</u> · <b>RADAR TENDENZE</b> · <i>GIOCHI</i> · <u>ANALISI</u> · <b>PREMI</b> · ", pl:"<b>KOREPETYTORZY AI</b> · <i>EDYTOR WIDEO</i> · <u>POJEDYNKI KANAŁÓW</u> · <b>RADAR TRENDÓW</b> · <i>GRY</i> · <u>ANALITYKA</u> · <b>NAGRODY</b> · ", vi:"<b>GIA SƯ AI</b> · <i>TRÌNH SỬA VIDEO</i> · <u>ĐẤU KÊNH</u> · <b>RADAR XU HƯỚNG</b> · <i>TRÒ CHƠI</i> · <u>PHÂN TÍCH</u> · <b>PHẦN THƯỞNG</b> · " },
  sec_play: { en:"03 — Play & earn", zh:"03 — 边玩边赚", hi:"03 — खेलें और कमाएँ", es:"03 — Juega y gana", ar:"٠٣ — العب واكسب", fr:"03 — Joue et gagne", bn:"০৩ — খেলুন ও অর্জন করুন", pt:"03 — Joga e ganha", ru:"03 — Играй и зарабатывай", ur:"03 — کھیلیں اور کمائیں", id:"03 — Main dan dapatkan", de:"03 — Spielen & verdienen", ja:"03 — 遊んで稼ぐ", tr:"03 — Oyna ve kazan", ko:"03 — 플레이하고 획득하기", fa:"۰۳ — بازی کن و امتیاز بگیر", uk:"03 — Грай і заробляй", it:"03 — Gioca e guadagna", pl:"03 — Graj i zarabiaj", vi:"03 — Chơi và nhận thưởng" },
  play_h: { en:"Every action<span class='thin'>earns.</span>", zh:"每个动作<span class='thin'>都有回报。</span>", hi:"हर एक्शन<span class='thin'>कमाता है।</span>", es:"Cada acción<span class='thin'>suma.</span>", ar:"كل إجراء<span class='thin'>يكسبك.</span>", fr:"Chaque action<span class='thin'>rapporte.</span>", bn:"প্রতিটি কাজ<span class='thin'>পয়েন্ট দেয়।</span>", pt:"Cada ação<span class='thin'>rende.</span>", ru:"Каждое действие<span class='thin'>приносит очки.</span>", ur:"ہر عمل<span class='thin'>کماتا ہے۔</span>", id:"Setiap aksi<span class='thin'>menghasilkan.</span>", de:"Jede Aktion<span class='thin'>zählt.</span>", ja:"すべての行動が<span class='thin'>報われる。</span>", tr:"Her eylem<span class='thin'>kazandırır.</span>", ko:"모든 행동이<span class='thin'>보상이 됩니다.</span>", fa:"هر اقدامی<span class='thin'>امتیاز می‌دهد.</span>", uk:"Кожна дія<span class='thin'>приносить бали.</span>", it:"Ogni azione<span class='thin'>rende.</span>", pl:"Każda akcja<span class='thin'>się liczy.</span>", vi:"Mọi hành động<span class='thin'>đều có thưởng.</span>" },
  xp_progress: { en:"YOUR PROGRESS", zh:"你的进度", hi:"आपकी प्रगति", es:"TU PROGRESO", ar:"تقدّمك", fr:"TA PROGRESSION", bn:"আপনার অগ্রগতি", pt:"O TEU PROGRESSO", ru:"ТВОЙ ПРОГРЕСС", ur:"آپ کی پیش رفت", id:"PROGRESMU", de:"DEIN FORTSCHRITT", ja:"あなたの進捗", tr:"İLERLEMEN", ko:"내 진행도", fa:"پیشرفت تو", uk:"ТВІЙ ПРОГРЕС", it:"I TUOI PROGRESSI", pl:"TWÓJ POSTĘP", vi:"TIẾN ĐỘ CỦA BẠN" },
  rw1_t: { en:"1 day of NovaClip Pro", zh:"NovaClip Pro 1 天", hi:"NovaClip Pro का 1 दिन", es:"1 día de NovaClip Pro", ar:"يوم واحد من NovaClip Pro", fr:"1 jour de NovaClip Pro", bn:"NovaClip Pro-এর ১ দিন", pt:"1 dia de NovaClip Pro", ru:"1 день NovaClip Pro", ur:"NovaClip Pro کا 1 دن", id:"1 hari NovaClip Pro", de:"1 Tag NovaClip Pro", ja:"NovaClip Pro 1日", tr:"1 gün NovaClip Pro", ko:"NovaClip Pro 1일", fa:"۱ روز NovaClip Pro", uk:"1 день NovaClip Pro", it:"1 giorno di NovaClip Pro", pl:"1 dzień NovaClip Pro", vi:"1 ngày NovaClip Pro" },
  rw1_d: { en:"Your first unlock — one quest away.", zh:"你的第一个解锁——只差一个任务。", hi:"आपका पहला अनलॉक — बस एक क्वेस्ट दूर।", es:"Tu primer desbloqueo: a una misión de distancia.", ar:"أول فتح لك — على بُعد مهمة واحدة.", fr:"Ton premier déblocage — à une quête près.", bn:"আপনার প্রথম আনলক — মাত্র একটি কোয়েস্ট দূরে।", pt:"O teu primeiro desbloqueio — a uma missão de distância.", ru:"Твоя первая награда — всего один квест.", ur:"آپ کا پہلا انلاک — صرف ایک کوئسٹ دور۔", id:"Buka kunci pertamamu — tinggal satu misi.", de:"Deine erste Freischaltung — nur eine Quest entfernt.", ja:"最初の解放まであとクエスト1つ。", tr:"İlk kilidin — tek bir görev uzakta.", ko:"첫 잠금 해제 — 퀘스트 하나만 더.", fa:"اولین قفل‌گشایی‌ات — فقط یک ماموریت مانده.", uk:"Твоя перша нагорода — лише один квест.", it:"Il tuo primo sblocco — a una missione di distanza.", pl:"Twoje pierwsze odblokowanie — jedno zadanie dalej.", vi:"Mở khóa đầu tiên — chỉ còn một nhiệm vụ." },
  rw2_t: { en:"1 week of Pro", zh:"Pro 1 周", hi:"Pro का 1 सप्ताह", es:"1 semana de Pro", ar:"أسبوع واحد من Pro", fr:"1 semaine de Pro", bn:"Pro-এর ১ সপ্তাহ", pt:"1 semana de Pro", ru:"1 неделя Pro", ur:"Pro کا 1 ہفتہ", id:"1 minggu Pro", de:"1 Woche Pro", ja:"Pro 1週間", tr:"1 hafta Pro", ko:"Pro 1주", fa:"۱ هفته Pro", uk:"1 тиждень Pro", it:"1 settimana di Pro", pl:"1 tydzień Pro", vi:"1 tuần Pro" },
  rw2_d: { en:"Editor exports, priority AI.", zh:"编辑器导出，优先 AI。", hi:"एडिटर एक्सपोर्ट, प्रायोरिटी एआई।", es:"Exportaciones del editor, IA prioritaria.", ar:"تصدير من المحرّر وذكاء اصطناعي بأولوية.", fr:"Exports de l'éditeur, IA prioritaire.", bn:"এডিটর এক্সপোর্ট, অগ্রাধিকার এআই।", pt:"Exportações do editor, IA prioritária.", ru:"Экспорт из редактора, приоритетный ИИ.", ur:"ایڈیٹر ایکسپورٹ، ترجیحی اے آئی۔", id:"Ekspor editor, AI prioritas.", de:"Editor-Exporte, bevorzugte KI.", ja:"エディター書き出し、優先AI。", tr:"Editör dışa aktarma, öncelikli YZ.", ko:"편집기 내보내기, 우선 AI.", fa:"خروجی ویرایشگر، هوش مصنوعی با اولویت.", uk:"Експорт з редактора, пріоритетний ШІ.", it:"Esportazioni dall'editor, IA prioritaria.", pl:"Eksport z edytora, priorytetowe AI.", vi:"Xuất từ trình sửa, AI ưu tiên." },
  rw3_t: { en:"1 month of Pro", zh:"Pro 1 个月", hi:"Pro का 1 महीना", es:"1 mes de Pro", ar:"شهر واحد من Pro", fr:"1 mois de Pro", bn:"Pro-এর ১ মাস", pt:"1 mês de Pro", ru:"1 месяц Pro", ur:"Pro کا 1 مہینہ", id:"1 bulan Pro", de:"1 Monat Pro", ja:"Pro 1ヶ月", tr:"1 ay Pro", ko:"Pro 1개월", fa:"۱ ماه Pro", uk:"1 місяць Pro", it:"1 mese di Pro", pl:"1 miesiąc Pro", vi:"1 tháng Pro" },
  rw3_d: { en:"The grind pays off.", zh:"努力终有回报。", hi:"मेहनत रंग लाती है।", es:"El esfuerzo da sus frutos.", ar:"المثابرة تؤتي ثمارها.", fr:"Les efforts paient.", bn:"পরিশ্রমের ফল মেলে।", pt:"O esforço compensa.", ru:"Упорство окупается.", ur:"محنت رنگ لاتی ہے۔", id:"Kerja kerasmu terbayar.", de:"Ausdauer zahlt sich aus.", ja:"努力は報われる。", tr:"Emek karşılığını verir.", ko:"노력은 배신하지 않습니다.", fa:"تلاش جواب می‌دهد.", uk:"Наполегливість окупається.", it:"La costanza ripaga.", pl:"Wytrwałość się opłaca.", vi:"Nỗ lực được đền đáp." },
  sec_nums: { en:"By the numbers", zh:"用数据说话", hi:"आँकड़ों में", es:"En cifras", ar:"بالأرقام", fr:"En chiffres", bn:"সংখ্যায়", pt:"Em números", ru:"В цифрах", ur:"اعداد میں", id:"Dalam angka", de:"In Zahlen", ja:"数字で見る", tr:"Rakamlarla", ko:"숫자로 보기", fa:"در اعداد", uk:"У цифрах", it:"In cifre", pl:"W liczbach", vi:"Bằng con số" },
  nums_h: { en:"Built<span class='thin'>Different</span>", zh:"与众<span class='thin'>不同</span>", hi:"अलग<span class='thin'>तरह से बना</span>", es:"Hecho<span class='thin'>diferente</span>", ar:"صُنع<span class='thin'>بشكل مختلف</span>", fr:"Conçu<span class='thin'>différemment</span>", bn:"অন্যরকম<span class='thin'>করে গড়া</span>", pt:"Feito<span class='thin'>diferente</span>", ru:"Сделано<span class='thin'>иначе</span>", ur:"مختلف<span class='thin'>انداز میں بنا</span>", id:"Dibuat<span class='thin'>berbeda</span>", de:"Anders<span class='thin'>gebaut</span>", ja:"つくりが<span class='thin'>ちがう</span>", tr:"Farklı<span class='thin'>tasarlandı</span>", ko:"다르게<span class='thin'>만들었습니다</span>", fa:"ساخته‌شده<span class='thin'>متفاوت</span>", uk:"Зроблено<span class='thin'>інакше</span>", it:"Creato<span class='thin'>diverso</span>", pl:"Zbudowane<span class='thin'>inaczej</span>", vi:"Được tạo<span class='thin'>khác biệt</span>" },
  st_languages: { en:"Languages", zh:"语言", hi:"भाषाएँ", es:"Idiomas", ar:"لغات", fr:"Langues", bn:"ভাষা", pt:"Idiomas", ru:"Языков", ur:"زبانیں", id:"Bahasa", de:"Sprachen", ja:"言語", tr:"Dil", ko:"언어", fa:"زبان", uk:"Мов", it:"Lingue", pl:"Języków", vi:"Ngôn ngữ" },
  st_games: { en:"Games", zh:"游戏", hi:"गेम्स", es:"Juegos", ar:"الألعاب", fr:"Jeux", bn:"গেমস", pt:"Jogos", ru:"Игры", ur:"گیمز", id:"Gim", de:"Spiele", ja:"ゲーム", tr:"Oyunlar", ko:"게임", fa:"بازی‌ها", uk:"Ігри", it:"Giochi", pl:"Gry", vi:"Trò chơi" },
  st_downloads: { en:"Downloads", zh:"下载", hi:"डाउनलोड", es:"Descargas", ar:"التنزيلات", fr:"Téléchargements", bn:"ডাউনলোড", pt:"Transferências", ru:"Загрузки", ur:"ڈاؤن لوڈز", id:"Unduhan", de:"Downloads", ja:"ダウンロード", tr:"İndirmeler", ko:"다운로드", fa:"دانلودها", uk:"Завантаження", it:"Download", pl:"Pobrania", vi:"Lượt tải" },
  st_tools: { en:"Tools", zh:"工具", hi:"टूल", es:"Herramientas", ar:"أدوات", fr:"Outils", bn:"টুল", pt:"Ferramentas", ru:"Инструментов", ur:"ٹولز", id:"Alat", de:"Werkzeuge", ja:"ツール", tr:"Araç", ko:"도구", fa:"ابزار", uk:"Інструментів", it:"Strumenti", pl:"Narzędzi", vi:"Công cụ" },
  st_free: { en:"Free", zh:"免费", hi:"मुफ़्त", es:"Gratis", ar:"مجاني", fr:"Gratuit", bn:"বিনামূল্যে", pt:"Grátis", ru:"Бесплатно", ur:"مفت", id:"Gratis", de:"Kostenlos", ja:"無料", tr:"Ücretsiz", ko:"무료", fa:"رایگان", uk:"Безплатно", it:"Gratis", pl:"Za darmo", vi:"Miễn phí" },
  final_h: { en:"Your channel's <span class='g'>next level</span><br>starts in a tab.", zh:"你频道的<span class='g'>下一个阶段</span><br>就从一个标签页开始。", hi:"आपके चैनल का <span class='g'>अगला लेवल</span><br>एक टैब से शुरू होता है।", es:"El <span class='g'>siguiente nivel</span> de tu canal<br>empieza en una pestaña.", ar:"<span class='g'>المستوى التالي</span> لقناتك<br>يبدأ من تبويب واحد.", fr:"Le <span class='g'>niveau supérieur</span> de ta chaîne<br>commence dans un onglet.", bn:"আপনার চ্যানেলের <span class='g'>পরের ধাপ</span><br>একটি ট্যাব থেকেই শুরু।", pt:"O <span class='g'>próximo nível</span> do teu canal<br>começa num separador.", ru:"<span class='g'>Новый уровень</span> твоего канала<br>начинается во вкладке.", ur:"آپ کے چینل کا <span class='g'>اگلا لیول</span><br>ایک ٹیب سے شروع ہوتا ہے۔", id:"<span class='g'>Level berikutnya</span> kanalmu<br>dimulai dari satu tab.", de:"Das <span class='g'>nächste Level</span> deines Kanals<br>beginnt in einem Tab.", ja:"チャンネルの<span class='g'>次のレベル</span>は<br>タブひとつから始まる。", tr:"Kanalının <span class='g'>bir sonraki seviyesi</span><br>bir sekmede başlıyor.", ko:"채널의 <span class='g'>다음 단계</span>는<br>탭 하나에서 시작됩니다.", fa:"<span class='g'>سطح بعدی</span> کانالت<br>از یک تب شروع می‌شود.", uk:"<span class='g'>Новий рівень</span> твого каналу<br>починається у вкладці.", it:"Il <span class='g'>livello successivo</span> del tuo canale<br>inizia in una scheda.", pl:"<span class='g'>Kolejny poziom</span> twojego kanału<br>zaczyna się w karcie.", vi:"<span class='g'>Cấp độ tiếp theo</span> của kênh bạn<br>bắt đầu trong một tab." },
  final_p: { en:"Free to start. No downloads. Just you, the tools, and the grind.", zh:"免费开始，无需下载。只有你、工具和努力。", hi:"शुरू करना मुफ़्त। कोई डाउनलोड नहीं। बस आप, टूल और मेहनत।", es:"Empezar es gratis. Sin descargas. Solo tú, las herramientas y el esfuerzo.", ar:"البداية مجانية. بلا تنزيلات. أنت والأدوات والمثابرة فقط.", fr:"Démarrage gratuit. Aucun téléchargement. Juste toi, les outils et le travail.", bn:"শুরু করা বিনামূল্যে। কোনো ডাউনলোড নেই। শুধু আপনি, টুল আর পরিশ্রম।", pt:"Começar é grátis. Sem downloads. Só tu, as ferramentas e o esforço.", ru:"Начать бесплатно. Без загрузок. Только ты, инструменты и труд.", ur:"شروع کرنا مفت۔ کوئی ڈاؤن لوڈ نہیں۔ بس آپ، ٹولز اور محنت۔", id:"Mulai gratis. Tanpa unduhan. Hanya kamu, alatnya, dan kerja keras.", de:"Kostenlos starten. Keine Downloads. Nur du, die Werkzeuge und die Arbeit.", ja:"無料で開始。ダウンロード不要。あなたとツールと努力だけ。", tr:"Başlamak ücretsiz. İndirme yok. Sadece sen, araçlar ve emek.", ko:"무료로 시작. 다운로드 없음. 당신과 도구, 그리고 노력뿐.", fa:"شروعش رایگان است. بدون دانلود. فقط تو، ابزارها و تلاش.", uk:"Почати безплатно. Без завантажень. Лише ти, інструменти й праця.", it:"Iniziare è gratis. Nessun download. Solo tu, gli strumenti e l'impegno.", pl:"Start za darmo. Bez pobierania. Tylko ty, narzędzia i praca.", vi:"Bắt đầu miễn phí. Không cần tải. Chỉ có bạn, công cụ và nỗ lực." },
  final_btn: { en:"Open the Studio →", zh:"打开工作室 →", hi:"स्टूडियो खोलें →", es:"Abrir el Estudio →", ar:"افتح الاستوديو ←", fr:"Ouvrir le Studio →", bn:"স্টুডিও খুলুন →", pt:"Abrir o Estúdio →", ru:"Открыть Студию →", ur:"اسٹوڈیو کھولیں ←", id:"Buka Studio →", de:"Studio öffnen →", ja:"スタジオを開く →", tr:"Stüdyoyu aç →", ko:"스튜디오 열기 →", fa:"استودیو را باز کن ←", uk:"Відкрити Студію →", it:"Apri lo Studio →", pl:"Otwórz Studio →", vi:"Mở Studio →" },
  credits_btn: { en:"Credits", zh:"鸣谢", hi:"श्रेय", es:"Créditos", ar:"الشكر والتقدير", fr:"Crédits", bn:"কৃতিত্ব", pt:"Créditos", ru:"Благодарности", ur:"کریڈٹس", id:"Kredit", de:"Credits", ja:"クレジット", tr:"Katkıda bulunanlar", ko:"크레딧", fa:"اعتبارات", uk:"Подяки", it:"Crediti", pl:"Twórcy", vi:"Ghi công" },
  credits_note: { en:"The 3D models, animations and sounds in NovaClip — and who made them.", zh:"NovaClip 中的 3D 模型、动画和音效，以及它们的作者。", hi:"NovaClip में उपयोग किए गए 3D मॉडल, एनिमेशन और ध्वनियाँ — और उनके निर्माता।", es:"Los modelos 3D, animaciones y sonidos de NovaClip, y quién los creó.", ar:"النماذج ثلاثية الأبعاد والرسوم المتحركة والأصوات في NovaClip ومن صنعها.", fr:"Les modèles 3D, animations et sons de NovaClip — et leurs auteurs.", bn:"NovaClip-এ ব্যবহৃত 3D মডেল, অ্যানিমেশন ও সাউন্ড — এবং তাদের নির্মাতারা।", pt:"Os modelos 3D, animações e sons do NovaClip — e quem os criou.", ru:"3D-модели, анимации и звуки в NovaClip — и их авторы.", ur:"NovaClip میں شامل تھری ڈی ماڈلز، اینیمیشنز اور آوازیں — اور اُن کے تخلیق کار۔", id:"Model 3D, animasi, dan suara di NovaClip — dan siapa pembuatnya.", de:"Die 3D-Modelle, Animationen und Sounds in NovaClip — und wer sie gemacht hat.", ja:"NovaClip で使われている 3D モデル・アニメーション・サウンドと、その作者。", tr:"NovaClip’teki 3B modeller, animasyonlar ve sesler — ve onları yapanlar.", ko:"NovaClip에 사용된 3D 모델, 애니메이션, 사운드와 제작자.", fa:"مدل‌های سه‌بعدی، انیمیشن‌ها و صداهای NovaClip — و سازندگان آن‌ها.", uk:"3D-моделі, анімації та звуки в NovaClip — і їхні автори.", it:"I modelli 3D, le animazioni e i suoni di NovaClip — e chi li ha creati.", pl:"Modele 3D, animacje i dźwięki w NovaClip — oraz ich twórcy.", vi:"Các mô hình 3D, hoạt ảnh và âm thanh trong NovaClip — và người tạo ra chúng." },
  /* ---- Strike Arena ----
     The whole lobby was untranslated: every other page switched to Persian and
     this one stayed in English, because game.html had not a single data-t on
     it. These are the strings you actually read before deploying. */
  g_sub: { en:"10 fighters. 5 minutes. Capture kills across a bright city battlefield. Earn NovaClip points and top the board for the MVP bonus.", zh:"10名战士。5分钟。在明亮的城市战场上抢夺击杀。赚取 NovaClip 积分，登顶榜单获得 MVP 奖励。", hi:"10 लड़ाके। 5 मिनट। चमकीले शहरी युद्धक्षेत्र में किल्स बटोरें। NovaClip पॉइंट कमाएँ और MVP बोनस के लिए बोर्ड पर शीर्ष पर रहें।", es:"10 luchadores. 5 minutos. Consigue bajas en un campo de batalla urbano. Gana puntos NovaClip y lidera la tabla para el bono MVP.", ar:"10 مقاتلين. 5 دقائق. احصد النقاط في ساحة معركة مدينية مضيئة. اكسب نقاط NovaClip وتصدَّر اللوحة للحصول على مكافأة أفضل لاعب.", fr:"10 combattants. 5 minutes. Enchaîne les éliminations sur un champ de bataille urbain. Gagne des points NovaClip et domine le classement pour le bonus MVP.", bn:"১০ জন যোদ্ধা। ৫ মিনিট। উজ্জ্বল শহুরে যুদ্ধক্ষেত্রে কিল সংগ্রহ করুন। NovaClip পয়েন্ট অর্জন করুন এবং MVP বোনাসের জন্য বোর্ডে শীর্ষে থাকুন।", pt:"10 lutadores. 5 minutos. Consegue abates num campo de batalha urbano. Ganha pontos NovaClip e lidera a tabela para o bónus MVP.", ru:"10 бойцов. 5 минут. Набирайте убийства на светлом городском поле боя. Зарабатывайте очки NovaClip и возглавьте таблицу ради бонуса MVP.", ur:"10 لڑاکے۔ 5 منٹ۔ روشن شہری میدانِ جنگ میں کِلز حاصل کریں۔ NovaClip پوائنٹس کمائیں اور MVP بونس کے لیے بورڈ پر سرِفہرست آئیں۔", id:"10 petarung. 5 menit. Kumpulkan kill di medan perang kota yang terang. Raih poin NovaClip dan puncaki papan untuk bonus MVP.", de:"10 Kämpfer. 5 Minuten. Sammle Kills auf einem hellen Stadt-Schlachtfeld. Verdiene NovaClip-Punkte und führe die Tabelle für den MVP-Bonus an.", ja:"10人の戦士。5分間。明るい都市の戦場でキルを稼ごう。NovaClipポイントを獲得し、ボードの首位でMVPボーナスを狙え。", tr:"10 savaşçı. 5 dakika. Aydınlık şehir savaş alanında öldürme topla. NovaClip puanı kazan ve MVP bonusu için tabloda zirveye çık.", ko:"10명의 전사. 5분. 밝은 도시 전장에서 킬을 쓸어 담으세요. NovaClip 포인트를 얻고 보드 1위로 MVP 보너스를 받으세요.", fa:"۱۰ مبارز. ۵ دقیقه. در میدان نبرد شهریِ روشن کیل بگیر. امتیاز NovaClip بگیر و برای پاداش بهترین بازیکن صدرنشین شو.", uk:"10 бійців. 5 хвилин. Збирайте вбивства на світлому міському полі бою. Заробляйте бали NovaClip і очолюйте таблицю заради бонусу MVP.", it:"10 combattenti. 5 minuti. Colleziona uccisioni in un campo di battaglia urbano. Guadagna punti NovaClip e domina la classifica per il bonus MVP.", pl:"10 wojowników. 5 minut. Zbieraj zabójstwa na jasnym miejskim polu bitwy. Zdobywaj punkty NovaClip i prowadź w tabeli po bonus MVP.", vi:"10 chiến binh. 5 phút. Săn hạ gục trên chiến trường thành phố rực sáng. Kiếm điểm NovaClip và dẫn đầu bảng để nhận thưởng MVP." },
  ai_hi: { en:"Hey! Ask me anything about growing your channel.", zh:"嘿！关于频道成长的任何问题都可以问我。", hi:"हे! अपने चैनल को बढ़ाने के बारे में कुछ भी पूछो।", es:"¡Hola! Pregúntame lo que sea sobre hacer crecer tu canal.", ar:"أهلًا! اسألني أي شيء عن تنمية قناتك.", fr:"Salut ! Demande-moi ce que tu veux sur la croissance de ta chaîne.", bn:"হেই! আপনার চ্যানেল বড় করা নিয়ে যা খুশি জিজ্ঞাসা করুন।", pt:"Olá! Pergunta-me o que quiseres sobre fazer crescer o teu canal.", ru:"Привет! Спрашивай что угодно о росте канала.", ur:"ہیلو! اپنے چینل کو بڑھانے کے بارے میں کچھ بھی پوچھیں۔", id:"Hai! Tanya apa saja soal mengembangkan channel-mu.", de:"Hey! Frag mich alles zum Wachstum deines Kanals.", ja:"やあ！チャンネルを伸ばすことなら何でも聞いてね。", tr:"Selam! Kanalını büyütmekle ilgili her şeyi sorabilirsin.", ko:"안녕! 채널 성장에 대해 뭐든 물어보세요.", fa:"سلام! هرچی درباره‌ی رشد کانالت می‌خوای بپرس.", uk:"Привіт! Питай що завгодно про зростання каналу.", it:"Ciao! Chiedimi qualsiasi cosa su come far crescere il canale.", pl:"Hej! Pytaj o cokolwiek na temat rozwoju kanału.", vi:"Chào! Hỏi mình bất cứ điều gì về việc phát triển kênh." },
  ai_sub: { en:"Ask about titles, thumbnails, ideas — anything.", zh:"标题、缩略图、创意——什么都可以问。", hi:"टाइटल, थंबनेल, आइडिया — कुछ भी पूछो।", es:"Pregunta sobre títulos, miniaturas, ideas: lo que sea.", ar:"اسأل عن العناوين والصور المصغّرة والأفكار — أي شيء.", fr:"Titres, miniatures, idées — pose n'importe quelle question.", bn:"টাইটেল, থাম্বনেইল, আইডিয়া — যা খুশি জিজ্ঞাসা করুন।", pt:"Pergunta sobre títulos, miniaturas, ideias — o que quiseres.", ru:"Спрашивай про заголовки, обложки, идеи — что угодно.", ur:"ٹائٹلز، تھمب نیلز، آئیڈیاز — کچھ بھی پوچھیں۔", id:"Tanya soal judul, thumbnail, ide — apa saja.", de:"Frag nach Titeln, Thumbnails, Ideen — was du willst.", ja:"タイトル、サムネ、アイデア — なんでもどうぞ。", tr:"Başlıklar, kapak görselleri, fikirler — ne istersen sor.", ko:"제목, 썸네일, 아이디어 — 뭐든 물어보세요.", fa:"درباره‌ی عنوان، تصویر بندانگشتی، ایده — هر چیزی بپرس.", uk:"Питай про заголовки, обкладинки, ідеї — будь-що.", it:"Chiedi di titoli, miniature, idee — qualsiasi cosa.", pl:"Pytaj o tytuły, miniatury, pomysły — o cokolwiek.", vi:"Hỏi về tiêu đề, ảnh thu nhỏ, ý tưởng — bất cứ thứ gì." },
  ai_start: { en:"New chat", zh:"新对话", hi:"नई चैट", es:"Nuevo chat", ar:"محادثة جديدة", fr:"Nouvelle discussion", bn:"নতুন চ্যাট", pt:"Nova conversa", ru:"Новый чат", ur:"نئی چیٹ", id:"Obrolan baru", de:"Neuer Chat", ja:"新しいチャット", tr:"Yeni sohbet", ko:"새 채팅", fa:"گفت‌وگوی جدید", uk:"Новий чат", it:"Nuova chat", pl:"Nowy czat", vi:"Trò chuyện mới" },
  ai_ph: { en:"Ask NovaClip anything…", zh:"向 NovaClip 提问…", hi:"NovaClip से कुछ भी पूछें…", es:"Pregunta lo que sea a NovaClip…", ar:"اسأل NovaClip أي شيء…", fr:"Demande n'importe quoi à NovaClip…", bn:"NovaClip-কে যা খুশি জিজ্ঞাসা করুন…", pt:"Pergunta o que quiseres ao NovaClip…", ru:"Спросите NovaClip о чём угодно…", ur:"NovaClip سے کچھ بھی پوچھیں…", id:"Tanya apa saja ke NovaClip…", de:"Frag NovaClip alles…", ja:"NovaClip に何でも聞いてみて…", tr:"NovaClip'e her şeyi sor…", ko:"NovaClip에게 무엇이든 물어보세요…", fa:"از NovaClip هر چیزی بپرس…", uk:"Запитайте NovaClip про будь-що…", it:"Chiedi qualsiasi cosa a NovaClip…", pl:"Zapytaj NovaClip o cokolwiek…", vi:"Hỏi NovaClip bất cứ điều gì…" },
  g_5v5: { en:"5v5 · Eliminate the enemy team", zh:"5对5 · 消灭敌队", hi:"5v5 · दुश्मन टीम को खत्म करें", es:"5c5 · Elimina al equipo rival", ar:"5 ضد 5 · اقضِ على فريق العدو", fr:"5c5 · Élimine l'équipe adverse", bn:"৫v৫ · শত্রু দলকে নিশ্চিহ্ন করুন", pt:"5v5 · Elimina a equipa inimiga", ru:"5 на 5 · Уничтожьте команду врага", ur:"5 بمقابلہ 5 · دشمن ٹیم کا خاتمہ کریں", id:"5v5 · Habisi tim musuh", de:"5v5 · Schalte das gegnerische Team aus", ja:"5対5 · 敵チームを殲滅", tr:"5v5 · Düşman takımı yok et", ko:"5대5 · 적 팀을 전멸시키세요", fa:"۵ به ۵ · تیم دشمن را از بین ببر", uk:"5 на 5 · Знищіть команду ворога", it:"5v5 · Elimina la squadra nemica", pl:"5 na 5 · Wyeliminuj drużynę wroga", vi:"5v5 · Tiêu diệt đội địch" },
  g_carrying: { en:"Carrying: {w}. Click another to swap it in.", zh:"携带：{w}。点击其他武器进行更换。", hi:"साथ में: {w}। बदलने के लिए दूसरे पर क्लिक करें।", es:"Llevas: {w}. Haz clic en otra para cambiarla.", ar:"تحمل: {w}. انقر على سلاح آخر لتبديله.", fr:"Tu portes : {w}. Clique sur une autre pour l'échanger.", bn:"বহন করছেন: {w}। বদলাতে অন্যটিতে ক্লিক করুন।", pt:"Levas: {w}. Clica noutra para a trocar.", ru:"С собой: {w}. Нажмите на другое, чтобы заменить.", ur:"آپ کے پاس: {w}۔ بدلنے کے لیے دوسرے پر کلک کریں۔", id:"Membawa: {w}. Klik yang lain untuk menukarnya.", de:"Dabei: {w}. Klicke eine andere an, um zu tauschen.", ja:"装備中：{w}。別の武器をクリックで入れ替え。", tr:"Taşıdığın: {w}. Değiştirmek için başkasına tıkla.", ko:"소지 중: {w}. 다른 것을 클릭해 교체하세요.", fa:"همراه داری: {w}. برای تعویض روی یکی دیگر کلیک کن.", uk:"Із собою: {w}. Натисніть іншу, щоб замінити.", it:"Porti: {w}. Clicca un'altra per sostituirla.", pl:"Nosisz: {w}. Kliknij inną, aby ją wymienić.", vi:"Đang mang: {w}. Bấm vũ khí khác để đổi." },
  g_and: { en:" and ", zh:" 和 ", hi:" और ", es:" y ", ar:" و ", fr:" et ", bn:" এবং ", pt:" e ", ru:" и ", ur:" اور ", id:" dan ", de:" und ", ja:" と ", tr:" ve ", ko:" 그리고 ", fa:" و ", uk:" і ", it:" e ", pl:" i ", vi:" và " },
  g_pick2: { en:"Pick two weapons.", zh:"选择两把武器。", hi:"दो हथियार चुनें।", es:"Elige dos armas.", ar:"اختر سلاحين.", fr:"Choisis deux armes.", bn:"দুটি অস্ত্র বাছুন।", pt:"Escolhe duas armas.", ru:"Выберите два оружия.", ur:"دو ہتھیار چنیں۔", id:"Pilih dua senjata.", de:"Wähle zwei Waffen.", ja:"武器を2つ選んでください。", tr:"İki silah seç.", ko:"무기 두 개를 고르세요.", fa:"دو سلاح انتخاب کن.", uk:"Оберіть дві зброї.", it:"Scegli due armi.", pl:"Wybierz dwie bronie.", vi:"Chọn hai vũ khí." },
  g_easy: { en:"EASY", zh:"简单", hi:"आसान", es:"FÁCIL", ar:"سهل", fr:"FACILE", bn:"সহজ", pt:"FÁCIL", ru:"ЛЁГКО", ur:"آسان", id:"MUDAH", de:"LEICHT", ja:"かんたん", tr:"KOLAY", ko:"쉬움", fa:"آسان", uk:"ЛЕГКО", it:"FACILE", pl:"ŁATWY", vi:"DỄ" },
  g_easy_d: { en:"Chill bots · 2 pts/kill · MVP +10", zh:"轻松机器人 · 每击杀2分 · MVP +10", hi:"शांत बॉट · 2 अंक/किल · MVP +10", es:"Bots tranquilos · 2 pts/baja · MVP +10", ar:"بوتات هادئة · نقطتان لكل قتل · أفضل لاعب +10", fr:"Bots tranquilles · 2 pts/élim · MVP +10", bn:"শান্ত বট · ২ পয়েন্ট/কিল · MVP +১০", pt:"Bots calmos · 2 pts/abate · MVP +10", ru:"Спокойные боты · 2 очка/убийство · MVP +10", ur:"پُرسکون بوٹس · 2 پوائنٹ فی کِل · MVP +10", id:"Bot santai · 2 poin/kill · MVP +10", de:"Ruhige Bots · 2 Pkt/Kill · MVP +10", ja:"ゆるいボット · 1キル2pt · MVP +10", tr:"Sakin botlar · öldürme başına 2 puan · MVP +10", ko:"느긋한 봇 · 킬당 2점 · MVP +10", fa:"بات‌های آرام · ۲ امتیاز برای هر کیل · MVP +۱۰", uk:"Спокійні боти · 2 бали/вбивство · MVP +10", it:"Bot tranquilli · 2 pt/uccisione · MVP +10", pl:"Spokojne boty · 2 pkt/zabójstwo · MVP +10", vi:"Bot thư giãn · 2 điểm/hạ gục · MVP +10" },
  g_med: { en:"MEDIUM", zh:"中等", hi:"मध्यम", es:"MEDIO", ar:"متوسط", fr:"MOYEN", bn:"মাঝারি", pt:"MÉDIO", ru:"СРЕДНЕ", ur:"درمیانہ", id:"SEDANG", de:"MITTEL", ja:"ふつう", tr:"ORTA", ko:"보통", fa:"متوسط", uk:"СЕРЕДНЬО", it:"MEDIO", pl:"ŚREDNI", vi:"TRUNG BÌNH" },
  g_med_d: { en:"Tough bots · 5 pts/kill · MVP +20", zh:"强悍机器人 · 每击杀5分 · MVP +20", hi:"कठिन बॉट · 5 अंक/किल · MVP +20", es:"Bots duros · 5 pts/baja · MVP +20", ar:"بوتات قوية · 5 نقاط لكل قتل · أفضل لاعب +20", fr:"Bots coriaces · 5 pts/élim · MVP +20", bn:"কঠিন বট · ৫ পয়েন্ট/কিল · MVP +২০", pt:"Bots duros · 5 pts/abate · MVP +20", ru:"Крепкие боты · 5 очков/убийство · MVP +20", ur:"سخت بوٹس · 5 پوائنٹ فی کِل · MVP +20", id:"Bot tangguh · 5 poin/kill · MVP +20", de:"Zähe Bots · 5 Pkt/Kill · MVP +20", ja:"手強いボット · 1キル5pt · MVP +20", tr:"Zorlu botlar · öldürme başına 5 puan · MVP +20", ko:"강한 봇 · 킬당 5점 · MVP +20", fa:"بات‌های سرسخت · ۵ امتیاز برای هر کیل · MVP +۲۰", uk:"Міцні боти · 5 балів/вбивство · MVP +20", it:"Bot tosti · 5 pt/uccisione · MVP +20", pl:"Twarde boty · 5 pkt/zabójstwo · MVP +20", vi:"Bot cứng cựa · 5 điểm/hạ gục · MVP +20" },
  g_hard: { en:"HARD", zh:"困难", hi:"कठिन", es:"DIFÍCIL", ar:"صعب", fr:"DIFFICILE", bn:"কঠিন", pt:"DIFÍCIL", ru:"СЛОЖНО", ur:"مشکل", id:"SULIT", de:"SCHWER", ja:"むずかしい", tr:"ZOR", ko:"어려움", fa:"سخت", uk:"ВАЖКО", it:"DIFFICILE", pl:"TRUDNY", vi:"KHÓ" },
  g_hard_d: { en:"Deadly bots · 10 pts/kill · MVP +50", zh:"致命机器人 · 每击杀10分 · MVP +50", hi:"घातक बॉट · 10 अंक/किल · MVP +50", es:"Bots letales · 10 pts/baja · MVP +50", ar:"بوتات فتّاكة · 10 نقاط لكل قتل · أفضل لاعب +50", fr:"Bots mortels · 10 pts/élim · MVP +50", bn:"মারাত্মক বট · ১০ পয়েন্ট/কিল · MVP +৫০", pt:"Bots letais · 10 pts/abate · MVP +50", ru:"Смертельные боты · 10 очков/убийство · MVP +50", ur:"مہلک بوٹس · 10 پوائنٹ فی کِل · MVP +50", id:"Bot mematikan · 10 poin/kill · MVP +50", de:"Tödliche Bots · 10 Pkt/Kill · MVP +50", ja:"凶悪なボット · 1キル10pt · MVP +50", tr:"Ölümcül botlar · öldürme başına 10 puan · MVP +50", ko:"치명적인 봇 · 킬당 10점 · MVP +50", fa:"بات‌های مرگبار · ۱۰ امتیاز برای هر کیل · MVP +۵۰", uk:"Смертельні боти · 10 балів/вбивство · MVP +50", it:"Bot letali · 10 pt/uccisione · MVP +50", pl:"Zabójcze boty · 10 pkt/zabójstwo · MVP +50", vi:"Bot chí mạng · 10 điểm/hạ gục · MVP +50" },
  g_rank: { en:"RANKED", zh:"排位", hi:"रैंक्ड", es:"CLASIFICATORIA", ar:"تصنيفي", fr:"CLASSÉ", bn:"র‍্যাঙ্কড", pt:"CLASSIFICADA", ru:"РЕЙТИНГ", ur:"رینکڈ", id:"PERINGKAT", de:"RANGLISTE", ja:"ランク", tr:"DERECELİ", ko:"랭크", fa:"رتبه‌بندی", uk:"РЕЙТИНГ", it:"CLASSIFICATA", pl:"RANKINGOWY", vi:"XẾP HẠNG" },
  g_rank_d: { en:"Elite bots · 15 pts/kill · MVP +80", zh:"精英机器人 · 每击杀15分 · MVP +80", hi:"एलीट बॉट · 15 अंक/किल · MVP +80", es:"Bots de élite · 15 pts/baja · MVP +80", ar:"بوتات نخبة · 15 نقطة لكل قتل · أفضل لاعب +80", fr:"Bots d'élite · 15 pts/élim · MVP +80", bn:"এলিট বট · ১৫ পয়েন্ট/কিল · MVP +৮০", pt:"Bots de elite · 15 pts/abate · MVP +80", ru:"Элитные боты · 15 очков/убийство · MVP +80", ur:"ایلیٹ بوٹس · 15 پوائنٹ فی کِل · MVP +80", id:"Bot elite · 15 poin/kill · MVP +80", de:"Elite-Bots · 15 Pkt/Kill · MVP +80", ja:"エリートボット · 1キル15pt · MVP +80", tr:"Elit botlar · öldürme başına 15 puan · MVP +80", ko:"엘리트 봇 · 킬당 15점 · MVP +80", fa:"بات‌های نخبه · ۱۵ امتیاز برای هر کیل · MVP +۸۰", uk:"Елітні боти · 15 балів/вбивство · MVP +80", it:"Bot d'élite · 15 pt/uccisione · MVP +80", pl:"Elitarne boty · 15 pkt/zabójstwo · MVP +80", vi:"Bot tinh nhuệ · 15 điểm/hạ gục · MVP +80" },
  g_map: { en:"CHOOSE YOUR MAP", zh:"选择地图", hi:"अपना मैप चुनें", es:"ELIGE TU MAPA", ar:"اختر خريطتك", fr:"CHOISIS TA CARTE", bn:"আপনার ম্যাপ বাছুন", pt:"ESCOLHE O TEU MAPA", ru:"ВЫБЕРИТЕ КАРТУ", ur:"اپنا میپ چنیں", id:"PILIH PETAMU", de:"WÄHLE DEINE KARTE", ja:"マップを選ぶ", tr:"HARİTANI SEÇ", ko:"맵 선택", fa:"نقشه‌ات را انتخاب کن", uk:"ОБЕРІТЬ КАРТУ", it:"SCEGLI LA MAPPA", pl:"WYBIERZ MAPĘ", vi:"CHỌN BẢN ĐỒ" },
  g_two: { en:"YOUR TWO WEAPONS", zh:"你的两把武器", hi:"आपके दो हथियार", es:"TUS DOS ARMAS", ar:"سلاحاك", fr:"TES DEUX ARMES", bn:"আপনার দুটি অস্ত্র", pt:"AS TUAS DUAS ARMAS", ru:"ВАШИ ДВА ОРУЖИЯ", ur:"آپ کے دو ہتھیار", id:"DUA SENJATAMU", de:"DEINE ZWEI WAFFEN", ja:"武器2つ", tr:"İKİ SİLAHIN", ko:"당신의 무기 두 개", fa:"دو سلاح تو", uk:"ВАША ДВІЙКА ЗБРОЇ", it:"LE TUE DUE ARMI", pl:"TWOJE DWIE BRONIE", vi:"HAI VŨ KHÍ CỦA BẠN" },
  g_two_d: { en:"(swap with 1 / 2 or the scroll wheel in game)", zh:"（游戏中用 1 / 2 或滚轮切换）", hi:"(गेम में 1 / 2 या स्क्रॉल व्हील से बदलें)", es:"(cambia con 1 / 2 o la rueda del ratón en partida)", ar:"(بدِّل بالمفتاح 1 / 2 أو بعجلة الفأرة داخل اللعبة)", fr:"(change avec 1 / 2 ou la molette en jeu)", bn:"(গেমে ১ / ২ বা স্ক্রল হুইল দিয়ে বদলান)", pt:"(troca com 1 / 2 ou a roda do rato no jogo)", ru:"(переключение клавишами 1 / 2 или колёсиком в игре)", ur:"(گیم میں 1 / 2 یا اسکرول وہیل سے بدلیں)", id:"(ganti dengan 1 / 2 atau roda gulir di dalam game)", de:"(im Spiel mit 1 / 2 oder dem Mausrad wechseln)", ja:"（ゲーム中は 1 / 2 かホイールで切替）", tr:"(oyun içinde 1 / 2 veya fare tekerleğiyle değiştir)", ko:"(게임에서 1 / 2 또는 스크롤 휠로 교체)", fa:"(در بازی با ۱ / ۲ یا چرخ موس عوض کن)", uk:"(перемикання клавішами 1 / 2 або колесом у грі)", it:"(cambia con 1 / 2 o la rotellina in partita)", pl:"(zmiana klawiszami 1 / 2 lub kółkiem w grze)", vi:"(đổi bằng 1 / 2 hoặc con lăn chuột trong trận)" },
  g_mods: { en:"MODIFICATIONS", zh:"改装", hi:"मॉडिफिकेशन", es:"MODIFICACIONES", ar:"التعديلات", fr:"MODIFICATIONS", bn:"মডিফিকেশন", pt:"MODIFICAÇÕES", ru:"МОДИФИКАЦИИ", ur:"موڈیفیکیشنز", id:"MODIFIKASI", de:"MODIFIKATIONEN", ja:"カスタム", tr:"MODİFİKASYONLAR", ko:"모디피케이션", fa:"تغییرات", uk:"МОДИФІКАЦІЇ", it:"MODIFICHE", pl:"MODYFIKACJE", vi:"TÙY BIẾN" },
  g_mods_d: { en:"Fit attachments. Every one of them trades something away.", zh:"安装配件。每一个都会牺牲某些性能。", hi:"अटैचमेंट लगाएँ। हर एक कुछ न कुछ छीन लेता है।", es:"Monta accesorios. Cada uno sacrifica algo.", ar:"ركِّب الملحقات. كل واحد منها يضحّي بشيء ما.", fr:"Monte des accessoires. Chacun sacrifie quelque chose.", bn:"অ্যাটাচমেন্ট লাগান। প্রতিটিই কিছু না কিছু কেড়ে নেয়।", pt:"Monta acessórios. Cada um sacrifica alguma coisa.", ru:"Ставьте обвесы. Каждый чем-то жертвует.", ur:"اٹیچمنٹس لگائیں۔ ہر ایک کچھ نہ کچھ قربان کرتا ہے۔", id:"Pasang aksesori. Setiap satu mengorbankan sesuatu.", de:"Bau Aufsätze an. Jeder opfert etwas.", ja:"アタッチメントを装着。どれも何かを犠牲にする。", tr:"Aksesuar tak. Her biri bir şeyden ödün verir.", ko:"부착물을 장착하세요. 하나하나가 무언가를 포기합니다.", fa:"ملحقات را نصب کن. هرکدام چیزی را فدا می‌کند.", uk:"Ставте обвіси. Кожен чимось жертвує.", it:"Monta accessori. Ognuno sacrifica qualcosa.", pl:"Montuj dodatki. Każdy coś poświęca.", vi:"Gắn phụ kiện. Mỗi món đều đánh đổi một thứ." },
  g_done: { en:"Done", zh:"完成", hi:"हो गया", es:"Listo", ar:"تم", fr:"Terminé", bn:"হয়ে গেছে", pt:"Concluído", ru:"Готово", ur:"ہو گیا", id:"Selesai", de:"Fertig", ja:"完了", tr:"Bitti", ko:"완료", fa:"تمام", uk:"Готово", it:"Fatto", pl:"Gotowe", vi:"Xong" },
  g_who: { en:"WHO ARE YOU PLAYING WITH", zh:"和谁一起玩", hi:"आप किसके साथ खेल रहे हैं", es:"CON QUIÉN JUEGAS", ar:"مع مَن تلعب", fr:"AVEC QUI JOUES-TU", bn:"আপনি কার সাথে খেলছেন", pt:"COM QUEM VAIS JOGAR", ru:"С КЕМ ВЫ ИГРАЕТЕ", ur:"آپ کس کے ساتھ کھیل رہے ہیں", id:"KAMU MAIN DENGAN SIAPA", de:"MIT WEM SPIELST DU", ja:"誰と遊ぶ？", tr:"KİMİNLE OYNUYORSUN", ko:"누구와 플레이하나요", fa:"با چه کسی بازی می‌کنی", uk:"З КИМ ВИ ГРАЄТЕ", it:"CON CHI GIOCHI", pl:"Z KIM GRASZ", vi:"BẠN CHƠI VỚI AI" },
  g_rand: { en:"Random players", zh:"随机玩家", hi:"रैंडम खिलाड़ी", es:"Jugadores al azar", ar:"لاعبون عشوائيون", fr:"Joueurs au hasard", bn:"এলোমেলো খেলোয়াড়", pt:"Jogadores aleatórios", ru:"Случайные игроки", ur:"بے ترتیب کھلاڑی", id:"Pemain acak", de:"Zufällige Spieler", ja:"ランダムなプレイヤー", tr:"Rastgele oyuncular", ko:"랜덤 플레이어", fa:"بازیکنان تصادفی", uk:"Випадкові гравці", it:"Giocatori casuali", pl:"Losowi gracze", vi:"Người chơi ngẫu nhiên" },
  g_rand_d: { en:"Get matched with anyone online, on this map", zh:"与该地图上任何在线玩家匹配", hi:"इस मैप पर ऑनलाइन किसी से भी मैच हों", es:"Te emparejamos con cualquiera en línea, en este mapa", ar:"تتم مطابقتك مع أي شخص متصل على هذه الخريطة", fr:"Tu es associé à n'importe qui en ligne, sur cette carte", bn:"এই ম্যাপে অনলাইনে থাকা যে কারও সাথে ম্যাচ হবে", pt:"És emparelhado com qualquer pessoa online, neste mapa", ru:"Подбор с любым игроком онлайн на этой карте", ur:"اس میپ پر آن لائن کسی بھی شخص سے میچ ہوں", id:"Dicocokkan dengan siapa pun yang online, di peta ini", de:"Wirst mit irgendwem online auf dieser Karte zusammengebracht", ja:"このマップでオンラインの誰とでもマッチ", tr:"Bu haritada çevrimiçi olan herkesle eşleşirsin", ko:"이 맵에서 온라인인 누구와도 매칭", fa:"با هر کسی که روی این نقشه آنلاین است هم‌گروه می‌شوی", uk:"Підбір із будь-ким онлайн на цій карті", it:"Vieni abbinato a chiunque sia online, su questa mappa", pl:"Zostajesz sparowany z kimkolwiek online na tej mapie", vi:"Ghép với bất kỳ ai đang online, trên bản đồ này" },
  g_fr: { en:"Friends only", zh:"仅好友", hi:"सिर्फ़ दोस्त", es:"Solo amigos", ar:"الأصدقاء فقط", fr:"Amis seulement", bn:"শুধু বন্ধুরা", pt:"Apenas amigos", ru:"Только друзья", ur:"صرف دوست", id:"Hanya teman", de:"Nur Freunde", ja:"フレンドのみ", tr:"Sadece arkadaşlar", ko:"친구만", fa:"فقط دوستان", uk:"Лише друзі", it:"Solo amici", pl:"Tylko znajomi", vi:"Chỉ bạn bè" },
  g_fr_d: { en:"Share a code — nobody else can join", zh:"分享房间码 — 其他人无法加入", hi:"कोड शेयर करें — और कोई शामिल नहीं हो सकता", es:"Comparte un código: nadie más puede entrar", ar:"شارِك رمزًا — لا يمكن لأحد آخر الانضمام", fr:"Partage un code — personne d'autre ne peut entrer", bn:"একটি কোড শেয়ার করুন — অন্য কেউ যোগ দিতে পারবে না", pt:"Partilha um código — mais ninguém pode entrar", ru:"Поделитесь кодом — больше никто не войдёт", ur:"ایک کوڈ شیئر کریں — کوئی اور شامل نہیں ہو سکتا", id:"Bagikan kode — orang lain tidak bisa masuk", de:"Teile einen Code — sonst kommt niemand rein", ja:"コードを共有 — 他の人は入れません", tr:"Bir kod paylaş — başka kimse katılamaz", ko:"코드를 공유하세요 — 다른 사람은 참여할 수 없습니다", fa:"یک کد به اشتراک بگذار — کس دیگری نمی‌تواند بیاید", uk:"Поділіться кодом — більше ніхто не приєднається", it:"Condividi un codice: nessun altro può entrare", pl:"Udostępnij kod — nikt inny nie dołączy", vi:"Chia sẻ mã — không ai khác vào được" },
  g_bots: { en:"Bots only", zh:"仅机器人", hi:"सिर्फ़ बॉट", es:"Solo bots", ar:"البوتات فقط", fr:"Bots uniquement", bn:"শুধু বট", pt:"Apenas bots", ru:"Только боты", ur:"صرف بوٹس", id:"Hanya bot", de:"Nur Bots", ja:"ボットのみ", tr:"Sadece botlar", ko:"봇만", fa:"فقط بات‌ها", uk:"Лише боти", it:"Solo bot", pl:"Tylko boty", vi:"Chỉ bot" },
  g_bots_d: { en:"Offline practice, no other people", zh:"离线练习，没有其他人", hi:"ऑफ़लाइन अभ्यास, कोई और नहीं", es:"Práctica sin conexión, sin otras personas", ar:"تدريب دون اتصال، بلا أشخاص آخرين", fr:"Entraînement hors ligne, sans personne d'autre", bn:"অফলাইন অনুশীলন, অন্য কেউ নেই", pt:"Treino offline, sem outras pessoas", ru:"Офлайн-тренировка, без других людей", ur:"آف لائن مشق، کوئی اور شخص نہیں", id:"Latihan offline, tanpa orang lain", de:"Offline-Training, ohne andere Leute", ja:"オフライン練習、他の人はいません", tr:"Çevrimdışı antrenman, başka kimse yok", ko:"오프라인 연습, 다른 사람 없음", fa:"تمرین آفلاین، بدون آدم دیگر", uk:"Офлайн-тренування, без інших людей", it:"Allenamento offline, senza altre persone", pl:"Trening offline, bez innych osób", vi:"Luyện tập ngoại tuyến, không có người khác" },
  g_newcode: { en:"New code", zh:"新房间码", hi:"नया कोड", es:"Código nuevo", ar:"رمز جديد", fr:"Nouveau code", bn:"নতুন কোড", pt:"Novo código", ru:"Новый код", ur:"نیا کوڈ", id:"Kode baru", de:"Neuer Code", ja:"新しいコード", tr:"Yeni kod", ko:"새 코드", fa:"کد جدید", uk:"Новий код", it:"Nuovo codice", pl:"Nowy kod", vi:"Mã mới" },
  g_deploy: { en:"Deploy", zh:"出击", hi:"तैनात करें", es:"Desplegar", ar:"انطلق", fr:"Déployer", bn:"মোতায়েন", pt:"Implantar", ru:"В бой", ur:"تعیناتی", id:"Terjun", de:"Einsatz", ja:"出撃", tr:"Sahaya çık", ko:"출격", fa:"اعزام", uk:"У бій", it:"Schierati", pl:"Wyrusz", vi:"Xuất trận" },
  g_controls: { en:"Controls", zh:"操作设置", hi:"कंट्रोल", es:"Controles", ar:"التحكم", fr:"Commandes", bn:"নিয়ন্ত্রণ", pt:"Controlos", ru:"Управление", ur:"کنٹرولز", id:"Kontrol", de:"Steuerung", ja:"操作設定", tr:"Kontroller", ko:"조작", fa:"کنترل‌ها", uk:"Керування", it:"Comandi", pl:"Sterowanie", vi:"Điều khiển" },
  g_reset: { en:"Reset to defaults", zh:"恢复默认", hi:"डिफ़ॉल्ट पर रीसेट करें", es:"Restablecer valores", ar:"إعادة الضبط الافتراضي", fr:"Réinitialiser", bn:"ডিফল্টে ফিরুন", pt:"Repor predefinições", ru:"Сбросить настройки", ur:"ڈیفالٹ پر ری سیٹ", id:"Setel ulang ke bawaan", de:"Auf Standard zurücksetzen", ja:"初期設定に戻す", tr:"Varsayılana sıfırla", ko:"기본값으로 초기화", fa:"بازگشت به پیش‌فرض", uk:"Скинути до типових", it:"Ripristina predefiniti", pl:"Przywróć domyślne", vi:"Đặt lại mặc định" },
  duel_label: { en:"02 — Fight fair", zh:"02 — 公平对战", hi:"02 — निष्पक्ष मुकाबला", es:"02 — Pelea justa", ar:"02 — نافس بعدل", fr:"02 — Duel équitable", bn:"০২ — ন্যায্য লড়াই", pt:"02 — Luta justa", ru:"02 — Честный бой", ur:"02 — منصفانہ مقابلہ", id:"02 — Bertanding adil", de:"02 — Fairer Kampf", ja:"02 — フェアな勝負", tr:"02 — Adil mücadele", ko:"02 — 공정한 대결", fa:"۰۲ — منصفانه", uk:"02 — Чесний бій", it:"02 — Sfida leale", pl:"02 — Uczciwa walka", vi:"02 — Đấu công bằng" },
  duel_you: { en:"YOU", zh:"你", hi:"आप", es:"TÚ", ar:"أنت", fr:"TOI", bn:"আপনি", pt:"TU", ru:"ВЫ", ur:"آپ", id:"KAMU", de:"DU", ja:"あなた", tr:"SEN", ko:"당신", fa:"تو", uk:"ВИ", it:"TU", pl:"TY", vi:"BẠN" },
  duel_vs: { en:"VS", zh:"对战", hi:"बनाम", es:"VS", ar:"ضد", fr:"VS", bn:"বনাম", pt:"VS", ru:"ПРОТИВ", ur:"مقابل", id:"VS", de:"GEGEN", ja:"VS", tr:"VS", ko:"VS", fa:"در برابر", uk:"ПРОТИ", it:"VS", pl:"KONTRA", vi:"ĐẤU" },
  duel_rival: { en:"RIVAL", zh:"对手", hi:"प्रतिद्वंद्वी", es:"RIVAL", ar:"المنافس", fr:"RIVAL", bn:"প্রতিদ্বন্দ্বী", pt:"RIVAL", ru:"СОПЕРНИК", ur:"حریف", id:"LAWAN", de:"RIVALE", ja:"ライバル", tr:"RAKİP", ko:"라이벌", fa:"رقیب", uk:"СУПЕРНИК", it:"RIVALE", pl:"RYWAL", vi:"ĐỐI THỦ" },
  vibe: { en:"Vibe", zh:"风格", hi:"वाइब", es:"Estilo", ar:"الأسلوب", fr:"Style", bn:"ভাইব", pt:"Estilo", ru:"Стиль", ur:"انداز", id:"Gaya", de:"Stil", ja:"雰囲気", tr:"Tarz", ko:"분위기", fa:"حال‌وهوا", uk:"Стиль", it:"Stile", pl:"Styl", vi:"Phong cách" },
  vibe_normal: { en:"Normal", zh:"普通", hi:"सामान्य", es:"Normal", ar:"عادي", fr:"Normal", bn:"সাধারণ", pt:"Normal", ru:"Обычный", ur:"عام", id:"Normal", de:"Normal", ja:"ふつう", tr:"Normal", ko:"보통", fa:"عادی", uk:"Звичайний", it:"Normale", pl:"Zwykły", vi:"Bình thường" },
  vibe_genz: { en:"Gen\u00a0Z", zh:"Z世代", hi:"Gen\u00a0Z", es:"Gen\u00a0Z", ar:"جيل\u00a0Z", fr:"Gen\u00a0Z", bn:"Gen\u00a0Z", pt:"Gen\u00a0Z", ru:"Зумер", ur:"Gen\u00a0Z", id:"Gen\u00a0Z", de:"Gen\u00a0Z", ja:"Z世代", tr:"Z\u00a0Kuşağı", ko:"Z세대", fa:"نسل\u00a0Z", uk:"Зумер", it:"Gen\u00a0Z", pl:"Pokolenie\u00a0Z", vi:"Gen\u00a0Z" },

  quests: { en:"Rewards", zh:"奖励", hi:"रिवॉर्ड्स", es:"Recompensas", ar:"الجوائز", fr:"Récompenses", bn:"পুরস্কার", pt:"Recompensas", ru:"Награды", ur:"انعامات", id:"Hadiah", de:"Belohnungen", ja:"リワード", tr:"Ödüller", ko:"보상", fa:"جوایز", uk:"Нагороди", it:"Ricompense", pl:"Nagrody", vi:"Phần thưởng" },
  achievements: { en:"Achievements", zh:"成就", hi:"उपलब्धियाँ", es:"Logros", ar:"الإنجازات", fr:"Succès", bn:"অর্জন", pt:"Conquistas", ru:"Достижения", ur:"کامیابیاں", id:"Pencapaian", de:"Erfolge", ja:"実績", tr:"Başarılar", ko:"업적", fa:"دستاوردها", uk:"Досягнення", it:"Obiettivi", pl:"Osiągnięcia", vi:"Thành tựu" },
  history: { en:"History", zh:"历史", hi:"इतिहास", es:"Historial", ar:"السجل", fr:"Historique", bn:"ইতিহাস", pt:"Histórico", ru:"История", ur:"تاریخ", id:"Riwayat", de:"Verlauf", ja:"履歴", tr:"Geçmiş", ko:"기록", fa:"تاریخچه", uk:"Історія", it:"Cronologia", pl:"Historia", vi:"Lịch sử" },
  ask: { en:"Ask", zh:"提问", hi:"पूछें", es:"Preguntar", ar:"اسأل", fr:"Demander", bn:"জিজ্ঞাসা", pt:"Perguntar", ru:"Спросить", ur:"پوچھیں", id:"Tanya", de:"Fragen", ja:"質問", tr:"Sor", ko:"질문", fa:"بپرس", uk:"Запитати", it:"Chiedi", pl:"Zapytaj", vi:"Hỏi" },
  thumb: { en:"Thumbnail", zh:"缩略图", hi:"थंबनेल", es:"Miniatura", ar:"صورة مصغرة", fr:"Miniature", bn:"থাম্বনেইল", pt:"Thumbnail", ru:"Превью", ur:"تھمب نیل", id:"Thumbnail", de:"Thumbnail", ja:"サムネイル", tr:"Küçük resim", ko:"썸네일", fa:"تصویر بندانگشتی", uk:"Прев’ю", it:"Miniatura", pl:"Miniatura", vi:"Ảnh thu nhỏ" },
  video: { en:"Video maker", zh:"视频制作", hi:"वीडियो मेकर", es:"Creador de vídeo", ar:"صانع الفيديو", fr:"Créateur vidéo", bn:"ভিডিও মেকার", pt:"Criador de vídeo", ru:"Создатель видео", ur:"ویڈیو میکر", id:"Pembuat video", de:"Video-Macher", ja:"動画メーカー", tr:"Video yapıcı", ko:"영상 제작", fa:"ویدیوساز", uk:"Творець відео", it:"Crea video", pl:"Kreator wideo", vi:"Tạo video" },
  trend_h: { en:"Trend Spotter", zh:"趋势雷达", hi:"ट्रेंड स्पॉटर", es:"Detector de Tendencias", ar:"راصد الاتجاهات", fr:"Détecteur de Tendances", bn:"ট্রেন্ড স্পটার", pt:"Radar de Tendências", ru:"Радар трендов", ur:"ٹرینڈ اسپاٹر", id:"Pemantau Tren", de:"Trend-Radar", ja:"トレンド探知", tr:"Trend Radarı", ko:"트렌드 탐지기", fa:"ردیاب ترند", uk:"Радар трендів", it:"Rileva Tendenze", pl:"Radar Trendów", vi:"Dò Xu Hướng" },
  trend_p: { en:"Type your niche and drop the radar — NovaClip AI predicts what's about to blow up.", zh:"输入你的领域并启动雷达——NovaClip AI 预测即将爆火的内容。", hi:"अपना निच लिखें और रडार चलाएँ — AI बताएगा क्या वायरल होगा।", es:"Escribe tu nicho y lanza el radar — la IA predice lo que va a explotar.", ar:"اكتب مجالك وأطلق الرادار — الذكاء الاصطناعي يتنبأ بما سينفجر.", fr:"Tape ta niche et lance le radar — l’IA prédit ce qui va exploser.", bn:"আপনার নিশ লিখুন, রাডার চালান — AI বলবে কী ভাইরাল হবে।", pt:"Escreve o teu nicho e lança o radar — a IA prevê o que vai bombar.", ru:"Введи свою нишу и запусти радар — ИИ предскажет, что взлетит.", ur:"اپنا نیش لکھیں اور ریڈار چلائیں — AI بتائے گا کیا وائرل ہوگا۔", id:"Ketik niche-mu dan jalankan radar — AI memprediksi yang akan meledak.", de:"Gib deine Nische ein und starte das Radar — die KI sagt voraus, was explodiert.", ja:"ニッチを入力してレーダー起動 — AIが次のバズを予測。", tr:"Nişini yaz, radarı çalıştır — YZ neyin patlayacağını tahmin eder.", ko:"니치를 입력하고 레이더를 돌리세요 — AI가 뜰 콘텐츠를 예측합니다.", fa:"حوزه‌ات را بنویس و رادار را بینداز — هوش مصنوعی پیش‌بینی می‌کند چه چیزی می‌ترکد.", uk:"Введи свою нішу й запусти радар — ШІ передбачить, що вибухне.", it:"Scrivi la tua nicchia e lancia il radar — l’IA prevede cosa esploderà.", pl:"Wpisz swoją niszę i odpal radar — AI przewidzi, co wybuchnie.", vi:"Nhập lĩnh vực và thả radar — AI dự đoán điều sắp bùng nổ." },
  niche_ph: { en:"Your niche (e.g. Minecraft, cooking, football)", zh:"你的领域（如 Minecraft、烹饪、足球）", hi:"आपका निच (जैसे Minecraft, कुकिंग, फुटबॉल)", es:"Tu nicho (ej. Minecraft, cocina, fútbol)", ar:"مجالك (مثل ماينكرافت، الطبخ، كرة القدم)", fr:"Ta niche (ex : Minecraft, cuisine, football)", bn:"আপনার নিশ (যেমন Minecraft, রান্না, ফুটবল)", pt:"O teu nicho (ex: Minecraft, culinária, futebol)", ru:"Твоя ниша (напр. Minecraft, кулинария, футбол)", ur:"آپ کا نیش (مثلاً Minecraft، کھانا، فٹبال)", id:"Niche-mu (mis. Minecraft, memasak, sepak bola)", de:"Deine Nische (z.B. Minecraft, Kochen, Fußball)", ja:"あなたのニッチ（例：マイクラ、料理、サッカー）", tr:"Nişin (örn. Minecraft, yemek, futbol)", ko:"니치 (예: 마인크래프트, 요리, 축구)", fa:"حوزه شما (مثلاً ماینکرافت، آشپزی، فوتبال)", uk:"Твоя ніша (напр. Minecraft, кулінарія, футбол)", it:"La tua nicchia (es. Minecraft, cucina, calcio)", pl:"Twoja nisza (np. Minecraft, gotowanie, piłka)", vi:"Lĩnh vực của bạn (VD: Minecraft, nấu ăn, bóng đá)" },
  scan: { en:"Scan for trends", zh:"扫描趋势", hi:"ट्रेंड स्कैन करें", es:"Buscar tendencias", ar:"افحص الاتجاهات", fr:"Scanner les tendances", bn:"ট্রেন্ড স্ক্যান", pt:"Procurar tendências", ru:"Сканировать тренды", ur:"ٹرینڈز اسکین کریں", id:"Pindai tren", de:"Nach Trends suchen", ja:"トレンドをスキャン", tr:"Trendleri tara", ko:"트렌드 스캔", fa:"اسکن ترندها", uk:"Сканувати тренди", it:"Scansiona tendenze", pl:"Skanuj trendy", vi:"Quét xu hướng" },
  scanning: { en:"Scanning the airwaves...", zh:"正在扫描电波...", hi:"एयरवेव्स स्कैन हो रही हैं...", es:"Escaneando las ondas...", ar:"جارٍ مسح الموجات...", fr:"Analyse des ondes...", bn:"এয়ারওয়েভ স্ক্যান হচ্ছে...", pt:"A analisar o espetro...", ru:"Сканируем эфир...", ur:"ایئر ویوز اسکین ہو رہی ہیں...", id:"Memindai gelombang...", de:"Scanne die Wellen...", ja:"電波をスキャン中...", tr:"Dalgalar taranıyor...", ko:"전파를 스캔 중...", fa:"در حال اسکن امواج...", uk:"Скануємо ефір...", it:"Scansione delle onde...", pl:"Skanowanie fal...", vi:"Đang quét sóng..." },
  how1: { en:"Type your niche", zh:"输入你的领域", hi:"अपना निच लिखें", es:"Escribe tu nicho", ar:"اكتب مجالك", fr:"Tape ta niche", bn:"নিশ লিখুন", pt:"Escreve o teu nicho", ru:"Введи нишу", ur:"نیش لکھیں", id:"Ketik niche", de:"Nische eingeben", ja:"ニッチを入力", tr:"Nişini yaz", ko:"니치 입력", fa:"حوزه را بنویس", uk:"Введи нішу", it:"Scrivi la nicchia", pl:"Wpisz niszę", vi:"Nhập lĩnh vực" },
  how2: { en:"The radar sweeps the trends", zh:"雷达扫描趋势", hi:"रडार ट्रेंड्स खोजता है", es:"El radar barre las tendencias", ar:"الرادار يمسح الاتجاهات", fr:"Le radar balaie les tendances", bn:"রাডার ট্রেন্ড খোঁজে", pt:"O radar varre as tendências", ru:"Радар ищет тренды", ur:"ریڈار ٹرینڈز ڈھونڈتا ہے", id:"Radar memindai tren", de:"Das Radar scannt Trends", ja:"レーダーがトレンドを探索", tr:"Radar trendleri tarar", ko:"레이더가 트렌드를 훑습니다", fa:"رادار ترندها را می‌کاود", uk:"Радар шукає тренди", it:"Il radar scandaglia i trend", pl:"Radar skanuje trendy", vi:"Radar quét xu hướng" },
  how3: { en:"Get 6 rising video ideas", zh:"获得6个上升期视频灵感", hi:"6 उभरते वीडियो आइडिया पाएं", es:"Recibe 6 ideas en ascenso", ar:"احصل على 6 أفكار صاعدة", fr:"Reçois 6 idées montantes", bn:"৬টি উদীয়মান আইডিয়া পান", pt:"Recebe 6 ideias em ascensão", ru:"Получи 6 растущих идей", ur:"6 ابھرتے آئیڈیاز پائیں", id:"Dapatkan 6 ide naik daun", de:"Erhalte 6 aufsteigende Ideen", ja:"急上昇アイデアを6つ入手", tr:"Yükselen 6 fikir al", ko:"뜨는 아이디어 6개 받기", fa:"۶ ایده در حال رشد بگیر", uk:"Отримай 6 ідей, що зростають", it:"Ottieni 6 idee in crescita", pl:"Zdobądź 6 rosnących pomysłów", vi:"Nhận 6 ý tưởng đang lên" },
  recent: { en:"Recent scans", zh:"最近扫描", hi:"हाल के स्कैन", es:"Escaneos recientes", ar:"عمليات المسح الأخيرة", fr:"Scans récents", bn:"সাম্প্রতিক স্ক্যান", pt:"Análises recentes", ru:"Недавние сканы", ur:"حالیہ اسکینز", id:"Pindaian terbaru", de:"Letzte Scans", ja:"最近のスキャン", tr:"Son taramalar", ko:"최근 스캔", fa:"اسکن‌های اخیر", uk:"Останні сканування", it:"Scansioni recenti", pl:"Ostatnie skany", vi:"Lần quét gần đây" },
};

function lang() { return localStorage.getItem('nc_lang') || 'en'; }
function tr(key) { return (T[key] && T[key][lang()]) || (T[key] && T[key].en) || ''; }
function langInstruction() { return ' Reply ONLY in this language: ' + (LANGS[lang()] || 'English') + '. '; }
function applyLang(code) {
  localStorage.setItem('nc_lang', code);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.includes(code) ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-t]').forEach(el => { const v = tr(el.dataset.t); if (!v) return; if (/[<>]/.test(v)) el.innerHTML = v; else el.textContent = v; });
  document.querySelectorAll('[data-tph]').forEach(el => { const v = tr(el.dataset.tph); if (v) el.placeholder = v; });
}

const QUESTS = [[100,'1 day free NovaClip Pro'],[450,'1 week free NovaClip Pro'],[700,'2 weeks free NovaClip Pro'],[1250,'1 month free NovaClip Pro']];
const ACHIEVEMENTS = [[30,'Reached 30 points'],[100,'Reached 100 points'],[250,'Reached 250 points'],[500,'Reached 500 points']];

/* ===== SKILL LEDGER =====
   Certificates are credentials, so they have to be earned. Every skill below
   is logged from the place where the learner actually does the work, and the
   count is what the certificate requirements are checked against. */
const SKILLS = {
  yt_connect: { icon:'', label:'Connect your YouTube channel' },
  edit_export:{ icon:'', label:'Export a video from the Editor' },
  trend_scan: { icon:'', label:'Run a Trend Spotter scan' },
  idea_save:  { icon:'', label:'Save a video idea to your shortlist' },
  analytics:  { icon:'', label:'Review your channel analytics' },
  ai_ask:     { icon:'', label:'Ask a NovaClip AI tutor' },
  arena_mvp:  { icon:'', label:'Top the Strike Arena scoreboard' }
};

/* Each tier needs points AND hands-on reps. Points alone can be farmed in the
   arena, so the skill counts are what stop a certificate being bought outright. */
const CERT_REQS = {
  'Basic Certificate': {
    pts: 150,
    skills: { yt_connect:1, edit_export:3, trend_scan:3, ai_ask:5 }
  },
  'Advanced Certificate': {
    pts: 600,
    skills: { yt_connect:1, edit_export:10, trend_scan:10, idea_save:5, analytics:5, ai_ask:15 }
  },
  'Master Certificate': {
    pts: 1500,
    skills: { yt_connect:1, edit_export:25, trend_scan:20, idea_save:15, analytics:15, ai_ask:30, arena_mvp:3 }
  }
};

function getSkills() { try { return JSON.parse(localStorage.getItem('nc_skills') || '{}') || {}; } catch (e) { return {}; } }
function skillCount(id) { const n = getSkills()[id]; return typeof n === 'number' && n > 0 ? n : 0; }
function logSkill(id, n) {
  if (!SKILLS[id]) return;
  const s = getSkills();
  s[id] = (s[id] || 0) + (n > 0 ? Math.round(n) : 1);
  localStorage.setItem('nc_skills', JSON.stringify(s)); ncSyncSoon();
  refreshPanels();
  if (typeof window.onSkillLogged === 'function') window.onSkillLogged(id, s[id]);
}

/* Returns what is still missing for a tier — empty `missing` means it is earned. */
function certProgress(tier) {
  const req = CERT_REQS[tier];
  if (!req) return null;
  const have = getPts(), missing = [];
  let done = 0, total = 0;

  total++; if (have >= req.pts) done++;
  else missing.push({ label:'Reach ' + req.pts + ' points', have: have, need: req.pts, icon:'' });

  for (const id in req.skills) {
    const need = req.skills[id], got = skillCount(id), meta = SKILLS[id] || { icon:'•', label:id };
    total++;
    if (got >= need) done++;
    else missing.push({ label: meta.label, have: got, need: need, icon: meta.icon });
  }
  return { tier: tier, missing: missing, done: done, total: total, pct: Math.round(done / total * 100) };
}
function certEarned(tier) { const p = certProgress(tier); return !!p && p.missing.length === 0; }

const style = document.createElement('style');
style.textContent =
/* dropdown fix: dark options everywhere (fixes white-on-white lists) */
"select { background:#0A0C14 !important; color:#EAF2FF !important; border:1px solid rgba(0,240,255,0.35) !important; }" +
"select option { background:#0A0C14; color:#EAF2FF; }" +
/* futuristic sidebar upgrade — applies on every page over local styles */
".sidebar { background: linear-gradient(180deg, rgba(8,9,16,0.96), rgba(10,8,20,0.96)) !important; border-right:1px solid rgba(0,240,255,0.18) !important; box-shadow: 8px 0 40px rgba(0,240,255,0.05); }" +
".sidebar::before { content:''; position:absolute; top:0; right:-1px; bottom:0; width:2px; background:linear-gradient(180deg, transparent, #00F0FF, #FF2E97, transparent); opacity:0.5; animation: ncRail 5s ease-in-out infinite; }" +
"@keyframes ncRail { 0%,100% { opacity:0.35; } 50% { opacity:0.9; } }" +
".sidebar a { position:relative; letter-spacing:0.3px; transition: all 0.25s !important; }" +
".sidebar a::after { content:''; position:absolute; left:14px; right:14px; bottom:6px; height:1px; background:linear-gradient(90deg,#00F0FF,transparent); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }" +
".sidebar a:hover { background: rgba(0,240,255,0.08) !important; text-shadow:0 0 12px rgba(0,240,255,0.6); padding-left:26px !important; }" +
".sidebar a:hover::after { transform:scaleX(1); }" +
".sidebar a.aidot { background: linear-gradient(135deg,#FF2E97,#7209B7,#00F0FF) !important; background-size:220% 220% !important; animation: ncGrad 4s ease infinite; box-shadow:0 0 24px rgba(255,46,151,0.35); }" +
"@keyframes ncGrad { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }" +
"#nctoast { position:fixed; top:20px; right:20px; background:linear-gradient(90deg,#FF2E97,#7209B7); color:white; padding:14px 22px; border-radius:14px; font-weight:700; box-shadow:0 4px 20px rgba(0,0,0,0.5); z-index:9999; display:none; }" +
"#ncpts { position:fixed; top:16px; right:16px; background:rgba(10,12,20,0.9); color:#EAF2FF; border:1px solid rgba(0,240,255,0.4); border-radius:20px; padding:6px 14px; font-weight:700; z-index:997; box-shadow:0 0 18px rgba(0,240,255,0.15); }" +
".radar { width:220px; height:220px; border-radius:50%; margin:30px auto; position:relative; background:radial-gradient(circle,rgba(76,201,240,0.12) 0%,rgba(14,17,23,0.6) 70%); border:2px solid rgba(76,201,240,0.5); box-shadow:0 0 30px rgba(76,201,240,0.3) inset; overflow:hidden; }" +
".radar::before,.radar::after { content:''; position:absolute; inset:0; border-radius:50%; border:1px solid rgba(76,201,240,0.25); margin:40px; }" +
".radar::after { margin:80px; }" +
".radar .sweep { position:absolute; inset:0; border-radius:50%; background:conic-gradient(from 0deg,rgba(76,201,240,0.55) 0deg,rgba(76,201,240,0) 60deg,transparent 360deg); animation:ncsweep 1.6s linear infinite; }" +
"@keyframes ncsweep { to { transform:rotate(360deg); } }" +

/* ---- iOS-style age wheel ----
   A wheel instead of a text box on purpose. A text box invites a second try:
   type a number, read the rejection, type a number that gets in. A wheel is one
   gesture, it commits, and it never tells you which numbers are the right ones. */
"#ncWheel { position:relative; height:220px; overflow-y:scroll; scroll-snap-type:y mandatory; " +
  "-webkit-overflow-scrolling:touch; scrollbar-width:none; margin:6px 0 18px; " +
  "-webkit-mask-image:linear-gradient(180deg,transparent,#000 26%,#000 74%,transparent); " +
  "mask-image:linear-gradient(180deg,transparent,#000 26%,#000 74%,transparent); }" +
"#ncWheel::-webkit-scrollbar { display:none; }" +
"#ncWheel .ncw { height:44px; line-height:44px; scroll-snap-align:center; text-align:center; " +
  "font-size:1.5rem; font-weight:600; color:#5b6478; transition:color .18s, transform .18s; }" +
"#ncWheel .ncw.on { color:#EAF2FF; transform:scale(1.22); }" +
"#ncWheel .ncw.near { color:#8c96ad; }" +
"#ncWheelBand { position:absolute; left:0; right:0; top:88px; height:44px; pointer-events:none; " +
  "border-top:1px solid rgba(255,255,255,0.16); border-bottom:1px solid rgba(255,255,255,0.16); " +
  "background:rgba(255,255,255,0.04); border-radius:8px; }";
document.head.appendChild(style);

function applyTheme(name) { const t = THEMES[name] || THEMES['Dark']; document.documentElement.style.setProperty('--bg',t[0]); document.documentElement.style.setProperty('--box',t[1]); document.documentElement.style.setProperty('--txt',t[2]); document.body.dataset.theme = name; localStorage.setItem('nc_theme',name); }
function toast(msg) { const t = document.getElementById('nctoast'); if (!t) return; t.textContent = msg; t.style.display = 'block'; clearTimeout(t.hideTimer); t.hideTimer = setTimeout(() => { t.style.display = 'none'; }, 3000); }
function getPts() { return parseInt(localStorage.getItem('nc_points') || '0'); }
function checkUnlocks(pts) { const u = JSON.parse(localStorage.getItem('nc_unlocked') || '[]'); for (const [need,name] of QUESTS.concat(ACHIEVEMENTS)) { if (pts >= need && !u.includes(name)) { u.push(name); setTimeout(() => toast('UNLOCKED: ' + name), 1200); } } localStorage.setItem('nc_unlocked', JSON.stringify(u)); }
function addPts(n) { const p = getPts() + n; localStorage.setItem('nc_points', p); ncSyncSoon(); const b = document.getElementById('ncpts'); if (b) b.textContent = p + ' pts'; toast('+' + n + ' pts!'); checkUnlocks(p); refreshPanels(); }
function saveHist(subject,q,a) { const h = JSON.parse(localStorage.getItem('nc_history') || '{}'); if (!h[subject]) h[subject] = []; h[subject].push([q,a.slice(0,200)]); if (h[subject].length > 10) h[subject].shift(); localStorage.setItem('nc_history', JSON.stringify(h)); refreshPanels(); }
/* ============================================================
   ACCOUNT + SAVE SYNC
   Points, skills, certificates, saved ideas and AI history live in localStorage,
   which means they live in ONE browser. This carries them to a small server so
   they survive a new phone, a cleared cache or a school laptop.

   There are no passwords. The browser holds a 32-character key; the server also
   issues a short recovery code so signing in elsewhere is nine characters typed
   once. Anyone with the code has the save, which is the honest trade for points
   and badges — do not imply it is more protected than that.

   Set NC_SERVER to your Worker's address (see leaderboard-worker.js) and this
   turns itself on. Left empty, everything below is inert and the site works
   exactly as it does now, offline.
   ============================================================ */
const NC_SERVER = '';          // e.g. 'https://novaclip-server.you.workers.dev'

/* What travels. Deliberately NOT nc_yt: that holds a YouTube OAuth token, and a
   token on someone else's server is a token you no longer control. The channel
   name is copied into nc_name instead, which is all the rest of the site needs. */
const NC_SYNC_KEYS = ['nc_points', 'nc_skills', 'nc_certs','nc_pro','nc_subscription', 'nc_cert_enrolled',
                      'nc_ideas', 'nc_history', 'nc_unlocked', 'nc_lb', 'nc_name',
                      'nc_flap_best', 'nc_lang'];

function ncKey() { return localStorage.getItem('nc_key') || ''; }
function ncCode() { return localStorage.getItem('nc_code') || ''; }
function ncSyncOn() { return !!NC_SERVER; }

async function ncApi(path, opts) {
  const r = await fetch(NC_SERVER.replace(/\/$/, '') + path, opts);
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || ('HTTP ' + r.status));
  return body;
}

async function ncCreateAccount() {
  const out = await ncApi('/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  localStorage.setItem('nc_key', out.key);
  localStorage.setItem('nc_code', out.code);
  return out;
}
async function ncSignIn(code) {
  const out = await ncApi('/account/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code }) });
  localStorage.setItem('nc_key', out.key);
  localStorage.setItem('nc_code', String(code).toUpperCase());
  return out;
}

function ncCollect() {
  const data = {};
  NC_SYNC_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) data[k] = v; });
  return data;
}
/* Merging, not overwriting. Two devices both hold a points total; taking the
   server's blindly would wipe a session played offline, so points and counters
   take the HIGHER value and lists take the longer one. Last-write-wins would
   quietly delete work. */
function ncMerge(remote) {
  if (!remote || typeof remote !== 'object') return 0;
  let changed = 0;
  const numeric = { nc_points: 1, nc_flap_best: 1 };
  for (const k in remote) {
    if (NC_SYNC_KEYS.indexOf(k) < 0) continue;
    const mine = localStorage.getItem(k), theirs = remote[k];
    if (mine === theirs) continue;
    if (numeric[k]) {
      const a = parseInt(mine, 10) || 0, b = parseInt(theirs, 10) || 0;
      if (b > a) { localStorage.setItem(k, String(b)); changed++; }
    } else if (mine === null || String(theirs).length > String(mine).length) {
      localStorage.setItem(k, theirs); changed++;
    }
  }
  return changed;
}

async function ncPull() {
  if (!ncSyncOn() || !ncKey()) return 0;
  const out = await ncApi('/save?key=' + encodeURIComponent(ncKey()));
  const n = ncMerge(out.data);
  if (n) { refreshPanels(); const b = document.getElementById('ncpts'); if (b) b.textContent = getPts() + ' pts'; }
  return n;
}
async function ncPush() {
  if (!ncSyncOn() || !ncKey()) return false;
  await ncApi('/save', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: ncKey(), data: ncCollect() }) });
  localStorage.setItem('nc_synced_at', String(Date.now()));
  return true;
}
/* Pull on arrival, push on leaving, and push a few seconds after anything
   changes — a phone that closes the tab mid-session should not lose the session. */
let ncPushTimer = null;
function ncSyncSoon() {
  if (!ncSyncOn() || !ncKey()) return;
  clearTimeout(ncPushTimer);
  ncPushTimer = setTimeout(() => ncPush().catch(e => console.warn('sync push failed', e)), 4000);
}
async function ncSyncBoot() {
  if (!ncSyncOn()) return;
  try {
    if (!ncKey()) await ncCreateAccount();
    await ncPull();
    await ncPush();
  } catch (e) { console.warn('sync unavailable — staying local', e); }
  window.addEventListener('pagehide', () => {
    if (!ncSyncOn() || !ncKey() || !navigator.sendBeacon) return;
    navigator.sendBeacon(NC_SERVER.replace(/\/$/, '') + '/save',
      new Blob([JSON.stringify({ key: ncKey(), data: ncCollect() })], { type: 'application/json' }));
  });
}
window.ncCreateAccount = ncCreateAccount; window.ncSignIn = ncSignIn;
window.ncPull = ncPull; window.ncPush = ncPush; window.ncSyncOn = ncSyncOn;
window.ncKey = ncKey; window.ncCode = ncCode;

function refreshPanels() {
  const pts = getPts();
  const ql = document.getElementById('questlist'); if (ql) ql.innerHTML = QUESTS.map(([need,name]) => pts >= need ? name + ' — DONE' : name + ' — ' + (need - pts) + ' pts to go').join('<br>');
  const al = document.getElementById('achlist'); if (al) al.innerHTML = ACHIEVEMENTS.map(([need,name]) => pts >= need ? name + '' : 'Reach ' + need + ' points (you have ' + pts + ')').join('<br>');
  const hl = document.getElementById('histlist'); if (hl) { const h = JSON.parse(localStorage.getItem('nc_history') || '{}'); let html = ''; for (const s in h) { html += '<b>' + s + '</b> (' + h[s].length + ' chats)<br>' + h[s].slice(-3).map(x => '• ' + x[0]).join('<br>') + '<br><br>'; } hl.innerHTML = html || 'No chats yet - start talking!'; }
}
/* ===== PASTED-TWICE REPAIR =====
   When a file is pasted into itself rather than over itself, the browser does
   not complain: it drops the second <!DOCTYPE> and <head>, and quietly appends
   the second body to the first. You get two of every heading, two of every
   button, and — the part nobody guesses from looking at it — a page where
   half the buttons do nothing. Every script in the file runs twice, and both
   runs call getElementById, which always returns the FIRST match. So the
   handlers all pile onto the top copy while the copy you scrolled down to and
   clicked has none. "Sign in does nothing" is this bug.

   So: keep the first of everything, delete the rest, and say out loud that the
   file needs re-uploading — because this only papers over it in the browser,
   the file on the server is still wrong. */
function dedupeChrome() {
  const bars = document.querySelectorAll('.sidebar');
  const doubled = bars.length > 1;
  for (let i = 1; i < bars.length; i++) bars[i].remove();
  const badges = document.querySelectorAll('#ncpts');
  for (let i = 1; i < badges.length; i++) badges[i].remove();
  if (!doubled) return;

  // whole page bodies, not just the sidebar
  ['.main', '.orb', '#boot'].forEach(sel => {
    const els = document.querySelectorAll(sel);
    for (let i = 1; i < els.length; i++) els[i].remove();
  });
  /* Anything left over with an id that already appeared is a duplicate by
     definition — ids are unique or they are not ids. Removing the later ones
     leaves exactly the copy the scripts are wired to. */
  const seen = {};
  let extra = 0;
  document.querySelectorAll('[id]').forEach(el => {
    if (!el.isConnected) return;
    if (seen[el.id]) { el.remove(); extra++; } else seen[el.id] = true;
  });

  console.warn('This page\'s markup appears ' + (bars.length) + ' times. Removed the extra copies ' +
    '(' + extra + ' duplicate ids). The file on the server still has it twice — re-upload it, ' +
    'replacing the whole file instead of pasting on the end.');

  const bar = document.createElement('div');
  bar.id = 'ncdupwarn';
  bar.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99999;padding:9px 14px;' +
    'background:#7a1030;color:#ffe3ec;font:600 13px/1.5 system-ui,sans-serif;text-align:center';
  bar.innerHTML = 'This page was uploaded twice in one file, so everything on it appeared twice. ' +
    'It has been patched in your browser — re-upload the page and <b>replace</b> the whole file to fix it properly. ' +
    '<span id="ncdupx" style="cursor:pointer;text-decoration:underline;margin-left:8px">dismiss</span>';
  document.body.appendChild(bar);
  const x = document.getElementById('ncdupx');
  if (x) x.onclick = () => bar.remove();
}

/* ---- the mark ----
   One logo file, put on every page from here rather than pasted into nine
   sidebars — the site had no logo at all and no favicon, so every tab showed a
   blank page icon and nothing on screen said whose site this was. */
function ncBrand() {
  if (!document.querySelector('link[rel="icon"]')) {
    const ic = document.createElement('link');
    ic.rel = 'icon'; ic.type = 'image/svg+xml'; ic.href = 'logo.svg';
    document.head.appendChild(ic);
  }
  const bar = document.querySelector('.sidebar');
  if (!bar || document.getElementById('ncbrand')) return;
  const a = document.createElement('a');
  a.id = 'ncbrand';
  a.href = 'index.html';
  /* Not a nav link: it sits above them and must not pick up the hover slide
     and the cyan underline the links have, or it reads as another page. */
  a.style.cssText = 'display:flex;align-items:center;gap:9px;padding:4px 20px 16px;text-decoration:none;';
  a.innerHTML =
    '<img src="logo.svg" alt="" width="30" height="30" style="flex:0 0 auto;filter:drop-shadow(0 0 10px rgba(0,240,255,0.35))">' +
    '<span style="font-size:1.18rem;font-weight:800;letter-spacing:-0.5px;color:#EAF2FF;' +
    'font-family:Segoe UI,-apple-system,sans-serif">Nova<span style="color:#00F0FF">Clip</span></span>';
  bar.insertBefore(a, bar.firstChild);
}


/* ============================================================================
   THE MINI AI  —  n8n chat widget, site-wide
   ============================================================================
   A floating assistant on every page, backed by an n8n workflow. Loaded from
   here rather than pasted into nine files, and it brings three things the bare
   two-line embed does not:

   IT COUNTS AS AN AI CHAT. parent.html reads nc_history to show a parent how
   much AI their child used, and ai.html has always written to it. A second
   assistant that skipped it would have left the Family Dashboard reporting "No
   AI chats yet" while a conversation was happening — a hole in the oversight
   this site sells, opened by accident.

   IT KEEPS THE 16+ PROMISE. The age gate tells 16 to 18 year olds that their
   chats are no longer logged for their parent. So for them the transcript is
   not written. The skill credit still is: that is the learner's own progress,
   not surveillance, and it is what certificates are counted from.

   IT SPEAKS THE SITE'S LANGUAGE. The chosen language rides along in metadata,
   so the workflow can answer in Persian to someone reading the site in Persian
   rather than defaulting to English.

   Hooked by wrapping fetch rather than by watching the DOM: the widget POSTs
   to the webhook and reads the reply, so that one call is the whole
   conversation. Reading it from the rendered bubbles would break the first
   time the package changed a class name.
   ============================================================================ */
const NC_AI_WEBHOOK = 'https://amirkondori.app.n8n.cloud/webhook/8777d9a6-8942-47f5-9b57-63f94f37a840/chat';

function ncRecordAIChat(q, a) {
  if (!q) return;
  try {
    // certificates count the reps whatever the age — that is the learner's own record
    if (typeof logSkill === 'function') logSkill('ai_ask');
    if (typeof ncControlsRelaxed === 'function' && ncControlsRelaxed()) return;  // 16+: no transcript
    saveHist('NovaClip Assistant', String(q).slice(0, 300), String(a || '').slice(0, 300));
  } catch (e) {}
}


/* ---- WHAT THE ASSISTANT KNOWS ABOUT YOUR CHANNEL ----
   Without this the assistant is a generic YouTube chatbot: it answers "how do I
   get more views" the same way for someone with 40 subscribers and someone with
   40,000, and it cannot tell you whether a video did well because it has never
   seen one of yours.

   So the connected channel rides along with every message. Not at createChat
   time — metadata there is captured once, and a session that starts before you
   connect would stay ignorant for its whole life. It is merged into the request
   body in the fetch hook instead, so it is current on every send and it starts
   working the moment you connect in Studio, mid-conversation.

   Cached for 30 minutes because the YouTube API has a daily quota and a chat is
   many messages. Refreshed in the background, never blocking the widget.

   When there is no connection this sends { connected: false } rather than
   nothing: the workflow can then say "connect your channel in Studio" instead of
   guessing at numbers it does not have — the failure mode being avoided is an
   assistant that invents a subscriber count. */
const NC_SNAP_TTL = 30 * 60 * 1000;

function ncYTToken() {
  try { const s = JSON.parse(localStorage.getItem('nc_yt') || 'null'); if (s && s.exp > Date.now()) return s.t; }
  catch (e) {}
  return null;
}

function ncCachedSnap() {
  try {
    const c = JSON.parse(localStorage.getItem('nc_ytsnap') || 'null');
    if (c && c.at && Date.now() - c.at < NC_SNAP_TTL) return c.data;
  } catch (e) {}
  return null;
}

async function ncChannelSnapshot(force) {
  const tok = ncYTToken();
  if (!tok) return { connected: false, why: 'no channel connected in Studio yet' };
  if (!force) { const c = ncCachedSnap(); if (c) return c; }

  const api = (u) => fetch('https://www.googleapis.com/youtube/v3/' + u, { headers: { Authorization: 'Bearer ' + tok } }).then(r => r.json());
  try {
    const ch = await api('channels?part=statistics,snippet,contentDetails&mine=true');
    const me = ch.items && ch.items[0];
    if (!me) return { connected: false, why: (ch.error && ch.error.message) || 'YouTube returned no channel' };

    const st = me.statistics || {}, sn = me.snippet || {};
    const data = {
      connected: true,
      title: sn.title || '',
      handle: (sn.customUrl || ''),
      description: (sn.description || '').slice(0, 300),
      created: (sn.publishedAt || '').slice(0, 10),
      subscribers: +st.subscriberCount || 0,
      totalViews: +st.viewCount || 0,
      videoCount: +st.videoCount || 0,
      recent: []
    };

    /* Recent uploads matter more than the totals: "is this one doing well" is
       the question people actually ask, and it needs something to compare to. */
    const up = me.contentDetails && me.contentDetails.relatedPlaylists && me.contentDetails.relatedPlaylists.uploads;
    if (up) {
      const pl = await api('playlistItems?part=contentDetails&playlistId=' + up + '&maxResults=10');
      const ids = (pl.items || []).map(i => i.contentDetails.videoId).filter(Boolean).join(',');
      if (ids) {
        const vs = await api('videos?part=statistics,snippet&id=' + ids);
        data.recent = (vs.items || []).map(v => ({
          title: (v.snippet && v.snippet.title) || '',
          published: ((v.snippet && v.snippet.publishedAt) || '').slice(0, 10),
          views: +(v.statistics && v.statistics.viewCount) || 0,
          likes: +(v.statistics && v.statistics.likeCount) || 0,
          comments: +(v.statistics && v.statistics.commentCount) || 0
        }));
        // the median, so the workflow can say "above your usual" without doing stats
        const vv = data.recent.map(r => r.views).sort((a, b) => a - b);
        if (vv.length) data.medianViews = vv[Math.floor(vv.length / 2)];
      }
    }
    localStorage.setItem('nc_ytsnap', JSON.stringify({ at: Date.now(), data: data }));
    return data;
  } catch (e) {
    return { connected: false, why: 'could not reach YouTube' };
  }
}

function ncWatchAIChat() {
  if (window.__ncAIWrapped || typeof window.fetch !== 'function') return;
  window.__ncAIWrapped = true;
  const orig = window.fetch;
  window.fetch = function (input, init) {
    let url = '';
    try { url = typeof input === 'string' ? input : (input && input.url) || ''; } catch (e) {}
    const mine = url.indexOf(NC_AI_WEBHOOK) === 0;
    let asked = '';
    if (mine && init && typeof init.body === 'string') {
      try { asked = (JSON.parse(init.body) || {}).chatInput || ''; } catch (e) {}
    }
    /* The channel goes out WITH the question. Building the body here rather
       than at init is what lets it be current on every message. */
    if (mine && asked) {
      const self = this;
      return ncChannelSnapshot().then(function (chan) {
        let body = init.body;
        try {
          const j = JSON.parse(init.body);
          j.channel = chan;
          body = JSON.stringify(j);
        } catch (e) {}
        return orig.call(self, input, Object.assign({}, init, { body: body }));
      }).then(function (res) {
        try {
          res.clone().json()
            .then(function (j) { ncRecordAIChat(asked, (j && (j.output || j.text || j.message)) || ''); })
            .catch(function () { ncRecordAIChat(asked, ''); });
        } catch (e) { ncRecordAIChat(asked, ''); }
        return res;
      });
    }

    const p = orig.apply(this, arguments);
    if (!mine || !asked) return p;
    /* clone before reading — a Response body can only be consumed once, and the
       widget still needs it to draw the reply */
    return p.then(function (res) {
      try {
        res.clone().json()
          .then(function (j) { ncRecordAIChat(asked, (j && (j.output || j.text || j.message)) || ''); })
          .catch(function () { ncRecordAIChat(asked, ''); });
      } catch (e) { ncRecordAIChat(asked, ''); }
      return res;
    });
  };
}

function ncMiniAI() {
  if (document.getElementById('ncChatCss')) return;
  ncWatchAIChat();

  const css = document.createElement('link');
  css.id = 'ncChatCss'; css.rel = 'stylesheet';
  css.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
  document.head.appendChild(css);

  /* The widget ships light and square. These pull it into the site's palette
     and lift it clear of the corners the points badge and the language box
     already occupy. */
  const st = document.createElement('style');
  st.textContent =
    ':root {' +
    '  --chat--color-primary: #7209B7; --chat--color-primary-shade-50: #5d0796;' +
    '  --chat--color-secondary: #00F0FF; --chat--color-white: #EAF2FF;' +
    '  --chat--color-dark: #05060A; --chat--color-light: #0B0E16;' +
    '  --chat--color-typing: #7E8AA6;' +
    '  --chat--toggle--background: linear-gradient(135deg,#FF2E97,#7209B7,#00F0FF);' +
    '  --chat--toggle--size: 56px;' +
    '  --chat--window--width: 380px; --chat--window--height: 560px;' +
    '  --chat--border-radius: 14px;' +
    '  --chat--header--background: #0B0E16; --chat--header--color: #EAF2FF;' +
    '  --chat--message--bot--background: rgba(255,255,255,0.05);' +
    '  --chat--message--bot--color: #EAF2FF;' +
    '  --chat--message--user--background: #7209B7; --chat--message--user--color: #fff;' +
    '  --chat--textarea--height: 54px;' +
    '}' +
    '#n8n-chat .chat-window-toggle { box-shadow: 0 8px 30px rgba(114,9,183,0.5); }' +
    /* bottom-right is where the editor keeps the points badge, so sit above it */
    '#n8n-chat { position: fixed; right: 18px; bottom: 92px; z-index: 996; }' +
    /* nothing floats over a match in progress */
    'body.ncplaying #n8n-chat { display: none !important; }' +
    '@media (max-width: 520px) { :root { --chat--window--width: 100vw; } }';
  document.head.appendChild(st);

  const host = document.createElement('div');
  host.id = 'n8n-chat';
  document.body.appendChild(host);

  const L = (typeof lang === 'function' && lang()) || 'en';
  import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js')
    .then(function (m) {
      m.createChat({
        webhookUrl: NC_AI_WEBHOOK,
        target: '#n8n-chat',
        mode: 'window',
        showWelcomeScreen: false,
        loadPreviousSession: true,
        /* the workflow gets to know who it is talking to, so it can answer in
           the right language and pitch it at the right age */
        metadata: { language: L, languageName: (LANGS[L] || 'English'), age: (typeof ncAge === 'function' ? ncAge() : 0), site: 'novaclip' },
        initialMessages: [tr('ai_hi') || 'Hey! Ask me anything about growing your channel.'],
        i18n: { en: {
          title: 'NovaClip Assistant',
          subtitle: tr('ai_sub') || 'Ask about titles, thumbnails, ideas — anything.',
          footer: '',
          getStarted: tr('ai_start') || 'New chat',
          inputPlaceholder: tr('ai_ph') || 'Ask NovaClip anything…'
        } }
      });
    })
    .catch(function (e) {
      /* Loaded from a CDN, so a blocked network or an offline device means no
         widget. Say so in the console rather than leaving a dead corner. */
      console.warn('NovaClip mini AI could not load (CDN unreachable?)', e);
      const h = document.getElementById('n8n-chat'); if (h) h.remove();
    });
}

window.addEventListener('DOMContentLoaded', () => {
  dedupeChrome();
  ncBrand();
  ncMiniAI();
  // warm the channel cache in the background so message one already has it
  if (ncYTToken()) setTimeout(function () { ncChannelSnapshot(); }, 1200);
  const badge = document.createElement('div'); badge.id = 'ncpts'; badge.textContent = getPts() + ' pts'; document.body.appendChild(badge);
  const t = document.createElement('div'); t.id = 'nctoast'; document.body.appendChild(t);
  const lpick = document.getElementById('langpick');
  if (lpick) { for (const c in LANGS) { const o = document.createElement('option'); o.value = c; o.textContent = LANGS[c]; lpick.appendChild(o); } lpick.value = lang(); lpick.onchange = () => applyLang(lpick.value); }
  applyTheme('Dark');   // fixed dark theme — background switcher removed
  applyLang(lang());
  refreshPanels();

  // extra sidebar links (Family / Pricing) injected on every page
  const sb = document.querySelector('.sidebar .themewrap');
  if (sb && !document.getElementById('ncfamlink')) {
    const prg = document.createElement('a'); prg.id = 'ncproglink'; prg.href = 'progress.html'; prg.setAttribute('data-t','progress'); prg.textContent = tr('progress');
    const fam = document.createElement('a'); fam.id = 'ncfamlink'; fam.href = 'parent.html'; fam.setAttribute('data-t','family'); fam.textContent = tr('family');
    const pri = document.createElement('a'); pri.href = 'pricing.html'; pri.setAttribute('data-t','pricing'); pri.textContent = tr('pricing');
    sb.parentNode.insertBefore(prg, sb); sb.parentNode.insertBefore(fam, sb); sb.parentNode.insertBefore(pri, sb);
  }
  applyLang(lang());

  applySeason();
  ncSyncBoot();
});

/* ===== SEASONAL EVENTS — automatic by date, no button =====
   Fixed dates use MM-DD every year; movable feasts (Islamic calendar, Easter,
   Diwali, Chinese New Year) use explicit dates per year (2026–2028). */
const SEASONS = [
  { name: 'Ramadan',        emo: '',  color: '#7bd4a8', ranges: [['2026-02-18','2026-03-19'],['2027-02-08','2027-03-09'],['2028-01-28','2028-02-26']], greet: 'Ramadan Kareem!' },
  { name: 'Eid al-Fitr',    emo: '',  color: '#ffd166', ranges: [['2026-03-20','2026-03-23'],['2027-03-10','2027-03-13'],['2028-02-27','2028-03-01']], greet: 'Eid Mubarak!' },
  { name: 'Eid al-Adha',    emo: '',  color: '#8fd694', ranges: [['2026-05-26','2026-05-30'],['2027-05-16','2027-05-20'],['2028-05-04','2028-05-08']], greet: 'Eid Mubarak!' },
  { name: 'Halloween',      emo: '',  color: '#ff8c42', ranges: 'yearly:10-24:11-01', greet: 'Happy Halloween!' },
  { name: 'Christmas',      emo: '',  color: '#ff5d5d', ranges: 'yearly:12-14:12-26', greet: 'Merry Christmas!' },
  { name: 'New Year',       emo: '',  color: '#ffd700', ranges: 'yearly:12-27:01-02', greet: 'Happy New Year!' },
  { name: 'Easter',         emo: '',  color: '#c3a6ff', ranges: [['2026-03-30','2026-04-06'],['2027-03-22','2027-03-29'],['2028-04-10','2028-04-17']], greet: 'Happy Easter!' },
  { name: 'Diwali',         emo: '',  color: '#ffb347', ranges: [['2026-11-05','2026-11-10'],['2027-10-25','2027-10-30'],['2028-10-14','2028-10-19']], greet: 'Happy Diwali!' },
  { name: 'Chinese New Year', emo: '', color: '#ff4d4d', ranges: [['2026-02-15','2026-02-19'],['2027-02-04','2027-02-08'],['2028-01-24','2028-01-28']], greet: 'Happy New Year!' }
];
function seasonActive(s, now) {
  const pad = n => (n < 10 ? '0' : '') + n;
  if (typeof s.ranges === 'string') {
    const [, a, b] = s.ranges.split(':');
    const md = pad(now.getMonth()+1) + '-' + pad(now.getDate());
    if (a <= b) return md >= a && md <= b;
    return md >= a || md <= b; // wraps year end (New Year)
  }
  const today = now.toISOString().slice(0,10);
  return s.ranges.some(([a,b]) => today >= a && today <= b);
}
function applySeason() {
  const now = new Date();
  const s = SEASONS.find(x => seasonActive(x, now));
  if (!s) return;
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:996;text-align:center;padding:6px 10px;font-weight:700;font-size:0.85rem;color:#0a0a12;background:' + s.color + ';box-shadow:0 2px 20px ' + s.color + '55;';
  bar.textContent = s.emo + '  ' + s.greet + '  ' + s.emo;
  document.body.appendChild(bar);
  document.body.style.paddingTop = '32px';
  // gentle falling emojis
  const emos = [...s.emo].filter(ch => ch.trim() && ch.codePointAt(0) > 255);
  for (let i = 0; i < 12; i++) {
    const e = document.createElement('div');
    e.textContent = emos[i % emos.length] || '';
    e.style.cssText = 'position:fixed;top:-30px;z-index:995;pointer-events:none;font-size:' + (14 + Math.random()*14) + 'px;left:' + (Math.random()*100) + 'vw;opacity:0.8;animation:ncfall ' + (7 + Math.random()*8) + 's linear ' + (Math.random()*10) + 's infinite;';
    document.body.appendChild(e);
  }
  const st = document.createElement('style');
  st.textContent = '@keyframes ncfall { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(110vh) rotate(360deg); } }';
  document.head.appendChild(st);
}

/* ============================================================
   NOVACLIP SAFETY & MODERATION
   Client-side detection + suspension. In production these
   decisions must be enforced server-side (Firebase Auth +
   Firestore rules) — a browser-only ban can be cleared by
   wiping local storage.
   ============================================================ */
(function () {
  const SLURS_AND_ABUSE = ['idiot','stupid','loser','ugly','fat','dumb','hate you','kill yourself','kys','shut up','freak','worthless','nobody likes you','trash','moron','pathetic','disgusting','retard','noob'];
  const SWEARS = ['fuck','shit','bitch','asshole','bastard','dick','cunt','whore','slut','piss','damn','crap','wank','prick'];

  function normalise(s) {
    return (s || '').toLowerCase()
      .replace(/[3]/g, 'e').replace(/[1!|]/g, 'i').replace(/[0]/g, 'o')
      .replace(/[4@]/g, 'a').replace(/[5$]/g, 's').replace(/[7]/g, 't')
      .replace(/[^a-z\s]/g, ' ');
  }

  // returns { ok, severity: 'clean'|'swear'|'abuse', hits: [] }
  window.ncModerate = function (text) {
    const t = normalise(text);
    const hits = [];
    let severity = 'clean';
    SWEARS.forEach(w => { if (t.includes(w)) { hits.push(w); severity = 'swear'; } });
    SLURS_AND_ABUSE.forEach(w => { if (t.includes(w)) { hits.push(w); severity = 'abuse'; } });
    return { ok: severity === 'clean', severity, hits };
  };

  // ---- suspensions ----
  function now() { return Date.now(); }
  window.ncSuspend = function (days, reason) {
    const until = now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem('nc_suspended_until', String(until));
    localStorage.setItem('nc_suspend_reason', reason || 'Community guidelines violation');
    const log = JSON.parse(localStorage.getItem('nc_mod_log') || '[]');
    log.push({ at: now(), days, reason });
    localStorage.setItem('nc_mod_log', JSON.stringify(log.slice(-40)));
    window.ncCheckSuspension();
  };
  window.ncStrike = function (reason) {
    const n = parseInt(localStorage.getItem('nc_strikes') || '0') + 1;
    localStorage.setItem('nc_strikes', String(n));
    const log = JSON.parse(localStorage.getItem('nc_mod_log') || '[]');
    log.push({ at: now(), strike: n, reason });
    localStorage.setItem('nc_mod_log', JSON.stringify(log.slice(-40)));
    if (n >= 3) { ncSuspend(7, 'Three strikes: ' + reason); return { suspended: true, strikes: n }; }
    return { suspended: false, strikes: n };
  };
  window.ncSuspendedFor = function () {
    const until = parseInt(localStorage.getItem('nc_suspended_until') || '0');
    return until > now() ? until - now() : 0;
  };
  window.ncCheckSuspension = function () {
    const left = ncSuspendedFor();
    if (!left) return false;
    const days = Math.ceil(left / 86400000);
    const reason = localStorage.getItem('nc_suspend_reason') || 'Community guidelines violation';
    let o = document.getElementById('ncSuspendScreen');
    if (!o) {
      o = document.createElement('div');
      o.id = 'ncSuspendScreen';
      o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#05060A;color:#EAF2FF;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font-family:Segoe UI,sans-serif;';
      o.innerHTML = '<div style="max-width:520px"><div style="font-size:3rem;margin-bottom:12px"></div>' +
        '<h1 style="font-size:1.8rem;margin-bottom:10px">Account suspended</h1>' +
        '<p style="color:#7E8AA6;line-height:1.7;margin-bottom:14px">Your access to NovaClip is paused for <b style="color:#FF2E97">' + days + ' day' + (days>1?'s':'') + '</b>.</p>' +
        '<div style="background:rgba(255,46,151,0.08);border-left:3px solid #FF2E97;border-radius:10px;padding:12px 16px;text-align:left;color:#b8bccb;font-size:0.9rem">Reason: ' + reason + '</div>' +
        '<p style="color:#7E8AA6;font-size:0.85rem;margin-top:16px">If you believe this is a mistake, ask a parent or guardian to contact support.</p></div>';
      document.body.appendChild(o);
    }
    return true;
  };

  // ---- age gate (13-18) ----
  window.ncAge = function () { return parseInt(localStorage.getItem('nc_user_age') || '0'); };
  window.ncControlsRelaxed = function () { const a = ncAge(); return a >= 16 && a <= 18; };

  /* ---- the age gate ----
     The old one asked the question and then answered it for you: "NovaClip is
     built for creators aged 13-18" sat directly above the box, and a number
     outside that range was refused with a message repeating the range, leaving
     the box editable. So it did not collect an age — it ran a guessing game
     with the answer printed on the card, and everybody who wanted in typed 15.

     Three changes, all pointing the same way:
       NOTHING IS EXPLAINED FIRST. Just the question. There is no band to aim
       for on screen, so the number you land on is the one you meant.
       ONE ANSWER, KEPT. Whatever comes back is written down and acted on. An
       out-of-range age is an outcome with its own screen, not a "try again"
       that hands you another go at the same box.
       A WHEEL, NOT A TEXT BOX. You spin it once and it commits. Typing invites
       a correction; a wheel does not, and it cannot be edited after you see
       what your answer led to. */
  window.ncAgeGate = function () {
    if (ncAge()) return;

    const o = document.createElement('div');
    o.id = 'ncAgeGate';
    o.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(5,6,10,0.96);color:#EAF2FF;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Segoe UI,sans-serif;backdrop-filter:blur(8px);';
    o.innerHTML = '<div style="width:100%;max-width:360px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px 26px">' +
      '<h2 style="margin-bottom:14px;font-size:1.5rem">How old are you?</h2>' +
      '<div id="ncWheelWrap" style="position:relative">' +
        '<div id="ncWheelBand"></div>' +
        '<div id="ncWheel" tabindex="0" role="listbox" aria-label="Your age"></div>' +
      '</div>' +
      '<button id="ncAgeGo" disabled style="width:100%;padding:14px;border:none;border-radius:30px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;font-size:1rem;opacity:0.35;transition:opacity .2s">Continue</button>' +
      '</div>';
    document.body.appendChild(o);

    const wheel = document.getElementById('ncWheel');
    const go = document.getElementById('ncAgeGo');
    const LOW = 5, HIGH = 99, H = 44;
    let rows = '<div style="height:88px"></div>';
    for (let a = LOW; a <= HIGH; a++) rows += '<div class="ncw" data-a="' + a + '" role="option">' + a + '</div>';
    wheel.innerHTML = rows + '<div style="height:88px"></div>';

    let picked = 0, touched = false;
    function paint() {
      const i = Math.round(wheel.scrollTop / H);
      picked = LOW + i;
      [].forEach.call(wheel.querySelectorAll('.ncw'), (el, n) => {
        const d = Math.abs(n - i);
        el.className = 'ncw' + (d === 0 ? ' on' : d === 1 ? ' near' : '');
        if (d === 0) el.setAttribute('aria-selected', 'true'); else el.removeAttribute('aria-selected');
      });
    }
    /* Continue stays dead until the wheel is actually moved. Without this the
       age it happens to open on becomes the answer for anyone who just clicks
       through — which is the same problem in a new shape. */
    function arm() { touched = true; go.disabled = false; go.style.opacity = '1'; }

    let raf = 0;
    wheel.addEventListener('scroll', () => {
      arm();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    });
    wheel.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      arm();
      wheel.scrollTop += (e.key === 'ArrowDown' ? 1 : -1) * H;
    });
    wheel.scrollTop = 0;      // opens at the bottom of the range, hinting nothing
    paint();

    /* One screen, one outcome. It replaces the card rather than sitting under
       it, so there is no box left to change your mind in. */
    function outcome(title, body, cta) {
      o.innerHTML = '<div style="width:100%;max-width:420px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px 26px">' +
        '<h2 style="margin-bottom:10px;font-size:1.4rem">' + title + '</h2>' +
        '<p style="color:#7E8AA6;font-size:0.94rem;line-height:1.7">' + body + '</p>' +
        (cta || '') + '</div>';
    }

    go.onclick = () => {
      if (!touched) return;
      const a = picked;
      localStorage.setItem('nc_user_age', String(a));   // written first, whatever it is

      if (a < 13) {
        outcome('Thanks for being honest.',
          'NovaClip needs verified parental consent for creators under 13, so we cannot open an account from here yet. ' +
          'Ask a parent or guardian to set one up for you from the Family Dashboard.',
          '<a href="parent.html" style="display:inline-block;margin-top:18px;padding:13px 28px;border-radius:30px;font-weight:800;text-decoration:none;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a">Open the Family Dashboard</a>');
        return;
      }
      if (a > 18) {
        outcome('You are over 18.',
          'NovaClip is built for creators aged 13 to 18, so this will not be your account — but it can be your child’s. ' +
          'The Family Dashboard is the grown-up side: controls, activity and the comment scanner.',
          '<a href="parent.html" style="display:inline-block;margin-top:18px;padding:13px 28px;border-radius:30px;font-weight:800;text-decoration:none;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a">Open the Family Dashboard</a>');
        return;
      }

      if (a >= 16) {
        localStorage.setItem('nc_controls_relaxed', '1');
        /* Was an alert(), which is a browser dialog on a page that has its own
           voice — and it fired before the user had seen the site at all. */
        outcome('You are 16 or over.',
          'Monitoring is lighter from here: your chats are no longer logged for your parent. ' +
          'Parental controls can still only be fully removed by your parent, from the Family Dashboard.',
          '<button id="ncAgeDone" style="margin-top:18px;padding:13px 30px;border:none;border-radius:30px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;font-size:0.98rem">Got it</button>');
        const done = document.getElementById('ncAgeDone');
        if (done) done.onclick = () => o.remove();
        return;
      }
      o.remove();
    };
  };

  // run on every page
  document.addEventListener('DOMContentLoaded', function () { ncCheckSuspension(); });
  if (document.readyState !== 'loading') ncCheckSuspension();
})();

/* ============================================================
   GEN-Z / NORMAL TEXT TOGGLE
   ============================================================ */
(function () {
  const GENZ = {
    hero_line1:'run ur channel', hero_line2:'like a game fr',
    startchannel:'lock in', seerewards:'peep the rewards',
    home:'Home', studio:'Studio', analytics:'Stats', trends:'Whats Hot',
    editor:'Editor', sniper:'Games', ai:'NovaClip AI',
    studio_h:'NovaClip Studio', studio_sub:'link ur channel n scope the competition',
    analytics_h:'Stats', analytics_sub:'ur numbers vs the ops — no cap',
    analytics_hint:'link ur channel to pull the stats.',
    t_comp:'closest ops', t_comp_d:'channels ur size — full stats, no cap.',
    t_duel:'1v1 a channel', t_duel_d:'run it with a channel within 20k subs n bag points.',
    t_analytics:'full stats', t_analytics_d:'deep charts vs the ops — own page.',
    e_media:'Media', e_effects:'FX', e_audio:'Sound', e_memes:'Memes', e_text:'Text', e_voice:'Voice',
    e_effects_h:'fx n filters', e_memes_h:'meme search', e_text_h:'text on screen',
    e_voice_h:'AI voiceover', e_clip_h:'selected clip', e_filter:'filter', e_trans:'transition',
    e_import:'⊕ drop ur media', e_export:'export',
    language:'Language',

    /* The other 68 keys. Gen Z mode covered a third of the site, so switching it
       on gave you a slang homepage and a plain everything-else — which reads as
       half-finished rather than as a mode. Every data-t key the site actually
       uses now has a line here, so the switch changes the whole thing. */
    eyebrow:'for teen creators · 13-18', scrolldown:'▼ keep scrolling',
    sec1_h1:'smart', sec1_h2:'coaching', sec2_h1:'fair', sec2_h2:'fights',
    sec_play:'play', sec_nums:'the numbers', play_h:'grind for real rewards',
    nums_h:'built different', trend_h:'whats hot rn', trend_p:'find the wave before it breaks',
    final_h:"ur channel's <span class='g'>next level</span><br>starts in a tab.",
    final_p:'no downloads. no card. just open it and go.', final_btn:'lock in',
    footer:'made for creators who are still in school',
    card_ai_d:'three tutors on call, in ur language, tuned for teen creators. ask, learn, level up.',
    card_duel_d:'only fight channels within 20k subs. subs and views pick the winner. win = points.',
    card_quest_d:'quests, streaks and badges for actually doing the work.',
    coach1:'channel coach', coach1d:'titles, hooks and growth that actually work',
    coach2:'space tutor',   coach2d:'turn curiosity into stuff people watch',
    coach3:'money tutor',   coach3d:'side hustles and smart moves, no waffle',
    meta_ai:'AI tutors on call', meta_editor:'browser editor', meta_rewards:'quests & rewards',
    st_languages:'languages', st_games:'games', st_tools:'tools', st_downloads:'downloads',
    how1:'connect ur channel', how2:'do the work', how3:'get the badge',
    ticker:"<b>AI TUTORS</b> · <i>VIDEO EDITOR</i> · <u>CHANNEL DUELS</u> · <b>TREND RADAR</b> · <i>GAMES</i> · <u>STATS</u> · <b>REWARDS</b> · ",
    signin:'sign in w google', ask:'ask', scan:'scan it', scanning:'scanning...',
    video:'video', thumb:'thumbnail', compare:'compare w rivals',
    fight:'fight!', duel_label:'views + subs duel (max 20k sub gap)',
    ai_h:'NovaClip AI',
    quests:'quests', achievements:'achievements', history:'ur chats', recent:'recent',
    xp_progress:'progress', prog_h:'ur progress', prog_sub:'everything u earned, in one place',
    prog_skills:'skills', prog_skills_d:'what u have actually practised',
    prog_rewards_d:'stuff u unlocked', prog_ach_d:'badges u earned', prog_hist_d:'ur AI chats',
    rw1_t:'first upload', rw1_d:'export a video from the editor',
    rw2_t:'trend hunter', rw2_d:'run 3 trend scans',
    rw3_t:'sharpshooter', rw3_d:'top the arena board',
    credits_btn:'credits', credits_note:'every model and sound, and who made it',
    e_learn:'learn', e_learn_h:'learn'
  };

  /* ==========================================================================
     NOVACLIP PRO
     One place that answers "has this family paid, and for what". Everything
     that is supposed to be a Pro feature asks here rather than each page
     inventing its own check — so a feature cannot end up gated on one page and
     free on another, which is exactly how a paid plan stops being trusted.

       ncPro()          the whole record, or null
       ncProHas('tools')  priority AI, longer exports, extra effects, skins
       ncProHas('family') parental controls, PIN, activity overview
     ========================================================================== */
  window.ncPro = function () {
    try { return JSON.parse(localStorage.getItem('nc_pro') || 'null'); } catch (e) { return null; }
  };
  window.ncProHas = function (what) {
    const p = ncPro();
    return !!(p && p[what]);
  };

  /* The badge. A plan you cannot see is a plan people forget they are paying
     for, so Pro says so on every page — and on the pages where it changes what
     you get, the feature says which plan unlocked it. */
  window.ncBuildProBadge = function () {
    const p = ncPro();
    if (!p || document.getElementById('ncprobadge')) return;
    const b = document.createElement('a');
    b.id = 'ncprobadge';
    b.href = 'pro.html';
    b.textContent = 'PRO';
    b.title = 'NovaClip Pro — ' + (p.plans || []).join(', ');
    b.style.cssText = 'position:fixed;top:14px;right:96px;z-index:995;padding:5px 12px;border-radius:20px;' +
      'font:800 0.7rem/1 system-ui,sans-serif;letter-spacing:2px;text-decoration:none;color:#04121a;' +
      'background:linear-gradient(90deg,#B6FF3C,#00F0FF);box-shadow:0 4px 16px rgba(0,240,255,0.3);';
    document.body.appendChild(b);
  };

  window.ncGenZ = function () { return localStorage.getItem('nc_genz') === '1'; };

  window.ncApplyGenZ = function () {
    if (!ncGenZ()) return;                       // normal mode: leave translations alone
    const lang = localStorage.getItem('nc_lang') || 'en';
    if (lang !== 'en') return;                   // slang only makes sense in English
    document.querySelectorAll('[data-t]').forEach(el => {
      const k = el.getAttribute('data-t');
      const v = GENZ[k];
      if (!v) return;
      /* Some strings carry markup — the headline has a coloured span, the ticker
         has bold and italics. textContent would print "<span class='g'>" on the
         page as text, so anything with a tag in it goes in as HTML. Same rule
         the translator already uses, for the same reason. */
      if (/<[a-z][\s\S]*>/i.test(v)) el.innerHTML = v; else el.textContent = v;
    });
  };

  window.ncSetGenZ = function (on) {
    localStorage.setItem('nc_genz', on ? '1' : '0');
    location.reload();
  };

  // toggle switch, injected into every sidebar
  window.ncBuildGenZToggle = function () {
    if (document.getElementById('genzwrap')) return;
    /* Not every page has a sidebar — pricing, the editor and the family page do
       not — and on those the switch simply never appeared, so the mode was
       unreachable from half the site. Fall back to a small floating control in
       the corner rather than skipping the page. */
    let wrap = document.querySelector('.themewrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'themewrap';
      wrap.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:900;width:190px;' +
        'background:rgba(10,12,20,0.82);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.12);' +
        'border-radius:12px;padding:10px 12px;';
      document.body.appendChild(wrap);
    }
    const on = ncGenZ();
    const d = document.createElement('div');
    d.id = 'genzwrap';
    d.style.cssText = 'margin-bottom:14px;';
    d.innerHTML =
      '<label data-t="vibe" style="display:block;font-size:0.78rem;opacity:0.6;margin-bottom:6px;">' + tr('vibe') + '</label>' +
      '<div id="genzToggle" style="display:flex;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:10px;overflow:hidden;cursor:pointer;font-size:0.8rem;font-weight:700;">' +
      '<div data-v="0" data-t="vibe_normal" style="flex:1;text-align:center;padding:8px 4px;transition:.2s;' + (!on ? 'background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;' : 'color:#7E8AA6;') + '">' + tr('vibe_normal') + '</div>' +
      '<div data-v="1" data-t="vibe_genz" style="flex:1;text-align:center;padding:8px 4px;transition:.2s;' + (on ? 'background:linear-gradient(90deg,#F72585,#7209B7);color:#fff;' : 'color:#7E8AA6;') + '">' + tr('vibe_genz') + '</div>' +
      '</div>';
    wrap.insertBefore(d, wrap.firstChild);
    d.querySelectorAll('[data-v]').forEach(b => {
      b.onclick = () => ncSetGenZ(b.dataset.v === '1');
    });
  };

  function boot() { ncBuildGenZToggle(); ncBuildProBadge(); setTimeout(ncApplyGenZ, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
