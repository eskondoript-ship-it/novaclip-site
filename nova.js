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
  nav_channel: { en:"Channel", zh:"频道", hi:"चैनल", es:"Canal", ar:"القناة", fr:"Chaîne", bn:"চ্যানেল", pt:"Canal", ru:"Канал", ur:"چینل", id:"Kanal", de:"Kanal", ja:"チャンネル", tr:"Kanal", ko:"채널", fa:"کانال", uk:"Канал", it:"Canale", pl:"Kanał", vi:"Kênh" },
  nav_create: { en:"Create", zh:"创作", hi:"बनाएँ", es:"Crear", ar:"إنشاء", fr:"Créer", bn:"তৈরি করুন", pt:"Criar", ru:"Создать", ur:"بنائیں", id:"Buat", de:"Erstellen", ja:"作成", tr:"Oluştur", ko:"만들기", fa:"ساخت", uk:"Створити", it:"Crea", pl:"Utwórz", vi:"Tạo" },
  nav_learn: { en:"Learn", zh:"学习", hi:"सीखें", es:"Aprender", ar:"تعلّم", fr:"Apprendre", bn:"শিখুন", pt:"Aprender", ru:"Учиться", ur:"سیکھیں", id:"Belajar", de:"Lernen", ja:"学ぶ", tr:"Öğren", ko:"배우기", fa:"یادگیری", uk:"Навчатися", it:"Impara", pl:"Ucz się", vi:"Học" },
  nav_you: { en:"You", zh:"你", hi:"आप", es:"Tú", ar:"أنت", fr:"Toi", bn:"তুমি", pt:"Tu", ru:"Ты", ur:"آپ", id:"Kamu", de:"Du", ja:"あなた", tr:"Sen", ko:"당신", fa:"شما", uk:"Ти", it:"Tu", pl:"Ty", vi:"Bạn" },
  life: { en:"NovaLife", zh:"NovaLife", hi:"NovaLife", es:"NovaLife", ar:"NovaLife", fr:"NovaLife", bn:"NovaLife", pt:"NovaLife", ru:"NovaLife", ur:"NovaLife", id:"NovaLife", de:"NovaLife", ja:"NovaLife", tr:"NovaLife", ko:"NovaLife", fa:"NovaLife", uk:"NovaLife", it:"NovaLife", pl:"NovaLife", vi:"NovaLife" },
  /* The page was called Publish and never published anything — it plans the
     edit, now carries it out, writes the words and holds a reminder. "AI
     Editor" is what it does. Every language is renamed with it; leaving the
     table alone would rename the page in English only. */
  publish: { en:"AI Editor", zh:"AI 编辑器", hi:"AI एडिटर", es:"Editor IA", ar:"محرر الذكاء الاصطناعي", fr:"Éditeur IA", bn:"AI এডিটর", pt:"Editor IA", ru:"ИИ-редактор", ur:"AI ایڈیٹر", id:"Editor AI", de:"KI-Editor", ja:"AIエディタ", tr:"AI Düzenleyici", ko:"AI 편집기", fa:"ویرایشگر هوش مصنوعی", uk:"ШІ-редактор", it:"Editor IA", pl:"Edytor AI", vi:"Trình sửa AI" },
  socials: { en:"Socials", zh:"社交", hi:"सोशल", es:"Redes", ar:"التواصل", fr:"Réseaux", bn:"সোশ্যাল", pt:"Redes sociais", ru:"Соцсети", ur:"سوشلز", id:"Media sosial", de:"Social Media", ja:"SNS", tr:"Sosyal medya", ko:"소셜", fa:"شبکه‌های اجتماعی", uk:"Соцмережі", it:"Social", pl:"Sociale", vi:"Mạng xã hội" },
  /* MISSING, AND IT SHOWED. NC_NAV looks its labels up by these keys, and
     'games' was never here — so nine rail entries translated and one sat in
     English on every page in every language. */
  games: { en:"Games", zh:"游戏", hi:"गेम्स", es:"Juegos", ar:"الألعاب", fr:"Jeux", bn:"গেমস", pt:"Jogos", ru:"Игры", ur:"گیمز", id:"Game", de:"Spiele", ja:"ゲーム", tr:"Oyunlar", ko:"게임", fa:"بازی‌ها", uk:"Ігри", it:"Giochi", pl:"Gry", vi:"Trò chơi" },
  /* The second line of the profile card when no channel is connected. It was
     the string 'Creator', written straight into the markup. */
  ui_creator: { en:"Creator", zh:"创作者", hi:"क्रिएटर", es:"Creador", ar:"صانع محتوى", fr:"Créateur", bn:"ক্রিয়েটর", pt:"Criador", ru:"Автор", ur:"تخلیق کار", id:"Kreator", de:"Creator", ja:"クリエイター", tr:"Üretici", ko:"크리에이터", fa:"سازنده", uk:"Автор", it:"Creator", pl:"Twórca", vi:"Nhà sáng tạo" },
  /* THE ASK CARD. Six strings, hard-coded in nova-ask.js, on the first thing
     a returning reader sees three seconds into any page. */
  ask_h: { en:"What would you like to do today?", zh:"今天想做点什么？", hi:"आज आप क्या करना चाहेंगे?", es:"¿Qué quieres hacer hoy?", ar:"ماذا تريد أن تفعل اليوم؟", fr:"Que veux-tu faire aujourd'hui ?", bn:"আজ কী করতে চান?", pt:"O que queres fazer hoje?", ru:"Чем займёмся сегодня?", ur:"آج آپ کیا کرنا چاہیں گے؟", id:"Mau melakukan apa hari ini?", de:"Was möchtest du heute machen?", ja:"今日は何をしますか？", tr:"Bugün ne yapmak istersin?", ko:"오늘은 무엇을 할까요?", fa:"امروز می‌خواهی چه کار کنی؟", uk:"Чим займемося сьогодні?", it:"Cosa vuoi fare oggi?", pl:"Co chcesz dziś zrobić?", vi:"Hôm nay bạn muốn làm gì?" },
  ask_sub: { en:"Type it and I will take you there.", zh:"输入一下，我带你过去。", hi:"लिखिए, मैं आपको वहाँ ले चलता हूँ।", es:"Escríbelo y te llevo.", ar:"اكتبها وسآخذك إلى هناك.", fr:"Écris-le et je t'y emmène.", bn:"লিখুন, আমি নিয়ে যাচ্ছি।", pt:"Escreve e eu levo-te lá.", ru:"Напиши — и я отведу.", ur:"لکھیں، میں آپ کو وہاں لے جاتا ہوں۔", id:"Ketik saja, aku antar ke sana.", de:"Schreib es, ich bringe dich hin.", ja:"入力すれば、そこへ案内します。", tr:"Yaz, seni oraya götüreyim.", ko:"입력하면 그곳으로 데려다줄게요.", fa:"بنویس تا تو را ببرم آنجا.", uk:"Напиши — і я відведу.", it:"Scrivilo e ti ci porto.", pl:"Napisz, a cię tam zabiorę.", vi:"Gõ vào và tôi sẽ đưa bạn tới đó." },
  ask_ph: { en:"I want to edit a video…", zh:"我想剪辑视频……", hi:"मुझे वीडियो एडिट करना है…", es:"Quiero editar un vídeo…", ar:"أريد تحرير مقطع…", fr:"Je veux monter une vidéo…", bn:"আমি ভিডিও এডিট করতে চাই…", pt:"Quero editar um vídeo…", ru:"Хочу смонтировать видео…", ur:"میں ویڈیو ایڈٹ کرنا چاہتا ہوں…", id:"Aku mau mengedit video…", de:"Ich will ein Video schneiden…", ja:"動画を編集したい…", tr:"Bir video düzenlemek istiyorum…", ko:"영상을 편집하고 싶어요…", fa:"می‌خواهم ویدیو تدوین کنم…", uk:"Хочу змонтувати відео…", it:"Voglio montare un video…", pl:"Chcę zmontować film…", vi:"Tôi muốn chỉnh sửa video…" },
  ask_go: { en:"Go", zh:"前往", hi:"चलो", es:"Ir", ar:"انطلق", fr:"Aller", bn:"চলুন", pt:"Ir", ru:"Вперёд", ur:"چلیں", id:"Buka", de:"Los", ja:"移動", tr:"Git", ko:"이동", fa:"برو", uk:"Уперед", it:"Vai", pl:"Idź", vi:"Đi" },
  ask_not_now: { en:"Not now", zh:"暂不", hi:"अभी नहीं", es:"Ahora no", ar:"ليس الآن", fr:"Pas maintenant", bn:"এখন নয়", pt:"Agora não", ru:"Не сейчас", ur:"ابھی نہیں", id:"Nanti saja", de:"Nicht jetzt", ja:"あとで", tr:"Şimdi değil", ko:"나중에", fa:"الان نه", uk:"Не зараз", it:"Non ora", pl:"Nie teraz", vi:"Để sau" },
  ask_close: { en:"Close", zh:"关闭", hi:"बंद करें", es:"Cerrar", ar:"إغلاق", fr:"Fermer", bn:"বন্ধ", pt:"Fechar", ru:"Закрыть", ur:"بند کریں", id:"Tutup", de:"Schließen", ja:"閉じる", tr:"Kapat", ko:"닫기", fa:"بستن", uk:"Закрити", it:"Chiudi", pl:"Zamknij", vi:"Đóng" },
  /* THE TEN CATEGORY NAMES, under ccat_ rather than cat_ — the Trend Spotter
     already owns a cat_ block further down this table (cat_football,
     cat_cricket, cat_pop…) and six of its ids are words these ten also use.
     In one object literal the later key wins, so sharing the prefix would have
     handed the rail card the Trend Spotter's wording silently. categories.js
     owns the list; the words live here,
     with every other word on the site, and labelOf() asks for them by id. A
     category somebody typed in themselves is their own text and is handed back
     exactly as typed — translating what a person wrote is not translation. */
  ccat_classic: { en:"Classic", zh:"经典", hi:"क्लासिक", es:"Clásico", ar:"كلاسيكي", fr:"Classique", bn:"ক্লাসিক", pt:"Clássico", ru:"Классика", ur:"کلاسک", id:"Klasik", de:"Klassisch", ja:"クラシック", tr:"Klasik", ko:"클래식", fa:"کلاسیک", uk:"Класика", it:"Classico", pl:"Klasyczny", vi:"Cổ điển" },
  ccat_gaming: { en:"Gaming", zh:"游戏", hi:"गेमिंग", es:"Videojuegos", ar:"الألعاب", fr:"Jeux vidéo", bn:"গেমিং", pt:"Jogos", ru:"Игры", ur:"گیمنگ", id:"Gaming", de:"Gaming", ja:"ゲーム", tr:"Oyun", ko:"게임", fa:"بازی", uk:"Ігри", it:"Gaming", pl:"Gaming", vi:"Game" },
  ccat_music: { en:"Music", zh:"音乐", hi:"संगीत", es:"Música", ar:"الموسيقى", fr:"Musique", bn:"সংগীত", pt:"Música", ru:"Музыка", ur:"موسیقی", id:"Musik", de:"Musik", ja:"音楽", tr:"Müzik", ko:"음악", fa:"موسیقی", uk:"Музика", it:"Musica", pl:"Muzyka", vi:"Âm nhạc" },
  ccat_sport: { en:"Sport", zh:"体育", hi:"खेल", es:"Deporte", ar:"الرياضة", fr:"Sport", bn:"খেলা", pt:"Desporto", ru:"Спорт", ur:"کھیل", id:"Olahraga", de:"Sport", ja:"スポーツ", tr:"Spor", ko:"스포츠", fa:"ورزش", uk:"Спорт", it:"Sport", pl:"Sport", vi:"Thể thao" },
  ccat_irl: { en:"Vlogs and everyday", zh:"日常与 Vlog", hi:"व्लॉग और रोज़मर्रा", es:"Vlogs y día a día", ar:"فلوغات والحياة اليومية", fr:"Vlogs et quotidien", bn:"ভ্লগ ও দৈনন্দিন", pt:"Vlogs e dia a dia", ru:"Влоги и быт", ur:"ولاگ اور روزمرہ", id:"Vlog dan keseharian", de:"Vlogs und Alltag", ja:"日常とVlog", tr:"Vlog ve günlük hayat", ko:"브이로그와 일상", fa:"ولاگ و زندگی روزمره", uk:"Влоги та побут", it:"Vlog e quotidiano", pl:"Vlogi i codzienność", vi:"Vlog và đời thường" },
  ccat_learning: { en:"Learning and school", zh:"学习与校园", hi:"पढ़ाई और स्कूल", es:"Estudios y escuela", ar:"التعلّم والمدرسة", fr:"Études et école", bn:"পড়াশোনা ও স্কুল", pt:"Estudos e escola", ru:"Учёба и школа", ur:"تعلیم اور اسکول", id:"Belajar dan sekolah", de:"Lernen und Schule", ja:"勉強と学校", tr:"Öğrenme ve okul", ko:"학습과 학교", fa:"یادگیری و مدرسه", uk:"Навчання і школа", it:"Studio e scuola", pl:"Nauka i szkoła", vi:"Học tập và trường lớp" },
  ccat_art: { en:"Art and making", zh:"艺术与手作", hi:"कला और क्राफ्ट", es:"Arte y manualidades", ar:"الفن والصناعة اليدوية", fr:"Art et création", bn:"শিল্প ও নির্মাণ", pt:"Arte e criação", ru:"Искусство и рукоделие", ur:"فن اور دستکاری", id:"Seni dan kriya", de:"Kunst und Basteln", ja:"アートともの作り", tr:"Sanat ve el işi", ko:"예술과 만들기", fa:"هنر و ساخت", uk:"Мистецтво і рукоділля", it:"Arte e creazioni", pl:"Sztuka i tworzenie", vi:"Nghệ thuật và chế tác" },
  ccat_food: { en:"Food", zh:"美食", hi:"खाना", es:"Comida", ar:"الطعام", fr:"Cuisine", bn:"খাবার", pt:"Comida", ru:"Еда", ur:"کھانا", id:"Makanan", de:"Essen", ja:"料理", tr:"Yemek", ko:"음식", fa:"غذا", uk:"Їжа", it:"Cibo", pl:"Jedzenie", vi:"Ẩm thực" },
  ccat_comedy: { en:"Comedy and sketches", zh:"喜剧与短剧", hi:"कॉमेडी और स्केच", es:"Comedia y sketches", ar:"الكوميديا والإسكتشات", fr:"Humour et sketches", bn:"কমেডি ও স্কেচ", pt:"Comédia e sketches", ru:"Юмор и скетчи", ur:"کامیڈی اور اسکیچ", id:"Komedi dan sketsa", de:"Comedy und Sketche", ja:"コメディとコント", tr:"Komedi ve skeçler", ko:"코미디와 스케치", fa:"کمدی و اسکچ", uk:"Гумор і скетчі", it:"Commedia e sketch", pl:"Komedia i skecze", vi:"Hài và tiểu phẩm" },
  ccat_tech: { en:"Tech", zh:"科技", hi:"टेक", es:"Tecnología", ar:"التقنية", fr:"Tech", bn:"টেক", pt:"Tecnologia", ru:"Технологии", ur:"ٹیک", id:"Teknologi", de:"Technik", ja:"テック", tr:"Teknoloji", ko:"테크", fa:"فناوری", uk:"Технології", it:"Tecnologia", pl:"Technologia", vi:"Công nghệ" },
  /* THE ASK CARD CHIPS, BY DESTINATION RATHER THAN BY CATEGORY.
     categories.js writes a specific chip for each category — "Edit a gameplay
     clip", "Cut a music video", "Find the flat seconds" — thirty strings, and
     every one of them was English on a Persian page. Thirty into twenty
     languages is six hundred strings for three buttons, so these seven say
     where the chip GOES instead, one per destination, and the specific English
     wording is kept for English. A chip reading "Edit a video" in your own
     language beats one reading "Edit a gameplay clip" in somebody elses. */
  chip_editor: { en:"Edit a video", zh:"剪辑视频", hi:"वीडियो एडिट करें", es:"Editar un vídeo", ar:"حرّر مقطعًا", fr:"Monter une vidéo", bn:"ভিডিও এডিট করুন", pt:"Editar um vídeo", ru:"Смонтировать видео", ur:"ویڈیو ایڈٹ کریں", id:"Edit video", de:"Video schneiden", ja:"動画を編集", tr:"Video düzenle", ko:"영상 편집", fa:"تدوین ویدیو", uk:"Змонтувати відео", it:"Montare un video", pl:"Zmontuj film", vi:"Chỉnh sửa video" },
  chip_trends: { en:"Find an idea", zh:"找灵感", hi:"आइडिया खोजें", es:"Buscar una idea", ar:"ابحث عن فكرة", fr:"Trouver une idée", bn:"আইডিয়া খুঁজুন", pt:"Encontrar uma ideia", ru:"Найти идею", ur:"آئیڈیا ڈھونڈیں", id:"Cari ide", de:"Idee finden", ja:"アイデアを探す", tr:"Fikir bul", ko:"아이디어 찾기", fa:"پیدا کردن ایده", uk:"Знайти ідею", it:"Trovare unidea", pl:"Znajdź pomysł", vi:"Tìm ý tưởng" },
  chip_ai: { en:"Ask the AI", zh:"问问 AI", hi:"एआई से पूछें", es:"Preguntar a la IA", ar:"اسأل الذكاء الاصطناعي", fr:"Demander à IA", bn:"এআই-কে জিজ্ঞাসা করুন", pt:"Perguntar à IA", ru:"Спросить ИИ", ur:"اے آئی سے پوچھیں", id:"Tanya AI", de:"KI fragen", ja:"AIに聞く", tr:"YZye sor", ko:"AI에게 묻기", fa:"از هوش مصنوعی بپرس", uk:"Запитати ШІ", it:"Chiedere alla IA", pl:"Zapytaj AI", vi:"Hỏi AI" },
  chip_hype: { en:"Find the slow bit", zh:"找出拖沓片段", hi:"सुस्त हिस्सा ढूँढें", es:"Encontrar la parte lenta", ar:"ابحث عن الجزء الممل", fr:"Trouver le passage mou", bn:"ধীর অংশটি খুঁজুন", pt:"Encontrar a parte lenta", ru:"Найти скучное место", ur:"سست حصہ تلاش کریں", id:"Cari bagian yang lambat", de:"Die zähe Stelle finden", ja:"間延びした所を探す", tr:"Yavaş kısmı bul", ko:"늘어지는 부분 찾기", fa:"پیدا کردن بخش کسل‌کننده", uk:"Знайти нудне місце", it:"Trovare il punto lento", pl:"Znajdź nudny fragment", vi:"Tìm đoạn chậm" },
  chip_photo: { en:"Edit a photo", zh:"修图", hi:"फ़ोटो एडिट करें", es:"Editar una foto", ar:"حرّر صورة", fr:"Retoucher une photo", bn:"ছবি এডিট করুন", pt:"Editar uma foto", ru:"Обработать фото", ur:"تصویر ایڈٹ کریں", id:"Edit foto", de:"Foto bearbeiten", ja:"写真を編集", tr:"Fotoğraf düzenle", ko:"사진 편집", fa:"ویرایش عکس", uk:"Обробити фото", it:"Modificare una foto", pl:"Edytuj zdjęcie", vi:"Chỉnh sửa ảnh" },
  chip_aiedit: { en:"Get it ready to post", zh:"准备发布", hi:"पोस्ट के लिए तैयार करें", es:"Dejarlo listo para publicar", ar:"جهّزه للنشر", fr:"Le préparer à publier", bn:"পোস্টের জন্য তৈরি করুন", pt:"Deixar pronto para publicar", ru:"Подготовить к публикации", ur:"پوسٹ کے لیے تیار کریں", id:"Siapkan untuk diunggah", de:"Zum Posten fertig machen", ja:"投稿できる状態にする", tr:"Paylaşıma hazırla", ko:"게시할 준비 하기", fa:"آماده‌سازی برای انتشار", uk:"Підготувати до публікації", it:"Prepararlo alla pubblicazione", pl:"Przygotuj do publikacji", vi:"Chuẩn bị để đăng" },
  chip_games: { en:"Play something", zh:"玩点什么", hi:"कुछ खेलें", es:"Jugar a algo", ar:"العب شيئًا", fr:"Jouer à quelque chose", bn:"কিছু খেলুন", pt:"Jogar alguma coisa", ru:"Сыграть во что-нибудь", ur:"کچھ کھیلیں", id:"Main sesuatu", de:"Etwas spielen", ja:"何か遊ぶ", tr:"Bir şey oyna", ko:"뭔가 플레이하기", fa:"یک بازی کن", uk:"Зіграти у щось", it:"Giocare a qualcosa", pl:"Zagraj w coś", vi:"Chơi gì đó" },
  /* The first option of the cyber theme picker, which sat in the top bar in
     English on every page in every language. The twelve theme names below it
     are left as they are: they are names, like NovaCoins. */
  /* NOVACOINS. Kept in English the last two times on the grounds that it is
     the product naming its own thing, like the wordmark. Asked for anyway,
     and the ask is reasonable: it is the label under a number somebody is
     trying to read, not a logo. "Nova" stays — that half IS the name — and
     the coin half is translated or transliterated into the script being
     read, which is what every game currency does. */
  /* THE WELCOME DIALOG, IN TWENTY LANGUAGES.
     It was the last thing on the site still written in English, and it was
     the worst place for that: the first screen of a first visit, before
     anybody has seen a word of the site they came for. Every other dialog
     went through this table years ago; this one was built in a hurry and
     never came back.

     Keys are wel_*. The ones carrying <b> are looked up with innerHTML by
     applyLangText, which is why the markup is inside the string rather than
     around it. wel_cat_hi has a {n} for the reader’s own name and is
     filled in at the moment it is shown. */
  wel_aria: { en:"Welcome to NovaClip", zh:"欢迎来到 NovaClip", hi:"NovaClip में आपका स्वागत है", es:"Bienvenido a NovaClip", ar:"مرحبًا بك في NovaClip", fr:"Bienvenue sur NovaClip", bn:"NovaClip-এ স্বাগতম", pt:"Bem-vindo ao NovaClip", ru:"Добро пожаловать в NovaClip", ur:"NovaClip میں خوش آمدید", id:"Selamat datang di NovaClip", de:"Willkommen bei NovaClip", ja:"NovaClipへようこそ", tr:"NovaClip’e hoş geldin", ko:"NovaClip에 오신 것을 환영합니다", fa:"به NovaClip خوش آمدی", uk:"Ласкаво просимо до NovaClip", it:"Benvenuto su NovaClip", pl:"Witaj w NovaClip", vi:"Chào mừng đến NovaClip" },
  wel_of1: { en:"Step 1 of 3", zh:"第 1 步，共 3 步", hi:"चरण 1 / 3", es:"Paso 1 de 3", ar:"الخطوة 1 من 3", fr:"Étape 1 sur 3", bn:"ধাপ ১ / ৩", pt:"Passo 1 de 3", ru:"Шаг 1 из 3", ur:"مرحلہ 1 از 3", id:"Langkah 1 dari 3", de:"Schritt 1 von 3", ja:"ステップ 1 / 3", tr:"Adım 1 / 3", ko:"1단계 / 3", fa:"مرحله ۱ از ۳", uk:"Крок 1 з 3", it:"Passo 1 di 3", pl:"Krok 1 z 3", vi:"Bước 1/3" },
  wel_of2: { en:"Step 2 of 3", zh:"第 2 步，共 3 步", hi:"चरण 2 / 3", es:"Paso 2 de 3", ar:"الخطوة 2 من 3", fr:"Étape 2 sur 3", bn:"ধাপ ২ / ৩", pt:"Passo 2 de 3", ru:"Шаг 2 из 3", ur:"مرحلہ 2 از 3", id:"Langkah 2 dari 3", de:"Schritt 2 von 3", ja:"ステップ 2 / 3", tr:"Adım 2 / 3", ko:"2단계 / 3", fa:"مرحله ۲ از ۳", uk:"Крок 2 з 3", it:"Passo 2 di 3", pl:"Krok 2 z 3", vi:"Bước 2/3" },
  wel_of3: { en:"Step 3 of 3", zh:"第 3 步，共 3 步", hi:"चरण 3 / 3", es:"Paso 3 de 3", ar:"الخطوة 3 من 3", fr:"Étape 3 sur 3", bn:"ধাপ ৩ / ৩", pt:"Passo 3 de 3", ru:"Шаг 3 из 3", ur:"مرحلہ 3 از 3", id:"Langkah 3 dari 3", de:"Schritt 3 von 3", ja:"ステップ 3 / 3", tr:"Adım 3 / 3", ko:"3단계 / 3", fa:"مرحله ۳ از ۳", uk:"Крок 3 з 3", it:"Passo 3 di 3", pl:"Krok 3 z 3", vi:"Bước 3/3" },
  wel_of_par: { en:"For parents", zh:"给家长", hi:"अभिभावकों के लिए", es:"Para madres y padres", ar:"لأولياء الأمور", fr:"Pour les parents", bn:"অভিভাবকদের জন্য", pt:"Para pais e mães", ru:"Для родителей", ur:"والدین کے لیے", id:"Untuk orang tua", de:"Für Eltern", ja:"保護者の方へ", tr:"Ebeveynler için", ko:"보호자용", fa:"برای والدین", uk:"Для батьків", it:"Per i genitori", pl:"Dla rodziców", vi:"Dành cho phụ huynh" },
  wel_role_h: { en:"Who is using NovaClip?", zh:"谁在使用 NovaClip？", hi:"NovaClip कौन इस्तेमाल कर रहा है?", es:"¿Quién va a usar NovaClip?", ar:"من الذي سيستخدم NovaClip؟", fr:"Qui utilise NovaClip ?", bn:"NovaClip কে ব্যবহার করছে?", pt:"Quem vai usar o NovaClip?", ru:"Кто пользуется NovaClip?", ur:"NovaClip کون استعمال کر رہا ہے؟", id:"Siapa yang memakai NovaClip?", de:"Wer benutzt NovaClip?", ja:"NovaClipを使うのはどなたですか？", tr:"NovaClip’i kim kullanıyor?", ko:"NovaClip을 누가 사용하나요?", fa:"چه کسی از NovaClip استفاده می‌کند؟", uk:"Хто користується NovaClip?", it:"Chi userà NovaClip?", pl:"Kto używa NovaClip?", vi:"Ai đang dùng NovaClip?" },
  wel_role_p: { en:"It is built for teenage creators, and parents have their own side of it. This only decides what you are shown first — nothing is hidden either way.", zh:"它是为青少年创作者做的，家长有自己的那一面。这只决定你先看到什么——两边都不会隐藏任何东西。", hi:"यह किशोर क्रिएटर्स के लिए बना है, और अभिभावकों का अपना हिस्सा है। यह सिर्फ़ तय करता है कि आपको पहले क्या दिखे — कुछ भी छिपाया नहीं जाता।", es:"Está hecho para creadores adolescentes, y las madres y padres tienen su propio lado. Esto solo decide qué se te muestra primero: no se oculta nada en ningún caso.", ar:"صُمّم لصنّاع المحتوى المراهقين، ولأولياء الأمور جانبهم الخاص. هذا يحدد فقط ما تراه أولًا — ولا يُخفى شيء في الحالتين.", fr:"Il est fait pour les jeunes créateurs, et les parents ont leur propre côté. Cela décide seulement ce qu’on te montre en premier : rien n’est caché dans un cas comme dans l’autre.", bn:"এটি কিশোর নির্মাতাদের জন্য তৈরি, আর অভিভাবকদের নিজস্ব দিক আছে। এটি শুধু ঠিক করে আপনি প্রথমে কী দেখবেন — কিছুই লুকানো হয় না।", pt:"Foi feito para criadores adolescentes, e os pais têm o seu próprio lado. Isto só decide o que te é mostrado primeiro — nada fica escondido em qualquer dos casos.", ru:"Он сделан для юных авторов, а у родителей есть своя сторона. Это лишь решает, что вы увидите первым, — ничего не скрывается ни в одном случае.", ur:"یہ نوجوان تخلیق کاروں کے لیے بنا ہے، اور والدین کا اپنا حصہ ہے۔ یہ صرف طے کرتا ہے کہ آپ کو پہلے کیا دکھایا جائے — کچھ بھی چھپایا نہیں جاتا۔", id:"Dibuat untuk kreator remaja, dan orang tua punya sisinya sendiri. Ini hanya menentukan apa yang kamu lihat lebih dulu — tidak ada yang disembunyikan.", de:"Es ist für junge Creator gemacht, und Eltern haben ihre eigene Seite davon. Das entscheidet nur, was dir zuerst gezeigt wird — verborgen wird in keinem Fall etwas.", ja:"10代のクリエイターのために作られていて、保護者には保護者向けの画面があります。これは最初に何を表示するかを決めるだけで、どちらでも何かが隠されることはありません。", tr:"Genç içerik üreticileri için yapıldı, ebeveynlerin de kendi tarafı var. Bu yalnızca sana önce neyin gösterileceğini belirler — hiçbir şey gizlenmez.", ko:"10대 크리에이터를 위해 만들어졌고, 보호자에게는 보호자용 화면이 있습니다. 이 선택은 무엇을 먼저 보여줄지만 정할 뿐, 어느 쪽에서도 숨기는 것은 없습니다.", fa:"برای سازندگان نوجوان ساخته شده و والدین بخش خودشان را دارند. این فقط تعیین می‌کند اول چه چیزی به تو نشان داده شود — در هیچ حالتی چیزی پنهان نمی‌شود.", uk:"Він зроблений для юних авторів, а батьки мають свій бік. Це лише вирішує, що ви побачите першим, — нічого не приховується.", it:"È fatto per creator adolescenti, e i genitori hanno la loro parte. Questo decide solo cosa ti viene mostrato per primo: non viene nascosto nulla.", pl:"Powstał dla nastoletnich twórców, a rodzice mają swoją stronę. To tylko decyduje, co zobaczysz najpierw — nic nie jest ukrywane.", vi:"Được làm cho nhà sáng tạo tuổi teen, và phụ huynh có phần riêng. Điều này chỉ quyết định bạn thấy gì trước — không có gì bị giấu đi cả." },
  wel_role_ct: { en:"I am the creator", zh:"我是创作者", hi:"मैं क्रिएटर हूँ", es:"Soy el creador", ar:"أنا صانع المحتوى", fr:"Je suis le créateur", bn:"আমি ক্রিয়েটর", pt:"Sou o criador", ru:"Я автор", ur:"میں تخلیق کار ہوں", id:"Saya kreatornya", de:"Ich bin der Creator", ja:"わたしがクリエイターです", tr:"Ben üreticiyim", ko:"제가 크리에이터예요", fa:"من سازنده‌ام", uk:"Я автор", it:"Sono il creator", pl:"Jestem twórcą", vi:"Tôi là nhà sáng tạo" },
  wel_role_cs: { en:"The editors, trends, tools and games", zh:"编辑器、趋势、工具和游戏", hi:"एडिटर, ट्रेंड्स, टूल्स और गेम्स", es:"Los editores, tendencias, herramientas y juegos", ar:"المحرران والاتجاهات والأدوات والألعاب", fr:"Les éditeurs, les tendances, les outils et les jeux", bn:"এডিটর, ট্রেন্ড, টুল ও গেম", pt:"Os editores, tendências, ferramentas e jogos", ru:"Редакторы, тренды, инструменты и игры", ur:"ایڈیٹرز، ٹرینڈز، ٹولز اور گیمز", id:"Editor, tren, alat, dan game", de:"Die Editoren, Trends, Tools und Spiele", ja:"エディタ、トレンド、ツール、ゲーム", tr:"Düzenleyiciler, trendler, araçlar ve oyunlar", ko:"편집기, 트렌드, 도구, 게임", fa:"ویرایشگرها، ترندها، ابزارها و بازی‌ها", uk:"Редактори, тренди, інструменти та ігри", it:"Gli editor, le tendenze, gli strumenti e i giochi", pl:"Edytory, trendy, narzędzia i gry", vi:"Trình sửa, xu hướng, công cụ và trò chơi" },
  wel_role_pt: { en:"I am a parent", zh:"我是家长", hi:"मैं अभिभावक हूँ", es:"Soy madre o padre", ar:"أنا وليّ أمر", fr:"Je suis un parent", bn:"আমি অভিভাবক", pt:"Sou pai ou mãe", ru:"Я родитель", ur:"میں والد/والدہ ہوں", id:"Saya orang tua", de:"Ich bin ein Elternteil", ja:"わたしは保護者です", tr:"Ben ebeveynim", ko:"저는 보호자예요", fa:"من والد هستم", uk:"Я з батьків", it:"Sono un genitore", pl:"Jestem rodzicem", vi:"Tôi là phụ huynh" },
  wel_role_ps: { en:"Screen time, blocking, comment alerts", zh:"屏幕时间、内容拦截、评论提醒", hi:"स्क्रीन टाइम, ब्लॉकिंग, कमेंट अलर्ट", es:"Tiempo de pantalla, bloqueo, alertas de comentarios", ar:"وقت الشاشة والحجب وتنبيهات التعليقات", fr:"Temps d’écran, blocage, alertes de commentaires", bn:"স্ক্রিন টাইম, ব্লকিং, কমেন্ট অ্যালার্ট", pt:"Tempo de ecrã, bloqueio, alertas de comentários", ru:"Экранное время, блокировка, оповещения о комментариях", ur:"اسکرین ٹائم، بلاکنگ، کمنٹ الرٹس", id:"Waktu layar, pemblokiran, peringatan komentar", de:"Bildschirmzeit, Sperren, Kommentar-Warnungen", ja:"利用時間、ブロック、コメント通知", tr:"Ekran süresi, engelleme, yorum uyarıları", ko:"이용 시간, 차단, 댓글 알림", fa:"زمان استفاده، مسدودسازی، هشدار نظرها", uk:"Екранний час, блокування, сповіщення про коментарі", it:"Tempo di utilizzo, blocchi, avvisi sui commenti", pl:"Czas przed ekranem, blokowanie, alerty o komentarzach", vi:"Thời gian dùng, chặn nội dung, cảnh báo bình luận" },
  wel_par_h: { en:"Here is where to start", zh:"从这里开始", hi:"शुरुआत यहाँ से करें", es:"Empieza por aquí", ar:"من هنا تبدأ", fr:"Commencez ici", bn:"এখান থেকেই শুরু করুন", pt:"Comece por aqui", ru:"Начните отсюда", ur:"یہاں سے شروع کریں", id:"Mulai dari sini", de:"Hier fangen Sie an", ja:"ここから始めてください", tr:"Buradan başlayın", ko:"여기서 시작하세요", fa:"از اینجا شروع کنید", uk:"Почніть звідси", it:"Si comincia da qui", pl:"Zacznij tutaj", vi:"Bắt đầu từ đây" },
  wel_par_p: { en:"Everything for you is on one page — <b>Family</b> in the rail. Four things, and they go in this order:", zh:"给你的一切都在一个页面上——侧栏里的<b>家庭</b>。四件事，按这个顺序：", hi:"आपके लिए सब कुछ एक ही पेज पर है — साइडबार में <b>परिवार</b>। चार चीज़ें, इसी क्रम में:", es:"Todo lo tuyo está en una página — <b>Familia</b>, en la barra lateral. Cuatro cosas, y van en este orden:", ar:"كل ما يخصك في صفحة واحدة — <b>العائلة</b> في الشريط الجانبي. أربعة أشياء، بهذا الترتيب:", fr:"Tout ce qui vous concerne tient sur une page — <b>Famille</b>, dans la barre latérale. Quatre choses, dans cet ordre :", bn:"আপনার সবকিছু একটি পেজে — সাইডবারে <b>পরিবার</b>। চারটি কাজ, এই ক্রমে:", pt:"Tudo o que é seu está numa página — <b>Família</b>, na barra lateral. Quatro coisas, e por esta ordem:", ru:"Всё для вас на одной странице — <b>Семья</b> в боковой панели. Четыре пункта, именно в этом порядке:", ur:"آپ کے لیے سب کچھ ایک صفحے پر ہے — سائیڈبار میں <b>فیملی</b>۔ چار کام، اسی ترتیب سے:", id:"Semua untuk Anda ada di satu halaman — <b>Keluarga</b> di bilah samping. Empat hal, dengan urutan ini:", de:"Alles für Sie steht auf einer Seite — <b>Familie</b> in der Leiste. Vier Dinge, in dieser Reihenfolge:", ja:"保護者向けはすべて1ページにあります — サイドバーの<b>ファミリー</b>。次の順で4つです:", tr:"Sizin için her şey tek sayfada — kenar çubuğundaki <b>Aile</b>. Dört şey, bu sırayla:", ko:"보호자용은 한 페이지에 모두 있습니다 — 사이드바의 <b>가족</b>. 네 가지를, 이 순서대로:", fa:"همه‌چیزِ شما در یک صفحه است — <b>خانواده</b> در نوار کناری. چهار کار، به همین ترتیب:", uk:"Усе для вас на одній сторінці — <b>Сім’я</b> на бічній панелі. Чотири речі, саме в такому порядку:", it:"Tutto ciò che la riguarda è in una pagina — <b>Famiglia</b>, nella barra laterale. Quattro cose, in quest’ordine:", pl:"Wszystko dla Ciebie jest na jednej stronie — <b>Rodzina</b> na pasku bocznym. Cztery rzeczy, w tej kolejności:", vi:"Mọi thứ dành cho bạn nằm trên một trang — <b>Gia đình</b> ở thanh bên. Bốn việc, theo thứ tự này:" },
  wel_par_1: { en:"<b>Set a PIN.</b> It confirms it is you rather than your child, and it is what keeps the dashboard shut afterwards. You will be asked for it every visit.", zh:"<b>设置 PIN 码。</b>它确认是你而不是孩子，之后也靠它把面板锁住。每次进入都会要求输入。", hi:"<b>एक PIN सेट करें।</b> यह पुष्टि करता है कि यह आप हैं, आपका बच्चा नहीं, और बाद में यही डैशबोर्ड बंद रखता है। हर बार यह पूछा जाएगा।", es:"<b>Pon un PIN.</b> Confirma que eres tú y no tu hijo, y es lo que mantiene el panel cerrado después. Te lo pedirá en cada visita.", ar:"<b>عيّن رمز PIN.</b> يؤكد أنك أنت لا طفلك، وهو ما يُبقي اللوحة مغلقة بعد ذلك. سيُطلب منك في كل زيارة.", fr:"<b>Définissez un code PIN.</b> Il confirme que c’est vous et non votre enfant, et c’est lui qui garde le tableau de bord fermé ensuite. Il est demandé à chaque visite.", bn:"<b>একটি পিন সেট করুন।</b> এটি নিশ্চিত করে যে এটি আপনি, আপনার সন্তান নয় — এবং এরপর এটিই ড্যাশবোর্ড বন্ধ রাখে। প্রতিবারই এটি চাওয়া হবে।", pt:"<b>Defina um PIN.</b> Confirma que é você e não o seu filho, e é o que mantém o painel fechado depois. Será pedido em todas as visitas.", ru:"<b>Задайте PIN.</b> Он подтверждает, что это вы, а не ребёнок, и именно он потом держит панель закрытой. Его будут спрашивать при каждом входе.", ur:"<b>ایک PIN مقرر کریں۔</b> یہ تصدیق کرتا ہے کہ یہ آپ ہیں، آپ کا بچہ نہیں، اور بعد میں یہی ڈیش بورڈ بند رکھتا ہے۔ ہر بار یہ پوچھا جائے گا۔", id:"<b>Buat PIN.</b> Ini memastikan yang masuk Anda, bukan anak Anda, dan itulah yang menjaga dasbor tetap tertutup. Akan diminta setiap kali.", de:"<b>Legen Sie eine PIN fest.</b> Sie bestätigt, dass Sie es sind und nicht Ihr Kind, und hält das Dashboard danach geschlossen. Sie wird bei jedem Besuch abgefragt.", ja:"<b>PINを設定します。</b>お子さんではなくご本人であることを確認し、以後ダッシュボードを閉じておくのもこれです。訪問のたびに入力を求められます。", tr:"<b>Bir PIN belirleyin.</b> Çocuğunuz değil siz olduğunuzu doğrular ve paneli sonrasında kapalı tutan şey budur. Her ziyarette istenir.", ko:"<b>PIN을 설정하세요.</b> 아이가 아니라 본인임을 확인하며, 이후 대시보드를 잠가 두는 것도 이것입니다. 방문할 때마다 묻습니다.", fa:"<b>یک PIN تعیین کنید.</b> تأیید می‌کند شما هستید نه فرزندتان، و بعد از آن هم همین داشبورد را بسته نگه می‌دارد. هر بار پرسیده می‌شود.", uk:"<b>Задайте PIN.</b> Він підтверджує, що це ви, а не дитина, і саме він далі тримає панель закритою. Його питатимуть щоразу.", it:"<b>Imposti un PIN.</b> Conferma che è lei e non suo figlio, ed è ciò che tiene chiusa la dashboard dopo. Viene chiesto a ogni visita.", pl:"<b>Ustaw PIN.</b> Potwierdza, że to Ty, a nie dziecko, i to on później trzyma panel zamknięty. Będzie pytany przy każdej wizycie.", vi:"<b>Đặt mã PIN.</b> Nó xác nhận đó là bạn chứ không phải con bạn, và sau đó chính nó giữ bảng điều khiển luôn khoá. Sẽ được hỏi mỗi lần vào." },
  wel_par_2: { en:"<b>Set the screen time.</b> A daily limit and quiet hours, different for each day of the week if you want.", zh:"<b>设置屏幕时间。</b>每日上限和免打扰时段，可以每天都不一样。", hi:"<b>स्क्रीन टाइम सेट करें।</b> रोज़ की सीमा और शांत घंटे — चाहें तो हफ़्ते के हर दिन अलग।", es:"<b>Configura el tiempo de pantalla.</b> Un límite diario y horas de silencio, distintos para cada día de la semana si quieres.", ar:"<b>اضبط وقت الشاشة.</b> حد يومي وساعات هدوء، ومختلفة لكل يوم من الأسبوع إن أردت.", fr:"<b>Réglez le temps d’écran.</b> Une limite quotidienne et des heures calmes, différentes chaque jour de la semaine si vous voulez.", bn:"<b>স্ক্রিন টাইম ঠিক করুন।</b> দৈনিক সীমা ও নীরব সময় — চাইলে সপ্তাহের প্রতিদিন আলাদা।", pt:"<b>Defina o tempo de ecrã.</b> Um limite diário e horas de silêncio, diferentes para cada dia da semana se quiser.", ru:"<b>Настройте экранное время.</b> Дневной лимит и тихие часы, для каждого дня недели свои, если хотите.", ur:"<b>اسکرین ٹائم مقرر کریں۔</b> روزانہ کی حد اور خاموش اوقات — چاہیں تو ہفتے کے ہر دن کے لیے الگ۔", id:"<b>Atur waktu layar.</b> Batas harian dan jam tenang, bisa berbeda tiap hari dalam seminggu.", de:"<b>Stellen Sie die Bildschirmzeit ein.</b> Ein Tageslimit und Ruhezeiten, auf Wunsch für jeden Wochentag anders.", ja:"<b>利用時間を設定します。</b>1日の上限と静かな時間帯を、曜日ごとに変えることもできます。", tr:"<b>Ekran süresini ayarlayın.</b> Günlük sınır ve sessiz saatler; isterseniz haftanın her günü için farklı.", ko:"<b>이용 시간을 정하세요.</b> 하루 한도와 조용한 시간대를, 원하면 요일마다 다르게.", fa:"<b>زمان استفاده را تنظیم کنید.</b> سقف روزانه و ساعت‌های سکوت — اگر بخواهید برای هر روز هفته متفاوت.", uk:"<b>Налаштуйте екранний час.</b> Денний ліміт і тихі години, за бажанням різні для кожного дня тижня.", it:"<b>Imposti il tempo di utilizzo.</b> Un limite giornaliero e ore di silenzio, diversi per ogni giorno della settimana se vuole.", pl:"<b>Ustaw czas przed ekranem.</b> Dzienny limit i ciche godziny, jeśli chcesz inne dla każdego dnia tygodnia.", vi:"<b>Đặt thời gian dùng.</b> Giới hạn mỗi ngày và giờ yên tĩnh, khác nhau theo từng ngày trong tuần nếu bạn muốn." },
  wel_par_3: { en:"<b>Turn on content blocking.</b> Pick what is filtered, then install the Family Shield extension so the same rules apply outside NovaClip too.", zh:"<b>打开内容拦截。</b>选择要过滤的内容，然后安装家庭防护扩展，让同样的规则在 NovaClip 之外也生效。", hi:"<b>कंटेंट ब्लॉकिंग चालू करें।</b> चुनें क्या फ़िल्टर हो, फिर Family Shield एक्सटेंशन इंस्टॉल करें ताकि वही नियम NovaClip के बाहर भी लगें।", es:"<b>Activa el bloqueo de contenido.</b> Elige qué se filtra y luego instala la extensión Family Shield para que las mismas reglas valgan fuera de NovaClip.", ar:"<b>فعّل حجب المحتوى.</b> اختر ما يُصفّى، ثم ثبّت إضافة Family Shield لتسري القواعد نفسها خارج NovaClip أيضًا.", fr:"<b>Activez le blocage de contenu.</b> Choisissez ce qui est filtré, puis installez l’extension Family Shield pour que les mêmes règles s’appliquent hors de NovaClip.", bn:"<b>কনটেন্ট ব্লকিং চালু করুন।</b> কী ফিল্টার হবে বেছে নিন, তারপর Family Shield এক্সটেনশন ইনস্টল করুন যাতে একই নিয়ম NovaClip-এর বাইরেও চলে।", pt:"<b>Ative o bloqueio de conteúdos.</b> Escolha o que é filtrado e instale a extensão Family Shield para as mesmas regras valerem fora do NovaClip.", ru:"<b>Включите блокировку контента.</b> Выберите, что фильтровать, затем установите расширение Family Shield, чтобы те же правила работали и вне NovaClip.", ur:"<b>مواد کی بلاکنگ آن کریں۔</b> منتخب کریں کیا فلٹر ہو، پھر Family Shield ایکسٹینشن انسٹال کریں تاکہ وہی اصول NovaClip کے باہر بھی لاگو ہوں۔", id:"<b>Nyalakan pemblokiran konten.</b> Pilih apa yang disaring, lalu pasang ekstensi Family Shield agar aturan yang sama berlaku di luar NovaClip.", de:"<b>Schalten Sie die Inhaltssperre ein.</b> Wählen Sie, was gefiltert wird, und installieren Sie die Family-Shield-Erweiterung, damit dieselben Regeln auch außerhalb von NovaClip gelten.", ja:"<b>コンテンツブロックを有効にします。</b>何をフィルタするか選び、Family Shield拡張機能を入れると、同じルールがNovaClipの外でも効きます。", tr:"<b>İçerik engellemeyi açın.</b> Neyin filtreleneceğini seçin, sonra Family Shield eklentisini kurun ki aynı kurallar NovaClip dışında da geçerli olsun.", ko:"<b>콘텐츠 차단을 켜세요.</b> 무엇을 거를지 고른 뒤 Family Shield 확장 프로그램을 설치하면 같은 규칙이 NovaClip 밖에서도 적용됩니다.", fa:"<b>مسدودسازی محتوا را روشن کنید.</b> انتخاب کنید چه چیزی فیلتر شود، سپس افزونه Family Shield را نصب کنید تا همان قواعد بیرون از NovaClip هم اعمال شود.", uk:"<b>Увімкніть блокування вмісту.</b> Оберіть, що фільтрувати, тоді встановіть розширення Family Shield, щоб ті самі правила діяли й поза NovaClip.", it:"<b>Attivi il blocco dei contenuti.</b> Scelga cosa filtrare, poi installi l’estensione Family Shield perché le stesse regole valgano anche fuori da NovaClip.", pl:"<b>Włącz blokowanie treści.</b> Wybierz, co ma być filtrowane, a potem zainstaluj rozszerzenie Family Shield, żeby te same reguły działały poza NovaClip.", vi:"<b>Bật chặn nội dung.</b> Chọn những gì cần lọc, rồi cài tiện ích Family Shield để cùng bộ quy tắc áp dụng cả ngoài NovaClip." },
  wel_par_4: { en:"<b>Add your alert email.</b> The scanner reads the newest comments on your child’s uploads and flags harassment to you, with a link to report it.", zh:"<b>填上接收提醒的邮箱。</b>扫描器会读取孩子视频下最新的评论，发现骚扰就通知你，并附上举报链接。", hi:"<b>अलर्ट ईमेल जोड़ें।</b> स्कैनर आपके बच्चे के वीडियो पर नए कमेंट पढ़ता है और उत्पीड़न मिलने पर आपको बताता है, रिपोर्ट करने के लिंक के साथ।", es:"<b>Añade tu correo de avisos.</b> El escáner lee los comentarios más nuevos en los vídeos de tu hijo y te señala el acoso, con un enlace para denunciarlo.", ar:"<b>أضف بريد التنبيهات.</b> يقرأ الماسح أحدث التعليقات على مقاطع طفلك ويُبلغك بالمضايقات، مع رابط للإبلاغ عنها.", fr:"<b>Ajoutez votre e-mail d’alerte.</b> Le scanner lit les commentaires les plus récents sous les vidéos de votre enfant et vous signale le harcèlement, avec un lien pour le signaler.", bn:"<b>অ্যালার্ট ইমেইল যোগ করুন।</b> স্ক্যানার আপনার সন্তানের ভিডিওর নতুন মন্তব্য পড়ে এবং হয়রানি পেলে আপনাকে জানায়, রিপোর্ট করার লিংকসহ।", pt:"<b>Adicione o seu e-mail de alerta.</b> O scanner lê os comentários mais recentes nos vídeos do seu filho e assinala-lhe o assédio, com uma ligação para denunciar.", ru:"<b>Добавьте почту для оповещений.</b> Сканер читает свежие комментарии под видео ребёнка и сообщает вам о травле, со ссылкой на жалобу.", ur:"<b>الرٹ ای میل شامل کریں۔</b> اسکینر آپ کے بچے کی ویڈیوز پر نئے تبصرے پڑھتا ہے اور ہراسانی ملنے پر آپ کو اطلاع دیتا ہے، رپورٹ کے لنک کے ساتھ۔", id:"<b>Tambahkan email peringatan.</b> Pemindai membaca komentar terbaru di unggahan anak Anda dan menandai pelecehan untuk Anda, lengkap dengan tautan pelaporan.", de:"<b>Tragen Sie Ihre Warn-E-Mail ein.</b> Der Scanner liest die neuesten Kommentare unter den Videos Ihres Kindes und meldet Ihnen Belästigung, mit Link zum Melden.", ja:"<b>通知用のメールアドレスを登録します。</b>スキャナーがお子さんの動画の新しいコメントを読み、嫌がらせを見つけたら報告用リンク付きでお知らせします。", tr:"<b>Uyarı e-postanızı ekleyin.</b> Tarayıcı çocuğunuzun videolarındaki en yeni yorumları okur ve tacizi bildirim bağlantısıyla size bildirir.", ko:"<b>알림 이메일을 등록하세요.</b> 스캐너가 아이 영상의 최신 댓글을 읽고 괴롭힘을 신고 링크와 함께 알려 줍니다.", fa:"<b>ایمیل هشدار را وارد کنید.</b> اسکنر تازه‌ترین نظرهای ویدیوهای فرزندتان را می‌خواند و آزار را با لینک گزارش به شما اطلاع می‌دهد.", uk:"<b>Додайте пошту для сповіщень.</b> Сканер читає найновіші коментарі під відео дитини й повідомляє вам про цькування, з посиланням на скаргу.", it:"<b>Aggiunga la sua e-mail per gli avvisi.</b> Lo scanner legge i commenti più recenti sotto i video di suo figlio e le segnala le molestie, con un link per denunciarle.", pl:"<b>Dodaj e-mail do alertów.</b> Skaner czyta najnowsze komentarze pod filmami dziecka i zgłasza Ci nękanie, z linkiem do zgłoszenia.", vi:"<b>Thêm email nhận cảnh báo.</b> Trình quét đọc những bình luận mới nhất dưới video của con bạn và báo cho bạn khi có quấy rối, kèm liên kết để tố cáo." },
  wel_par_go: { en:"Open the Family Dashboard", zh:"打开家庭面板", hi:"फ़ैमिली डैशबोर्ड खोलें", es:"Abrir el panel de familia", ar:"افتح لوحة العائلة", fr:"Ouvrir le tableau de bord Famille", bn:"ফ্যামিলি ড্যাশবোর্ড খুলুন", pt:"Abrir o painel de família", ru:"Открыть семейную панель", ur:"فیملی ڈیش بورڈ کھولیں", id:"Buka Dasbor Keluarga", de:"Familien-Dashboard öffnen", ja:"ファミリー画面を開く", tr:"Aile Panelini aç", ko:"가족 대시보드 열기", fa:"داشبورد خانواده را باز کن", uk:"Відкрити сімейну панель", it:"Apri la dashboard Famiglia", pl:"Otwórz panel rodzinny", vi:"Mở Bảng điều khiển Gia đình" },
  wel_par_skip: { en:"Look around the site first", zh:"先四处看看", hi:"पहले साइट देख लें", es:"Primero echar un vistazo", ar:"ألقِ نظرة على الموقع أولًا", fr:"Faire d’abord le tour du site", bn:"আগে সাইটটা ঘুরে দেখি", pt:"Primeiro dar uma vista de olhos", ru:"Сначала осмотреться", ur:"پہلے سائٹ دیکھ لیں", id:"Lihat-lihat dulu", de:"Erst die Seite ansehen", ja:"まずサイトを見てみる", tr:"Önce siteye göz atayım", ko:"먼저 사이트를 둘러보기", fa:"اول سری به سایت بزنم", uk:"Спершу оглянутися", it:"Prima do un’occhiata al sito", pl:"Najpierw rozejrzę się", vi:"Xem qua trang trước đã" },
  wel_name_h: { en:"First — what should we call you?", zh:"先问一句：怎么称呼你？", hi:"पहले — हम आपको क्या कहें?", es:"Primero: ¿cómo te llamamos?", ar:"أولًا — بماذا نناديك؟", fr:"D’abord : comment t’appelle-t-on ?", bn:"প্রথমে — আপনাকে কী নামে ডাকব?", pt:"Primeiro — como te chamamos?", ru:"Сначала — как к тебе обращаться?", ur:"پہلے — ہم آپ کو کیا کہیں؟", id:"Pertama — kami panggil kamu apa?", de:"Zuerst — wie sollen wir dich nennen?", ja:"まず、なんとお呼びしましょう？", tr:"Önce — sana nasıl hitap edelim?", ko:"먼저 — 어떻게 불러 드릴까요?", fa:"اول — تو را چه صدا کنیم؟", uk:"Спершу — як до тебе звертатися?", it:"Prima di tutto: come ti chiamiamo?", pl:"Najpierw — jak masz na imię?", vi:"Trước tiên — gọi bạn là gì?" },
  wel_name_p: { en:"It goes on your profile, your certificates and the top of the rail. It stays on this device unless you make an account.", zh:"它会出现在你的资料、证书和侧栏顶部。除非你注册账号，否则只留在这台设备上。", hi:"यह आपकी प्रोफ़ाइल, सर्टिफिकेट और साइडबार के ऊपर दिखेगा। खाता बनाए बिना यह इसी डिवाइस पर रहता है।", es:"Aparece en tu perfil, en tus certificados y arriba en la barra lateral. Se queda en este dispositivo salvo que crees una cuenta.", ar:"يظهر في ملفك وشهاداتك وأعلى الشريط الجانبي. ويبقى على هذا الجهاز ما لم تُنشئ حسابًا.", fr:"Il apparaît sur ton profil, tes certificats et en haut de la barre latérale. Il reste sur cet appareil tant que tu ne crées pas de compte.", bn:"এটি আপনার প্রোফাইল, সার্টিফিকেট আর সাইডবারের উপরে দেখা যাবে। অ্যাকাউন্ট না করলে এটি এই ডিভাইসেই থাকে।", pt:"Aparece no teu perfil, nos teus certificados e no topo da barra lateral. Fica neste dispositivo a menos que cries uma conta.", ru:"Оно появится в профиле, на сертификатах и вверху боковой панели. Остаётся на этом устройстве, пока ты не заведёшь аккаунт.", ur:"یہ آپ کی پروفائل، سرٹیفکیٹس اور سائیڈبار کے اوپر نظر آئے گا۔ اکاؤنٹ بنائے بغیر یہ اسی ڈیوائس پر رہتا ہے۔", id:"Nama ini muncul di profil, sertifikat, dan bagian atas bilah samping. Tetap di perangkat ini kecuali kamu membuat akun.", de:"Er steht in deinem Profil, auf deinen Zertifikaten und oben in der Leiste. Er bleibt auf diesem Gerät, solange du kein Konto anlegst.", ja:"プロフィール、証明書、サイドバーの上部に表示されます。アカウントを作らない限り、この端末にとどまります。", tr:"Profilinde, sertifikalarında ve kenar çubuğunun üstünde görünür. Hesap açmadığın sürece bu cihazda kalır.", ko:"프로필, 수료증, 사이드바 맨 위에 표시됩니다. 계정을 만들지 않으면 이 기기에만 남습니다.", fa:"در پروفایل، گواهی‌ها و بالای نوار کناری دیده می‌شود. تا وقتی حساب نسازی روی همین دستگاه می‌ماند.", uk:"Воно буде в профілі, на сертифікатах і вгорі бічної панелі. Лишається на цьому пристрої, поки не створиш акаунт.", it:"Compare sul tuo profilo, sui certificati e in cima alla barra laterale. Resta su questo dispositivo finché non crei un account.", pl:"Pojawia się w profilu, na certyfikatach i u góry paska bocznego. Zostaje na tym urządzeniu, dopóki nie założysz konta.", vi:"Tên này hiện trên hồ sơ, chứng chỉ và đầu thanh bên. Nó ở lại thiết bị này trừ khi bạn tạo tài khoản." },
  wel_name_ph: { en:"Your name or a handle", zh:"你的名字或昵称", hi:"आपका नाम या हैंडल", es:"Tu nombre o un alias", ar:"اسمك أو لقبك", fr:"Ton nom ou un pseudo", bn:"আপনার নাম বা হ্যান্ডেল", pt:"O teu nome ou um alias", ru:"Имя или никнейм", ur:"آپ کا نام یا ہینڈل", id:"Nama atau nama panggilan", de:"Dein Name oder ein Handle", ja:"名前かハンドル", tr:"Adın ya da bir rumuz", ko:"이름 또는 닉네임", fa:"نام یا نام مستعارت", uk:"Ім’я або нік", it:"Il tuo nome o un nickname", pl:"Imię lub pseudonim", vi:"Tên hoặc biệt danh" },
  wel_cont: { en:"Continue", zh:"继续", hi:"आगे बढ़ें", es:"Continuar", ar:"متابعة", fr:"Continuer", bn:"চালিয়ে যান", pt:"Continuar", ru:"Продолжить", ur:"جاری رکھیں", id:"Lanjut", de:"Weiter", ja:"続ける", tr:"Devam", ko:"계속", fa:"ادامه", uk:"Продовжити", it:"Continua", pl:"Dalej", vi:"Tiếp tục" },
  wel_skip1: { en:"Skip this", zh:"跳过", hi:"इसे छोड़ें", es:"Saltar esto", ar:"تخطَّ هذا", fr:"Passer", bn:"এটি এড়িয়ে যান", pt:"Saltar isto", ru:"Пропустить", ur:"یہ چھوڑ دیں", id:"Lewati ini", de:"Überspringen", ja:"スキップ", tr:"Bunu atla", ko:"건너뛰기", fa:"رد کن", uk:"Пропустити", it:"Salta", pl:"Pomiń", vi:"Bỏ qua" },
  wel_cat_h: { en:"And what do you make?", zh:"那么，你做什么内容？", hi:"और आप क्या बनाते हैं?", es:"¿Y qué haces?", ar:"وماذا تصنع؟", fr:"Et tu fais quoi ?", bn:"আর আপনি কী বানান?", pt:"E o que é que fazes?", ru:"И что ты снимаешь?", ur:"اور آپ کیا بناتے ہیں؟", id:"Dan kamu bikin apa?", de:"Und was machst du?", ja:"そして、何を作っていますか？", tr:"Peki ne üretiyorsun?", ko:"그럼 어떤 걸 만드나요?", fa:"و چه چیزی می‌سازی؟", uk:"І що ти знімаєш?", it:"E tu cosa fai?", pl:"A co tworzysz?", vi:"Và bạn làm về gì?" },
  wel_cat_hi: { en:"Nice to meet you, {n}. What do you make?", zh:"很高兴认识你，{n}。你做什么内容？", hi:"आपसे मिलकर अच्छा लगा, {n}। आप क्या बनाते हैं?", es:"Encantado, {n}. ¿Qué haces?", ar:"سعدنا بك يا {n}. ماذا تصنع؟", fr:"Enchanté, {n}. Tu fais quoi ?", bn:"আপনার সঙ্গে পরিচিত হয়ে ভালো লাগল, {n}। আপনি কী বানান?", pt:"Muito gosto, {n}. O que é que fazes?", ru:"Приятно познакомиться, {n}. Что ты снимаешь?", ur:"آپ سے مل کر اچھا لگا، {n}۔ آپ کیا بناتے ہیں؟", id:"Senang kenal kamu, {n}. Kamu bikin apa?", de:"Freut mich, {n}. Was machst du?", ja:"はじめまして、{n}さん。何を作っていますか？", tr:"Memnun oldum, {n}. Ne üretiyorsun?", ko:"반가워요, {n}님. 어떤 걸 만드나요?", fa:"از آشنایی‌ات خوشوقتم، {n}. چه چیزی می‌سازی؟", uk:"Приємно познайомитися, {n}. Що ти знімаєш?", it:"Piacere, {n}. Cosa fai?", pl:"Miło Cię poznać, {n}. Co tworzysz?", vi:"Rất vui được gặp bạn, {n}. Bạn làm về gì?" },
  wel_cat_p: { en:"So the trends, the ideas and the tutors are about your thing and not somebody else’s. You can change it any time from <b>Categories</b>.", zh:"这样趋势、灵感和 AI 导师讲的就是你的东西，而不是别人的。随时可以在<b>分类</b>里改。", hi:"ताकि ट्रेंड्स, आइडिया और ट्यूटर आपकी चीज़ के बारे में हों, किसी और की नहीं। आप इसे कभी भी <b>श्रेणियाँ</b> से बदल सकते हैं।", es:"Así las tendencias, las ideas y los tutores van de lo tuyo y no de lo de otro. Puedes cambiarlo cuando quieras en <b>Categorías</b>.", ar:"حتى تكون الاتجاهات والأفكار والمدرّسون عن مجالك أنت لا مجال غيرك. يمكنك تغييره متى شئت من <b>الفئات</b>.", fr:"Comme ça les tendances, les idées et les tuteurs parlent de ce que tu fais, pas de ce que fait quelqu’un d’autre. Tu peux le changer quand tu veux dans <b>Catégories</b>.", bn:"যাতে ট্রেন্ড, আইডিয়া আর টিউটর আপনার বিষয় নিয়েই হয়, অন্য কারও নয়। যেকোনো সময় <b>বিভাগ</b> থেকে বদলাতে পারেন।", pt:"Assim as tendências, as ideias e os tutores são sobre o que tu fazes e não sobre outra coisa. Podes mudar quando quiseres em <b>Categorias</b>.", ru:"Чтобы тренды, идеи и наставники были про твоё, а не про чужое. Поменять можно в любой момент в <b>Категориях</b>.", ur:"تاکہ ٹرینڈز، آئیڈیاز اور ٹیوٹر آپ کے کام کے بارے میں ہوں، کسی اور کے نہیں۔ آپ اسے کبھی بھی <b>زمرے</b> سے بدل سکتے ہیں۔", id:"Supaya tren, ide, dan tutor membahas bidangmu, bukan bidang orang lain. Bisa diubah kapan saja di <b>Kategori</b>.", de:"Damit Trends, Ideen und Tutoren um dein Thema gehen und nicht um das von jemand anderem. Du kannst es jederzeit unter <b>Kategorien</b> ändern.", ja:"トレンドもアイデアもチューターも、他人のことではなくあなたのことになります。<b>カテゴリ</b>でいつでも変えられます。", tr:"Böylece trendler, fikirler ve eğitmenler başkasının değil senin işin hakkında olur. İstediğin zaman <b>Kategoriler</b>’den değiştirebilirsin.", ko:"트렌드와 아이디어, 튜터가 남의 분야가 아니라 당신의 분야를 다루도록요. 언제든 <b>카테고리</b>에서 바꿀 수 있습니다.", fa:"تا ترندها، ایده‌ها و مربی‌ها دربارهٔ کار تو باشند نه کار کس دیگر. هر وقت خواستی از <b>دسته‌ها</b> عوضش کن.", uk:"Щоб тренди, ідеї та наставники були про твоє, а не про чуже. Змінити можна будь-коли в <b>Категоріях</b>.", it:"Così le tendenze, le idee e i tutor parlano di quello che fai tu e non di altro. Puoi cambiarlo quando vuoi da <b>Categorie</b>.", pl:"Żeby trendy, pomysły i korepetytorzy dotyczyły Twojej działki, a nie cudzej. Możesz to zmienić w każdej chwili w <b>Kategoriach</b>.", vi:"Để xu hướng, ý tưởng và gia sư nói về thứ bạn làm chứ không phải của người khác. Đổi bất cứ lúc nào trong <b>Danh mục</b>." },
  wel_cat_lbl: { en:"Not on the list? Write it — anything at all", zh:"不在列表里？直接写——什么都行", hi:"सूची में नहीं है? लिख दीजिए — कुछ भी", es:"¿No está en la lista? Escríbelo, lo que sea", ar:"ليس في القائمة؟ اكتبه — أيًّا كان", fr:"Pas dans la liste ? Écris-le — n’importe quoi", bn:"তালিকায় নেই? লিখে দিন — যা খুশি", pt:"Não está na lista? Escreve — seja o que for", ru:"Нет в списке? Напиши — что угодно", ur:"فہرست میں نہیں؟ لکھ دیں — کچھ بھی", id:"Tidak ada di daftar? Tulis saja — apa pun", de:"Nicht auf der Liste? Schreib es hin — irgendwas", ja:"リストにない？なんでも書いてください", tr:"Listede yok mu? Yaz gitsin — ne olursa", ko:"목록에 없나요? 무엇이든 적어 보세요", fa:"در فهرست نیست؟ بنویس — هرچه باشد", uk:"Немає в списку? Напиши — будь-що", it:"Non è in elenco? Scrivilo — qualunque cosa", pl:"Nie ma na liście? Wpisz — cokolwiek", vi:"Không có trong danh sách? Cứ viết ra — bất cứ thứ gì" },
  wel_cat_ph: { en:"Warhammer painting, speedcubing, baking…", zh:"战锤上色、速拧魔方、烘焙……", hi:"वॉरहैमर पेंटिंग, स्पीडक्यूबिंग, बेकिंग…", es:"Pintar Warhammer, speedcubing, repostería…", ar:"تلوين وارهامر، حل المكعب بسرعة، الخَبز…", fr:"Peinture Warhammer, speedcubing, pâtisserie…", bn:"ওয়ারহ্যামার পেইন্টিং, স্পিডকিউবিং, বেকিং…", pt:"Pintar Warhammer, speedcubing, pastelaria…", ru:"Покраска Warhammer, спидкубинг, выпечка…", ur:"وارہیمر پینٹنگ، اسپیڈ کیوبنگ، بیکنگ…", id:"Mewarnai Warhammer, speedcubing, memanggang…", de:"Warhammer bemalen, Speedcubing, Backen…", ja:"ウォーハンマー塗装、スピードキューブ、お菓子作り…", tr:"Warhammer boyama, speedcubing, pastacılık…", ko:"워해머 도색, 스피드큐빙, 베이킹…", fa:"رنگ‌آمیزی وارهمر، اسپیدکیوبینگ، شیرینی‌پزی…", uk:"Фарбування Warhammer, спідкубінг, випічка…", it:"Pittura Warhammer, speedcubing, dolci…", pl:"Malowanie Warhammera, speedcubing, pieczenie…", vi:"Sơn Warhammer, speedcubing, làm bánh…" },
  wel_save: { en:"Save", zh:"保存", hi:"सेव करें", es:"Guardar", ar:"حفظ", fr:"Enregistrer", bn:"সেভ করুন", pt:"Guardar", ru:"Сохранить", ur:"محفوظ کریں", id:"Simpan", de:"Speichern", ja:"保存", tr:"Kaydet", ko:"저장", fa:"ذخیره", uk:"Зберегти", it:"Salva", pl:"Zapisz", vi:"Lưu" },
  wel_skip2: { en:"Skip for now", zh:"暂时跳过", hi:"अभी के लिए छोड़ें", es:"Saltar por ahora", ar:"تخطَّ الآن", fr:"Passer pour l’instant", bn:"আপাতত এড়িয়ে যান", pt:"Saltar por agora", ru:"Пока пропустить", ur:"ابھی چھوڑ دیں", id:"Lewati dulu", de:"Erst mal überspringen", ja:"今はスキップ", tr:"Şimdilik atla", ko:"지금은 건너뛰기", fa:"فعلاً رد کن", uk:"Поки пропустити", it:"Salta per ora", pl:"Na razie pomiń", vi:"Tạm bỏ qua" },
  /* THE LINE UNDER EACH CATEGORY NAME, in the welcome’s third screen. The
     names went through the table already as ccat_*; the hints under them did
     not, so the last screen of the welcome was ten Persian headings over ten
     English subtitles. Short by design — they are examples, not sentences. */
  chint_classic: { en:"The plain NovaClip look, no theme", zh:"NovaClip 原本的样子，不加主题", hi:"सादा NovaClip रूप, कोई थीम नहीं", es:"El NovaClip de siempre, sin tema", ar:"مظهر NovaClip العادي بلا ثيم", fr:"Le NovaClip normal, sans thème", bn:"সাধারণ NovaClip চেহারা, থিম নেই", pt:"O NovaClip normal, sem tema", ru:"Обычный NovaClip, без темы", ur:"سادہ NovaClip شکل، کوئی تھیم نہیں", id:"Tampilan NovaClip biasa, tanpa tema", de:"Das schlichte NovaClip, ohne Theme", ja:"テーマなしの素のNovaClip", tr:"Sade NovaClip görünümü, tema yok", ko:"테마 없는 기본 NovaClip", fa:"ظاهر سادهٔ NovaClip، بدون پوسته", uk:"Звичайний NovaClip, без теми", it:"Il NovaClip normale, senza tema", pl:"Zwykły NovaClip, bez motywu", vi:"Giao diện NovaClip gốc, không chủ đề" },
  chint_gaming: { en:"Clips, reviews, let’s plays", zh:"片段、评测、实况", hi:"क्लिप, रिव्यू, लेट्स प्ले", es:"Clips, análisis, gameplays", ar:"مقاطع ومراجعات وبثوث لعب", fr:"Clips, tests, let’s plays", bn:"ক্লিপ, রিভিউ, লেটস প্লে", pt:"Clipes, análises, gameplays", ru:"Клипы, обзоры, летсплеи", ur:"کلپس، ریویوز، لیٹس پلے", id:"Klip, ulasan, let’s play", de:"Clips, Tests, Let’s Plays", ja:"クリップ、レビュー、実況", tr:"Klipler, incelemeler, let’s play", ko:"클립, 리뷰, 실황", fa:"کلیپ، نقد، لتس‌پلی", uk:"Кліпи, огляди, летсплеї", it:"Clip, recensioni, let’s play", pl:"Klipy, recenzje, let’s playe", vi:"Clip, đánh giá, let’s play" },
  chint_music: { en:"Covers, production, performance", zh:"翻唱、编曲、演出", hi:"कवर, प्रोडक्शन, परफ़ॉर्मेंस", es:"Versiones, producción, directos", ar:"إعادة غناء وإنتاج وأداء", fr:"Reprises, production, live", bn:"কভার, প্রোডাকশন, পারফরম্যান্স", pt:"Covers, produção, atuações", ru:"Каверы, продакшн, выступления", ur:"کورز، پروڈکشن، پرفارمنس", id:"Cover, produksi, penampilan", de:"Covers, Produktion, Auftritte", ja:"カバー、制作、演奏", tr:"Cover, prodüksiyon, performans", ko:"커버, 프로듀싱, 공연", fa:"کاور، تولید، اجرا", uk:"Кавери, продакшн, виступи", it:"Cover, produzione, live", pl:"Covery, produkcja, występy", vi:"Cover, sản xuất, biểu diễn" },
  chint_sport: { en:"Highlights, training, football", zh:"集锦、训练、足球", hi:"हाइलाइट्स, ट्रेनिंग, फ़ुटबॉल", es:"Resúmenes, entrenamientos, fútbol", ar:"أبرز اللقطات والتدريب وكرة القدم", fr:"Résumés, entraînement, football", bn:"হাইলাইট, ট্রেনিং, ফুটবল", pt:"Melhores momentos, treino, futebol", ru:"Хайлайты, тренировки, футбол", ur:"ہائی لائٹس، ٹریننگ، فٹبال", id:"Cuplikan, latihan, sepak bola", de:"Highlights, Training, Fußball", ja:"ハイライト、練習、サッカー", tr:"Özetler, antrenman, futbol", ko:"하이라이트, 훈련, 축구", fa:"لحظه‌های برتر، تمرین، فوتبال", uk:"Хайлайти, тренування, футбол", it:"Highlights, allenamento, calcio", pl:"Skróty, treningi, piłka nożna", vi:"Pha hay, tập luyện, bóng đá" },
  chint_irl: { en:"Days, trips, life", zh:"日常、出行、生活", hi:"दिन, सफ़र, ज़िंदगी", es:"Días, viajes, vida", ar:"يوميات ورحلات وحياة", fr:"Journées, voyages, vie", bn:"দিনযাপন, ভ্রমণ, জীবন", pt:"Dias, viagens, vida", ru:"Будни, поездки, жизнь", ur:"دن، سفر، زندگی", id:"Keseharian, jalan-jalan, hidup", de:"Tage, Reisen, Leben", ja:"日常、旅、暮らし", tr:"Günler, geziler, hayat", ko:"하루, 여행, 일상", fa:"روزها، سفر، زندگی", uk:"Будні, подорожі, життя", it:"Giornate, viaggi, vita", pl:"Dni, wyjazdy, życie", vi:"Ngày thường, chuyến đi, cuộc sống" },
  chint_learning: { en:"Revision, explainers, study", zh:"复习、讲解、学习", hi:"रिवीज़न, समझाना, पढ़ाई", es:"Repaso, explicaciones, estudio", ar:"مراجعة وشرح ودراسة", fr:"Révisions, explications, études", bn:"রিভিশন, ব্যাখ্যা, পড়াশোনা", pt:"Revisão, explicações, estudo", ru:"Повторение, объяснения, учёба", ur:"دہرائی، وضاحت، پڑھائی", id:"Mengulang, penjelasan, belajar", de:"Wiederholen, Erklären, Lernen", ja:"復習、解説、勉強", tr:"Tekrar, anlatım, çalışma", ko:"복습, 설명, 공부", fa:"مرور، توضیح، درس", uk:"Повторення, пояснення, навчання", it:"Ripasso, spiegazioni, studio", pl:"Powtórki, wyjaśnienia, nauka", vi:"Ôn tập, giảng giải, học hành" },
  chint_art: { en:"Drawing, crafts, builds", zh:"绘画、手作、搭建", hi:"ड्रॉइंग, क्राफ्ट, बिल्ड", es:"Dibujo, manualidades, construcciones", ar:"رسم وحِرف وبناء", fr:"Dessin, bricolage, constructions", bn:"আঁকা, হস্তশিল্প, বানানো", pt:"Desenho, artesanato, construções", ru:"Рисование, рукоделие, сборки", ur:"ڈرائنگ، دستکاری، بنانا", id:"Menggambar, kriya, rakitan", de:"Zeichnen, Basteln, Bauen", ja:"絵、手作り、制作", tr:"Çizim, el işi, yapımlar", ko:"그림, 공예, 제작", fa:"طراحی، کاردستی، ساخت", uk:"Малювання, рукоділля, збирання", it:"Disegno, artigianato, costruzioni", pl:"Rysunek, rękodzieło, budowanie", vi:"Vẽ, thủ công, chế tạo" },
  chint_food: { en:"Cooking, baking, eating", zh:"做饭、烘焙、吃", hi:"खाना बनाना, बेकिंग, खाना", es:"Cocinar, repostería, comer", ar:"طبخ وخَبز وأكل", fr:"Cuisine, pâtisserie, dégustation", bn:"রান্না, বেকিং, খাওয়া", pt:"Cozinhar, pastelaria, comer", ru:"Готовка, выпечка, еда", ur:"کھانا پکانا، بیکنگ، کھانا", id:"Memasak, memanggang, makan", de:"Kochen, Backen, Essen", ja:"料理、お菓子作り、食べる", tr:"Yemek, pastacılık, yeme", ko:"요리, 베이킹, 먹방", fa:"آشپزی، شیرینی‌پزی، خوردن", uk:"Готування, випічка, їжа", it:"Cucina, dolci, mangiare", pl:"Gotowanie, pieczenie, jedzenie", vi:"Nấu ăn, làm bánh, ăn uống" },
  chint_comedy: { en:"Bits, skits, edits", zh:"段子、短剧、剪辑", hi:"बिट्स, स्किट, एडिट", es:"Gags, sketches, edits", ar:"نِكات وإسكتشات ومونتاج", fr:"Vannes, sketches, montages", bn:"বিট, স্কিট, এডিট", pt:"Piadas, sketches, edits", ru:"Шутки, скетчи, эдиты", ur:"بٹس، اسکِٹس، ایڈٹس", id:"Lawakan, sketsa, editan", de:"Gags, Sketche, Edits", ja:"ネタ、コント、編集", tr:"Espriler, skeçler, editler", ko:"개그, 콩트, 편집물", fa:"جوک، اسکچ، ادیت", uk:"Жарти, скетчі, едити", it:"Gag, sketch, edit", pl:"Żarty, skecze, edity", vi:"Mảng miếng, tiểu phẩm, edit" },
  chint_tech: { en:"Phones, PCs, coding", zh:"手机、电脑、编程", hi:"फ़ोन, पीसी, कोडिंग", es:"Móviles, PCs, programación", ar:"هواتف وحواسيب وبرمجة", fr:"Téléphones, PC, code", bn:"ফোন, পিসি, কোডিং", pt:"Telemóveis, PCs, programação", ru:"Телефоны, ПК, код", ur:"فونز، پی سی، کوڈنگ", id:"Ponsel, PC, coding", de:"Handys, PCs, Programmieren", ja:"スマホ、PC、プログラミング", tr:"Telefonlar, bilgisayarlar, kodlama", ko:"폰, PC, 코딩", fa:"موبایل، کامپیوتر، کدنویسی", uk:"Телефони, ПК, код", it:"Telefoni, PC, programmazione", pl:"Telefony, PC, programowanie", vi:"Điện thoại, PC, lập trình" },
  /* ELEVEN KEYS THAT WERE BEING ASKED FOR AND WERE NOT HERE.
     Found by listing every data-t and data-tph on the site and checking it
     against this table. A missing key is silent by design — applyLangText
     leaves the English in place rather than blanking the element — so these
     had simply never translated, on four pages, in nineteen languages, with
     nothing anywhere to say so. The check is worth repeating whenever a
     page grows a new data-t. */
  hist_count: { en:"{n} saved", zh:"已保存 {n} 条", hi:"{n} सहेजे गए", es:"{n} guardadas", ar:"{n} محفوظة", fr:"{n} enregistrées", bn:"{n}টি সংরক্ষিত", pt:"{n} guardadas", ru:"Сохранено: {n}", ur:"{n} محفوظ", id:"{n} tersimpan", de:"{n} gespeichert", ja:"{n}件を保存", tr:"{n} kayıtlı", ko:"{n}개 저장됨", fa:"{n} ذخیره‌شده", uk:"Збережено: {n}", it:"{n} salvate", pl:"Zapisano: {n}", vi:"Đã lưu {n}" },
  hist_clear: { en:"Clear history", zh:"清除历史", hi:"इतिहास मिटाएँ", es:"Borrar historial", ar:"مسح السجل", fr:"Effacer l’historique", bn:"ইতিহাস মুছুন", pt:"Limpar histórico", ru:"Очистить историю", ur:"تاریخ مٹائیں", id:"Hapus riwayat", de:"Verlauf löschen", ja:"履歴を消す", tr:"Geçmişi temizle", ko:"기록 지우기", fa:"پاک‌کردن تاریخچه", uk:"Очистити історію", it:"Cancella cronologia", pl:"Wyczyść historię", vi:"Xoá lịch sử" },
  hist_clear_sure: { en:"Delete everything you have asked? This cannot be undone.", zh:"删除你问过的全部内容？此操作无法撤销。", hi:"आपने जो कुछ पूछा, सब मिटा दें? इसे वापस नहीं लाया जा सकता।", es:"¿Borrar todo lo que has preguntado? No se puede deshacer.", ar:"حذف كل ما سألت عنه؟ لا يمكن التراجع عن هذا.", fr:"Supprimer tout ce que tu as demandé ? C’est irréversible.", bn:"আপনি যা যা জিজ্ঞেস করেছেন সব মুছে ফেলবেন? এটি ফেরানো যাবে না।", pt:"Apagar tudo o que perguntaste? Isto não se pode desfazer.", ru:"Удалить всё, что ты спрашивал? Это нельзя отменить.", ur:"جو کچھ آپ نے پوچھا سب مٹا دیں؟ یہ واپس نہیں آئے گا۔", id:"Hapus semua yang pernah kamu tanyakan? Ini tidak bisa dibatalkan.", de:"Alles löschen, was du gefragt hast? Das lässt sich nicht rückgängig machen.", ja:"これまでの質問をすべて削除しますか？元には戻せません。", tr:"Sorduğun her şey silinsin mi? Bu geri alınamaz.", ko:"지금까지 물어본 것을 모두 지울까요? 되돌릴 수 없습니다.", fa:"همهٔ چیزهایی که پرسیده‌ای پاک شود؟ این کار برگشت‌پذیر نیست.", uk:"Видалити все, що ти запитував? Це не можна скасувати.", it:"Cancellare tutto quello che hai chiesto? Non si può annullare.", pl:"Usunąć wszystko, o co pytałeś? Tego nie da się cofnąć.", vi:"Xoá mọi thứ bạn đã hỏi? Không thể hoàn tác." },
  ago_now: { en:"just now", zh:"刚刚", hi:"अभी-अभी", es:"ahora mismo", ar:"الآن", fr:"à l’instant", bn:"এইমাত্র", pt:"agora mesmo", ru:"только что", ur:"ابھی ابھی", id:"baru saja", de:"gerade eben", ja:"たった今", tr:"az önce", ko:"방금", fa:"همین حالا", uk:"щойно", it:"proprio ora", pl:"przed chwilą", vi:"vừa xong" },
  ago_min: { en:"{n} min ago", zh:"{n} 分钟前", hi:"{n} मिनट पहले", es:"hace {n} min", ar:"قبل {n} دقيقة", fr:"il y a {n} min", bn:"{n} মিনিট আগে", pt:"há {n} min", ru:"{n} мин назад", ur:"{n} منٹ پہلے", id:"{n} menit lalu", de:"vor {n} Min.", ja:"{n}分前", tr:"{n} dk önce", ko:"{n}분 전", fa:"{n} دقیقه پیش", uk:"{n} хв тому", it:"{n} min fa", pl:"{n} min temu", vi:"{n} phút trước" },
  ago_hour: { en:"{n}h ago", zh:"{n} 小时前", hi:"{n} घंटे पहले", es:"hace {n} h", ar:"قبل {n} ساعة", fr:"il y a {n} h", bn:"{n} ঘণ্টা আগে", pt:"há {n} h", ru:"{n} ч назад", ur:"{n} گھنٹے پہلے", id:"{n} jam lalu", de:"vor {n} Std.", ja:"{n}時間前", tr:"{n} sa önce", ko:"{n}시간 전", fa:"{n} ساعت پیش", uk:"{n} год тому", it:"{n} h fa", pl:"{n} godz. temu", vi:"{n} giờ trước" },
  ago_day: { en:"{n}d ago", zh:"{n} 天前", hi:"{n} दिन पहले", es:"hace {n} d", ar:"قبل {n} يوم", fr:"il y a {n} j", bn:"{n} দিন আগে", pt:"há {n} d", ru:"{n} дн назад", ur:"{n} دن پہلے", id:"{n} hari lalu", de:"vor {n} Tg.", ja:"{n}日前", tr:"{n} gün önce", ko:"{n}일 전", fa:"{n} روز پیش", uk:"{n} дн тому", it:"{n} g fa", pl:"{n} dni temu", vi:"{n} ngày trước" },
  hist_sub: { en:"Everything you have asked a NovaClip AI — the tutors, the Studio, the Coder — newest first, with the answer that came back. It is kept on this device and nowhere else, so clearing your browser data clears it.", zh:"你问过 NovaClip AI 的所有内容——导师、创作室、编码器——最新的在前，连同返回的答案。只保存在这台设备上，清除浏览器数据就会清空。", hi:"NovaClip के किसी भी AI से आपने जो कुछ पूछा — ट्यूटर, स्टूडियो, कोडर — नए पहले, साथ में जो जवाब आया। यह सिर्फ़ इसी डिवाइस पर रहता है, इसलिए ब्राउज़र डेटा हटाने पर यह भी हट जाता है।", es:"Todo lo que has preguntado a una IA de NovaClip —los tutores, el Estudio, el Coder—, lo más nuevo primero y con la respuesta que llegó. Se guarda en este dispositivo y en ningún otro sitio, así que si borras los datos del navegador, se borra.", ar:"كل ما سألته لذكاء NovaClip الاصطناعي — المدرّسون والاستوديو والمبرمج — الأحدث أولًا، ومعه الجواب الذي عاد. يُحفظ على هذا الجهاز فقط، ومسح بيانات المتصفح يمسحه.", fr:"Tout ce que tu as demandé à une IA NovaClip — les tuteurs, le Studio, le Coder — le plus récent en premier, avec la réponse reçue. Gardé sur cet appareil et nulle part ailleurs : effacer les données du navigateur l’efface.", bn:"NovaClip-এর যেকোনো AI-কে আপনি যা যা জিজ্ঞেস করেছেন — টিউটর, স্টুডিও, কোডার — নতুনটি আগে, সঙ্গে যে উত্তর এসেছিল। এটি কেবল এই ডিভাইসে থাকে, তাই ব্রাউজারের ডেটা মুছলে এটিও মুছে যায়।", pt:"Tudo o que perguntaste a uma IA do NovaClip — os tutores, o Estúdio, o Coder — do mais recente para o mais antigo, com a resposta que voltou. Fica neste dispositivo e em mais lado nenhum, por isso limpar os dados do navegador limpa isto.", ru:"Всё, что ты спрашивал у ИИ NovaClip — у наставников, в Студии, в Кодере — новое сверху, вместе с ответом. Хранится только на этом устройстве, так что очистка данных браузера всё стирает.", ur:"جو کچھ آپ نے NovaClip کے کسی بھی AI سے پوچھا — ٹیوٹر، اسٹوڈیو، کوڈر — نیا پہلے، ساتھ میں جو جواب آیا۔ یہ صرف اسی ڈیوائس پر رہتا ہے، اس لیے براؤزر ڈیٹا صاف کرنے سے یہ بھی مٹ جاتا ہے۔", id:"Semua yang pernah kamu tanyakan ke AI NovaClip — para tutor, Studio, Coder — terbaru dulu, lengkap dengan jawabannya. Disimpan di perangkat ini saja, jadi menghapus data peramban menghapusnya.", de:"Alles, was du eine NovaClip-KI gefragt hast — die Tutoren, das Studio, den Coder — neueste zuerst, mitsamt der Antwort. Bleibt auf diesem Gerät und sonst nirgends, Browserdaten löschen löscht es also.", ja:"NovaClipのAIに投げたすべて — チューター、スタジオ、コーダー — が新しい順に、返ってきた答えごと並びます。この端末にだけ保存されるので、ブラウザのデータを消すと消えます。", tr:"NovaClip’in herhangi bir yapay zekâsına sorduğun her şey — eğitmenler, Stüdyo, Coder — en yenisi üstte, dönen cevabıyla birlikte. Yalnızca bu cihazda tutulur, yani tarayıcı verilerini silmek bunu da siler.", ko:"NovaClip의 AI에게 물어본 모든 것 — 튜터, 스튜디오, 코더 — 을 최신순으로, 돌아온 답과 함께. 이 기기에만 저장되므로 브라우저 데이터를 지우면 함께 사라집니다.", fa:"هر چه از هوش مصنوعی NovaClip پرسیده‌ای — مربی‌ها، استودیو، کدنویس — تازه‌ترین اول، همراه با پاسخی که آمد. فقط روی همین دستگاه می‌ماند، پس پاک‌کردن داده‌های مرورگر پاکش می‌کند.", uk:"Усе, що ти запитував у ШІ NovaClip — наставників, Студії, Кодера — найновіше згори, разом із відповіддю. Зберігається лише на цьому пристрої, тож очищення даних браузера стирає його.", it:"Tutto quello che hai chiesto a un’IA di NovaClip — i tutor, lo Studio, il Coder — dal più recente, con la risposta che è arrivata. Resta su questo dispositivo e da nessun’altra parte, quindi cancellare i dati del browser la cancella.", pl:"Wszystko, o co pytałeś AI w NovaClip — korepetytorów, Studio, Coder — od najnowszych, razem z odpowiedzią. Trzymane tylko na tym urządzeniu, więc wyczyszczenie danych przeglądarki to usuwa.", vi:"Mọi thứ bạn đã hỏi AI của NovaClip — gia sư, Studio, Coder — mới nhất trước, kèm câu trả lời đã nhận. Chỉ lưu trên thiết bị này, nên xoá dữ liệu trình duyệt là mất." },
  hist_hint: { en:"Where you asked it, when, and what came back.", zh:"你在哪里问的、什么时候，以及回答是什么。", hi:"आपने कहाँ पूछा, कब पूछा, और जवाब क्या आया।", es:"Dónde lo preguntaste, cuándo, y qué te respondió.", ar:"أين سألت، ومتى، وما الذي عاد إليك.", fr:"Où tu l’as demandé, quand, et ce qui est revenu.", bn:"কোথায় জিজ্ঞেস করেছিলেন, কখন, আর উত্তর কী এসেছিল।", pt:"Onde perguntaste, quando, e o que voltou.", ru:"Где спросил, когда и что пришло в ответ.", ur:"آپ نے کہاں پوچھا، کب، اور جواب کیا آیا۔", id:"Di mana kamu bertanya, kapan, dan apa jawabannya.", de:"Wo du gefragt hast, wann, und was zurückkam.", ja:"どこで、いつ聞いて、何が返ってきたか。", tr:"Nerede sordun, ne zaman ve ne döndü.", ko:"어디서, 언제 물었고, 무엇이 돌아왔는지.", fa:"کجا پرسیدی، کِی، و چه جوابی آمد.", uk:"Де запитав, коли і що прийшло у відповідь.", it:"Dove l’hai chiesto, quando, e cosa è tornato.", pl:"Gdzie pytałeś, kiedy i co wróciło.", vi:"Bạn hỏi ở đâu, khi nào, và nhận lại điều gì." },
  hist_empty: { en:"Nothing yet. Ask the AI something and it turns up here.", zh:"还没有内容。去问 AI 一个问题，它就会出现在这里。", hi:"अभी कुछ नहीं। AI से कुछ पूछिए, वह यहाँ आ जाएगा।", es:"Todavía nada. Pregúntale algo a la IA y aparecerá aquí.", ar:"لا شيء بعد. اسأل الذكاء الاصطناعي شيئًا وسيظهر هنا.", fr:"Rien pour l’instant. Demande quelque chose à l’IA et ça apparaîtra ici.", bn:"এখনো কিছু নেই। AI-কে কিছু জিজ্ঞেস করুন, সেটি এখানে চলে আসবে।", pt:"Ainda nada. Pergunta algo à IA e aparece aqui.", ru:"Пока пусто. Спроси у ИИ что-нибудь — и оно появится здесь.", ur:"ابھی کچھ نہیں۔ AI سے کچھ پوچھیں، وہ یہاں آ جائے گا۔", id:"Belum ada apa-apa. Tanyakan sesuatu ke AI dan akan muncul di sini.", de:"Noch nichts. Frag die KI etwas, dann taucht es hier auf.", ja:"まだ何もありません。AIに何か聞くと、ここに出てきます。", tr:"Henüz bir şey yok. Yapay zekâya bir şey sor, burada belirsin.", ko:"아직 없습니다. AI에게 뭔가 물어보면 여기에 나타납니다.", fa:"هنوز چیزی نیست. از هوش مصنوعی چیزی بپرس تا اینجا بیاید.", uk:"Поки порожньо. Запитай щось у ШІ — і воно з’явиться тут.", it:"Ancora niente. Chiedi qualcosa all’IA e comparirà qui.", pl:"Jeszcze nic. Zapytaj AI o coś, a pojawi się tutaj.", vi:"Chưa có gì. Hỏi AI điều gì đó và nó sẽ hiện ở đây." },
  par_shield: { en:"Content blocking", zh:"内容拦截", hi:"कंटेंट ब्लॉकिंग", es:"Bloqueo de contenido", ar:"حجب المحتوى", fr:"Blocage de contenu", bn:"কনটেন্ট ব্লকিং", pt:"Bloqueio de conteúdos", ru:"Блокировка контента", ur:"مواد کی بلاکنگ", id:"Pemblokiran konten", de:"Inhaltssperre", ja:"コンテンツブロック", tr:"İçerik engelleme", ko:"콘텐츠 차단", fa:"مسدودسازی محتوا", uk:"Блокування вмісту", it:"Blocco dei contenuti", pl:"Blokowanie treści", vi:"Chặn nội dung" },
  par_shield_s: { en:"Blocks unsuitable videos, streams and posts on YouTube, TikTok, Instagram and Twitch. Choose the rules here; the browser shield enforces them.", zh:"拦截 YouTube、TikTok、Instagram 和 Twitch 上不适合的视频、直播和帖子。规则在这里选，由浏览器防护执行。", hi:"YouTube, TikTok, Instagram और Twitch पर अनुपयुक्त वीडियो, स्ट्रीम और पोस्ट ब्लॉक करता है। नियम यहाँ चुनें; ब्राउज़र शील्ड उन्हें लागू करती है।", es:"Bloquea vídeos, directos y publicaciones no aptos en YouTube, TikTok, Instagram y Twitch. Elige las reglas aquí; el escudo del navegador las aplica.", ar:"يحجب الفيديوهات والبثوث والمنشورات غير المناسبة على YouTube وTikTok وInstagram وTwitch. اختر القواعد هنا، ودرع المتصفح ينفّذها.", fr:"Bloque les vidéos, les lives et les posts inadaptés sur YouTube, TikTok, Instagram et Twitch. Choisissez les règles ici ; le bouclier du navigateur les applique.", bn:"YouTube, TikTok, Instagram ও Twitch-এ অনুপযুক্ত ভিডিও, স্ট্রিম ও পোস্ট ব্লক করে। নিয়ম এখানে বেছে নিন; ব্রাউজার শিল্ড সেগুলো প্রয়োগ করে।", pt:"Bloqueia vídeos, diretos e publicações inadequados no YouTube, TikTok, Instagram e Twitch. Escolha as regras aqui; o escudo do navegador aplica-as.", ru:"Блокирует неподходящие видео, трансляции и посты на YouTube, TikTok, Instagram и Twitch. Правила выбираются здесь, а применяет их браузерный щит.", ur:"YouTube، TikTok، Instagram اور Twitch پر نامناسب ویڈیوز، اسٹریمز اور پوسٹس بلاک کرتا ہے۔ اصول یہاں چنیں؛ براؤزر شیلڈ انہیں نافذ کرتی ہے۔", id:"Memblokir video, siaran, dan unggahan yang tidak pantas di YouTube, TikTok, Instagram, dan Twitch. Pilih aturannya di sini; perisai peramban yang menegakkannya.", de:"Blockiert unpassende Videos, Streams und Beiträge auf YouTube, TikTok, Instagram und Twitch. Die Regeln wählen Sie hier, durchgesetzt werden sie vom Browser-Schutz.", ja:"YouTube、TikTok、Instagram、Twitch の不適切な動画・配信・投稿をブロックします。ルールはここで選び、ブラウザのシールドが適用します。", tr:"YouTube, TikTok, Instagram ve Twitch’te uygunsuz video, yayın ve gönderileri engeller. Kuralları burada seçin; tarayıcı kalkanı uygular.", ko:"YouTube, TikTok, Instagram, Twitch의 부적절한 영상·방송·게시물을 차단합니다. 규칙은 여기서 고르고, 브라우저 실드가 적용합니다.", fa:"ویدیوها، پخش‌های زنده و پست‌های نامناسب را در YouTube، TikTok، Instagram و Twitch مسدود می‌کند. قواعد را اینجا انتخاب کنید؛ سپر مرورگر اجرایشان می‌کند.", uk:"Блокує невідповідні відео, трансляції та дописи на YouTube, TikTok, Instagram і Twitch. Правила обираєте тут, а застосовує їх щит браузера.", it:"Blocca video, dirette e post inadatti su YouTube, TikTok, Instagram e Twitch. Le regole si scelgono qui; lo scudo del browser le applica.", pl:"Blokuje nieodpowiednie filmy, transmisje i posty na YouTube, TikTok, Instagram i Twitch. Reguły wybierasz tutaj, a egzekwuje je tarcza w przeglądarce.", vi:"Chặn video, buổi phát và bài đăng không phù hợp trên YouTube, TikTok, Instagram và Twitch. Chọn quy tắc ở đây; lá chắn trình duyệt thực thi." },
  par_shield_plat: { en:"Where it applies", zh:"适用范围", hi:"कहाँ लागू होता है", es:"Dónde se aplica", ar:"أين يُطبَّق", fr:"Où cela s’applique", bn:"কোথায় প্রযোজ্য", pt:"Onde se aplica", ru:"Где действует", ur:"کہاں لاگو ہوتا ہے", id:"Berlaku di mana", de:"Wo es gilt", ja:"適用される場所", tr:"Nerede geçerli", ko:"적용 범위", fa:"کجا اعمال می‌شود", uk:"Де діє", it:"Dove si applica", pl:"Gdzie działa", vi:"Áp dụng ở đâu" },
  par_shield_cats: { en:"What gets blocked", zh:"拦截哪些内容", hi:"क्या ब्लॉक होता है", es:"Qué se bloquea", ar:"ما الذي يُحجب", fr:"Ce qui est bloqué", bn:"কী ব্লক হয়", pt:"O que é bloqueado", ru:"Что блокируется", ur:"کیا بلاک ہوتا ہے", id:"Apa yang diblokir", de:"Was gesperrt wird", ja:"ブロックする対象", tr:"Neler engellenir", ko:"차단되는 것", fa:"چه چیزی مسدود می‌شود", uk:"Що блокується", it:"Cosa viene bloccato", pl:"Co jest blokowane", vi:"Những gì bị chặn" },
  par_shield_lists: { en:"Your own lists", zh:"你自己的名单", hi:"आपकी अपनी सूचियाँ", es:"Tus propias listas", ar:"قوائمك الخاصة", fr:"Vos propres listes", bn:"আপনার নিজের তালিকা", pt:"As suas listas", ru:"Ваши собственные списки", ur:"آپ کی اپنی فہرستیں", id:"Daftar Anda sendiri", de:"Ihre eigenen Listen", ja:"ご自分のリスト", tr:"Kendi listeleriniz", ko:"직접 만든 목록", fa:"فهرست‌های خودتان", uk:"Ваші власні списки", it:"Le sue liste", pl:"Twoje własne listy", vi:"Danh sách của bạn" },
  par_shield_try: { en:"Try it before you trust it", zh:"先试一试再信任它", hi:"भरोसा करने से पहले आज़माएँ", es:"Pruébalo antes de fiarte", ar:"جرّبه قبل أن تثق به", fr:"Testez-le avant de lui faire confiance", bn:"বিশ্বাস করার আগে পরীক্ষা করুন", pt:"Experimente antes de confiar", ru:"Проверьте, прежде чем доверять", ur:"بھروسہ کرنے سے پہلے آزمائیں", id:"Coba dulu sebelum percaya", de:"Erst testen, dann vertrauen", ja:"信頼する前に試してください", tr:"Güvenmeden önce deneyin", ko:"믿기 전에 먼저 시험해 보세요", fa:"پیش از اعتماد، امتحانش کنید", uk:"Перевірте, перш ніж довіряти", it:"Lo provi prima di fidarsi", pl:"Sprawdź, zanim zaufasz", vi:"Thử trước khi tin" },
  f_shield: { en:"Content blocking on YouTube, TikTok, Instagram and Twitch — nine categories, your own allow and block lists, and a log of what it stopped", zh:"在 YouTube、TikTok、Instagram 和 Twitch 上拦截内容——九个类别、你自己的白名单和黑名单，以及拦截记录", hi:"YouTube, TikTok, Instagram और Twitch पर कंटेंट ब्लॉकिंग — नौ श्रेणियाँ, आपकी अपनी अनुमति और ब्लॉक सूचियाँ, और क्या रोका गया इसका लॉग", es:"Bloqueo de contenido en YouTube, TikTok, Instagram y Twitch: nueve categorías, tus propias listas de permitidos y bloqueados, y un registro de lo que paró", ar:"حجب المحتوى على YouTube وTikTok وInstagram وTwitch — تسع فئات، وقوائم سماح وحظر خاصة بك، وسجل بما جرى إيقافه", fr:"Blocage de contenu sur YouTube, TikTok, Instagram et Twitch — neuf catégories, vos propres listes d’autorisation et de blocage, et un journal de ce qui a été arrêté", bn:"YouTube, TikTok, Instagram ও Twitch-এ কনটেন্ট ব্লকিং — নয়টি বিভাগ, আপনার নিজের অনুমোদন ও ব্লক তালিকা, এবং কী আটকানো হলো তার লগ", pt:"Bloqueio de conteúdos no YouTube, TikTok, Instagram e Twitch — nove categorias, as suas listas de permitidos e bloqueados, e um registo do que travou", ru:"Блокировка контента на YouTube, TikTok, Instagram и Twitch — девять категорий, свои списки разрешённого и запрещённого и журнал остановленного", ur:"YouTube، TikTok، Instagram اور Twitch پر مواد کی بلاکنگ — نو زمرے، آپ کی اپنی اجازت اور بلاک فہرستیں، اور جو روکا گیا اس کا لاگ", id:"Pemblokiran konten di YouTube, TikTok, Instagram, dan Twitch — sembilan kategori, daftar izin dan blokir Anda sendiri, serta catatan apa yang dihentikan", de:"Inhaltssperre auf YouTube, TikTok, Instagram und Twitch — neun Kategorien, eigene Erlaubt- und Sperrlisten und ein Protokoll des Geblockten", ja:"YouTube・TikTok・Instagram・Twitch でのコンテンツブロック — 9つのカテゴリ、独自の許可/ブロックリスト、そして止めたもののログ", tr:"YouTube, TikTok, Instagram ve Twitch’te içerik engelleme — dokuz kategori, kendi izin ve engel listeleriniz ve neyin durdurulduğunun kaydı", ko:"YouTube, TikTok, Instagram, Twitch의 콘텐츠 차단 — 아홉 가지 분류, 직접 만든 허용·차단 목록, 그리고 무엇을 막았는지의 기록", fa:"مسدودسازی محتوا در YouTube، TikTok، Instagram و Twitch — نُه دسته، فهرست‌های مجاز و مسدود خودتان، و گزارشی از آنچه متوقف شده", uk:"Блокування вмісту на YouTube, TikTok, Instagram і Twitch — дев’ять категорій, власні списки дозволеного й забороненого та журнал зупиненого", it:"Blocco dei contenuti su YouTube, TikTok, Instagram e Twitch — nove categorie, le sue liste di permessi e blocchi e un registro di ciò che ha fermato", pl:"Blokowanie treści na YouTube, TikTok, Instagram i Twitch — dziewięć kategorii, własne listy dozwolonych i zablokowanych oraz dziennik tego, co zatrzymano", vi:"Chặn nội dung trên YouTube, TikTok, Instagram và Twitch — chín nhóm, danh sách cho phép và chặn của riêng bạn, cùng nhật ký những gì đã chặn" },
  pen: { en:"Pen", zh:"钢笔", hi:"पेन", es:"Bolígrafo", ar:"قلم", fr:"Stylo", bn:"পেন", pt:"Caneta", ru:"Ручка", ur:"قلم", id:"Pena", de:"Stift", ja:"ペン", tr:"Kalem", ko:"펜", fa:"قلم", uk:"Ручка", it:"Penna", pl:"Długopis", vi:"Bút" },
  marker: { en:"Marker", zh:"马克笔", hi:"मार्कर", es:"Rotulador", ar:"قلم تحديد", fr:"Marqueur", bn:"মার্কার", pt:"Marcador", ru:"Маркер", ur:"مارکر", id:"Spidol", de:"Marker", ja:"マーカー", tr:"Marker", ko:"마커", fa:"ماژیک", uk:"Маркер", it:"Pennarello", pl:"Marker", vi:"Bút dạ" },
  pencil: { en:"Pencil", zh:"铅笔", hi:"पेंसिल", es:"Lápiz", ar:"قلم رصاص", fr:"Crayon", bn:"পেন্সিল", pt:"Lápis", ru:"Карандаш", ur:"پنسل", id:"Pensil", de:"Bleistift", ja:"鉛筆", tr:"Kurşun kalem", ko:"연필", fa:"مداد", uk:"Олівець", it:"Matita", pl:"Ołówek", vi:"Bút chì" },
  eraser: { en:"Eraser", zh:"橡皮擦", hi:"रबर", es:"Goma", ar:"ممحاة", fr:"Gomme", bn:"রাবার", pt:"Borracha", ru:"Ластик", ur:"ربڑ", id:"Penghapus", de:"Radierer", ja:"消しゴム", tr:"Silgi", ko:"지우개", fa:"پاک‌کن", uk:"Гумка", it:"Gomma", pl:"Gumka", vi:"Tẩy" },
  /* STUDIO. Every panel in trends-nav.js drew its own English and none of it
     went through here, so the one page carrying the Editor, the AI Editor,
     Photo, the ideas generator, the script writer, the thumbnail maker and
     the analytics read as an English island inside a translated site.

     The AI PROMPTS in that file stay English and are deliberately not here:
     they are instructions to a model, not words anybody reads, and the model
     is told separately which language to answer in. */
  st_ideas_h: { en:"Video Ideas", zh:"视频灵感", hi:"वीडियो आइडिया", es:"Ideas de vídeo", ar:"أفكار فيديو", fr:"Idées de vidéos", bn:"ভিডিও আইডিয়া", pt:"Ideias de vídeo", ru:"Идеи для видео", ur:"ویڈیو آئیڈیاز", id:"Ide video", de:"Video-Ideen", ja:"動画のアイデア", tr:"Video fikirleri", ko:"영상 아이디어", fa:"ایده‌های ویدیو", uk:"Ідеї для відео", it:"Idee per video", pl:"Pomysły na filmy", vi:"Ý tưởng video" },
  st_ideas_p: { en:"Six ideas from one subject, each with the hook it needs. Take any of them straight through to Scripts with one press.", zh:"从一个主题生成六个灵感，每个都带上它需要的开场钩子。任选一个，一键送到脚本。", hi:"एक विषय से छह आइडिया, हर एक के साथ ज़रूरी हुक। किसी को भी एक क्लिक में स्क्रिप्ट्स तक ले जाएँ।", es:"Seis ideas a partir de un tema, cada una con el gancho que necesita. Lleva cualquiera a Guiones con un clic.", ar:"ست أفكار من موضوع واحد، ولكل منها الخطّاف الذي تحتاجه. انقل أيًّا منها إلى النصوص بضغطة.", fr:"Six idées à partir d’un sujet, chacune avec l’accroche qu’il lui faut. Passe n’importe laquelle aux Scripts en un clic.", bn:"একটি বিষয় থেকে ছয়টি আইডিয়া, প্রতিটির সঙ্গে প্রয়োজনীয় হুক। যেকোনোটিকে এক চাপে স্ক্রিপ্টে নিয়ে যান।", pt:"Seis ideias a partir de um tema, cada uma com o gancho de que precisa. Leva qualquer uma para Guiões com um clique.", ru:"Шесть идей из одной темы, у каждой свой крючок. Любую можно отправить в Сценарии одним нажатием.", ur:"ایک موضوع سے چھ آئیڈیاز، ہر ایک کے ساتھ ضروری ہک۔ کسی کو بھی ایک کلک میں اسکرپٹس تک لے جائیں۔", id:"Enam ide dari satu topik, masing-masing dengan hook-nya. Bawa salah satunya ke Naskah dengan sekali tekan.", de:"Sechs Ideen aus einem Thema, jede mit dem passenden Aufhänger. Jede davon geht mit einem Klick zu den Skripten.", ja:"ひとつのテーマから6つのアイデアを、それぞれに必要なフックつきで。どれでもワンタップで台本へ送れます。", tr:"Tek konudan altı fikir, her biri gereken kancasıyla. Herhangi birini tek dokunuşla Senaryolar’a gönder.", ko:"하나의 주제에서 여섯 개의 아이디어를, 각각 필요한 훅과 함께. 아무거나 한 번에 대본으로 보낼 수 있습니다.", fa:"شش ایده از یک موضوع، هر کدام با قلابی که لازم دارد. هر کدام را با یک فشار به فیلمنامه‌ها ببر.", uk:"Шість ідей з однієї теми, у кожної свій гачок. Будь-яку можна відправити до Сценаріїв одним натиском.", it:"Sei idee da un solo argomento, ognuna con il suo gancio. Portane una qualsiasi negli Script con un clic.", pl:"Sześć pomysłów z jednego tematu, każdy z potrzebnym haczykiem. Dowolny przenosisz do Scenariuszy jednym kliknięciem.", vi:"Sáu ý tưởng từ một chủ đề, mỗi ý có sẵn cái móc cần thiết. Đưa bất kỳ ý nào sang Kịch bản chỉ bằng một chạm." },
  st_ideas_seed: { en:"What is it about", zh:"关于什么", hi:"किस बारे में है", es:"¿De qué trata?", ar:"عمّ يدور", fr:"C’est sur quoi", bn:"এটি কী নিয়ে", pt:"É sobre o quê", ru:"О чём это", ur:"یہ کس بارے میں ہے", id:"Tentang apa", de:"Worum geht es", ja:"テーマは何か", tr:"Konusu ne", ko:"무엇에 대한 것인가요", fa:"دربارهٔ چیست", uk:"Про що це", it:"Di cosa parla", pl:"O czym to jest", vi:"Nói về điều gì" },
  st_ideas_ph: { en:"a trend, your channel, or anything", zh:"一个趋势、你的频道，或任何东西", hi:"कोई ट्रेंड, आपका चैनल, या कुछ भी", es:"una tendencia, tu canal o lo que sea", ar:"اتجاه، أو قناتك، أو أي شيء", fr:"une tendance, ta chaîne, ou n’importe quoi", bn:"একটি ট্রেন্ড, আপনার চ্যানেল, বা যা কিছু", pt:"uma tendência, o teu canal, ou o que for", ru:"тренд, твой канал или что угодно", ur:"کوئی ٹرینڈ، آپ کا چینل، یا کچھ بھی", id:"sebuah tren, kanalmu, atau apa saja", de:"ein Trend, dein Kanal, oder irgendwas", ja:"トレンド、自分のチャンネル、何でも", tr:"bir trend, kanalın ya da herhangi bir şey", ko:"트렌드, 내 채널, 무엇이든", fa:"یک ترند، کانالت، یا هر چیزی", uk:"тренд, твій канал або будь-що", it:"una tendenza, il tuo canale, o qualsiasi cosa", pl:"trend, twój kanał albo cokolwiek", vi:"một xu hướng, kênh của bạn, hay bất cứ gì" },
  sh_any: { en:"Any shape", zh:"任何形式", hi:"कोई भी रूप", es:"Cualquier formato", ar:"أي شكل", fr:"N’importe quel format", bn:"যেকোনো ধরন", pt:"Qualquer formato", ru:"Любой формат", ur:"کوئی بھی شکل", id:"Bentuk apa saja", de:"Beliebiges Format", ja:"形式は問わない", tr:"Her biçim", ko:"아무 형식이나", fa:"هر قالبی", uk:"Будь-який формат", it:"Qualsiasi formato", pl:"Dowolny format", vi:"Định dạng nào cũng được" },
  sh_pov: { en:"POV", zh:"第一视角（POV）", hi:"POV", es:"POV", ar:"من وجهة نظرك (POV)", fr:"POV", bn:"POV", pt:"POV", ru:"POV", ur:"POV", id:"POV", de:"POV", ja:"POV（一人称）", tr:"POV", ko:"POV", fa:"POV (زاویهٔ دید)", uk:"POV", it:"POV", pl:"POV", vi:"POV" },
  sh_talking: { en:"Straight to camera", zh:"直接对镜头说", hi:"सीधे कैमरे से बात", es:"Directo a cámara", ar:"مباشرة إلى الكاميرا", fr:"Face caméra", bn:"সরাসরি ক্যামেরায়", pt:"Direto para a câmara", ru:"Прямо в камеру", ur:"سیدھا کیمرے سے بات", id:"Langsung ke kamera", de:"Direkt in die Kamera", ja:"カメラに向かって話す", tr:"Doğrudan kameraya", ko:"카메라에 대고 말하기", fa:"مستقیم رو به دوربین", uk:"Прямо в камеру", it:"Direttamente in camera", pl:"Prosto do kamery", vi:"Nói thẳng vào máy quay" },
  sh_list: { en:"List or ranking", zh:"清单或排名", hi:"लिस्ट या रैंकिंग", es:"Lista o ranking", ar:"قائمة أو ترتيب", fr:"Liste ou classement", bn:"তালিকা বা র‍্যাঙ্কিং", pt:"Lista ou ranking", ru:"Список или рейтинг", ur:"فہرست یا درجہ بندی", id:"Daftar atau peringkat", de:"Liste oder Ranking", ja:"リスト・ランキング", tr:"Liste ya da sıralama", ko:"리스트 또는 순위", fa:"فهرست یا رتبه‌بندی", uk:"Список або рейтинг", it:"Lista o classifica", pl:"Lista lub ranking", vi:"Danh sách hoặc xếp hạng" },
  sh_tutorial: { en:"How-to", zh:"教程", hi:"कैसे करें", es:"Tutorial", ar:"شرح خطوة بخطوة", fr:"Tuto", bn:"কীভাবে করবেন", pt:"Tutorial", ru:"Инструкция", ur:"کیسے کریں", id:"Cara melakukan", de:"Anleitung", ja:"ハウツー", tr:"Nasıl yapılır", ko:"하우투", fa:"آموزش گام‌به‌گام", uk:"Інструкція", it:"Tutorial", pl:"Poradnik", vi:"Hướng dẫn" },
  sh_react: { en:"Reaction", zh:"反应视频", hi:"रिएक्शन", es:"Reacción", ar:"ردّ فعل", fr:"Réaction", bn:"রিঅ্যাকশন", pt:"Reação", ru:"Реакция", ur:"ری ایکشن", id:"Reaksi", de:"Reaction", ja:"リアクション", tr:"Tepki", ko:"리액션", fa:"واکنش", uk:"Реакція", it:"Reaction", pl:"Reakcja", vi:"Phản ứng" },
  sh_day: { en:"Day in the life", zh:"一天的生活", hi:"दिन भर की ज़िंदगी", es:"Un día en mi vida", ar:"يوم في حياتي", fr:"Une journée avec moi", bn:"একদিনের জীবন", pt:"Um dia na minha vida", ru:"День из жизни", ur:"ایک دن کی زندگی", id:"Sehari dalam hidupku", de:"Ein Tag im Leben", ja:"一日の密着", tr:"Bir günüm", ko:"브이로그 하루", fa:"یک روز از زندگی", uk:"День із життя", it:"Un giorno della mia vita", pl:"Dzień z życia", vi:"Một ngày của tôi" },
  sh_story: { en:"Story time", zh:"讲个故事", hi:"स्टोरी टाइम", es:"Story time", ar:"حكاية", fr:"Story time", bn:"গল্প বলা", pt:"Story time", ru:"История", ur:"کہانی", id:"Cerita", de:"Story Time", ja:"ストーリー", tr:"Bir hikâye", ko:"스토리텔링", fa:"قصه‌گویی", uk:"Історія", it:"Story time", pl:"Opowieść", vi:"Kể chuyện" },
  sh_ba: { en:"Before and after", zh:"前后对比", hi:"पहले और बाद", es:"Antes y después", ar:"قبل وبعد", fr:"Avant / après", bn:"আগে আর পরে", pt:"Antes e depois", ru:"До и после", ur:"پہلے اور بعد", id:"Sebelum dan sesudah", de:"Vorher / nachher", ja:"ビフォーアフター", tr:"Öncesi ve sonrası", ko:"비포 애프터", fa:"قبل و بعد", uk:"До і після", it:"Prima e dopo", pl:"Przed i po", vi:"Trước và sau" },
  sh_challenge: { en:"Challenge", zh:"挑战", hi:"चैलेंज", es:"Reto", ar:"تحدٍّ", fr:"Défi", bn:"চ্যালেঞ্জ", pt:"Desafio", ru:"Челлендж", ur:"چیلنج", id:"Tantangan", de:"Challenge", ja:"チャレンジ", tr:"Meydan okuma", ko:"챌린지", fa:"چالش", uk:"Челендж", it:"Sfida", pl:"Wyzwanie", vi:"Thử thách" },
  sh_tier: { en:"Tier list", zh:"梯度排行", hi:"टियर लिस्ट", es:"Tier list", ar:"قائمة تصنيف", fr:"Tier list", bn:"টিয়ার লিস্ট", pt:"Tier list", ru:"Тир-лист", ur:"ٹیئر لسٹ", id:"Tier list", de:"Tier-Liste", ja:"ティアリスト", tr:"Tier list", ko:"티어 리스트", fa:"فهرست رده‌بندی", uk:"Тір-лист", it:"Tier list", pl:"Tier lista", vi:"Bảng xếp hạng tier" },
  sh_myth: { en:"Myth vs fact", zh:"传言与事实", hi:"मिथक बनाम सच", es:"Mito o realidad", ar:"شائعة أم حقيقة", fr:"Mythe ou réalité", bn:"ভুল ধারণা বনাম সত্য", pt:"Mito ou facto", ru:"Миф или правда", ur:"غلط فہمی بمقابلہ حقیقت", id:"Mitos vs fakta", de:"Mythos oder Fakt", ja:"通説の検証", tr:"Efsane mi gerçek mi", ko:"속설 대 사실", fa:"باور غلط یا واقعیت", uk:"Міф чи факт", it:"Mito o realtà", pl:"Mit kontra fakt", vi:"Đồn đại và sự thật" },
  sh_first: { en:"First try or unboxing", zh:"初次尝试或开箱", hi:"पहली कोशिश या अनबॉक्सिंग", es:"Primera vez o unboxing", ar:"تجربة أولى أو فتح صندوق", fr:"Premier essai ou unboxing", bn:"প্রথম চেষ্টা বা আনবক্সিং", pt:"Primeira vez ou unboxing", ru:"Первая попытка или распаковка", ur:"پہلی کوشش یا ان باکسنگ", id:"Coba pertama atau unboxing", de:"Erster Versuch oder Unboxing", ja:"初挑戦・開封", tr:"İlk deneme ya da kutu açılımı", ko:"첫 시도 또는 언박싱", fa:"اولین تجربه یا جعبه‌گشایی", uk:"Перша спроба або розпакування", it:"Prima volta o unboxing", pl:"Pierwsza próba lub unboxing", vi:"Thử lần đầu hoặc mở hộp" },
  sh_skit: { en:"Skit", zh:"短剧", hi:"स्किट", es:"Sketch", ar:"مشهد تمثيلي", fr:"Sketch", bn:"ছোট নাটিকা", pt:"Esquete", ru:"Скетч", ur:"مختصر خاکہ", id:"Sketsa", de:"Sketch", ja:"コント", tr:"Skeç", ko:"콩트", fa:"نمایش کوتاه", uk:"Скетч", it:"Sketch", pl:"Skecz", vi:"Tiểu phẩm" },
  sh_broll: { en:"Voiceover over footage", zh:"画面配旁白", hi:"फुटेज पर वॉइसओवर", es:"Voz en off sobre imágenes", ar:"تعليق صوتي على لقطات", fr:"Voix off sur images", bn:"ফুটেজের ওপর ভয়েসওভার", pt:"Voz off sobre imagens", ru:"Закадровый голос поверх кадров", ur:"فوٹیج پر وائس اوور", id:"Sulih suara di atas rekaman", de:"Voiceover über Aufnahmen", ja:"映像にナレーション", tr:"Görüntü üstüne dış ses", ko:"영상 위 내레이션", fa:"روایت روی تصاویر", uk:"Закадровий голос поверх кадрів", it:"Voce fuori campo sulle riprese", pl:"Narracja na materiale", vi:"Lồng tiếng trên hình" },
  st_shape: { en:"Shape", zh:"形式", hi:"फ़ॉर्मेट", es:"Formato", ar:"الشكل", fr:"Format", bn:"ধরন", pt:"Formato", ru:"Формат", ur:"فارمیٹ", id:"Format", de:"Format", ja:"形式", tr:"Biçim", ko:"형식", fa:"قالب", uk:"Формат", it:"Formato", pl:"Format", vi:"Dạng" },
  st_shape_any: { en:"Any", zh:"任意", hi:"कोई भी", es:"Cualquiera", ar:"أي شكل", fr:"Peu importe", bn:"যেকোনো", pt:"Qualquer", ru:"Любой", ur:"کوئی بھی", id:"Apa saja", de:"Beliebig", ja:"指定なし", tr:"Farketmez", ko:"아무거나", fa:"هر کدام", uk:"Будь-який", it:"Qualsiasi", pl:"Dowolny", vi:"Bất kỳ" },
  st_shape_cam: { en:"Talking to camera", zh:"对镜头讲话", hi:"कैमरे से बात", es:"Hablando a cámara", ar:"حديث أمام الكاميرا", fr:"Face caméra", bn:"ক্যামেরার সামনে কথা", pt:"A falar para a câmara", ru:"Разговор в камеру", ur:"کیمرے سے بات", id:"Bicara ke kamera", de:"In die Kamera sprechen", ja:"カメラに向かって話す", tr:"Kameraya konuşma", ko:"카메라에 말하기", fa:"صحبت رو به دوربین", uk:"Розмова в камеру", it:"Parlato in camera", pl:"Mówienie do kamery", vi:"Nói trước máy quay" },
  st_shape_list: { en:"List", zh:"清单", hi:"लिस्ट", es:"Lista", ar:"قائمة", fr:"Liste", bn:"তালিকা", pt:"Lista", ru:"Список", ur:"فہرست", id:"Daftar", de:"Liste", ja:"リスト", tr:"Liste", ko:"리스트", fa:"فهرست", uk:"Список", it:"Lista", pl:"Lista", vi:"Danh sách" },
  st_shape_tut: { en:"Tutorial", zh:"教程", hi:"ट्यूटोरियल", es:"Tutorial", ar:"شرح تعليمي", fr:"Tutoriel", bn:"টিউটোরিয়াল", pt:"Tutorial", ru:"Туториал", ur:"ٹیوٹوریل", id:"Tutorial", de:"Tutorial", ja:"チュートリアル", tr:"Öğretici", ko:"튜토리얼", fa:"آموزش", uk:"Туторіал", it:"Tutorial", pl:"Poradnik", vi:"Hướng dẫn" },
  st_shape_react: { en:"Reaction", zh:"反应视频", hi:"रिएक्शन", es:"Reacción", ar:"ردّ فعل", fr:"Réaction", bn:"রিঅ্যাকশন", pt:"Reação", ru:"Реакция", ur:"ری ایکشن", id:"Reaksi", de:"Reaction", ja:"リアクション", tr:"Tepki", ko:"리액션", fa:"واکنش", uk:"Реакція", it:"Reaction", pl:"Reakcja", vi:"Phản ứng" },
  st_aud: { en:"Who it is for", zh:"给谁看", hi:"किसके लिए है", es:"Para quién es", ar:"لمن هو", fr:"C’est pour qui", bn:"কার জন্য", pt:"Para quem é", ru:"Для кого", ur:"کس کے لیے", id:"Untuk siapa", de:"Für wen", ja:"誰向けか", tr:"Kimin için", ko:"누구를 위한 것인가", fa:"برای چه کسی", uk:"Для кого", it:"Per chi è", pl:"Dla kogo", vi:"Dành cho ai" },
  st_aud_old: { en:"People who already follow me", zh:"已经关注我的人", hi:"जो पहले से फ़ॉलो करते हैं", es:"Quien ya me sigue", ar:"من يتابعونني بالفعل", fr:"Ceux qui me suivent déjà", bn:"যারা আগে থেকেই ফলো করে", pt:"Quem já me segue", ru:"Те, кто уже подписан", ur:"جو پہلے سے فالو کرتے ہیں", id:"Orang yang sudah mengikutiku", de:"Leute, die mir schon folgen", ja:"すでにフォローしている人", tr:"Beni zaten takip edenler", ko:"이미 팔로우한 사람", fa:"کسانی که از قبل دنبالم می‌کنند", uk:"Ті, хто вже підписаний", it:"Chi mi segue già", pl:"Ci, którzy już mnie obserwują", vi:"Người đã theo dõi tôi" },
  st_aud_new: { en:"People who have never seen me", zh:"从没见过我的人", hi:"जिन्होंने मुझे कभी नहीं देखा", es:"Quien no me ha visto nunca", ar:"من لم يروني من قبل", fr:"Ceux qui ne m’ont jamais vu", bn:"যারা কখনো দেখেনি", pt:"Quem nunca me viu", ru:"Те, кто меня не видел", ur:"جنہوں نے مجھے کبھی نہیں دیکھا", id:"Orang yang belum pernah melihatku", de:"Leute, die mich noch nie gesehen haben", ja:"まだ知らない人", tr:"Beni hiç görmemiş olanlar", ko:"나를 처음 보는 사람", fa:"کسانی که هرگز مرا ندیده‌اند", uk:"Ті, хто мене не бачив", it:"Chi non mi ha mai visto", pl:"Ci, którzy mnie nie znają", vi:"Người chưa từng thấy tôi" },
  st_i_aud_both: { en:"Both at once", zh:"两者兼顾", hi:"दोनों एक साथ", es:"Ambos a la vez", ar:"الاثنان معًا", fr:"Les deux à la fois", bn:"দুটোই একসঙ্গে", pt:"Os dois ao mesmo tempo", ru:"И те и другие сразу", ur:"دونوں ایک ساتھ", id:"Keduanya sekaligus", de:"Beides zugleich", ja:"どちらにも", tr:"İkisi birden", ko:"둘 다", fa:"هر دو با هم", uk:"І ті, й інші одразу", it:"Entrambi insieme", pl:"Oba naraz", vi:"Cả hai cùng lúc" },
  st_i_len: { en:"How long", zh:"多长", hi:"कितना लंबा", es:"Duración", ar:"كم المدة", fr:"Quelle durée", bn:"কত লম্বা", pt:"Duração", ru:"Какой длины", ur:"کتنا لمبا", id:"Seberapa panjang", de:"Wie lang", ja:"長さ", tr:"Ne kadar uzun", ko:"길이", fa:"چقدر طولانی", uk:"Якої довжини", it:"Quanto lungo", pl:"Jak długie", vi:"Dài bao nhiêu" },
  st_i_len15: { en:"Under 15 seconds", zh:"15 秒以内", hi:"15 सेकंड से कम", es:"Menos de 15 segundos", ar:"أقل من 15 ثانية", fr:"Moins de 15 secondes", bn:"১৫ সেকেন্ডের কম", pt:"Menos de 15 segundos", ru:"Меньше 15 секунд", ur:"15 سیکنڈ سے کم", id:"Di bawah 15 detik", de:"Unter 15 Sekunden", ja:"15秒未満", tr:"15 saniyenin altı", ko:"15초 미만", fa:"کمتر از ۱۵ ثانیه", uk:"Менше 15 секунд", it:"Meno di 15 secondi", pl:"Poniżej 15 sekund", vi:"Dưới 15 giây" },
  st_i_len30: { en:"15 to 30 seconds", zh:"15 到 30 秒", hi:"15 से 30 सेकंड", es:"De 15 a 30 segundos", ar:"من 15 إلى 30 ثانية", fr:"15 à 30 secondes", bn:"১৫ থেকে ৩০ সেকেন্ড", pt:"15 a 30 segundos", ru:"15–30 секунд", ur:"15 سے 30 سیکنڈ", id:"15 sampai 30 detik", de:"15 bis 30 Sekunden", ja:"15〜30秒", tr:"15 ile 30 saniye", ko:"15~30초", fa:"۱۵ تا ۳۰ ثانیه", uk:"15–30 секунд", it:"Da 15 a 30 secondi", pl:"15 do 30 sekund", vi:"15 đến 30 giây" },
  st_i_len60: { en:"30 to 60 seconds", zh:"30 到 60 秒", hi:"30 से 60 सेकंड", es:"De 30 a 60 segundos", ar:"من 30 إلى 60 ثانية", fr:"30 à 60 secondes", bn:"৩০ থেকে ৬০ সেকেন্ড", pt:"30 a 60 segundos", ru:"30–60 секунд", ur:"30 سے 60 سیکنڈ", id:"30 sampai 60 detik", de:"30 bis 60 Sekunden", ja:"30〜60秒", tr:"30 ile 60 saniye", ko:"30~60초", fa:"۳۰ تا ۶۰ ثانیه", uk:"30–60 секунд", it:"Da 30 a 60 secondi", pl:"30 do 60 sekund", vi:"30 đến 60 giây" },
  st_i_len180: { en:"One to three minutes", zh:"一到三分钟", hi:"एक से तीन मिनट", es:"De uno a tres minutos", ar:"من دقيقة إلى ثلاث", fr:"Une à trois minutes", bn:"এক থেকে তিন মিনিট", pt:"Um a três minutos", ru:"От одной до трёх минут", ur:"ایک سے تین منٹ", id:"Satu sampai tiga menit", de:"Eine bis drei Minuten", ja:"1〜3分", tr:"Bir ile üç dakika", ko:"1~3분", fa:"یک تا سه دقیقه", uk:"Від однієї до трьох хвилин", it:"Da uno a tre minuti", pl:"Od jednej do trzech minut", vi:"Một đến ba phút" },
  st_i_energy: { en:"Energy", zh:"气质", hi:"एनर्जी", es:"Energía", ar:"الطاقة", fr:"Énergie", bn:"এনার্জি", pt:"Energia", ru:"Настрой", ur:"انداز", id:"Energi", de:"Energie", ja:"テンション", tr:"Enerji", ko:"분위기", fa:"حال‌وهوا", uk:"Настрій", it:"Energia", pl:"Energia", vi:"Năng lượng" },
  st_i_en_any: { en:"Whatever fits", zh:"合适就行", hi:"जो फिट बैठे", es:"Lo que encaje", ar:"ما يناسب", fr:"Ce qui colle", bn:"যা মানায়", pt:"O que encaixar", ru:"Что подойдёт", ur:"جو مناسب ہو", id:"Apa pun yang cocok", de:"Was passt", ja:"合うものなら何でも", tr:"Ne uyuyorsa", ko:"어울리는 대로", fa:"هرچه جور دربیاید", uk:"Що пасуватиме", it:"Quello che ci sta", pl:"Cokolwiek pasuje", vi:"Gì hợp cũng được" },
  st_i_en_funny: { en:"Funny", zh:"搞笑", hi:"मज़ेदार", es:"Divertido", ar:"مضحك", fr:"Drôle", bn:"মজার", pt:"Engraçado", ru:"Смешное", ur:"مزاحیہ", id:"Lucu", de:"Lustig", ja:"笑える", tr:"Komik", ko:"웃긴", fa:"بامزه", uk:"Смішне", it:"Divertente", pl:"Śmieszne", vi:"Hài" },
  st_i_en_calm: { en:"Calm and quiet", zh:"安静平和", hi:"शांत और धीमा", es:"Tranquilo y sereno", ar:"هادئ وساكن", fr:"Calme et posé", bn:"শান্ত আর নরম", pt:"Calmo e sereno", ru:"Спокойное и тихое", ur:"پُرسکون اور دھیما", id:"Tenang dan pelan", de:"Ruhig und leise", ja:"落ち着いた", tr:"Sakin ve sessiz", ko:"차분하고 조용한", fa:"آرام و بی‌سروصدا", uk:"Спокійне й тихе", it:"Calmo e tranquillo", pl:"Spokojne i ciche", vi:"Nhẹ nhàng và yên" },
  st_i_en_drama: { en:"Something at stake", zh:"有赌注的", hi:"कुछ दाँव पर हो", es:"Con algo en juego", ar:"فيه ما يُخسر", fr:"Avec un enjeu", bn:"কিছু ঝুঁকিতে থাকা", pt:"Com algo em jogo", ru:"Со ставкой", ur:"کچھ داؤ پر ہو", id:"Ada yang dipertaruhkan", de:"Mit etwas auf dem Spiel", ja:"何かが懸かっている", tr:"Ortada bir şey varken", ko:"걸린 게 있는", fa:"وقتی چیزی در خطر است", uk:"Зі ставкою", it:"Con qualcosa in gioco", pl:"Ze stawką", vi:"Có gì đó để mất" },
  st_i_en_useful: { en:"Plainly useful", zh:"实用为主", hi:"सीधा काम का", es:"Simplemente útil", ar:"مفيد ببساطة", fr:"Simplement utile", bn:"সরাসরি কাজের", pt:"Simplesmente útil", ru:"Просто полезное", ur:"سیدھا کارآمد", id:"Berguna apa adanya", de:"Schlicht nützlich", ja:"素直に役立つ", tr:"Sade ve işe yarar", ko:"그냥 유용한", fa:"ساده و به‌درد‌بخور", uk:"Просто корисне", it:"Semplicemente utile", pl:"Po prostu przydatne", vi:"Đơn giản là hữu ích" },
  st_i_gear: { en:"What you can film with", zh:"你能用什么拍", hi:"आप किससे शूट कर सकते हैं", es:"Con qué puedes grabar", ar:"بماذا يمكنك التصوير", fr:"Avec quoi tu peux filmer", bn:"কী দিয়ে শুট করতে পারবেন", pt:"Com o que podes filmar", ru:"Чем ты можешь снять", ur:"آپ کس سے شوٹ کر سکتے ہیں", id:"Kamu bisa merekam dengan apa", de:"Womit du filmen kannst", ja:"何で撮れるか", tr:"Neyle çekebilirsin", ko:"무엇으로 찍을 수 있는지", fa:"با چه چیزی می‌توانی فیلم بگیری", uk:"Чим ти можеш зняти", it:"Con cosa puoi girare", pl:"Czym możesz nakręcić", vi:"Bạn quay bằng gì" },
  st_i_gear_phone: { en:"Just a phone", zh:"只有手机", hi:"सिर्फ़ फ़ोन", es:"Solo un móvil", ar:"هاتف فقط", fr:"Juste un téléphone", bn:"শুধু একটা ফোন", pt:"Só um telemóvel", ru:"Только телефон", ur:"صرف فون", id:"Cuma ponsel", de:"Nur ein Handy", ja:"スマホだけ", tr:"Sadece bir telefon", ko:"휴대폰만", fa:"فقط یک گوشی", uk:"Лише телефон", it:"Solo un telefono", pl:"Tylko telefon", vi:"Chỉ một cái điện thoại" },
  st_i_gear_edit: { en:"Phone plus editing", zh:"手机加剪辑", hi:"फ़ोन और एडिटिंग", es:"Móvil y edición", ar:"هاتف مع مونتاج", fr:"Téléphone et montage", bn:"ফোন আর এডিটিং", pt:"Telemóvel e edição", ru:"Телефон и монтаж", ur:"فون اور ایڈیٹنگ", id:"Ponsel plus editing", de:"Handy plus Schnitt", ja:"スマホ＋編集", tr:"Telefon artı kurgu", ko:"휴대폰에 편집까지", fa:"گوشی به‌علاوهٔ تدوین", uk:"Телефон і монтаж", it:"Telefono più montaggio", pl:"Telefon plus montaż", vi:"Điện thoại cộng dựng" },
  st_i_gear_setup: { en:"A proper setup", zh:"齐全的设备", hi:"पूरा सेटअप", es:"Un equipo en condiciones", ar:"معدات كاملة", fr:"Un vrai matériel", bn:"পুরো সেটআপ", pt:"Um equipamento a sério", ru:"Настоящая установка", ur:"مکمل سیٹ اپ", id:"Perangkat lengkap", de:"Ein richtiges Setup", ja:"ちゃんとした機材", tr:"Düzgün bir düzenek", ko:"제대로 된 장비", fa:"یک ست کامل", uk:"Справжнє обладнання", it:"Un vero setup", pl:"Porządny sprzęt", vi:"Bộ đồ nghề đầy đủ" },
  st_i_count: { en:"How many", zh:"要多少个", hi:"कितने", es:"Cuántas", ar:"كم عددها", fr:"Combien", bn:"কতগুলো", pt:"Quantas", ru:"Сколько", ur:"کتنے", id:"Berapa banyak", de:"Wie viele", ja:"いくつ", tr:"Kaç tane", ko:"몇 개", fa:"چندتا", uk:"Скільки", it:"Quante", pl:"Ile", vi:"Bao nhiêu" },
  st_i_count6: { en:"Six", zh:"六个", hi:"छह", es:"Seis", ar:"ستة", fr:"Six", bn:"ছয়টি", pt:"Seis", ru:"Шесть", ur:"چھ", id:"Enam", de:"Sechs", ja:"6つ", tr:"Altı", ko:"여섯 개", fa:"شش", uk:"Шість", it:"Sei", pl:"Sześć", vi:"Sáu" },
  st_i_count12: { en:"Twelve", zh:"十二个", hi:"बारह", es:"Doce", ar:"اثنا عشر", fr:"Douze", bn:"বারোটি", pt:"Doze", ru:"Двенадцать", ur:"بارہ", id:"Dua belas", de:"Zwölf", ja:"12個", tr:"On iki", ko:"열두 개", fa:"دوازده", uk:"Дванадцять", it:"Dodici", pl:"Dwanaście", vi:"Mười hai" },
  st_i_shortlist: { en:"Your shortlist ({n})", zh:"你的候选清单（{n}）", hi:"आपकी शॉर्टलिस्ट ({n})", es:"Tu lista corta ({n})", ar:"قائمتك المختصرة ({n})", fr:"Ta sélection ({n})", bn:"আপনার শর্টলিস্ট ({n})", pt:"A tua lista curta ({n})", ru:"Твой шорт-лист ({n})", ur:"آپ کی شارٹ لسٹ ({n})", id:"Daftar pendekmu ({n})", de:"Deine Auswahl ({n})", ja:"あなたの候補（{n}）", tr:"Kısa listen ({n})", ko:"내 후보 목록 ({n})", fa:"فهرست کوتاه تو ({n})", uk:"Твій шортліст ({n})", it:"La tua rosa ({n})", pl:"Twoja krótka lista ({n})", vi:"Danh sách rút gọn của bạn ({n})" },
  st_i_fresh: { en:"{n} new", zh:"{n} 个新的", hi:"{n} नए", es:"{n} nuevas", ar:"{n} جديدة", fr:"{n} nouvelles", bn:"{n}টি নতুন", pt:"{n} novas", ru:"{n} новых", ur:"{n} نئے", id:"{n} baru", de:"{n} neue", ja:"新しい{n}件", tr:"{n} yeni", ko:"새 {n}개", fa:"{n} تای تازه", uk:"{n} нових", it:"{n} nuove", pl:"{n} nowych", vi:"{n} cái mới" },
  st_i_remove: { en:"Remove", zh:"移除", hi:"हटाएँ", es:"Quitar", ar:"إزالة", fr:"Retirer", bn:"সরান", pt:"Remover", ru:"Убрать", ur:"ہٹائیں", id:"Hapus", de:"Entfernen", ja:"外す", tr:"Kaldır", ko:"빼기", fa:"حذف", uk:"Прибрати", it:"Rimuovi", pl:"Usuń", vi:"Bỏ" },
  st_i_dl_list: { en:"Download the shortlist", zh:"下载候选清单", hi:"शॉर्टलिस्ट डाउनलोड करें", es:"Descargar la lista corta", ar:"نزّل القائمة المختصرة", fr:"Télécharger la sélection", bn:"শর্টলিস্ট ডাউনলোড করুন", pt:"Descarregar a lista curta", ru:"Скачать шорт-лист", ur:"شارٹ لسٹ ڈاؤن لوڈ کریں", id:"Unduh daftar pendek", de:"Auswahl herunterladen", ja:"候補をダウンロード", tr:"Kısa listeyi indir", ko:"후보 목록 내려받기", fa:"دانلود فهرست کوتاه", uk:"Завантажити шортліст", it:"Scarica la rosa", pl:"Pobierz krótką listę", vi:"Tải danh sách rút gọn" },
  st_i_dl: { en:"Download them all", zh:"全部下载", hi:"सब डाउनलोड करें", es:"Descargarlas todas", ar:"نزّلها كلها", fr:"Tout télécharger", bn:"সবগুলো ডাউনলোড করুন", pt:"Descarregar todas", ru:"Скачать все", ur:"سب ڈاؤن لوڈ کریں", id:"Unduh semuanya", de:"Alle herunterladen", ja:"すべてダウンロード", tr:"Hepsini indir", ko:"전부 내려받기", fa:"دانلود همه", uk:"Завантажити всі", it:"Scaricale tutte", pl:"Pobierz wszystkie", vi:"Tải hết về" },
  st_i_again: { en:"Try again", zh:"再来一次", hi:"फिर से कोशिश करें", es:"Otra tanda", ar:"جرّب مرة أخرى", fr:"Encore une fournée", bn:"আবার চেষ্টা করুন", pt:"Outra vez", ru:"Ещё раз", ur:"دوبارہ کوشش کریں", id:"Coba lagi", de:"Noch einmal", ja:"もう一度", tr:"Bir daha", ko:"다시 해보기", fa:"یک‌بار دیگر", uk:"Ще раз", it:"Un altro giro", pl:"Jeszcze raz", vi:"Thử lại" },
  st_i_dl_ok: { en:"Saved to your downloads.", zh:"已保存到下载文件夹。", hi:"आपके डाउनलोड में सेव हो गया।", es:"Guardado en tus descargas.", ar:"حُفظ في تنزيلاتك.", fr:"Enregistré dans tes téléchargements.", bn:"আপনার ডাউনলোডে সেভ হয়েছে।", pt:"Guardado nas tuas transferências.", ru:"Сохранено в загрузки.", ur:"آپ کے ڈاؤن لوڈز میں محفوظ ہو گیا۔", id:"Tersimpan di unduhanmu.", de:"In deinen Downloads gespeichert.", ja:"ダウンロードに保存しました。", tr:"İndirilenlere kaydedildi.", ko:"다운로드 폴더에 저장했습니다.", fa:"در دانلودهایت ذخیره شد.", uk:"Збережено в завантаження.", it:"Salvato nei download.", pl:"Zapisano w pobranych.", vi:"Đã lưu vào thư mục tải về." },
  st_i_dl_no: { en:"This browser would not allow the download.", zh:"这个浏览器不允许下载。", hi:"इस ब्राउज़र ने डाउनलोड की अनुमति नहीं दी।", es:"Este navegador no ha permitido la descarga.", ar:"لم يسمح هذا المتصفح بالتنزيل.", fr:"Ce navigateur a refusé le téléchargement.", bn:"এই ব্রাউজার ডাউনলোড করতে দেয়নি।", pt:"Este navegador não permitiu a transferência.", ru:"Этот браузер не разрешил загрузку.", ur:"اس براؤزر نے ڈاؤن لوڈ کی اجازت نہیں دی۔", id:"Peramban ini menolak unduhan.", de:"Dieser Browser hat den Download verweigert.", ja:"このブラウザがダウンロードを許可しませんでした。", tr:"Bu tarayıcı indirmeye izin vermedi.", ko:"이 브라우저가 내려받기를 허용하지 않았습니다.", fa:"این مرورگر اجازهٔ دانلود نداد.", uk:"Цей браузер не дозволив завантаження.", it:"Questo browser non ha permesso il download.", pl:"Ta przeglądarka nie pozwoliła na pobranie.", vi:"Trình duyệt này không cho tải về." },
  st_i_need: { en:"Say what it is about first.", zh:"先说说它是关于什么的。", hi:"पहले बताइए कि यह किस बारे में है।", es:"Di primero de qué va.", ar:"قل أولًا عمّا يدور.", fr:"Dis d’abord de quoi ça parle.", bn:"আগে বলুন এটা কী নিয়ে।", pt:"Diz primeiro do que se trata.", ru:"Сначала скажи, о чём это.", ur:"پہلے بتائیں یہ کس بارے میں ہے۔", id:"Sebutkan dulu ini tentang apa.", de:"Sag zuerst, worum es geht.", ja:"まず何についてか書いてください。", tr:"Önce neyle ilgili olduğunu yaz.", ko:"먼저 무엇에 관한 것인지 적어 주세요.", fa:"اول بگو دربارهٔ چیست.", uk:"Спершу скажи, про що це.", it:"Di’ prima di cosa parla.", pl:"Najpierw napisz, o czym to.", vi:"Hãy nói trước nó về cái gì." },
  st_i_thinking: { en:"Working out what would actually land…", zh:"正在想哪些真的能打中……", hi:"सोच रहे हैं कि असल में क्या चलेगा…", es:"Pensando qué funcionaría de verdad…", ar:"نفكّر فيما سينجح فعلًا…", fr:"On cherche ce qui marcherait vraiment…", bn:"আসলে কী কাজ করবে ভাবা হচ্ছে…", pt:"A pensar no que resultaria mesmo…", ru:"Думаю, что действительно сработает…", ur:"سوچا جا رہا ہے کہ اصل میں کیا چلے گا…", id:"Memikirkan apa yang benar-benar akan kena…", de:"Überlege, was wirklich ankommt…", ja:"本当に刺さるものを考えています…", tr:"Gerçekten tutacak olanı düşünüyorum…", ko:"정말 먹힐 만한 걸 고르는 중…", fa:"دارم فکر می‌کنم چه چیزی واقعاً می‌گیرد…", uk:"Думаю, що справді спрацює…", it:"Sto cercando cosa funzionerebbe davvero…", pl:"Zastanawiam się, co naprawdę chwyci…", vi:"Đang nghĩ xem cái gì thật sự ăn khách…" },
  st_i_none: { en:"Nothing came back. Try saying the subject differently.", zh:"什么都没返回。换个说法描述主题试试。", hi:"कुछ नहीं आया। विषय को दूसरे शब्दों में लिखकर देखें।", es:"No ha vuelto nada. Prueba a decir el tema de otra forma.", ar:"لم يعد شيء. جرّب صياغة الموضوع بطريقة أخرى.", fr:"Rien n’est revenu. Essaie de formuler le sujet autrement.", bn:"কিছুই আসেনি। বিষয়টা অন্যভাবে লিখে দেখুন।", pt:"Não voltou nada. Tenta dizer o tema de outra maneira.", ru:"Ничего не вернулось. Попробуй сформулировать тему иначе.", ur:"کچھ نہیں آیا۔ موضوع کو مختلف الفاظ میں لکھ کر دیکھیں۔", id:"Tidak ada yang kembali. Coba tulis topiknya dengan kata lain.", de:"Es kam nichts zurück. Formulier das Thema mal anders.", ja:"何も返りませんでした。テーマの言い方を変えてみてください。", tr:"Bir şey dönmedi. Konuyu farklı ifade etmeyi dene.", ko:"아무것도 오지 않았습니다. 주제를 다르게 적어 보세요.", fa:"چیزی برنگشت. موضوع را جور دیگری بنویس.", uk:"Нічого не повернулося. Спробуй сформулювати тему інакше.", it:"Non è tornato nulla. Prova a dire il tema in altro modo.", pl:"Nic nie wróciło. Spróbuj ująć temat inaczej.", vi:"Không có gì trả về. Thử diễn đạt chủ đề khác xem." },
  st_i_first: { en:"Opens on", zh:"开场是", hi:"शुरुआत", es:"Abre con", ar:"يبدأ بـ", fr:"Ça ouvre sur", bn:"শুরু হয়", pt:"Abre com", ru:"Начинается с", ur:"شروع ہوتا ہے", id:"Dibuka dengan", de:"Beginnt mit", ja:"冒頭は", tr:"Şununla açılır", ko:"첫 장면", fa:"شروع با", uk:"Починається з", it:"Apre con", pl:"Zaczyna się od", vi:"Mở đầu bằng" },
  st_i_save: { en:"Save it", zh:"保存", hi:"सेव करें", es:"Guardar", ar:"احفظها", fr:"Garder", bn:"সেভ করুন", pt:"Guardar", ru:"Сохранить", ur:"محفوظ کریں", id:"Simpan", de:"Merken", ja:"保存", tr:"Kaydet", ko:"저장", fa:"ذخیره کن", uk:"Зберегти", it:"Salvala", pl:"Zapisz", vi:"Lưu lại" },
  st_i_saved_btn: { en:"Saved", zh:"已保存", hi:"सेव हो गया", es:"Guardada", ar:"محفوظة", fr:"Gardée", bn:"সেভ হয়েছে", pt:"Guardada", ru:"Сохранено", ur:"محفوظ", id:"Tersimpan", de:"Gemerkt", ja:"保存済み", tr:"Kaydedildi", ko:"저장됨", fa:"ذخیره شد", uk:"Збережено", it:"Salvata", pl:"Zapisano", vi:"Đã lưu" },
  st_i_saved: { en:"On your shortlist. It counts towards a certificate.", zh:"已加入候选清单。这也计入证书。", hi:"आपकी शॉर्टलिस्ट में। यह सर्टिफिकेट में गिना जाता है।", es:"En tu lista corta. Cuenta para un certificado.", ar:"في قائمتك المختصرة. وتُحتسب للشهادة.", fr:"Dans ta sélection. Ça compte pour un certificat.", bn:"আপনার শর্টলিস্টে। এটি সার্টিফিকেটে গণ্য হয়।", pt:"Na tua lista curta. Conta para um certificado.", ru:"В твоём шорт-листе. Засчитано к сертификату.", ur:"آپ کی شارٹ لسٹ میں۔ یہ سرٹیفکیٹ میں شمار ہوتا ہے۔", id:"Masuk daftar pendekmu. Ini dihitung untuk sertifikat.", de:"In deiner Auswahl. Zählt fürs Zertifikat.", ja:"候補に入れました。証明書に加算されます。", tr:"Kısa listende. Sertifikaya sayılıyor.", ko:"후보 목록에 담았습니다. 수료증에 반영됩니다.", fa:"در فهرست کوتاهت. برای گواهی حساب می‌شود.", uk:"У твоєму шортлісті. Зараховано до сертифіката.", it:"Nella tua rosa. Conta per un certificato.", pl:"Na twojej krótkiej liście. Liczy się do certyfikatu.", vi:"Đã vào danh sách rút gọn. Được tính cho chứng chỉ." },
  st_i_dupe: { en:"That one is already on your shortlist.", zh:"这个已经在候选清单里了。", hi:"यह पहले से आपकी शॉर्टलिस्ट में है।", es:"Esa ya está en tu lista corta.", ar:"هذه موجودة في قائمتك بالفعل.", fr:"Celle-là est déjà dans ta sélection.", bn:"এটা আগেই আপনার শর্টলিস্টে আছে।", pt:"Essa já está na tua lista curta.", ru:"Эта уже в твоём шорт-листе.", ur:"یہ پہلے سے آپ کی شارٹ لسٹ میں ہے۔", id:"Yang itu sudah ada di daftar pendekmu.", de:"Die ist schon in deiner Auswahl.", ja:"それはもう候補に入っています。", tr:"O zaten kısa listende.", ko:"그건 이미 후보 목록에 있습니다.", fa:"آن یکی از قبل در فهرست کوتاهت هست.", uk:"Ця вже у твоєму шортлісті.", it:"Quella è già nella tua rosa.", pl:"Ten jest już na twojej krótkiej liście.", vi:"Cái đó đã có trong danh sách rút gọn rồi." },
  st_i_thumb: { en:"Thumbnail", zh:"做缩略图", hi:"थंबनेल", es:"Miniatura", ar:"صورة مصغّرة", fr:"Miniature", bn:"থাম্বনেইল", pt:"Miniatura", ru:"Обложка", ur:"تھمب نیل", id:"Thumbnail", de:"Thumbnail", ja:"サムネイル", tr:"Kapak görseli", ko:"썸네일", fa:"تصویر بندانگشتی", uk:"Обкладинка", it:"Miniatura", pl:"Miniatura", vi:"Ảnh bìa" },
  st_i_done: { en:"{n} of them. None is an instruction — pick one and change it.", zh:"共 {n} 个。它们都不是命令——挑一个然后改它。", hi:"{n} आइडिया। कोई भी आदेश नहीं है — एक चुनिए और उसे बदलिए।", es:"{n} en total. Ninguna es una orden: coge una y cámbiala.", ar:"{n} منها. لا واحدة منها أمر — اختر واحدة وغيّرها.", fr:"{n} en tout. Aucune n’est une consigne — prends-en une et change-la.", bn:"{n}টি। কোনোটাই নির্দেশ নয় — একটা বেছে নিয়ে বদলান।", pt:"{n} delas. Nenhuma é uma ordem — escolhe uma e muda-a.", ru:"Их {n}. Ни одна не указание — возьми одну и переделай.", ur:"{n} آئیڈیاز۔ کوئی بھی حکم نہیں — ایک چنیں اور اسے بدلیں۔", id:"Ada {n}. Tidak satu pun perintah — ambil satu dan ubah.", de:"{n} Stück. Keine ist eine Anweisung — nimm eine und ändere sie.", ja:"{n}件。どれも指示ではありません。ひとつ選んで変えてください。", tr:"{n} tane. Hiçbiri talimat değil — birini al ve değiştir.", ko:"{n}개입니다. 어느 것도 지시가 아닙니다 — 하나 골라 바꿔 보세요.", fa:"{n} تا. هیچ‌کدام دستور نیستند — یکی را بردار و عوضش کن.", uk:"Їх {n}. Жодна не вказівка — візьми одну і зміни.", it:"{n} idee. Nessuna è un ordine: prendine una e cambiala.", pl:"{n} sztuk. Żaden to nie polecenie — weź jeden i zmień go.", vi:"{n} cái. Không cái nào là mệnh lệnh — chọn một rồi sửa đi." },
  st_ideas_go: { en:"Give me six", zh:"给我六个", hi:"छह दो", es:"Dame seis", ar:"أعطني ستًّا", fr:"Donne-m’en six", bn:"ছয়টি দিন", pt:"Dá-me seis", ru:"Дай шесть", ur:"مجھے چھ دیں", id:"Beri enam", de:"Gib mir sechs", ja:"6つ出して", tr:"Bana altı tane ver", ko:"여섯 개 주세요", fa:"شش تا بده", uk:"Дай шість", it:"Dammene sei", pl:"Daj sześć", vi:"Cho tôi sáu ý" },
  st_scripts_h: { en:"Scripts", zh:"脚本", hi:"स्क्रिप्ट", es:"Guiones", ar:"النصوص", fr:"Scripts", bn:"স্ক্রিপ্ট", pt:"Guiões", ru:"Сценарии", ur:"اسکرپٹس", id:"Naskah", de:"Skripte", ja:"台本", tr:"Senaryolar", ko:"대본", fa:"فیلمنامه‌ها", uk:"Сценарії", it:"Script", pl:"Scenariusze", vi:"Kịch bản" },
  st_scripts_p: { en:"Turn a trend into something you can actually read out. It writes a hook, the middle and an ending — short, because a short video is what this is for.", zh:"把趋势变成真能念出来的稿子。它会写开场、中段和结尾——很短，因为这就是给短视频用的。", hi:"ट्रेंड को ऐसी चीज़ में बदलें जिसे सच में पढ़ा जा सके। यह हुक, बीच का हिस्सा और अंत लिखता है — छोटा, क्योंकि यह छोटे वीडियो के लिए है।", es:"Convierte una tendencia en algo que puedas leer en voz alta. Escribe el gancho, el medio y el final: corto, porque esto es para vídeos cortos.", ar:"حوّل الاتجاه إلى نص يمكنك قراءته فعلًا. يكتب الخطّاف والوسط والنهاية — قصيرًا، لأن هذا للفيديو القصير.", fr:"Transforme une tendance en quelque chose que tu peux vraiment lire à voix haute. Il écrit l’accroche, le milieu et la fin — court, parce que c’est fait pour la vidéo courte.", bn:"ট্রেন্ডকে এমন কিছুতে বদলান যা সত্যিই পড়া যায়। এটি হুক, মাঝের অংশ আর শেষটা লেখে — ছোট, কারণ এটি ছোট ভিডিওর জন্যই।", pt:"Transforma uma tendência em algo que consegues mesmo ler em voz alta. Escreve o gancho, o meio e o fim — curto, porque é para vídeo curto.", ru:"Превращает тренд в то, что можно вслух прочитать. Пишет крючок, середину и концовку — коротко, потому что это для коротких видео.", ur:"ٹرینڈ کو ایسی چیز میں بدلیں جسے واقعی پڑھا جا سکے۔ یہ ہک، درمیانی حصہ اور اختتام لکھتا ہے — مختصر، کیونکہ یہ مختصر ویڈیو کے لیے ہے۔", id:"Ubah tren jadi sesuatu yang benar-benar bisa dibacakan. Ia menulis hook, bagian tengah, dan penutup — pendek, karena ini untuk video pendek.", de:"Macht aus einem Trend etwas, das du wirklich vorlesen kannst. Es schreibt Aufhänger, Mittelteil und Schluss — kurz, weil es für kurze Videos gedacht ist.", ja:"トレンドを実際に読み上げられるものに変えます。フック、中盤、締めを書きます。短い動画のためのものなので、短く。", tr:"Bir trendi gerçekten okuyabileceğin bir şeye çevirir. Kancayı, ortayı ve sonu yazar — kısa, çünkü bu kısa video için.", ko:"트렌드를 실제로 읽을 수 있는 것으로 바꿔 줍니다. 훅과 중간, 마무리를 씁니다 — 짧게, 짧은 영상을 위한 것이니까요.", fa:"یک ترند را به چیزی تبدیل می‌کند که واقعاً بتوانی بخوانی. قلاب، میانه و پایان را می‌نویسد — کوتاه، چون برای ویدیوی کوتاه است.", uk:"Перетворює тренд на те, що справді можна прочитати вголос. Пише гачок, середину й кінцівку — коротко, бо це для коротких відео.", it:"Trasforma una tendenza in qualcosa che puoi davvero leggere ad alta voce. Scrive il gancio, il centro e la chiusura: corto, perché è fatto per i video brevi.", pl:"Zamienia trend w coś, co naprawdę da się przeczytać na głos. Pisze haczyk, środek i zakończenie — krótko, bo to do krótkich filmów.", vi:"Biến một xu hướng thành thứ bạn thật sự đọc lên được. Nó viết móc mở đầu, phần giữa và kết — ngắn, vì đây là cho video ngắn." },
  st_topic: { en:"What is the video about", zh:"这个视频讲什么", hi:"वीडियो किस बारे में है", es:"¿De qué trata el vídeo?", ar:"عمّ يدور الفيديو", fr:"La vidéo parle de quoi", bn:"ভিডিওটি কী নিয়ে", pt:"O vídeo é sobre quê", ru:"О чём видео", ur:"ویڈیو کس بارے میں ہے", id:"Videonya tentang apa", de:"Worum geht es im Video", ja:"動画のテーマ", tr:"Video ne hakkında", ko:"영상은 무엇에 대한 것인가요", fa:"ویدیو دربارهٔ چیست", uk:"Про що відео", it:"Di cosa parla il video", pl:"O czym jest film", vi:"Video nói về gì" },
  st_topic_ph: { en:"the trend, or your own idea", zh:"那个趋势，或者你自己的想法", hi:"वह ट्रेंड, या आपका अपना आइडिया", es:"la tendencia, o tu propia idea", ar:"الاتجاه، أو فكرتك أنت", fr:"la tendance, ou ta propre idée", bn:"সেই ট্রেন্ড, বা আপনার নিজের আইডিয়া", pt:"a tendência, ou a tua própria ideia", ru:"тренд или своя идея", ur:"وہ ٹرینڈ، یا آپ کا اپنا آئیڈیا", id:"tren itu, atau idemu sendiri", de:"der Trend, oder deine eigene Idee", ja:"そのトレンド、または自分のアイデア", tr:"trend ya da kendi fikrin", ko:"그 트렌드 또는 나만의 아이디어", fa:"همان ترند، یا ایدهٔ خودت", uk:"тренд або власна ідея", it:"la tendenza, o una tua idea", pl:"ten trend albo własny pomysł", vi:"xu hướng đó, hoặc ý của bạn" },
  st_len: { en:"How long", zh:"多长", hi:"कितना लंबा", es:"Duración", ar:"المدة", fr:"Durée", bn:"কত লম্বা", pt:"Duração", ru:"Длительность", ur:"دورانیہ", id:"Durasi", de:"Länge", ja:"長さ", tr:"Süre", ko:"길이", fa:"چقدر طول", uk:"Тривалість", it:"Durata", pl:"Długość", vi:"Dài bao lâu" },
  st_len15: { en:"15 seconds", zh:"15 秒", hi:"15 सेकंड", es:"15 segundos", ar:"15 ثانية", fr:"15 secondes", bn:"১৫ সেকেন্ড", pt:"15 segundos", ru:"15 секунд", ur:"15 سیکنڈ", id:"15 detik", de:"15 Sekunden", ja:"15秒", tr:"15 saniye", ko:"15초", fa:"۱۵ ثانیه", uk:"15 секунд", it:"15 secondi", pl:"15 sekund", vi:"15 giây" },
  st_len30: { en:"30 seconds", zh:"30 秒", hi:"30 सेकंड", es:"30 segundos", ar:"30 ثانية", fr:"30 secondes", bn:"৩০ সেকেন্ড", pt:"30 segundos", ru:"30 секунд", ur:"30 سیکنڈ", id:"30 detik", de:"30 Sekunden", ja:"30秒", tr:"30 saniye", ko:"30초", fa:"۳۰ ثانیه", uk:"30 секунд", it:"30 secondi", pl:"30 sekund", vi:"30 giây" },
  st_len60: { en:"60 seconds", zh:"60 秒", hi:"60 सेकंड", es:"60 segundos", ar:"60 ثانية", fr:"60 secondes", bn:"৬০ সেকেন্ড", pt:"60 segundos", ru:"60 секунд", ur:"60 سیکنڈ", id:"60 detik", de:"60 Sekunden", ja:"60秒", tr:"60 saniye", ko:"60초", fa:"۶۰ ثانیه", uk:"60 секунд", it:"60 secondi", pl:"60 sekund", vi:"60 giây" },
  st_tone: { en:"How it sounds", zh:"什么口吻", hi:"अंदाज़ कैसा हो", es:"Cómo suena", ar:"بأي نبرة", fr:"Le ton", bn:"কেমন শোনাবে", pt:"Que tom", ru:"Каким тоном", ur:"لہجہ کیسا ہو", id:"Nadanya", de:"Der Ton", ja:"トーン", tr:"Tonu", ko:"어떤 말투", fa:"با چه لحنی", uk:"Яким тоном", it:"Che tono", pl:"Jaki ton", vi:"Giọng điệu" },
  st_tone_plain: { en:"Straight to the point", zh:"直截了当", hi:"सीधी बात", es:"Directo al grano", ar:"مباشر إلى الهدف", fr:"Droit au but", bn:"সরাসরি", pt:"Directo ao assunto", ru:"Прямо к делу", ur:"سیدھی بات", id:"Langsung ke inti", de:"Direkt auf den Punkt", ja:"単刀直入", tr:"Doğrudan konuya", ko:"핵심만", fa:"مستقیم سر اصل مطلب", uk:"Прямо до суті", it:"Dritto al punto", pl:"Prosto z mostu", vi:"Vào thẳng vấn đề" },
  st_tone_funny: { en:"Funny", zh:"搞笑", hi:"मज़ेदार", es:"Divertido", ar:"مضحك", fr:"Drôle", bn:"মজার", pt:"Divertido", ru:"Смешно", ur:"مزاحیہ", id:"Lucu", de:"Lustig", ja:"面白く", tr:"Komik", ko:"재미있게", fa:"بامزه", uk:"Смішно", it:"Divertente", pl:"Zabawnie", vi:"Hài hước" },
  st_tone_story: { en:"Storytime", zh:"讲故事", hi:"स्टोरीटाइम", es:"Storytime", ar:"حكاية", fr:"Storytime", bn:"গল্প বলা", pt:"Storytime", ru:"История", ur:"کہانی", id:"Bercerita", de:"Storytime", ja:"ストーリー", tr:"Hikâye", ko:"스토리텔링", fa:"داستان‌گویی", uk:"Історія", it:"Storytime", pl:"Opowieść", vi:"Kể chuyện" },
  st_tone_expl: { en:"Explainer", zh:"讲解", hi:"समझाने वाला", es:"Explicativo", ar:"تفسيري", fr:"Explicatif", bn:"ব্যাখ্যামূলক", pt:"Explicativo", ru:"Объяснение", ur:"وضاحتی", id:"Penjelasan", de:"Erklärend", ja:"解説", tr:"Açıklayıcı", ko:"설명형", fa:"توضیحی", uk:"Пояснення", it:"Esplicativo", pl:"Wyjaśniający", vi:"Giải thích" },
  st_write: { en:"Write it", zh:"写出来", hi:"लिख दो", es:"Escríbelo", ar:"اكتبه", fr:"Écris-le", bn:"লিখে দিন", pt:"Escreve-o", ru:"Напиши", ur:"لکھ دیں", id:"Tulis", de:"Schreib es", ja:"書いて", tr:"Yaz", ko:"써 주세요", fa:"بنویسش", uk:"Напиши", it:"Scrivilo", pl:"Napisz", vi:"Viết đi" },
  st_copy: { en:"Copy", zh:"复制", hi:"कॉपी", es:"Copiar", ar:"نسخ", fr:"Copier", bn:"কপি", pt:"Copiar", ru:"Копировать", ur:"کاپی", id:"Salin", de:"Kopieren", ja:"コピー", tr:"Kopyala", ko:"복사", fa:"کپی", uk:"Копіювати", it:"Copia", pl:"Kopiuj", vi:"Sao chép" },
  st_dl: { en:"Download .txt", zh:"下载 .txt", hi:".txt डाउनलोड", es:"Descargar .txt", ar:"تنزيل ‎.txt", fr:"Télécharger le .txt", bn:".txt ডাউনলোড", pt:"Transferir .txt", ru:"Скачать .txt", ur:".txt ڈاؤن لوڈ", id:"Unduh .txt", de:".txt herunterladen", ja:".txtをダウンロード", tr:".txt indir", ko:".txt 내려받기", fa:"دانلود ‎.txt", uk:"Завантажити .txt", it:"Scarica .txt", pl:"Pobierz .txt", vi:"Tải .txt" },
  st_toai: { en:"Send to the AI Editor", zh:"发送到 AI 编辑器", hi:"AI एडिटर को भेजें", es:"Enviar al Editor IA", ar:"أرسِله إلى محرر الذكاء الاصطناعي", fr:"Envoyer à l’Éditeur IA", bn:"AI এডিটরে পাঠান", pt:"Enviar para o Editor IA", ru:"Отправить в ИИ-редактор", ur:"AI ایڈیٹر کو بھیجیں", id:"Kirim ke Editor AI", de:"An den KI-Editor senden", ja:"AIエディタへ送る", tr:"AI Düzenleyici’ye gönder", ko:"AI 편집기로 보내기", fa:"ارسال به ویرایشگر هوش مصنوعی", uk:"Надіслати до ШІ-редактора", it:"Manda all’Editor IA", pl:"Wyślij do Edytora AI", vi:"Gửi tới Trình sửa AI" },
  st_s_len45: { en:"45 seconds", zh:"45 秒", hi:"45 सेकंड", es:"45 segundos", ar:"45 ثانية", fr:"45 secondes", bn:"৪৫ সেকেন্ড", pt:"45 segundos", ru:"45 секунд", ur:"45 سیکنڈ", id:"45 detik", de:"45 Sekunden", ja:"45秒", tr:"45 saniye", ko:"45초", fa:"۴۵ ثانیه", uk:"45 секунд", it:"45 secondi", pl:"45 sekund", vi:"45 giây" },
  st_s_len90: { en:"90 seconds", zh:"90 秒", hi:"90 सेकंड", es:"90 segundos", ar:"90 ثانية", fr:"90 secondes", bn:"৯০ সেকেন্ড", pt:"90 segundos", ru:"90 секунд", ur:"90 سیکنڈ", id:"90 detik", de:"90 Sekunden", ja:"90秒", tr:"90 saniye", ko:"90초", fa:"۹۰ ثانیه", uk:"90 секунд", it:"90 secondi", pl:"90 sekund", vi:"90 giây" },
  st_s_tone_hyped: { en:"High energy", zh:"高能量", hi:"हाई एनर्जी", es:"Muy enérgico", ar:"طاقة عالية", fr:"Plein d’énergie", bn:"হাই এনার্জি", pt:"Muita energia", ru:"На высоких оборотах", ur:"بھرپور توانائی", id:"Berenergi tinggi", de:"Viel Energie", ja:"ハイテンション", tr:"Yüksek enerji", ko:"에너지 넘치게", fa:"پرانرژی", uk:"На високих обертах", it:"Molta energia", pl:"Duża energia", vi:"Năng lượng cao" },
  st_s_tone_calm: { en:"Calm and close", zh:"平静贴近", hi:"शांत और करीबी", es:"Calmado y cercano", ar:"هادئ وقريب", fr:"Calme et proche", bn:"শান্ত আর কাছের", pt:"Calmo e próximo", ru:"Спокойно и близко", ur:"پُرسکون اور قریبی", id:"Tenang dan dekat", de:"Ruhig und nah", ja:"落ち着いて近い距離で", tr:"Sakin ve yakın", ko:"차분하고 가깝게", fa:"آرام و نزدیک", uk:"Спокійно й близько", it:"Calmo e vicino", pl:"Spokojnie i blisko", vi:"Điềm tĩnh và gần gũi" },
  st_s_hook: { en:"How it opens", zh:"怎么开头", hi:"शुरुआत कैसे हो", es:"Cómo empieza", ar:"كيف يبدأ", fr:"Comment ça commence", bn:"কীভাবে শুরু হবে", pt:"Como começa", ru:"Как начинается", ur:"شروعات کیسے ہو", id:"Bagaimana dibuka", de:"Wie es anfängt", ja:"どう始めるか", tr:"Nasıl açılsın", ko:"어떻게 시작할지", fa:"چطور شروع شود", uk:"Як починається", it:"Come si apre", pl:"Jak się zaczyna", vi:"Mở đầu thế nào" },
  st_s_hook_any: { en:"Whatever works best", zh:"怎样最有效就怎样", hi:"जो सबसे अच्छा चले", es:"Lo que funcione mejor", ar:"ما ينجح أكثر", fr:"Ce qui marche le mieux", bn:"যা সবচেয়ে ভালো কাজ করে", pt:"O que resultar melhor", ru:"Как лучше сработает", ur:"جو سب سے بہتر چلے", id:"Apa pun yang paling ampuh", de:"Was am besten wirkt", ja:"いちばん効くやり方で", tr:"En iyi ne tutuyorsa", ko:"가장 잘 먹히는 쪽으로", fa:"هرچه بهتر جواب می‌دهد", uk:"Як спрацює найкраще", it:"Quello che funziona meglio", pl:"Co zadziała najlepiej", vi:"Cách nào hiệu quả nhất" },
  st_s_hook_q: { en:"A question they want answered", zh:"一个他们想知道答案的问题", hi:"एक सवाल जिसका जवाब वे चाहते हैं", es:"Una pregunta que quieran resolver", ar:"سؤال يريدون جوابه", fr:"Une question dont ils veulent la réponse", bn:"এমন প্রশ্ন যার উত্তর তারা চায়", pt:"Uma pergunta que queiram ver respondida", ru:"Вопрос, на который хочется ответа", ur:"ایک سوال جس کا جواب وہ چاہتے ہوں", id:"Pertanyaan yang ingin mereka tahu jawabannya", de:"Eine Frage, deren Antwort sie wollen", ja:"答えを知りたくなる問いかけ", tr:"Cevabını merak edecekleri bir soru", ko:"답이 궁금해지는 질문", fa:"پرسشی که بخواهند جوابش را بدانند", uk:"Питання, на яке хочеться відповіді", it:"Una domanda di cui vogliono la risposta", pl:"Pytanie, na które chcą odpowiedzi", vi:"Một câu hỏi họ muốn biết đáp án" },
  st_s_hook_claim: { en:"A bold claim", zh:"一个大胆的断言", hi:"एक बड़ा दावा", es:"Una afirmación atrevida", ar:"ادّعاء جريء", fr:"Une affirmation gonflée", bn:"একটা সাহসী দাবি", pt:"Uma afirmação ousada", ru:"Смелое заявление", ur:"ایک جرات مندانہ دعویٰ", id:"Klaim berani", de:"Eine kühne Behauptung", ja:"大胆な断言", tr:"Cesur bir iddia", ko:"과감한 주장", fa:"یک ادعای جسورانه", uk:"Смілива заява", it:"Un’affermazione forte", pl:"Śmiała teza", vi:"Một khẳng định táo bạo" },
  st_s_hook_cold: { en:"Straight into the action", zh:"直接进入动作", hi:"सीधे एक्शन में", es:"Directo a la acción", ar:"مباشرة إلى الحدث", fr:"Direct dans l’action", bn:"সরাসরি অ্যাকশনে", pt:"Direto para a ação", ru:"Сразу в действие", ur:"سیدھا ایکشن میں", id:"Langsung ke aksinya", de:"Direkt in die Handlung", ja:"いきなり本編から", tr:"Doğrudan aksiyona", ko:"바로 본론부터", fa:"یکراست وسط ماجرا", uk:"Одразу в дію", it:"Dritto nell’azione", pl:"Prosto w akcję", vi:"Vào thẳng hành động" },
  st_s_hook_num: { en:"Lead with a number", zh:"用数字开头", hi:"किसी संख्या से शुरू करें", es:"Empezar con un número", ar:"ابدأ برقم", fr:"Commencer par un chiffre", bn:"একটা সংখ্যা দিয়ে শুরু", pt:"Começar com um número", ru:"Начать с числа", ur:"کسی عدد سے شروع کریں", id:"Buka dengan angka", de:"Mit einer Zahl anfangen", ja:"数字から入る", tr:"Bir sayıyla başla", ko:"숫자로 시작", fa:"با یک عدد شروع کن", uk:"Почати з числа", it:"Partire da un numero", pl:"Zacząć od liczby", vi:"Mở bằng một con số" },
  st_s_hook_warn: { en:"Warn them off a mistake", zh:"提醒他们别犯的错", hi:"एक गलती से आगाह करें", es:"Avisar de un error", ar:"حذّرهم من خطأ", fr:"Les prévenir d’une erreur", bn:"একটা ভুল থেকে সতর্ক করুন", pt:"Avisar de um erro", ru:"Предупредить об ошибке", ur:"ایک غلطی سے خبردار کریں", id:"Peringatkan soal satu kesalahan", de:"Vor einem Fehler warnen", ja:"よくある失敗を警告する", tr:"Bir hatadan sakındır", ko:"흔한 실수를 경고", fa:"از یک اشتباه برحذرشان کن", uk:"Попередити про помилку", it:"Metterli in guardia da un errore", pl:"Ostrzec przed błędem", vi:"Cảnh báo một sai lầm" },
  st_s_end: { en:"How it ends", zh:"怎么结尾", hi:"अंत कैसे हो", es:"Cómo termina", ar:"كيف ينتهي", fr:"Comment ça finit", bn:"কীভাবে শেষ হবে", pt:"Como acaba", ru:"Как заканчивается", ur:"اختتام کیسے ہو", id:"Bagaimana ditutup", de:"Wie es endet", ja:"どう終わるか", tr:"Nasıl bitsin", ko:"어떻게 끝낼지", fa:"چطور تمام شود", uk:"Як закінчується", it:"Come finisce", pl:"Jak się kończy", vi:"Kết thế nào" },
  st_s_end_stop: { en:"Just stop", zh:"就此打住", hi:"बस रुक जाएँ", es:"Simplemente parar", ar:"توقّف فحسب", fr:"S’arrêter, point", bn:"শুধু থেমে যাওয়া", pt:"Simplesmente parar", ru:"Просто остановиться", ur:"بس رک جائیں", id:"Berhenti begitu saja", de:"Einfach aufhören", ja:"そこで終わる", tr:"Öylece bitir", ko:"그냥 끝내기", fa:"همان‌جا تمام", uk:"Просто зупинитися", it:"Finire e basta", pl:"Po prostu skończyć", vi:"Dừng luôn" },
  st_s_end_follow: { en:"A reason to follow", zh:"一个关注的理由", hi:"फॉलो करने की एक वजह", es:"Un motivo para seguirte", ar:"سبب للمتابعة", fr:"Une raison de s’abonner", bn:"ফলো করার একটা কারণ", pt:"Um motivo para seguir", ru:"Повод подписаться", ur:"فالو کرنے کی ایک وجہ", id:"Alasan untuk mengikuti", de:"Ein Grund zu folgen", ja:"フォローする理由", tr:"Takip etmek için bir sebep", ko:"팔로우할 이유", fa:"دلیلی برای دنبال‌کردن", uk:"Привід підписатися", it:"Un motivo per seguirti", pl:"Powód, by zaobserwować", vi:"Một lý do để theo dõi" },
  st_s_end_comment: { en:"A question worth answering", zh:"一个值得回答的问题", hi:"जवाब देने लायक सवाल", es:"Una pregunta que dé ganas de responder", ar:"سؤال يستحق الإجابة", fr:"Une question qui donne envie de répondre", bn:"উত্তর দেওয়ার মতো একটা প্রশ্ন", pt:"Uma pergunta que dê vontade de responder", ru:"Вопрос, на который хочется ответить", ur:"جواب دینے کے قابل ایک سوال", id:"Pertanyaan yang layak dijawab", de:"Eine Frage, die man beantworten will", ja:"答えたくなる問い", tr:"Cevaplamaya değer bir soru", ko:"답하고 싶어지는 질문", fa:"پرسشی که ارزش جواب‌دادن دارد", uk:"Питання, на яке хочеться відповісти", it:"Una domanda a cui vale la pena rispondere", pl:"Pytanie warte odpowiedzi", vi:"Một câu hỏi đáng trả lời" },
  st_s_end_part2: { en:"Open a part two", zh:"留个第二集的引子", hi:"पार्ट टू का रास्ता खोलें", es:"Abrir una segunda parte", ar:"افتح الباب لجزء ثانٍ", fr:"Ouvrir sur une partie deux", bn:"দ্বিতীয় পর্বের দরজা খুলুন", pt:"Abrir uma parte dois", ru:"Открыть вторую часть", ur:"دوسرے حصے کا دروازہ کھولیں", id:"Buka jalan untuk bagian dua", de:"Einen zweiten Teil aufmachen", ja:"パート2への引きをつくる", tr:"İkinci bölümün kapısını arala", ko:"2편의 여지를 남기기", fa:"در را برای قسمت دوم باز کن", uk:"Відкрити другу частину", it:"Aprire una parte due", pl:"Otworzyć część drugą", vi:"Mở đường cho phần hai" },
  st_s_edit: { en:"Edit it here — Copy, Download and the AI Editor all read this box.", zh:"在这里修改——复制、下载和 AI 编辑器读的都是这个框。", hi:"यहीं एडिट करें — कॉपी, डाउनलोड और AI एडिटर सब इसी बॉक्स को पढ़ते हैं।", es:"Edítalo aquí: Copiar, Descargar y el Editor IA leen esta caja.", ar:"عدّله هنا — النسخ والتنزيل ومحرّر الذكاء الاصطناعي كلها تقرأ هذا المربع.", fr:"Modifie-le ici : Copier, Télécharger et l’Éditeur IA lisent tous cette zone.", bn:"এখানেই সম্পাদনা করুন — কপি, ডাউনলোড আর AI এডিটর সবাই এই বাক্সটাই পড়ে।", pt:"Edita aqui — Copiar, Descarregar e o Editor IA leem todos esta caixa.", ru:"Правь здесь — «Копировать», «Скачать» и ИИ-редактор читают именно это поле.", ur:"یہیں ترمیم کریں — کاپی، ڈاؤن لوڈ اور AI ایڈیٹر سب اسی باکس کو پڑھتے ہیں۔", id:"Sunting di sini — Salin, Unduh, dan Editor AI semuanya membaca kotak ini.", de:"Hier bearbeiten — Kopieren, Herunterladen und der KI-Editor lesen alle dieses Feld.", ja:"ここで直せます。コピーもダウンロードもAIエディタも、この欄を読みます。", tr:"Burada düzenle — Kopyala, İndir ve YZ Editörü hep bu kutuyu okur.", ko:"여기서 고치세요 — 복사, 내려받기, AI 편집기가 모두 이 칸을 읽습니다.", fa:"همین‌جا ویرایشش کن — کپی، دانلود و ویرایشگر هوش مصنوعی همه همین کادر را می‌خوانند.", uk:"Редагуй тут — «Копіювати», «Завантажити» і ШІ-редактор читають саме це поле.", it:"Modificalo qui: Copia, Scarica e l’Editor IA leggono tutti questa casella.", pl:"Edytuj tutaj — Kopiuj, Pobierz i Edytor AI czytają to pole.", vi:"Sửa ngay đây — Sao chép, Tải về và Trình sửa AI đều đọc ô này." },
  st_s_need: { en:"Say what the video is about first.", zh:"先说说这个视频讲什么。", hi:"पहले बताइए वीडियो किस बारे में है।", es:"Di primero de qué va el vídeo.", ar:"قل أولًا عمّا يدور الفيديو.", fr:"Dis d’abord de quoi parle la vidéo.", bn:"আগে বলুন ভিডিওটা কী নিয়ে।", pt:"Diz primeiro do que trata o vídeo.", ru:"Сначала скажи, о чём видео.", ur:"پہلے بتائیں ویڈیو کس بارے میں ہے۔", id:"Sebutkan dulu videonya tentang apa.", de:"Sag zuerst, worum das Video geht.", ja:"まず動画の内容を書いてください。", tr:"Önce videonun neyle ilgili olduğunu yaz.", ko:"먼저 영상이 무엇에 관한 것인지 적어 주세요.", fa:"اول بگو ویدیو دربارهٔ چیست.", uk:"Спершу скажи, про що відео.", it:"Di’ prima di cosa parla il video.", pl:"Najpierw napisz, o czym jest film.", vi:"Hãy nói trước video về cái gì." },
  st_s_writing: { en:"Writing it beat by beat…", zh:"正在一拍一拍地写……", hi:"बीट दर बीट लिखा जा रहा है…", es:"Escribiéndolo golpe a golpe…", ar:"نكتبه مشهدًا مشهدًا…", fr:"On l’écrit temps par temps…", bn:"একটা একটা বিট করে লেখা হচ্ছে…", pt:"A escrevê-lo batida a batida…", ru:"Пишу по тактам…", ur:"ایک ایک بیٹ لکھی جا رہی ہے…", id:"Menulisnya per bagian…", de:"Schreibe es Takt für Takt…", ja:"ビートごとに書いています…", tr:"Bölüm bölüm yazılıyor…", ko:"비트 단위로 쓰는 중…", fa:"دارم ضرب‌به‌ضرب می‌نویسمش…", uk:"Пишу по тактах…", it:"Lo sto scrivendo battuta per battuta…", pl:"Piszę je takt po takcie…", vi:"Đang viết theo từng nhịp…" },
  st_s_none: { en:"Nothing came back. Try saying it in fewer words.", zh:"什么都没返回。用更少的字再说一次试试。", hi:"कुछ नहीं आया। कम शब्दों में कहकर देखें।", es:"No ha vuelto nada. Prueba a decirlo con menos palabras.", ar:"لم يعد شيء. جرّب قوله بكلمات أقل.", fr:"Rien n’est revenu. Essaie avec moins de mots.", bn:"কিছুই আসেনি। কম কথায় বলে দেখুন।", pt:"Não voltou nada. Tenta dizê-lo com menos palavras.", ru:"Ничего не вернулось. Попробуй короче.", ur:"کچھ نہیں آیا۔ کم الفاظ میں کہہ کر دیکھیں۔", id:"Tidak ada yang kembali. Coba tulis lebih singkat.", de:"Es kam nichts zurück. Sag es mal kürzer.", ja:"何も返りませんでした。もっと短く言ってみてください。", tr:"Bir şey dönmedi. Daha az kelimeyle anlatmayı dene.", ko:"아무것도 오지 않았습니다. 더 짧게 적어 보세요.", fa:"چیزی برنگشت. با کلمات کمتری بگو.", uk:"Нічого не повернулося. Спробуй коротше.", it:"Non è tornato nulla. Prova a dirlo con meno parole.", pl:"Nic nie wróciło. Spróbuj krócej.", vi:"Không có gì trả về. Thử nói ngắn hơn xem." },
  st_s_beats: { en:"The beat sheet", zh:"分镜节拍表", hi:"बीट शीट", es:"La hoja de ritmos", ar:"ورقة المشاهد", fr:"Le découpage", bn:"বিট শিট", pt:"A folha de batidas", ru:"Тайминг по тактам", ur:"بیٹ شیٹ", id:"Lembar beat", de:"Das Beat Sheet", ja:"ビートシート", tr:"Akış planı", ko:"비트 시트", fa:"برگهٔ ضرب‌آهنگ", uk:"Розкладка по тактах", it:"Lo schema a battute", pl:"Rozpiska scen", vi:"Bảng nhịp" },
  st_s_onscreen: { en:"On screen", zh:"画面上", hi:"स्क्रीन पर", es:"En pantalla", ar:"على الشاشة", fr:"À l’écran", bn:"স্ক্রিনে", pt:"No ecrã", ru:"На экране", ur:"اسکرین پر", id:"Di layar", de:"Im Bild", ja:"画面には", tr:"Ekranda", ko:"화면에는", fa:"روی صفحه", uk:"На екрані", it:"In video", pl:"Na ekranie", vi:"Trên màn hình" },
  st_s_fits: { en:"— that fits the {n} seconds you asked for.", zh:"——正好符合你要的 {n} 秒。", hi:"— यह आपके माँगे {n} सेकंड में बैठता है।", es:"— eso cabe en los {n} segundos que pediste.", ar:"— وهذا يناسب الـ{n} ثانية التي طلبتها.", fr:"— ça tient dans les {n} secondes demandées.", bn:"— এটা আপনার চাওয়া {n} সেকেন্ডে আঁটে।", pt:"— isso cabe nos {n} segundos que pediste.", ru:"— это укладывается в запрошенные {n} секунд.", ur:"— یہ آپ کے مانگے {n} سیکنڈ میں آ جاتا ہے۔", id:"— itu pas dengan {n} detik yang kamu minta.", de:"— das passt in die gewünschten {n} Sekunden.", ja:"— ご指定の{n}秒に収まっています。", tr:"— istediğin {n} saniyeye sığıyor.", ko:"— 요청한 {n}초에 들어맞습니다.", fa:"— این در {n} ثانیه‌ای که خواستی جا می‌شود.", uk:"— це вкладається в замовлені {n} секунд.", it:"— sta nei {n} secondi che hai chiesto.", pl:"— mieści się w {n} sekundach, o które prosiłeś.", vi:"— vừa với {n} giây bạn yêu cầu." },
  st_s_long: { en:"— {d} seconds over the {n} you asked for. Cut a beat, or keep it and film longer.", zh:"——比你要的 {n} 秒多了 {d} 秒。删掉一拍，或者就拍长一点。", hi:"— आपके माँगे {n} सेकंड से {d} सेकंड ज़्यादा। एक बीट हटाइए, या इसे रखकर लंबा शूट कीजिए।", es:"— {d} segundos más que los {n} que pediste. Corta una parte, o quédatelo y graba más largo.", ar:"— أطول بـ{d} ثانية من الـ{n} التي طلبتها. احذف مشهدًا، أو أبقِه وصوّر أطول.", fr:"— {d} secondes de plus que les {n} demandées. Coupe un temps, ou garde-le et filme plus long.", bn:"— আপনার চাওয়া {n} সেকেন্ডের চেয়ে {d} সেকেন্ড বেশি। একটা বিট কাটুন, নয়তো রেখে দিয়ে লম্বা শুট করুন।", pt:"— {d} segundos acima dos {n} que pediste. Corta uma batida, ou fica com ela e filma mais longo.", ru:"— на {d} секунд больше запрошенных {n}. Убери такт или сними подлиннее.", ur:"— آپ کے مانگے {n} سیکنڈ سے {d} سیکنڈ زیادہ۔ ایک بیٹ کاٹیں، یا اسے رکھ کر لمبا شوٹ کریں۔", id:"— {d} detik lebih dari {n} yang kamu minta. Potong satu bagian, atau biarkan dan rekam lebih panjang.", de:"— {d} Sekunden über den gewünschten {n}. Streich einen Takt, oder behalt ihn und dreh länger.", ja:"— ご指定の{n}秒より{d}秒長いです。ビートをひとつ削るか、このまま長めに撮ってください。", tr:"— istediğin {n} saniyeyi {d} saniye aşıyor. Bir bölümü kes ya da olduğu gibi bırakıp uzun çek.", ko:"— 요청한 {n}초보다 {d}초 깁니다. 비트를 하나 빼거나, 그대로 두고 길게 찍으세요.", fa:"— {d} ثانیه بیشتر از {n} ثانیه‌ای که خواستی. یک ضرب را حذف کن، یا نگهش دار و بلندتر فیلم بگیر.", uk:"— на {d} секунд більше за замовлені {n}. Прибери такт або зніми довше.", it:"— {d} secondi oltre i {n} che hai chiesto. Taglia una battuta, o tienila e gira più lungo.", pl:"— o {d} sekund więcej niż {n}, o które prosiłeś. Wytnij takt albo zostaw i nakręć dłużej.", vi:"— dài hơn {n} giây bạn yêu cầu {d} giây. Cắt bớt một nhịp, hoặc giữ nguyên và quay dài hơn." },
  st_s_short: { en:"— {d} seconds under the {n} you asked for. Room for one more beat if you want it.", zh:"——比你要的 {n} 秒少了 {d} 秒。如果想，还能再加一拍。", hi:"— आपके माँगे {n} सेकंड से {d} सेकंड कम। चाहें तो एक और बीट की जगह है।", es:"— {d} segundos menos que los {n} que pediste. Hay sitio para otra parte si la quieres.", ar:"— أقصر بـ{d} ثانية من الـ{n} التي طلبتها. ثمة متسع لمشهد آخر إن أردت.", fr:"— {d} secondes de moins que les {n} demandées. Il reste de la place pour un temps de plus.", bn:"— আপনার চাওয়া {n} সেকেন্ডের চেয়ে {d} সেকেন্ড কম। চাইলে আরেকটা বিটের জায়গা আছে।", pt:"— {d} segundos abaixo dos {n} que pediste. Há espaço para mais uma batida, se quiseres.", ru:"— на {d} секунд меньше запрошенных {n}. Есть место ещё для одного такта.", ur:"— آپ کے مانگے {n} سیکنڈ سے {d} سیکنڈ کم۔ چاہیں تو ایک اور بیٹ کی گنجائش ہے۔", id:"— {d} detik kurang dari {n} yang kamu minta. Masih ada ruang untuk satu bagian lagi.", de:"— {d} Sekunden unter den gewünschten {n}. Platz für einen weiteren Takt, wenn du willst.", ja:"— ご指定の{n}秒より{d}秒短いです。よければビートをもうひとつ足せます。", tr:"— istediğin {n} saniyenin {d} saniye altında. İstersen bir bölüm daha sığar.", ko:"— 요청한 {n}초보다 {d}초 짧습니다. 원하면 비트를 하나 더 넣을 여유가 있습니다.", fa:"— {d} ثانیه کمتر از {n} ثانیه‌ای که خواستی. اگر بخواهی جا برای یک ضرب دیگر هست.", uk:"— на {d} секунд менше за замовлені {n}. Є місце ще на один такт.", it:"— {d} secondi sotto i {n} che hai chiesto. C’è spazio per un’altra battuta, se vuoi.", pl:"— o {d} sekund mniej niż {n}, o które prosiłeś. Jest miejsce na jeszcze jeden takt.", vi:"— ngắn hơn {n} giây bạn yêu cầu {d} giây. Còn chỗ cho một nhịp nữa nếu bạn muốn." },
  st_s_ok: { en:"First draft. Change anything — it is yours.", zh:"初稿。想改什么都行——这是你的。", hi:"पहला ड्राफ्ट। जो चाहें बदलिए — यह आपका है।", es:"Primer borrador. Cambia lo que quieras: es tuyo.", ar:"مسوّدة أولى. غيّر ما تشاء — إنها لك.", fr:"Premier jet. Change ce que tu veux, c’est le tien.", bn:"প্রথম খসড়া। যা ইচ্ছা বদলান — এটা আপনার।", pt:"Primeiro rascunho. Muda o que quiseres — é teu.", ru:"Первый черновик. Меняй что угодно — он твой.", ur:"پہلا مسودہ۔ جو چاہیں بدلیں — یہ آپ کا ہے۔", id:"Draf pertama. Ubah apa saja — ini milikmu.", de:"Erster Entwurf. Änder alles, was du willst — er gehört dir.", ja:"第一稿です。好きに変えてください。あなたのものです。", tr:"İlk taslak. Neyi istersen değiştir — senin.", ko:"초고입니다. 무엇이든 바꾸세요 — 당신 것입니다.", fa:"پیش‌نویس اول. هرچه خواستی عوض کن — مال خودت است.", uk:"Перший чернетковий варіант. Змінюй що завгодно — він твій.", it:"Prima bozza. Cambia quello che vuoi: è tua.", pl:"Pierwszy szkic. Zmień, co chcesz — jest twój.", vi:"Bản nháp đầu. Sửa gì cũng được — nó là của bạn." },
  st_script: { en:"The script", zh:"脚本", hi:"स्क्रिप्ट", es:"El guion", ar:"النص", fr:"Le script", bn:"স্ক্রিপ্ট", pt:"O guião", ru:"Сценарий", ur:"اسکرپٹ", id:"Naskahnya", de:"Das Skript", ja:"台本", tr:"Senaryo", ko:"대본", fa:"فیلمنامه", uk:"Сценарій", it:"Lo script", pl:"Scenariusz", vi:"Kịch bản" },
  st_script_ph: { en:"It appears here. Edit it — it is a first draft, not a script.", zh:"结果会出现在这里。改它——这是初稿，不是成品。", hi:"यह यहाँ दिखेगा। इसे बदलें — यह पहला ड्राफ्ट है, फ़ाइनल नहीं।", es:"Aparece aquí. Edítalo: es un primer borrador, no un guion.", ar:"يظهر هنا. عدّله — إنه مسوّدة أولى لا نصًّا نهائيًا.", fr:"Ça apparaît ici. Modifie-le : c’est un premier jet, pas un script.", bn:"এটি এখানে আসবে। বদলান — এটি প্রথম খসড়া, চূড়ান্ত নয়।", pt:"Aparece aqui. Edita-o — é um primeiro rascunho, não um guião.", ru:"Появится здесь. Правь — это черновик, а не готовый сценарий.", ur:"یہ یہاں آئے گا۔ اسے بدلیں — یہ پہلا مسودہ ہے، حتمی نہیں۔", id:"Muncul di sini. Sunting saja — ini draf pertama, bukan naskah jadi.", de:"Erscheint hier. Bearbeite es — es ist ein erster Entwurf, kein fertiges Skript.", ja:"ここに出ます。直してください。これは初稿であって完成台本ではありません。", tr:"Burada görünür. Düzenle — bu ilk taslak, senaryo değil.", ko:"여기에 나옵니다. 고쳐 쓰세요 — 초고이지 완성된 대본이 아닙니다.", fa:"اینجا ظاهر می‌شود. ویرایشش کن — این پیش‌نویس است، نه فیلمنامهٔ نهایی.", uk:"З’явиться тут. Редагуй — це чернетка, а не готовий сценарій.", it:"Compare qui. Modificalo: è una prima bozza, non uno script.", pl:"Pojawi się tutaj. Popraw go — to pierwszy szkic, nie gotowy scenariusz.", vi:"Sẽ hiện ở đây. Hãy sửa — đây là bản nháp đầu, chưa phải kịch bản." },
  st_thumb_h: { en:"Thumbnails", zh:"缩略图", hi:"थंबनेल", es:"Miniaturas", ar:"الصور المصغّرة", fr:"Miniatures", bn:"থাম্বনেইল", pt:"Miniaturas", ru:"Обложки", ur:"تھمب نیلز", id:"Thumbnail", de:"Thumbnails", ja:"サムネイル", tr:"Küçük resimler", ko:"썸네일", fa:"تصاویر بندانگشتی", uk:"Обкладинки", it:"Miniature", pl:"Miniatury", vi:"Ảnh thu nhỏ" },
  st_thumb_p: { en:"1280×720, the size YouTube asks for. Drawn on this device — nothing is uploaded and nothing is generated by a model, so it works offline.", zh:"1280×720，YouTube 要求的尺寸。在本机绘制——什么都不上传，也不用模型生成，所以离线可用。", hi:"1280×720, वही साइज़ जो YouTube माँगता है। इसी डिवाइस पर बनता है — कुछ भी अपलोड नहीं होता और कोई मॉडल इसे नहीं बनाता, इसलिए ऑफ़लाइन भी चलता है।", es:"1280×720, el tamaño que pide YouTube. Se dibuja en este dispositivo: no se sube nada ni lo genera un modelo, así que funciona sin conexión.", ar:"‎1280×720، المقاس الذي يطلبه يوتيوب. يُرسم على هذا الجهاز — لا يُرفع شيء ولا يولّده نموذج، فيعمل دون إنترنت.", fr:"1280×720, la taille demandée par YouTube. Dessiné sur cet appareil : rien n’est envoyé et rien n’est généré par un modèle, donc ça marche hors ligne.", bn:"১২৮০×৭২০, YouTube যে মাপ চায়। এই ডিভাইসেই আঁকা হয় — কিছুই আপলোড হয় না, কোনো মডেলও বানায় না, তাই অফলাইনে চলে।", pt:"1280×720, o tamanho que o YouTube pede. Desenhado neste dispositivo — nada é enviado e nada é gerado por um modelo, por isso funciona sem ligação.", ru:"1280×720 — размер, который просит YouTube. Рисуется на этом устройстве: ничего не загружается и ничего не генерирует модель, поэтому работает без сети.", ur:"‎1280×720، وہی سائز جو یوٹیوب مانگتا ہے۔ اسی ڈیوائس پر بنتا ہے — کچھ اپ لوڈ نہیں ہوتا اور نہ کوئی ماڈل بناتا ہے، اس لیے آف لائن بھی چلتا ہے۔", id:"1280×720, ukuran yang diminta YouTube. Digambar di perangkat ini — tidak ada yang diunggah dan tidak ada model yang membuatnya, jadi bisa offline.", de:"1280×720, die Größe, die YouTube verlangt. Auf diesem Gerät gezeichnet — nichts wird hochgeladen und nichts von einem Modell erzeugt, also geht es auch offline.", ja:"1280×720、YouTubeが求めるサイズです。この端末で描画します。何もアップロードせず、モデルも使わないのでオフラインで動きます。", tr:"1280×720, YouTube’un istediği boyut. Bu cihazda çizilir — hiçbir şey yüklenmez ve bir model üretmez, yani çevrimdışı çalışır.", ko:"1280×720, 유튜브가 요구하는 크기입니다. 이 기기에서 그립니다 — 업로드도 없고 모델이 만들지도 않아 오프라인에서도 됩니다.", fa:"‎۱۲۸۰×۷۲۰، همان اندازه‌ای که یوتیوب می‌خواهد. روی همین دستگاه کشیده می‌شود — چیزی آپلود نمی‌شود و مدلی آن را نمی‌سازد، پس آفلاین کار می‌کند.", uk:"1280×720 — розмір, який просить YouTube. Малюється на цьому пристрої: нічого не завантажується й нічого не генерує модель, тож працює без мережі.", it:"1280×720, la misura che chiede YouTube. Disegnata su questo dispositivo: non si carica nulla e non la genera un modello, quindi funziona offline.", pl:"1280×720, rozmiar, którego wymaga YouTube. Rysowane na tym urządzeniu — nic nie jest wysyłane ani generowane przez model, więc działa offline.", vi:"1280×720, kích thước YouTube yêu cầu. Vẽ ngay trên thiết bị này — không tải gì lên và không do mô hình tạo ra, nên chạy được khi ngoại tuyến." },
  st_big: { en:"Big words", zh:"大字", hi:"बड़े शब्द", es:"Texto grande", ar:"الكلمات الكبيرة", fr:"Gros mots", bn:"বড় লেখা", pt:"Texto grande", ru:"Крупный текст", ur:"بڑے الفاظ", id:"Teks besar", de:"Große Worte", ja:"大きい文字", tr:"Büyük yazı", ko:"큰 글씨", fa:"متن درشت", uk:"Великий текст", it:"Testo grande", pl:"Duży napis", vi:"Chữ lớn" },
  st_big_ph: { en:"six words or fewer", zh:"六个词以内", hi:"छह शब्द या कम", es:"seis palabras o menos", ar:"ست كلمات أو أقل", fr:"six mots maximum", bn:"ছয় শব্দ বা কম", pt:"seis palavras ou menos", ru:"не больше шести слов", ur:"چھ الفاظ یا کم", id:"enam kata atau kurang", de:"höchstens sechs Wörter", ja:"6語以内", tr:"altı kelime veya az", ko:"여섯 단어 이내", fa:"شش کلمه یا کمتر", uk:"не більше шести слів", it:"sei parole o meno", pl:"sześć słów lub mniej", vi:"sáu từ trở xuống" },
  st_small: { en:"Small words (optional)", zh:"小字（可选）", hi:"छोटे शब्द (वैकल्पिक)", es:"Texto pequeño (opcional)", ar:"كلمات صغيرة (اختياري)", fr:"Petit texte (facultatif)", bn:"ছোট লেখা (ঐচ্ছিক)", pt:"Texto pequeno (opcional)", ru:"Мелкий текст (не обязательно)", ur:"چھوٹے الفاظ (اختیاری)", id:"Teks kecil (opsional)", de:"Kleine Worte (optional)", ja:"小さい文字（任意）", tr:"Küçük yazı (isteğe bağlı)", ko:"작은 글씨 (선택)", fa:"متن ریز (اختیاری)", uk:"Дрібний текст (необов’язково)", it:"Testo piccolo (facoltativo)", pl:"Mały napis (opcjonalnie)", vi:"Chữ nhỏ (tuỳ chọn)" },
  st_small_ph: { en:"the bit underneath", zh:"下面那一行", hi:"नीचे वाला हिस्सा", es:"la línea de abajo", ar:"السطر الذي تحته", fr:"la ligne du dessous", bn:"নিচের অংশটা", pt:"a linha de baixo", ru:"строчка снизу", ur:"نیچے والی سطر", id:"baris di bawahnya", de:"die Zeile darunter", ja:"その下の一行", tr:"alttaki satır", ko:"아래쪽 한 줄", fa:"خط زیرین", uk:"рядок знизу", it:"la riga sotto", pl:"linijka pod spodem", vi:"dòng bên dưới" },
  st_look: { en:"Look", zh:"配色", hi:"लुक", es:"Estilo", ar:"المظهر", fr:"Style", bn:"লুক", pt:"Estilo", ru:"Вид", ur:"لُک", id:"Gaya", de:"Look", ja:"見た目", tr:"Görünüm", ko:"스타일", fa:"ظاهر", uk:"Вигляд", it:"Stile", pl:"Wygląd", vi:"Kiểu" },
  st_look0: { en:"Cyan on black", zh:"黑底青字", hi:"काले पर सियान", es:"Cian sobre negro", ar:"سماوي على أسود", fr:"Cyan sur noir", bn:"কালোর উপর সায়ান", pt:"Ciano sobre preto", ru:"Бирюзовый на чёрном", ur:"سیاہ پر سیان", id:"Sian di atas hitam", de:"Cyan auf Schwarz", ja:"黒地にシアン", tr:"Siyah üzerine camgöbeği", ko:"검정 위 시안", fa:"فیروزه‌ای روی سیاه", uk:"Бірюзовий на чорному", it:"Ciano su nero", pl:"Cyjan na czarnym", vi:"Xanh lơ trên nền đen" },
  st_look1: { en:"Hot pink", zh:"亮粉", hi:"हॉट पिंक", es:"Rosa intenso", ar:"وردي صارخ", fr:"Rose vif", bn:"গাঢ় গোলাপি", pt:"Rosa vivo", ru:"Ярко-розовый", ur:"شوخ گلابی", id:"Merah muda menyala", de:"Knallpink", ja:"ホットピンク", tr:"Parlak pembe", ko:"핫 핑크", fa:"صورتی تند", uk:"Яскраво-рожевий", it:"Rosa acceso", pl:"Jaskrawy róż", vi:"Hồng rực" },
  st_look2: { en:"Lime on charcoal", zh:"炭灰配青柠", hi:"चारकोल पर लाइम", es:"Lima sobre carbón", ar:"ليموني على فحمي", fr:"Vert citron sur anthracite", bn:"চারকোলের উপর লাইম", pt:"Lima sobre carvão", ru:"Лаймовый на угольном", ur:"چارکول پر لائم", id:"Hijau limau di atas arang", de:"Limette auf Anthrazit", ja:"チャコールにライム", tr:"Antrasit üzerine misket limonu", ko:"차콜 위 라임", fa:"لیمویی روی زغالی", uk:"Лаймовий на вугільному", it:"Lime su antracite", pl:"Limonka na grafitowym", vi:"Xanh chanh trên nền than" },
  st_look3: { en:"Violet gradient", zh:"紫色渐变", hi:"वायलेट ग्रेडिएंट", es:"Degradado violeta", ar:"تدرّج بنفسجي", fr:"Dégradé violet", bn:"ভায়োলেট গ্রেডিয়েন্ট", pt:"Gradiente violeta", ru:"Фиолетовый градиент", ur:"وائلٹ گریڈیئنٹ", id:"Gradien ungu", de:"Violetter Verlauf", ja:"バイオレットのグラデーション", tr:"Mor geçiş", ko:"바이올렛 그러데이션", fa:"گرادیان بنفش", uk:"Фіолетовий градієнт", it:"Sfumatura viola", pl:"Fioletowy gradient", vi:"Chuyển sắc tím" },
  st_pic: { en:"Your own picture (optional)", zh:"你自己的图片（可选）", hi:"आपकी अपनी तस्वीर (वैकल्पिक)", es:"Tu propia imagen (opcional)", ar:"صورتك الخاصة (اختياري)", fr:"Ta propre image (facultatif)", bn:"আপনার নিজের ছবি (ঐচ্ছিক)", pt:"A tua própria imagem (opcional)", ru:"Своя картинка (не обязательно)", ur:"آپ کی اپنی تصویر (اختیاری)", id:"Gambarmu sendiri (opsional)", de:"Dein eigenes Bild (optional)", ja:"自分の画像（任意）", tr:"Kendi resmin (isteğe bağlı)", ko:"직접 고른 사진 (선택)", fa:"تصویر خودت (اختیاری)", uk:"Власне зображення (необов’язково)", it:"Una tua immagine (facoltativo)", pl:"Własne zdjęcie (opcjonalnie)", vi:"Ảnh của bạn (tuỳ chọn)" },
  st_savepng: { en:"Save the PNG", zh:"保存 PNG", hi:"PNG सेव करें", es:"Guardar el PNG", ar:"احفظ ملف PNG", fr:"Enregistrer le PNG", bn:"PNG সেভ করুন", pt:"Guardar o PNG", ru:"Сохранить PNG", ur:"PNG محفوظ کریں", id:"Simpan PNG", de:"PNG speichern", ja:"PNGを保存", tr:"PNG’yi kaydet", ko:"PNG 저장", fa:"ذخیرهٔ PNG", uk:"Зберегти PNG", it:"Salva il PNG", pl:"Zapisz PNG", vi:"Lưu PNG" },
  st_preview: { en:"Preview", zh:"预览", hi:"प्रीव्यू", es:"Vista previa", ar:"معاينة", fr:"Aperçu", bn:"প্রিভিউ", pt:"Pré-visualização", ru:"Предпросмотр", ur:"پیش منظر", id:"Pratinjau", de:"Vorschau", ja:"プレビュー", tr:"Önizleme", ko:"미리보기", fa:"پیش‌نمایش", uk:"Перегляд", it:"Anteprima", pl:"Podgląd", vi:"Xem trước" },
  st_studio_h: { en:"Studio", zh:"工作室", hi:"स्टूडियो", es:"Estudio", ar:"الاستوديو", fr:"Studio", bn:"স্টুডিও", pt:"Estúdio", ru:"Студия", ur:"اسٹوڈیو", id:"Studio", de:"Studio", ja:"スタジオ", tr:"Stüdyo", ko:"스튜디오", fa:"استودیو", uk:"Студія", it:"Studio", pl:"Studio", vi:"Studio" },
  st_studio_p: { en:"What this device already knows about your channel. The charts — watch time, retention, where viewers come from — need a YouTube sign-in and live on the full Studio page.", zh:"这台设备已经知道的关于你频道的信息。图表——观看时长、留存、观众来源——需要登录 YouTube，放在完整的工作室页面里。", hi:"आपके चैनल के बारे में जो यह डिवाइस पहले से जानता है। चार्ट — वॉच टाइम, रिटेंशन, दर्शक कहाँ से आते हैं — के लिए YouTube साइन-इन चाहिए और वे पूरे स्टूडियो पेज पर हैं।", es:"Lo que este dispositivo ya sabe de tu canal. Las gráficas —tiempo de visualización, retención, de dónde vienen— necesitan iniciar sesión en YouTube y están en la página completa de Estudio.", ar:"ما يعرفه هذا الجهاز أصلًا عن قناتك. أما الرسوم البيانية — وقت المشاهدة والاستبقاء ومن أين يأتي المشاهدون — فتحتاج تسجيل دخول يوتيوب وتوجد في صفحة الاستوديو الكاملة.", fr:"Ce que cet appareil sait déjà de ta chaîne. Les graphiques — durée de visionnage, rétention, provenance des spectateurs — demandent une connexion YouTube et vivent sur la page Studio complète.", bn:"আপনার চ্যানেল সম্পর্কে এই ডিভাইস যা আগে থেকেই জানে। চার্ট — ওয়াচ টাইম, রিটেনশন, দর্শক কোথা থেকে আসে — এর জন্য YouTube সাইন-ইন লাগে, আর সেগুলো পুরো স্টুডিও পেজে আছে।", pt:"O que este dispositivo já sabe sobre o teu canal. Os gráficos — tempo de visualização, retenção, de onde vêm os espectadores — precisam de sessão iniciada no YouTube e estão na página completa do Estúdio.", ru:"Что это устройство уже знает о твоём канале. Графики — время просмотра, удержание, откуда приходят зрители — требуют входа в YouTube и живут на полной странице Студии.", ur:"آپ کے چینل کے بارے میں یہ ڈیوائس جو پہلے سے جانتی ہے۔ چارٹس — واچ ٹائم، ریٹینشن، ناظرین کہاں سے آتے ہیں — کے لیے یوٹیوب سائن اِن چاہیے اور وہ مکمل اسٹوڈیو صفحے پر ہیں۔", id:"Apa yang sudah diketahui perangkat ini tentang kanalmu. Grafiknya — waktu tonton, retensi, asal penonton — perlu masuk YouTube dan ada di halaman Studio lengkap.", de:"Was dieses Gerät schon über deinen Kanal weiß. Die Diagramme — Wiedergabezeit, Bindung, Herkunft der Zuschauer — brauchen eine YouTube-Anmeldung und stehen auf der vollen Studio-Seite.", ja:"この端末がすでに知っているあなたのチャンネルの情報です。グラフ（視聴時間、維持率、視聴者の流入元）はYouTubeのログインが必要で、完全なスタジオページにあります。", tr:"Bu cihazın kanalın hakkında zaten bildikleri. Grafikler — izlenme süresi, tutma, izleyicinin nereden geldiği — YouTube girişi ister ve tam Stüdyo sayfasında durur.", ko:"이 기기가 이미 알고 있는 채널 정보입니다. 차트(시청 시간, 유지율, 시청자 유입)는 YouTube 로그인이 필요하며 전체 스튜디오 페이지에 있습니다.", fa:"آنچه این دستگاه از پیش دربارهٔ کانالت می‌داند. نمودارها — زمان تماشا، ماندگاری، اینکه بیننده‌ها از کجا می‌آیند — به ورود به یوتیوب نیاز دارند و در صفحهٔ کامل استودیو هستند.", uk:"Те, що цей пристрій уже знає про твій канал. Графіки — час перегляду, утримання, звідки приходять глядачі — потребують входу в YouTube і живуть на повній сторінці Студії.", it:"Quello che questo dispositivo sa già del tuo canale. I grafici — tempo di visualizzazione, retention, da dove arrivano gli spettatori — richiedono l’accesso a YouTube e stanno nella pagina Studio completa.", pl:"To, co to urządzenie już wie o twoim kanale. Wykresy — czas oglądania, utrzymanie, skąd przychodzą widzowie — wymagają logowania do YouTube i są na pełnej stronie Studia.", vi:"Những gì thiết bị này đã biết về kênh của bạn. Các biểu đồ — thời gian xem, giữ chân, người xem đến từ đâu — cần đăng nhập YouTube và nằm ở trang Studio đầy đủ." },
  st_fact_ch: { en:"Connected channel", zh:"已连接的频道", hi:"कनेक्टेड चैनल", es:"Canal conectado", ar:"القناة المتصلة", fr:"Chaîne connectée", bn:"সংযুক্ত চ্যানেল", pt:"Canal ligado", ru:"Подключённый канал", ur:"منسلک چینل", id:"Kanal terhubung", de:"Verbundener Kanal", ja:"接続中のチャンネル", tr:"Bağlı kanal", ko:"연결된 채널", fa:"کانال متصل", uk:"Під’єднаний канал", it:"Canale collegato", pl:"Połączony kanał", vi:"Kênh đã kết nối" },
  st_fact_up: { en:"Uploads it has seen", zh:"它见过的投稿数", hi:"इसने देखे गए अपलोड", es:"Subidas que ha visto", ar:"المقاطع التي رآها", fr:"Publications vues", bn:"যত আপলোড দেখেছে", pt:"Envios que viu", ru:"Видел загрузок", ur:"دیکھے گئے اپ لوڈز", id:"Unggahan yang terlihat", de:"Gesehene Uploads", ja:"把握している投稿数", tr:"Gördüğü yüklemeler", ko:"확인한 업로드 수", fa:"آپلودهایی که دیده", uk:"Побачених завантажень", it:"Caricamenti visti", pl:"Zauważone publikacje", vi:"Số video đã thấy" },
  st_fact_gap: { en:"Your usual gap", zh:"你的更新间隔", hi:"आपका सामान्य अंतराल", es:"Tu intervalo habitual", ar:"الفاصل المعتاد لديك", fr:"Ton rythme habituel", bn:"আপনার সাধারণ ব্যবধান", pt:"O teu intervalo habitual", ru:"Твой обычный промежуток", ur:"آپ کا معمول کا وقفہ", id:"Jeda biasamu", de:"Dein üblicher Abstand", ja:"いつもの間隔", tr:"Olağan aran", ko:"평소 간격", fa:"فاصلهٔ معمولت", uk:"Твій звичний проміжок", it:"Il tuo intervallo abituale", pl:"Twoja zwykła przerwa", vi:"Khoảng cách thường lệ" },
  st_fact_since: { en:"Since the last one", zh:"距上一个", hi:"पिछले के बाद से", es:"Desde el último", ar:"منذ آخر واحد", fr:"Depuis le dernier", bn:"শেষটির পর থেকে", pt:"Desde o último", ru:"С последнего", ur:"آخری کے بعد سے", id:"Sejak yang terakhir", de:"Seit dem letzten", ja:"前回から", tr:"Sonuncudan beri", ko:"마지막 이후", fa:"از آخری تا حالا", uk:"Від останнього", it:"Dall’ultimo", pl:"Od ostatniego", vi:"Kể từ lần cuối" },
  st_studio_note: { en:"Measured from the upload dates this device stored the last time Studio ran. Nothing here was fetched just now.", zh:"根据这台设备上次运行工作室时保存的投稿日期算出。这里没有任何内容是刚刚抓取的。", hi:"पिछली बार स्टूडियो चलने पर इस डिवाइस में सेव हुई अपलोड तारीख़ों से निकाला गया। यहाँ कुछ भी अभी नहीं लाया गया।", es:"Calculado a partir de las fechas de subida que este dispositivo guardó la última vez que se abrió Estudio. Nada de esto se ha descargado ahora.", ar:"محسوب من تواريخ الرفع التي خزّنها هذا الجهاز آخر مرة عمل فيها الاستوديو. لم يُجلب شيء الآن.", fr:"Calculé à partir des dates de publication que cet appareil a gardées la dernière fois que Studio a tourné. Rien n’a été récupéré à l’instant.", bn:"স্টুডিও শেষবার চলার সময় এই ডিভাইসে জমা হওয়া আপলোডের তারিখ থেকে হিসাব করা। এখানে কিছুই এইমাত্র আনা হয়নি।", pt:"Calculado a partir das datas de envio que este dispositivo guardou da última vez que o Estúdio correu. Nada aqui foi obtido agora.", ru:"Посчитано по датам загрузок, которые это устройство сохранило в прошлый раз. Сейчас ничего не запрашивалось.", ur:"پچھلی بار اسٹوڈیو چلنے پر اس ڈیوائس میں محفوظ اپ لوڈ تاریخوں سے نکالا گیا۔ یہاں کچھ بھی ابھی نہیں لایا گیا۔", id:"Dihitung dari tanggal unggah yang disimpan perangkat ini saat Studio terakhir berjalan. Tidak ada yang diambil barusan.", de:"Errechnet aus den Upload-Daten, die dieses Gerät beim letzten Lauf von Studio gespeichert hat. Hier wurde gerade nichts abgerufen.", ja:"前回スタジオを開いたときにこの端末が保存した投稿日から計算しています。今この場で取得したものはありません。", tr:"Stüdyo en son çalıştığında bu cihazın sakladığı yükleme tarihlerinden hesaplandı. Şu anda hiçbir şey çekilmedi.", ko:"스튜디오가 마지막으로 실행됐을 때 이 기기가 저장한 업로드 날짜로 계산했습니다. 방금 가져온 것은 없습니다.", fa:"از تاریخ‌های آپلودی محاسبه شده که این دستگاه آخرین بار هنگام اجرای استودیو ذخیره کرده. همین حالا چیزی گرفته نشده.", uk:"Пораховано за датами завантажень, які цей пристрій зберіг минулого разу. Зараз нічого не запитувалося.", it:"Calcolato dalle date di pubblicazione che questo dispositivo ha salvato l’ultima volta che Studio è girato. Niente è stato scaricato adesso.", pl:"Policzone z dat publikacji, które to urządzenie zapisało przy ostatnim uruchomieniu Studia. Nic nie zostało teraz pobrane.", vi:"Tính từ ngày đăng mà thiết bị này lưu lần chạy Studio gần nhất. Không có gì vừa được tải về." },
  st_studio_none: { en:"No channel connected on this device yet. Open the full Studio and sign in with Google once; after that this panel fills in.", zh:"这台设备还没有连接频道。打开完整工作室，用 Google 登录一次；之后这个面板就会有内容。", hi:"इस डिवाइस पर अभी कोई चैनल कनेक्ट नहीं है। पूरा स्टूडियो खोलें और एक बार Google से साइन इन करें; उसके बाद यह पैनल भर जाएगा।", es:"Todavía no hay ningún canal conectado en este dispositivo. Abre el Estudio completo e inicia sesión con Google una vez; después este panel se rellena.", ar:"لا توجد قناة متصلة بهذا الجهاز بعد. افتح الاستوديو الكامل وسجّل الدخول بحساب Google مرة واحدة، وبعدها تمتلئ هذه اللوحة.", fr:"Aucune chaîne connectée sur cet appareil pour l’instant. Ouvre le Studio complet et connecte-toi une fois avec Google ; ensuite ce panneau se remplit.", bn:"এই ডিভাইসে এখনো কোনো চ্যানেল যুক্ত নেই। পুরো স্টুডিও খুলে একবার Google দিয়ে সাইন ইন করুন; তারপর এই প্যানেল ভরে যাবে।", pt:"Ainda não há canal ligado neste dispositivo. Abre o Estúdio completo e inicia sessão com a Google uma vez; depois este painel preenche-se.", ru:"На этом устройстве ещё нет подключённого канала. Открой полную Студию и войди через Google один раз — после этого панель заполнится.", ur:"اس ڈیوائس پر ابھی کوئی چینل منسلک نہیں۔ مکمل اسٹوڈیو کھولیں اور ایک بار گوگل سے سائن اِن کریں؛ اس کے بعد یہ پینل بھر جائے گا۔", id:"Belum ada kanal yang terhubung di perangkat ini. Buka Studio lengkap dan masuk dengan Google sekali; setelah itu panel ini terisi.", de:"Auf diesem Gerät ist noch kein Kanal verbunden. Öffne das volle Studio und melde dich einmal mit Google an; danach füllt sich dieses Feld.", ja:"この端末にはまだチャンネルが接続されていません。完全なスタジオを開いてGoogleで一度サインインすれば、以後ここが埋まります。", tr:"Bu cihazda henüz bağlı kanal yok. Tam Stüdyo’yu aç ve bir kez Google ile giriş yap; sonrasında bu panel dolar.", ko:"이 기기에는 아직 연결된 채널이 없습니다. 전체 스튜디오를 열어 Google로 한 번 로그인하면 이후 이 패널이 채워집니다.", fa:"هنوز هیچ کانالی به این دستگاه وصل نیست. استودیوی کامل را باز کن و یک‌بار با گوگل وارد شو؛ بعد از آن این پنل پر می‌شود.", uk:"На цьому пристрої ще немає під’єднаного каналу. Відкрий повну Студію й увійди через Google один раз — далі панель заповниться.", it:"Nessun canale collegato su questo dispositivo. Apri lo Studio completo e accedi con Google una volta; dopo questo pannello si riempie.", pl:"Na tym urządzeniu nie ma jeszcze połączonego kanału. Otwórz pełne Studio i zaloguj się raz przez Google; potem ten panel się wypełni.", vi:"Chưa có kênh nào kết nối trên thiết bị này. Mở Studio đầy đủ và đăng nhập Google một lần; sau đó bảng này sẽ có dữ liệu." },
  st_openfull: { en:"Open the full Studio", zh:"打开完整工作室", hi:"पूरा स्टूडियो खोलें", es:"Abrir el Estudio completo", ar:"افتح الاستوديو الكامل", fr:"Ouvrir le Studio complet", bn:"পুরো স্টুডিও খুলুন", pt:"Abrir o Estúdio completo", ru:"Открыть полную Студию", ur:"مکمل اسٹوڈیو کھولیں", id:"Buka Studio lengkap", de:"Volles Studio öffnen", ja:"完全なスタジオを開く", tr:"Tam Stüdyo’yu aç", ko:"전체 스튜디오 열기", fa:"استودیوی کامل را باز کن", uk:"Відкрити повну Студію", it:"Apri lo Studio completo", pl:"Otwórz pełne Studio", vi:"Mở Studio đầy đủ" },
  st_hype_h: { en:"Hype Lab", zh:"燃点实验室", hi:"हाइप लैब", es:"Laboratorio de impacto", ar:"مختبر الإثارة", fr:"Labo Hype", bn:"হাইপ ল্যাব", pt:"Laboratório de impacto", ru:"Хайп-лаб", ur:"ہائپ لیب", id:"Lab Hype", de:"Hype-Labor", ja:"ハイプ・ラボ", tr:"Hype Lab", ko:"하이프 랩", fa:"آزمایشگاه هیجان", uk:"Хайп-лаб", it:"Hype Lab", pl:"Hype Lab", vi:"Xưởng Hype" },
  st_hype_p: { en:"Drop in a video you have already cut. It finds the seconds where attention falls off and puts something there — a punch on the beat, a light wash, words, a music bed. Nothing is uploaded to measure it.", zh:"放入你已经剪好的视频。它会找出注意力下滑的那几秒，并在那里加点东西——踩点的重音、一层光、字幕、垫乐。测量过程不上传任何东西。", hi:"अपना पहले से कटा वीडियो डालें। यह वे सेकंड ढूँढता है जहाँ ध्यान गिरता है और वहाँ कुछ जोड़ता है — बीट पर पंच, हल्की रोशनी, शब्द, बैकग्राउंड म्यूज़िक। मापने के लिए कुछ भी अपलोड नहीं होता।", es:"Mete un vídeo que ya hayas montado. Encuentra los segundos en los que cae la atención y pone algo ahí: un golpe a tiempo, un lavado de luz, texto, una base musical. No se sube nada para medirlo.", ar:"ضع فيديو سبق أن قصصته. يجد الثواني التي تهبط فيها الانتباه ويضع شيئًا هناك — ضربة على الإيقاع، ومضة ضوء، كلمات، خلفية موسيقية. ولا يُرفع شيء لقياس ذلك.", fr:"Dépose une vidéo déjà montée. Il trouve les secondes où l’attention retombe et y met quelque chose : un impact sur le temps, un voile de lumière, du texte, un lit musical. Rien n’est envoyé pour le mesurer.", bn:"আগে থেকে কাটা একটি ভিডিও দিন। এটি সেই সেকেন্ডগুলো খুঁজে বের করে যেখানে মনোযোগ কমে যায় এবং সেখানে কিছু যোগ করে — বিটে পাঞ্চ, আলোর ঝলক, লেখা, ব্যাকগ্রাউন্ড মিউজিক। মাপার জন্য কিছুই আপলোড হয় না।", pt:"Põe aqui um vídeo que já montaste. Encontra os segundos em que a atenção cai e mete lá alguma coisa — um impacto no tempo certo, um banho de luz, texto, uma base musical. Nada é enviado para medir isto.", ru:"Брось сюда уже смонтированное видео. Оно находит секунды, где внимание падает, и ставит туда что-то — удар в бит, световую вспышку, текст, музыкальную подложку. Для замера ничего не загружается.", ur:"پہلے سے کٹی ہوئی ویڈیو ڈالیں۔ یہ وہ سیکنڈ ڈھونڈتا ہے جہاں توجہ گرتی ہے اور وہاں کچھ رکھ دیتا ہے — بیٹ پر پنچ، روشنی کی لہر، الفاظ، پس منظر کی موسیقی۔ ناپنے کے لیے کچھ اپ لوڈ نہیں ہوتا۔", id:"Masukkan video yang sudah kamu potong. Ia menemukan detik-detik saat perhatian turun dan menaruh sesuatu di sana — hentakan pada ketukan, sapuan cahaya, teks, alas musik. Tidak ada yang diunggah untuk mengukurnya.", de:"Wirf ein schon geschnittenes Video hinein. Es findet die Sekunden, in denen die Aufmerksamkeit abfällt, und setzt dort etwas hin — einen Schlag auf den Beat, einen Lichtschleier, Text, ein Musikbett. Zum Messen wird nichts hochgeladen.", ja:"すでに編集済みの動画を入れてください。注目が落ちる秒を見つけて、そこに何かを置きます — ビートに合わせた打点、光のワイプ、文字、BGM。計測のために何もアップロードしません。", tr:"Zaten kurguladığın bir videoyu bırak. Dikkatin düştüğü saniyeleri bulur ve oraya bir şey koyar — vuruşta bir darbe, bir ışık dalgası, yazı, müzik altlığı. Ölçmek için hiçbir şey yüklenmez.", ko:"이미 편집한 영상을 넣어 보세요. 주목도가 떨어지는 초를 찾아 그 자리에 무언가를 넣습니다 — 비트에 맞춘 펀치, 빛 효과, 자막, 배경 음악. 측정을 위해 업로드하는 것은 없습니다.", fa:"ویدیویی که از قبل تدوین کرده‌ای را بینداز. ثانیه‌هایی را پیدا می‌کند که توجه افت می‌کند و آنجا چیزی می‌گذارد — ضربه روی بیت، موجی از نور، کلمات، بستر موسیقی. برای اندازه‌گیری چیزی آپلود نمی‌شود.", uk:"Кинь сюди вже змонтоване відео. Воно знаходить секунди, де увага падає, і ставить туди щось — удар у біт, спалах світла, текст, музичну підкладку. Для вимірювання нічого не завантажується.", it:"Metti dentro un video che hai già montato. Trova i secondi in cui l’attenzione cala e ci mette qualcosa: un colpo sul beat, un lavaggio di luce, del testo, un tappeto musicale. Non si carica nulla per misurarlo.", pl:"Wrzuć film, który już zmontowałeś. Znajduje sekundy, w których uwaga spada, i wstawia tam coś — uderzenie na bit, rozbłysk światła, napis, podkład muzyczny. Nic nie jest wysyłane, żeby to zmierzyć.", vi:"Thả vào một video bạn đã dựng. Nó tìm những giây mà sự chú ý tụt xuống và đặt gì đó vào — một cú nhấn theo nhịp, một lớp sáng, chữ, nền nhạc. Không tải gì lên để đo cả." },
  st_home: { en:"Studio home", zh:"工作室首页", hi:"स्टूडियो होम", es:"Inicio de Estudio", ar:"صفحة الاستوديو", fr:"Accueil Studio", bn:"স্টুডিও হোম", pt:"Início do Estúdio", ru:"Главная Студии", ur:"اسٹوڈیو ہوم", id:"Beranda Studio", de:"Studio-Start", ja:"スタジオのホーム", tr:"Stüdyo ana sayfası", ko:"스튜디오 홈", fa:"خانهٔ استودیو", uk:"Головна Студії", it:"Home di Studio", pl:"Start Studia", vi:"Trang chính Studio" },
  st_ownpage: { en:"Open on its own page", zh:"在自己的页面打开", hi:"अपने पेज पर खोलें", es:"Abrir en su propia página", ar:"افتحه في صفحته", fr:"Ouvrir sur sa propre page", bn:"নিজের পেজে খুলুন", pt:"Abrir na sua própria página", ru:"Открыть на своей странице", ur:"اپنے صفحے پر کھولیں", id:"Buka di halamannya sendiri", de:"Auf eigener Seite öffnen", ja:"単独ページで開く", tr:"Kendi sayfasında aç", ko:"전용 페이지에서 열기", fa:"در صفحهٔ خودش باز کن", uk:"Відкрити на своїй сторінці", it:"Apri nella sua pagina", pl:"Otwórz na własnej stronie", vi:"Mở ở trang riêng" },
  st_editor_p: { en:"The full timeline — cut, trim, text, colour, sound and export. Nothing is uploaded: the footage stays in this browser.", zh:"完整时间线——剪切、修剪、字幕、调色、声音和导出。什么都不上传：素材留在这个浏览器里。", hi:"पूरी टाइमलाइन — कट, ट्रिम, टेक्स्ट, कलर, साउंड और एक्सपोर्ट। कुछ भी अपलोड नहीं होता: फ़ुटेज इसी ब्राउज़र में रहता है।", es:"La línea de tiempo completa: cortar, recortar, texto, color, sonido y exportar. No se sube nada: el material se queda en este navegador.", ar:"الخط الزمني الكامل — قص وتشذيب ونصوص وألوان وصوت وتصدير. لا يُرفع شيء: تبقى اللقطات في هذا المتصفح.", fr:"La timeline complète — couper, rogner, texte, couleur, son et export. Rien n’est envoyé : les rushes restent dans ce navigateur.", bn:"সম্পূর্ণ টাইমলাইন — কাট, ট্রিম, টেক্সট, কালার, সাউন্ড আর এক্সপোর্ট। কিছুই আপলোড হয় না: ফুটেজ এই ব্রাউজারেই থাকে।", pt:"A linha de tempo completa — cortar, aparar, texto, cor, som e exportar. Nada é enviado: as imagens ficam neste navegador.", ru:"Полный таймлайн — резать, подрезать, текст, цвет, звук и экспорт. Ничего не загружается: материал остаётся в этом браузере.", ur:"مکمل ٹائم لائن — کٹ، ٹرم، ٹیکسٹ، رنگ، آواز اور ایکسپورٹ۔ کچھ اپ لوڈ نہیں ہوتا: فوٹیج اسی براؤزر میں رہتی ہے۔", id:"Linimasa lengkap — potong, pangkas, teks, warna, suara, dan ekspor. Tidak ada yang diunggah: rekamannya tetap di peramban ini.", de:"Die volle Timeline — schneiden, trimmen, Text, Farbe, Ton und Export. Nichts wird hochgeladen: das Material bleibt in diesem Browser.", ja:"フル機能のタイムライン — カット、トリム、テキスト、カラー、音、書き出し。何もアップロードしません。素材はこのブラウザに残ります。", tr:"Tam zaman çizelgesi — kes, kırp, yazı, renk, ses ve dışa aktarma. Hiçbir şey yüklenmez: görüntüler bu tarayıcıda kalır.", ko:"완전한 타임라인 — 컷, 트림, 자막, 색보정, 사운드, 내보내기. 업로드는 없습니다: 영상은 이 브라우저에 남습니다.", fa:"تایم‌لاین کامل — برش، تریم، متن، رنگ، صدا و خروجی. چیزی آپلود نمی‌شود: فیلم‌ها در همین مرورگر می‌مانند.", uk:"Повний таймлайн — різати, підрізати, текст, колір, звук і експорт. Нічого не завантажується: матеріал лишається в цьому браузері.", it:"La timeline completa — taglio, trim, testo, colore, suono ed esportazione. Non si carica nulla: il girato resta in questo browser.", pl:"Pełna oś czasu — cięcie, przycinanie, tekst, kolor, dźwięk i eksport. Nic nie jest wysyłane: materiał zostaje w tej przeglądarce.", vi:"Dòng thời gian đầy đủ — cắt, tỉa, chữ, màu, âm thanh và xuất. Không tải gì lên: tư liệu ở lại trong trình duyệt này." },
  st_editor_own: { en:"Short of room? Open the Editor on its own page.", zh:"地方不够？在自己的页面打开编辑器。", hi:"जगह कम है? एडिटर को अपने पेज पर खोलें।", es:"¿Te falta espacio? Abre el Editor en su propia página.", ar:"المساحة ضيقة؟ افتح المحرر في صفحته.", fr:"Trop à l’étroit ? Ouvre l’Éditeur sur sa propre page.", bn:"জায়গা কম? এডিটরকে নিজের পেজে খুলুন।", pt:"Pouco espaço? Abre o Editor na sua própria página.", ru:"Мало места? Открой Редактор на своей странице.", ur:"جگہ کم ہے؟ ایڈیٹر کو اپنے صفحے پر کھولیں۔", id:"Kurang ruang? Buka Editor di halamannya sendiri.", de:"Zu wenig Platz? Öffne den Editor auf seiner eigenen Seite.", ja:"手狭ですか？エディタを単独ページで開いてください。", tr:"Yer mi dar? Düzenleyiciyi kendi sayfasında aç.", ko:"공간이 부족한가요? 편집기를 전용 페이지에서 여세요.", fa:"جا کم است؟ ویرایشگر را در صفحهٔ خودش باز کن.", uk:"Замало місця? Відкрий Редактор на власній сторінці.", it:"Poco spazio? Apri l’Editor nella sua pagina.", pl:"Mało miejsca? Otwórz Edytor na własnej stronie.", vi:"Chật chỗ? Mở Trình sửa ở trang riêng." },
  st_ai_p: { en:"Drop in a clip and it plans the edit, applies it, and writes the title, description and tags — ready to post to YouTube, TikTok or Shorts.", zh:"放入一个片段，它会规划剪辑、执行剪辑，并写好标题、描述和标签——可以直接发到 YouTube、TikTok 或 Shorts。", hi:"एक क्लिप डालें और यह एडिट की योजना बनाता है, उसे लागू करता है, और टाइटल, डिस्क्रिप्शन व टैग लिखता है — YouTube, TikTok या Shorts पर पोस्ट करने के लिए तैयार।", es:"Suelta un clip y planifica el montaje, lo aplica y escribe el título, la descripción y las etiquetas: listo para publicar en YouTube, TikTok o Shorts.", ar:"ضع مقطعًا فيخطّط للمونتاج وينفّذه ويكتب العنوان والوصف والوسوم — جاهزًا للنشر على يوتيوب أو تيك توك أو شورتس.", fr:"Dépose un clip : il planifie le montage, l’applique, puis écrit le titre, la description et les tags — prêt à publier sur YouTube, TikTok ou Shorts.", bn:"একটি ক্লিপ দিন — এটি এডিটের পরিকল্পনা করে, প্রয়োগ করে, আর টাইটেল, বর্ণনা ও ট্যাগ লেখে — YouTube, TikTok বা Shorts-এ পোস্ট করার জন্য তৈরি।", pt:"Põe um clipe e ele planeia a montagem, aplica-a e escreve o título, a descrição e as etiquetas — pronto para publicar no YouTube, TikTok ou Shorts.", ru:"Брось клип — оно спланирует монтаж, применит его и напишет заголовок, описание и теги; готово к публикации на YouTube, TikTok или Shorts.", ur:"ایک کلپ ڈالیں اور یہ ایڈٹ کی منصوبہ بندی کرتا ہے، اسے لاگو کرتا ہے، اور عنوان، تفصیل اور ٹیگز لکھتا ہے — یوٹیوب، ٹک ٹاک یا شارٹس پر پوسٹ کے لیے تیار۔", id:"Masukkan klip dan ia merencanakan editannya, menerapkannya, lalu menulis judul, deskripsi, dan tag — siap diunggah ke YouTube, TikTok, atau Shorts.", de:"Wirf einen Clip hinein: es plant den Schnitt, wendet ihn an und schreibt Titel, Beschreibung und Tags — fertig für YouTube, TikTok oder Shorts.", ja:"クリップを入れると、編集を計画して実行し、タイトル・説明・タグまで書きます。YouTube、TikTok、Shorts にそのまま投稿できます。", tr:"Bir klip bırak; kurguyu planlar, uygular ve başlık, açıklama ile etiketleri yazar — YouTube, TikTok ya da Shorts’a atmaya hazır.", ko:"클립을 넣으면 편집을 계획하고 적용한 뒤 제목, 설명, 태그까지 씁니다 — YouTube, TikTok, Shorts에 바로 올릴 수 있게.", fa:"یک کلیپ بینداز تا تدوین را طرح‌ریزی کند، اعمالش کند و عنوان، توضیح و برچسب‌ها را بنویسد — آمادهٔ انتشار در یوتیوب، تیک‌تاک یا شورتس.", uk:"Кинь кліп — воно спланує монтаж, застосує його й напише заголовок, опис і теги; готово для YouTube, TikTok чи Shorts.", it:"Metti una clip: pianifica il montaggio, lo applica e scrive titolo, descrizione e tag — pronta da pubblicare su YouTube, TikTok o Shorts.", pl:"Wrzuć klip, a zaplanuje montaż, wykona go i napisze tytuł, opis oraz tagi — gotowe do wrzucenia na YouTube, TikToka albo Shorts.", vi:"Thả vào một đoạn clip và nó lên kế hoạch dựng, thực hiện, rồi viết tiêu đề, mô tả và thẻ — sẵn sàng đăng lên YouTube, TikTok hay Shorts." },
  st_ai_own: { en:"Short of room? Open the AI Editor on its own page.", zh:"地方不够？在自己的页面打开 AI 编辑器。", hi:"जगह कम है? AI एडिटर को अपने पेज पर खोलें।", es:"¿Te falta espacio? Abre el Editor IA en su propia página.", ar:"المساحة ضيقة؟ افتح محرر الذكاء الاصطناعي في صفحته.", fr:"Trop à l’étroit ? Ouvre l’Éditeur IA sur sa propre page.", bn:"জায়গা কম? AI এডিটরকে নিজের পেজে খুলুন।", pt:"Pouco espaço? Abre o Editor IA na sua própria página.", ru:"Мало места? Открой ИИ-редактор на своей странице.", ur:"جگہ کم ہے؟ AI ایڈیٹر کو اپنے صفحے پر کھولیں۔", id:"Kurang ruang? Buka Editor AI di halamannya sendiri.", de:"Zu wenig Platz? Öffne den KI-Editor auf seiner eigenen Seite.", ja:"手狭ですか？AIエディタを単独ページで開いてください。", tr:"Yer mi dar? AI Düzenleyici’yi kendi sayfasında aç.", ko:"공간이 부족한가요? AI 편집기를 전용 페이지에서 여세요.", fa:"جا کم است؟ ویرایشگر هوش مصنوعی را در صفحهٔ خودش باز کن.", uk:"Замало місця? Відкрий ШІ-редактор на власній сторінці.", it:"Poco spazio? Apri l’Editor IA nella sua pagina.", pl:"Mało miejsca? Otwórz Edytor AI na własnej stronie.", vi:"Chật chỗ? Mở Trình sửa AI ở trang riêng." },
  st_photo_p: { en:"Crop, retouch, add text and export a still — thumbnails, covers, anything that is a picture rather than a cut. Nothing is uploaded: the image stays in this browser.", zh:"裁剪、修图、加字并导出静态图——缩略图、封面，任何是图片而不是剪辑的东西。什么都不上传：图片留在这个浏览器里。", hi:"क्रॉप करें, रीटच करें, टेक्स्ट जोड़ें और स्टिल एक्सपोर्ट करें — थंबनेल, कवर, कुछ भी जो तस्वीर है, कट नहीं। कुछ भी अपलोड नहीं होता: तस्वीर इसी ब्राउज़र में रहती है।", es:"Recorta, retoca, añade texto y exporta una imagen fija: miniaturas, portadas, cualquier cosa que sea una foto y no un montaje. No se sube nada: la imagen se queda en este navegador.", ar:"قصّ وعدّل وأضف نصًا وصدّر صورة ثابتة — صور مصغّرة، أغلفة، أي شيء صورة لا مقطعًا. لا يُرفع شيء: تبقى الصورة في هذا المتصفح.", fr:"Recadre, retouche, ajoute du texte et exporte une image fixe — miniatures, couvertures, tout ce qui est une image plutôt qu’un montage. Rien n’est envoyé : l’image reste dans ce navigateur.", bn:"ক্রপ করুন, রিটাচ করুন, লেখা যোগ করুন আর স্টিল এক্সপোর্ট করুন — থাম্বনেইল, কভার, যা কিছু ছবি, কাট নয়। কিছুই আপলোড হয় না: ছবি এই ব্রাউজারেই থাকে।", pt:"Corta, retoca, acrescenta texto e exporta uma imagem — miniaturas, capas, tudo o que seja imagem e não montagem. Nada é enviado: a imagem fica neste navegador.", ru:"Кадрируй, ретушируй, добавляй текст и экспортируй картинку — обложки, превью, всё, что картинка, а не монтаж. Ничего не загружается: изображение остаётся в этом браузере.", ur:"کراپ کریں، ری ٹچ کریں، متن شامل کریں اور تصویر ایکسپورٹ کریں — تھمب نیل، کور، ہر وہ چیز جو تصویر ہے نہ کہ کٹ۔ کچھ اپ لوڈ نہیں ہوتا: تصویر اسی براؤزر میں رہتی ہے۔", id:"Pangkas, retouch, tambahkan teks, dan ekspor gambar diam — thumbnail, sampul, apa pun yang berupa gambar bukan potongan video. Tidak ada yang diunggah: gambarnya tetap di peramban ini.", de:"Zuschneiden, retuschieren, Text hinzufügen und ein Standbild exportieren — Thumbnails, Cover, alles, was ein Bild ist und kein Schnitt. Nichts wird hochgeladen: das Bild bleibt in diesem Browser.", ja:"切り抜き、レタッチ、文字入れ、静止画の書き出し — サムネイル、カバー、カットではなく画像であるものすべて。何もアップロードしません。画像はこのブラウザに残ります。", tr:"Kırp, rötuşla, yazı ekle ve bir kare dışa aktar — küçük resimler, kapaklar, kurgu değil resim olan her şey. Hiçbir şey yüklenmez: görsel bu tarayıcıda kalır.", ko:"자르고, 보정하고, 글자를 넣고, 정지 이미지를 내보내세요 — 썸네일, 커버, 컷이 아니라 그림인 모든 것. 업로드는 없습니다: 이미지는 이 브라우저에 남습니다.", fa:"برش بزن، روتوش کن، متن اضافه کن و تصویر ثابت بگیر — تصویر بندانگشتی، کاور، هر چیزی که عکس است نه برش. چیزی آپلود نمی‌شود: تصویر در همین مرورگر می‌ماند.", uk:"Кадруй, ретушуй, додавай текст і експортуй зображення — обкладинки, прев’ю, усе, що картинка, а не монтаж. Нічого не завантажується: зображення лишається в цьому браузері.", it:"Ritaglia, ritocca, aggiungi testo ed esporta un fermo immagine — miniature, copertine, tutto ciò che è un’immagine e non un montaggio. Non si carica nulla: l’immagine resta in questo browser.", pl:"Kadruj, retuszuj, dodawaj tekst i eksportuj obraz — miniatury, okładki, wszystko, co jest obrazem, a nie montażem. Nic nie jest wysyłane: obraz zostaje w tej przeglądarce.", vi:"Cắt, chỉnh sửa, thêm chữ và xuất ảnh tĩnh — ảnh thu nhỏ, ảnh bìa, bất cứ thứ gì là ảnh chứ không phải bản dựng. Không tải gì lên: ảnh ở lại trong trình duyệt này." },
  st_hype_own: { en:"Short of room? Open Hype Lab on its own page.", zh:"地方不够？在自己的页面打开 Hype Lab。", hi:"जगह कम है? Hype Lab को उसके अपने पेज पर खोलें।", es:"¿Te falta sitio? Abre Hype Lab en su propia página.", ar:"المساحة ضيقة؟ افتح Hype Lab في صفحته الخاصة.", fr:"Pas assez de place ? Ouvre Hype Lab sur sa propre page.", bn:"জায়গা কম? Hype Lab নিজের পেজে খুলুন।", pt:"Falta espaço? Abre o Hype Lab na sua própria página.", ru:"Мало места? Открой Hype Lab на его собственной странице.", ur:"جگہ کم ہے؟ Hype Lab کو اس کے اپنے صفحے پر کھولیں۔", id:"Kurang ruang? Buka Hype Lab di halamannya sendiri.", de:"Zu wenig Platz? Öffne Hype Lab auf seiner eigenen Seite.", ja:"手狭ですか？ Hype Lab を専用ページで開けます。", tr:"Yer mi dar? Hype Lab’i kendi sayfasında aç.", ko:"공간이 부족한가요? Hype Lab을 전용 페이지에서 여세요.", fa:"جا کم است؟ Hype Lab را در صفحهٔ خودش باز کن.", uk:"Замало місця? Відкрий Hype Lab на власній сторінці.", it:"Poco spazio? Apri Hype Lab nella sua pagina.", pl:"Mało miejsca? Otwórz Hype Lab na jego własnej stronie.", vi:"Chật chỗ? Mở Hype Lab trên trang riêng của nó." },
  st_photo_own: { en:"Short of room? Open the Photo editor on its own page.", zh:"地方不够？在自己的页面打开图片编辑器。", hi:"जगह कम है? फ़ोटो एडिटर को अपने पेज पर खोलें।", es:"¿Te falta espacio? Abre el editor de Foto en su propia página.", ar:"المساحة ضيقة؟ افتح محرر الصور في صفحته.", fr:"Trop à l’étroit ? Ouvre l’éditeur Photo sur sa propre page.", bn:"জায়গা কম? ফটো এডিটরকে নিজের পেজে খুলুন।", pt:"Pouco espaço? Abre o editor de Foto na sua própria página.", ru:"Мало места? Открой редактор Фото на своей странице.", ur:"جگہ کم ہے؟ فوٹو ایڈیٹر کو اپنے صفحے پر کھولیں۔", id:"Kurang ruang? Buka editor Foto di halamannya sendiri.", de:"Zu wenig Platz? Öffne den Foto-Editor auf seiner eigenen Seite.", ja:"手狭ですか？写真エディタを単独ページで開いてください。", tr:"Yer mi dar? Fotoğraf düzenleyiciyi kendi sayfasında aç.", ko:"공간이 부족한가요? 사진 편집기를 전용 페이지에서 여세요.", fa:"جا کم است؟ ویرایشگر عکس را در صفحهٔ خودش باز کن.", uk:"Замало місця? Відкрий редактор Фото на власній сторінці.", it:"Poco spazio? Apri l’editor Foto nella sua pagina.", pl:"Mało miejsca? Otwórz edytor Zdjęć na własnej stronie.", vi:"Chật chỗ? Mở trình sửa Ảnh ở trang riêng." },
  st_trends_h: { en:"Trend Spotter", zh:"趋势雷达", hi:"ट्रेंड स्पॉटर", es:"Detector de tendencias", ar:"راصد الاتجاهات", fr:"Détecteur de tendances", bn:"ট্রেন্ড স্পটার", pt:"Detector de tendências", ru:"Ловец трендов", ur:"ٹرینڈ اسپاٹر", id:"Pemantau tren", de:"Trend-Spürnase", ja:"トレンド探索", tr:"Trend Bulucu", ko:"트렌드 탐색기", fa:"ردیاب ترند", uk:"Ловець трендів", it:"Rilevatore di tendenze", pl:"Wykrywacz trendów", vi:"Dò xu hướng" },
  st_back: { en:"Back to NovaClip", zh:"返回 NovaClip", hi:"NovaClip पर वापस", es:"Volver a NovaClip", ar:"العودة إلى NovaClip", fr:"Retour à NovaClip", bn:"NovaClip-এ ফিরে যান", pt:"Voltar ao NovaClip", ru:"Назад в NovaClip", ur:"NovaClip پر واپس", id:"Kembali ke NovaClip", de:"Zurück zu NovaClip", ja:"NovaClipへ戻る", tr:"NovaClip’e dön", ko:"NovaClip으로 돌아가기", fa:"بازگشت به NovaClip", uk:"Назад до NovaClip", it:"Torna a NovaClip", pl:"Wróć do NovaClip", vi:"Quay lại NovaClip" },
  st_heat_hot: { en:"hot", zh:"火热", hi:"हॉट", es:"caliente", ar:"ساخن", fr:"brûlant", bn:"হট", pt:"quente", ru:"горячо", ur:"گرم", id:"panas", de:"heiß", ja:"急上昇", tr:"kızgın", ko:"뜨거움", fa:"داغ", uk:"гаряче", it:"caldo", pl:"gorące", vi:"nóng" },
  st_heat_rising: { en:"rising", zh:"上升中", hi:"बढ़ रहा", es:"subiendo", ar:"يصعد", fr:"en hausse", bn:"বাড়ছে", pt:"a subir", ru:"растёт", ur:"بڑھ رہا", id:"naik", de:"steigend", ja:"上昇中", tr:"yükseliyor", ko:"상승 중", fa:"در حال رشد", uk:"зростає", it:"in salita", pl:"rośnie", vi:"đang lên" },
  st_heat_steady: { en:"steady", zh:"平稳", hi:"स्थिर", es:"estable", ar:"ثابت", fr:"stable", bn:"স্থির", pt:"estável", ru:"ровно", ur:"مستحکم", id:"stabil", de:"stabil", ja:"横ばい", tr:"sabit", ko:"꾸준함", fa:"ثابت", uk:"стабільно", it:"stabile", pl:"stabilne", vi:"ổn định" },
  ts_found: { en:"Rising in {q}", zh:"{q} 里正在上升的", hi:"{q} में जो ऊपर जा रहा है", es:"Subiendo en {q}", ar:"ما يصعد في {q}", fr:"En hausse dans {q}", bn:"{q}-এ যা উঠছে", pt:"A subir em {q}", ru:"Растёт в нише {q}", ur:"{q} میں جو اوپر جا رہا ہے", id:"Sedang naik di {q}", de:"Im Aufwind bei {q}", ja:"{q} で伸びているもの", tr:"{q} alanında yükselenler", ko:"{q}에서 떠오르는 것", fa:"در حال رشد در {q}", uk:"Зростає в ніші {q}", it:"In crescita in {q}", pl:"Rośnie w {q}", vi:"Đang lên trong {q}" },
  ts_found_sub: { en:"Momentum is how fast it is climbing. Crowded is how thoroughly the big channels got there first — low is the one you want.", zh:"势头是它上升的速度。拥挤度是大频道抢先做到什么程度——越低越好。", hi:"मोमेंटम यानी यह कितनी तेज़ी से चढ़ रहा है। भीड़ यानी बड़े चैनल कितना पहले ही कर चुके हैं — कम वाला ही चाहिए।", es:"El impulso es lo rápido que sube. Saturación es cuánto han llegado ya los canales grandes: baja es la que te interesa.", ar:"الزخم هو سرعة صعوده. الازدحام هو مدى سبق القنوات الكبيرة إليه — والمنخفض هو ما تريده.", fr:"L’élan, c’est la vitesse de montée. L’encombrement, c’est à quel point les grosses chaînes y sont déjà — c’est le bas que tu veux.", bn:"মোমেন্টাম মানে কত দ্রুত উঠছে। ভিড় মানে বড় চ্যানেলগুলো কতটা আগেই করে ফেলেছে — কম হলেই ভালো।", pt:"O impulso é a velocidade a que sobe. Saturação é o quanto os canais grandes já lá chegaram — baixa é a que queres.", ru:"Импульс — как быстро растёт. Тесно — насколько плотно там уже большие каналы; тебе нужно низкое.", ur:"مومینٹم یعنی یہ کتنی تیزی سے چڑھ رہا ہے۔ بھیڑ یعنی بڑے چینلز کتنا پہلے ہی کر چکے — کم ہی چاہیے۔", id:"Momentum itu secepat apa ia naik. Padat itu seberapa dalam kanal besar sudah masuk — yang rendah yang kamu mau.", de:"Momentum ist, wie schnell es steigt. Gedrängt ist, wie gründlich die großen Kanäle schon da waren — niedrig ist das, was du willst.", ja:"勢いは伸びの速さ。混雑は大手がすでにどれだけ押さえたか。低いほうが狙い目です。", tr:"Momentum ne kadar hızlı tırmandığı. Kalabalık, büyük kanalların oraya ne kadar önce vardığı — düşük olanı istersin.", ko:"모멘텀은 얼마나 빨리 오르는지. 포화는 큰 채널들이 얼마나 먼저 다뤘는지 — 낮은 쪽이 노릴 만합니다.", fa:"شتاب یعنی چقدر سریع بالا می‌رود. شلوغی یعنی کانال‌های بزرگ چقدر زودتر رسیده‌اند — کم بودنش را می‌خواهی.", uk:"Імпульс — як швидко зростає. Тісно — наскільки щільно там уже великі канали; тобі треба низьке.", it:"Lo slancio è quanto in fretta sale. Affollato è quanto i canali grandi ci sono già arrivati: basso è quello che vuoi.", pl:"Rozpęd to jak szybko rośnie. Tłok to jak mocno duże kanały już tam są — chcesz niskiego.", vi:"Đà là tốc độ leo lên. Đông là mức các kênh lớn đã phủ tới đâu — bạn muốn số thấp." },
  ts_m_mom: { en:"Momentum", zh:"势头", hi:"मोमेंटम", es:"Impulso", ar:"الزخم", fr:"Élan", bn:"মোমেন্টাম", pt:"Impulso", ru:"Импульс", ur:"مومینٹم", id:"Momentum", de:"Momentum", ja:"勢い", tr:"Momentum", ko:"모멘텀", fa:"شتاب", uk:"Імпульс", it:"Slancio", pl:"Rozpęd", vi:"Đà" },
  ts_m_crowd: { en:"Crowded", zh:"拥挤度", hi:"भीड़", es:"Saturación", ar:"الازدحام", fr:"Encombré", bn:"ভিড়", pt:"Saturação", ru:"Тесно", ur:"بھیڑ", id:"Padat", de:"Gedrängt", ja:"混雑", tr:"Kalabalık", ko:"포화", fa:"شلوغی", uk:"Тісно", it:"Affollato", pl:"Tłok", vi:"Đông" },
  ts_m_fit: { en:"Fits you", zh:"契合度", hi:"आपके लिए", es:"Te encaja", ar:"يناسبك", fr:"Te convient", bn:"আপনার জন্য", pt:"Encaixa-te", ru:"Подходит", ur:"آپ کے لیے", id:"Cocok", de:"Passt zu dir", ja:"相性", tr:"Sana uyar", ko:"적합도", fa:"مناسب تو", uk:"Пасує", it:"Ti calza", pl:"Pasuje", vi:"Hợp bạn" },
  ts_b_hot: { en:"HOT", zh:"火热", hi:"हॉट", es:"CALIENTE", ar:"ساخن", fr:"CHAUD", bn:"হট", pt:"QUENTE", ru:"ГОРЯЧО", ur:"گرم", id:"PANAS", de:"HEISS", ja:"急上昇", tr:"KIZGIN", ko:"핫", fa:"داغ", uk:"ГАРЯЧЕ", it:"CALDO", pl:"GORĄCE", vi:"NÓNG" },
  ts_b_rising: { en:"RISING", zh:"上升", hi:"बढ़ रहा", es:"SUBIENDO", ar:"يصعد", fr:"EN HAUSSE", bn:"বাড়ছে", pt:"A SUBIR", ru:"РАСТЁТ", ur:"بڑھ رہا", id:"NAIK", de:"STEIGEND", ja:"上昇中", tr:"YÜKSELİYOR", ko:"상승", fa:"در حال رشد", uk:"ЗРОСТАЄ", it:"IN SALITA", pl:"ROŚNIE", vi:"ĐANG LÊN" },
  ts_b_breakout: { en:"BREAKOUT", zh:"爆发", hi:"ब्रेकआउट", es:"DESPEGANDO", ar:"انطلاقة", fr:"PERCÉE", bn:"ব্রেকআউট", pt:"A EXPLODIR", ru:"ПРОРЫВ", ur:"بریک آؤٹ", id:"MELEDAK", de:"DURCHBRUCH", ja:"ブレイク", tr:"PATLAMA", ko:"급부상", fa:"جهش", uk:"ПРОРИВ", it:"ESPLOSIONE", pl:"PRZEŁOM", vi:"BỨT PHÁ" },
  ts_b_opportunity: { en:"GAP", zh:"空白", hi:"खाली जगह", es:"HUECO", ar:"فجوة", fr:"CRÉNEAU", bn:"ফাঁক", pt:"LACUNA", ru:"ПРОБЕЛ", ur:"خلا", id:"CELAH", de:"LÜCKE", ja:"すき間", tr:"BOŞLUK", ko:"빈틈", fa:"شکاف", uk:"ПРОГАЛИНА", it:"VUOTO", pl:"LUKA", vi:"KHOẢNG TRỐNG" },
  ts_open: { en:"Open", zh:"打开", hi:"खोलें", es:"Abrir", ar:"افتح", fr:"Ouvrir", bn:"খুলুন", pt:"Abrir", ru:"Открыть", ur:"کھولیں", id:"Buka", de:"Öffnen", ja:"開く", tr:"Aç", ko:"열기", fa:"باز کن", uk:"Відкрити", it:"Apri", pl:"Otwórz", vi:"Mở" },
  ts_close: { en:"Close", zh:"关闭", hi:"बंद करें", es:"Cerrar", ar:"إغلاق", fr:"Fermer", bn:"বন্ধ করুন", pt:"Fechar", ru:"Закрыть", ur:"بند کریں", id:"Tutup", de:"Schließen", ja:"閉じる", tr:"Kapat", ko:"닫기", fa:"بستن", uk:"Закрити", it:"Chiudi", pl:"Zamknij", vi:"Đóng" },
  ts_why: { en:"Why it is moving", zh:"它为什么在动", hi:"यह क्यों चल रहा है", es:"Por qué se mueve", ar:"لماذا يتحرّك", fr:"Pourquoi ça bouge", bn:"কেন এটা নড়ছে", pt:"Porque está a mexer", ru:"Почему это движется", ur:"یہ کیوں چل رہا ہے", id:"Kenapa ini bergerak", de:"Warum es sich bewegt", ja:"なぜ動いているか", tr:"Neden hareketleniyor", ko:"왜 움직이는가", fa:"چرا در حرکت است", uk:"Чому це рухається", it:"Perché si muove", pl:"Dlaczego się rusza", vi:"Vì sao nó đang chuyển động" },
  ts_numbers: { en:"The numbers", zh:"数据", hi:"आँकड़े", es:"Los números", ar:"الأرقام", fr:"Les chiffres", bn:"সংখ্যাগুলো", pt:"Os números", ru:"Цифры", ur:"اعداد", id:"Angkanya", de:"Die Zahlen", ja:"数値", tr:"Sayılar", ko:"수치", fa:"اعداد", uk:"Цифри", it:"I numeri", pl:"Liczby", vi:"Các con số" },
  ts_make: { en:"What you could make", zh:"你能做什么", hi:"आप क्या बना सकते हैं", es:"Lo que podrías hacer", ar:"ما يمكنك صنعه", fr:"Ce que tu pourrais faire", bn:"আপনি কী বানাতে পারেন", pt:"O que podias fazer", ru:"Что можно снять", ur:"آپ کیا بنا سکتے ہیں", id:"Yang bisa kamu buat", de:"Was du daraus machen könntest", ja:"作れるもの", tr:"Ne çekebilirsin", ko:"만들 수 있는 것", fa:"چه می‌توانی بسازی", uk:"Що можна зняти", it:"Cosa potresti fare", pl:"Co możesz zrobić", vi:"Bạn có thể làm gì" },
  ts_where: { en:"Where to put it", zh:"发在哪里", hi:"कहाँ डालें", es:"Dónde publicarlo", ar:"أين تنشره", fr:"Où le poster", bn:"কোথায় দেবেন", pt:"Onde publicar", ru:"Куда выкладывать", ur:"کہاں ڈالیں", id:"Di mana menaruhnya", de:"Wohin damit", ja:"どこに出すか", tr:"Nereye koymalı", ko:"어디에 올릴까", fa:"کجا بگذاری", uk:"Куди викладати", it:"Dove pubblicarlo", pl:"Gdzie to wrzucić", vi:"Đăng ở đâu" },
  ts_best: { en:"BEST", zh:"最佳", hi:"सबसे अच्छा", es:"MEJOR", ar:"الأفضل", fr:"LE MEILLEUR", bn:"সেরা", pt:"MELHOR", ru:"ЛУЧШЕЕ", ur:"بہترین", id:"TERBAIK", de:"AM BESTEN", ja:"最適", tr:"EN İYİSİ", ko:"최적", fa:"بهترین", uk:"НАЙКРАЩЕ", it:"MIGLIORE", pl:"NAJLEPSZE", vi:"TỐT NHẤT" },
  ts_hooks: { en:"Opening lines", zh:"开场白", hi:"शुरुआती लाइनें", es:"Frases de apertura", ar:"جُمل الافتتاح", fr:"Phrases d’accroche", bn:"শুরুর লাইন", pt:"Frases de abertura", ru:"Первые фразы", ur:"ابتدائی جملے", id:"Kalimat pembuka", de:"Einstiegssätze", ja:"つかみの一言", tr:"Açılış cümleleri", ko:"첫 마디", fa:"جمله‌های آغازین", uk:"Перші фрази", it:"Frasi d’apertura", pl:"Zdania otwierające", vi:"Câu mở đầu" },
  ts_hooks_sub: { en:"Said out loud in the first two seconds, not written on the thumbnail.", zh:"是开头两秒里说出来的话，不是写在封面上的字。", hi:"पहले दो सेकंड में बोली जाने वाली बात, थंबनेल पर लिखी नहीं।", es:"Se dicen en voz alta en los dos primeros segundos, no se escriben en la miniatura.", ar:"تُقال بصوت عالٍ في أول ثانيتين، لا تُكتب على الصورة المصغّرة.", fr:"Dites à voix haute dans les deux premières secondes, pas écrites sur la miniature.", bn:"প্রথম দুই সেকেন্ডে মুখে বলা, থাম্বনেইলে লেখা নয়।", pt:"Ditas em voz alta nos dois primeiros segundos, não escritas na miniatura.", ru:"Их говорят вслух в первые две секунды, а не пишут на обложке.", ur:"پہلے دو سیکنڈ میں بولے جانے والے جملے، تھمب نیل پر لکھے ہوئے نہیں۔", id:"Diucapkan di dua detik pertama, bukan ditulis di thumbnail.", de:"In den ersten zwei Sekunden laut gesagt, nicht aufs Thumbnail geschrieben.", ja:"最初の2秒で声に出す言葉です。サムネに書く文字ではありません。", tr:"İlk iki saniyede sesli söylenir, kapak görseline yazılmaz.", ko:"첫 2초에 소리 내어 말하는 말이지, 썸네일에 쓰는 글자가 아닙니다.", fa:"در دو ثانیهٔ اول بلند گفته می‌شوند، نه اینکه روی تصویر بندانگشتی نوشته شوند.", uk:"Їх кажуть уголос у перші дві секунди, а не пишуть на обкладинці.", it:"Si dicono ad alta voce nei primi due secondi, non si scrivono sulla miniatura.", pl:"Mówi się je na głos w pierwszych dwóch sekundach, nie pisze na miniaturze.", vi:"Nói ra miệng trong hai giây đầu, không phải chữ viết trên ảnh bìa." },
  ts_opps: { en:"The gaps", zh:"空白点", hi:"खाली जगहें", es:"Los huecos", ar:"الفجوات", fr:"Les créneaux", bn:"ফাঁকগুলো", pt:"As lacunas", ru:"Пробелы", ur:"خلا", id:"Celah-celahnya", de:"Die Lücken", ja:"すき間", tr:"Boşluklar", ko:"빈틈", fa:"شکاف‌ها", uk:"Прогалини", it:"I vuoti", pl:"Luki", vi:"Khoảng trống" },
  ts_opps_sub: { en:"Climbing, and the big channels have not covered it properly yet. This is where a small channel actually wins.", zh:"正在上升，而大频道还没做透。这才是小频道真正能赢的地方。", hi:"ऊपर जा रहा है, और बड़े चैनलों ने अभी ठीक से नहीं किया। छोटा चैनल असल में यहीं जीतता है।", es:"Está subiendo y los canales grandes aún no lo han cubierto bien. Aquí es donde un canal pequeño gana de verdad.", ar:"يصعد، والقنوات الكبيرة لم تغطّه جيدًا بعد. هنا تفوز القناة الصغيرة فعلًا.", fr:"Ça monte, et les grosses chaînes ne l’ont pas encore bien traité. C’est là qu’une petite chaîne gagne vraiment.", bn:"উঠছে, আর বড় চ্যানেলগুলো এখনও ঠিকমতো করেনি। ছোট চ্যানেল আসলে এখানেই জেতে।", pt:"Está a subir e os canais grandes ainda não cobriram bem. É aqui que um canal pequeno ganha mesmo.", ru:"Растёт, а большие каналы ещё толком не взялись. Вот где маленький канал реально выигрывает.", ur:"اوپر جا رہا ہے، اور بڑے چینلز نے ابھی ٹھیک سے نہیں کیا۔ چھوٹا چینل اصل میں یہیں جیتتا ہے۔", id:"Sedang naik, dan kanal besar belum menggarapnya serius. Di sinilah kanal kecil benar-benar menang.", de:"Es steigt, und die großen Kanäle haben es noch nicht richtig abgedeckt. Genau hier gewinnt ein kleiner Kanal.", ja:"伸びていて、大手がまだきちんと押さえていない。小さなチャンネルが本当に勝てるのはここです。", tr:"Yükseliyor ve büyük kanallar henüz doğru düzgün ele almadı. Küçük bir kanal asıl burada kazanır.", ko:"오르고 있는데 큰 채널들이 아직 제대로 다루지 않았습니다. 작은 채널이 진짜로 이기는 지점입니다.", fa:"در حال رشد است و کانال‌های بزرگ هنوز درست سراغش نرفته‌اند. کانال کوچک واقعاً همین‌جا برنده می‌شود.", uk:"Зростає, а великі канали ще толком не взялися. Саме тут малий канал реально виграє.", it:"Sta salendo e i canali grandi non l’hanno ancora coperto bene. È qui che un canale piccolo vince davvero.", pl:"Rośnie, a duże kanały jeszcze tego porządnie nie zrobiły. Tu właśnie mały kanał naprawdę wygrywa.", vi:"Đang lên, mà các kênh lớn chưa phủ tử tế. Đây mới là chỗ kênh nhỏ thật sự thắng." },
  ts_recent: { en:"You looked at", zh:"你看过", hi:"आपने देखा", es:"Has mirado", ar:"اطّلعت على", fr:"Tu as regardé", bn:"আপনি দেখেছিলেন", pt:"Viste", ru:"Ты смотрел", ur:"آپ نے دیکھا", id:"Kamu pernah lihat", de:"Du hast dir angesehen", ja:"見たもの", tr:"Baktıkların", ko:"살펴본 것", fa:"نگاه کردی به", uk:"Ти дивився", it:"Hai guardato", pl:"Oglądałeś", vi:"Bạn đã xem" },
  ts_badge: { en:"✦ AI-POWERED TREND DISCOVERY", zh:"✦ AI 驱动的趋势发现", hi:"✦ AI-संचालित ट्रेंड खोज", es:"✦ DESCUBRIMIENTO DE TENDENCIAS CON IA", ar:"✦ اكتشاف الاتجاهات بالذكاء الاصطناعي", fr:"✦ DÉCOUVERTE DE TENDANCES PAR IA", bn:"✦ AI-চালিত ট্রেন্ড আবিষ্কার", pt:"✦ DESCOBERTA DE TENDÊNCIAS COM IA", ru:"✦ ПОИСК ТРЕНДОВ С ИИ", ur:"✦ اے آئی سے ٹرینڈ کی دریافت", id:"✦ PENEMUAN TREN BERTENAGA AI", de:"✦ TRENDSUCHE MIT KI", ja:"✦ AIによるトレンド発見", tr:"✦ YAPAY ZEKÂ İLE TREND KEŞFİ", ko:"✦ AI 기반 트렌드 발견", fa:"✦ کشف ترند با هوش مصنوعی", uk:"✦ ПОШУК ТРЕНДІВ ІЗ ШІ", it:"✦ SCOPERTA DI TENDENZE CON IA", pl:"✦ ODKRYWANIE TRENDÓW Z AI", vi:"✦ KHÁM PHÁ XU HƯỚNG BẰNG AI" },
  ts_sub: { en:"Find what's trending before everyone else.", zh:"比所有人更早发现正在流行的东西。", hi:"जो ट्रेंड कर रहा है, उसे सबसे पहले पकड़िए।", es:"Descubre lo que está en tendencia antes que nadie.", ar:"اكتشف ما هو رائج قبل الجميع.", fr:"Repère ce qui monte avant tout le monde.", bn:"সবার আগে জেনে নিন কী ট্রেন্ড করছে।", pt:"Descobre o que está a dar antes de toda a gente.", ru:"Узнавай, что в тренде, раньше всех.", ur:"جو ٹرینڈ کر رہا ہے، اسے سب سے پہلے جانیں۔", id:"Temukan apa yang sedang tren sebelum orang lain.", de:"Finde vor allen anderen, was gerade läuft.", ja:"流行っているものを、誰よりも先に。", tr:"Ne yükseliyorsa herkesten önce gör.", ko:"남들보다 먼저 뜨는 것을 찾으세요.", fa:"زودتر از همه بفهم چه چیزی دارد ترند می‌شود.", uk:"Дізнавайся, що в тренді, раніше за всіх.", it:"Scopri cosa sta andando prima di tutti.", pl:"Znajdź to, co w trendach, zanim inni.", vi:"Tìm ra thứ đang lên trước mọi người." },
  ts_lede: { en:"Enter your niche and NovaClip AI finds rising trends, the gaps nobody has covered yet, and video ideas worth making.", zh:"输入你的领域，NovaClip AI 会找出正在上升的趋势、还没人做过的空白，以及值得做的视频点子。", hi:"अपनी निच लिखिए और NovaClip AI ऊपर जा रहे ट्रेंड, वे खाली जगहें जिन्हें किसी ने नहीं छुआ, और बनाने लायक वीडियो आइडिया ढूँढ देगा।", es:"Escribe tu nicho y la IA de NovaClip encuentra tendencias al alza, los huecos que nadie ha cubierto y vídeos que merece la pena hacer.", ar:"اكتب مجالك ويجد ذكاء NovaClip الاصطناعي الاتجاهات الصاعدة والفجوات التي لم يغطّها أحد وأفكار فيديو تستحق الصنع.", fr:"Écris ta niche et l’IA de NovaClip trouve les tendances qui montent, les trous que personne n’a comblés et des idées de vidéos qui valent le coup.", bn:"আপনার নিশ লিখুন, NovaClip AI খুঁজে দেবে উঠতি ট্রেন্ড, যেসব ফাঁক কেউ এখনও ভরেনি, আর বানানোর মতো ভিডিও আইডিয়া।", pt:"Escreve o teu nicho e a IA do NovaClip encontra tendências a subir, as lacunas que ninguém cobriu e ideias de vídeo que valem a pena.", ru:"Напиши свою нишу — и ИИ NovaClip найдёт растущие тренды, незакрытые пробелы и идеи видео, которые стоит снять.", ur:"اپنا نیچ لکھیں اور NovaClip کا AI اوپر جاتے ٹرینڈز، وہ خلا جو کسی نے پُر نہیں کیے، اور بنانے لائق ویڈیو آئیڈیاز ڈھونڈ دے گا۔", id:"Tulis nichemu dan AI NovaClip menemukan tren yang naik, celah yang belum digarap siapa pun, dan ide video yang layak dibuat.", de:"Schreib deine Nische auf, und die NovaClip-KI findet steigende Trends, die Lücken, die noch keiner gefüllt hat, und Videoideen, die sich lohnen.", ja:"ニッチを入力すると、NovaClipのAIが伸びているトレンド、まだ誰も埋めていない穴、そして作る価値のある動画案を見つけます。", tr:"Alanını yaz; NovaClip’in yapay zekâsı yükselen trendleri, kimsenin doldurmadığı boşlukları ve çekmeye değer video fikirlerini bulsun.", ko:"분야를 입력하면 NovaClip AI가 떠오르는 트렌드, 아직 아무도 다루지 않은 빈틈, 그리고 만들 가치가 있는 영상 아이디어를 찾아 줍니다.", fa:"حوزه‌ات را بنویس تا هوش مصنوعی NovaClip ترندهای در حال رشد، شکاف‌هایی که هنوز کسی پرشان نکرده، و ایده‌های ویدیویی ارزشمند را پیدا کند.", uk:"Напиши свою нішу — і ШІ NovaClip знайде тренди, що зростають, незакриті прогалини та ідеї відео, які варто зняти.", it:"Scrivi la tua nicchia e l’IA di NovaClip trova tendenze in crescita, i vuoti che nessuno ha coperto e idee video che vale la pena fare.", pl:"Wpisz swoją niszę, a AI NovaClip znajdzie rosnące trendy, luki, których nikt nie zapełnił, i pomysły na filmy warte zrobienia.", vi:"Nhập ngách của bạn và AI của NovaClip sẽ tìm xu hướng đang lên, những khoảng trống chưa ai lấp, và ý tưởng video đáng làm." },
  ts_scan: { en:"Scan for Trends", zh:"扫描趋势", hi:"ट्रेंड स्कैन करें", es:"Buscar tendencias", ar:"ابحث عن الاتجاهات", fr:"Scanner les tendances", bn:"ট্রেন্ড স্ক্যান করুন", pt:"Procurar tendências", ru:"Искать тренды", ur:"ٹرینڈز اسکین کریں", id:"Pindai Tren", de:"Trends scannen", ja:"トレンドをスキャン", tr:"Trendleri tara", ko:"트렌드 스캔", fa:"اسکن ترندها", uk:"Шукати тренди", it:"Cerca tendenze", pl:"Skanuj trendy", vi:"Quét xu hướng" },
  ts_hint: { en:"Press Enter or pick one below", zh:"按回车，或在下面挑一个", hi:"Enter दबाइए या नीचे से एक चुनिए", es:"Pulsa Intro o elige uno abajo", ar:"اضغط Enter أو اختر واحدًا بالأسفل", fr:"Appuie sur Entrée ou choisis ci-dessous", bn:"Enter চাপুন বা নিচ থেকে একটা বাছুন", pt:"Carrega em Enter ou escolhe um abaixo", ru:"Нажми Enter или выбери ниже", ur:"Enter دبائیں یا نیچے سے ایک چنیں", id:"Tekan Enter atau pilih salah satu di bawah", de:"Enter drücken oder unten eines wählen", ja:"Enterを押すか、下から選んでください", tr:"Enter’a bas ya da aşağıdan birini seç", ko:"Enter를 누르거나 아래에서 고르세요", fa:"Enter را بزن یا یکی از پایین انتخاب کن", uk:"Натисни Enter або обери нижче", it:"Premi Invio o scegline uno sotto", pl:"Naciśnij Enter albo wybierz poniżej", vi:"Nhấn Enter hoặc chọn một mục bên dưới" },
  ts_ai: { en:"✦ NovaClip AI trend analysis", zh:"✦ NovaClip AI 趋势分析", hi:"✦ NovaClip AI ट्रेंड विश्लेषण", es:"✦ Análisis de tendencias con IA de NovaClip", ar:"✦ تحليل الاتجاهات بذكاء NovaClip", fr:"✦ Analyse de tendances NovaClip IA", bn:"✦ NovaClip AI ট্রেন্ড বিশ্লেষণ", pt:"✦ Análise de tendências da IA NovaClip", ru:"✦ Анализ трендов ИИ NovaClip", ur:"✦ NovaClip AI ٹرینڈ تجزیہ", id:"✦ Analisis tren AI NovaClip", de:"✦ NovaClip-KI-Trendanalyse", ja:"✦ NovaClip AI トレンド分析", tr:"✦ NovaClip YZ trend analizi", ko:"✦ NovaClip AI 트렌드 분석", fa:"✦ تحلیل ترند هوش مصنوعی NovaClip", uk:"✦ Аналіз трендів ШІ NovaClip", it:"✦ Analisi tendenze IA NovaClip", pl:"✦ Analiza trendów AI NovaClip", vi:"✦ Phân tích xu hướng AI NovaClip" },
  ts_ai_ready: { en:"Ready", zh:"就绪", hi:"तैयार", es:"Listo", ar:"جاهز", fr:"Prêt", bn:"প্রস্তুত", pt:"Pronto", ru:"Готово", ur:"تیار", id:"Siap", de:"Bereit", ja:"準備完了", tr:"Hazır", ko:"준비됨", fa:"آماده", uk:"Готово", it:"Pronto", pl:"Gotowe", vi:"Sẵn sàng" },
  ts_ai_scanning: { en:"Scanning", zh:"扫描中", hi:"स्कैन हो रहा है", es:"Buscando", ar:"جارٍ الفحص", fr:"Analyse en cours", bn:"স্ক্যান হচ্ছে", pt:"A procurar", ru:"Сканирую", ur:"اسکین ہو رہا ہے", id:"Memindai", de:"Scannt", ja:"スキャン中", tr:"Taranıyor", ko:"스캔 중", fa:"در حال اسکن", uk:"Сканую", it:"Sto cercando", pl:"Skanuję", vi:"Đang quét" },
  ts_ai_done: { en:"Done", zh:"完成", hi:"हो गया", es:"Listo", ar:"تم", fr:"Terminé", bn:"সম্পন্ন", pt:"Feito", ru:"Готово", ur:"مکمل", id:"Selesai", de:"Fertig", ja:"完了", tr:"Bitti", ko:"완료", fa:"تمام", uk:"Готово", it:"Fatto", pl:"Gotowe", vi:"Xong" },
  ts_ai_error: { en:"Could not reach it", zh:"没能连上", hi:"पहुँच नहीं सके", es:"No se ha podido conectar", ar:"تعذّر الوصول", fr:"Injoignable", bn:"পৌঁছানো গেল না", pt:"Não foi possível chegar lá", ru:"Не удалось связаться", ur:"پہنچ نہیں سکے", id:"Tidak bisa dihubungi", de:"Nicht erreichbar", ja:"接続できません", tr:"Ulaşılamadı", ko:"연결 실패", fa:"نتوانستیم برسیم", uk:"Не вдалося зв’язатися", it:"Non raggiungibile", pl:"Brak połączenia", vi:"Không kết nối được" },
  ts_step1: { en:"Reading what is actually out there…", zh:"正在读取外面真实的情况……", hi:"असल में बाहर क्या है, पढ़ा जा रहा है…", es:"Leyendo lo que hay ahí fuera de verdad…", ar:"نقرأ ما هو موجود فعلًا…", fr:"Lecture de ce qui se passe vraiment…", bn:"বাইরে আসলে কী আছে, পড়া হচ্ছে…", pt:"A ler o que anda mesmo por aí…", ru:"Читаю, что происходит на самом деле…", ur:"اصل میں باہر کیا ہے، پڑھا جا رہا ہے…", id:"Membaca apa yang benar-benar ada di luar sana…", de:"Lese, was wirklich läuft…", ja:"実際に何が起きているかを読んでいます…", tr:"Dışarıda gerçekten ne var, okunuyor…", ko:"실제로 무슨 일이 있는지 읽는 중…", fa:"دارم می‌خوانم واقعاً بیرون چه خبر است…", uk:"Читаю, що відбувається насправді…", it:"Sto leggendo cosa gira davvero…", pl:"Czytam, co się naprawdę dzieje…", vi:"Đang đọc xem ngoài kia thật sự có gì…" },
  ts_step2: { en:"Working out what you could make from it…", zh:"正在想你能用它做出什么……", hi:"इससे आप क्या बना सकते हैं, सोचा जा रहा है…", es:"Pensando qué podrías hacer con eso…", ar:"نفكّر فيما يمكنك صنعه منها…", fr:"On cherche ce que tu pourrais en faire…", bn:"এ থেকে আপনি কী বানাতে পারেন ভাবা হচ্ছে…", pt:"A pensar no que podias fazer com isso…", ru:"Думаю, что из этого можно снять…", ur:"اس سے آپ کیا بنا سکتے ہیں، سوچا جا رہا ہے…", id:"Memikirkan apa yang bisa kamu buat dari itu…", de:"Überlege, was du daraus machen könntest…", ja:"そこから何が作れるかを考えています…", tr:"Bundan ne çekebilirsin, düşünülüyor…", ko:"그걸로 무엇을 만들 수 있을지 고민 중…", fa:"دارم فکر می‌کنم از این چه می‌شود ساخت…", uk:"Думаю, що з цього можна зняти…", it:"Sto cercando cosa potresti ricavarne…", pl:"Zastanawiam się, co możesz z tego zrobić…", vi:"Đang nghĩ bạn có thể làm gì từ đó…" },
  ts_step3: { en:"Putting it on the radar…", zh:"正在把它放上雷达……", hi:"इसे रडार पर रखा जा रहा है…", es:"Poniéndolo en el radar…", ar:"نضعها على الرادار…", fr:"Mise sur le radar…", bn:"রাডারে বসানো হচ্ছে…", pt:"A pô-lo no radar…", ru:"Ставлю на радар…", ur:"اسے ریڈار پر رکھا جا رہا ہے…", id:"Menaruhnya di radar…", de:"Setze es aufs Radar…", ja:"レーダーに載せています…", tr:"Radara yerleştiriliyor…", ko:"레이더에 올리는 중…", fa:"دارم روی رادار می‌گذارمش…", uk:"Ставлю на радар…", it:"Lo sto mettendo sul radar…", pl:"Umieszczam to na radarze…", vi:"Đang đưa lên radar…" },
  ts_radar: { en:"Trend Radar", zh:"趋势雷达", hi:"ट्रेंड रडार", es:"Radar de tendencias", ar:"رادار الاتجاهات", fr:"Radar des tendances", bn:"ট্রেন্ড রাডার", pt:"Radar de tendências", ru:"Радар трендов", ur:"ٹرینڈ ریڈار", id:"Radar Tren", de:"Trend-Radar", ja:"トレンドレーダー", tr:"Trend Radarı", ko:"트렌드 레이더", fa:"رادار ترند", uk:"Радар трендів", it:"Radar delle tendenze", pl:"Radar trendów", vi:"Radar xu hướng" },
  ts_radar_sub: { en:"Closer to the middle means moving faster. Click a signal to open it.", zh:"越靠近中心，说明上升越快。点一个信号打开它。", hi:"बीच के जितना पास, उतनी तेज़ी। खोलने के लिए किसी सिग्नल पर क्लिक करें।", es:"Cuanto más cerca del centro, más rápido sube. Haz clic en una señal para abrirla.", ar:"كلما اقترب من المركز كان أسرع صعودًا. انقر إشارة لفتحها.", fr:"Plus c’est près du centre, plus ça monte vite. Clique sur un signal pour l’ouvrir.", bn:"কেন্দ্রের যত কাছে, তত দ্রুত উঠছে। খুলতে একটা সিগন্যালে ক্লিক করুন।", pt:"Quanto mais perto do centro, mais depressa sobe. Clica num sinal para o abrir.", ru:"Чем ближе к центру, тем быстрее растёт. Нажми на сигнал, чтобы открыть.", ur:"مرکز کے جتنا قریب، اتنی تیزی۔ کھولنے کے لیے کسی سگنل پر کلک کریں۔", id:"Makin dekat ke tengah, makin cepat naik. Klik sinyal untuk membukanya.", de:"Je näher an der Mitte, desto schneller steigt es. Klick ein Signal an, um es zu öffnen.", ja:"中心に近いほど速く伸びています。信号をクリックすると開きます。", tr:"Merkeze ne kadar yakınsa o kadar hızlı yükseliyor. Açmak için bir sinyale tıkla.", ko:"가운데에 가까울수록 빠르게 오르는 중입니다. 신호를 클릭하면 열립니다.", fa:"هرچه به مرکز نزدیک‌تر، سریع‌تر در حال رشد. برای بازکردن روی یک سیگنال کلیک کن.", uk:"Що ближче до центру, то швидше зростає. Натисни на сигнал, щоб відкрити.", it:"Più è vicino al centro, più sale in fretta. Clicca un segnale per aprirlo.", pl:"Im bliżej środka, tym szybciej rośnie. Kliknij sygnał, żeby go otworzyć.", vi:"Càng gần tâm càng lên nhanh. Bấm vào một tín hiệu để mở." },
  ts_radar_idle: { en:"idle · waiting for a niche", zh:"待机 · 等待一个领域", hi:"निष्क्रिय · निच का इंतज़ार", es:"en espera · esperando un nicho", ar:"خامل · بانتظار مجال", fr:"en veille · en attente d’une niche", bn:"অলস · একটা নিশের অপেক্ষায়", pt:"inativo · à espera de um nicho", ru:"ожидание · нужна ниша", ur:"غیر فعال · نیچ کا انتظار", id:"diam · menunggu niche", de:"bereit · wartet auf eine Nische", ja:"待機中 · ニッチ待ち", tr:"boşta · bir alan bekleniyor", ko:"대기 중 · 분야를 기다리는 중", fa:"بی‌کار · منتظر یک حوزه", uk:"очікування · потрібна ніша", it:"in attesa · aspetto una nicchia", pl:"bezczynny · czekam na niszę", vi:"chờ · đang đợi một ngách" },
  ts_radar_scanning: { en:"sweeping…", zh:"扫描中……", hi:"स्वीप हो रहा है…", es:"barriendo…", ar:"يمسح…", fr:"balayage…", bn:"সুইপ হচ্ছে…", pt:"a varrer…", ru:"сканирование…", ur:"اسکین ہو رہا ہے…", id:"menyapu…", de:"scannt…", ja:"走査中…", tr:"taranıyor…", ko:"훑는 중…", fa:"در حال جاروب…", uk:"сканування…", it:"scansione…", pl:"omiatam…", vi:"đang quét…" },
  ts_radar_found: { en:"{n} signals in {q}", zh:"{q} 里有 {n} 个信号", hi:"{q} में {n} सिग्नल", es:"{n} señales en {q}", ar:"{n} إشارات في {q}", fr:"{n} signaux dans {q}", bn:"{q}-এ {n}টি সিগন্যাল", pt:"{n} sinais em {q}", ru:"Сигналов в {q}: {n}", ur:"{q} میں {n} سگنلز", id:"{n} sinyal di {q}", de:"{n} Signale in {q}", ja:"{q} に {n} 件の信号", tr:"{q} içinde {n} sinyal", ko:"{q}에서 신호 {n}개", fa:"{n} سیگنال در {q}", uk:"{n} сигналів у {q}", it:"{n} segnali in {q}", pl:"{n} sygnałów w {q}", vi:"{n} tín hiệu trong {q}" },
  ts_empty_h: { en:"Your trend radar is waiting.", zh:"你的趋势雷达在等着。", hi:"आपका ट्रेंड रडार इंतज़ार कर रहा है।", es:"Tu radar de tendencias está esperando.", ar:"رادار الاتجاهات ينتظرك.", fr:"Ton radar de tendances attend.", bn:"আপনার ট্রেন্ড রাডার অপেক্ষা করছে।", pt:"O teu radar de tendências está à espera.", ru:"Твой радар трендов ждёт.", ur:"آپ کا ٹرینڈ ریڈار انتظار کر رہا ہے۔", id:"Radar trenmu sedang menunggu.", de:"Dein Trend-Radar wartet.", ja:"トレンドレーダーが待っています。", tr:"Trend radarın bekliyor.", ko:"트렌드 레이더가 기다리고 있습니다.", fa:"رادار ترند تو منتظر است.", uk:"Твій радар трендів чекає.", it:"Il tuo radar delle tendenze sta aspettando.", pl:"Twój radar trendów czeka.", vi:"Radar xu hướng của bạn đang chờ." },
  ts_empty_p: { en:"Type a niche above to find out what is starting to rise.", zh:"在上面输入一个领域，看看什么正在开始上升。", hi:"ऊपर एक निच लिखिए और देखिए क्या ऊपर जाने लगा है।", es:"Escribe un nicho arriba para descubrir qué está empezando a subir.", ar:"اكتب مجالًا في الأعلى لتعرف ما بدأ يصعد.", fr:"Écris une niche au-dessus pour voir ce qui commence à monter.", bn:"উপরে একটা নিশ লিখুন, দেখুন কী উঠতে শুরু করেছে।", pt:"Escreve um nicho acima para descobrir o que está a começar a subir.", ru:"Напиши нишу выше — и узнай, что начинает расти.", ur:"اوپر ایک نیچ لکھیں اور دیکھیں کیا اوپر جانے لگا ہے۔", id:"Tulis niche di atas untuk tahu apa yang mulai naik.", de:"Schreib oben eine Nische hin, um zu sehen, was gerade anfängt zu steigen.", ja:"上にニッチを入力すると、伸び始めているものがわかります。", tr:"Yukarıya bir alan yaz, neyin yükselmeye başladığını gör.", ko:"위에 분야를 적으면 무엇이 떠오르기 시작했는지 알 수 있습니다.", fa:"بالا یک حوزه بنویس تا ببینی چه چیزی دارد بالا می‌آید.", uk:"Напиши нішу вище — і побачиш, що починає зростати.", it:"Scrivi una nicchia qui sopra per scoprire cosa sta iniziando a salire.", pl:"Wpisz niszę powyżej, żeby zobaczyć, co zaczyna rosnąć.", vi:"Gõ một ngách ở trên để xem điều gì đang bắt đầu lên." },
  st_trends_p: { en:"What is genuinely rising in your niche right now, read off live search results rather than remembered. Every card says why it is moving and one video you could make from it.", zh:"你所在领域现在真正在上升的东西，来自实时搜索结果而不是记忆。每张卡都会说明它为什么在涨，以及你能据此做的一个视频。", hi:"आपकी निच में अभी सचमुच क्या ऊपर जा रहा है — याद से नहीं, लाइव सर्च नतीजों से पढ़ा गया। हर कार्ड बताता है कि यह क्यों चल रहा है और आप इससे कौन-सा वीडियो बना सकते हैं।", es:"Lo que de verdad está subiendo en tu nicho ahora mismo, leído de resultados de búsqueda en vivo y no de memoria. Cada tarjeta dice por qué se mueve y un vídeo que podrías hacer con ello.", ar:"ما يصعد فعلًا في مجالك الآن، مقروءًا من نتائج بحث حيّة لا من الذاكرة. كل بطاقة تقول لماذا يتحرك وفيديو واحدًا يمكنك صنعه منه.", fr:"Ce qui monte vraiment dans ta niche en ce moment, lu sur des résultats de recherche en direct et non de mémoire. Chaque carte dit pourquoi ça bouge et une vidéo que tu pourrais en tirer.", bn:"আপনার নিশে এখন সত্যিই কী উঠছে — মুখস্থ নয়, লাইভ সার্চ ফলাফল থেকে পড়া। প্রতিটি কার্ড বলে কেন এটি বাড়ছে আর এ থেকে আপনি কোন ভিডিও বানাতে পারেন।", pt:"O que está mesmo a subir no teu nicho agora, lido de resultados de pesquisa em directo e não de memória. Cada cartão diz porque está a mexer e um vídeo que podias fazer com isso.", ru:"Что на самом деле растёт в твоей нише прямо сейчас — прочитано из живого поиска, а не по памяти. На каждой карточке написано, почему это движется и какое видео из этого сделать.", ur:"آپ کے نیچ میں اِس وقت واقعی کیا اوپر جا رہا ہے — یاد سے نہیں، لائیو سرچ نتائج سے پڑھا گیا۔ ہر کارڈ بتاتا ہے کہ یہ کیوں چل رہا ہے اور آپ اس سے کون سی ویڈیو بنا سکتے ہیں۔", id:"Apa yang benar-benar sedang naik di nichemu sekarang, dibaca dari hasil pencarian langsung, bukan dari ingatan. Tiap kartu menjelaskan kenapa itu bergerak dan satu video yang bisa kamu buat darinya.", de:"Was in deiner Nische gerade wirklich steigt — aus laufenden Suchergebnissen gelesen, nicht aus dem Gedächtnis. Jede Karte sagt, warum es sich bewegt, und ein Video, das du daraus machen könntest.", ja:"あなたのニッチで今ほんとうに伸びているもの。記憶ではなく、その場の検索結果から読み取ります。各カードには伸びている理由と、そこから作れる動画がひとつ書かれています。", tr:"Senin alanında şu anda gerçekten yükselen ne varsa — hatırlanan değil, canlı arama sonuçlarından okunan. Her kart neden hareketlendiğini ve bundan çekebileceğin bir videoyu söyler.", ko:"당신의 분야에서 지금 진짜로 떠오르는 것 — 기억이 아니라 실시간 검색 결과에서 읽어 옵니다. 카드마다 왜 오르는지와 그것으로 만들 수 있는 영상 하나를 알려 줍니다.", fa:"آنچه همین حالا واقعاً در حوزهٔ تو بالا می‌آید — نه از حافظه، بلکه از نتایج جست‌وجوی زنده. هر کارت می‌گوید چرا در حال رشد است و چه ویدیویی می‌توانی از آن بسازی.", uk:"Що справді зростає у твоїй ніші просто зараз — прочитано з живого пошуку, а не з пам’яті. Кожна картка каже, чому це рухається і яке відео з цього зробити.", it:"Cosa sta davvero salendo nella tua nicchia adesso, letto da risultati di ricerca dal vivo e non a memoria. Ogni scheda dice perché si muove e un video che potresti ricavarne.", pl:"Co naprawdę rośnie w twojej niszy właśnie teraz — odczytane z żywych wyników wyszukiwania, nie z pamięci. Każda karta mówi, dlaczego to się rusza i jaki film możesz z tego zrobić.", vi:"Điều gì thật sự đang lên trong ngách của bạn ngay lúc này — đọc từ kết quả tìm kiếm trực tiếp chứ không phải trí nhớ. Mỗi thẻ nói vì sao nó đang lên và một video bạn có thể làm từ đó." },
  st_niche: { en:"Your niche, in your own words", zh:"用你自己的话写你的领域", hi:"आपकी निच, अपने शब्दों में", es:"Tu nicho, con tus palabras", ar:"مجالك، بكلماتك أنت", fr:"Ta niche, avec tes mots", bn:"আপনার নিশ, নিজের ভাষায়", pt:"O teu nicho, por palavras tuas", ru:"Твоя ниша, своими словами", ur:"آپ کا نیچ، اپنے الفاظ میں", id:"Nichemu, dengan kata-katamu", de:"Deine Nische, in deinen Worten", ja:"あなたのニッチを自分の言葉で", tr:"Kendi cümlenle alanın", ko:"내 분야를 내 말로", fa:"حوزه‌ات، به زبان خودت", uk:"Твоя ніша, своїми словами", it:"La tua nicchia, con parole tue", pl:"Twoja nisza, własnymi słowami", vi:"Ngách của bạn, theo lời bạn" },
  st_niche_ph: { en:"mechanical keyboards, not just \"tech\"", zh:"机械键盘，而不只是“科技”", hi:"मैकेनिकल कीबोर्ड, सिर्फ़ “टेक” नहीं", es:"teclados mecánicos, no solo «tecnología»", ar:"لوحات المفاتيح الميكانيكية، لا «التقنية» فحسب", fr:"claviers mécaniques, pas juste «\u00a0tech\u00a0»", bn:"মেকানিক্যাল কিবোর্ড, শুধু “টেক” নয়", pt:"teclados mecânicos, não só «tecnologia»", ru:"механические клавиатуры, а не просто «техника»", ur:"میکینیکل کی بورڈز، صرف ”ٹیک“ نہیں", id:"keyboard mekanik, bukan sekadar \"teknologi\"", de:"mechanische Tastaturen, nicht bloß „Technik“", ja:"「テック」ではなく、メカニカルキーボード", tr:"sadece “teknoloji” değil, mekanik klavyeler", ko:"그냥 ‘테크’가 아니라 기계식 키보드", fa:"کیبورد مکانیکی، نه فقط «فناوری»", uk:"механічні клавіатури, а не просто «техніка»", it:"tastiere meccaniche, non solo «tech»", pl:"klawiatury mechaniczne, nie samo „tech”", vi:"bàn phím cơ, không chỉ “công nghệ”" },
  st_when: { en:"How recent", zh:"多近的范围", hi:"कितना हालिया", es:"Cómo de reciente", ar:"ما مدى حداثته", fr:"Sur quelle période", bn:"কত সাম্প্রতিক", pt:"Quão recente", ru:"За какой срок", ur:"کتنا حالیہ", id:"Seberapa baru", de:"Wie aktuell", ja:"どのくらい最近", tr:"Ne kadar yeni", ko:"얼마나 최근", fa:"چقدر تازه", uk:"За який період", it:"Quanto recente", pl:"Jak świeże", vi:"Gần đây cỡ nào" },
  st_when_week: { en:"This week", zh:"本周", hi:"इस हफ़्ते", es:"Esta semana", ar:"هذا الأسبوع", fr:"Cette semaine", bn:"এই সপ্তাহে", pt:"Esta semana", ru:"На этой неделе", ur:"اس ہفتے", id:"Minggu ini", de:"Diese Woche", ja:"今週", tr:"Bu hafta", ko:"이번 주", fa:"این هفته", uk:"Цього тижня", it:"Questa settimana", pl:"W tym tygodniu", vi:"Tuần này" },
  st_when_month: { en:"This month", zh:"本月", hi:"इस महीने", es:"Este mes", ar:"هذا الشهر", fr:"Ce mois-ci", bn:"এই মাসে", pt:"Este mês", ru:"В этом месяце", ur:"اس مہینے", id:"Bulan ini", de:"Diesen Monat", ja:"今月", tr:"Bu ay", ko:"이번 달", fa:"این ماه", uk:"Цього місяця", it:"Questo mese", pl:"W tym miesiącu", vi:"Tháng này" },
  st_when_season: { en:"Last three months", zh:"最近三个月", hi:"पिछले तीन महीने", es:"Últimos tres meses", ar:"آخر ثلاثة أشهر", fr:"Ces trois derniers mois", bn:"গত তিন মাস", pt:"Últimos três meses", ru:"Последние три месяца", ur:"پچھلے تین ماہ", id:"Tiga bulan terakhir", de:"Letzte drei Monate", ja:"直近3か月", tr:"Son üç ay", ko:"최근 세 달", fa:"سه ماه گذشته", uk:"Останні три місяці", it:"Ultimi tre mesi", pl:"Ostatnie trzy miesiące", vi:"Ba tháng qua" },
  st_size: { en:"Your channel", zh:"你的频道", hi:"आपका चैनल", es:"Tu canal", ar:"قناتك", fr:"Ta chaîne", bn:"আপনার চ্যানেল", pt:"O teu canal", ru:"Твой канал", ur:"آپ کا چینل", id:"Kanalmu", de:"Dein Kanal", ja:"あなたのチャンネル", tr:"Kanalın", ko:"내 채널", fa:"کانال تو", uk:"Твій канал", it:"Il tuo canale", pl:"Twój kanał", vi:"Kênh của bạn" },
  st_size_small: { en:"Small — only what I can reach", zh:"小频道——只要我够得着的", hi:"छोटा — वही जो मैं पहुँच सकूँ", es:"Pequeño: solo lo que puedo alcanzar", ar:"صغيرة — فقط ما يمكنني بلوغه", fr:"Petite — seulement ce que je peux atteindre", bn:"ছোট — যা আমি ছুঁতে পারি কেবল তাই", pt:"Pequeno — só o que consigo alcançar", ru:"Маленький — только то, до чего дотянусь", ur:"چھوٹا — صرف وہ جو میں پہنچ سکوں", id:"Kecil — hanya yang bisa kuraih", de:"Klein — nur, was ich erreichen kann", ja:"小さい — 手の届くものだけ", tr:"Küçük — sadece ulaşabileceklerim", ko:"작음 — 내가 닿을 수 있는 것만", fa:"کوچک — فقط آنچه در دسترسم است", uk:"Малий — лише те, до чого дотягнуся", it:"Piccolo — solo ciò che posso raggiungere", pl:"Mały — tylko to, co osiągalne", vi:"Nhỏ — chỉ những gì tôi với tới được" },
  st_size_any: { en:"Any size", zh:"任何规模", hi:"कोई भी आकार", es:"Cualquier tamaño", ar:"أي حجم", fr:"Peu importe la taille", bn:"যেকোনো আকার", pt:"Qualquer tamanho", ru:"Любого размера", ur:"کوئی بھی سائز", id:"Ukuran apa saja", de:"Egal wie groß", ja:"規模を問わない", tr:"Her boyut", ko:"크기 상관없이", fa:"هر اندازه", uk:"Будь-який розмір", it:"Qualsiasi dimensione", pl:"Dowolny rozmiar", vi:"Cỡ nào cũng được" },
  st_scan: { en:"Scan my niche", zh:"扫描我的领域", hi:"मेरी निच स्कैन करें", es:"Escanear mi nicho", ar:"افحص مجالي", fr:"Scanner ma niche", bn:"আমার নিশ স্ক্যান করুন", pt:"Analisar o meu nicho", ru:"Сканировать мою нишу", ur:"میرا نیچ اسکین کریں", id:"Pindai nicheku", de:"Meine Nische scannen", ja:"自分のニッチをスキャン", tr:"Alanımı tara", ko:"내 분야 스캔", fa:"حوزه‌ام را اسکن کن", uk:"Сканувати мою нішу", it:"Scansiona la mia nicchia", pl:"Przeskanuj moją niszę", vi:"Quét ngách của tôi" },
  st_scanning: { en:"Reading what is out there…", zh:"正在读取外面的情况……", hi:"जो बाहर है वह पढ़ा जा रहा है…", es:"Leyendo lo que hay ahí fuera…", ar:"نقرأ ما هو موجود…", fr:"Lecture de ce qui se passe…", bn:"বাইরে কী আছে পড়া হচ্ছে…", pt:"A ler o que anda por aí…", ru:"Читаю, что происходит…", ur:"جو باہر ہے وہ پڑھا جا رہا ہے…", id:"Membaca apa yang ada di luar sana…", de:"Lese, was da draußen los ist…", ja:"外の様子を読んでいます…", tr:"Dışarıda ne var, okunuyor…", ko:"바깥 상황을 읽는 중…", fa:"دارم می‌خوانم بیرون چه خبر است…", uk:"Читаю, що відбувається…", it:"Sto leggendo cosa gira…", pl:"Czytam, co się dzieje…", vi:"Đang đọc xem ngoài kia có gì…" },
  st_scan_need: { en:"Type your niche first — the narrower the better.", zh:"先写下你的领域——越具体越好。", hi:"पहले अपनी निच लिखें — जितनी सटीक, उतना बेहतर।", es:"Escribe primero tu nicho: cuanto más concreto, mejor.", ar:"اكتب مجالك أولًا — كلما كان أضيق كان أفضل.", fr:"Écris d’abord ta niche : plus c’est précis, mieux c’est.", bn:"আগে আপনার নিশ লিখুন — যত সুনির্দিষ্ট তত ভালো।", pt:"Escreve primeiro o teu nicho — quanto mais específico, melhor.", ru:"Сначала напиши свою нишу — чем уже, тем лучше.", ur:"پہلے اپنا نیچ لکھیں — جتنا مخصوص، اتنا بہتر۔", id:"Tulis nichemu dulu — makin spesifik makin bagus.", de:"Schreib zuerst deine Nische — je enger, desto besser.", ja:"まずニッチを書いてください。狭いほど良い結果になります。", tr:"Önce alanını yaz — ne kadar darsa o kadar iyi.", ko:"먼저 분야를 적어 주세요 — 좁을수록 좋습니다.", fa:"اول حوزه‌ات را بنویس — هرچه دقیق‌تر، بهتر.", uk:"Спершу напиши свою нішу — що вужча, то краще.", it:"Scrivi prima la tua nicchia: più è stretta, meglio è.", pl:"Najpierw wpisz swoją niszę — im węższa, tym lepiej.", vi:"Hãy gõ ngách của bạn trước — càng hẹp càng tốt." },
  st_no_ai: { en:"The AI helper did not load on this page.", zh:"这个页面上的 AI 助手没有加载。", hi:"इस पेज पर AI हेल्पर लोड नहीं हुआ।", es:"El ayudante de IA no se ha cargado en esta página.", ar:"لم يُحمّل مساعد الذكاء الاصطناعي في هذه الصفحة.", fr:"L’assistant IA ne s’est pas chargé sur cette page.", bn:"এই পেজে AI সহায়ক লোড হয়নি।", pt:"O ajudante de IA não carregou nesta página.", ru:"ИИ-помощник не загрузился на этой странице.", ur:"اس صفحے پر AI مددگار لوڈ نہیں ہوا۔", id:"Asisten AI tidak termuat di halaman ini.", de:"Der KI-Helfer wurde auf dieser Seite nicht geladen.", ja:"このページでAIヘルパーが読み込まれませんでした。", tr:"Bu sayfada YZ yardımcısı yüklenmedi.", ko:"이 페이지에서 AI 도우미가 로드되지 않았습니다.", fa:"دستیار هوش مصنوعی در این صفحه بارگذاری نشد.", uk:"ШІ-помічник не завантажився на цій сторінці.", it:"L’assistente IA non si è caricato su questa pagina.", pl:"Pomocnik AI nie wczytał się na tej stronie.", vi:"Trợ lý AI chưa tải được trên trang này." },
  st_no_reach: { en:"Could not reach the AI. Check your connection.", zh:"无法连接 AI。检查一下网络。", hi:"AI तक नहीं पहुँच सके। अपना कनेक्शन देखें।", es:"No se ha podido contactar con la IA. Revisa tu conexión.", ar:"تعذّر الوصول إلى الذكاء الاصطناعي. تحقّق من اتصالك.", fr:"Impossible de joindre l’IA. Vérifie ta connexion.", bn:"AI-তে পৌঁছানো গেল না। সংযোগ দেখুন।", pt:"Não foi possível chegar à IA. Verifica a tua ligação.", ru:"Не удалось связаться с ИИ. Проверь соединение.", ur:"AI تک نہیں پہنچ سکے۔ اپنا کنکشن دیکھیں۔", id:"Tidak bisa menghubungi AI. Periksa koneksimu.", de:"Die KI war nicht erreichbar. Prüf deine Verbindung.", ja:"AIに接続できませんでした。通信を確認してください。", tr:"YZ’ye ulaşılamadı. Bağlantını kontrol et.", ko:"AI에 연결하지 못했습니다. 연결을 확인하세요.", fa:"به هوش مصنوعی نرسیدیم. اتصالت را بررسی کن.", uk:"Не вдалося дістатися до ШІ. Перевір з’єднання.", it:"Non sono riuscito a raggiungere l’IA. Controlla la connessione.", pl:"Nie udało się połączyć z AI. Sprawdź połączenie.", vi:"Không kết nối được tới AI. Kiểm tra kết nối của bạn." },
  st_scan_shape: { en:"The AI answered in a shape this panel could not read.", zh:"AI 返回的格式这个面板读不了。", hi:"AI ने ऐसे रूप में जवाब दिया जिसे यह पैनल पढ़ नहीं सका।", es:"La IA respondió en un formato que este panel no ha podido leer.", ar:"ردّ الذكاء الاصطناعي بشكل لم تستطع هذه اللوحة قراءته.", fr:"L’IA a répondu dans un format que ce panneau n’a pas su lire.", bn:"AI এমন গঠনে উত্তর দিয়েছে যা এই প্যানেল পড়তে পারেনি।", pt:"A IA respondeu num formato que este painel não conseguiu ler.", ru:"ИИ ответил в форме, которую эта панель не смогла прочитать.", ur:"AI نے ایسی شکل میں جواب دیا جو یہ پینل نہیں پڑھ سکا۔", id:"AI menjawab dalam bentuk yang tidak bisa dibaca panel ini.", de:"Die KI hat in einer Form geantwortet, die dieses Feld nicht lesen konnte.", ja:"AIの返答の形式をこのパネルが読み取れませんでした。", tr:"YZ, bu panelin okuyamadığı bir biçimde yanıt verdi.", ko:"AI가 이 패널이 읽을 수 없는 형식으로 답했습니다.", fa:"هوش مصنوعی به شکلی پاسخ داد که این پنل نتوانست بخواند.", uk:"ШІ відповів у формі, яку ця панель не змогла прочитати.", it:"L’IA ha risposto in un formato che questo pannello non ha saputo leggere.", pl:"AI odpowiedziało w formacie, którego ten panel nie odczytał.", vi:"AI trả lời ở dạng mà bảng này không đọc được." },
  st_scan_none: { en:"Nothing came back for that niche. Try wording it differently.", zh:"这个领域没有返回结果。换个说法试试。", hi:"उस निच के लिए कुछ नहीं आया। इसे दूसरे शब्दों में लिखकर देखें।", es:"No ha vuelto nada para ese nicho. Prueba a decirlo de otra forma.", ar:"لم يعد شيء لهذا المجال. جرّب صياغته بطريقة أخرى.", fr:"Rien n’est revenu pour cette niche. Essaie de la formuler autrement.", bn:"সেই নিশের জন্য কিছুই আসেনি। অন্যভাবে লিখে দেখুন।", pt:"Não voltou nada para esse nicho. Tenta escrevê-lo de outra maneira.", ru:"По этой нише ничего не вернулось. Попробуй сформулировать иначе.", ur:"اس نیچ کے لیے کچھ نہیں آیا۔ اسے مختلف الفاظ میں لکھ کر دیکھیں۔", id:"Tidak ada yang kembali untuk niche itu. Coba tulis dengan kata lain.", de:"Für diese Nische kam nichts zurück. Formulier sie mal anders.", ja:"そのニッチでは何も返りませんでした。言い方を変えてみてください。", tr:"Bu alan için bir şey dönmedi. Farklı ifade etmeyi dene.", ko:"그 분야로는 아무것도 오지 않았습니다. 다르게 표현해 보세요.", fa:"برای آن حوزه چیزی برنگشت. جور دیگری بنویسش.", uk:"За цією нішею нічого не повернулося. Спробуй сформулювати інакше.", it:"Per quella nicchia non è tornato nulla. Prova a dirlo in altro modo.", pl:"Dla tej niszy nic nie wróciło. Spróbuj ująć to inaczej.", vi:"Không có gì trả về cho ngách đó. Thử diễn đạt khác xem." },
  st_scan_ok: { en:"{n} found, and this one counts towards a certificate.", zh:"找到 {n} 条，这一次也计入证书。", hi:"{n} मिले, और यह सर्टिफिकेट में गिना जाता है।", es:"{n} encontrados, y este cuenta para un certificado.", ar:"وجدنا {n}، وهذه المرة تُحتسب للشهادة.", fr:"{n} trouvés, et celui-ci compte pour un certificat.", bn:"{n}টি পাওয়া গেছে, আর এটি সার্টিফিকেটে গণ্য হয়।", pt:"{n} encontrados, e este conta para um certificado.", ru:"Найдено {n}, и этот скан засчитан к сертификату.", ur:"{n} ملے، اور یہ سرٹیفکیٹ میں شمار ہوتا ہے۔", id:"{n} ditemukan, dan yang ini dihitung untuk sertifikat.", de:"{n} gefunden, und dieser zählt für ein Zertifikat.", ja:"{n}件見つかりました。今回の分は証明書に加算されます。", tr:"{n} bulundu ve bu tarama sertifikaya sayılıyor.", ko:"{n}개를 찾았고, 이번 스캔은 수료증에 반영됩니다.", fa:"{n} مورد پیدا شد، و این یکی برای گواهی حساب می‌شود.", uk:"Знайдено {n}, і це зараховано до сертифіката.", it:"{n} trovati, e questa scansione conta per un certificato.", pl:"Znaleziono {n}, a to skanowanie liczy się do certyfikatu.", vi:"Tìm được {n}, và lần quét này được tính cho chứng chỉ." },
  st_to_ideas: { en:"Turn into ideas", zh:"变成灵感", hi:"आइडिया में बदलें", es:"Convertir en ideas", ar:"حوّلها إلى أفكار", fr:"En faire des idées", bn:"আইডিয়ায় বদলান", pt:"Transformar em ideias", ru:"Превратить в идеи", ur:"آئیڈیاز میں بدلیں", id:"Jadikan ide", de:"In Ideen verwandeln", ja:"アイデアにする", tr:"Fikre çevir", ko:"아이디어로 바꾸기", fa:"تبدیل به ایده", uk:"Перетворити на ідеї", it:"Trasforma in idee", pl:"Zamień w pomysły", vi:"Biến thành ý tưởng" },
  st_to_script: { en:"Write a script", zh:"写脚本", hi:"स्क्रिप्ट लिखें", es:"Escribir un guion", ar:"اكتب نصًّا", fr:"Écrire un script", bn:"স্ক্রিপ্ট লিখুন", pt:"Escrever um guião", ru:"Написать сценарий", ur:"اسکرپٹ لکھیں", id:"Tulis naskah", de:"Ein Skript schreiben", ja:"台本を書く", tr:"Senaryo yaz", ko:"대본 쓰기", fa:"نوشتن فیلمنامه", uk:"Написати сценарій", it:"Scrivi uno script", pl:"Napisz scenariusz", vi:"Viết kịch bản" },
  st_copied: { en:"Copied.", zh:"已复制。", hi:"कॉपी हो गया।", es:"Copiado.", ar:"تم النسخ.", fr:"Copié.", bn:"কপি হয়েছে।", pt:"Copiado.", ru:"Скопировано.", ur:"کاپی ہو گیا۔", id:"Tersalin.", de:"Kopiert.", ja:"コピーしました。", tr:"Kopyalandı.", ko:"복사했습니다.", fa:"کپی شد.", uk:"Скопійовано.", it:"Copiato.", pl:"Skopiowano.", vi:"Đã sao chép." },
  st_sources: { en:"Read from:", zh:"读取自：", hi:"इनसे पढ़ा गया:", es:"Leído de:", ar:"مقروء من:", fr:"Lu sur\u00a0:", bn:"যেখান থেকে পড়া:", pt:"Lido de:", ru:"Прочитано из:", ur:"یہاں سے پڑھا گیا:", id:"Dibaca dari:", de:"Gelesen aus:", ja:"参照元:", tr:"Şuradan okundu:", ko:"출처:", fa:"خوانده‌شده از:", uk:"Прочитано з:", it:"Letto da:", pl:"Odczytane z:", vi:"Đọc từ:" },
  ui_novacoins: { en:"NovaCoins", zh:"Nova 币", hi:"नोवाकॉइन्स", es:"NovaMonedas", ar:"عملات نوفا", fr:"NovaPièces", bn:"নোভাকয়েন", pt:"NovaMoedas", ru:"НоваМонеты", ur:"نووا کوائنز", id:"NovaKoin", de:"NovaMünzen", ja:"ノヴァコイン", tr:"NovaJeton", ko:"노바코인", fa:"نوواکوین", uk:"НоваМонети", it:"NovaMonete", pl:"NovaMonety", vi:"NovaXu" },
  ui_skin_none: { en:"Cyber theme — none", zh:"赛博主题 — 无", hi:"साइबर थीम — कोई नहीं", es:"Tema cyber — ninguno", ar:"ثيم سايبر — بدون", fr:"Thème cyber — aucun", bn:"সাইবার থিম — কোনোটি নয়", pt:"Tema cyber — nenhum", ru:"Кибертема — нет", ur:"سائبر تھیم — کوئی نہیں", id:"Tema cyber — tidak ada", de:"Cyber-Theme — keines", ja:"サイバーテーマ — なし", tr:"Cyber tema — yok", ko:"사이버 테마 — 없음", fa:"پوسته سایبری — هیچ‌کدام", uk:"Кібертема — немає", it:"Tema cyber — nessuno", pl:"Motyw cyber — brak", vi:"Chủ đề cyber — không" },
  /* THE TWELVE CYBER THEME NAMES.
     Left in English when the rest of the picker was translated, on the
     reasoning that they are names like NovaCoins. They are not: NovaCoins is
     the product calling its own thing something, and these are descriptions —
     a void, a blood moon, a solar flare — which is why somebody reading the
     list wants them in their own language.

     The genre words stay recognisable rather than being forced into a native
     equivalent that does not exist: cyberpunk, synthwave, vaporwave, matrix,
     holo, xenon and titanium are loanwords nearly everywhere, transliterated
     where the script changes. What gets translated is the half that means
     something — Bloodmoon, Midnight, Ghost, Sunset, Void.

     The English in NC_SKINS stays as the fallback, for the moment before this
     table is reachable and for a language with no entry. */
  skin_void: { en:"Void Cyber", zh:"虚空赛博", hi:"वॉइड साइबर", es:"Cyber Vacío", ar:"سايبر الفراغ", fr:"Cyber Néant", bn:"ভয়েড সাইবার", pt:"Cyber Vazio", ru:"Кибер-пустота", ur:"وائیڈ سائبر", id:"Cyber Hampa", de:"Cyber-Leere", ja:"ヴォイド・サイバー", tr:"Boşluk Cyber", ko:"보이드 사이버", fa:"سایبر تهی", uk:"Кібер-порожнеча", it:"Cyber Vuoto", pl:"Cyber Pustka", vi:"Cyber Hư Không" },
  skin_cyberpunk: { en:"Neo Cyberpunk", zh:"新赛博朋克", hi:"नियो साइबरपंक", es:"Neo Cyberpunk", ar:"سايبربانك الجديد", fr:"Néo Cyberpunk", bn:"নিও সাইবারপাঙ্ক", pt:"Neo Cyberpunk", ru:"Нео-киберпанк", ur:"نیو سائبرپنک", id:"Neo Cyberpunk", de:"Neo-Cyberpunk", ja:"ネオ・サイバーパンク", tr:"Neo Cyberpunk", ko:"네오 사이버펑크", fa:"نئو سایبرپانک", uk:"Нео-кіберпанк", it:"Neo Cyberpunk", pl:"Neo Cyberpunk", vi:"Neo Cyberpunk" },
  skin_synthwave: { en:"80s Synthwave", zh:"80年代合成波", hi:"80s सिंथवेव", es:"Synthwave de los 80", ar:"سينث ويف الثمانينات", fr:"Synthwave 80s", bn:"৮০-এর সিন্থওয়েভ", pt:"Synthwave anos 80", ru:"Синтвейв 80-х", ur:"80 کی دہائی کا سنتھ ویو", id:"Synthwave 80-an", de:"80er-Synthwave", ja:"80年代シンセウェイヴ", tr:"80ler Synthwave", ko:"80년대 신스웨이브", fa:"سینث‌ویو دهه ۸۰", uk:"Синтвейв 80-х", it:"Synthwave anni 80", pl:"Synthwave lat 80.", vi:"Synthwave thập niên 80" },
  skin_matrix: { en:"Matrix Terminal", zh:"矩阵终端", hi:"मैट्रिक्स टर्मिनल", es:"Terminal Matrix", ar:"طرفية ماتريكس", fr:"Terminal Matrix", bn:"ম্যাট্রিক্স টার্মিনাল", pt:"Terminal Matrix", ru:"Терминал Матрицы", ur:"میٹرکس ٹرمینل", id:"Terminal Matrix", de:"Matrix-Terminal", ja:"マトリックス・ターミナル", tr:"Matrix Terminali", ko:"매트릭스 터미널", fa:"ترمینال ماتریکس", uk:"Термінал Матриці", it:"Terminale Matrix", pl:"Terminal Matrix", vi:"Terminal Matrix" },
  skin_crimson: { en:"Bloodmoon Protocol", zh:"血月协议", hi:"ब्लडमून प्रोटोकॉल", es:"Protocolo Luna de Sangre", ar:"بروتوكول قمر الدم", fr:"Protocole Lune de Sang", bn:"ব্লাডমুন প্রোটোকল", pt:"Protocolo Lua de Sangue", ru:"Протокол «Кровавая луна»", ur:"بلڈ مون پروٹوکول", id:"Protokol Bulan Darah", de:"Blutmond-Protokoll", ja:"ブラッドムーン・プロトコル", tr:"Kanlı Ay Protokolü", ko:"블러드문 프로토콜", fa:"پروتکل ماه خونین", uk:"Протокол «Кривавий місяць»", it:"Protocollo Luna di Sangue", pl:"Protokół Krwawy Księżyc", vi:"Giao thức Trăng Máu" },
  skin_glitch: { en:"Chromatic Holo", zh:"彩色全息", hi:"क्रोमैटिक होलो", es:"Holo Cromático", ar:"هولو لوني", fr:"Holo Chromatique", bn:"ক্রোমাটিক হোলো", pt:"Holo Cromático", ru:"Хроматический холо", ur:"کرومیٹک ہولو", id:"Holo Kromatik", de:"Chromatisches Holo", ja:"クロマティック・ホロ", tr:"Kromatik Holo", ko:"크로매틱 홀로", fa:"هولوی رنگین", uk:"Хроматичний холо", it:"Holo Cromatico", pl:"Chromatyczne Holo", vi:"Holo Sắc Màu" },
  skin_midnight: { en:"Midnight Electric", zh:"午夜电光", hi:"मिडनाइट इलेक्ट्रिक", es:"Eléctrico Medianoche", ar:"كهرباء منتصف الليل", fr:"Électrique Minuit", bn:"মিডনাইট ইলেকট্রিক", pt:"Elétrico Meia-Noite", ru:"Полночный электрик", ur:"مڈنائٹ الیکٹرک", id:"Elektrik Tengah Malam", de:"Mitternachts-Elektrik", ja:"ミッドナイト・エレクトリック", tr:"Gece Yarısı Elektrik", ko:"미드나이트 일렉트릭", fa:"الکتریک نیمه‌شب", uk:"Опівнічний електрик", it:"Elettrico Mezzanotte", pl:"Elektryczna Północ", vi:"Điện Nửa Đêm" },
  skin_sunset: { en:"Neon Sunset", zh:"霓虹日落", hi:"नियॉन सनसेट", es:"Atardecer Neón", ar:"غروب النيون", fr:"Coucher de Soleil Néon", bn:"নিয়ন সানসেট", pt:"Pôr do Sol Néon", ru:"Неоновый закат", ur:"نیون سن سیٹ", id:"Senja Neon", de:"Neon-Sonnenuntergang", ja:"ネオン・サンセット", tr:"Neon Gün Batımı", ko:"네온 선셋", fa:"غروب نئونی", uk:"Неоновий захід", it:"Tramonto Neon", pl:"Neonowy Zachód", vi:"Hoàng Hôn Neon" },
  skin_solar: { en:"Solar Flare", zh:"太阳耀斑", hi:"सोलर फ्लेयर", es:"Llamarada Solar", ar:"توهج شمسي", fr:"Éruption Solaire", bn:"সোলার ফ্লেয়ার", pt:"Erupção Solar", ru:"Солнечная вспышка", ur:"شمسی شعلہ", id:"Suar Surya", de:"Sonneneruption", ja:"ソーラーフレア", tr:"Güneş Patlaması", ko:"솔라 플레어", fa:"شراره خورشیدی", uk:"Сонячний спалах", it:"Brillamento Solare", pl:"Rozbłysk Słoneczny", vi:"Bùng Nổ Mặt Trời" },
  skin_vaporwave: { en:"Vaporwave Dream", zh:"蒸汽波之梦", hi:"वेपरवेव ड्रीम", es:"Sueño Vaporwave", ar:"حلم فيبورويف", fr:"Rêve Vaporwave", bn:"ভেপারওয়েভ ড্রিম", pt:"Sonho Vaporwave", ru:"Вейпорвейв-мечта", ur:"ویپر ویو ڈریم", id:"Mimpi Vaporwave", de:"Vaporwave-Traum", ja:"ヴェイパーウェイヴ・ドリーム", tr:"Vaporwave Rüyası", ko:"베이퍼웨이브 드림", fa:"رویای ویپورویو", uk:"Вейпорвейв-мрія", it:"Sogno Vaporwave", pl:"Sen Vaporwave", vi:"Giấc Mơ Vaporwave" },
  skin_biopunk: { en:"Bio-Xenon", zh:"生物氙", hi:"बायो-ज़ेनॉन", es:"Bio-Xenón", ar:"بايو-زينون", fr:"Bio-Xénon", bn:"বায়ো-জেনন", pt:"Bio-Xénon", ru:"Био-ксенон", ur:"بائیو زینون", id:"Bio-Xenon", de:"Bio-Xenon", ja:"バイオ・キセノン", tr:"Biyo-Ksenon", ko:"바이오 제논", fa:"بایو-زنون", uk:"Біо-ксенон", it:"Bio-Xeno", pl:"Bio-Ksenon", vi:"Bio-Xenon" },
  skin_stealth: { en:"Ghost Titanium", zh:"幽灵钛", hi:"घोस्ट टाइटेनियम", es:"Titanio Fantasma", ar:"تيتانيوم شبحي", fr:"Titane Fantôme", bn:"ঘোস্ট টাইটানিয়াম", pt:"Titânio Fantasma", ru:"Призрачный титан", ur:"گھوسٹ ٹائٹینیم", id:"Titanium Hantu", de:"Geister-Titan", ja:"ゴースト・チタン", tr:"Hayalet Titanyum", ko:"고스트 티타늄", fa:"تیتانیوم شبح", uk:"Примарний титан", it:"Titanio Fantasma", pl:"Duchowy Tytan", vi:"Titan Bóng Ma" },
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
  card_duel_d: { en:"Battle channels within 20k subs of you. Subs and views decide the winner — win and bank NovaCoins.", zh:"挑战与你相差2万订阅以内的频道。订阅和播放量决定胜负——获胜赚积分。", hi:"अपने से 20k सब्स के अंदर के चैनलों से लड़ें। जीतें और पॉइंट कमाएँ।", es:"Lucha contra canales a menos de 20k subs de ti. Gana y suma puntos.", ar:"نافس قنوات ضمن 20 ألف مشترك منك. اربح واجمع النقاط.", fr:"Affronte des chaînes à moins de 20k abonnés de toi. Gagne et empoche des points.", bn:"আপনার থেকে ২০ হাজার সাবের মধ্যে চ্যানেলের সাথে লড়ুন। জিতুন, পয়েন্ট নিন।", pt:"Batalha canais até 20k subs de diferença. Ganha e acumula pontos.", ru:"Сражайся с каналами в пределах 20 тыс. подписчиков. Побеждай и получай очки.", ur:"اپنے سے 20 ہزار سبس کے اندر چینلز سے مقابلہ کریں۔ جیتیں اور پوائنٹس کمائیں۔", id:"Lawan kanal dalam selisih 20k subs. Menang dan kumpulkan poin.", de:"Kämpfe gegen Kanäle mit max. 20k Abo-Abstand. Gewinne und sammle Punkte.", ja:"登録者差2万以内のチャンネルと対決。勝ってポイント獲得。", tr:"Senden en fazla 20k abone farkı olan kanallarla savaş. Kazan, puan topla.", ko:"당신과 2만 구독자 이내의 채널과 대결하세요. 이기고 포인트를 받으세요.", fa:"با کانال‌های تا ۲۰ هزار مشترک اختلاف مبارزه کن. ببر و امتیاز بگیر.", uk:"Бийся з каналами в межах 20 тис. підписників. Перемагай і збирай бали.", it:"Sfida canali entro 20k iscritti da te. Vinci e accumula punti.", pl:"Walcz z kanałami w granicach 20 tys. subów. Wygrywaj i zbieraj punkty.", vi:"Đấu với các kênh chênh lệch dưới 20k sub. Thắng và nhận điểm." },
  card_ana: { en:"Analytics", zh:"数据分析", hi:"एनालिटिक्स", es:"Analíticas", ar:"التحليلات", fr:"Analytique", bn:"অ্যানালিটিক্স", pt:"Análises", ru:"Аналитика", ur:"تجزیات", id:"Analitik", de:"Analysen", ja:"分析", tr:"Analizler", ko:"분석", fa:"تحلیل‌ها", uk:"Аналітика", it:"Analisi", pl:"Analityka", vi:"Phân tích" },
  card_ana_d: { en:"Your stats, best videos, and closest rivals — at a glance.", zh:"你的数据、最佳视频和最接近的对手，一目了然。", hi:"आपके आँकड़े, बेस्ट वीडियो और करीबी राइवल — एक नज़र में।", es:"Tus estadísticas, mejores vídeos y rivales más cercanos — de un vistazo.", ar:"إحصاءاتك وأفضل فيديوهاتك وأقرب منافسيك — بنظرة واحدة.", fr:"Tes stats, tes meilleures vidéos et tes rivaux les plus proches — en un clin d’œil.", bn:"আপনার পরিসংখ্যান, সেরা ভিডিও ও নিকটতম প্রতিদ্বন্দ্বী — এক নজরে।", pt:"As tuas estatísticas, melhores vídeos e rivais mais próximos — num relance.", ru:"Твоя статистика, лучшие видео и ближайшие соперники — с первого взгляда.", ur:"آپ کے اعداد و شمار، بہترین ویڈیوز اور قریبی حریف — ایک نظر میں۔", id:"Statistikmu, video terbaik, dan rival terdekat — sekilas.", de:"Deine Statistiken, besten Videos und nächsten Rivalen — auf einen Blick.", ja:"あなたの統計、ベスト動画、最接近のライバルを一目で。", tr:"İstatistiklerin, en iyi videoların ve en yakın rakiplerin — bir bakışta.", ko:"내 통계, 최고의 영상, 가장 가까운 라이벌 — 한눈에.", fa:"آمار تو، بهترین ویدیوها و نزدیک‌ترین رقبا — در یک نگاه.", uk:"Твоя статистика, найкращі відео та найближчі суперники — з першого погляду.", it:"Le tue statistiche, i migliori video e i rivali più vicini — a colpo d’occhio.", pl:"Twoje statystyki, najlepsze filmy i najbliżsi rywale — w mgnieniu oka.", vi:"Số liệu, video hay nhất và đối thủ gần nhất — trong nháy mắt." },
  card_quest: { en:"Rewards and Achievements", zh:"奖励与成就", hi:"रिवॉर्ड और अचीवमेंट", es:"Recompensas y Logros", ar:"الجوائز والإنجازات", fr:"Récompenses et Succès", bn:"পুরস্কার ও অর্জন", pt:"Recompensas e Conquistas", ru:"Награды и достижения", ur:"انعامات اور کامیابیاں", id:"Hadiah dan Pencapaian", de:"Belohnungen und Erfolge", ja:"リワードと実績", tr:"Ödüller ve Başarılar", ko:"보상과 업적", fa:"جوایز و دستاوردها", uk:"Нагороди та досягнення", it:"Ricompense e Obiettivi", pl:"Nagrody i Osiągnięcia", vi:"Phần thưởng và Thành tựu" },
  card_quest_d: { en:"Every action earns NovaCoins. Hit the milestones, unlock free NovaClip Pro time.", zh:"每个操作都能赚积分。达到里程碑，解锁免费 NovaClip Pro。", hi:"हर एक्शन से पॉइंट मिलते हैं। माइलस्टोन पूरे करें, फ्री Pro पाएं।", es:"Cada acción suma puntos. Alcanza las metas y desbloquea NovaClip Pro gratis.", ar:"كل إجراء يكسبك نقاطًا. حقق الأهداف وافتح NovaClip Pro مجانًا.", fr:"Chaque action rapporte des points. Atteins les paliers, débloque du Pro gratuit.", bn:"প্রতিটি কাজে পয়েন্ট। মাইলস্টোন ছুঁয়ে ফ্রি Pro আনলক করুন।", pt:"Cada ação dá pontos. Atinge as metas e desbloqueia NovaClip Pro grátis.", ru:"Каждое действие даёт очки. Достигай целей — открывай бесплатный Pro.", ur:"ہر عمل پوائنٹس دیتا ہے۔ سنگ میل عبور کریں، مفت Pro کھولیں۔", id:"Setiap aksi menghasilkan poin. Capai target, buka Pro gratis.", de:"Jede Aktion bringt Punkte. Erreiche die Meilensteine, schalte gratis Pro frei.", ja:"行動すればポイント。マイルストーン達成で無料Proを解放。", tr:"Her eylem puan kazandırır. Hedeflere ulaş, ücretsiz Pro aç.", ko:"모든 행동이 포인트가 됩니다. 목표를 달성하고 무료 Pro를 열어보세요.", fa:"هر اقدامی امتیاز می‌دهد. به نقاط عطف برس و Pro رایگان باز کن.", uk:"Кожна дія дає бали. Досягай цілей — відкривай безплатний Pro.", it:"Ogni azione dà punti. Raggiungi i traguardi, sblocca Pro gratis.", pl:"Każda akcja daje punkty. Osiągaj cele, odblokuj darmowe Pro.", vi:"Mỗi hành động đều có điểm. Đạt mốc, mở khóa Pro miễn phí." },
  footer: { en:"Classic app with quizzes and streaks", zh:"带测验和连胜的经典应用", hi:"क्विज़ और स्ट्रीक वाला क्लासिक ऐप", es:"App clásica con quizzes y rachas", ar:"التطبيق الكلاسيكي مع الاختبارات", fr:"App classique avec quiz et séries", bn:"কুইজ ও স্ট্রিক সহ ক্লাসিক অ্যাপ", pt:"App clássica com quizzes e sequências", ru:"Классическое приложение с квизами", ur:"کوئز اور سٹریکس والی کلاسک ایپ", id:"Aplikasi klasik dengan kuis", de:"Klassische App mit Quiz und Serien", ja:"クイズと連続記録のクラシック版", tr:"Quiz ve serilerle klasik uygulama", ko:"퀴즈와 스트릭이 있는 클래식 앱", fa:"اپ کلاسیک با آزمون‌ها", uk:"Класичний застосунок із квізами", it:"App classica con quiz e serie", pl:"Klasyczna apka z quizami", vi:"Ứng dụng cổ điển với quiz" },
  loading: { en:"Loading NovaClip…", zh:"正在加载 NovaClip…", hi:"NovaClip लोड हो रहा है…", es:"Cargando NovaClip…", ar:"جارٍ تحميل NovaClip…", fr:"Chargement de NovaClip…", bn:"NovaClip লোড হচ্ছে…", pt:"A carregar o NovaClip…", ru:"Загрузка NovaClip…", ur:"NovaClip لوڈ ہو رہا ہے…", id:"Memuat NovaClip…", de:"NovaClip wird geladen…", ja:"NovaClipを読み込み中…", tr:"NovaClip yükleniyor…", ko:"NovaClip 불러오는 중…", fa:"در حال بارگذاری NovaClip…", uk:"Завантаження NovaClip…", it:"Caricamento di NovaClip…", pl:"Ładowanie NovaClip…", vi:"Đang tải NovaClip…" },
  skip: { en:"Skip to content", zh:"跳到内容", hi:"सामग्री पर जाएँ", es:"Saltar al contenido", ar:"تخطَّ إلى المحتوى", fr:"Aller au contenu", bn:"বিষয়বস্তুতে যান", pt:"Saltar para o conteúdo", ru:"Перейти к содержимому", ur:"مواد پر جائیں", id:"Lewati ke konten", de:"Zum Inhalt springen", ja:"コンテンツへスキップ", tr:"İçeriğe atla", ko:"콘텐츠로 건너뛰기", fa:"پرش به محتوا", uk:"Перейти до вмісту", it:"Salta al contenuto", pl:"Przejdź do treści", vi:"Bỏ qua tới nội dung" },
  sec_learn: { en:"01 — Learn & build", zh:"01 — 学习与构建", hi:"01 — सीखें और बनाएँ", es:"01 — Aprende y crea", ar:"01 — تعلّم وابنِ", fr:"01 — Apprendre & créer", bn:"01 — শিখুন ও গড়ুন", pt:"01 — Aprende e cria", ru:"01 — Учись и создавай", ur:"01 — سیکھیں اور بنائیں", id:"01 — Belajar & bangun", de:"01 — Lernen & bauen", ja:"01 — 学び、作る", tr:"01 — Öğren & oluştur", ko:"01 — 배우고 만들기", fa:"۰۱ — یاد بگیر و بساز", uk:"01 — Вчись і створюй", it:"01 — Impara e crea", pl:"01 — Ucz się i twórz", vi:"01 — Học & xây dựng" },
  builtby: { en:"© 2026 NovaClip · Built by eskon", zh:"© 2026 NovaClip · 由 eskon 打造", hi:"© 2026 NovaClip · eskon द्वारा निर्मित", es:"© 2026 NovaClip · Hecho por eskon", ar:"© 2026 NovaClip · من صنع eskon", fr:"© 2026 NovaClip · Créé par eskon", bn:"© 2026 NovaClip · eskon-এর তৈরি", pt:"© 2026 NovaClip · Feito pela eskon", ru:"© 2026 NovaClip · Создано eskon", ur:"© 2026 NovaClip · eskon نے بنایا", id:"© 2026 NovaClip · Dibuat oleh eskon", de:"© 2026 NovaClip · Erstellt von eskon", ja:"© 2026 NovaClip · eskon 制作", tr:"© 2026 NovaClip · eskon tarafından", ko:"© 2026 NovaClip · eskon 제작", fa:"© ۲۰۲۶ NovaClip · ساختهٔ eskon", uk:"© 2026 NovaClip · Створено eskon", it:"© 2026 NovaClip · Creato da eskon", pl:"© 2026 NovaClip · Stworzone przez eskon", vi:"© 2026 NovaClip · Được tạo bởi eskon" },
  signin: { en:"Sign in with Google", zh:"使用 Google 登录", hi:"Google से साइन इन करें", es:"Iniciar sesión con Google", ar:"تسجيل الدخول بجوجل", fr:"Se connecter avec Google", bn:"Google দিয়ে সাইন ইন", pt:"Entrar com Google", ru:"Войти через Google", ur:"گوگل سے سائن ان کریں", id:"Masuk dengan Google", de:"Mit Google anmelden", ja:"Googleでログイン", tr:"Google ile giriş yap", ko:"Google로 로그인", fa:"ورود با گوگل", uk:"Увійти через Google", it:"Accedi con Google", pl:"Zaloguj przez Google", vi:"Đăng nhập bằng Google" },
  signout: { en:"Sign out", zh:"退出登录", hi:"साइन आउट", es:"Cerrar sesión", ar:"تسجيل الخروج", fr:"Se déconnecter", bn:"সাইন আউট", pt:"Terminar sessão", ru:"Выйти", ur:"سائن آؤٹ", id:"Keluar", de:"Abmelden", ja:"ログアウト", tr:"Çıkış yap", ko:"로그아웃", fa:"خروج", uk:"Вийти", it:"Esci", pl:"Wyloguj", vi:"Đăng xuất" },
  t_stats: { en:"My analytics", zh:"我的数据", hi:"मेरी एनालिटिक्स", es:"Mis analíticas", ar:"تحليلاتي", fr:"Mes analytiques", bn:"আমার অ্যানালিটিক্স", pt:"As minhas análises", ru:"Моя аналитика", ur:"میرے تجزیات", id:"Analitik saya", de:"Meine Analysen", ja:"マイ分析", tr:"Analizlerim", ko:"내 분석", fa:"تحلیل‌های من", uk:"Моя аналітика", it:"Le mie analisi", pl:"Moja analityka", vi:"Phân tích của tôi" },
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
  t_duel_d: { en:"Challenge a channel within 20k subs and win NovaCoins.", zh:"挑战2万订阅内的频道并赢积分。", hi:"20k सब्स के भीतर चैनल को चुनौती दें।", es:"Reta a un canal en 20k subs y gana puntos.", ar:"تحدَّ قناة ضمن 20 ألف مشترك واربح نقاطًا.", fr:"Défie une chaîne à 20k abonnés et gagne des points.", bn:"২০ হাজার সাবের চ্যানেলকে চ্যালেঞ্জ করুন।", pt:"Desafia um canal até 20k subs e ganha pontos.", ru:"Брось вызов каналу в пределах 20 тыс. и получи очки.", ur:"20 ہزار سبس کے چینل کو چیلنج کریں۔", id:"Tantang kanal dalam 20k subs, menangkan poin.", de:"Fordere einen Kanal bis 20k Abos heraus.", ja:"2万登録以内のチャンネルに挑戦してポイント獲得。", tr:"20k abone içindeki kanala meydan oku.", ko:"2만 구독 이내 채널에 도전해 포인트 획득.", fa:"کانالی تا ۲۰ هزار مشترک را به چالش بکش.", uk:"Кинь виклик каналу в межах 20 тис. і вигравай бали.", it:"Sfida un canale entro 20k iscritti e vinci punti.", pl:"Rzuć wyzwanie kanałowi do 20 tys. subów.", vi:"Thách đấu kênh trong 20k sub và thắng điểm." },
  t_trend_d: { en:"See what is blowing up on YouTube right now.", zh:"看看 YouTube 上正在爆火的内容。", hi:"देखें YouTube पर अभी क्या वायरल है।", es:"Mira qué está explotando en YouTube ahora.", ar:"شاهد ما ينتشر على يوتيوب الآن.", fr:"Vois ce qui explose sur YouTube maintenant.", bn:"এখন YouTube-এ কী ভাইরাল দেখুন।", pt:"Vê o que está a bombar no YouTube agora.", ru:"Смотри, что взрывается на YouTube сейчас.", ur:"دیکھیں یوٹیوب پر ابھی کیا وائرل ہے۔", id:"Lihat apa yang viral di YouTube sekarang.", de:"Sieh, was gerade auf YouTube explodiert.", ja:"今YouTubeでバズっているものを見る。", tr:"Şu an YouTube'da patlayanı gör.", ko:"지금 유튜브에서 뜨는 것을 확인하세요.", fa:"ببین الان چه چیزی در یوتیوب می‌ترکد.", uk:"Дивись, що зараз вибухає на YouTube.", it:"Guarda cosa sta esplodendo su YouTube ora.", pl:"Zobacz, co teraz podbija YouTube.", vi:"Xem gì đang bùng nổ trên YouTube." },
  t_analytics: { en:"Full analytics", zh:"完整分析", hi:"पूर्ण एनालिटिक्स", es:"Analíticas completas", ar:"تحليلات كاملة", fr:"Analyse complète", bn:"সম্পূর্ণ অ্যানালিটিক্স", pt:"Análises completas", ru:"Полная аналитика", ur:"مکمل تجزیات", id:"Analitik lengkap", de:"Volle Analysen", ja:"完全な分析", tr:"Tam analiz", ko:"전체 분석", fa:"تحلیل کامل", uk:"Повна аналітика", it:"Analisi complete", pl:"Pełna analityka", vi:"Phân tích đầy đủ" },
  t_analytics_d: { en:"Deep charts comparing you to rivals — on its own page.", zh:"深入图表对比对手——独立页面。", hi:"प्रतिद्वंद्वियों से गहन तुलना।", es:"Gráficos profundos vs. rivales.", ar:"رسوم معمّقة مقابل المنافسين.", fr:"Graphiques détaillés vs rivaux.", bn:"প্রতিদ্বন্দ্বীদের সাথে গভীর তুলনা।", pt:"Gráficos detalhados vs. rivais.", ru:"Подробные графики против соперников.", ur:"حریفوں سے گہرا موازنہ۔", id:"Grafik mendalam vs rival.", de:"Detaillierte Diagramme vs. Rivalen.", ja:"ライバルとの詳細比較。", tr:"Rakiplerle derin karşılaştırma.", ko:"라이벌과 심층 비교.", fa:"مقایسه عمیق با رقبا.", uk:"Глибокі графіки проти суперників.", it:"Grafici dettagliati vs rivali.", pl:"Szczegółowe wykresy vs rywale.", vi:"Biểu đồ sâu so với đối thủ." },
  compare: { en:"Compare with 2 competitors", zh:"与2个对手对比", hi:"2 प्रतिद्वंद्वियों से तुलना", es:"Comparar con 2 competidores", ar:"قارن مع منافسين اثنين", fr:"Comparer avec 2 concurrents", bn:"২ প্রতিযোগীর সাথে তুলনা", pt:"Comparar com 2 concorrentes", ru:"Сравнить с 2 соперниками", ur:"2 حریفوں سے موازنہ", id:"Bandingkan dengan 2 pesaing", de:"Mit 2 Konkurrenten vergleichen", ja:"ライバル2人と比較", tr:"2 rakiple karşılaştır", ko:"경쟁자 2명과 비교", fa:"مقایسه با ۲ رقیب", uk:"Порівняти з 2 суперниками", it:"Confronta con 2 concorrenti", pl:"Porównaj z 2 rywalami", vi:"So sánh với 2 đối thủ" },
  duel_label: { en:"Views and subs duel (max 20k subs difference)", zh:"播放与订阅对决（最多相差2万订阅）", hi:"व्यूज़ और सब्स ड्यूल (अधिकतम 20k अंतर)", es:"Duelo de vistas y subs (máx. 20k de diferencia)", ar:"مبارزة المشاهدات والمشتركين (فرق 20 ألف كحد أقصى)", fr:"Duel vues et abonnés (écart max 20k)", bn:"ভিউ ও সাব ডুয়েল (সর্বোচ্চ ২০ হাজার পার্থক্য)", pt:"Duelo de views e subs (máx. 20k de diferença)", ru:"Дуэль просмотров и подписчиков (макс. 20 тыс. разницы)", ur:"ویوز اور سبس ڈوئل (زیادہ سے زیادہ 20 ہزار فرق)", id:"Duel views dan subs (selisih maks 20k)", de:"Views- und Abo-Duell (max. 20k Unterschied)", ja:"再生数と登録者の対決（差2万まで）", tr:"İzlenme ve abone düellosu (en fazla 20k fark)", ko:"조회수·구독자 대결 (최대 2만 차이)", fa:"دوئل بازدید و مشترک (حداکثر ۲۰ هزار اختلاف)", uk:"Дуель переглядів і підписників (макс. 20 тис.)", it:"Duello di views e iscritti (max 20k di differenza)", pl:"Pojedynek wyświetleń i subów (maks. 20 tys. różnicy)", vi:"Đấu lượt xem và sub (chênh tối đa 20k)" },
  opp_ph: { en:"Opponent channel name...", zh:"对手频道名称...", hi:"विरोधी चैनल का नाम...", es:"Nombre del canal rival...", ar:"اسم قناة الخصم...", fr:"Nom de la chaîne adverse...", bn:"প্রতিপক্ষ চ্যানেলের নাম...", pt:"Nome do canal adversário...", ru:"Название канала соперника...", ur:"مخالف چینل کا نام...", id:"Nama kanal lawan...", de:"Name des Gegner-Kanals...", ja:"相手チャンネル名...", tr:"Rakip kanal adı...", ko:"상대 채널 이름...", fa:"نام کانال حریف...", uk:"Назва каналу суперника...", it:"Nome del canale avversario...", pl:"Nazwa kanału rywala...", vi:"Tên kênh đối thủ..." },
  fight: { en:"Fight!", zh:"开战！", hi:"लड़ो!", es:"¡Pelea!", ar:"قاتِل!", fr:"Combat !", bn:"লড়াই!", pt:"Lutar!", ru:"В бой!", ur:"لڑو!", id:"Lawan!", de:"Kämpfen!", ja:"対戦！", tr:"Savaş!", ko:"대결!", fa:"مبارزه!", uk:"У бій!", it:"Combatti!", pl:"Walcz!", vi:"Chiến!" },
  ai_h: { en:"NovaClip AI", zh:"NovaClip 智能", hi:"NovaClip एआई", es:"IA NovaClip", ar:"ذكاء NovaClip", fr:"IA NovaClip", bn:"NovaClip এআই", pt:"IA NovaClip", ru:"ИИ NovaClip", ur:"NovaClip اے آئی", id:"AI NovaClip", de:"NovaClip KI", ja:"NovaClip AI", tr:"NovaClip YZ", ko:"NovaClip AI", fa:"هوش مصنوعی NovaClip", uk:"ШІ NovaClip", it:"IA NovaClip", pl:"AI NovaClip", vi:"AI NovaClip" },
  /* ===== PROGRESS PAGE ===== */
  profile: { en:"Profile", zh:"资料", hi:"प्रोफ़ाइल", es:"Perfil", ar:"الملف الشخصي", fr:"Profil", bn:"প্রোফাইল", pt:"Perfil", ru:"Профиль", ur:"پروفائل", id:"Profil", de:"Profil", ja:"プロフィール", tr:"Profil", ko:"프로필", fa:"پروفایل", uk:"Профіль", it:"Profilo", pl:"Profil", vi:"Hồ sơ" },
  progress: { en:"Progress", zh:"进度", hi:"प्रगति", es:"Progreso", ar:"التقدّم", fr:"Progression", bn:"অগ্রগতি", pt:"Progresso", ru:"Прогресс", ur:"پیش رفت", id:"Progres", de:"Fortschritt", ja:"進捗", tr:"İlerleme", ko:"진행도", fa:"پیشرفت", uk:"Прогрес", it:"Progressi", pl:"Postęp", vi:"Tiến độ" },
  prog_h: { en:"Your progress", zh:"你的进度", hi:"आपकी प्रगति", es:"Tu progreso", ar:"تقدّمك", fr:"Ta progression", bn:"আপনার অগ্রগতি", pt:"O teu progresso", ru:"Твой прогресс", ur:"آپ کی پیش رفت", id:"Progresmu", de:"Dein Fortschritt", ja:"あなたの進捗", tr:"İlerlemen", ko:"내 진행도", fa:"پیشرفت تو", uk:"Твій прогрес", it:"I tuoi progressi", pl:"Twój postęp", vi:"Tiến độ của bạn" },
  prog_sub: { en:"Everything you have earned in one place — NovaCoins, rewards, achievements, the skills that count towards a certificate, and your AI chat history.", zh:"你赚到的一切都在这里——积分、奖励、成就、计入证书的技能，以及你的 AI 聊天记录。", hi:"आपकी सारी कमाई एक जगह — पॉइंट, रिवॉर्ड, अचीवमेंट, सर्टिफिकेट में गिने जाने वाले स्किल, और एआई चैट हिस्ट्री।", es:"Todo lo que has ganado en un solo sitio: puntos, recompensas, logros, las habilidades que cuentan para un certificado y tu historial de chat con la IA.", ar:"كل ما كسبته في مكان واحد — النقاط والجوائز والإنجازات والمهارات التي تُحتسب للشهادة وسجل محادثاتك مع الذكاء الاصطناعي.", fr:"Tout ce que tu as gagné au même endroit : points, récompenses, succès, les compétences qui comptent pour un certificat et ton historique de chat avec l'IA.", bn:"আপনার সব অর্জন এক জায়গায় — পয়েন্ট, পুরস্কার, অ্যাচিভমেন্ট, সার্টিফিকেটে গণ্য দক্ষতা এবং এআই চ্যাট ইতিহাস।", pt:"Tudo o que ganhaste num só sítio — pontos, recompensas, conquistas, as competências que contam para um certificado e o teu histórico de conversas com a IA.", ru:"Всё заработанное в одном месте — очки, награды, достижения, навыки, которые идут в зачёт сертификата, и история чатов с ИИ.", ur:"آپ کی تمام کمائی ایک جگہ — پوائنٹس، انعامات، کامیابیاں، سرٹیفکیٹ میں شمار ہونے والی مہارتیں، اور اے آئی چیٹ ہسٹری۔", id:"Semua yang kamu dapat dalam satu tempat — poin, hadiah, pencapaian, keterampilan yang dihitung untuk sertifikat, dan riwayat obrolan AI-mu.", de:"Alles Erreichte an einem Ort — Punkte, Belohnungen, Erfolge, die für ein Zertifikat zählenden Fähigkeiten und dein KI-Chatverlauf.", ja:"獲得したすべてをここに — ポイント、リワード、実績、証明書に加算されるスキル、そしてAIとの会話履歴。", tr:"Kazandığın her şey tek yerde — puanlar, ödüller, başarılar, sertifikaya sayılan beceriler ve YZ sohbet geçmişin.", ko:"획득한 모든 것을 한곳에 — 포인트, 보상, 업적, 수료증에 반영되는 스킬, 그리고 AI 대화 기록.", fa:"هرچه به دست آورده‌ای یک‌جا — امتیازها، جوایز، دستاوردها، مهارت‌هایی که برای گواهی حساب می‌شوند، و تاریخچه گفتگوهایت با هوش مصنوعی.", uk:"Усе зароблене в одному місці — бали, нагороди, досягнення, навички, що зараховуються до сертифіката, та історія чатів зі ШІ.", it:"Tutto ciò che hai guadagnato in un unico posto: punti, premi, obiettivi, le competenze che contano per un certificato e la cronologia delle chat con l'IA.", pl:"Wszystko, co zdobyłeś, w jednym miejscu — punkty, nagrody, osiągnięcia, umiejętności liczące się do certyfikatu i historia rozmów z AI.", vi:"Mọi thứ bạn đạt được ở một nơi — điểm, phần thưởng, thành tựu, các kỹ năng tính vào chứng chỉ, và lịch sử trò chuyện với AI." },
  prog_rewards_d: { en:"Free NovaClip Pro time, unlocked by NovaCoins.", zh:"用积分解锁的免费 NovaClip Pro 时长。", hi:"पॉइंट से अनलॉक होने वाला मुफ़्त NovaClip Pro समय।", es:"Tiempo gratis de NovaClip Pro, desbloqueado con puntos.", ar:"وقت مجاني من NovaClip Pro يُفتح بالنقاط.", fr:"Du temps NovaClip Pro gratuit, débloqué avec des points.", bn:"পয়েন্ট দিয়ে আনলক হওয়া ফ্রি NovaClip Pro সময়।", pt:"Tempo grátis de NovaClip Pro, desbloqueado com pontos.", ru:"Бесплатное время NovaClip Pro за очки.", ur:"پوائنٹس سے کھلنے والا مفت NovaClip Pro وقت۔", id:"Waktu NovaClip Pro gratis, dibuka dengan poin.", de:"Kostenlose NovaClip-Pro-Zeit, mit Punkten freigeschaltet.", ja:"ポイントで解放される無料のNovaClip Pro期間。", tr:"Puanlarla açılan ücretsiz NovaClip Pro süresi.", ko:"포인트로 잠금 해제하는 무료 NovaClip Pro 이용 기간.", fa:"زمان رایگان NovaClip Pro که با امتیاز باز می‌شود.", uk:"Безплатний час NovaClip Pro, який відкривають бали.", it:"Tempo gratis di NovaClip Pro, sbloccato con i punti.", pl:"Darmowy czas NovaClip Pro odblokowywany punktami.", vi:"Thời gian NovaClip Pro miễn phí, mở khóa bằng điểm." },
  prog_ach_d: { en:"Milestones you have passed.", zh:"你已达成的里程碑。", hi:"आपने पार किए माइलस्टोन।", es:"Hitos que ya has superado.", ar:"محطات تجاوزتها.", fr:"Les paliers que tu as franchis.", bn:"আপনি যেসব মাইলফলক পেরিয়েছেন।", pt:"Marcos que já ultrapassaste.", ru:"Пройденные вехи.", ur:"وہ سنگ میل جو آپ عبور کر چکے ہیں۔", id:"Tonggak yang sudah kamu lewati.", de:"Meilensteine, die du erreicht hast.", ja:"達成したマイルストーン。", tr:"Geçtiğin kilometre taşları.", ko:"지나온 마일스톤.", fa:"نقاط عطفی که رد کرده‌ای.", uk:"Пройдені віхи.", it:"I traguardi che hai superato.", pl:"Osiągnięte kamienie milowe.", vi:"Những cột mốc bạn đã vượt qua." },
  prog_skills: { en:"Certificate skills", zh:"证书技能", hi:"सर्टिफिकेट स्किल", es:"Habilidades del certificado", ar:"مهارات الشهادة", fr:"Compétences du certificat", bn:"সার্টিফিকেট দক্ষতা", pt:"Competências do certificado", ru:"Навыки для сертификата", ur:"سرٹیفکیٹ مہارتیں", id:"Keterampilan sertifikat", de:"Zertifikats-Fähigkeiten", ja:"証明書スキル", tr:"Sertifika becerileri", ko:"수료증 스킬", fa:"مهارت‌های گواهی", uk:"Навички для сертифіката", it:"Competenze del certificato", pl:"Umiejętności do certyfikatu", vi:"Kỹ năng chứng chỉ" },
  prog_skills_d: { en:"Hands-on work counts towards a NovaClip Creator Certificate. NovaCoins alone are not enough — these are the reps.", zh:"实际操作才计入 NovaClip 创作者证书。光有积分不够——这些才是真正的练习量。", hi:"असली काम ही NovaClip क्रिएटर सर्टिफिकेट में गिना जाता है। सिर्फ पॉइंट काफी नहीं — ये असली अभ्यास हैं।", es:"El trabajo práctico cuenta para el Certificado de Creador NovaClip. Los puntos por sí solos no bastan: estas son las repeticiones.", ar:"العمل التطبيقي هو ما يُحتسب لشهادة صانع NovaClip. النقاط وحدها لا تكفي — هذه هي التمارين الفعلية.", fr:"Le travail concret compte pour le Certificat Créateur NovaClip. Les points seuls ne suffisent pas : voici les répétitions.", bn:"হাতে-কলমে কাজই NovaClip ক্রিয়েটর সার্টিফিকেটে গণ্য হয়। শুধু পয়েন্ট যথেষ্ট নয় — এগুলোই আসল অনুশীলন।", pt:"O trabalho prático conta para o Certificado de Criador NovaClip. Só pontos não chega — estas são as repetições.", ru:"К сертификату создателя NovaClip идёт практическая работа. Одних очков мало — вот реальные повторения.", ur:"عملی کام ہی NovaClip کریئٹر سرٹیفکیٹ میں شمار ہوتا ہے۔ صرف پوائنٹس کافی نہیں — یہ اصل مشقیں ہیں۔", id:"Kerja nyata yang dihitung untuk Sertifikat Kreator NovaClip. Poin saja tidak cukup — ini repetisinya.", de:"Praktische Arbeit zählt für das NovaClip-Creator-Zertifikat. Punkte allein reichen nicht — das hier sind die Wiederholungen.", ja:"実際の作業がNovaClipクリエイター証明書に加算されます。ポイントだけでは足りません。これが実践量です。", tr:"NovaClip Yaratıcı Sertifikası için pratik iş sayılır. Sadece puan yetmez — asıl tekrarlar bunlar.", ko:"실제 작업이 NovaClip 크리에이터 수료증에 반영됩니다. 포인트만으로는 부족합니다 — 이것이 실전 횟수입니다.", fa:"کار عملی است که برای گواهی سازنده NovaClip حساب می‌شود. فقط امتیاز کافی نیست — این‌ها تمرین‌های واقعی‌اند.", uk:"До сертифіката творця NovaClip зараховується практична робота. Самих балів замало — ось реальні повторення.", it:"Il lavoro pratico conta per il Certificato Creator NovaClip. I punti da soli non bastano: queste sono le ripetizioni.", pl:"Do Certyfikatu Twórcy NovaClip liczy się praktyka. Same punkty nie wystarczą — oto powtórzenia.", vi:"Công việc thực tế mới tính vào Chứng chỉ Nhà sáng tạo NovaClip. Chỉ điểm thôi là chưa đủ — đây mới là số lần thực hành." },
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
  g_sub: { en:"10 fighters. 5 minutes. Capture kills across a bright city battlefield. Earn NovaCoins and top the board for the MVP bonus.", zh:"10名战士。5分钟。在明亮的城市战场上抢夺击杀。赚取 NovaClip 积分，登顶榜单获得 MVP 奖励。", hi:"10 लड़ाके। 5 मिनट। चमकीले शहरी युद्धक्षेत्र में किल्स बटोरें। NovaClip पॉइंट कमाएँ और MVP बोनस के लिए बोर्ड पर शीर्ष पर रहें।", es:"10 luchadores. 5 minutos. Consigue bajas en un campo de batalla urbano. Gana puntos NovaClip y lidera la tabla para el bono MVP.", ar:"10 مقاتلين. 5 دقائق. احصد النقاط في ساحة معركة مدينية مضيئة. اكسب نقاط NovaClip وتصدَّر اللوحة للحصول على مكافأة أفضل لاعب.", fr:"10 combattants. 5 minutes. Enchaîne les éliminations sur un champ de bataille urbain. Gagne des points NovaClip et domine le classement pour le bonus MVP.", bn:"১০ জন যোদ্ধা। ৫ মিনিট। উজ্জ্বল শহুরে যুদ্ধক্ষেত্রে কিল সংগ্রহ করুন। NovaClip পয়েন্ট অর্জন করুন এবং MVP বোনাসের জন্য বোর্ডে শীর্ষে থাকুন।", pt:"10 lutadores. 5 minutos. Consegue abates num campo de batalha urbano. Ganha pontos NovaClip e lidera a tabela para o bónus MVP.", ru:"10 бойцов. 5 минут. Набирайте убийства на светлом городском поле боя. Зарабатывайте очки NovaClip и возглавьте таблицу ради бонуса MVP.", ur:"10 لڑاکے۔ 5 منٹ۔ روشن شہری میدانِ جنگ میں کِلز حاصل کریں۔ NovaClip پوائنٹس کمائیں اور MVP بونس کے لیے بورڈ پر سرِفہرست آئیں۔", id:"10 petarung. 5 menit. Kumpulkan kill di medan perang kota yang terang. Raih poin NovaClip dan puncaki papan untuk bonus MVP.", de:"10 Kämpfer. 5 Minuten. Sammle Kills auf einem hellen Stadt-Schlachtfeld. Verdiene NovaClip-Punkte und führe die Tabelle für den MVP-Bonus an.", ja:"10人の戦士。5分間。明るい都市の戦場でキルを稼ごう。NovaClipポイントを獲得し、ボードの首位でMVPボーナスを狙え。", tr:"10 savaşçı. 5 dakika. Aydınlık şehir savaş alanında öldürme topla. NovaClip puanı kazan ve MVP bonusu için tabloda zirveye çık.", ko:"10명의 전사. 5분. 밝은 도시 전장에서 킬을 쓸어 담으세요. NovaClip 포인트를 얻고 보드 1위로 MVP 보너스를 받으세요.", fa:"۱۰ مبارز. ۵ دقیقه. در میدان نبرد شهریِ روشن کیل بگیر. امتیاز NovaClip بگیر و برای پاداش بهترین بازیکن صدرنشین شو.", uk:"10 бійців. 5 хвилин. Збирайте вбивства на світлому міському полі бою. Заробляйте бали NovaClip і очолюйте таблицю заради бонусу MVP.", it:"10 combattenti. 5 minuti. Colleziona uccisioni in un campo di battaglia urbano. Guadagna punti NovaClip e domina la classifica per il bonus MVP.", pl:"10 wojowników. 5 minut. Zbieraj zabójstwa na jasnym miejskim polu bitwy. Zdobywaj punkty NovaClip i prowadź w tabeli po bonus MVP.", vi:"10 chiến binh. 5 phút. Săn hạ gục trên chiến trường thành phố rực sáng. Kiếm điểm NovaClip và dẫn đầu bảng để nhận thưởng MVP." },
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
  duel_fair: { en:"02 — Fight fair", zh:"02 — 公平对战", hi:"02 — निष्पक्ष मुकाबला", es:"02 — Pelea justa", ar:"02 — نافس بعدل", fr:"02 — Duel équitable", bn:"০২ — ন্যায্য লড়াই", pt:"02 — Luta justa", ru:"02 — Честный бой", ur:"02 — منصفانہ مقابلہ", id:"02 — Bertanding adil", de:"02 — Fairer Kampf", ja:"02 — フェアな勝負", tr:"02 — Adil mücadele", ko:"02 — 공정한 대결", fa:"۰۲ — منصفانه", uk:"02 — Чесний бій", it:"02 — Sfida leale", pl:"02 — Uczciwa walka", vi:"02 — Đấu công bằng" },
  duel_you: { en:"YOU", zh:"你", hi:"आप", es:"TÚ", ar:"أنت", fr:"TOI", bn:"আপনি", pt:"TU", ru:"ВЫ", ur:"آپ", id:"KAMU", de:"DU", ja:"あなた", tr:"SEN", ko:"당신", fa:"تو", uk:"ВИ", it:"TU", pl:"TY", vi:"BẠN" },
  duel_vs: { en:"VS", zh:"对战", hi:"बनाम", es:"VS", ar:"ضد", fr:"VS", bn:"বনাম", pt:"VS", ru:"ПРОТИВ", ur:"مقابل", id:"VS", de:"GEGEN", ja:"VS", tr:"VS", ko:"VS", fa:"در برابر", uk:"ПРОТИ", it:"VS", pl:"KONTRA", vi:"ĐẤU" },
  duel_rival: { en:"RIVAL", zh:"对手", hi:"प्रतिद्वंद्वी", es:"RIVAL", ar:"المنافس", fr:"RIVAL", bn:"প্রতিদ্বন্দ্বী", pt:"RIVAL", ru:"СОПЕРНИК", ur:"حریف", id:"LAWAN", de:"RIVALE", ja:"ライバル", tr:"RAKİP", ko:"라이벌", fa:"رقیب", uk:"СУПЕРНИК", it:"RIVALE", pl:"RYWAL", vi:"ĐỐI THỦ" },
  photo: { en:"Photo", zh:"图片", hi:"फ़ोटो", es:"Foto", ar:"صورة", fr:"Photo", bn:"ছবি", pt:"Foto", ru:"Фото", ur:"تصویر", id:"Foto", de:"Foto", ja:"写真", tr:"Fotoğraf", ko:"사진", fa:"عکس", uk:"Фото", it:"Foto", pl:"Zdjęcie", vi:"Ảnh" },
  theme: { en:"Theme", zh:"主题", hi:"थीम", es:"Tema", ar:"المظهر", fr:"Thème", bn:"থিম", pt:"Tema", ru:"Тема", ur:"تھیم", id:"Tema", de:"Design", ja:"テーマ", tr:"Tema", ko:"테마", fa:"پوسته", uk:"Тема", it:"Tema", pl:"Motyw", vi:"Giao diện" },
  theme_light: { en:"Light", zh:"浅色", hi:"लाइट", es:"Claro", ar:"فاتح", fr:"Clair", bn:"লাইট", pt:"Claro", ru:"Светлая", ur:"لائٹ", id:"Terang", de:"Hell", ja:"ライト", tr:"Açık", ko:"라이트", fa:"روشن", uk:"Світла", it:"Chiaro", pl:"Jasny", vi:"Sáng" },
  theme_dark: { en:"Dark", zh:"深色", hi:"डार्क", es:"Oscuro", ar:"داكن", fr:"Sombre", bn:"ডার্ক", pt:"Escuro", ru:"Тёмная", ur:"ڈارک", id:"Gelap", de:"Dunkel", ja:"ダーク", tr:"Koyu", ko:"다크", fa:"تیره", uk:"Темна", it:"Scuro", pl:"Ciemny", vi:"Tối" },
  theme_system: { en:"System", zh:"跟随系统", hi:"सिस्टम", es:"Sistema", ar:"النظام", fr:"Système", bn:"সিস্টেম", pt:"Sistema", ru:"Системная", ur:"سسٹم", id:"Sistem", de:"System", ja:"システム", tr:"Sistem", ko:"시스템", fa:"سیستم", uk:"Системна", it:"Sistema", pl:"Systemowy", vi:"Hệ thống" },
  vibe: { en:"Vibe", zh:"风格", hi:"वाइब", es:"Estilo", ar:"الأسلوب", fr:"Style", bn:"ভাইব", pt:"Estilo", ru:"Стиль", ur:"انداز", id:"Gaya", de:"Stil", ja:"雰囲気", tr:"Tarz", ko:"분위기", fa:"حال‌وهوا", uk:"Стиль", it:"Stile", pl:"Styl", vi:"Phong cách" },
  vibe_normal: { en:"Normal", zh:"普通", hi:"सामान्य", es:"Normal", ar:"عادي", fr:"Normal", bn:"সাধারণ", pt:"Normal", ru:"Обычный", ur:"عام", id:"Normal", de:"Normal", ja:"ふつう", tr:"Normal", ko:"보통", fa:"عادی", uk:"Звичайний", it:"Normale", pl:"Zwykły", vi:"Bình thường" },
  vibe_genz: { en:"Gen\u00a0Z", zh:"Z世代", hi:"Gen\u00a0Z", es:"Gen\u00a0Z", ar:"جيل\u00a0Z", fr:"Gen\u00a0Z", bn:"Gen\u00a0Z", pt:"Gen\u00a0Z", ru:"Зумер", ur:"Gen\u00a0Z", id:"Gen\u00a0Z", de:"Gen\u00a0Z", ja:"Z世代", tr:"Z\u00a0Kuşağı", ko:"Z세대", fa:"نسل\u00a0Z", uk:"Зумер", it:"Gen\u00a0Z", pl:"Pokolenie\u00a0Z", vi:"Gen\u00a0Z" },

  quests: { en:"Rewards", zh:"奖励", hi:"रिवॉर्ड्स", es:"Recompensas", ar:"الجوائز", fr:"Récompenses", bn:"পুরস্কার", pt:"Recompensas", ru:"Награды", ur:"انعامات", id:"Hadiah", de:"Belohnungen", ja:"リワード", tr:"Ödüller", ko:"보상", fa:"جوایز", uk:"Нагороди", it:"Ricompense", pl:"Nagrody", vi:"Phần thưởng" },
  achievements: { en:"Achievements", zh:"成就", hi:"उपलब्धियाँ", es:"Logros", ar:"الإنجازات", fr:"Succès", bn:"অর্জন", pt:"Conquistas", ru:"Достижения", ur:"کامیابیاں", id:"Pencapaian", de:"Erfolge", ja:"実績", tr:"Başarılar", ko:"업적", fa:"دستاوردها", uk:"Досягнення", it:"Obiettivi", pl:"Osiągnięcia", vi:"Thành tựu" },
  /* The label on the bar's Ask button. tr() returns an empty string for a key
     it has never heard of, so a button labelled from a missing key is a blank
     button — which is why this is here rather than left in English. */
  ui_pick_cat: { en:"Pick a category", zh:"选择分类", hi:"श्रेणी चुनें", es:"Elige una categoría", ar:"اختر فئة", fr:"Choisir une catégorie", bn:"বিভাগ বাছুন", pt:"Escolhe uma categoria", ru:"Выбери категорию", ur:"زمرہ منتخب کریں", id:"Pilih kategori", de:"Kategorie wählen", ja:"カテゴリを選ぶ", tr:"Bir kategori seç", ko:"카테고리 선택", fa:"یک دسته انتخاب کن", uk:"Обери категорію", it:"Scegli una categoria", pl:"Wybierz kategorię", vi:"Chọn danh mục" },
  asknova: { en:"Ask Nova", zh:"问 Nova", hi:"Nova से पूछें", es:"Pregunta a Nova", ar:"اسأل نوفا", fr:"Demander à Nova", bn:"Nova-কে জিজ্ঞাসা", pt:"Pergunte à Nova", ru:"Спросить Nova", ur:"Nova سے پوچھیں", id:"Tanya Nova", de:"Nova fragen", ja:"Novaに聞く", tr:"Nova'ya sor", ko:"Nova에게 묻기", fa:"از Nova بپرس", uk:"Запитати Nova", it:"Chiedi a Nova", pl:"Zapytaj Nova", vi:"Hỏi Nova" },
  categories: { en:"Categories", zh:"分类", hi:"श्रेणियाँ", es:"Categorías", ar:"الفئات", fr:"Catégories", bn:"বিভাগ", pt:"Categorias", ru:"Категории", ur:"زمرے", id:"Kategori", de:"Kategorien", ja:"カテゴリ", tr:"Kategoriler", ko:"카테고리", fa:"دسته‌ها", uk:"Категорії", it:"Categorie", pl:"Kategorie", vi:"Danh mục" },
  history: { en:"History", zh:"历史", hi:"इतिहास", es:"Historial", ar:"السجل", fr:"Historique", bn:"ইতিহাস", pt:"Histórico", ru:"История", ur:"تاریخ", id:"Riwayat", de:"Verlauf", ja:"履歴", tr:"Geçmiş", ko:"기록", fa:"تاریخچه", uk:"Історія", it:"Cronologia", pl:"Historia", vi:"Lịch sử" },
  ask: { en:"Ask", zh:"提问", hi:"पूछें", es:"Preguntar", ar:"اسأل", fr:"Demander", bn:"জিজ্ঞাসা", pt:"Perguntar", ru:"Спросить", ur:"پوچھیں", id:"Tanya", de:"Fragen", ja:"質問", tr:"Sor", ko:"질문", fa:"بپرس", uk:"Запитати", it:"Chiedi", pl:"Zapytaj", vi:"Hỏi" },
  thumb: { en:"Thumbnail", zh:"缩略图", hi:"थंबनेल", es:"Miniatura", ar:"صورة مصغرة", fr:"Miniature", bn:"থাম্বনেইল", pt:"Thumbnail", ru:"Превью", ur:"تھمب نیل", id:"Thumbnail", de:"Thumbnail", ja:"サムネイル", tr:"Küçük resim", ko:"썸네일", fa:"تصویر بندانگشتی", uk:"Прев’ю", it:"Miniatura", pl:"Miniatura", vi:"Ảnh thu nhỏ" },
  coach: { en:"Coach", zh:"教练", hi:"कोच", es:"Entrenador", ar:"مدرب", fr:"Coach", bn:"কোচ", pt:"Treinador", ru:"Наставник", ur:"کوچ", id:"Pelatih", de:"Coach", ja:"コーチ", tr:"Koç", ko:"코치", fa:"مربی", uk:"Тренер", it:"Coach", pl:"Trener", vi:"Huấn luyện" },
  director: { en:"Video director", zh:"视频导演", hi:"वीडियो निर्देशक", es:"Director de vídeo", ar:"مخرج الفيديو", fr:"Réalisateur vidéo", bn:"ভিডিও পরিচালক", pt:"Diretor de vídeo", ru:"Видеорежиссёр", ur:"ویڈیو ڈائریکٹر", id:"Sutradara video", de:"Video-Regisseur", ja:"ビデオディレクター", tr:"Video yönetmeni", ko:"영상 감독", fa:"کارگردان ویدیو", uk:"Відеорежисер", it:"Regista video", pl:"Reżyser wideo", vi:"Đạo diễn video" },
  clips: { en:"Clip finder", zh:"片段查找", hi:"क्लिप फाइंडर", es:"Buscador de clips", ar:"البحث عن المقاطع", fr:"Recherche de clips", bn:"ক্লিপ ফাইন্ডার", pt:"Localizador de clips", ru:"Поиск клипов", ur:"کلپ فائنڈر", id:"Pencari klip", de:"Clip-Finder", ja:"クリップ検索", tr:"Kesit bulucu", ko:"클립 찾기", fa:"یابنده کلیپ", uk:"Пошук кліпів", it:"Trova clip", pl:"Wyszukiwarka klipów", vi:"Tìm clip" },
  titles: { en:"Title tester", zh:"标题测试", hi:"टाइटल टेस्टर", es:"Probador de títulos", ar:"اختبار العناوين", fr:"Testeur de titres", bn:"টাইটেল টেস্টার", pt:"Testador de títulos", ru:"Тест заголовков", ur:"ٹائٹل ٹیسٹر", id:"Penguji judul", de:"Titel-Tester", ja:"タイトルテスト", tr:"Başlık testçisi", ko:"제목 테스터", fa:"آزمونگر عنوان", uk:"Тестер заголовків", it:"Test titoli", pl:"Tester tytułów", vi:"Kiểm tra tiêu đề" },
  seo: { en:"SEO", zh:"搜索引擎优化", hi:"एसईओ", es:"SEO", ar:"تحسين محركات البحث", fr:"SEO", bn:"এসইও", pt:"SEO", ru:"SEO", ur:"ایس ای او", id:"SEO", de:"SEO", ja:"SEO", tr:"SEO", ko:"SEO", fa:"سئو", uk:"SEO", it:"SEO", pl:"SEO", vi:"SEO" },
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

/* ===== TRENDS PAGE — rebuilt from scratch as a translated static page =====
   Kept as its own table and merged in, so the giant translation block below
   doesn't drown the rest of the dictionary. All values are UI labels the
   page tags with data-t. */
const TR_T = {
  tr_sub: { en:"See what's rising across YouTube right now.", zh:"看看现在 YouTube 上什么在火", hi:"देखें अभी YouTube पर क्या चल रहा है", es:"Mira qué está subiendo en YouTube ahora", ar:"شاهد ما يروج في يوتيوب الآن", fr:"Vois ce qui monte sur YouTube en ce moment", bn:"দেখুন এখন YouTube-এ কী trending", pt:"Vê o que está a subir no YouTube agora", ru:"Смотри, что сейчас в тренде на YouTube", ur:"دیکھیں ابھی YouTube پر کیا چل رہا ہے", id:"Lihat apa yang sedang naik di YouTube sekarang", de:"Sieh, was gerade auf YouTube steigt", ja:"今YouTubeで伸びているものをチェック", tr:"YouTube'da şu an ne yükseliyor gör", ko:"지금 유튜브에서 뜨는 것 확인", fa:"ببین چه چیزی همین حالا در یوتیوب بالا می‌رود", uk:"Дивись, що зараз зростає на YouTube", it:"Scopri cosa sta salendo su YouTube ora", pl:"Zobacz, co rośnie teraz na YouTube", vi:"Xem điều gì đang lên trên YouTube ngay bây giờ" },
  tr_demo: { en:"Demo data — nothing leaves your browser.", zh:"演示数据——一切都在浏览器内完成", hi:"डेमो डेटा — कुछ भी ब्राउज़र से बाहर नहीं जाता", es:"Datos de demostración — nada sale de tu navegador", ar:"بيانات تجريبية — لا شيء يغادر متصفحك", fr:"Données de démo — rien ne quitte votre navigateur", bn:"ডেমো ডেটা — কিছুই ব্রাউজারের বাইরে যায় না", pt:"Dados de demonstração — nada sai do teu navegador", ru:"Демо-данные — ничего не покидает браузер", ur:"ڈیمو ڈیٹا — کچھ بھی براؤزر سے باہر نہیں جاتا", id:"Data demo — tidak ada yang keluar dari browser Anda", de:"Demodaten — nichts verlässt deinen Browser", ja:"デモデータ — ブラウザ外には送信されません", tr:"Demo veri — hiçbir şey tarayıcından çıkmaz", ko:"데모 데이터 — 브라우저 밖으로 나가지 않습니다", fa:"داده دمو — چیزی از مرورگر خارج نمی‌شود", uk:"Демо-дані — нічого не покидає браузер", it:"Dati demo — nulla lascia il tuo browser", pl:"Dane demo — nic nie opuszcza przeglądarki", vi:"Dữ liệu demo — không gì rời khỏi trình duyệt" },
  tr_updated: { en:"Updated just now", zh:"刚刚更新", hi:"अभी अपडेट हुआ", es:"Actualizado ahora", ar:"حُدّث للتو", fr:"Mis à jour à l'instant", bn:"এইমাত্র আপডেট হয়েছে", pt:"Atualizado agora", ru:"Обновлено только что", ur:"ابھی اپ ڈیٹ ہوا", id:"Diperbarui baru saja", de:"Gerade aktualisiert", ja:"たった今更新", tr:"Az önce güncellendi", ko:"방금 업데이트됨", fa:"همین حالا به‌روزرسانی شد", uk:"Щойно оновлено", it:"Aggiornato adesso", pl:"Zaktualizowano przed chwilą", vi:"Vừa cập nhật" },
  tr_search: { en:"Search trends…", zh:"搜索趋势…", hi:"ट्रेंड खोजें…", es:"Buscar tendencias…", ar:"ابحث في الاتجاهات…", fr:"Rechercher des tendances…", bn:"ট্রেন্ড খুঁজুন…", pt:"Procurar tendências…", ru:"Искать тренды…", ur:"ٹرینڈز تلاش کریں…", id:"Cari tren…", de:"Trends suchen…", ja:"トレンドを検索…", tr:"Trend ara…", ko:"트렌드 검색…", fa:"جستجوی ترندها…", uk:"Шукати тренди…", it:"Cerca tendenze…", pl:"Szukaj trendów…", vi:"Tìm xu hướng…" },
  tr_all: { en:"All categories", zh:"全部分类", hi:"सभी श्रेणियाँ", es:"Todas las categorías", ar:"كل الفئات", fr:"Toutes les catégories", bn:"সব বিভাগ", pt:"Todas as categorias", ru:"Все категории", ur:"تمام زمرے", id:"Semua kategori", de:"Alle Kategorien", ja:"すべてのカテゴリ", tr:"Tüm kategoriler", ko:"전체 카테고리", fa:"همه دسته‌ها", uk:"Всі категорії", it:"Tutte le categorie", pl:"Wszystkie kategorie", vi:"Tất cả danh mục" },
  tr_views: { en:"Views", zh:"观看次数", hi:"व्यूज़", es:"Visualizaciones", ar:"المشاهدات", fr:"Vues", bn:"ভিউ", pt:"Visualizações", ru:"Просмотры", ur:"ویوز", id:"Tayangan", de:"Aufrufe", ja:"再生回数", tr:"Görüntülenme", ko:"조회수", fa:"بازدیدها", uk:"Перегляди", it:"Visualizzazioni", pl:"Wyświetlenia", vi:"Lượt xem" },
  tr_growth: { en:"Growth", zh:"增长", hi:"वृद्धि", es:"Crecimiento", ar:"النمو", fr:"Croissance", bn:"বৃদ্ধি", pt:"Crescimento", ru:"Рост", ur:"ترقی", id:"Pertumbuhan", de:"Wachstum", ja:"成長", tr:"Büyüme", ko:"성장", fa:"رشد", uk:"Зростання", it:"Crescita", pl:"Wzrost", vi:"Tăng trưởng" },
  tr_cat: { en:"Category", zh:"分类", hi:"श्रेणी", es:"Categoría", ar:"الفئة", fr:"Catégorie", bn:"বিভাগ", pt:"Categoria", ru:"Категория", ur:"زمرہ", id:"Kategori", de:"Kategorie", ja:"カテゴリ", tr:"Kategori", ko:"카테고리", fa:"دسته", uk:"Категорія", it:"Categoria", pl:"Kategoria", vi:"Danh mục" },
  tr_7d: { en:"7-day change", zh:"7天变化", hi:"7-दिन बदलाव", es:"Cambio en 7 días", ar:"تغير 7 أيام", fr:"Variation sur 7 jours", bn:"৭ দিনের পরিবর্তন", pt:"Mudança em 7 dias", ru:"Изменение за 7 дней", ur:"7 دن کی تبدیلی", id:"Perubahan 7 hari", de:"7-Tage-Änderung", ja:"7日間の変化", tr:"7 günlük değişim", ko:"7일 변화", fa:"تغییر ۷ روزه", uk:"Зміна за 7 днів", it:"Variazione in 7 giorni", pl:"Zmiana w 7 dni", vi:"Thay đổi 7 ngày" },
  tr_rising: { en:"Rising", zh:"上升", hi:"बढ़ रहा", es:"Subiendo", ar:"صاعد", fr:"En hausse", bn:"বাড়ছে", pt:"Em alta", ru:"Растёт", ur:"بڑھ رہا", id:"Naik", de:"Steigend", ja:"上昇中", tr:"Yükseliyor", ko:"상승 중", fa:"در حال رشد", uk:"Зростає", it:"In crescita", pl:"Rośnie", vi:"Đang lên" },
  tr_falling: { en:"Falling", zh:"下降", hi:"गिर रहा", es:"Bajando", ar:"هابط", fr:"En baisse", bn:"কমছে", pt:"Em queda", ru:"Падает", ur:"گر رہا", id:"Turun", de:"Fallend", ja:"下降中", tr:"Düşüyor", ko:"하락 중", fa:"در حال افت", uk:"Падає", it:"In calo", pl:"Spada", vi:"Đang giảm" },
  tr_chart: { en:"Weekly views — top 8", zh:"周观看量 — 前8名", hi:"साप्ताहिक व्यूज़ — टॉप 8", es:"Visualizaciones semanales — top 8", ar:"المشاهدات الأسبوعية — أفضل 8", fr:"Vues hebdomadaires — top 8", bn:"সাপ্তাহিক ভিউ — টপ ৮", pt:"Visualizações semanais — top 8", ru:"Недельные просмотры — топ-8", ur:"ہفتہ وار ویوز — ٹاپ 8", id:"Tayangan mingguan — 8 besar", de:"Wöchentliche Aufrufe — Top 8", ja:"週間再生数 — トップ8", tr:"Haftalık görüntülenme — ilk 8", ko:"주간 조회수 — 상위 8", fa:"بازدید هفتگی — ۸ برتر", uk:"Тижневі перегляди — топ-8", it:"Visualizzazioni settimanali — top 8", pl:"Tygodniowe wyświetlenia — top 8", vi:"Lượt xem tuần — top 8" },
  tr_detail: { en:"Trend deep-dive", zh:"趋势深度分析", hi:"ट्रेंड डीप-डाइव", es:"Análisis profundo de tendencias", ar:"تحليل معمق للاتجاه", fr:"Analyse approfondie des tendances", bn:"ট্রেন্ড ডিপ-ডাইভ", pt:"Análise aprofundada de tendências", ru:"Глубокий анализ тренда", ur:"ٹرینڈ ڈیپ ڈائیو", id:"Analisis mendalam tren", de:"Trend-Tiefenanalyse", ja:"トレンド詳細分析", tr:"Trend derin analizi", ko:"트렌드 심층 분석", fa:"تحلیل عمیق ترند", uk:"Глибокий аналіз тренду", it:"Analisi approfondita del trend", pl:"Głęboka analiza trendu", vi:"Phân tích sâu xu hướng" },
  tr_week: { en:"In the last week", zh:"过去一周", hi:"पिछले हफ्ते में", es:"En la última semana", ar:"في الأسبوع الماضي", fr:"Cette semaine", bn:"গত সপ্তাহে", pt:"Na última semana", ru:"За последнюю неделю", ur:"پچھلے ہفتے میں", id:"Dalam seminggu terakhir", de:"In der letzten Woche", ja:"直近1週間", tr:"Geçen hafta içinde", ko:"지난 주 동안", fa:"در هفته گذشته", uk:"За останній тиждень", it:"Nell'ultima settimana", pl:"W ciągu ostatniego tygodnia", vi:"Trong tuần qua" },
  tr_week_views: { en:"Weekly views", zh:"周观看量", hi:"साप्ताहिक व्यूज़", es:"Visualizaciones semanales", ar:"المشاهدات الأسبوعية", fr:"Vues hebdomadaires", bn:"সাপ্তাহিক ভিউ", pt:"Visualizações semanais", ru:"Недельные просмотры", ur:"ہفتہ وار ویوز", id:"Tayangan mingguan", de:"Wöchentliche Aufrufe", ja:"週間再生数", tr:"Haftalık görüntülenme", ko:"주간 조회수", fa:"بازدید هفتگی", uk:"Тижневі перегляди", it:"Visualizzazioni settimanali", pl:"Tygodniowe wyświetlenia", vi:"Lượt xem tuần" },
  tr_growth_week: { en:"Growth vs last week", zh:"较上周增长", hi:"पिछले हफ्ते से वृद्धि", es:"Crecimiento vs semana pasada", ar:"النمو مقارنة بالأسبوع الماضي", fr:"Croissance vs semaine dernière", bn:"গত সপ্তাহের তুলনায় বৃদ্ধি", pt:"Crescimento vs semana passada", ru:"Рост к прошлой неделе", ur:"پچھلے ہفتے سے ترقی", id:"Pertumbuhan vs minggu lalu", de:"Wachstum vs. letzte Woche", ja:"先週比の成長", tr:"Geçen haftaya göre büyüme", ko:"지난주 대비 성장", fa:"رشد نسبت به هفته قبل", uk:"Зростання до минулого тижня", it:"Crescita vs settimana scorsa", pl:"Wzrost vs poprzedni tydzień", vi:"Tăng trưởng so với tuần trước" },
  tr_act7: { en:"7-day activity", zh:"7天活跃度", hi:"7-दिन गतिविधि", es:"Actividad en 7 días", ar:"نشاط 7 أيام", fr:"Activité sur 7 jours", bn:"৭ দিনের কার্যকলাপ", pt:"Atividade em 7 dias", ru:"Активность за 7 дней", ur:"7 دن کی سرگرمی", id:"Aktivitas 7 hari", de:"7-Tage-Aktivität", ja:"7日間のアクティビティ", tr:"7 günlük aktivite", ko:"7일 활동", fa:"فعالیت ۷ روزه", uk:"Активність за 7 днів", it:"Attività in 7 giorni", pl:"Aktywność w 7 dni", vi:"Hoạt động 7 ngày" },
  tr_no: { en:"No trends match your search", zh:"没有匹配的趋势", hi:"आपकी खोज से कोई ट्रेंड नहीं मिला", es:"Ninguna tendencia coincide con tu búsqueda", ar:"لا توجد اتجاهات تطابق بحثك", fr:"Aucune tendance ne correspond à votre recherche", bn:"আপনার খোঁজে কোনো ট্রেন্ড নেই", pt:"Nenhuma tendência corresponde à tua pesquisa", ru:"Ничего не найдено по вашему запросу", ur:"آپ کی تلاش سے کوئی ٹرینڈ نہیں ملا", id:"Tidak ada tren yang cocok dengan pencarian Anda", de:"Keine Trends zu Ihrer Suche", ja:"検索に一致するトレンドがありません", tr:"Aramanızla eşleşen trend yok", ko:"검색과 일치하는 트렌드가 없습니다", fa:"هیچ ترندی با جستجوی شما مطابقت ندارد", uk:"Нічого не знайдено за вашим запитом", it:"Nessuna tendenza corrisponde alla ricerca", pl:"Brak trendów pasujących do wyszukiwania", vi:"Không có xu hướng phù hợp với tìm kiếm" },
  tr_top: { en:"Top trend views", zh:"热门趋势观看量", hi:"टॉप ट्रेंड व्यूज़", es:"Vistas de la mejor tendencia", ar:"مشاهدات أفضل اتجاه", fr:"Vues de la tendance n°1", bn:"শীর্ষ ট্রেন্ড ভিউ", pt:"Visualizações da tendência nº1", ru:"Просмотры топ-тренда", ur:"ٹاپ ٹرینڈ ویوز", id:"Tayangan tren teratas", de:"Aufrufe des Top-Trends", ja:"トップトレンドの再生数", tr:"Zirve trend görüntülenmesi", ko:"상위 트렌드 조회수", fa:"بازدید برترین ترند", uk:"Перегляди топ-тренду", it:"Visualizzazioni del trend migliore", pl:"Wyświetlenia top trendu", vi:"Lượt xem xu hướng hàng đầu" },
  tr_active: { en:"Active topics", zh:"活跃话题", hi:"सक्रिय विषय", es:"Temas activos", ar:"مواضيع نشطة", fr:"Sujets actifs", bn:"সক্রিয় বিষয়", pt:"Tópicos ativos", ru:"Активные темы", ur:"فعال موضوعات", id:"Topik aktif", de:"Aktive Themen", ja:"活発なトピック", tr:"Aktif konular", ko:"활발한 주제", fa:"موضوع‌های فعال", uk:"Активні теми", it:"Argomenti attivi", pl:"Aktywne tematy", vi:"Chủ đề nổi bật" },
  tr_gainer: { en:"Fastest gainer", zh:"增长最快", hi:"सबसे तेज़ बढ़ोतरी", es:"Mayor crecimiento", ar:"الأسرع نمواً", fr:"Plus forte hausse", bn:"সবচেয়ে দ্রুত বাড়ছে", pt:"Maior crescimento", ru:"Самый быстрый рост", ur:"تیزترین ترقی", id:"Peningkatan tercepat", de:"Stärkster Anstieg", ja:"最速成長", tr:"En hızlı yükselen", ko:"가장 빠른 성장", fa:"سریع‌ترین رشد", uk:"Найшвидше зростання", it:"Crescita più rapida", pl:"Najszybszy wzrost", vi:"Tăng trưởng nhanh nhất" },
  tr_opp: { en:"Opportunity", zh:"机会分", hi:"अवसर", es:"Oportunidad", ar:"الفرصة", fr:"Opportunité", bn:"সুযোগ", pt:"Oportunidade", ru:"Возможность", ur:"مواقع", id:"Peluang", de:"Chance", ja:"チャンス", tr:"Fırsat", ko:"기회", fa:"فرصت", uk:"Можливість", it:"Opportunità", pl:"Okazja", vi:"Cơ hội" },
  tr_opp_s: { en:"An opportunity score weighs growth speed against competition. Higher is a better bet right now.", zh:"机会分权衡增长速度与竞争。分数越高，眼下越值得做。", hi:"अवसर स्कोर ग्रोथ गति बनाम प्रतिस्पर्धा तौलता है। जितना ऊँचा, उतना अच्छा दाँव।", es:"La puntuación de oportunidad pondera la velocidad de crecimiento frente a la competencia. Más alta es mejor apuesta.", ar:"درجة الفرصة تزن سرعة النمو مقابل المنافسة. الأعلى أفضل رهان الآن.", fr:"Le score d'opportunité pèse la vitesse de croissance face à la concurrence. Plus il est haut, meilleur est le pari.", bn:"সুযোগ স্কোর প্রবৃদ্ধির গতি বনাম প্রতিযোগিতা ওজন করে। বেশি মানে এখনই ভালো বাজি।", pt:"A pontuação de oportunidade pesa a velocidade de crescimento contra a concorrência. Mais alta é melhor aposta.", ru:"Оценка возможности взвешивает скорость роста против конкуренции. Чем выше, тем лучше ставка.", ur:"موقع سکور ترقی کی رفتار بمقابلہ مقابلہ تولتا ہے۔ جتنا زیادہ، اتنا بہتر۔", id:"Skor peluang menimbang kecepatan pertumbuhan lawan persaingan. Semakin tinggi, semakin baik.", de:"Der Chancenwert wägt Wachstumstempo gegen Konkurrenz ab. Höher ist die bessere Wette.", ja:"チャンススコアは成長速度と競争を比較します。高いほど今の狙い目。", tr:"Fırsat puanı büyüme hızı ile rekabeti tartar. Ne kadar yüksekse o kadar iyi bahis.", ko:"기회 점수는 성장 속도와 경쟁을 저울질합니다. 높을수록 더 좋은 선택입니다.", fa:"امتیاز فرصت سرعت رشد را در برابر رقابت می‌سنجد. هرچه بالاتر، شرط بهتر.", uk:"Оцінка можливості зважує швидкість зростання проти конкуренції. Чим вища, тим краща ставка.", it:"Il punteggio di opportunità pesa la velocità di crescita contro la concorrenza. Più alto è, meglio è.", pl:"Wynik okazji waży tempo wzrostu wobec konkurencji. Im wyżej, tym lepsza inwestycja.", vi:"Điểm cơ hội cân tốc độ tăng trưởng với mức cạnh tranh. Càng cao càng nên làm ngay." },
  tr_create: { en:"Create Video →", zh:"创建视频 →", hi:"वीडियो बनाएं →", es:"Crear vídeo →", ar:"أنشئ فيديو ←", fr:"Créer la vidéo →", bn:"ভিডিও তৈরি করুন →", pt:"Criar vídeo →", ru:"Создать видео →", ur:"ویڈیو بنائیں →", id:"Buat video →", de:"Video erstellen →", ja:"動画を作成 →", tr:"Video oluştur →", ko:"영상 만들기 →", fa:"ساخت ویدیو ←", uk:"Створити відео →", it:"Crea video →", pl:"Utwórz wideo →", vi:"Tạo video →" },
  tr_vs: { en:"vs last week", zh:"较上周", hi:"पिछले हफ्ते से", es:"vs la semana pasada", ar:"مقارنة بالأسبوع الماضي", fr:"vs semaine dernière", bn:"গত সপ্তাহের তুলনায়", pt:"vs semana passada", ru:"к прошлой неделе", ur:"پچھلے ہفتے سے", id:"vs minggu lalu", de:"vs. letzte Woche", ja:"先週比", tr:"geçen haftaya göre", ko:"지난주 대비", fa:"نسبت به هفته قبل", uk:"до минулого тижня", it:"vs settimana scorsa", pl:"vs poprzedni tydzień", vi:"so với tuần trước" },
  cat_cricket: { en:"Cricket", zh:"板球", hi:"क्रिकेट", es:"Críquet", ar:"كريكيت", fr:"Cricket", bn:"ক্রিকেট", pt:"Críquete", ru:"Крикет", ur:"کرکٹ", id:"Kriket", de:"Cricket", ja:"クリケット", tr:"Kriket", ko:"크리켓", fa:"کریکت", uk:"Крикет", it:"Cricket", pl:"Krykiet", vi:"Cricket" },
  cat_snooker: { en:"Snooker", zh:"斯诺克", hi:"स्नूकर", es:"Snooker", ar:"سنوكر", fr:"Snooker", bn:"স্নুকার", pt:"Snooker", ru:"Снукер", ur:"اسنوکر", id:"Snooker", de:"Snooker", ja:"スヌーカー", tr:"Snooker", ko:"스누커", fa:"اسنوکر", uk:"Снукер", it:"Snooker", pl:"Snooker", vi:"Bi-a lỗ" },
  cat_gaming: { en:"Gaming", zh:"游戏", hi:"गेमिंग", es:"Gaming", ar:"ألعاب", fr:"Gaming", bn:"গেমিং", pt:"Gaming", ru:"Гейминг", ur:"گیمنگ", id:"Gaming", de:"Gaming", ja:"ゲーム", tr:"Oyun", ko:"게임", fa:"گیمینگ", uk:"Геймінг", it:"Gaming", pl:"Gaming", vi:"Chơi game" },
  cat_football: { en:"Football", zh:"足球", hi:"फुटबॉल", es:"Fútbol", ar:"كرة القدم", fr:"Football", bn:"ফুটবল", pt:"Futebol", ru:"Футбол", ur:"فٹ بال", id:"Sepak bola", de:"Fußball", ja:"サッカー", tr:"Futbol", ko:"축구", fa:"فوتبال", uk:"Футбол", it:"Calcio", pl:"Piłka nożna", vi:"Bóng đá" },
  cat_sports: { en:"Sports", zh:"体育", hi:"खेल", es:"Deportes", ar:"رياضة", fr:"Sports", bn:"খেলা", pt:"Desporto", ru:"Спорт", ur:"کھیل", id:"Olahraga", de:"Sport", ja:"スポーツ", tr:"Spor", ko:"스포츠", fa:"ورزش", uk:"Спорт", it:"Sport", pl:"Sport", vi:"Thể thao" },
  cat_tech: { en:"Tech", zh:"科技", hi:"टेक", es:"Tecnología", ar:"تقنية", fr:"Tech", bn:"টেক", pt:"Tecnologia", ru:"Техно", ur:"ٹیک", id:"Teknologi", de:"Tech", ja:"テック", tr:"Teknoloji", ko:"테크", fa:"تکنولوژی", uk:"Тех", it:"Tecnologia", pl:"Tech", vi:"Công nghệ" },
  cat_music: { en:"Music", zh:"音乐", hi:"संगीत", es:"Música", ar:"موسيقى", fr:"Musique", bn:"সঙ্গীত", pt:"Música", ru:"Музыка", ur:"موسیقی", id:"Musik", de:"Musik", ja:"音楽", tr:"Müzik", ko:"음악", fa:"موسیقی", uk:"Музика", it:"Musica", pl:"Muzyka", vi:"Âm nhạc" },
  cat_dance: { en:"Dance", zh:"舞蹈", hi:"डांस", es:"Danza", ar:"رقص", fr:"Danse", bn:"নাচ", pt:"Dança", ru:"Танцы", ur:"رقص", id:"Tari", de:"Tanz", ja:"ダンス", tr:"Dans", ko:"댄스", fa:"رقص", uk:"Танець", it:"Danza", pl:"Taniec", vi:"Nhảy múa" },
  cat_travel: { en:"Travel", zh:"旅行", hi:"यात्रा", es:"Viajes", ar:"سفر", fr:"Voyage", bn:"ভ্রমণ", pt:"Viagens", ru:"Путешествия", ur:"سفر", id:"Wisata", de:"Reisen", ja:"旅行", tr:"Seyahat", ko:"여행", fa:"سفر", uk:"Подорожі", it:"Viaggi", pl:"Podróże", vi:"Du lịch" },
  cat_food: { en:"Food", zh:"美食", hi:"खाना", es:"Comida", ar:"طعام", fr:"Cuisine", bn:"খাবার", pt:"Comida", ru:"Еда", ur:"کھانا", id:"Kuliner", de:"Essen", ja:"グルメ", tr:"Yemek", ko:"음식", fa:"غذا", uk:"Їжа", it:"Cibo", pl:"Jedzenie", vi:"Ẩm thực" },
  cat_pop: { en:"Pop Culture", zh:"流行文化", hi:"पॉप कल्चर", es:"Cultura pop", ar:"ثقافة شعبية", fr:"Culture pop", bn:"পপ কালচার", pt:"Cultura pop", ru:"Поп-культура", ur:"پاپ کلچر", id:"Budaya pop", de:"Popkultur", ja:"ポップカルチャー", tr:"Pop kültür", ko:"대중문화", fa:"فرهنگ عامه", uk:"Поп-культура", it:"Cultura pop", pl:"Kultura popularna", vi:"Văn hóa đại chúng" },
  cat_science: { en:"Science", zh:"科学", hi:"विज्ञान", es:"Ciencia", ar:"علوم", fr:"Science", bn:"বিজ্ঞান", pt:"Ciência", ru:"Наука", ur:"سائنس", id:"Sains", de:"Wissenschaft", ja:"科学", tr:"Bilim", ko:"과학", fa:"علم", uk:"Наука", it:"Scienza", pl:"Nauka", vi:"Khoa học" },
  cat_edu: { en:"Education", zh:"教育", hi:"शिक्षा", es:"Educación", ar:"تعليم", fr:"Éducation", bn:"শিক্ষা", pt:"Educação", ru:"Образование", ur:"تعلیم", id:"Pendidikan", de:"Bildung", ja:"教育", tr:"Eğitim", ko:"교육", fa:"آموزش", uk:"Освіта", it:"Istruzione", pl:"Edukacja", vi:"Giáo dục" },
  cat_design: { en:"Design", zh:"设计", hi:"डिज़ाइन", es:"Diseño", ar:"تصميم", fr:"Design", bn:"ডিজাইন", pt:"Design", ru:"Дизайн", ur:"ڈیزائن", id:"Desain", de:"Design", ja:"デザイン", tr:"Tasarım", ko:"디자인", fa:"طراحی", uk:"Дизайн", it:"Design", pl:"Design", vi:"Thiết kế" },
  cat_comedy: { en:"Comedy", zh:"喜剧", hi:"कॉमेडी", es:"Comedia", ar:"كوميديا", fr:"Comédie", bn:"কমেডি", pt:"Comédia", ru:"Комедия", ur:"کامیڈی", id:"Komedi", de:"Comedy", ja:"コメディ", tr:"Komedi", ko:"코미디", fa:"کمدی", uk:"Комедія", it:"Commedia", pl:"Komedia", vi:"Hài kịch" },
  cat_history: { en:"History", zh:"历史", hi:"इतिहास", es:"Historia", ar:"تاريخ", fr:"Histoire", bn:"ইতিহাস", pt:"História", ru:"История", ur:"تاریخ", id:"Sejarah", de:"Geschichte", ja:"歴史", tr:"Tarih", ko:"역사", fa:"تاریخ", uk:"Історія", it:"Storia", pl:"Historia", vi:"Lịch sử" },
  cat_art: { en:"Art", zh:"艺术", hi:"कला", es:"Arte", ar:"فن", fr:"Art", bn:"শিল্প", pt:"Arte", ru:"Искусство", ur:"آرٹ", id:"Seni", de:"Kunst", ja:"アート", tr:"Sanat", ko:"예술", fa:"هنر", uk:"Мистецтво", it:"Arte", pl:"Sztuka", vi:"Nghệ thuật" },
  cat_fashion: { en:"Fashion", zh:"时尚", hi:"फैशन", es:"Moda", ar:"موضة", fr:"Mode", bn:"ফ্যাশন", pt:"Moda", ru:"Мода", ur:"فیشن", id:"Mode", de:"Mode", ja:"ファッション", tr:"Moda", ko:"패션", fa:"مد", uk:"Мода", it:"Moda", pl:"Moda", vi:"Thời trang" },
  cat_beauty: { en:"Beauty", zh:"美妆", hi:"ब्यूटी", es:"Belleza", ar:"تجميل", fr:"Beauté", bn:"বিউটি", pt:"Beleza", ru:"Красота", ur:"بیوٹی", id:"Kecantikan", de:"Schönheit", ja:"美容", tr:"Güzellik", ko:"뷰티", fa:"زیبایی", uk:"Краса", it:"Bellezza", pl:"Uroda", vi:"Làm đẹp" },
  cat_nature: { en:"Nature", zh:"自然", hi:"प्रकृति", es:"Naturaleza", ar:"طبيعة", fr:"Nature", bn:"প্রকৃতি", pt:"Natureza", ru:"Природа", ur:"فطرت", id:"Alam", de:"Natur", ja:"自然", tr:"Doğa", ko:"자연", fa:"طبیعت", uk:"Природа", it:"Natura", pl:"Przyroda", vi:"Thiên nhiên" },
  cat_pets: { en:"Pets", zh:"宠物", hi:"पालतू जानवर", es:"Mascotas", ar:"حيوانات أليفة", fr:"Animaux", bn:"পোষা প্রাণী", pt:"Animais de estimação", ru:"Питомцы", ur:"پالتو جانور", id:"Hewan peliharaan", de:"Haustiere", ja:"ペット", tr:"Evcil hayvanlar", ko:"반려동물", fa:"حیوانات خانگی", uk:"Домашні тварини", it:"Animali domestici", pl:"Zwierzęta domowe", vi:"Thú cưng" },
  cat_animals: { en:"Animals", zh:"动物", hi:"जानवर", es:"Animales", ar:"حيوانات", fr:"Animaux", bn:"প্রাণী", pt:"Animais", ru:"Животные", ur:"جانور", id:"Hewan", de:"Tiere", ja:"動物", tr:"Hayvanlar", ko:"동물", fa:"حیوانات", uk:"Тварини", it:"Animali", pl:"Zwierzęta", vi:"Động vật" },
  cat_finance: { en:"Finance", zh:"财经", hi:"वित्त", es:"Finanzas", ar:"مالية", fr:"Finance", bn:"অর্থ", pt:"Finanças", ru:"Финансы", ur:"مالیات", id:"Keuangan", de:"Finanzen", ja:"ファイナンス", tr:"Finans", ko:"금융", fa:"مالی", uk:"Фінанси", it:"Finanza", pl:"Finanse", vi:"Tài chính" },
  cat_business: { en:"Business", zh:"商业", hi:"व्यवसाय", es:"Negocios", ar:"أعمال", fr:"Affaires", bn:"ব্যবসা", pt:"Negócios", ru:"Бизнес", ur:"بزنس", id:"Bisnis", de:"Wirtschaft", ja:"ビジネス", tr:"İş", ko:"비즈니스", fa:"کسب‌وکار", uk:"Бізнес", it:"Business", pl:"Biznes", vi:"Kinh doanh" },
  cat_career: { en:"Career", zh:"职业", hi:"करियर", es:"Carrera", ar:"مسار مهني", fr:"Carrière", bn:"ক্যারিয়ার", pt:"Carreira", ru:"Карьера", ur:"کیریئر", id:"Karier", de:"Karriere", ja:"キャリア", tr:"Kariyer", ko:"커리어", fa:"حرفه", uk:"Кар'єра", it:"Carriera", pl:"Kariera", vi:"Sự nghiệp" },
  cat_drink: { en:"Food & Drink", zh:"美食与饮品", hi:"खान-पान", es:"Comida y bebida", ar:"طعام وشراب", fr:"Cuisine et boissons", bn:"খাবার ও পানীয়", pt:"Comida e bebida", ru:"Еда и напитки", ur:"کھانا اور مشروبات", id:"Makanan & minuman", de:"Essen & Trinken", ja:"グルメ＆ドリンク", tr:"Yiyecek & içecek", ko:"음식과 음료", fa:"خوراک و نوشیدنی", uk:"Їжа та напої", it:"Cibo e bevande", pl:"Jedzenie i napoje", vi:"Ẩm thực & đồ uống" }
};
Object.assign(T, TR_T);

/* ===== PRICING PAGE — visible chrome translated, checkout JS left alone ===== */
const PR_T = {
  plans: { en:"Plans &", zh:"方案与", hi:"योजनाएं और", es:"Planes y", ar:"الخطط و", fr:"Forfaits et", bn:"পরিকল্পনা ও", pt:"Planos e", ru:"Тарифы и", ur:"پلانز اور", id:"Paket dan", de:"Pläne und", ja:"プランと", tr:"Planlar ve", ko:"요금제 및", fa:"طرح‌ها و", uk:"Тарифи та", it:"Piani e", pl:"Plany i", vi:"Gói và" },
  price_sub: { en:"The kid's core experience is free. Paid plans fund the platform — and every ad or offer lives on the <a href='parent.html'>parent dashboard</a>, never in front of the kids.", zh:"孩子的核心体验免费。付费方案为平台提供支持——所有广告或优惠都只在<a href='parent.html'>家长面板</a>中，绝不出现在孩子面前。", hi:"बच्चों का मुख्य अनुभव मुफ़्त है। पेड प्लान प्लेटफ़ॉर्म को चलाते हैं — और हर विज्ञापन या ऑफर <a href='parent.html'>पैरेंट डैशबोर्ड</a> पर होता है, कभी बच्चों के सामने नहीं।", es:"La experiencia principal del niño es gratis. Los planes de pago financian la plataforma — y cada anuncio u oferta vive en el <a href='parent.html'>panel de padres</a>, nunca frente a los niños.", ar:"تجربة الطفل الأساسية مجانية. الخطط المدفوعة تمول المنصة — وكل إعلان أو عرض يكون في <a href='parent.html'>لوحة الأهل</a>، وليس أمام الأطفال أبدًا.", fr:"L'expérience principale de l'enfant est gratuite. Les forfaits payants financent la plateforme — chaque pub ou offre vit dans le <a href='parent.html'>tableau de bord parental</a>, jamais devant les enfants.", bn:"বাচ্চাদের মূল অভিজ্ঞতা ফ্রি। পেইড প্ল্যান প্ল্যাটফর্ম চালায় — আর প্রতিটি বিজ্ঞাপন বা অফার <a href='parent.html'>অভিভাবক ড্যাশবোর্ডে</a> থাকে, বাচ্চাদের সামনে কখনো না।", pt:"A experiência principal do miúdo é grátis. Os planos pagos financiam a plataforma — e cada anúncio ou oferta vive no <a href='parent.html'>painel dos pais</a>, nunca à frente dos miúdos.", ru:"Основной опыт ребёнка бесплатен. Платные тарифы финансируют платформу — вся реклама и предложения живут на <a href='parent.html'>родительской панели</a>, никогда перед детьми.", ur:"بچوں کا بنیادی تجربہ مفت ہے۔ پےڈ پلانز پلیٹ فارم چلاتے ہیں — اور ہر اشتہار یا آفر <a href='parent.html'>والدین کے ڈیش بورڈ</a> پر ہوتا ہے، کبھی بچوں کے سامنے نہیں۔", id:"Pengalaman utama anak gratis. Paket berbayar mendanai platform — dan setiap iklan atau penawaran ada di <a href='parent.html'>dasbor orang tua</a>, tidak pernah di depan anak.", de:"Die Kern-Erfahrung des Kindes ist kostenlos. Bezahlte Pläne finanzieren die Plattform — und jede Anzeige oder jedes Angebot lebt im <a href='parent.html'>Eltern-Dashboard</a>, nie vor den Kindern.", ja:"子供の基本体験は無料です。有料プランがプラットフォームを支えます — 広告やオファーはすべて<a href='parent.html'>保護者ダッシュボード</a>に置かれ、子供の前には一切出ません。", tr:"Çocuğun temel deneyimi ücretsiz. Ücretli planlar platformu finanse eder — tüm reklam ve teklifler <a href='parent.html'>veli panelinde</a> yaşar, çocukların önünde asla.", ko:"아이의 핵심 경험은 무료입니다. 유료 플랜이 플랫폼을 운영하며 — 모든 광고나 제안은 <a href='parent.html'>부모 대시보드</a>에만 있고, 아이들 앞에는 절대 없습니다.", fa:"تجربه اصلی کودک رایگان است. پلن‌های پولی هزینه پلتفرم را تأمین می‌کنند — و هر تبلیغ یا پیشنهاد فقط در <a href='parent.html'>داشبورد والدین</a> دیده می‌شود، هرگز جلوی کودکان.", uk:"Основний досвід дитини безкоштовний. Платні тарифи фінансують платформу — вся реклама живе на <a href='parent.html'>батьківській панелі</a>, ніколи перед дітьми.", it:"L'esperienza principale del bambino è gratuita. I piani a pagamento finanziano la piattaforma — ogni annuncio o offerta vive nel <a href='parent.html'>pannello genitori</a>, mai davanti ai bambini.", pl:"Podstawowe doświadczenie dziecka jest darmowe. Płatne plany finansują platformę — każda reklama lub oferta żyje na <a href='parent.html'>panelu rodzica</a>, nigdy przed dziećmi.", vi:"Trải nghiệm cốt lõi của trẻ miễn phí. Gói trả phí tài trợ nền tảng — mọi quảng cáo hay ưu đãi nằm ở <a href='parent.html'>bảng điều khiển phụ huynh</a>, không bao giờ trước mặt trẻ." },
  currency: { en:"Currency", zh:"货币", hi:"मुद्रा", es:"Moneda", ar:"العملة", fr:"Devise", bn:"মুদ্রা", pt:"Moeda", ru:"Валюта", ur:"کرنسی", id:"Mata uang", de:"Währung", ja:"通貨", tr:"Para birimi", ko:"통화", fa:"ارز", uk:"Валюта", it:"Valuta", pl:"Waluta", vi:"Tiền tệ" },
  monthly: { en:"Monthly", zh:"每月", hi:"मासिक", es:"Mensual", ar:"شهري", fr:"Mensuel", bn:"মাসিক", pt:"Mensal", ru:"Ежемесячно", ur:"ماہانہ", id:"Bulanan", de:"Monatlich", ja:"月額", tr:"Aylık", ko:"월간", fa:"ماهانه", uk:"Щомісяця", it:"Mensile", pl:"Miesięcznie", vi:"Hàng tháng" },
  yearly: { en:"Yearly", zh:"每年", hi:"वार्षिक", es:"Anual", ar:"سنوي", fr:"Annuel", bn:"বার্ষিক", pt:"Anual", ru:"Ежегодно", ur:"سالانہ", id:"Tahunan", de:"Jährlich", ja:"年額", tr:"Yıllık", ko:"연간", fa:"سالانه", uk:"Щорічно", it:"Annuale", pl:"Rocznie", vi:"Hàng năm" },
  twomonths: { en:"2 months free", zh:"免费2个月", hi:"2 महीने मुफ़्त", es:"2 meses gratis", ar:"شهران مجانًا", fr:"2 mois offerts", bn:"২ মাস ফ্রি", pt:"2 meses grátis", ru:"2 месяца бесплатно", ur:"2 ماہ مفت", id:"Gratis 2 bulan", de:"2 Monate gratis", ja:"2ヶ月無料", tr:"2 ay bedava", ko:"2개월 무료", fa:"۲ ماه رایگان", uk:"2 місяці безкоштовно", it:"2 mesi gratis", pl:"2 miesiące gratis", vi:"Miễn phí 2 tháng" },
  onetime: { en:"One-time", zh:"一次性", hi:"एकमुश्त", es:"Pago único", ar:"دفعة واحدة", fr:"Paiement unique", bn:"এককালীন", pt:"Pagamento único", ru:"Разовый платёж", ur:"ایک بار", id:"Sekali bayar", de:"Einmalig", ja:"一括払い", tr:"Tek seferlik", ko:"일시불", fa:"یک‌باره", uk:"Разовий платіж", it:"Pagamento unico", pl:"Jednorazowo", vi:"Trả một lần" },
  certs: { en:"certificates", zh:"证书", hi:"सर्टिफिकेट", es:"certificados", ar:"شهادات", fr:"certificats", bn:"সার্টিফিকেট", pt:"certificados", ru:"сертификаты", ur:"سرٹیفکیٹس", id:"sertifikat", de:"Zertifikate", ja:"認定証", tr:"sertifikalar", ko:"자격증", fa:"گواهی‌ها", uk:"сертифікати", it:"certificati", pl:"certyfikaty", vi:"chứng chỉ" },
  permonth: { en:"/month", zh:"/月", hi:"/महीना", es:"/mes", ar:"/شهر", fr:"/mois", bn:"/মাস", pt:"/mês", ru:"/мес", ur:"/ماہ", id:"/bulan", de:"/Monat", ja:"/月", tr:"/ay", ko:"/월", fa:"/ماه", uk:"/міс", it:"/mese", pl:"/mies.", vi:"/tháng" },
  peronce: { en:"one-time", zh:"一次性", hi:"एकमुश्त", es:"pago único", ar:"دفعة واحدة", fr:"une fois", bn:"এককালীন", pt:"pagamento único", ru:"разово", ur:"ایک بار", id:"sekali bayar", de:"einmalig", ja:"一括払い", tr:"tek seferlik", ko:"일시불", fa:"یک‌باره", uk:"разово", it:"una tantum", pl:"jednorazowo", vi:"một lần" },
  fam_dash: { en:"Family Dashboard", zh:"家庭面板", hi:"फैमिली डैशबोर्ड", es:"Panel familiar", ar:"لوحة العائلة", fr:"Tableau familial", bn:"ফ্যামিলি ড্যাশবোর্ড", pt:"Painel familiar", ru:"Семейная панель", ur:"فیملی ڈیش بورڈ", id:"Dasbor keluarga", de:"Familien-Dashboard", ja:"ファミリーダッシュボード", tr:"Aile Paneli", ko:"가족 대시보드", fa:"داشبورد خانواده", uk:"Сімейна панель", it:"Pannello famiglia", pl:"Panel rodzinny", vi:"Bảng điều khiển gia đình" },
  kids_up: { en:"Kids' Tools Upgrade", zh:"孩子工具升级", hi:"किड्स टूल्स अपग्रेड", es:"Mejora de herramientas para niños", ar:"ترقية أدوات الأطفال", fr:"Forfait enfants", bn:"কিডস টুলস আপগ্রেড", pt:"Upgrade de ferramentas para miúdos", ru:"Детские инструменты Pro", ur:"کڈز ٹولز اپ گریڈ", id:"Upgrade alat anak", de:"Kinder-Tools-Upgrade", ja:"子供ツールアップグレード", tr:"Çocuk Araçları Yükseltme", ko:"키즈 도구 업그레이드", fa:"ارتقای ابزار کودکان", uk:"Дитячі інструменти Pro", it:"Upgrade strumenti bambini", pl:"Rozszerzenie narzędzi dla dzieci", vi:"Nâng cấp công cụ trẻ em" },
  fam_bundle: { en:"Family Bundle", zh:"家庭套装", hi:"फैमिली बंडल", es:"Paquete familiar", ar:"باقة العائلة", fr:"Pack famille", bn:"ফ্যামিলি বান্ডেল", pt:"Pacote familiar", ru:"Семейный пакет", ur:"فیملی بنڈل", id:"Paket keluarga", de:"Familien-Bundle", ja:"ファミリーバンドル", tr:"Aile Paketi", ko:"가족 번들", fa:"باندل خانواده", uk:"Сімейний пакет", it:"Pacchetto famiglia", pl:"Pakiet rodzinny", vi:"Gói gia đình" },
  cert_basic: { en:"Basic Certificate", zh:"基础证书", hi:"बेसिक सर्टिफिकेट", es:"Certificado básico", ar:"شهادة أساسية", fr:"Certificat de base", bn:"বেসিক সার্টিফিকেট", pt:"Certificado básico", ru:"Базовый сертификат", ur:"بیسک سرٹیفکیٹ", id:"Sertifikat dasar", de:"Basis-Zertifikat", ja:"ベーシック認定証", tr:"Temel Sertifika", ko:"베이직 인증서", fa:"گواهی پایه", uk:"Базовий сертифікат", it:"Certificato base", pl:"Certyfikat podstawowy", vi:"Chứng chỉ cơ bản" },
  cert_adv: { en:"Advanced Certificate", zh:"高级证书", hi:"एडवांस सर्टिफिकेट", es:"Certificado avanzado", ar:"شهادة متقدمة", fr:"Certificat avancé", bn:"অ্যাডভান্সড সার্টিফিকেট", pt:"Certificado avançado", ru:"Продвинутый сертификат", ur:"ایڈوانس سرٹیفکیٹ", id:"Sertifikat lanjutan", de:"Fortgeschrittenen-Zertifikat", ja:"アドバンスト認定証", tr:"İleri Sertifika", ko:"고급 인증서", fa:"گواهی پیشرفته", uk:"Просунутий сертифікат", it:"Certificato avanzato", pl:"Certyfikat zaawansowany", vi:"Chứng chỉ nâng cao" },
  cert_master: { en:"Master Certificate", zh:"大师证书", hi:"मास्टर सर्टिफिकेट", es:"Certificado maestro", ar:"شهادة خبير", fr:"Certificat expert", bn:"মাস্টার সার্টিফিকেট", pt:"Certificado mestre", ru:"Сертификат мастера", ur:"ماسٹر سرٹیفکیٹ", id:"Sertifikat master", de:"Master-Zertifikat", ja:"マスター認定証", tr:"Usta Sertifika", ko:"마스터 인증서", fa:"گواهی استاد", uk:"Сертифікат майстра", it:"Certificato master", pl:"Certyfikat mistrza", vi:"Chứng chỉ bậc thầy" },
  bestvalue: { en:"BEST VALUE", zh:"最划算", hi:"सबसे बेहतरीन वैल्यू", es:"MEJOR RELACIÓN", ar:"أفضل قيمة", fr:"MEILLEUR RAPPORT", bn:"সেরা মূল্য", pt:"MELHOR PREÇO", ru:"ЛУЧШАЯ ЦЕНА", ur:"بہترین ویلیو", id:"NILAI TERBAIK", de:"BESTES PREIS-LEISTUNGS-VERHÄLTNIS", ja:"一番お得", tr:"EN İYİ DEĞER", ko:"최고 가치", fa:"بهترین ارزش", uk:"НАЙКРАЩА ЦІНА", it:"MIGLIOR PREZZO", pl:"NAJLEPSZA CENA", vi:"GIÁ TRỊ TỐT NHẤT" },
  toptier: { en:"TOP TIER", zh:"顶级", hi:"टॉप टियर", es:"NIVEL SUPERIOR", ar:"أعلى مستوى", fr:"NIVEAU SUPÉRIEUR", bn:"শীর্ষ স্তর", pt:"NÍVEL SUPERIOR", ru:"ВЫСШИЙ УРОВЕНЬ", ur:"ٹاپ ٹیئر", id:"TINGKAT TERATAS", de:"TOP-STUFE", ja:"トップティア", tr:"EN ÜST SEVİYE", ko:"최상위", fa:"سطح برتر", uk:"НАЙВИЩИЙ РІВЕНЬ", it:"LIVELLO MASSIMO", pl:"NAJWYŻSZY POZIOM", vi:"HẠNG CAO NHẤT" },
  cta_trial: { en:"Start free trial", zh:"开始免费试用", hi:"मुफ़्त ट्रायल शुरू करें", es:"Iniciar prueba gratis", ar:"ابدأ التجربة المجانية", fr:"Essai gratuit", bn:"ফ্রি ট্রায়াল শুরু করুন", pt:"Iniciar teste grátis", ru:"Начать бесплатно", ur:"مفت ٹرائل شروع کریں", id:"Mulai uji coba gratis", de:"Kostenlos testen", ja:"無料トライアル開始", tr:"Ücretsiz denemeyi başlat", ko:"무료 체험 시작", fa:"شروع رایگان", uk:"Почати безкоштовно", it:"Prova gratuita", pl:"Zacznij za darmo", vi:"Dùng thử miễn phí" },
  cta_upgrade: { en:"Upgrade tools", zh:"升级工具", hi:"टूल्स अपग्रेड करें", es:"Mejorar herramientas", ar:"ترقية الأدوات", fr:"Améliorer les outils", bn:"টুলস আপগ্রেড করুন", pt:"Melhorar ferramentas", ru:"Улучшить инструменты", ur:"ٹولز اپ گریڈ کریں", id:"Tingkatkan alat", de:"Tools upgraden", ja:"ツールをアップグレード", tr:"Araçları yükselt", ko:"도구 업그레이드", fa:"ارتقای ابزارها", uk:"Покращити інструменти", it:"Migliora gli strumenti", pl:"Ulepsz narzędzia", vi:"Nâng cấp công cụ" },
  cta_bundle: { en:"Get the bundle", zh:"获取套装", hi:"बंडल लें", es:"Obtener el paquete", ar:"احصل على الباقة", fr:"Obtenir le pack", bn:"বান্ডেল নিন", pt:"Obter o pacote", ru:"Взять пакет", ur:"بنڈل حاصل کریں", id:"Ambil paketnya", de:"Bundle holen", ja:"バンドルを購入", tr:"Paketi al", ko:"번들 받기", fa:"باندل بگیرید", uk:"Отримати пакет", it:"Ottieni il pacchetto", pl:"Weź pakiet", vi:"Lấy gói" },
  cta_basic: { en:"Get Basic", zh:"获取基础版", hi:"बेसिक लें", es:"Obtener Básico", ar:"احصل على الأساسية", fr:"Obtenir Basic", bn:"বেসিক নিন", pt:"Obter Básico", ru:"Взять Basic", ur:"بیسک حاصل کریں", id:"Ambil Basic", de:"Basic holen", ja:"Basicを購入", tr:"Basic al", ko:"베이직 받기", fa:"پایه بگیرید", uk:"Взяти Basic", it:"Ottieni Basic", pl:"Weź Basic", vi:"Lấy Basic" },
  cta_adv: { en:"Get Advanced", zh:"获取高级版", hi:"एडवांस लें", es:"Obtener Avanzado", ar:"احصل على المتقدمة", fr:"Obtenir Advanced", bn:"অ্যাডভান্সড নিন", pt:"Obter Avançado", ru:"Взять Advanced", ur:"ایڈوانس حاصل کریں", id:"Ambil Advanced", de:"Advanced holen", ja:"Advancedを購入", tr:"Advanced al", ko:"고급 받기", fa:"پیشرفته بگیرید", uk:"Взяти Advanced", it:"Ottieni Advanced", pl:"Weź Advanced", vi:"Lấy Advanced" },
  cta_master: { en:"Get Master", zh:"获取大师版", hi:"मास्टर लें", es:"Obtener Master", ar:"احصل على الخبير", fr:"Obtenir Master", bn:"মাস্টার নিন", pt:"Obter Master", ru:"Взять Master", ur:"ماسٹر حاصل کریں", id:"Ambil Master", de:"Master holen", ja:"Masterを購入", tr:"Master al", ko:"마스터 받기", fa:"استاد بگیرید", uk:"Взяти Master", it:"Ottieni Master", pl:"Weź Master", vi:"Lấy Master" },
  f1: { en:"Parental controls & PIN access", zh:"家长控制与PIN访问", hi:"पैरेंटल कंट्रोल और PIN एक्सेस", es:"Controles parentales y acceso PIN", ar:"رقابة الوالدين ورمز PIN", fr:"Contrôles parentaux et code PIN", bn:"অভিভাবক নিয়ন্ত্রণ ও PIN অ্যাক্সেস", pt:"Controlos parentais e PIN", ru:"Родительский контроль и PIN", ur:"پیرنٹل کنٹرول اور PIN رسائی", id:"Kontrol orang tua & akses PIN", de:"Kindersicherung & PIN-Zugang", ja:"ペアレンタルコントロールとPIN", tr:"Ebeveyn denetimi ve PIN erişimi", ko:"자녀 보호 및 PIN 접근", fa:"کنترل والدین و دسترسی PIN", uk:"Батьківський контроль і PIN-доступ", it:"Controlli parentali e accesso PIN", pl:"Kontrola rodzicielska i dostęp PIN", vi:"Kiểm soát phụ huynh & truy cập PIN" },
  f2: { en:"Activity overview of your kid's usage", zh:"查看孩子的使用情况", hi:"बच्चे की गतिविधि की झलक", es:"Resumen de la actividad de tu hijo", ar:"نظرة على نشاط طفلك", fr:"Aperçu de l'activité de votre enfant", bn:"সন্তানের ব্যবহারের সারাংশ", pt:"Resumo da atividade do teu filho", ru:"Обзор активности ребёнка", ur:"بچے کے استعمال کا جائزہ", id:"Ringkasan aktivitas anak", de:"Aktivitätsübersicht deines Kindes", ja:"子供の利用状況の概要", tr:"Çocuğunun kullanım özeti", ko:"자녀 사용 활동 요약", fa:"نمای فعالیت کودک", uk:"Огляд активності дитини", it:"Riepilogo dell'attività di tuo figlio", pl:"Przegląd aktywności dziecka", vi:"Tổng quan hoạt động của con bạn" },
  f3: { en:"Harassment comment scanner + instant alerts", zh:"骚扰评论扫描+即时警报", hi:"उत्पीड़न टिप्पणी स्कैनर + तुरंत अलर्ट", es:"Escáner de comentarios de acoso + alertas al instante", ar:"ماسح تعليقات التحرش + تنبيهات فورية", fr:"Détecteur de harcèlement + alertes instantanées", bn:"হয়রানি কমেন্ট স্ক্যানার + তৎক্ষণাৎ সতর্কতা", pt:"Scanner de assédio + alertas instantâneos", ru:"Сканер токсичных комментариев + мгновенные оповещения", ur:"ہراسمنٹ کمنٹ اسکینر + فوری الرٹس", id:"Pemindai komentar pelecehan + peringatan instan", de:"Mobbing-Kommentar-Scanner + Sofort-Alerts", ja:"ハラスメントコメント検知＋即時アラート", tr:"Taciz yorum tarayıcısı + anında uyarı", ko:"괴롭힘 댓글 스캐너 + 즉시 알림", fa:"اسکنر کامنت آزار + هشدار فوری", uk:"Сканер образливих коментарів + миттєві сповіщення", it:"Scanner commenti offensivi + avvisi istantanei", pl:"Skaner obraźliwych komentarzy + natychmiastowe alerty", vi:"Quét bình luận quấy rối + cảnh báo tức thì" },
  f4: { en:"One-tap report to YouTube's flow", zh:"一键上报给YouTube", hi:"वन-टैप रिपोर्ट YouTube को", es:"Denuncia en un toque al sistema de YouTube", ar:"إبلاغ بنقرة واحدة لمسار يوتيوب", fr:"Signalement en un tap vers YouTube", bn:"এক ট্যাপে YouTube-এ রিপোর্ট", pt:"Denúncia num toque para o YouTube", ru:"Репорт в YouTube в один тап", ur:"ایک ٹیپ میں YouTube کو رپورٹ", id:"Lapor sekali tap ke YouTube", de:"1-Tap-Meldung an YouTube", ja:"ワンタップでYouTubeへ報告", tr:"Tek dokunuşla YouTube raporu", ko:"한 번에 유튜브 신고", fa:"گزارش یک‌لمسه به یوتیوب", uk:"Поскаржитись на YouTube одним дотиком", it:"Segnala a YouTube con un tap", pl:"Zgłoszenie do YouTube jednym dotknięciem", vi:"Báo cáo YouTube một chạm" },
  f5: { en:"All ads shown to parents only", zh:"所有广告只展示给家长", hi:"सभी विज्ञापन सिर्फ पैरेंट्स को", es:"Todos los anuncios solo a los padres", ar:"كل الإعلانات للأهل فقط", fr:"Toutes les pubs uniquement aux parents", bn:"সব বিজ্ঞাপন শুধু অভিভাবকদের", pt:"Todos os anúncios só aos pais", ru:"Вся реклама — только родителям", ur:"تمام اشتہار صرف والدین کو", id:"Semua iklan hanya untuk orang tua", de:"Werbung nur für Eltern", ja:"広告は保護者のみに表示", tr:"Tüm reklamlar sadece velilere", ko:"광고는 부모에게만 표시", fa:"همه تبلیغ‌ها فقط برای والدین", uk:"Уся реклама — лише батькам", it:"Tutte le pubblicità solo ai genitori", pl:"Wszystkie reklamy tylko dla rodziców", vi:"Mọi quảng cáo chỉ hiện với phụ huynh" },
  f6: { en:"Priority AI answers", zh:"优先AI回答", hi:"प्रायोरिटी AI उत्तर", es:"Respuestas de IA prioritarias", ar:"إجابات ذكاء اصطناعي ذات أولوية", fr:"Réponses IA prioritaires", bn:"অগ্রাধিকার AI উত্তর", pt:"Respostas de IA prioritárias", ru:"Приоритетные ответы ИИ", ur:"ترجیحی AI جوابات", id:"Jawaban AI prioritas", de:"Priorisierte KI-Antworten", ja:"優先AI回答", tr:"Öncelikli YZ yanıtları", ko:"우선 AI 답변", fa:"پاسخ‌های AI با اولویت", uk:"Пріоритетні відповіді ШІ", it:"Risposte AI prioritarie", pl:"Priorytetowe odpowiedzi AI", vi:"Trả lời AI ưu tiên" },
  f7: { en:"Longer editor exports", zh:"更长的编辑器导出", hi:"लंबे एडिटर एक्सपोर्ट", es:"Exportaciones más largas del editor", ar:"تصديرات أطول من المحرر", fr:"Exports plus longs de l'éditeur", bn:"দীর্ঘ এডিটর এক্সপোর্ট", pt:"Exportações mais longas", ru:"Более длинный экспорт из редактора", ur:"لمبے ایڈیٹر ایکسپورٹس", id:"Ekspor editor lebih panjang", de:"Längere Editor-Exports", ja:"より長いエディタ書き出し", tr:"Daha uzun editör çıktısı", ko:"더 긴 편집기 내보내기", fa:"خروجی طولانی‌تر از ادیتور", uk:"Довший експорт з редактора", it:"Export dell'editor più lunghi", pl:"Dłuższe eksporty z edytora", vi:"Xuất video dài hơn" },
  f8: { en:"Extra effects & transitions", zh:"更多特效与转场", hi:"अतिरिक्त इफ़ेक्ट और ट्रांज़िशन", es:"Más efectos y transiciones", ar:"مؤثرات وانتقالات إضافية", fr:"Effets et transitions en plus", bn:"অতিরিক্ত ইফেক্ট ও ট্রানজিশন", pt:"Mais efeitos e transições", ru:"Дополнительные эффекты и переходы", ur:"اضافی افیکٹس اور ٹرانزیشنز", id:"Efek & transisi ekstra", de:"Extra Effekte & Übergänge", ja:"追加エフェクトとトランジション", tr:"Ekstra efekt ve geçişler", ko:"추가 효과 및 전환", fa:"افکت و انتقال اضافه", uk:"Додаткові ефекти та переходи", it:"Effetti e transizioni extra", pl:"Dodatkowe efekty i przejścia", vi:"Hiệu ứng & chuyển cảnh thêm" },
  f9: { en:"Exclusive game skins", zh:"专属游戏皮肤", hi:"एक्सक्लूसिव गेम स्किन्स", es:"Pieles de juego exclusivas", ar:"سكنات ألعاب حصرية", fr:"Skins de jeu exclusifs", bn:"এক্সক্লুসিভ গেম স্কিন", pt:"Skins de jogo exclusivas", ru:"Эксклюзивные скины", ur:"ایکسکلوژو گیم سکنز", id:"Skin game eksklusif", de:"Exklusive Game-Skins", ja:"限定ゲームスキン", tr:"Özel oyun kaplamaları", ko:"독점 게임 스킨", fa:"اسکین‌های اختصاصی بازی", uk:"Ексклюзивні скіни", it:"Skin di gioco esclusive", pl:"Ekskluzywne skórki do gier", vi:"Skin game độc quyền" },
  f10: { en:"Family Dashboard included", zh:"含家庭面板", hi:"फैमिली डैशबोर्ड शामिल", es:"Panel familiar incluido", ar:"تشمل لوحة العائلة", fr:"Tableau familial inclus", bn:"ফ্যামিলি ড্যাশবোর্ড অন্তর্ভুক্ত", pt:"Painel familiar incluído", ru:"Семейная панель включена", ur:"فیملی ڈیش بورڈ شامل", id:"Termasuk dasbor keluarga", de:"Familien-Dashboard inklusive", ja:"ファミリーダッシュボード込み", tr:"Aile paneli dahil", ko:"가족 대시보드 포함", fa:"داشبورد خانواده گنجانده شده", uk:"Сімейна панель включена", it:"Pannello famiglia incluso", pl:"Panel rodzinny w zestawie", vi:"Bao gồm bảng điều khiển gia đình" },
  f11: { en:"Kids' Tools Upgrade included", zh:"含孩子工具升级", hi:"किड्स टूल्स अपग्रेड शामिल", es:"Mejora de herramientas para niños incluida", ar:"تشمل ترقية أدوات الأطفال", fr:"Forfait enfants inclus", bn:"কিডস টুলস আপগ্রেড অন্তর্ভুক্ত", pt:"Upgrade de ferramentas incluído", ru:"Детские инструменты Pro включены", ur:"کڈز ٹولز اپ گریڈ شامل", id:"Termasuk upgrade alat anak", de:"Kinder-Tools-Upgrade inklusive", ja:"子供ツールアップグレード込み", tr:"Çocuk araçları yükseltme dahil", ko:"키즈 도구 업그레이드 포함", fa:"ارتقای ابزار کودکان گنجانده شده", uk:"Дитячі інструменти включені", it:"Upgrade strumenti bambini incluso", pl:"Rozszerzenie narzędzi w zestawie", vi:"Bao gồm nâng cấp công cụ trẻ em" },
  f12: { en:"Priority support", zh:"优先支持", hi:"प्रायोरिटी सपोर्ट", es:"Soporte prioritario", ar:"دعم ذو أولوية", fr:"Support prioritaire", bn:"অগ্রাধিকার সাপোর্ট", pt:"Suporte prioritário", ru:"Приоритетная поддержка", ur:"ترجیحی سپورٹ", id:"Dukungan prioritas", de:"Priorisierter Support", ja:"優先サポート", tr:"Öncelikli destek", ko:"우선 지원", fa:"پشتیبانی اولویت‌دار", uk:"Пріоритетна підтримка", it:"Supporto prioritario", pl:"Priorytetowe wsparcie", vi:"Hỗ trợ ưu tiên" },
  f13: { en:"Entry NovaClip Creator Certificate", zh:"入门NovaClip创作者证书", hi:"एंट्री NovaClip क्रिएटर सर्टिफिकेट", es:"Certificado de creador NovaClip inicial", ar:"شهادة مبدع NovaClip للمبتدئين", fr:"Certificat créateur NovaClip débutant", bn:"এন্ট্রি NovaClip ক্রিয়েটর সার্টিফিকেট", pt:"Certificado de criador NovaClip inicial", ru:"Начальный сертификат создателя NovaClip", ur:"انٹری NovaClip کری ایٹر سرٹیفکیٹ", id:"Sertifikat kreator NovaClip pemula", de:"Einstiegs-Zertifikat für NovaClip-Creator", ja:"入門NovaClipクリエイター認定証", tr:"Başlangıç NovaClip İçerik Üreticisi Sertifikası", ko:"입문 NovaClip 크리에이터 인증서", fa:"گواهی خالق NovaClip مبتدی", uk:"Початковий сертифікат творця NovaClip", it:"Certificato creatore NovaClip base", pl:"Certyfikat twórcy NovaClip na start", vi:"Chứng chỉ sáng tạo NovaClip cơ bản" },
  f14b: { en:"Earned, not bought", zh:"靠努力获得而非购买", hi:"कमाया हुआ, खरीदा नहीं", es:"Se gana, no se compra", ar:"يُكتسب ولا يُشترى", fr:"Ça se gagne, ça ne s'achète pas", bn:"অর্জিত, কেনা নয়", pt:"Ganha-se, não se compra", ru:"Зарабатывается, не покупается", ur:"کما کر حاصل کریں، خریدا نہیں", id:"Diraih, bukan dibeli", de:"Verdient, nicht gekauft", ja:"買うのではなく獲得するもの", tr:"Kazanılır, satın alınmaz", ko:"사는 게 아니라 따는 것", fa:"کسب‌کردنی است، نه خریدنی", uk:"Здобувається, не купується", it:"Si guadagna, non si compra", pl:"Zdobywa się, nie kupuje", vi:"Kiếm được, không mua" },
  f14: { en:"— issues at 150 NovaCoins once you have exported 3 videos, run 3 trend scans and used the AI tutors", zh:"— 导出3个视频、扫描3次趋势并使用AI导师后，达到150分即可获得", hi:"— 3 वीडियो एक्सपोर्ट, 3 ट्रेंड स्कैन और AI ट्यूटर इस्तेमाल करने के बाद 150 pts पर मिलता है", es:"— se emite a los 150 pts cuando hayas exportado 3 vídeos, hecho 3 escaneos de tendencias y usado los tutores IA", ar:"— يُمنح عند 150 نقطة بعد تصدير 3 فيديوهات وإجراء 3 عمليات مسح للاتجاهات واستخدام مدرّسي الذكاء الاصطناعي", fr:"— délivré à 150 pts une fois 3 vidéos exportées, 3 scans de tendances lancés et les tuteurs IA utilisés", bn:"— ৩টি ভিডিও এক্সপোর্ট, ৩টি ট্রেন্ড স্ক্যান ও AI টিউটর ব্যবহার করলে ১৫০ পয়েন্টে পাওয়া যায়", pt:"— emitido aos 150 pts depois de exportar 3 vídeos, correr 3 análises de tendências e usar os tutores de IA", ru:"— выдаётся на 150 очков после экспорта 3 видео, 3 сканов трендов и уроков ИИ", ur:"— 3 ویڈیوز ایکسپورٹ، 3 ٹرینڈ اسکین اور AI ٹیوٹرز استعمال کرنے کے بعد 150 پوائنٹس پر ملتا ہے", id:"— keluar di 150 poin setelah ekspor 3 video, jalankan 3 pindaian tren, dan pakai tutor AI", de:"— gibt es ab 150 Punkten, sobald du 3 Videos exportiert, 3 Trend-Scans gestartet und die KI-Tutoren genutzt hast", ja:"— 動画を3本書き出し、トレンドを3回スキャンし、AIチューターを使ったら150ptsで発行", tr:"— 3 video dışa aktarınca, 3 trend taraması yapınca ve YZ eğitmenlerini kullanınca 150 puanda verilir", ko:"— 영상 3개 내보내기, 트렌드 3회 스캔, AI 튜터 사용 후 150점에서 발급", fa:"— پس از اکسپورت ۳ ویدیو، ۳ اسکن ترند و استفاده از مربی‌های AI در ۱۵۰ امتیاز صادر می‌شود", uk:"— видається на 150 балів після експорту 3 відео, 3 сканувань трендів і уроків ШІ", it:"— rilasciato a 150 pt dopo aver esportato 3 video, fatto 3 scan di tendenze e usato i tutor AI", pl:"— przyznawane na 150 pkt po wyeksportowaniu 3 filmów, 3 skanach trendów i użyciu tutorów AI", vi:"— cấp ở 150 điểm sau khi xuất 3 video, chạy 3 lần quét xu hướng và dùng gia sư AI" },
  f14a: { en:"— issues at 600 NovaCoins once you have exported 10 videos, saved 5 ideas and reviewed your analytics", zh:"— 导出10个视频、保存5个灵感并查看分析后，达到600分即可获得", hi:"— 10 वीडियो एक्सपोर्ट, 5 आइडिया सेव और एनालिटिक्स रिव्यू के बाद 600 pts पर", es:"— se emite a los 600 pts tras exportar 10 vídeos, guardar 5 ideas y revisar tus análisis", ar:"— يُمنح عند 600 نقطة بعد تصدير 10 فيديوهات وحفظ 5 أفكار ومراجعة تحليلاتك", fr:"— délivré à 600 pts après 10 exports, 5 idées sauvegardées et une revue des stats", bn:"— ১০টি ভিডিও এক্সপোর্ট, ৫টি আইডিয়া সেভ ও অ্যানালিটিক্স দেখার পর ৬০০ পয়েন্টে", pt:"— emitido aos 600 pts após exportar 10 vídeos, guardar 5 ideias e rever as análises", ru:"— на 600 очков после экспорта 10 видео, 5 идей и просмотра аналитики", ur:"— 10 ویڈیوز ایکسپورٹ، 5 آئیڈیاز سیو اور اینالائٹکس ریویو کے بعد 600 پوائنٹس پر", id:"— keluar di 600 poin setelah ekspor 10 video, simpan 5 ide, dan tinjau analitik", de:"— gibt es ab 600 Punkten, sobald du 10 Videos exportiert, 5 Ideen gespeichert und deine Analysen geprüft hast", ja:"— 動画10本書き出し、アイデア5件保存、分析を確認したら600ptsで発行", tr:"— 10 video dışa aktarınca, 5 fikir kaydedince ve analitiğini inceleyince 600 puanda verilir", ko:"— 영상 10개 내보내기, 아이디어 5개 저장, 분석 검토 후 600점에서 발급", fa:"— پس از اکسپورت ۱۰ ویدیو، ذخیره ۵ ایده و بررسی آمار در ۶۰۰ امتیاز", uk:"— на 600 балів після експорту 10 відео, 5 ідей і перегляду аналітики", it:"— rilasciato a 600 pt dopo 10 export, 5 idee salvate e analisi riviste", pl:"— na 600 pkt po eksporcie 10 filmów, zapisaniu 5 pomysłów i analizie statystyk", vi:"— cấp ở 600 điểm sau khi xuất 10 video, lưu 5 ý tưởng và xem phân tích" },
  f14m: { en:"— issues at 1500 NovaCoins once you have exported 25 videos, run 20 scans and topped the Arena board 3 times", zh:"— 导出25个视频、扫描20次并3次登顶竞技场榜单后，达到1500分即可获得", hi:"— 25 वीडियो एक्सपोर्ट, 20 स्कैन और 3 बार अखाड़ा टॉप करने के बाद 1500 pts पर", es:"— a los 1500 pts tras exportar 25 vídeos, hacer 20 escaneos y ser 3 veces top del Arena", ar:"— عند 1500 نقطة بعد تصدير 25 فيديو وإجراء 20 مسحًا والتصدر في الساحة 3 مرات", fr:"— à 1500 pts après 25 exports, 20 scans et 3 fois premier de l'Arène", bn:"— ২৫টি ভিডিও এক্সপোর্ট, ২০টি স্ক্যান ও ৩ বার অ্যারেনা টপ করার পর ১৫০০ পয়েন্টে", pt:"— aos 1500 pts após exportar 25 vídeos, fazer 20 análises e liderar a Arena 3 vezes", ru:"— на 1500 очков после экспорта 25 видео, 20 сканов и 3 побед в Арене", ur:"— 25 ویڈیوز ایکسپورٹ، 20 اسکین اور 3 بار ایرینا ٹاپ کرنے کے بعد 1500 پوائنٹس پر", id:"— keluar di 1500 poin setelah ekspor 25 video, 20 pindaian, dan 3 kali juara Arena", de:"— gibt es ab 1500 Punkten nach 25 Exporten, 20 Scans und 3-mal Platz 1 in der Arena", ja:"— 動画25本書き出し、20回スキャン、アリーナ3回首位で1500pts", tr:"— 25 video, 20 tarama ve 3 kez Arena zirvesi sonrası 1500 puanda", ko:"— 영상 25개 내보내기, 스캔 20회, 아레나 3회 1위 후 1500점에서 발급", fa:"— پس از اکسپورت ۲۵ ویدیو، ۲۰ اسکن و ۳ بار صدرنشینی در آرنا در ۱۵۰۰ امتیاز", uk:"— на 1500 балів після експорту 25 відео, 20 сканувань і 3 перемог в Арені", it:"— a 1500 pt dopo 25 export, 20 scan e 3 volte primo nell'Arena", pl:"— na 1500 pkt po 25 eksportach, 20 skanach i 3 razy na szczycie Areny", vi:"— cấp ở 1500 điểm sau khi xuất 25 video, quét 20 lần và 3 lần đứng đầu Arena" },
  f15: { en:"Shareable on socials & CVs", zh:"可在社交平台和简历中分享", hi:"सोशल और CV पर शेयर करें", es:"Compartible en redes y CVs", ar:"قابل للمشاركة على المنصات والسير الذاتية", fr:"Partageable sur les réseaux et CV", bn:"সোশ্যাল ও সিভিতে শেয়ারযোগ্য", pt:"Partilhável em redes e CVs", ru:"Можно делиться в соцсетях и резюме", ur:"سوشل اور CV پر شیئر کریں", id:"Bisa dibagikan di sosial & CV", de:"In sozialen Netzwerken & Lebensläufen teilbar", ja:"SNSや履歴書で共有可能", tr:"Sosyal medyada ve CV'lerde paylaşılabilir", ko:"소셜 및 이력서에 공유 가능", fa:"قابل اشتراک در شبکه‌ها و رزومه", uk:"Можна ділитися в соцмережах і резюме", it:"Condivisibile su social e CV", pl:"Można udostępniać w social i CV", vi:"Chia sẻ trên mạng xã hội & CV" },
  f16: { en:"Verified badge on your profile", zh:"个人主页上的认证徽章", hi:"प्रोफाइल पर वेरिफाइड बैज", es:"Insignia verificada en tu perfil", ar:"شارة موثقة في ملفك", fr:"Badge vérifié sur votre profil", bn:"প্রোফাইলে ভেরিফাইড ব্যাজ", pt:"Selo verificado no perfil", ru:"Подтверждённый значок в профиле", ur:"پروفائل پر ویریفائیڈ بیج", id:"Lencana terverifikasi di profil", de:"Verifiziertes Abzeichen im Profil", ja:"プロフィールに認証バッジ", tr:"Profilinde doğrulanmış rozet", ko:"프로필에 인증 배지", fa:"نشان تأیید در پروفایل", uk:"Підтверджений значок у профілі", it:"Badge verificato sul profilo", pl:"Zweryfikowana odznaka na profilu", vi:"Huy hiệu đã xác minh trên hồ sơ" },
  f17: { en:"Everything in Basic", zh:"包含基础版所有内容", hi:"बेसिक में सब कुछ", es:"Todo lo de Básico", ar:"كل شيء في الأساسية", fr:"Tout ce qu'inclut Basic", bn:"বেসিকের সবকিছু", pt:"Tudo do Básico", ru:"Всё из Basic", ur:"بیسک کی ہر چیز", id:"Semua yang ada di Basic", de:"Alles aus Basic", ja:"Basicのすべて", tr:"Basic'teki her şey", ko:"베이직의 모든 것", fa:"همه امکانات پایه", uk:"Все з Basic", it:"Tutto incluso in Basic", pl:"Wszystko z Basic", vi:"Mọi thứ trong Basic" },
  f18: { en:"Portfolio review by a mentor", zh:"导师作品集点评", hi:"मेंटर से पोर्टफोलियो समीक्षा", es:"Revisión de portafolio por un mentor", ar:"مراجعة الأعمال من مرشد", fr:"Revue de portfolio par un mentor", bn:"পরামর্শদাতার পোর্টফোলিও পর্যালোচনা", pt:"Revisão de portefólio por um mentor", ru:"Разбор портфолио ментором", ur:"منتور سے پورٹ فولیو ریویو", id:"Tinjauan portofolio oleh mentor", de:"Portfolio-Review durch einen Mentor", ja:"メンターによるポートフォリオレビュー", tr:"Mentorla portfolyo incelemesi", ko:"멘토의 포트폴리오 검토", fa:"بررسی نمونه‌کار توسط مربی", uk:"Рев'ю портфоліо ментором", it:"Revisione del portfolio con un mentore", pl:"Przegląd portfolio z mentorem", vi:"Đánh giá hồ sơ bởi cố vấn" },
  f19: { en:"Gold verified badge", zh:"金色认证徽章", hi:"गोल्ड वेरिफाइड बैज", es:"Insignia verificada dorada", ar:"شارة موثقة ذهبية", fr:"Badge vérifié or", bn:"গোল্ড ভেরিফাইড ব্যাজ", pt:"Selo verificado dourado", ru:"Золотой значок", ur:"گولڈ ویریفائیڈ بیج", id:"Lencana emas terverifikasi", de:"Goldenes Verifizierungsabzeichen", ja:"ゴールド認証バッジ", tr:"Altın doğrulanmış rozet", ko:"골드 인증 배지", fa:"نشان طلایی تأیید", uk:"Золотий підтверджений значок", it:"Badge verificato oro", pl:"Złota zweryfikowana odznaka", vi:"Huy hiệu vàng đã xác minh" },
  f20: { en:"Everything in Advanced", zh:"包含高级版所有内容", hi:"एडवांस में सब कुछ", es:"Todo lo de Avanzado", ar:"كل شيء في المتقدمة", fr:"Tout ce qu'inclut Advanced", bn:"অ্যাডভান্সডের সবকিছু", pt:"Tudo do Avançado", ru:"Всё из Advanced", ur:"ایڈوانس کی ہر چیز", id:"Semua yang ada di Advanced", de:"Alles aus Advanced", ja:"Advancedのすべて", tr:"Advanced'teki her şey", ko:"고급의 모든 것", fa:"همه امکانات پیشرفته", uk:"Все з Advanced", it:"Tutto incluso in Advanced", pl:"Wszystko z Advanced", vi:"Mọi thứ trong Advanced" },
  f21: { en:"Featured creator showcase", zh:"精选创作者展示", hi:"फीचर्ड क्रिएटर शोकेस", es:"Escaparate de creadores destacados", ar:"عرض المبدعين المميزين", fr:"Vitrine des créateurs vedettes", bn:"ফিচার্ড ক্রিয়েটর শোকেস", pt:"Mostra de criadores em destaque", ru:"Витрина избранных создателей", ur:"نمایاں کری ایٹر شوکیس", id:"Pameran kreator unggulan", de:"Featured-Creator-Showcase", ja:"特集クリエイターのショーケース", tr:"Öne çıkan içerik üretici vitrini", ko:"추천 크리에이터 쇼케이스", fa:"ویترین خالقان منتخب", uk:"Вітрина обраних творців", it:"Vetrina dei creator in evidenza", pl:"Prezentacja wyróżnionych twórców", vi:"Gian trưng bày nhà sáng tạo nổi bật" },
  f22: { en:"Priority support & 1:1 session", zh:"优先支持与1对1咨询", hi:"प्रायोरिटी सपोर्ट और 1:1 सेशन", es:"Soporte prioritario y sesión 1:1", ar:"دعم ذو أولوية وجلسة فردية", fr:"Support prioritaire et session 1:1", bn:"অগ্রাধিকার সাপোর্ট ও ১:১ সেশন", pt:"Suporte prioritário e sessão 1:1", ru:"Приоритетная поддержка и встреча 1:1", ur:"ترجیحی سپورٹ اور 1:1 سیشن", id:"Dukungan prioritas & sesi 1:1", de:"Priorisierter Support & 1:1-Session", ja:"優先サポート＋1:1セッション", tr:"Öncelikli destek ve 1:1 oturum", ko:"우선 지원 및 1:1 세션", fa:"پشتیبانی اولویت‌دار و جلسه خصوصی", uk:"Пріоритетна підтримка та сесія 1:1", it:"Supporto prioritario e sessione 1:1", pl:"Priorytetowe wsparcie i sesja 1:1", vi:"Hỗ trợ ưu tiên & buổi 1:1" },
  f23: { en:"Platinum verified badge", zh:"铂金认证徽章", hi:"प्लैटिनम वेरिफाइड बैज", es:"Insignia verificada platino", ar:"شارة موثقة بلاتينية", fr:"Badge vérifié platine", bn:"প্ল্যাটিনাম ভেরিফাইড ব্যাজ", pt:"Selo verificado platina", ru:"Платиновый значок", ur:"پلاٹینم ویریفائیڈ بیج", id:"Lencana platinum terverifikasi", de:"Platin-Verifizierungsabzeichen", ja:"プラチナ認証バッジ", tr:"Platin doğrulanmış rozet", ko:"플래티넘 인증 배지", fa:"نشان پلاتینی تأیید", uk:"Платиновий підтверджений значок", it:"Badge verificato platino", pl:"Platynowa zweryfikowana odznaka", vi:"Huy hiệu bạch kim đã xác minh" }
};
Object.assign(T, PR_T);

/* ===== PARENT DASHBOARD — visible chrome translated ===== */
const PAR_T = {
  par_sub: { en:"Parental controls for NovaClip. See what your kid is working on, get alerts if harassment shows up in their YouTube comments, and keep ads away from them — ads and offers only ever appear here, on the parent side, never in the kid's tools.", zh:"NovaClip 家长控制。看看孩子在做什么，如果他们的 YouTube 评论中出现骚扰就收到提醒，并让广告远离他们——广告和优惠只出现在这里，在家长这边，绝不会出现在孩子的工具里。", hi:"NovaClip के लिए पैरेंटल कंट्रोल। देखें आपका बच्चा किस पर काम कर रहा है, YouTube टिप्पणियों में उत्पीड़न दिखने पर अलर्ट पाएं, और विज्ञापन उनसे दूर रखें — विज्ञापन और ऑफर सिर्फ यहाँ, पैरेंट साइड पर आते हैं, कभी बच्चों के टूल्स में नहीं।", es:"Controles parentales de NovaClip. Mira en qué trabaja tu hijo, recibe alertas si aparece acoso en sus comentarios de YouTube y mantén los anuncios lejos de ellos — los anuncios y ofertas solo aparecen aquí, del lado de los padres, nunca en las herramientas de los niños.", ar:"رقابة أبوية لـ NovaClip. شاهد ما يعمل عليه طفلك، واحصل على تنبيهات إذا ظهر تحرش في تعليقات يوتيوب، وأبقِ الإعلانات بعيدة عنهم — الإعلانات والعروض تظهر هنا فقط، في جانب الأهل، وليس في أدوات الطفل أبدًا.", fr:"Contrôle parental NovaClip. Voyez sur quoi travaille votre enfant, recevez des alertes si du harcèlement apparaît dans ses commentaires YouTube et gardez la pub loin de lui — pubs et offres n'apparaissent qu'ici, côté parents, jamais dans les outils de l'enfant.", bn:"NovaClip-এর জন্য অভিভাবক নিয়ন্ত্রণ। দেখুন আপনার সন্তান কী করছে, তাদের YouTube কমেন্টে হয়রানি দেখা গেলে সতর্কতা পান, আর বিজ্ঞাপন দূরে রাখুন — বিজ্ঞাপন ও অফার শুধু এখানে, অভিভাবকের পাশে থাকে, বাচ্চাদের টুলে কখনো নয়।", pt:"Controlo parental para a NovaClip. Vê em que está o teu filho a trabalhar, recebe alertas se aparecer assédio nos comentários do YouTube e mantém a publicidade longe deles — anúncios e ofertas só aparecem aqui, do lado dos pais, nunca nas ferramentas dos miúdos.", ru:"Родительский контроль NovaClip. Смотрите, над чем работает ребёнок, получайте оповещения о травле в комментариях и убирайте рекламу подальше — реклама и предложения живут только здесь, на родительской стороне, никогда в инструментах ребёнка.", ur:"NovaClip کے لیے پیرنٹل کنٹرول۔ دیکھیں آپ کا بچہ کس چیز پر کام کر رہا ہے، یوٹیوب کمنٹس میں ہراسمنٹ نظر آئے تو الرٹ پائیں، اور اشتہارات ان سے دور رکھیں — اشتہارات اور آفرز صرف یہاں، والدین کی طرف آتے ہیں، کبھی بچوں کے ٹولز میں نہیں۔", id:"Kontrol orang tua untuk NovaClip. Lihat apa yang sedang dikerjakan anak, dapatkan peringatan jika ada pelecehan di komentar YouTube mereka, dan jauhkan iklan dari mereka — iklan dan penawaran hanya muncul di sini, di sisi orang tua, tidak pernah di alat anak.", de:"Elternkontrolle für NovaClip. Sehen Sie, woran Ihr Kind arbeitet, erhalten Sie Alerts, wenn in seinen YouTube-Kommentaren Mobbing auftaucht, und halten Sie Werbung von ihm fern — Werbung und Angebote erscheinen nur hier, auf der Elternteil-Seite, nie in den Tools des Kindes.", ja:"NovaClipのペアレンタルコントロール。お子様の作業内容を確認し、YouTubeコメントにハラスメントが出たときはアラートを受け取り、広告から遠ざけられます — 広告やオファーはここ、保護者側にだけ表示され、子供のツールには一切出ません。", tr:"NovaClip için ebeveyn denetimi. Çocuğunun üzerinde ne çalıştığını gör, YouTube yorumlarında taciz çıkarsa uyarı al ve reklamları onlardan uzak tut — reklam ve teklifler yalnızca burada, veli tarafında görünür, asla çocuğun araçlarında olmaz.", ko:"NovaClip용 자녀 보호. 자녀가 무엇을 작업하는지 확인하고, 유튜브 댓글에 괴롭힘이 나오면 알림을 받고, 광고를 멀리하세요 — 광고와 제안은 이곳 부모 쪽에만 나타나며, 아이의 도구에는 절대 없습니다.", fa:"کنترل والدین برای NovaClip. ببینید فرزندتان روی چه چیزی کار می‌کند، اگر آزار در کامنت‌های یوتیوبش ظاهر شد هشدار بگیرید و تبلیغ‌ها را از او دور نگه دارید — تبلیغ‌ها و پیشنهادها فقط اینجا، در سمت والدین دیده می‌شوند، هرگز در ابزار کودک.", uk:"Батьківський контроль NovaClip. Дивіться, над чим працює дитина, отримуйте сповіщення про цькування в коментарях і тримайте рекламу подалі — реклама й пропозиції з'являються лише тут, на батьківському боці, ніколи в інструментах дитини.", it:"Controllo genitoriale NovaClip. Guarda su cosa lavora tuo figlio, ricevi avvisi se nei commenti YouTube appare molestie e tieni la pubblicità lontana da loro — annunci e offerte appaiono solo qui, dal lato genitori, mai negli strumenti dei bambini.", pl:"Kontrola rodzicielska NovaClip. Sprawdź, nad czym pracuje Twoje dziecko, dostawaj alerty, gdy w komentarzach na YouTube pojawi się nękanie, i trzymaj reklamy z dala od nich — reklamy i oferty pojawiają się tylko tutaj, po stronie rodzica, nigdy w narzędziach dzieci.", vi:"Kiểm soát phụ huynh cho NovaClip. Xem con bạn đang làm gì, nhận cảnh báo nếu có quấy rối trong bình luận YouTube và giữ quảng cáo tránh xa — quảng cáo và ưu đãi chỉ xuất hiện ở đây, phía phụ huynh, không bao giờ trong công cụ của trẻ." },
  par_access: { en:"Parent access", zh:"家长访问", hi:"पैरेंट एक्सेस", es:"Acceso de padres", ar:"دخول الأهل", fr:"Accès parental", bn:"অভিভাবক অ্যাক্সেস", pt:"Acesso parental", ru:"Доступ родителя", ur:"پیرنٹ رسائی", id:"Akses orang tua", de:"Elternzugang", ja:"保護者アクセス", tr:"Veli erişimi", ko:"부모 접근", fa:"دسترسی والدین", uk:"Доступ батька", it:"Accesso genitore", pl:"Dostęp rodzica", vi:"Truy cập phụ huynh" },
  par_access_s: { en:"First time: set a 5-digit PIN and a security question. You'll need the PIN every visit; the question recovers access if you forget it. The kid's pages never show this dashboard.", zh:"首次：设置5位PIN和一个安全问题。每次访问都需要PIN；忘记时可用问题恢复访问。孩子的页面从不显示此面板。", hi:"पहली बार: 5 अंकों का PIN और एक सुरक्षा प्रश्न सेट करें। हर बार PIN चाहिए होगा; भूलने पर सवाल से एक्सेस मिलेगा। बच्चों के पेजों पर यह डैशबोर्ड कभी नहीं दिखता।", es:"Primera vez: crea un PIN de 5 dígitos y una pregunta de seguridad. Necesitarás el PIN en cada visita; la pregunta recupera el acceso si lo olvidas. Las páginas del niño nunca muestran este panel.", ar:"المرة الأولى: أنشئ رمز PIN من 5 أرقام وسؤال أمان. ستحتاج إلى PIN في كل زيارة؛ والسؤال يستعيد الوصول إذا نسيته. صفحات الطفل لا تعرض هذه اللوحة أبدًا.", fr:"Première fois : définissez un code PIN à 5 chiffres et une question de sécurité. Vous aurez besoin du PIN à chaque visite ; la question récupère l'accès si vous l'oubliez. Les pages de l'enfant ne montrent jamais ce tableau.", bn:"প্রথমবার: ৫ সংখ্যার PIN ও একটি নিরাপত্তা প্রশ্ন সেট করুন। প্রতিবার PIN লাগবে; ভুলে গেলে প্রশ্ন দিয়ে অ্যাক্সেস ফেরানো যায়। বাচ্চার পেজে এই ড্যাশবোর্ড কখনো দেখায় না।", pt:"Primeira vez: define um PIN de 5 dígitos e uma pergunta de segurança. Precisas do PIN em cada visita; a pergunta recupera o acesso se o esqueceres. As páginas do miúdo nunca mostram este painel.", ru:"В первый раз: задайте 5-значный PIN и контрольный вопрос. PIN нужен при каждом входе; вопрос восстанавливает доступ, если вы его забыли. Страницы ребёнка никогда не показывают эту панель.", ur:"پہلی بار: 5 ہندسوں کا PIN اور سیکیورٹی سوال سیٹ کریں۔ ہر بار PIN درکار ہوگا؛ بھول جائیں تو سوال سے رسائی ملے گی۔ بچے کے صفحات کبھی یہ ڈیش بورڈ نہیں دکھاتے۔", id:"Pertama kali: buat PIN 5 digit dan pertanyaan keamanan. Anda butuh PIN setiap kunjungan; pertanyaan memulihkan akses jika lupa. Halaman anak tidak pernah menampilkan dasbor ini.", de:"Beim ersten Mal: 5-stellige PIN und eine Sicherheitsfrage festlegen. Sie brauchen die PIN bei jedem Besuch; die Frage stellt den Zugriff wieder her, falls Sie sie vergessen. Die Seiten des Kindes zeigen dieses Dashboard nie.", ja:"初回：5桁のPINと秘密の質問を設定します。毎回PINが必要です。忘れた場合は質問でアクセスを復元します。子供のページにはこのダッシュボードは一切表示されません。", tr:"İlk kez: 5 haneli PIN ve bir güvenlik sorusu belirleyin. Her ziyarette PIN gerekir; unutursanız soru erişimi geri kazandırır. Çocuğun sayfaları bu paneli asla göstermez.", ko:"처음: 5자리 PIN과 보안 질문을 설정하세요. 매번 방문 시 PIN이 필요합니다. 잊어버리면 질문으로 접근을 복구합니다. 아이의 페이지에는 이 대시보드가 절대 표시되지 않습니다.", fa:"بار اول: یک PIN پنج‌رقمی و یک سؤال امنیتی تنظیم کنید. در هر بازدید PIN لازم است؛ اگر فراموش کردید سؤال دسترسی را برمی‌گرداند. صفحات کودک هرگز این داشبورد را نشان نمی‌دهند.", uk:"Вперше: задайте 5-значний PIN і контрольне питання. PIN потрібен при кожному відвідуванні; питання відновлює доступ, якщо ви його забули. Сторінки дитини ніколи не показують цю панель.", it:"Prima volta: imposta un PIN a 5 cifre e una domanda di sicurezza. Ti servirà il PIN a ogni visita; la domanda recupera l'accesso se lo dimentichi. Le pagine del bambino non mostrano mai questo pannello.", pl:"Pierwszy raz: ustaw 5-cyfrowy PIN i pytanie zabezpieczające. PIN będzie potrzebny przy każdej wizycie; pytanie odzyskuje dostęp, jeśli go zapomnisz. Strony dziecka nigdy nie pokazują tego panelu.", vi:"Lần đầu: đặt mã PIN 5 chữ số và câu hỏi bảo mật. Bạn cần PIN mỗi lần truy cập; câu hỏi khôi phục quyền truy cập nếu quên. Trang của trẻ không bao giờ hiển thị bảng này." },
  par_only: { en:"Parents only.", zh:"仅限家长。", hi:"सिर्फ पैरेंट्स।", es:"Solo padres.", ar:"للأهل فقط.", fr:"Parents uniquement.", bn:"শুধু অভিভাবক।", pt:"Só pais.", ru:"Только родители.", ur:"صرف والدین۔", id:"Khusus orang tua.", de:"Nur für Eltern.", ja:"保護者のみ。", tr:"Sadece veliler.", ko:"부모 전용.", fa:"فقط والدین.", uk:"Лише батьки.", it:"Solo genitori.", pl:"Tylko rodzice.", vi:"Chỉ phụ huynh." },
  par_setup_note: { en:"This one-time setup confirms it's really you — not your child — before parental controls are created.", zh:"这次一次性设置会确认确实是您本人——而不是您的孩子——然后才会创建家长控制。", hi:"यह एक बार की सेटअप पुष्टि करता है कि यह सच में आप हैं — आपका बच्चा नहीं — पैरेंटल कंट्रोल बनाने से पहले।", es:"Esta configuración única confirma que eres realmente tú — no tu hijo — antes de crear los controles parentales.", ar:"هذا الإعداد لمرة واحدة يؤكد أنك أنت فعلاً — وليس طفلك — قبل إنشاء أدوات الرقابة الأبوية.", fr:"Cette configuration unique confirme que c'est bien vous — pas votre enfant — avant la création des contrôles parentaux.", bn:"এই একবারের সেটআপ নিশ্চিত করে যে সত্যিই আপনি — আপনার সন্তান নয় — অভিভাবক নিয়ন্ত্রণ তৈরি হওয়ার আগে।", pt:"Esta configuração única confirma que és mesmo tu — não o teu filho — antes de criar os controlos parentais.", ru:"Эта разовая настройка подтверждает, что это действительно вы — а не ваш ребёнок — до создания родительского контроля.", ur:"یہ ایک بار کی سیٹ اپ تصدیق کرتی ہے کہ واقعی آپ ہیں — آپ کا بچہ نہیں — پیرنٹل کنٹرول بنانے سے پہلے۔", id:"Pengaturan sekali ini memastikan benar Anda — bukan anak Anda — sebelum kontrol orang tua dibuat.", de:"Diese einmalige Einrichtung bestätigt, dass wirklich Sie es sind — nicht Ihr Kind — bevor die Kindersicherung erstellt wird.", ja:"この初回設定では、お子様ではなく本当にご本人であることを確認してから、ペアレンタルコントロールを作成します。", tr:"Bu tek seferlik kurulum, ebeveyn denetimi oluşturulmadan önce gerçekten sizin — çocuğunuz değil — olduğunuzu doğrular.", ko:"이 일회성 설정은 자녀 보호가 생성되기 전에 정말 귀하(자녀 아님)임을 확인합니다.", fa:"این راه‌اندازی یک‌باره تأیید می‌کند که واقعاً شما هستید — نه فرزندتان — پیش از ایجاد کنترل والدین.", uk:"Це разове налаштування підтверджує, що це дійсно ви — а не ваша дитина — перед створенням батьківського контролю.", it:"Questa configurazione una tantum conferma che sei davvero tu — non tuo figlio — prima di creare i controlli parentali.", pl:"Ta jednorazowa konfiguracja potwierdza, że to naprawdę Ty — nie Twoje dziecko — zanim kontrola rodzicielska zostanie utworzona.", vi:"Thiết lập một lần này xác nhận đúng là bạn — không phải con bạn — trước khi tạo kiểm soát phụ huynh." },
  par_sendcode: { en:"Send confirmation code", zh:"发送确认码", hi:"कन्फर्मेशन कोड भेजें", es:"Enviar código de confirmación", ar:"إرسال رمز التأكيد", fr:"Envoyer le code de confirmation", bn:"নিশ্চিতকরণ কোড পাঠান", pt:"Enviar código de confirmação", ru:"Отправить код подтверждения", ur:"تصدیقی کوڈ بھیجیں", id:"Kirim kode konfirmasi", de:"Bestätigungscode senden", ja:"確認コードを送信", tr:"Onay kodunu gönder", ko:"확인 코드 보내기", fa:"ارسال کد تأیید", uk:"Надіслати код підтвердження", it:"Invia codice di conferma", pl:"Wyślij kod potwierdzający", vi:"Gửi mã xác nhận" },
  par_age: { en:"Your child's age", zh:"您孩子的年龄", hi:"आपके बच्चे की उम्र", es:"La edad de tu hijo", ar:"عمر طفلك", fr:"L'âge de votre enfant", bn:"আপনার সন্তানের বয়স", pt:"A idade do teu filho", ru:"Возраст ребёнка", ur:"آپ کے بچے کی عمر", id:"Usia anak Anda", de:"Alter Ihres Kindes", ja:"お子様の年齢", tr:"Çocuğunun yaşı", ko:"자녀의 나이", fa:"سن فرزند شما", uk:"Вік вашої дитини", it:"L'età di tuo figlio", pl:"Wiek dziecka", vi:"Tuổi của con bạn" },
  par_activity: { en:"Activity overview", zh:"活动概览", hi:"गतिविधि अवलोकन", es:"Resumen de actividad", ar:"نظرة عامة على النشاط", fr:"Aperçu de l'activité", bn:"কার্যকলাপ সারাংশ", pt:"Resumo de atividade", ru:"Обзор активности", ur:"سرگرمی کا جائزہ", id:"Ringkasan aktivitas", de:"Aktivitätsübersicht", ja:"活動概要", tr:"Aktivite özeti", ko:"활동 개요", fa:"نمای کلی فعالیت", uk:"Огляд активності", it:"Riepilogo attività", pl:"Przegląd aktywności", vi:"Tổng quan hoạt động" },
  par_activity_s: { en:"Live from this device's NovaClip usage.", zh:"实时来自此设备上的 NovaClip 使用情况。", hi:"इस डिवाइस के NovaClip उपयोग से लाइव।", es:"En vivo desde el uso de NovaClip en este dispositivo.", ar:"مباشرة من استخدام NovaClip على هذا الجهاز.", fr:"En direct depuis l'usage de NovaClip sur cet appareil.", bn:"এই ডিভাইসের NovaClip ব্যবহার থেকে লাইভ।", pt:"Em direto do uso da NovaClip neste dispositivo.", ru:"Вживую из использования NovaClip на этом устройстве.", ur:"اس ڈیوائس کے NovaClip استعمال سے لائیو۔", id:"Langsung dari penggunaan NovaClip di perangkat ini.", de:"Live aus der NovaClip-Nutzung auf diesem Gerät.", ja:"この端末のNovaClip利用状況からリアルタイム表示。", tr:"Bu cihazdaki NovaClip kullanımından canlı.", ko:"이 기기의 NovaClip 사용에서 실시간.", fa:"نمایش زنده از استفاده NovaClip در این دستگاه.", uk:"Вживу з використання NovaClip на цьому пристрої.", it:"In diretta dall'uso di NovaClip su questo dispositivo.", pl:"Na żywo z używania NovaClip na tym urządzeniu.", vi:"Trực tiếp từ việc sử dụng NovaClip trên thiết bị này." },
  par_pts: { en:"NovaCoins earned", zh:"已获得积分", hi:"अर्जित अंक", es:"puntos ganados", ar:"النقاط المكتسبة", fr:"points gagnés", bn:"অর্জিত পয়েন্ট", pt:"pontos ganhos", ru:"заработано очков", ur:"حاصل کردہ پوائنٹس", id:"poin didapat", de:"verdiente Punkte", ja:"獲得ポイント", tr:"kazanılan puan", ko:"획득 포인트", fa:"امتیاز کسب‌شده", uk:"зароблено балів", it:"punti guadagnati", pl:"zdobyte punkty", vi:"điểm kiếm được" },
  par_chats: { en:"AI chats", zh:"AI对话", hi:"AI चैट", es:"chats de IA", ar:"محادثات الذكاء الاصطناعي", fr:"chats IA", bn:"AI চ্যাট", pt:"chats de IA", ru:"чат-сессий ИИ", ur:"AI چیٹس", id:"chat AI", de:"KI-Chats", ja:"AIチャット", tr:"YZ sohbeti", ko:"AI 채팅", fa:"گفتگوهای AI", uk:"чатів ШІ", it:"chat IA", pl:"czaty AI", vi:"trò chuyện AI" },
  par_scans: { en:"trend scans", zh:"趋势扫描", hi:"ट्रेंड स्कैन", es:"escaneos de tendencias", ar:"عمليات مسح الاتجاهات", fr:"scans de tendances", bn:"ট্রেন্ড স্ক্যান", pt:"análises de tendências", ru:"сканов трендов", ur:"ٹرینڈ اسکینز", id:"pindaian tren", de:"Trend-Scans", ja:"トレンドスキャン", tr:"trend taraması", ko:"트렌드 스캔", fa:"اسکن ترند", uk:"сканувань трендів", it:"scan di tendenze", pl:"skany trendów", vi:"lượt quét xu hướng" },
  par_unlocks: { en:"rewards unlocked", zh:"已解锁奖励", hi:"अनलॉक किए पुरस्कार", es:"recompensas desbloqueadas", ar:"مكافآت مفتوحة", fr:"récompenses débloquées", bn:"আনলক করা পুরস্কার", pt:"recompensas desbloqueadas", ru:"открыто наград", ur:"انلاک شدہ ریوارڈز", id:"hadiah terbuka", de:"freigeschaltete Belohnungen", ja:"解放済み報酬", tr:"açılan ödüller", ko:"잠금 해제 보상", fa:"جوایز بازشده", uk:"відкрито нагород", it:"ricompense sbloccate", pl:"odblokowane nagrody", vi:"phần thưởng đã mở" },
  par_recent_ai: { en:"Recent AI activity", zh:"最近的AI活动", hi:"हाल की AI गतिविधि", es:"Actividad reciente de IA", ar:"نشاط الذكاء الاصطناعي الأخير", fr:"Activité IA récente", bn:"সাম্প্রতিক AI কার্যকলাপ", pt:"Atividade recente de IA", ru:"Недавняя активность ИИ", ur:"حالیہ AI سرگرمی", id:"Aktivitas AI terbaru", de:"Letzte KI-Aktivität", ja:"最近のAI利用", tr:"Son YZ etkinliği", ko:"최근 AI 활동", fa:"فعالیت اخیر AI", uk:"Нещодавня активність ШІ", it:"Attività IA recente", pl:"Ostatnia aktywność AI", vi:"Hoạt động AI gần đây" },
  par_scanner: { en:"Comment safety scanner", zh:"评论安全扫描", hi:"कमेंट सुरक्षा स्कैनर", es:"Escáner de seguridad de comentarios", ar:"ماسح أمان التعليقات", fr:"Détecteur de sécurité des commentaires", bn:"কমেন্ট নিরাপত্তা স্ক্যানার", pt:"Scanner de segurança de comentários", ru:"Сканер безопасности комментариев", ur:"کمنٹ سیفٹی اسکینر", id:"Pemindai keamanan komentar", de:"Kommentar-Sicherheitsscanner", ja:"コメント安全スキャナー", tr:"Yorum güvenlik tarayıcısı", ko:"댓글 안전 스캐너", fa:"اسکنر امنیت کامنت", uk:"Сканер безпеки коментарів", it:"Scanner sicurezza commenti", pl:"Skaner bezpieczeństwa komentarzy", vi:"Quét an toàn bình luận" },
  par_scanner_s: { en:"Scans the newest comments on your kid's uploads for harassment or bullying. Uses the YouTube connection made in Studio.", zh:"扫描您孩子上传内容的最新评论，查找骚扰或欺凌。使用 Studio 中建立的 YouTube 连接。", hi:"आपके बच्चे के अपलोड पर नई टिप्पणियों को उत्पीड़न या धमकाने के लिए स्कैन करता है। स्टूडियो में बनाया गया YouTube कनेक्शन उपयोग करता है।", es:"Escanea los comentarios más nuevos de los videos de tu hijo en busca de acoso o bullying. Usa la conexión de YouTube hecha en Studio.", ar:"يفحص أحدث التعليقات على منشورات طفلك بحثًا عن التحرش أو التنمر. يستخدم اتصال يوتيوب الذي أُنشئ في الاستوديو.", fr:"Analyse les commentaires les plus récents sur les uploads de votre enfant pour détecter harcèlement ou harcèlement scolaire. Utilise la connexion YouTube faite dans Studio.", bn:"আপনার সন্তানের আপলোডের নতুন কমেন্টগুলো হয়রানি বা বুলিংয়ের জন্য স্ক্যান করে। স্টুডিওতে তৈরি YouTube সংযোগ ব্যবহার করে।", pt:"Analisa os comentários mais recentes dos uploads do teu filho à procura de assédio ou bullying. Usa a ligação ao YouTube feita no Studio.", ru:"Проверяет новые комментарии к загрузкам ребёнка на травлю и буллинг. Использует подключение к YouTube из Studio.", ur:"آپ کے بچے کے اپ لوڈز پر نئے کمنٹس ہراسمنٹ یا غنڈہ گردی کے لیے اسکین کرتا ہے۔ سٹوڈیو میں بنایا گیا YouTube کنکشن استعمال کرتا ہے۔", id:"Memindai komentar terbaru di unggahan anak untuk pelecehan atau perundungan. Menggunakan koneksi YouTube dari Studio.", de:"Scannt die neuesten Kommentare zu den Uploads Ihres Kindes auf Mobbing oder Schikane. Nutzt die in Studio hergestellte YouTube-Verbindung.", ja:"お子様のアップロードの最新コメントをハラスメントやいじめの有無でスキャンします。Studioで作成したYouTube接続を使用します。", tr:"Çocuğunun yüklemelerindeki en yeni yorumları taciz veya zorbalık için tarar. Studio'da yapılan YouTube bağlantısını kullanır.", ko:"자녀 업로드의 최신 댓글을 괴롭힘 또는 왕따 여부로 스캔합니다. 스튜디오에서 만든 유튜브 연결을 사용합니다.", fa:"جدیدترین کامنت‌های آپلودهای فرزندتان را از نظر آزار یا قلدری اسکن می‌کند. از اتصال یوتیوب ساخته‌شده در استودیو استفاده می‌کند.", uk:"Перевіряє нові коментарі до завантажень дитини на цькування та булінг. Використовує підключення до YouTube з Studio.", it:"Analizza i commenti più recenti sui caricamenti di tuo figlio alla ricerca di molestie o bullismo. Usa la connessione YouTube creata in Studio.", pl:"Skanuje najnowsze komentarze pod filmami dziecka pod kątem nękania lub znęcania. Używa połączenia YouTube utworzonego w Studio.", vi:"Quét các bình luận mới nhất trên video của con bạn để tìm quấy rối hoặc bắt nạt. Dùng kết nối YouTube tạo trong Studio." },
  par_scan_btn: { en:"Scan latest comments", zh:"扫描最新评论", hi:"नवीनतम कमेंट स्कैन करें", es:"Escanear comentarios recientes", ar:"فحص أحدث التعليقات", fr:"Analyser les derniers commentaires", bn:"সাম্প্রতিক কমেন্ট স্ক্যান করুন", pt:"Analisar comentários recentes", ru:"Сканировать новые комментарии", ur:"تازہ کمنٹس اسکین کریں", id:"Pindai komentar terbaru", de:"Neueste Kommentare scannen", ja:"最新コメントをスキャン", tr:"Son yorumları tara", ko:"최신 댓글 스캔", fa:"اسکن کامنت‌های اخیر", uk:"Сканувати нові коментарі", it:"Analizza gli ultimi commenti", pl:"Skanuj najnowsze komentarze", vi:"Quét bình luận mới nhất" },
  par_ads: { en:"Ads & offers", zh:"广告与优惠", hi:"विज्ञापन और ऑफर", es:"Anuncios y ofertas", ar:"الإعلانات والعروض", fr:"Pubs et offres", bn:"বিজ্ঞাপন ও অফার", pt:"Anúncios e ofertas", ru:"Реклама и предложения", ur:"اشتہارات اور آفرز", id:"Iklan & penawaran", de:"Werbung & Angebote", ja:"広告とオファー", tr:"Reklamlar ve teklifler", ko:"광고 및 제안", fa:"تبلیغ‌ها و پیشنهادها", uk:"Реклама та пропозиції", it:"Pubblicità e offerte", pl:"Reklamy i oferty", vi:"Quảng cáo & ưu đãi" },
  par_ads_s: { en:"This is the only place ads exist in NovaClip.", zh:"这是 NovaClip 中唯一有广告的地方。", hi:"NovaClip में विज्ञापन सिर्फ यहीं होते हैं।", es:"Este es el único lugar donde existen anuncios en NovaClip.", ar:"هذا هو المكان الوحيد الذي توجد فيه الإعلانات في NovaClip.", fr:"C'est le seul endroit où existent des pubs dans NovaClip.", bn:"NovaClip-এ বিজ্ঞাপন থাকার একমাত্র জায়গা এটিই।", pt:"Este é o único sítio onde existem anúncios na NovaClip.", ru:"Это единственное место с рекламой в NovaClip.", ur:"NovaClip میں اشتہارات کی یہی واحد جگہ ہے۔", id:"Ini satu-satunya tempat iklan ada di NovaClip.", de:"Das ist der einzige Ort mit Werbung in NovaClip.", ja:"NovaClipで広告が存在するのはここだけです。", tr:"NovaClip'te reklamın olduğu tek yer burası.", ko:"NovaClip에서 광고가 존재하는 유일한 곳입니다.", fa:"این تنها جایی است که در NovaClip تبلیغ وجود دارد.", uk:"Це єдине місце з рекламою в NovaClip.", it:"È l'unico posto dove esiste pubblicità in NovaClip.", pl:"To jedyne miejsce z reklamami w NovaClip.", vi:"Đây là nơi duy nhất có quảng cáo trong NovaClip." },
  par_ads_p: { en:"NovaClip never shows advertising inside the kid's tools, games, or editor. Sponsored offers and plan upgrades appear only on this parent dashboard.", zh:"NovaClip 从不在孩子的工具、游戏或编辑器中显示广告。赞助优惠和方案升级只出现在这个家长面板上。", hi:"NovaClip कभी भी बच्चों के टूल्स, गेम्स या एडिटर में विज्ञापन नहीं दिखाता। स्पॉन्सर्ड ऑफर और प्लान अपग्रेड सिर्फ इस पैरेंट डैशबोर्ड पर दिखते हैं।", es:"NovaClip nunca muestra publicidad dentro de las herramientas, juegos o editor de los niños. Las ofertas patrocinadas y mejoras de plan aparecen solo en este panel de padres.", ar:"لا يعرض NovaClip إعلانات داخل أدوات الطفل أو ألعابه أو محرره أبدًا. العروض الممولة وترقيات الخطط تظهر في لوحة الأهل هذه فقط.", fr:"NovaClip ne montre jamais de publicité dans les outils, jeux ou l'éditeur de l'enfant. Offres sponsorisées et mises à niveau n'apparaissent que sur ce tableau parental.", bn:"NovaClip কখনো বাচ্চার টুল, গেম বা এডিটরে বিজ্ঞাপন দেখায় না। স্পন্সরড অফার ও প্ল্যান আপগ্রেড শুধু এই অভিভাবক ড্যাশবোর্ডে আসে।", pt:"A NovaClip nunca mostra publicidade dentro das ferramentas, jogos ou editor dos miúdos. Ofertas patrocinadas e upgrades de plano aparecem só neste painel parental.", ru:"NovaClip никогда не показывает рекламу в инструментах, играх или редакторе ребёнка. Спонсируемые предложения и апгрейды тарифов появляются только на этой родительской панели.", ur:"NovaClip کبھی بچوں کے ٹولز، گیمز یا ایڈیٹر میں اشتہار نہیں دکھاتا۔ اسپانسرڈ آفرز اور پلان اپ گریڈ صرف اس پیرنٹ ڈیش بورڈ پر آتے ہیں۔", id:"NovaClip tidak pernah menampilkan iklan di alat, game, atau editor anak. Penawaran bersponsor dan upgrade paket hanya muncul di dasbor orang tua ini.", de:"NovaClip zeigt nie Werbung in den Tools, Spielen oder im Editor des Kindes. Gesponserte Angebote und Plan-Upgrades erscheinen nur auf diesem Eltern-Dashboard.", ja:"NovaClipは子供のツール・ゲーム・エディタには一切広告を表示しません。スポンサーオファーやプランアップグレードはこの保護者ダッシュボードのみに表示されます。", tr:"NovaClip asla çocuğun araçlarında, oyunlarında veya editöründe reklam göstermez. Sponsorlu teklifler ve plan yükseltmeleri yalnızca bu veli panelinde görünür.", ko:"NovaClip은 아이의 도구, 게임, 편집기에는 절대 광고를 표시하지 않습니다. 후원 제안과 플랜 업그레이드는 이 부모 대시보드에만 나타납니다.", fa:"NovaClip هرگز در ابزار، بازی یا ادیتور کودک تبلیغ نشان نمی‌دهد. پیشنهادهای حمایت‌شده و ارتقای پلن فقط در این داشبورد والدین دیده می‌شوند.", uk:"NovaClip ніколи не показує рекламу в інструментах, іграх чи редакторі дитини. Спонсоровані пропозиції та апгрейди тарифів з'являються лише на цій батьківській панелі.", it:"NovaClip non mostra mai pubblicità negli strumenti, nei giochi o nell'editor del bambino. Offerte sponsorizzate e upgrade dei piani appaiono solo su questo pannello genitori.", pl:"NovaClip nigdy nie pokazuje reklam w narzędziach, grach ani edytorze dziecka. Sponsorowane oferty i ulepszenia planów pojawiają się tylko na tym panelu rodzica.", vi:"NovaClip không bao giờ hiển thị quảng cáo trong công cụ, trò chơi hay trình chỉnh sửa của trẻ. Ưu đãi tài trợ và nâng cấp gói chỉ xuất hiện trên bảng phụ huynh này." },
  par_billing: { en:"Plans & billing", zh:"方案与账单", hi:"प्लान और बिलिंग", es:"Planes y facturación", ar:"الخطط والفواتير", fr:"Forfaits et facturation", bn:"প্ল্যান ও বিলিং", pt:"Planos e faturação", ru:"Тарифы и оплата", ur:"پلانز اور بلنگ", id:"Paket & tagihan", de:"Pläne & Abrechnung", ja:"プランと請求", tr:"Planlar ve faturalama", ko:"요금제 및 결제", fa:"پلن‌ها و صورتحساب", uk:"Тарифи та оплата", it:"Piani e fatturazione", pl:"Plany i rozliczenia", vi:"Gói & thanh toán" },
  par_billing_s: { en:"Manage your NovaClip subscription. Everything here sits behind your parent PIN.", zh:"管理您的 NovaClip 订阅。这里的一切都在您的家长 PIN 保护之后。", hi:"अपना NovaClip सब्सक्रिप्शन प्रबंधित करें। यहाँ सब कुछ आपके पैरेंट PIN के पीछे है।", es:"Gestiona tu suscripción a NovaClip. Todo aquí está protegido por tu PIN de padres.", ar:"أدر اشتراكك في NovaClip. كل شيء هنا محمي برمز PIN الخاص بك.", fr:"Gérez votre abonnement NovaClip. Tout ici est protégé par votre code PIN parental.", bn:"আপনার NovaClip সাবস্ক্রিপশন পরিচালনা করুন। সবকিছু আপনার অভিভাবক PIN-এর আড়ালে।", pt:"Gere a tua subscrição NovaClip. Tudo aqui fica atrás do teu PIN parental.", ru:"Управляйте подпиской NovaClip. Всё здесь защищено вашим родительским PIN.", ur:"اپنا NovaClip سبسکرپشن منظم کریں۔ یہاں سب کچھ آپ کے پیرنٹ PIN کے پیچھے ہے۔", id:"Kelola langganan NovaClip Anda. Semua di sini terlindung PIN orang tua Anda.", de:"Verwalten Sie Ihr NovaClip-Abonnement. Alles hier liegt hinter Ihrer Eltern-PIN.", ja:"NovaClipのサブスクリプションを管理。ここはすべて保護者PINで保護されています。", tr:"NovaClip aboneliğini yönet. Buradaki her şey veli PIN'inin arkasında.", ko:"NovaClip 구독을 관리하세요. 여기 모든 것은 부모 PIN 뒤에 있습니다.", fa:"اشتراک NovaClip خود را مدیریت کنید. همه چیز اینجا پشت PIN والدین شماست.", uk:"Керуйте підпискою NovaClip. Все тут захищено вашим батьківським PIN.", it:"Gestisci l'abbonamento NovaClip. Tutto qui è protetto dal tuo PIN genitore.", pl:"Zarządzaj subskrypcją NovaClip. Wszystko tutaj chroni Twój PIN rodzica.", vi:"Quản lý gói đăng ký NovaClip của bạn. Mọi thứ ở đây nằm sau mã PIN phụ huynh của bạn." },
  par_savedcard: { en:"Saved card", zh:"已保存的卡", hi:"सेव्ड कार्ड", es:"Tarjeta guardada", ar:"البطاقة المحفوظة", fr:"Carte enregistrée", bn:"সেভ করা কার্ড", pt:"Cartão guardado", ru:"Сохранённая карта", ur:"محفوظ شدہ کارڈ", id:"Kartu tersimpan", de:"Gespeicherte Karte", ja:"保存済みカード", tr:"Kayıtlı kart", ko:"저장된 카드", fa:"کارت ذخیره‌شده", uk:"Збережена карта", it:"Carta salvata", pl:"Zapisana karta", vi:"Thẻ đã lưu" },
  par_removecard: { en:"Remove card", zh:"移除卡片", hi:"कार्ड हटाएं", es:"Quitar tarjeta", ar:"إزالة البطاقة", fr:"Retirer la carte", bn:"কার্ড সরান", pt:"Remover cartão", ru:"Удалить карту", ur:"کارڈ ہٹائیں", id:"Hapus kartu", de:"Karte entfernen", ja:"カードを削除", tr:"Kartı kaldır", ko:"카드 제거", fa:"حذف کارت", uk:"Видалити картку", it:"Rimuovi carta", pl:"Usuń kartę", vi:"Xóa thẻ" },
  par_savecardbtn: { en:"Save payment method", zh:"保存支付方式", hi:"भुगतान तरीका सेव करें", es:"Guardar método de pago", ar:"حفظ طريقة الدفع", fr:"Enregistrer le moyen de paiement", bn:"পেমেন্ট মাধ্যম সেভ করুন", pt:"Guardar método de pagamento", ru:"Сохранить способ оплаты", ur:"ادائیگی کا طریقہ سیو کریں", id:"Simpan metode pembayaran", de:"Zahlungsart speichern", ja:"支払い方法を保存", tr:"Ödeme yöntemini kaydet", ko:"결제 수단 저장", fa:"ذخیره روش پرداخت", uk:"Зберегти спосіб оплати", it:"Salva metodo di pagamento", pl:"Zapisz metodę płatności", vi:"Lưu phương thức thanh toán" },
  par_unlock: { en:"Unlock", zh:"解锁", hi:"अनलॉक करें", es:"Desbloquear", ar:"فتح", fr:"Déverrouiller", bn:"আনলক করুন", pt:"Desbloquear", ru:"Разблокировать", ur:"انلاک کریں", id:"Buka kunci", de:"Entsperren", ja:"ロック解除", tr:"Kilidi aç", ko:"잠금 해제", fa:"باز کردن قفل", uk:"Розблокувати", it:"Sblocca", pl:"Odblokuj", vi:"Mở khóa" },
  par_forgot: { en:"Forgot PIN?", zh:"忘记PIN？", hi:"PIN भूल गए?", es:"¿Olvidaste tu PIN?", ar:"هل نسيت رمز PIN؟", fr:"PIN oublié ?", bn:"PIN ভুলে গেছেন?", pt:"Esqueceste o PIN?", ru:"Забыли PIN?", ur:"PIN بھول گئے؟", id:"Lupa PIN?", de:"PIN vergessen?", ja:"PINをお忘れですか？", tr:"PIN'i mi unuttun?", ko:"PIN을 잊으셨나요?", fa:"PIN را فراموش کرده‌اید؟", uk:"Забули PIN?", it:"Hai dimenticato il PIN?", pl:"Zapomniałeś PIN?", vi:"Quên mã PIN?" },
  par_reset: { en:"Reset PIN", zh:"重置PIN", hi:"PIN रीसेट करें", es:"Restablecer PIN", ar:"إعادة تعيين PIN", fr:"Réinitialiser le PIN", bn:"PIN রিসেট করুন", pt:"Repor PIN", ru:"Сбросить PIN", ur:"PIN ری سیٹ کریں", id:"Atur ulang PIN", de:"PIN zurücksetzen", ja:"PINをリセット", tr:"PIN'i sıfırla", ko:"PIN 재설정", fa:"بازنشانی PIN", uk:"Скинути PIN", it:"Reimposta PIN", pl:"Zresetuj PIN", vi:"Đặt lại mã PIN" }
};
Object.assign(T, PAR_T);

/* ===== SHARED POPUP UI =====
   Age gate, suspension screen, screen-time lock, profile dialog, quest/achievement
   panels and the toast strings all used to be hardcoded English. They render from
   JS (no data-t possible), so they translate through tr() like everything else.
   Tokens: {n} number, {unit} singular/plural unit, {t} time, {link} anchor HTML,
   {p} points, {goal} reward name. */
const UI_T = {
  ui_cancel: { en:"Cancel", zh:"取消", hi:"रद्द करें", es:"Cancelar", ar:"إلغاء", fr:"Annuler", bn:"বাতিল", pt:"Cancelar", ru:"Отмена", ur:"منسوخ کریں", id:"Batal", de:"Abbrechen", ja:"キャンセル", tr:"İptal", ko:"취소", fa:"لغو", uk:"Скасувати", it:"Annulla", pl:"Anuluj", vi:"Hủy" },
  ui_save: { en:"Save", zh:"保存", hi:"सेव करें", es:"Guardar", ar:"حفظ", fr:"Enregistrer", bn:"সংরক্ষণ", pt:"Guardar", ru:"Сохранить", ur:"محفوظ کریں", id:"Simpan", de:"Speichern", ja:"保存", tr:"Kaydet", ko:"저장", fa:"ذخیره", uk:"Зберегти", it:"Salva", pl:"Zapisz", vi:"Lưu" },
  ui_continue: { en:"Continue", zh:"继续", hi:"जारी रखें", es:"Continuar", ar:"متابعة", fr:"Continuer", bn:"চালিয়ে যান", pt:"Continuar", ru:"Продолжить", ur:"جاری رکھیں", id:"Lanjutkan", de:"Weiter", ja:"続ける", tr:"Devam et", ko:"계속", fa:"ادامه", uk:"Продовжити", it:"Continua", pl:"Kontynuuj", vi:"Tiếp tục" },
  ui_got_it: { en:"Got it", zh:"知道了", hi:"समझ गया", es:"Entendido", ar:"فهمت", fr:"Compris", bn:"বুঝেছি", pt:"Percebi", ru:"Понятно", ur:"سمجھ گیا", id:"Paham", de:"Alles klar", ja:"了解", tr:"Anladım", ko:"알겠어요", fa:"فهمیدم", uk:"Зрозуміло", it:"Ho capito", pl:"Jasne", vi:"Hiểu rồi" },
  ui_age_q: { en:"How old are you?", zh:"你多大了？", hi:"आपकी उम्र कितनी है?", es:"¿Cuántos años tienes?", ar:"كم عمرك؟", fr:"Quel âge as-tu ?", bn:"আপনার বয়স কত?", pt:"Quantos anos tens?", ru:"Сколько тебе лет?", ur:"آپ کی عمر کتنی ہے؟", id:"Berapa umurmu?", de:"Wie alt bist du?", ja:"あなたは何歳ですか？", tr:"Kaç yaşındasın?", ko:"몇 살이세요?", fa:"چند ساله‌ای؟", uk:"Скільки тобі років?", it:"Quanti anni hai?", pl:"Ile masz lat?", vi:"Bạn bao nhiêu tuổi?" },
  ui_age_aria: { en:"Your age", zh:"你的年龄", hi:"आपकी उम्र", es:"Tu edad", ar:"عمرك", fr:"Ton âge", bn:"আপনার বয়স", pt:"A tua idade", ru:"Твой возраст", ur:"آپ کی عمر", id:"Usia kamu", de:"Dein Alter", ja:"あなたの年齢", tr:"Yaşın", ko:"당신의 나이", fa:"سن تو", uk:"Твій вік", it:"La tua età", pl:"Twój wiek", vi:"Tuổi của bạn" },
  ui_age_report: { en:"I put the wrong number in — report it", pt:"Pus o número errado — comunicar", es:"Puse el número equivocado — informar", fr:"J'ai mis le mauvais nombre — signaler", de:"Ich habe die falsche Zahl eingegeben — melden", it:"Ho inserito il numero sbagliato — segnala" },
  ui_age_u_t: { en:"Thanks for being honest.", zh:"谢谢你的诚实。", hi:"सच बोलने के लिए धन्यवाद।", es:"Gracias por ser honesto.", ar:"شكرًا لصدقك.", fr:"Merci d'avoir été honnête.", bn:"সত্য বলার জন্য ধন্যবাদ।", pt:"Obrigado por seres honesto.", ru:"Спасибо за честность.", ur:"ایمانداری کے لیے شکریہ۔", id:"Terima kasih sudah jujur.", de:"Danke, dass du ehrlich bist.", ja:"正直に言ってくれてありがとう。", tr:"Dürüst olduğun için teşekkürler.", ko:"솔직하게 말해줘서 고마워요.", fa:"ممنون از صداقتت.", uk:"Дякуємо за чесність.", it:"Grazie per la tua sincerità.", pl:"Dzięki za szczerość.", vi:"Cảm ơn vì đã thành thật." },
  ui_age_u_b: { en:"NovaClip needs verified parental consent for creators under 13, so we cannot open an account from here yet. Ask a parent or guardian to set one up for you from the Family Dashboard.", zh:"对于13岁以下的创作者，NovaClip需要经过验证的家长同意，所以我们暂时无法在这里开设账户。请让家长或监护人从家庭面板为您设置一个。", hi:"13 साल से कम उम्र के क्रिएटर्स के लिए NovaClip को पुष्ट माता-पिता की सहमति चाहिए, इसलिए हम अभी यहाँ से खाता नहीं खोल सकते। अपने माता-पिता या अभिभावक से फ़ैमिली डैशबोर्ड से सेट अप करने के लिए कहें।", es:"NovaClip necesita consentimiento parental verificado para creadores menores de 13 años, así que todavía no podemos abrir una cuenta desde aquí. Pide a un padre o tutor que te la configure desde el Panel Familiar.", ar:"يتطلب NovaClip موافقة أبوية موثقة للمبدعين دون 13 عامًا، لذا لا يمكننا فتح حساب من هنا بعد. اطلب من أحد الوالدين أو الوصي إنشاءه لك من لوحة العائلة.", fr:"NovaClip demande un consentement parental vérifié pour les créateurs de moins de 13 ans, donc nous ne pouvons pas encore ouvrir de compte d'ici. Demande à un parent ou tuteur d'en créer un pour toi depuis le Tableau Famille.", bn:"১৩ বছরের কম বয়সী নির্মাতাদের জন্য NovaClip-এর পিতা-মাতার নিশ্চিত সম্মতি দরকার, তাই আমরা এখান থেকে এখনো অ্যাকাউন্ট খুলতে পারি না। আপনার পিতা-মাতা বা অভিভাবককে ফ্যামিলি ড্যাশবোর্ড থেকে তৈরি করতে বলুন।", pt:"A NovaClip precisa de consentimento parental verificado para criadores com menos de 13 anos, por isso ainda não podemos abrir conta daqui. Pede a um pai ou encarregado de educação que a configure a partir do Painel Familiar.", ru:"NovaClip требует подтверждённого родительского согласия для авторов младше 13 лет, поэтому мы пока не можем открыть аккаунт отсюда. Попроси родителя или опекуна создать его через Семейную панель.", ur:"13 سال سے کم عمر کے تخلیق کاروں کے لیے NovaClip کو تصدیق شدہ والدین کی رضامندی درکار ہے، اس لیے ہم ابھی یہاں سے اکاؤنٹ نہیں کھول سکتے۔ اپنے والدین یا سرپرست سے فیملی ڈیش بورڈ سے سیٹ اپ کرنے کو کہیں۔", id:"NovaClip memerlukan persetujuan orang tua yang terverifikasi untuk kreator di bawah 13 tahun, jadi kami belum bisa membuka akun dari sini. Minta orang tua atau wali membuatkannya dari Dasbor Keluarga.", de:"NovaClip braucht die bestätigte Einwilligung der Eltern für Creator unter 13, daher können wir hier noch kein Konto eröffnen. Bitte deine Eltern oder deinen Vormund, eines über das Familien-Dashboard einzurichten.", ja:"13歳未満のクリエイターには保護者による認証済みの同意が必要です。そのため、ここからアカウントを開設することはまだできません。保護者にファミリーダッシュボードからの設定を頼んでください。", tr:"13 yaş altı içerik üreticileri için NovaClip, doğrulanmış veli onayı ister; bu yüzden buradan henüz hesap açamayız. Ebeveyninden ya da vasinden Aile Paneli'nden bir hesap kurmasını iste.", ko:"13세 미만 크리에이터는 검증된 부모 동의가 필요하므로 여기서는 아직 계정을 만들 수 없습니다. 부모님 또는 보호자에게 가족 대시보드에서 설정해 달라고 하세요.", fa:"NovaClip برای سازندگان زیر ۱۳ سال به رضایت تأییدشده والدین نیاز دارد، پس هنوز نمی‌توانیم از اینجا حساب بسازیم. از والد یا قیم بخواه از داشبورد خانواده یکی بسازد.", uk:"NovaClip потребує підтвердженої згоди батьків для творців до 13 років, тому ми поки що не можемо відкрити обліковий запис звідси. Попроси батьків або опікуна налаштувати його через Сімейну панель.", it:"NovaClip richiede il consenso parentale verificato per i creator sotto i 13 anni, quindi non possiamo ancora aprire un account da qui. Chiedi a un genitore o tutore di configurarlo dal Pannello Famiglia.", pl:"NovaClip wymaga potwierdzonej zgody rodzica dla twórców poniżej 13 lat, więc nie możemy jeszcze założyć konta stąd. Poproś rodzica lub opiekuna, aby założył je z Panelu Rodzinnego.", vi:"NovaClip yêu cầu sự đồng ý đã xác minh của phụ huynh cho nhà sáng tạo dưới 13 tuổi, vì vậy chúng tôi chưa thể mở tài khoản từ đây. Hãy nhờ cha mẹ hoặc người giám hộ thiết lập từ Bảng điều khiển Gia đình." },
  ui_fam_dash: { en:"Open the Family Dashboard", zh:"打开家庭面板", hi:"फ़ैमिली डैशबोर्ड खोलें", es:"Abrir el Panel Familiar", ar:"فتح لوحة العائلة", fr:"Ouvrir le Tableau Famille", bn:"ফ্যামিলি ড্যাশবোর্ড খুলুন", pt:"Abrir o Painel Familiar", ru:"Открыть Семейную панель", ur:"فیملی ڈیش بورڈ کھولیں", id:"Buka Dasbor Keluarga", de:"Familien-Dashboard öffnen", ja:"ファミリーダッシュボードを開く", tr:"Aile Paneli'ni aç", ko:"가족 대시보드 열기", fa:"باز کردن داشبورد خانواده", uk:"Відкрити Сімейну панель", it:"Apri il Pannello Famiglia", pl:"Otwórz Panel Rodzinny", vi:"Mở Bảng điều khiển Gia đình" },
  ui_age_o_t: { en:"You are over 18.", zh:"你已超过18岁。", hi:"आप 18 से अधिक हैं।", es:"Tienes más de 18 años.", ar:"أنت فوق 18 عامًا.", fr:"Tu as plus de 18 ans.", bn:"আপনার বয়স ১৮ বছরের বেশি।", pt:"Tens mais de 18 anos.", ru:"Тебе больше 18.", ur:"آپ 18 سال سے بڑے ہیں۔", id:"Kamu di atas 18 tahun.", de:"Du bist über 18.", ja:"あなたは18歳以上です。", tr:"18 yaşından büyüksün.", ko:"당신은 18세 이상입니다.", fa:"بالای ۱۸ سال هستی.", uk:"Тобі більше 18.", it:"Hai più di 18 anni.", pl:"Masz ponad 18 lat.", vi:"Bạn trên 18 tuổi." },
  ui_age_o_b: { en:"NovaClip is built for creators aged 13 to 18, so this will not be your account — but it can be your child's. The Family Dashboard is the grown-up side: controls, activity and the comment scanner.", zh:"NovaClip专为13至18岁的创作者打造，所以这不会是您的账户——但它可以是您孩子的。家庭面板是成人端：控制、活动和评论扫描器。", hi:"NovaClip 13-18 साल के क्रिएटर्स के लिए बना है, इसलिए यह आपका खाता नहीं होगा — लेकिन आपके बच्चे का हो सकता है। फ़ैमिली डैशबोर्ड बड़ों वाला हिस्सा है: नियंत्रण, गतिविधि और कमेंट स्कैनर।", es:"NovaClip está hecho para creadores de 13 a 18 años, así que esta no será tu cuenta, pero sí puede ser la de tu hijo. El Panel Familiar es el lado adulto: controles, actividad y el escáner de comentarios.", ar:"NovaClip مبني للمبدعين من 13 إلى 18 عامًا، لذا لن يكون هذا حسابك — لكن يمكن أن يكون حساب طفلك. لوحة العائلة هي جانب الكبار: التحكم والنشاط وماسح التعليقات.", fr:"NovaClip est fait pour les créateurs de 13 à 18 ans, donc ce ne sera pas ton compte — mais ça peut être celui de ton enfant. Le Tableau Famille est le côté adultes : contrôles, activité et scanneur de commentaires.", bn:"NovaClip ১৩-১৮ বছরের নির্মাতাদের জন্য তৈরি, তাই এটি আপনার অ্যাকাউন্ট হবে না — তবে আপনার সন্তানের হতে পারে। ফ্যামিলি ড্যাশবোর্ড হলো বড়দের দিক: নিয়ন্ত্রণ, কার্যকলাপ আর কমেন্ট স্ক্যানার।", pt:"A NovaClip é feita para criadores de 13 a 18 anos, por isso esta não será a tua conta — mas pode ser a do teu filho. O Painel Familiar é o lado dos adultos: controlos, atividade e o scanner de comentários.", ru:"NovaClip создан для авторов от 13 до 18 лет, так что это не ваш аккаунт — но может стать аккаунтом вашего ребёнка. Семейная панель — взрослая сторона: контроль, активность и сканер комментариев.", ur:"NovaClip 13-18 سال کے تخلیق کاروں کے لیے بنایا گیا ہے، اس لیے یہ آپ کا اکاؤنٹ نہیں ہوگا — لیکن آپ کے بچے کا ہو سکتا ہے۔ فیملی ڈیش بورڈ بڑوں والا حصہ ہے: کنٹرولز، سرگرمی اور کمنٹ اسکینر۔", id:"NovaClip dibuat untuk kreator usia 13-18, jadi ini bukan akun kamu — tapi bisa jadi akun anakmu. Dasbor Keluarga adalah sisi orang dewasa: kontrol, aktivitas, dan pemindai komentar.", de:"NovaClip ist für Creator von 13 bis 18 gemacht, also wird das nicht dein Konto sein — aber es kann das deines Kindes sein. Das Familien-Dashboard ist die Erwachsenenseite: Kontrollen, Aktivität und der Kommentar-Scanner.", ja:"NovaClipは13〜18歳のクリエイター向けなので、これはあなたのアカウントにはなりません — ただしお子様のアカウントにはできます。ファミリーダッシュボードは大人側です：コントロール、アクティビティ、コメントスキャナー。", tr:"NovaClip 13-18 yaş arası içerik üreticileri için yapıldı, yani bu senin hesabın olmayacak — ama çocuğunun olabilir. Aile Paneli yetişkin tarafıdır: kontroller, etkinlik ve yorum tarayıcısı.", ko:"NovaClip은 13~18세 크리에이터를 위한 것이므로 이 계정은 당신 것이 아닙니다 — 하지만 자녀의 계정이 될 수는 있습니다. 가족 대시보드는 성인 쪽입니다: 통제, 활동, 댓글 스캐너.", fa:"NovaClip برای سازندگان ۱۳ تا ۱۸ سال ساخته شده، پس این حساب تو نیست — اما می‌تواند حساب فرزندت باشد. داشبورد خانواده سمت بزرگ‌سال‌هاست: کنترل‌ها، فعالیت و اسکنر کامنت.", uk:"NovaClip створено для творців від 13 до 18 років, тож це не твій акаунт — але може бути акаунтом твоєї дитини. Сімейна панель — доросла сторона: контроль, активність і сканер коментарів.", it:"NovaClip è pensato per creator dai 13 ai 18 anni, quindi questo non sarà il tuo account — ma può essere quello di tuo figlio. Il Pannello Famiglia è il lato adulti: controlli, attività e scanner dei commenti.", pl:"NovaClip jest stworzony dla twórców w wieku 13-18 lat, więc to nie będzie Twoje konto — ale może być kontem Twojego dziecka. Panel Rodzinny to strona dorosłych: kontrola, aktywność i skaner komentarzy.", vi:"NovaClip được tạo cho nhà sáng tạo từ 13-18 tuổi, vì vậy đây sẽ không phải tài khoản của bạn — nhưng có thể là của con bạn. Bảng điều khiển Gia đình là phía người lớn: kiểm soát, hoạt động và trình quét bình luận." },
  ui_age_s_t: { en:"You are 16 or over.", zh:"你已年满16岁。", hi:"आप 16 या उससे अधिक हैं।", es:"Tienes 16 años o más.", ar:"عمرك 16 أو أكثر.", fr:"Tu as 16 ans ou plus.", bn:"আপনার বয়স ১৬ বা তার বেশি।", pt:"Tens 16 anos ou mais.", ru:"Тебе 16 или больше.", ur:"آپ 16 سال یا اس سے زیادہ ہیں۔", id:"Kamu berusia 16 tahun atau lebih.", de:"Du bist 16 oder älter.", ja:"あなたは16歳以上です。", tr:"16 yaşında veya üzerindesin.", ko:"당신은 16세 이상입니다.", fa:"۱۶ سال یا بیشتر داری.", uk:"Тобі 16 або більше.", it:"Hai 16 anni o più.", pl:"Masz 16 lat lub więcej.", vi:"Bạn từ 16 tuổi trở lên." },
  ui_age_s_b: { en:"Monitoring is lighter from here: your chats are no longer logged for your parent. Parental controls can still only be fully removed by your parent, from the Family Dashboard.", zh:"从今以后监控更轻：您的聊天记录不再对家长可见。家长控制仍只能由您的家长从家庭面板完全移除。", hi:"अब से निगरानी हल्की है: आपकी चैट अब आपके माता-पिता के लिए लॉग नहीं होंगी। पैरेंटल कंट्रोल अब भी सिर्फ आपके माता-पिता ही फ़ैमिली डैशबोर्ड से पूरी तरह हटा सकते हैं।", es:"El seguimiento es más ligero a partir de aquí: tus chats ya no se registran para tus padres. Los controles parentales solo pueden eliminarse por completo desde el Panel Familiar.", ar:"المراقبة أخف من هنا: لم تعد محادثاتك تُسجّل لوالديك. لا تزال أدوات الرقابة الأبوية قابلة للإزالة كليًا فقط من لوحة العائلة.", fr:"Le suivi est plus léger à partir d'ici : tes chats ne sont plus enregistrés pour ton parent. Les contrôles parentaux ne peuvent toujours être retirés complètement que par ton parent, depuis le Tableau Famille.", bn:"এখান থেকে নজরদারি হালকা: আপনার চ্যাট আর অভিভাবকের জন্য রেকর্ড হয় না। অভিভাবক নিয়ন্ত্রণ এখনো শুধু আপনার অভিভাবকই ফ্যামিলি ড্যাশবোর্ড থেকে পুরোপুরি সরাতে পারেন।", pt:"A partir daqui a monitorização é mais leve: os teus chats deixam de ser registados para os teus pais. Os controlos parentais só podem ser totalmente removidos pelos teus pais, a partir do Painel Familiar.", ru:"Отсюда контроль становится мягче: твои чаты больше не логируются для родителей. Полностью убрать родительский контроль могут только родители, через Семейную панель.", ur:"یہاں سے نگرانی ہلکی ہے: آپ کی چٹس اب والدین کے لیے لاگ نہیں ہوں گی۔ پیرنٹل کنٹرولز کو مکمل طور پر صرف آپ کے والدین ہی فیملی ڈیش بورڈ سے ہٹا سکتے ہیں۔", id:"Pemantauan lebih ringan mulai sini: obrolanmu tidak lagi dicatat untuk orang tuamu. Kontrol orang tua tetap hanya bisa dihapus sepenuhnya oleh orang tuamu, dari Dasbor Keluarga.", de:"Ab hier ist die Überwachung leichter: Deine Chats werden nicht mehr für deine Eltern protokolliert. Elternkontrollen können weiterhin nur von deinen Eltern über das Familien-Dashboard vollständig entfernt werden.", ja:"ここから先は監視が軽くなります：あなたのチャットは保護者に記録されません。ペアレンタルコントロールの完全な解除は引き続き保護者がファミリーダッシュボードからのみ行えます。", tr:"Buradan itibaren izleme daha hafiftir: sohbetlerin artık velin için kaydedilmez. Ebeveyn denetimleri yalnızca velin tarafından, Aile Paneli'nden tamamen kaldırılabilir.", ko:"여기부터 모니터링이 가벼워집니다: 채팅이 더 이상 부모님에게 기록되지 않습니다. 자녀 보호는 여전히 부모님만 가족 대시보드에서 완전히 제거할 수 있습니다.", fa:"از اینجا به بعد نظارت سبک‌تر است: گفتگوهایت دیگر برای والدین ثبت نمی‌شوند. کنترل والدین همچنان فقط توسط والدینت و از داشبورد خانواده کاملاً قابل حذف است.", uk:"Звідси нагляд стає м'якшим: твої чати більше не логуються для батьків. Батьківський контроль можуть повністю зняти лише батьки, через Сімейну панель.", it:"Da qui in poi il monitoraggio è più leggero: le tue chat non vengono più registrate per il tuo genitore. I controlli parentali possono essere rimossi completamente solo dal tuo genitore, dal Pannello Famiglia.", pl:"Od tego momentu monitoring jest lżejszy: Twoje czaty nie są już rejestrowane dla rodzica. Kontrola rodzicielska może zostać całkowicie usunięta tylko przez Twojego rodzica, z Panelu Rodzinnego.", vi:"Giám sát nhẹ hơn từ đây: cuộc trò chuyện của bạn không còn được ghi lại cho cha mẹ. Kiểm soát phụ huynh vẫn chỉ có thể bị loại bỏ hoàn toàn bởi cha mẹ bạn, từ Bảng điều khiển Gia đình." },
  ui_susp_t: { en:"Account suspended", zh:"账户已暂停", hi:"खाता निलंबित", es:"Cuenta suspendida", ar:"الحساب معلق", fr:"Compte suspendu", bn:"অ্যাকাউন্ট স্থগিত", pt:"Conta suspensa", ru:"Аккаунт приостановлен", ur:"اکاؤنٹ معطل", id:"Akun ditangguhkan", de:"Konto gesperrt", ja:"アカウント停止中", tr:"Hesap askıya alındı", ko:"계정이 정지됨", fa:"حساب معلق شد", uk:"Обліковий запис призупинено", it:"Account sospeso", pl:"Konto zawieszone", vi:"Tài khoản bị tạm khóa" },
  ui_susp_b: { en:"Your access to NovaClip is paused for {n} {unit}.", zh:"您对 NovaClip 的访问已暂停 {n} {unit}。", hi:"NovaClip तक आपकी पहुँच {n} {unit} के लिए रोक दी गई है।", es:"Tu acceso a NovaClip está en pausa durante {n} {unit}.", ar:"تم إيقاف وصولك إلى NovaClip لمدة {n} {unit}.", fr:"Ton accès à NovaClip est en pause pendant {n} {unit}.", bn:"NovaClip-এ আপনার অ্যাক্সেস {n} {unit} এর জন্য স্থগিত।", pt:"O teu acesso à NovaClip está em pausa por {n} {unit}.", ru:"Твой доступ к NovaClip приостановлен на {n} {unit}.", ur:"NovaClip تک آپ کی رسائی {n} {unit} کے لیے روک دی گئی ہے۔", id:"Aksesmu ke NovaClip dijeda selama {n} {unit}.", de:"Dein Zugriff auf NovaClip ist für {n} {unit} pausiert.", ja:"NovaClipへのアクセスは{n}{unit}一時停止されています。", tr:"NovaClip erişimin {n} {unit} süreyle durduruldu.", ko:"NovaClip 액세스가 {n} {unit} 동안 일시 중지되었습니다.", fa:"دسترسی تو به NovaClip به مدت {n} {unit} متوقف شده است.", uk:"Твій доступ до NovaClip призупинено на {n} {unit}.", it:"Il tuo accesso a NovaClip è in pausa per {n} {unit}.", pl:"Twój dostęp do NovaClip jest wstrzymany na {n} {unit}.", vi:"Quyền truy cập NovaClip của bạn bị tạm dừng trong {n} {unit}." },
  ui_day: { en:"day", zh:"天", hi:"दिन", es:"día", ar:"يوم", fr:"jour", bn:"দিন", pt:"dia", ru:"день", ur:"دن", id:"hari", de:"Tag", ja:"日間", tr:"gün", ko:"일", fa:"روز", uk:"день", it:"giorno", pl:"dzień", vi:"ngày" },
  ui_days: { en:"days", zh:"天", hi:"दिन", es:"días", ar:"أيام", fr:"jours", bn:"দিন", pt:"dias", ru:"дня", ur:"دن", id:"hari", de:"Tage", ja:"日間", tr:"gün", ko:"일", fa:"روز", uk:"дні", it:"giorni", pl:"dni", vi:"ngày" },
  ui_reason: { en:"Reason: ", zh:"原因：", hi:"कारण:", es:"Motivo: ", ar:"السبب: ", fr:"Raison : ", bn:"কারণ: ", pt:"Motivo: ", ru:"Причина: ", ur:"وجہ: ", id:"Alasan: ", de:"Grund: ", ja:"理由：", tr:"Neden: ", ko:"사유: ", fa:"دلیل: ", uk:"Причина: ", it:"Motivo: ", pl:"Powód: ", vi:"Lý do: " },
  ui_susp_help: { en:"If you believe this is a mistake, ask a parent or guardian to contact support.", zh:"如果您认为这是错误，请让家长或监护人联系支持团队。", hi:"अगर आपको लगता है कि यह गलती है, तो अपने माता-पिता या अभिभावक से सहायता से संपर्क करने के लिए कहें।", es:"Si crees que es un error, pide a un padre o tutor que contacte con soporte.", ar:"إذا كنت تعتقد أن هذا خطأ، اطلب من أحد الوالدين أو الوصي التواصل مع الدعم.", fr:"Si tu penses que c'est une erreur, demande à un parent ou tuteur de contacter le support.", bn:"যদি মনে হয় এটি ভুল, তাহলে অভিভাবককে সাপোর্টে যোগাযোগ করতে বলুন।", pt:"Se achas que é um engano, pede a um pai ou encarregado de educação que contacte o apoio.", ru:"Если ты считаешь, что это ошибка, попроси родителя или опекуна связаться со службой поддержки.", ur:"اگر آپ کو لگتا ہے کہ یہ غلطی ہے، تو والدین یا سرپرست سے سپورٹ سے رابطہ کرنے کو کہیں۔", id:"Jika menurutmu ini kesalahan, minta orang tua atau wali untuk menghubungi dukungan.", de:"Wenn du glaubst, dass das ein Fehler ist, bitte deine Eltern oder deinen Vormund, den Support zu kontaktieren.", ja:"もし誤りだと思うなら、保護者にサポートへの連絡を頼んでください。", tr:"Bunun bir hata olduğunu düşünüyorsan, velinden destekle iletişime geçmesini iste.", ko:"이것이 실수라고 생각되면 부모님 또는 보호자에게 지원팀에 연락하도록 하세요.", fa:"اگر فکر می‌کنی این اشتباه است، از والد یا قیم بخواه با پشتیبانی تماس بگیرد.", uk:"Якщо ти вважаєш, що це помилка, попроси батьків або опікуна звернутися в підтримку.", it:"Se pensi che sia un errore, chiedi a un genitore o tutore di contattare il supporto.", pl:"Jeśli uważasz, że to pomyłka, poproś rodzica lub opiekuna o kontakt ze wsparciem.", vi:"Nếu bạn nghĩ đây là nhầm lẫn, hãy nhờ cha mẹ hoặc người giám hộ liên hệ bộ phận hỗ trợ." },
  ui_break_t: { en:"Time for a break", zh:"该休息一下了", hi:"ब्रेक का समय है", es:"Hora de un descanso", ar:"حان وقت الاستراحة", fr:"C'est l'heure de la pause", bn:"বিরতির সময় হয়েছে", pt:"Hora de uma pausa", ru:"Время отдохнуть", ur:"آرام کا وقت ہے", id:"Waktunya istirahat", de:"Zeit für eine Pause", ja:"休憩の時間です", tr:"Mola zamanı", ko:"휴식 시간입니다", fa:"وقت استراحت است", uk:"Час перерви", it:"È ora di una pausa", pl:"Czas na przerwę", vi:"Đến giờ nghỉ ngơi" },
  ui_break_b: { en:"You have been here an hour and a half. Stand up, look out of a window, drink something. NovaClip will be here.", zh:"你已经在这里待了一个半小时。站起来，看看窗外，喝点东西。NovaClip 会一直在这里。", hi:"आप डेढ़ घंटे से यहाँ हैं। खड़े हो जाएँ, खिड़की से बाहर देखें, कुछ पीएँ। NovaClip यहीं रहेगा।", es:"Llevas aquí una hora y media. Levántate, mira por la ventana, bebe algo. NovaClip seguirá aquí.", ar:"لقد قضيت هنا ساعة ونصف. قف، انظر من النافذة، واشرب شيئًا. سيبقى NovaClip هنا.", fr:"Tu es là depuis une heure et demie. Lève-toi, regarde par la fenêtre, bois quelque chose. NovaClip sera toujours là.", bn:"আপনি এখানে দেড় ঘণ্টা ধরে আছেন। উঠে দাঁড়ান, জানালা দিয়ে বাইরে দেখুন, কিছু পান করুন। NovaClip এখানেই থাকবে।", pt:"Estás aqui há hora e meia. Levanta-te, olha pela janela, bebe qualquer coisa. A NovaClip vai continuar aqui.", ru:"Ты здесь уже полтора часа. Встань, посмотри в окно, выпей чего-нибудь. NovaClip никуда не денется.", ur:"آپ یہاں ڈیڑھ گھنٹے سے ہیں۔ کھڑے ہوں، کھڑکی سے باہر دیکھیں، کچھ پیئیں۔ NovaClip یہی رہے گا۔", id:"Kamu sudah di sini satu setengah jam. Berdiri, lihat ke luar jendela, minum sesuatu. NovaClip akan tetap di sini.", de:"Du bist schon eineinhalb Stunden hier. Steh auf, schau aus dem Fenster, trink etwas. NovaClip bleibt da.", ja:"あなたはここに1時間半います。立ち上がって、窓の外を見て、何か飲みましょう。NovaClipはここにあります。", tr:"Burada bir buçuk saattirsin. Kalk, pencereden dışarı bak, bir şeyler iç. NovaClip burada kalacak.", ko:"여기에 한 시간 반 동안 머물렀습니다. 일어나서 창밖을 보고, 물을 마시세요. NovaClip은 여기에 있습니다.", fa:"یک ساعت و نیم است اینجایی. بلند شو، از پنجره بیرون را نگاه کن، چیزی بنوش. NovaClip همین‌جا می‌ماند.", uk:"Ти тут уже півтори години. Встань, подивись у вікно, випий чогось. NovaClip нікуди не подінеться.", it:"Sei qui da un'ora e mezza. Alzati, guarda fuori dalla finestra, bevi qualcosa. NovaClip resterà qui.", pl:"Jesteś tu od półtorej godziny. Wstań, popatrz przez okno, napij się czegoś. NovaClip tu zostanie.", vi:"Bạn đã ở đây một tiếng rưỡi. Đứng dậy, nhìn ra ngoài cửa sổ, uống chút gì đó. NovaClip sẽ vẫn ở đây." },
  ui_left: { en:"{t} left", zh:"还剩 {t}", hi:"{t} बाकी", es:"quedan {t}", ar:"متبقي {t}", fr:"{t} restantes", bn:"বাকি {t}", pt:"faltam {t}", ru:"осталось {t}", ur:"{t} باقی", id:"tersisa {t}", de:"noch {t}", ja:"残り{t}", tr:"{t} kaldı", ko:"{t} 남음", fa:"{t} مانده", uk:"лишилось {t}", it:"restano {t}", pl:"zostało {t}", vi:"còn lại {t}" },
  ui_set_name: { en:"Set your name", zh:"设置你的名字", hi:"अपना नाम सेट करें", es:"Pon tu nombre", ar:"حدد اسمك", fr:"Choisis ton nom", bn:"আপনার নাম সেট করুন", pt:"Define o teu nome", ru:"Задай имя", ur:"اپنا نام سیٹ کریں", id:"Atur namamu", de:"Setz deinen Namen", ja:"名前を設定", tr:"Adını belirle", ko:"이름 설정하기", fa:"نامت را تنظیم کن", uk:"Задай своє ім'я", it:"Imposta il tuo nome", pl:"Ustaw swoją nazwę", vi:"Đặt tên của bạn" },
  ui_su_chip: { en:"First visit" },
  ui_su_h: { en:"Make your profile" },
  ui_su_h2: { en:"Sign in" },
  ui_su_p: { en:"So your points, streaks and certificates follow you to your phone. No email, no real name \u2014 just a username you pick." },
  ui_su_user: { en:"Username" },
  ui_su_pass: { en:"Password" },
  ui_su_go: { en:"Create it" },
  ui_su_in: { en:"Sign in" },
  ui_su_have: { en:"I already have one" },
  ui_su_new: { en:"I need to make one" },
  ui_su_skip: { en:"Have a look round first" },
  ui_su_both: { en:"Both boxes, please." },
  ui_su_wait: { en:"One moment\u2026" },
  ui_su_local: { en:"Scrambling your password on this device before anything is sent\u2026" },
  ui_su_off: { en:"Cannot reach the NovaClip server just now, so this will have to wait. Letting you in anyway \u2014 you can make a profile later from the You menu." },
  ui_profile: { en:"Your profile", zh:"你的资料", hi:"आपकी प्रोफ़ाइल", es:"Tu perfil", ar:"ملفك الشخصي", fr:"Ton profil", bn:"আপনার প্রোফাইল", pt:"O teu perfil", ru:"Твой профиль", ur:"آپ کا پروفائل", id:"Profilmu", de:"Dein Profil", ja:"あなたのプロフィール", tr:"Profilin", ko:"내 프로필", fa:"پروفایل تو", uk:"Твій профіль", it:"Il tuo profilo", pl:"Twój profil", vi:"Hồ sơ của bạn" },
  ui_name: { en:"Name", zh:"名字", hi:"नाम", es:"Nombre", ar:"الاسم", fr:"Nom", bn:"নাম", pt:"Nome", ru:"Имя", ur:"نام", id:"Nama", de:"Name", ja:"名前", tr:"Ad", ko:"이름", fa:"نام", uk:"Ім'я", it:"Nome", pl:"Nazwa", vi:"Tên" },
  ui_name_ph: { en:"What should we call you?", zh:"我们该叫你什么？", hi:"हम आपको क्या बुलाएँ?", es:"¿Cómo te llamamos?", ar:"بماذا نناديك؟", fr:"Comment t'appeler ?", bn:"আপনাকে কী বলে ডাকব?", pt:"Como te chamamos?", ru:"Как тебя называть?", ur:"ہم آپ کو کیا کہیں؟", id:"Kami memanggilmu apa?", de:"Wie sollen wir dich nennen?", ja:"あなたのことを何と呼べばいいですか？", tr:"Sana ne diyelim?", ko:"어떻게 부를까요?", fa:"چی صدايت کنیم؟", uk:"Як тебе називати?", it:"Come ti chiamiamo?", pl:"Jak cię nazwać?", vi:"Chúng tôi nên gọi bạn là gì?" },
  ui_picture: { en:"Picture", zh:"头像", hi:"तस्वीर", es:"Imagen", ar:"الصورة", fr:"Photo", bn:"ছবি", pt:"Imagem", ru:"Картинка", ur:"تصویر", id:"Gambar", de:"Bild", ja:"画像", tr:"Resim", ko:"사진", fa:"عکس", uk:"Зображення", it:"Immagine", pl:"Obraz", vi:"Ảnh" },
  ui_or_own: { en:"or use your own", zh:"或使用你自己的", hi:"या अपनी खुद की चुनें", es:"o usa la tuya", ar:"أو استخدم صورتك", fr:"ou utilise la tienne", bn:"বা আপনার নিজের ব্যবহার করুন", pt:"ou usa a tua", ru:"или свою картинку", ur:"یا اپنی استعمال کریں", id:"atau pakai gambarmu sendiri", de:"oder verwende dein eigenes", ja:"または自分のを使う", tr:"ya da kendi resmini kullan", ko:"또는 직접 만든 것 사용", fa:"یا از عکس خودت استفاده کن", uk:"або своє зображення", it:"oppure usa la tua", pl:"albo użyj własnego", vi:"hoặc dùng ảnh của bạn" },
  ui_local_only: { en:"Both stay in this browser. There is no server here, so nothing is uploaded and nobody else can see them.", zh:"这两项都只保存在此浏览器中。这里没有服务器，因此不会上传任何内容，其他人也看不到。", hi:"दोनों इसी ब्राउज़र में रहते हैं। यहाँ कोई सर्वर नहीं है, इसलिए कुछ भी अपलोड नहीं होता और कोई और इन्हें नहीं देख सकता।", es:"Ambos se quedan en este navegador. No hay servidor aquí, así que nada se sube y nadie más puede verlos.", ar:"كلاهما يبقى في هذا المتصفح. لا يوجد خادم هنا، لذا لا يُرفع أي شيء ولا يستطيع أي شخص آخر رؤيتهما.", fr:"Les deux restent dans ce navigateur. Il n'y a pas de serveur ici, donc rien n'est envoyé et personne d'autre ne peut les voir.", bn:"দুটোই এই ব্রাউজারেই থাকে। এখানে কোনো সার্ভার নেই, তাই কিছুই আপলোড হয় না এবং অন্য কেউ দেখতে পায় না।", pt:"Ambos ficam neste navegador. Não há servidor aqui, por isso nada é enviado e mais ninguém os pode ver.", ru:"Оба остаются в этом браузере. Сервера нет, поэтому ничего не загружается и никто другой их не увидит.", ur:"دونوں اسی براؤزر میں رہتے ہیں۔ یہاں کوئی سرور نہیں، اس لیے کچھ اپ لوڈ نہیں ہوتا اور کوئی اور انہیں نہیں دیکھ سکتا۔", id:"Keduanya tetap di browser ini. Tidak ada server di sini, jadi tidak ada yang diunggah dan tidak ada orang lain yang bisa melihatnya.", de:"Beides bleibt in diesem Browser. Es gibt hier keinen Server, also wird nichts hochgeladen und niemand sonst kann sie sehen.", ja:"どちらもこのブラウザにのみ保存されます。ここにサーバーはないので、アップロードはされず、他の誰にも見えません。", tr:"İkisi de bu tarayıcıda kalır. Burada sunucu yok, yani hiçbir şey yüklenmez ve başka kimse göremez.", ko:"둘 다 이 브라우저에만 남습니다. 여기에는 서버가 없어 아무것도 업로드되지 않고 다른 누구도 볼 수 없습니다.", fa:"هر دو فقط در همین مرورگر می‌مانند. اینجا سروری نیست، پس چیزی آپلود نمی‌شود و هیچ‌کس دیگری نمی‌تواند ببیندشان.", uk:"Обидва залишаються в цьому браузері. Тут немає сервера, тому нічого не завантажується і ніхто інший їх не побачить.", it:"Entrambi restano in questo browser. Non c'è un server qui, quindi nulla viene caricato e nessun altro può vederli.", pl:"Obie rzeczy zostają w tej przeglądarce. Nie ma tu serwera, więc nic nie jest wysyłane i nikt inny ich nie zobaczy.", vi:"Cả hai chỉ ở lại trong trình duyệt này. Không có máy chủ ở đây, nên không có gì được tải lên và không ai khác có thể nhìn thấy chúng." },
  ui_ai_key: { en:"Your own AI key (optional)", zh:"你自己的 AI 密钥（可选）", hi:"आपकी अपनी AI कुंजी (वैकल्पिक)", es:"Tu propia clave de IA (opcional)", ar:"مفتاح الذكاء الاصطناعي الخاص بك (اختياري)", fr:"Ta propre clé IA (facultatif)", bn:"আপনার নিজের AI কী (ঐচ্ছিক)", pt:"A tua própria chave de IA (opcional)", ru:"Свой ключ ИИ (необязательно)", ur:"آپ کی اپنی AI کلید (اختیاری)", id:"Kunci AI milikmu sendiri (opsional)", de:"Dein eigener KI-Schlüssel (optional)", ja:"自分のAIキー（任意）", tr:"Kendi YZ anahtarın (isteğe bağlı)", ko:"나만의 AI 키 (선택 사항)", fa:"کلید AI خودت (اختیاری)", uk:"Власний ШІ-ключ (необов'язково)", it:"La tua chiave IA (facoltativa)", pl:"Własny klucz AI (opcjonalnie)", vi:"Khóa AI của riêng bạn (tùy chọn)" },
  ui_key_shared: { en:"Leave this empty and the AI here uses NovaClip's shared key, which is free but gets busy. A key of your own from {link} skips the queue. It is kept in this browser and sent straight to Google — so the requests are billed to you, and anyone with your device can read it. Do not paste a key you also use for anything important.", zh:"留空则此处 AI 使用 NovaClip 的共享密钥，免费但会比较繁忙。从 {link} 获取您自己的密钥即可跳过队列。它保存在此浏览器中并直接发送给 Google——因此请求将计入您的账单，任何使用您设备的人都可以读取。请勿粘贴您用于其他重要事项的密钥。", hi:"इसे खाली छोड़ें और यहाँ की AI NovaClip का शेयर किया हुआ की इस्तेमाल करती है, जो मुफ़्त है पर व्यस्त हो जाती है। {link} से अपनी खुद की कुंजी मिलेगी तो कतार छूट जाएगी। यह इसी ब्राउज़र में रहती है और सीधे Google को जाती है — इसलिए रिक्वेस्ट आपके बिल पर आती हैं, और आपके डिवाइस वाला कोई भी इसे पढ़ सकता है। कोई ऐसी कुंजी न डालें जो आप किसी ज़रूरी चीज़ के लिए भी इस्तेमाल करते हैं।", es:"Déjalo vacío y la IA usará la clave compartida de NovaClip, que es gratis pero se satura. Una clave propia de {link} evita la espera. Se guarda en este navegador y se envía directamente a Google, así que las peticiones se cobran a tu cuenta y cualquiera con tu dispositivo puede leerla. No pegues una clave que también uses para algo importante.", ar:"اتركه فارغًا وسيستخدم الذكاء الاصطناعي هنا المفتاح المشترك لـ NovaClip، وهو مجاني لكنه يزدحم. مفتاح خاص بك من {link} يتخطى قائمة الانتظار. يُحفظ في هذا المتصفح ويُرسل مباشرة إلى جوجل — لذا تُحاسب الطلبات عليك، ويمكن لأي شخص يملك جهازك قراءته. لا تلصق مفتاحًا تستخدمه أيضًا لأي شيء مهم.", fr:"Laisse vide et l'IA utilisera la clé partagée de NovaClip, gratuite mais souvent saturée. Une clé personnelle depuis {link} passe avant tout le monde. Elle est gardée dans ce navigateur et envoyée directement à Google — donc les requêtes sont facturées à toi, et n'importe qui avec ton appareil peut la lire. Ne colle pas une clé que tu utilises aussi pour quelque chose d'important.", bn:"খালি রাখলে এখানকার AI NovaClip-এর শেয়ার করা কী ব্যবহার করে, যা ফ্রি কিন্তু ব্যস্ত হয়ে যায়। {link} থেকে নিজের একটি কী নিলে সারি এড়ানো যায়। এটি এই ব্রাউজারেই থাকে এবং সরাসরি Google-এ যায় — তাই রিকোয়েস্ট আপনার বিলে আসে, আর আপনার ডিভাইসে থাকা যে কেউ এটি পড়তে পারে। গুরুত্বপূর্ণ কোনো কাজে ব্যবহৃত কী এখানে পেস্ট করবেন না।", pt:"Deixa vazio e a IA usa a chave partilhada da NovaClip, que é grátis mas fica ocupada. Uma chave tua do {link} passa à frente da fila. É guardada neste navegador e enviada diretamente para o Google — por isso os pedidos são cobrados a ti, e qualquer pessoa com o teu dispositivo pode lê-la. Não coles uma chave que também uses para algo importante.", ru:"Оставь пустым — ИИ использует общий ключ NovaClip: бесплатно, но бывает перегружен. Свой ключ из {link} минует очередь. Он хранится в этом браузере и уходит напрямую в Google — поэтому запросы оплачиваются тобой, и любой, у кого твоё устройство, сможет его прочитать. Не вставляй ключ, который используешь ещё для чего-то важного.", ur:"خالی چھوڑ دیں تو یہاں کی AI NovaClip کی مشترکہ کلید استعمال کرتی ہے، جو مفت ہے مگر مصروف ہو جاتی ہے۔ {link} سے اپنی کلید لینے پر قطار ختم۔ یہ اسی براؤزر میں رہتی ہے اور براہ راست Google کو جاتی ہے — اس لیے درخواستیں آپ کے بل پر آتی ہیں، اور آپ کی ڈیوائس والا کوئی بھی اسے پڑھ سکتا ہے۔ ایسی کلید نہ چسپاں کریں جو آپ کسی اہم چیز کے لیے بھی استعمال کرتے ہیں۔", id:"Biarkan kosong dan AI di sini memakai kunci bersama NovaClip, yang gratis tapi sering sibuk. Kunci milikmu dari {link} melompati antrean. Kunci itu disimpan di browser ini dan dikirim langsung ke Google — jadi permintaannya ditagih ke kamu, dan siapa pun yang memegang perangkatmu bisa membacanya. Jangan tempel kunci yang juga kamu pakai untuk hal penting.", de:"Leer lassen und die KI nutzt den gemeinsamen NovaClip-Schlüssel: kostenlos, aber schnell ausgelastet. Ein eigener Schlüssel von {link} umgeht die Warteschlange. Er bleibt in diesem Browser und geht direkt an Google — die Anfragen werden also dir in Rechnung gestellt, und jeder mit deinem Gerät kann ihn lesen. Füge keinen Schlüssel ein, den du auch für etwas Wichtiges nutzt.", ja:"空のままにすると、ここではNovaClipの共有キーが使われます。無料ですが混み合います。{link}で自分のキーを取得すれば待ち時間を回避できます。キーはこのブラウザに保存され、直接Googleに送られます — そのためリクエストはあなたに請求され、あなたの端末を使う誰でも読めます。重要な用途でも使うキーは貼り付けないでください。", tr:"Boş bırakırsan buradaki YZ, NovaClip'in paylaşılan anahtarını kullanır; ücretsizdir ama yoğunlaşır. {link}'ten kendi anahtarın kuyruğu atlar. Tarayıcıda saklanır ve doğrudan Google'a gider — bu yüzden istekler sana faturalanır ve cihazındaki herkes okuyabilir. Başka önemli bir şeyde de kullandığın anahtarı yapıştırma.", ko:"비워두면 여기의 AI가 NovaClip 공유 키를 사용합니다. 무료지만 바쁠 수 있습니다. {link}에서 직접 만든 키를 쓰면 대기열을 건너뜁니다. 키는 이 브라우저에 저장되고 Google로 직접 전송됩니다 — 따라서 요청은 당신에게 청구되고, 당신의 기기를 가진 누구나 읽을 수 있습니다. 다른 중요한 곳에 쓰는 키는 붙여넣지 마세요.", fa:"خالی بگذار تا هوش مصنوعی از کلید مشترک NovaClip استفاده کند؛ رایگان است ولی شلوغ می‌شود. گرفتن کلید خودت از {link} از صف عبور می‌کند. کلید در همین مرورگر می‌ماند و مستقیم به گوگل فرستاده می‌شود — پس هزینه درخواست‌ها به حساب تو می‌رود و هرکسی که دستگاهت در دستش باشد می‌تواند آن را بخواند. کلیدی را که برای کار مهم دیگری هم استفاده می‌کنی نچسبان.", uk:"Залиш порожнім — ШІ використає спільний ключ NovaClip: безкоштовно, але буває перевантажений. Власний ключ із {link} обійде чергу. Він зберігається в цьому браузері та йде прямо в Google — тому запити оплачуються тобою, а будь-хто з твоїм пристроєм зможе його прочитати. Не вставляй ключ, який використовуєш ще для чогось важливого.", it:"Lascia vuoto e l'IA userà la chiave condivisa di NovaClip: gratuita ma spesso occupata. Una chiave tua da {link} salta la coda. Viene conservata in questo browser e inviata direttamente a Google — quindi le richieste vengono addebitate a te, e chiunque abbia il tuo dispositivo può leggerla. Non incollare una chiave che usi anche per qualcosa di importante.", pl:"Zostaw puste, a AI użyje współdzielonego klucza NovaClip — darmowy, ale bywa zajęty. Własny klucz z {link} omija kolejkę. Jest przechowywany w tej przeglądarce i wysyłany bezpośrednio do Google — więc żądania są rozliczane na Ciebie, a każdy, kto ma Twoje urządzenie, może go odczytać. Nie wklejaj klucza, którego używasz też do czegoś ważnego.", vi:"Để trống thì AI ở đây sẽ dùng khóa chung của NovaClip, miễn phí nhưng hay bận. Một khóa riêng từ {link} sẽ được ưu tiên. Khóa được giữ trong trình duyệt này và gửi thẳng đến Google — vì vậy yêu cầu sẽ tính vào tài khoản của bạn, và bất kỳ ai có thiết bị của bạn đều đọc được. Đừng dán một khóa bạn cũng dùng cho việc gì đó quan trọng." },
  ui_key_bad: { en:"A Google AI key starts with AIza and is about 39 characters. That one is not.", zh:"Google AI 密钥以 AIza 开头，约39个字符。这个不是。", hi:"Google AI कुंजी AIza से शुरू होती है और लगभग 39 अक्षरों की होती है। यह वैसी नहीं है।", es:"Una clave de IA de Google empieza por AIza y tiene unos 39 caracteres. Esa no.", ar:"يبدأ مفتاح Google AI بـ AIza ويبلغ حوالي 39 حرفًا. هذا ليس كذلك.", fr:"Une clé Google IA commence par AIza et fait environ 39 caractères. Celle-ci ne l'est pas.", bn:"Google AI কী AIza দিয়ে শুরু হয় এবং প্রায় ৩৯ অক্ষরের হয়। এটি সেরকম নয়।", pt:"Uma chave de IA do Google começa por AIza e tem cerca de 39 caracteres. Essa não.", ru:"Ключ Google AI начинается с AIza и содержит около 39 символов. Этот — нет.", ur:"Google AI کلید AIza سے شروع ہوتی ہے اور تقریباً 39 حروف پر مشتمل ہوتی ہے۔ یہ وہ نہیں ہے۔", id:"Kunci AI Google diawali AIza dan panjangnya sekitar 39 karakter. Itu bukan.", de:"Ein Google-KI-Schlüssel beginnt mit AIza und hat etwa 39 Zeichen. Dieser ist es nicht.", ja:"Google AIキーは「AIza」で始まり、約39文字です。それは違います。", tr:"Google YZ anahtarı AIza ile başlar ve yaklaşık 39 karakterdir. O öyle değil.", ko:"Google AI 키는 AIza로 시작하며 약 39자입니다. 그건 아닙니다.", fa:"کلید AI گوگل با AIza شروع می‌شود و حدود ۳۹ کاراکتر است. این یکی نیست.", uk:"Ключ Google AI починається з AIza і має близько 39 символів. Цей — ні.", it:"Una chiave IA di Google inizia con AIza ed è di circa 39 caratteri. Questa non lo è.", pl:"Klucz AI Google zaczyna się od AIza i ma około 39 znaków. Ten nie jest.", vi:"Khóa AI của Google bắt đầu bằng AIza và dài khoảng 39 ký tự. Cái này không phải." },
  ui_name_short: { en:"A name needs at least two characters.", zh:"名字至少需要两个字符。", hi:"नाम कम से कम दो अक्षरों का होना चाहिए।", es:"El nombre necesita al menos dos caracteres.", ar:"يحتاج الاسم إلى حرفين على الأقل.", fr:"Le nom doit faire au moins deux caractères.", bn:"নাম কমপক্ষে দুই অক্ষরের হতে হবে।", pt:"O nome precisa de pelo menos dois caracteres.", ru:"Имя должно содержать минимум два символа.", ur:"نام کم از کم دو حروف کا ہونا چاہیے۔", id:"Nama minimal harus dua karakter.", de:"Ein Name braucht mindestens zwei Zeichen.", ja:"名前は2文字以上必要です。", tr:"Bir ad en az iki karakter olmalı.", ko:"이름은 최소 두 글자 이상이어야 합니다.", fa:"نام باید حداقل دو کاراکتر باشد.", uk:"Ім'я має містити щонайменше два символи.", it:"Il nome deve avere almeno due caratteri.", pl:"Nazwa musi mieć co najmniej dwa znaki.", vi:"Tên cần ít nhất hai ký tự." },
  ui_name_taken: { en:"Pick something else — that one will not fly here.", zh:"请换一个——这个名字在这里不受欢迎。", hi:"कुछ और चुनें — यह वाला यहाँ नहीं चलेगा।", es:"Elige otra cosa: esa aquí no cuela.", ar:"اختر شيئًا آخر — هذا الاسم غير مقبول هنا.", fr:"Choisis autre chose — celui-là ne passera pas ici.", bn:"অন্য কিছু বেছে নিন — এটা এখানে চলবে না।", pt:"Escolhe outra coisa — essa aqui não vai colar.", ru:"Выбери что-нибудь другое — это здесь не пройдёт.", ur:"کچھ اور چنیں — یہ یہاں نہیں چلے گا۔", id:"Pilih yang lain — itu tidak akan diterima di sini.", de:"Nimm etwas anderes — das wird hier nicht klappen.", ja:"別の名前にしてください — それはここでは通りません。", tr:"Başka bir şey seç — o burada kabul edilmez.", ko:"다른 걸 골라주세요 — 그건 여기서 통하지 않습니다.", fa:"چیز دیگری انتخاب کن — این‌جا پذیرفته نمی‌شود.", uk:"Обери щось інше — це тут не пройде.", it:"Scegli qualcos'altro — qui non passa.", pl:"Wybierz coś innego — to tu nie przejdzie.", vi:"Chọn cái khác đi — cái đó không hợp ở đây." },
  ui_unlocked: { en:"UNLOCKED: ", zh:"已解锁：", hi:"अनलॉक हुआ: ", es:"DESBLOQUEADO: ", ar:"تم فتح: ", fr:"DÉBLOQUÉ : ", bn:"আনলক হয়েছে: ", pt:"DESBLOQUEADO: ", ru:"ОТКРЫТО: ", ur:"انلاک ہو گیا: ", id:"TERBUKA: ", de:"FREIGESCHALTET: ", ja:"解放！", tr:"AÇILDI: ", ko:"잠금 해제: ", fa:"باز شد: ", uk:"ВІДКРИТО: ", it:"SBLOCCATO: ", pl:"ODBLOKOWANO: ", vi:"ĐÃ MỞ KHÓA: " },
  ui_done: { en:" — DONE", zh:"— 已完成", hi:"— पूरा हुआ", es:"— HECHO", ar:"— تم", fr:"— FAIT", bn:"— সম্পন্ন", pt:"— FEITO", ru:"— ГОТОВО", ur:"— مکمل", id:"— SELESAI", de:"— ERLEDIGT", ja:"— 達成", tr:"— TAMAM", ko:"— 완료", fa:"— انجام شد", uk:"— ГОТОВО", it:"— FATTO", pl:"— ZROBIONE", vi:"— XONG" },
  ui_go: { en:"NovaCoins to go", zh:"还需积分", hi:"और पॉइंट चाहिए", es:"puntos por conseguir", ar:"نقاط متبقية", fr:"points restants", bn:"আরো পয়েন্ট বাকি", pt:"pontos em falta", ru:"до награды", ur:"مزید پوائنٹس درکار", id:"poin lagi", de:"Punkte bis zum Ziel", ja:"あとポイント", tr:"kalan puan", ko:"남은 포인트", fa:"امتیاز دیگر لازم است", uk:"балів до нагороди", it:"punti mancanti", pl:"punktów do zdobycia", vi:"điểm còn thiếu" },
  ui_reach: { en:"Reach {n} NovaCoins (you have {p})", zh:"达到 {n} 积分（你有 {p}）", hi:"{n} पॉइंट तक पहुँचें (आपके पास {p} हैं)", es:"Llega a {n} puntos (tienes {p})", ar:"بلوغ {n} نقطة (لديك {p})", fr:"Atteins {n} points (tu en as {p})", bn:"{n} পয়েন্টে পৌঁছান (আপনার আছে {p})", pt:"Atinge {n} pontos (tens {p})", ru:"Набери {n} очков (у тебя {p})", ur:"{n} پوائنٹس حاصل کریں (آپ کے پاس {p} ہیں)", id:"Raih {n} poin (kamu punya {p})", de:"Erreiche {n} Punkte (du hast {p})", ja:"{n}ポイントに到達（現在{p}）", tr:"{n} puana ulaş ({p} puana sahipsin)", ko:"{n} 포인트 달성 (현재 {p})", fa:"به {n} امتیاز برس (تو {p} داری)", uk:"Набери {n} балів (у тебе {p})", it:"Raggiungi {n} punti (ne hai {p})", pl:"Osiągnij {n} punktów (masz {p})", vi:"Đạt {n} điểm (bạn có {p})" },
  ui_reach_pts: { en:"Reach {n} NovaCoins", zh:"达到 {n} 积分", hi:"{n} पॉइंट तक पहुँचें", es:"Llega a {n} puntos", ar:"بلوغ {n} نقطة", fr:"Atteins {n} points", bn:"{n} পয়েন্টে পৌঁছান", pt:"Atinge {n} pontos", ru:"Набери {n} очков", ur:"{n} پوائنٹس حاصل کریں", id:"Raih {n} poin", de:"Erreiche {n} Punkte", ja:"{n}ポイントに到達", tr:"{n} puana ulaş", ko:"{n} 포인트 달성", fa:"به {n} امتیاز برس", uk:"Набери {n} балів", it:"Raggiungi {n} punti", pl:"Osiągnij {n} punktów", vi:"Đạt {n} điểm" },
  ui_no_chats: { en:"No chats yet - start talking!", zh:"还没有对话——开始聊吧！", hi:"अभी कोई चैट नहीं — बातचीत शुरू करें!", es:"Aún no hay chats: ¡empieza a hablar!", ar:"لا توجد محادثات بعد — ابدأ التحدث!", fr:"Pas encore de chats — lance-toi !", bn:"এখনো কোনো চ্যাট নেই — শুরু করুন!", pt:"Ainda não há conversas — começa a falar!", ru:"Пока нет чатов — начни говорить!", ur:"ابھی کوئی چیٹ نہیں — بات شروع کریں!", id:"Belum ada obrolan — mulai mengobrol!", de:"Noch keine Chats — leg los!", ja:"まだチャットがありません — 話しかけてみよう！", tr:"Henüz sohbet yok — konuşmaya başla!", ko:"아직 채팅이 없습니다 — 대화를 시작하세요!", fa:"هنوز گفتگویی نیست — شروع به گفتگو کن!", uk:"Поки що немає чатів — почни говорити!", it:"Nessuna chat per ora — inizia a parlare!", pl:"Nie ma jeszcze czatów — zacznij rozmawiać!", vi:"Chưa có cuộc trò chuyện nào — hãy bắt đầu nói chuyện!" },
  ui_chats: { en:"{n} chats", zh:"{n} 条对话", hi:"{n} चैट", es:"{n} chats", ar:"{n} محادثة", fr:"{n} chats", bn:"{n} চ্যাট", pt:"{n} conversas", ru:"{n} чатов", ur:"{n} چیٹس", id:"{n} obrolan", de:"{n} Chats", ja:"{n}件のチャット", tr:"{n} sohbet", ko:"채팅 {n}개", fa:"{n} گفتگو", uk:"{n} чатів", it:"{n} chat", pl:"{n} czaty", vi:"{n} cuộc trò chuyện" },
  ui_every_reward: { en:"Every reward unlocked.", zh:"所有奖励都已解锁。", hi:"हर रिवॉर्ड अनलॉक हो गया।", es:"Todas las recompensas desbloqueadas.", ar:"تم فتح كل الجوائز.", fr:"Toutes les récompenses sont débloquées.", bn:"সব পুরস্কার আনলক হয়েছে।", pt:"Todas as recompensas desbloqueadas.", ru:"Все награды открыты.", ur:"ہر انعام انلاک ہو گیا۔", id:"Semua hadiah terbuka.", de:"Alle Belohnungen freigeschaltet.", ja:"すべてのリワードを解放しました。", tr:"Tüm ödüller açıldı.", ko:"모든 보상이 잠금 해제되었습니다.", fa:"همه جوایز باز شد.", uk:"Усі нагороди відкрито.", it:"Tutti i premi sbloccati.", pl:"Wszystkie nagrody odblokowane.", vi:"Mọi phần thưởng đã mở khóa." },
  ui_coins_to: { en:"{n} NovaCoins to {goal}", zh:"距离{goal}还需{n}积分", hi:"{goal} के लिए {n} और पॉइंट", es:"{n} puntos para {goal}", ar:"{n} نقطة حتى {goal}", fr:"{n} points avant {goal}", bn:"{goal}-এর জন্য {n} পয়েন্ট বাকি", pt:"{n} pontos para {goal}", ru:"{n} очков до {goal}", ur:"{goal} کے لیے {n} پوائنٹس باقی", id:"{n} poin menuju {goal}", de:"{n} Punkte bis {goal}", ja:"{goal}まであと{n}ポイント", tr:"{goal} için {n} puan kaldı", ko:"{goal}까지 {n} 포인트 남음", fa:"{n} امتیاز تا {goal}", uk:"{n} балів до {goal}", it:"{n} punti per {goal}", pl:"{n} punktów do {goal}", vi:"{n} điểm nữa để {goal}" },
  q1: { en:"1 day free NovaClip Pro", zh:"免费 NovaClip Pro 1天", hi:"1 दिन मुफ़्त NovaClip Pro", es:"1 día gratis de NovaClip Pro", ar:"NovaClip Pro مجاني ليوم واحد", fr:"1 jour de NovaClip Pro gratuit", bn:"১ দিন ফ্রি NovaClip Pro", pt:"1 dia de NovaClip Pro grátis", ru:"1 день бесплатного NovaClip Pro", ur:"1 دن مفت NovaClip Pro", id:"NovaClip Pro gratis 1 hari", de:"1 Tag kostenloses NovaClip Pro", ja:"NovaClip Pro 1日無料", tr:"1 gün ücretsiz NovaClip Pro", ko:"NovaClip Pro 1일 무료", fa:"۱ روز NovaClip Pro رایگان", uk:"1 день безкоштовного NovaClip Pro", it:"1 giorno di NovaClip Pro gratis", pl:"1 dzień darmowego NovaClip Pro", vi:"NovaClip Pro miễn phí 1 ngày" },
  q2: { en:"1 week free NovaClip Pro", zh:"免费 NovaClip Pro 1周", hi:"1 हफ्ते मुफ़्त NovaClip Pro", es:"1 semana gratis de NovaClip Pro", ar:"NovaClip Pro مجاني لأسبوع", fr:"1 semaine de NovaClip Pro gratuite", bn:"১ সপ্তাহ ফ্রি NovaClip Pro", pt:"1 semana de NovaClip Pro grátis", ru:"1 неделя бесплатного NovaClip Pro", ur:"1 ہفتہ مفت NovaClip Pro", id:"NovaClip Pro gratis 1 minggu", de:"1 Woche kostenloses NovaClip Pro", ja:"NovaClip Pro 1週間無料", tr:"1 hafta ücretsiz NovaClip Pro", ko:"NovaClip Pro 1주 무료", fa:"۱ هفته NovaClip Pro رایگان", uk:"1 тиждень безкоштовного NovaClip Pro", it:"1 settimana di NovaClip Pro gratis", pl:"1 tydzień darmowego NovaClip Pro", vi:"NovaClip Pro miễn phí 1 tuần" },
  q3: { en:"2 weeks free NovaClip Pro", zh:"免费 NovaClip Pro 2周", hi:"2 हफ्ते मुफ़्त NovaClip Pro", es:"2 semanas gratis de NovaClip Pro", ar:"NovaClip Pro مجاني لأسبوعين", fr:"2 semaines de NovaClip Pro gratuites", bn:"২ সপ্তাহ ফ্রি NovaClip Pro", pt:"2 semanas de NovaClip Pro grátis", ru:"2 недели бесплатного NovaClip Pro", ur:"2 ہفتے مفت NovaClip Pro", id:"NovaClip Pro gratis 2 minggu", de:"2 Wochen kostenloses NovaClip Pro", ja:"NovaClip Pro 2週間無料", tr:"2 hafta ücretsiz NovaClip Pro", ko:"NovaClip Pro 2주 무료", fa:"۲ هفته NovaClip Pro رایگان", uk:"2 тижні безкоштовного NovaClip Pro", it:"2 settimane di NovaClip Pro gratis", pl:"2 tygodnie darmowego NovaClip Pro", vi:"NovaClip Pro miễn phí 2 tuần" },
  q4: { en:"1 month free NovaClip Pro", zh:"免费 NovaClip Pro 1个月", hi:"1 महीना मुफ़्त NovaClip Pro", es:"1 mes gratis de NovaClip Pro", ar:"NovaClip Pro مجاني لشهر", fr:"1 mois de NovaClip Pro gratuit", bn:"১ মাস ফ্রি NovaClip Pro", pt:"1 mês de NovaClip Pro grátis", ru:"1 месяц бесплатного NovaClip Pro", ur:"1 مہینہ مفت NovaClip Pro", id:"NovaClip Pro gratis 1 bulan", de:"1 Monat kostenloses NovaClip Pro", ja:"NovaClip Pro 1か月無料", tr:"1 ay ücretsiz NovaClip Pro", ko:"NovaClip Pro 1개월 무료", fa:"۱ ماه NovaClip Pro رایگان", uk:"1 місяць безкоштовного NovaClip Pro", it:"1 mese di NovaClip Pro gratis", pl:"1 miesiąc darmowego NovaClip Pro", vi:"NovaClip Pro miễn phí 1 tháng" },
  a1: { en:"Reached 30 NovaCoins", zh:"达到30积分", hi:"30 पॉइंट पहुँचे", es:"Llegaste a 30 puntos", ar:"بلغت 30 نقطة", fr:"30 points atteints", bn:"৩০ পয়েন্ট পৌঁছেছেন", pt:"Atingiste 30 pontos", ru:"Набрал 30 очков", ur:"30 پوائنٹس حاصل کیے", id:"Mencapai 30 poin", de:"30 Punkte erreicht", ja:"30ポイント達成", tr:"30 puana ulaştın", ko:"30 포인트 달성", fa:"به ۳۰ امتیاز رسیدی", uk:"Набрав 30 балів", it:"Hai raggiunto 30 punti", pl:"Osiągnąłeś 30 punktów", vi:"Đạt 30 điểm" },
  a2: { en:"Reached 100 NovaCoins", zh:"达到100积分", hi:"100 पॉइंट पहुँचे", es:"Llegaste a 100 puntos", ar:"بلغت 100 نقطة", fr:"100 points atteints", bn:"১০০ পয়েন্ট পৌঁছেছেন", pt:"Atingiste 100 pontos", ru:"Набрал 100 очков", ur:"100 پوائنٹس حاصل کیے", id:"Mencapai 100 poin", de:"100 Punkte erreicht", ja:"100ポイント達成", tr:"100 puana ulaştın", ko:"100 포인트 달성", fa:"به ۱۰۰ امتیاز رسیدی", uk:"Набрав 100 балів", it:"Hai raggiunto 100 punti", pl:"Osiągnąłeś 100 punktów", vi:"Đạt 100 điểm" },
  a3: { en:"Reached 250 NovaCoins", zh:"达到250积分", hi:"250 पॉइंट पहुँचे", es:"Llegaste a 250 puntos", ar:"بلغت 250 نقطة", fr:"250 points atteints", bn:"২৫০ পয়েন্ট পৌঁছেছেন", pt:"Atingiste 250 pontos", ru:"Набрал 250 очков", ur:"250 پوائنٹس حاصل کیے", id:"Mencapai 250 poin", de:"250 Punkte erreicht", ja:"250ポイント達成", tr:"250 puana ulaştın", ko:"250 포인트 달성", fa:"به ۲۵۰ امتیاز رسیدی", uk:"Набрав 250 балів", it:"Hai raggiunto 250 punti", pl:"Osiągnąłeś 250 punktów", vi:"Đạt 250 điểm" },
  a4: { en:"Reached 500 NovaCoins", zh:"达到500积分", hi:"500 पॉइंट पहुँचे", es:"Llegaste a 500 puntos", ar:"بلغت 500 نقطة", fr:"500 points atteints", bn:"৫০০ পয়েন্ট পৌঁছেছেন", pt:"Atingiste 500 pontos", ru:"Набрал 500 очков", ur:"500 پوائنٹس حاصل کیے", id:"Mencapai 500 poin", de:"500 Punkte erreicht", ja:"500ポイント達成", tr:"500 puana ulaştın", ko:"500 포인트 달성", fa:"به ۵۰۰ امتیاز رسیدی", uk:"Набрав 500 балів", it:"Hai raggiunto 500 punti", pl:"Osiągnąłeś 500 punktów", vi:"Đạt 500 điểm" },
  sk_yt: { en:"Connect your YouTube channel", zh:"连接你的 YouTube 频道", hi:"अपना YouTube चैनल कनेक्ट करें", es:"Conecta tu canal de YouTube", ar:"اربط قناتك في يوتيوب", fr:"Connecte ta chaîne YouTube", bn:"আপনার YouTube চ্যানেল কানেক্ট করুন", pt:"Liga o teu canal do YouTube", ru:"Подключи свой канал YouTube", ur:"اپنا YouTube چینل منسلک کریں", id:"Hubungkan channel YouTube-mu", de:"Verbinde deinen YouTube-Kanal", ja:"YouTubeチャンネルを接続", tr:"YouTube kanalını bağla", ko:"YouTube 채널 연결하기", fa:"کانال یوتیوبت را وصل کن", uk:"Підключи свій YouTube-канал", it:"Collega il tuo canale YouTube", pl:"Podłącz swój kanał YouTube", vi:"Kết nối kênh YouTube của bạn" },
  sk_edit: { en:"Export a video from the Editor", zh:"从编辑器导出视频", hi:"एडिटर से वीडियो एक्सपोर्ट करें", es:"Exporta un vídeo desde el Editor", ar:"صدّر فيديو من المحرر", fr:"Exporte une vidéo depuis l'Éditeur", bn:"এডিটর থেকে ভিডিও এক্সপোর্ট করুন", pt:"Exporta um vídeo do Editor", ru:"Экспортируй видео из редактора", ur:"ایڈیٹر سے ویڈیو ایکسپورٹ کریں", id:"Ekspor video dari Editor", de:"Exportiere ein Video aus dem Editor", ja:"エディタから動画を書き出す", tr:"Editörden bir video dışa aktar", ko:"편집기에서 영상 내보내기", fa:"یک ویدیو از ادیتور اکسپورت کن", uk:"Експортуй відео з редактора", it:"Esporta un video dall'Editor", pl:"Wyeksportuj film z Edytora", vi:"Xuất video từ Trình chỉnh sửa" },
  sk_reaction: { en:"Finish a set of five in Reaction", zh:"在反应游戏里完成一组五次", hi:"रिएक्शन में पाँच का एक सेट पूरा करें", es:"Completa una serie de cinco en Reacción", ar:"أكمِل مجموعة من خمسة في لعبة ردّ الفعل", fr:"Termine une série de cinq dans Réaction", bn:"রিঅ্যাকশনে পাঁচটির একটি সেট শেষ করুন", pt:"Termina uma série de cinco no Reação", ru:"Пройди серию из пяти в «Реакции»", ur:"ری ایکشن میں پانچ کا ایک سیٹ مکمل کریں", id:"Selesaikan satu set lima di Reaction", de:"Schaff eine Fünferserie in Reaktion", ja:"リアクションで5回ワンセットをやりきる", tr:"Reaction’da beşlik bir seri tamamla", ko:"리액션에서 다섯 번 한 세트 완료", fa:"یک دستهٔ پنج‌تایی در بازی واکنش را تمام کن", uk:"Пройди серію з п’яти в «Реакції»", it:"Completa una serie di cinque in Reazione", pl:"Ukończ serię pięciu w Reakcji", vi:"Hoàn thành một lượt năm trong Reaction" },
  sk_aim: { en:"Finish a round of Target", zh:"完成一局瞄准", hi:"टारगेट का एक राउंड पूरा करें", es:"Completa una ronda de Diana", ar:"أكمِل جولة من لعبة الهدف", fr:"Termine une manche de Cible", bn:"টার্গেটের একটি রাউন্ড শেষ করুন", pt:"Termina uma ronda do Alvo", ru:"Пройди раунд «Мишени»", ur:"ٹارگٹ کا ایک راؤنڈ مکمل کریں", id:"Selesaikan satu ronde Target", de:"Beende eine Runde Ziel", ja:"ターゲットを1ラウンドやりきる", tr:"Target’ta bir tur tamamla", ko:"타깃 한 라운드 완료", fa:"یک دور از بازی هدف را تمام کن", uk:"Пройди раунд «Мішені»", it:"Completa un round di Bersaglio", pl:"Ukończ rundę Celu", vi:"Hoàn thành một vòng Target" },
  sk_fair: { en:"Compare your channel in Fair Fight", zh:"在公平对决里比较你的频道", hi:"फेयर फाइट में अपना चैनल तुलना करें", es:"Compara tu canal en Duelo Justo", ar:"قارن قناتك في المواجهة العادلة", fr:"Compare ta chaîne dans Combat Loyal", bn:"ফেয়ার ফাইটে আপনার চ্যানেল তুলনা করুন", pt:"Compara o teu canal no Duelo Justo", ru:"Сравни свой канал в «Честном бою»", ur:"فیئر فائٹ میں اپنے چینل کا موازنہ کریں", id:"Bandingkan kanalmu di Fair Fight", de:"Vergleich deinen Kanal im fairen Duell", ja:"フェアファイトで自分のチャンネルを比べる", tr:"Fair Fight’ta kanalını karşılaştır", ko:"페어 파이트에서 내 채널 비교하기", fa:"کانالت را در نبرد منصفانه مقایسه کن", uk:"Порівняй свій канал у «Чесному бою»", it:"Confronta il tuo canale in Sfida Equa", pl:"Porównaj swój kanał w Uczciwej Walce", vi:"So kênh của bạn trong Fair Fight" },
  sk_focus: { en:"Finish a 25-minute focus block", zh:"完成一次 25 分钟的专注时段", hi:"25 मिनट का फोकस ब्लॉक पूरा करें", es:"Completa un bloque de concentración de 25 minutos", ar:"أكمِل جلسة تركيز مدتها 25 دقيقة", fr:"Termine un bloc de concentration de 25 minutes", bn:"২৫ মিনিটের একটি ফোকাস ব্লক শেষ করুন", pt:"Termina um bloco de concentração de 25 minutos", ru:"Заверши 25-минутный блок фокуса", ur:"25 منٹ کا فوکس بلاک مکمل کریں", id:"Selesaikan satu blok fokus 25 menit", de:"Schließe einen 25-Minuten-Fokusblock ab", ja:"25分の集中ブロックをやりきる", tr:"25 dakikalık bir odak bloğunu tamamla", ko:"25분 집중 블록을 끝내기", fa:"یک بلوک تمرکز ۲۵ دقیقه‌ای را تمام کن", uk:"Заверши 25-хвилинний блок фокусу", it:"Completa un blocco di concentrazione da 25 minuti", pl:"Ukończ 25-minutowy blok skupienia", vi:"Hoàn thành một khối tập trung 25 phút" },
  sk_community: { en:"Join in on the community page", zh:"在社区页面参与一次", hi:"कम्युनिटी पेज पर शामिल हों", es:"Participa en la página de la comunidad", ar:"شارك في صفحة المجتمع", fr:"Participe sur la page communauté", bn:"কমিউনিটি পেজে অংশ নিন", pt:"Participa na página da comunidade", ru:"Поучаствуй на странице сообщества", ur:"کمیونٹی صفحے پر شریک ہوں", id:"Ikut serta di halaman komunitas", de:"Mach auf der Community-Seite mit", ja:"コミュニティページに参加する", tr:"Topluluk sayfasına katıl", ko:"커뮤니티 페이지에 참여하기", fa:"در صفحهٔ انجمن شرکت کن", uk:"Долучися на сторінці спільноти", it:"Partecipa nella pagina della community", pl:"Włącz się na stronie społeczności", vi:"Tham gia trên trang cộng đồng" },
  sk_editing: { en:"Publish or animate something you made", zh:"发布或动画化你做的东西", hi:"अपनी बनाई कोई चीज़ पब्लिश करें या एनिमेट करें", es:"Publica o anima algo que hayas hecho", ar:"انشر أو حرّك شيئًا صنعته", fr:"Publie ou anime quelque chose que tu as fait", bn:"নিজের বানানো কিছু প্রকাশ করুন বা অ্যানিমেট করুন", pt:"Publica ou anima algo que fizeste", ru:"Опубликуй или оживи что-то своё", ur:"اپنی بنائی کوئی چیز شائع کریں یا اینیمیٹ کریں", id:"Terbitkan atau animasikan sesuatu buatanmu", de:"Veröffentliche oder animiere etwas von dir", ja:"自分で作ったものを公開するか動かす", tr:"Yaptığın bir şeyi yayınla ya da canlandır", ko:"내가 만든 것을 게시하거나 움직이기", fa:"چیزی که ساخته‌ای را منتشر کن یا به حرکت درآور", uk:"Опублікуй або оживи щось своє", it:"Pubblica o anima qualcosa che hai fatto", pl:"Opublikuj lub ożyw coś, co zrobiłeś", vi:"Đăng hoặc làm chuyển động thứ bạn tạo ra" },
  sk_trend: { en:"Run a Trend Spotter scan", zh:"运行一次趋势扫描", hi:"ट्रेंड स्पॉटर स्कैन चलाएं", es:"Haz un análisis de Tendencias", ar:"أجرِ مسحًا لتتبع الاتجاهات", fr:"Lance un scan Trend Spotter", bn:"ট্রেন্ড স্পটার স্ক্যান চালান", pt:"Faz uma análise do Trend Spotter", ru:"Запусти скан Trend Spotter", ur:"ٹرینڈ اسپاٹر اسکین چلائیں", id:"Jalankan pindai Trend Spotter", de:"Einen Trend-Spotter-Scan starten", ja:"トレンドスポッターでスキャン", tr:"Trend Spotter taraması yap", ko:"트렌드 스포터 스캔 실행하기", fa:"اسکن ترند اسپاتر را اجرا کن", uk:"Запусти скан Trend Spotter", it:"Esegui una scansione di Trend Spotter", pl:"Uruchom skan Trend Spottera", vi:"Chạy quét Trend Spotter" },
  sk_idea: { en:"Save a video idea to your shortlist", zh:"将视频创意保存到候选清单", hi:"वीडियो आइडिया शॉर्टलिस्ट में सेव करें", es:"Guarda una idea de vídeo en tu lista corta", ar:"احفظ فكرة فيديو في قائمتك", fr:"Sauvegarde une idée de vidéo dans ta shortlist", bn:"ভিডিও আইডিয়া শর্টলিস্টে সেভ করুন", pt:"Guarda uma ideia de vídeo na tua shortlist", ru:"Сохрани идею видео в короткий список", ur:"ویڈیو آئیڈیا اپنی شارٹ لسٹ میں محفوظ کریں", id:"Simpan ide video ke daftar pendekmu", de:"Eine Videoidee in deine Shortlist speichern", ja:"動画アイデアを候補リストに保存", tr:"Bir video fikrini kısa listen'e kaydet", ko:"영상 아이디어를 후보 목록에 저장하기", fa:"یک ایده ویدیو در فهرست کوتاهت ذخیره کن", uk:"Збережи ідею відео в короткий список", it:"Salva un'idea video nella tua shortlist", pl:"Zapisz pomysł na film na listę krótką", vi:"Lưu ý tưởng video vào danh sách ngắn" },
  sk_analytics: { en:"Review your channel analytics", zh:"查看你的频道数据", hi:"अपना चैनल एनालिटिक्स देखें", es:"Revisa tus analíticas del canal", ar:"راجع تحليلات قناتك", fr:"Consulte les stats de ta chaîne", bn:"আপনার চ্যানেল অ্যানালিটিক্স দেখুন", pt:"Revê as análises do teu canal", ru:"Просмотри аналитику канала", ur:"اپنے چینل کے تجزیات دیکھیں", id:"Tinjau analitik channel-mu", de:"Deine Kanalanalysen prüfen", ja:"チャンネル分析を確認", tr:"Kanal analitiğini incele", ko:"채널 분석 검토하기", fa:"تحلیل کانالت را مرور کن", uk:"Переглянь аналітику каналу", it:"Rivedi le analisi del tuo canale", pl:"Przejrzyj analitykę swojego kanału", vi:"Xem lại phân tích kênh của bạn" },
  sk_ai: { en:"Ask a NovaClip AI tutor", zh:"向 NovaClip AI 导师提问", hi:"NovaClip AI ट्यूटर से पूछें", es:"Pregunta a un tutor de IA de NovaClip", ar:"اسأل مدرّس NovaClip الذكي", fr:"Demande à un tuteur IA NovaClip", bn:"NovaClip AI টিউটরকে জিজ্ঞাসা করুন", pt:"Pergunta a um tutor de IA da NovaClip", ru:"Спроси ИИ-наставника NovaClip", ur:"NovaClip AI ٹیوٹر سے پوچھیں", id:"Tanya tutor AI NovaClip", de:"Einen NovaClip-KI-Tutor fragen", ja:"NovaClipのAIチューターに質問", tr:"NovaClip YZ eğitmenine sor", ko:"NovaClip AI 튜터에게 질문하기", fa:"از مربی هوش مصنوعی NovaClip بپرس", uk:"Запитай ШІ-наставника NovaClip", it:"Chiedi a un tutor IA di NovaClip", pl:"Zapytaj korepetytora AI NovaClip", vi:"Hỏi gia sư AI NovaClip" },
  sk_arena: { en:"Top the Strike Arena scoreboard", zh:"登顶 Strike Arena 排行榜", hi:"स्ट्राइक एरिना स्कोरबोर्ड पर टॉप करें", es:"Lidera la tabla de Strike Arena", ar:"تصدّر لوحة أهداف Strike Arena", fr:"Domine le classement de Strike Arena", bn:"স্ট্রাইক অ্যারেনা স্কোরবোর্ডে শীর্ষে যান", pt:"Lidera a tabela da Strike Arena", ru:"Стань первым в таблице Strike Arena", ur:"سٹرائیک ایرینا بورڈ میں ٹاپ کریں", id:"Puncaki papan skor Strike Arena", de:"Spitze der Strike-Arena-Wertung", ja:"Strike Arenaのランキングで1位に", tr:"Strike Arena sıralamasında zirveye çık", ko:"스트라이크 아레나 순위 1위 하기", fa:"صدرنشین جدول Strike Arena شو", uk:"Стань першим у таблиці Strike Arena", it:"Domina la classifica di Strike Arena", pl:"Zostań liderem tabeli Strike Arena", vi:"Đứng đầu bảng xếp hạng Strike Arena" },
  cert_basic: { en:"Basic Certificate", zh:"基础证书", hi:"बेसिक सर्टिफिकेट", es:"Certificado básico", ar:"الشهادة الأساسية", fr:"Certificat de base", bn:"বেসিক সার্টিফিকেট", pt:"Certificado básico", ru:"Базовый сертификат", ur:"بنیادی سرٹیفکیٹ", id:"Sertifikat Dasar", de:"Basis-Zertifikat", ja:"ベーシック証明書", tr:"Temel Sertifika", ko:"기본 수료증", fa:"گواهی پایه", uk:"Базовий сертифікат", it:"Certificato base", pl:"Certyfikat podstawowy", vi:"Chứng chỉ cơ bản" },
  cert_adv: { en:"Advanced Certificate", zh:"高级证书", hi:"एडवांस्ड सर्टिफिकेट", es:"Certificado avanzado", ar:"الشهادة المتقدمة", fr:"Certificat avancé", bn:"অ্যাডভান্সড সার্টিফিকেট", pt:"Certificado avançado", ru:"Продвинутый сертификат", ur:"اعلیٰ سرٹیفکیٹ", id:"Sertifikat Lanjutan", de:"Fortgeschrittenes Zertifikat", ja:"アドバンス証明書", tr:"İleri Sertifika", ko:"고급 수료증", fa:"گواهی پیشرفته", uk:"Розширений сертифікат", it:"Certificato avanzato", pl:"Certyfikat zaawansowany", vi:"Chứng chỉ nâng cao" },
  cert_master: { en:"Master Certificate", zh:"大师证书", hi:"मास्टर सर्टिफिकेट", es:"Certificado maestro", ar:"شهادة الخبير", fr:"Certificat maître", bn:"মাস্টার সার্টিফিকেট", pt:"Certificado mestre", ru:"Сертификат мастера", ur:"ماسٹر سرٹیفکیٹ", id:"Sertifikat Master", de:"Meister-Zertifikat", ja:"マスター証明書", tr:"Usta Sertifikası", ko:"마스터 수료증", fa:"گواهی استاد", uk:"Сертифікат майстра", it:"Certificato master", pl:"Certyfikat mistrzowski", vi:"Chứng chỉ thành thạo" }
};
Object.assign(T, UI_T);

function lang() { return localStorage.getItem('nc_lang') || 'en'; }
/* Text going into innerHTML. Five characters, because the four usual ones let
   an attribute break out through a single quote — and several places here build
   markup with single-quoted attributes. Anywhere the text is the whole node,
   textContent is better than this; this is for the places that are assembling a
   string of HTML around it. */
function ncEscape(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
window.ncEscape = ncEscape;
/* THE TABLE ITSELF, NOT JUST tr().
   trends-nav.js builds prompts around the same labels it puts on screen, and a
   prompt needs the English one whatever the page is reading in: an instruction
   half in Persian and half in English is a worse instruction than one in
   either. tr() cannot give it that, so the table goes out too. Read-only by
   convention — nothing outside this file writes to it. */
window.T = T;

function tr(key) { return (T[key] && T[key][lang()]) || (T[key] && T[key].en) || ''; }
function langInstruction() { return ' Reply ONLY in this language: ' + (LANGS[lang()] || 'English') + '. '; }
function applyLangText() {
  document.documentElement.lang = lang();
  /* ALWAYS ltr, AND A CLASS FOR THE REST.
     dir=rtl on <html> mirrors the entire document — the rail to the other
     side, every flex row reversed, the timeline in the editor running
     backwards. That was asked to stop, twice, and the editor had already had
     to cancel it locally to stay usable.

     The class carries the part that was always the point: `unicode-bidi:
     plaintext` on the text elements, so each block resolves its own direction
     from its own first letter. Persian still reads right to left and still
     right-aligns itself; the furniture around it stays where English leaves
     it. */
  document.documentElement.dir = 'ltr';
  document.documentElement.classList.toggle('nc-rtl', RTL.includes(lang()));
  /* WRITE ONLY WHAT CHANGED.
     ncWatchLang() re-runs this pass whenever the DOM grows, and this pass
     writes innerHTML for any string carrying markup — the headline is one.
     That write is itself a DOM change, so it woke the observer, which ran the
     pass, which wrote again: a loop turning over about eight times a second on
     every page, forever. It was visible too — rebuilding the headline restarts
     the CSS entrance animation on the two coloured words, so they never
     finished fading in and the landing page read "Run your / like a".

     Comparing innerHTML against the source string does not work: the browser
     normalises it on the way back out (class='n' returns as class="n"), so it
     never matches and the loop survives. Stamping what was last applied does. */
  document.querySelectorAll('[data-t]').forEach(el => {
    const v = tr(el.dataset.t);
    if (!v || el.__ncT === v) return;
    if (/[<>]/.test(v)) el.innerHTML = v; else el.textContent = v;
    el.__ncT = v;
  });
  document.querySelectorAll('[data-tph]').forEach(el => {
    const v = tr(el.dataset.tph);
    if (v && el.placeholder !== v) el.placeholder = v;
  });
  ncPhrase();
}
function applyLang(code) {
  localStorage.setItem('nc_lang', code);
  applyLangText();
  if (window.__ncPhraseOn) window.__ncPhraseOn();
}

/* Pages that boot their own UI (React SPAs like editor.html and trends.html)
   mount after nova.js's first pass, so data-t elements that appear later would
   stay in English. A cheap observer re-runs the translation pass whenever the
   DOM grows — debounced so React's mount burst is one sweep, not hundreds. */
let __ncTransTimer = null;
function ncWatchLang() {
  if (window.__ncLangWatch) return;
  window.__ncLangWatch = true;
  const mo = new MutationObserver(() => {
    clearTimeout(__ncTransTimer);
    __ncTransTimer = setTimeout(applyLangText, 120);
  });
  mo.observe(document.body, { childList: true, subtree: true });
}


/* ============================================================================
   THEME — light, dark, or whatever the device says
   ============================================================================
   The site was dark-only, and dark was spelled out as literal hex in twenty
   pages. Two things make one switch reach all of them:

     1. Every page's own palette variables are re-declared here under
        html[data-theme="light"]. `:root` is specificity (0,1,0) and
        `html[data-theme="light"]` is (0,1,1), so these win without !important
        and without editing the pages that already use variables.

     2. The pages that hard-code colour had those literals rewritten to
        var(--nc-*, #original). The fallback is the old value, so a page still
        renders correctly on its own if this file never loads.

   The choice is stored as nc_theme = system | light | dark. "system" follows
   prefers-color-scheme and keeps following it, so a phone that flips at sunset
   flips the site with it.

   Applying the attribute is done in a tiny inline snippet in each page's
   <head>, because nova.js is loaded at the end of <body> — by the time it runs
   the first paint has already happened, and the switch would be a visible
   flash of the wrong theme on every navigation.
   --------------------------------------------------------------------------- */

/* ============================================================================
   SKINS — light, dark and the cyber themes, in one picker
   ============================================================================
   Asked for the cyber themes from the prototype, with light and dark living
   inside the same control rather than in a separate one beside it. So there is
   now a single list: Light, Match my device, Dark, and twelve cyber skins.

   HOW A SKIN IS DIFFERENT FROM LIGHT/DARK

   Light and dark are the two the whole stylesheet is built around, and they
   stay exactly as they were — nothing is injected for them. A cyber skin sits
   on top of the dark base and repaints the palette variables, so every page
   follows without a single page knowing skins exist.

   Each theme in the prototype gave four colours: a primary, a secondary, an
   accent and a background. The site needs more than four — panel backgrounds,
   hairlines, muted text — so the rest are derived from those, which is also
   why a new skin is six values rather than a stylesheet.

   The choice still lives in nc_theme, so somebody who picked dark last week
   still has dark: the old values and the new ids share one key and one code
   path.
   ============================================================================ */
const NC_SKINS = [
  { id:'void',      name:'Void Cyber',         primary:'#00F0FF', secondary:'#FF2E97', accent:'#B6FF3C', bg:'#05060A' },
  { id:'cyberpunk', name:'Neo Cyberpunk',      primary:'#00F0FF', secondary:'#FF007F', accent:'#FFE600', bg:'#0D0221' },
  { id:'synthwave', name:'80s Synthwave',      primary:'#00E5FF', secondary:'#FF007F', accent:'#FF9E00', bg:'#09031C' },
  { id:'matrix',    name:'Matrix Terminal',    primary:'#00FF66', secondary:'#00DD44', accent:'#55FF99', bg:'#020B05' },
  { id:'crimson',   name:'Bloodmoon Protocol', primary:'#FF1744', secondary:'#FF5252', accent:'#FF9100', bg:'#0D0205' },
  { id:'glitch',    name:'Chromatic Holo',     primary:'#00FFD5', secondary:'#C026D3', accent:'#39FF14', bg:'#06090E' },
  { id:'midnight',  name:'Midnight Electric',  primary:'#38BDF8', secondary:'#818CF8', accent:'#34D399', bg:'#020813' },
  { id:'sunset',    name:'Neon Sunset',        primary:'#FF7700', secondary:'#FF0055', accent:'#FFCC00', bg:'#0F051D' },
  { id:'solar',     name:'Solar Flare',        primary:'#FF9E00', secondary:'#FF3C00', accent:'#FFE600', bg:'#140500' },
  { id:'vaporwave', name:'Vaporwave Dream',    primary:'#05D9E8', secondary:'#FF2A6D', accent:'#D100D1', bg:'#10061E' },
  { id:'biopunk',   name:'Bio-Xenon',          primary:'#00FF88', secondary:'#D4FF00', accent:'#00F0FF', bg:'#041209' },
  { id:'stealth',   name:'Ghost Titanium',     primary:'#38BDF8', secondary:'#94A3B8', accent:'#22D3EE', bg:'#08090B' }
];

/* THREE KEYS, BECAUSE THE SKIN AND THE THEME ARE TWO QUESTIONS.
   They used to be one: nc_theme held EITHER light/dark/system OR a skin id, so
   picking Neo Cyberpunk overwrote "light" and every cyber theme was a dark
   theme by construction. Somebody who reads on a white page had twelve themes
   they could look at and none they could use.

   nc_skin holds which cyber theme, nc_theme holds light/dark/system, and
   neither touches the other. The two background caches are what the snippet in
   each page's <head> paints before the first frame — one per side, because
   which one is correct depends on a media query the snippet only evaluates at
   load, and a skin in light mode flashing its dark background is the flicker
   these caches exist to stop. */
const NC_SKIN_KEY   = 'nc_skin_bg';      // the dark background, for the pre-paint snippet
const NC_SKIN_KEY_L = 'nc_skin_bg_l';    // and the light one
const NC_SKIN_ID    = 'nc_skin';         // which cyber theme, if any

function ncSkin(id) { return NC_SKINS.find(s => s.id === id) || null; }

/* Which cyber theme is on, and the one-way move off the old single key.
   Anybody whose nc_theme still holds a skin id gets that skin kept and their
   theme set to dark, which is exactly what they were looking at yesterday —
   the migration changes nothing on screen, it only stops the two answers
   sharing one box. */
function ncSkinPref() {
  try {
    const id = localStorage.getItem(NC_SKIN_ID);
    if (ncSkin(id)) return id;
    const old = localStorage.getItem(NC_THEME_KEY);
    if (ncSkin(old)) {
      localStorage.setItem(NC_SKIN_ID, old);
      localStorage.setItem(NC_THEME_KEY, 'dark');
      return old;
    }
  } catch (e) {}
  return '';
}

/* ---- colour arithmetic, so a skin is still six values ------------------- */
function ncRGB(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function ncHex(rgb) {
  return '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function ncMix(a, b, t) {
  const A = ncRGB(a), B = ncRGB(b);
  return ncHex([0, 1, 2].map(i => A[i] + (B[i] - A[i]) * t));
}
/* WCAG relative luminance, and the ratio built on it. Used rather than eyeballed
   because the whole problem with a neon on white is that it looks fine to the
   person who chose it. */
function ncLum(hex) {
  const c = ncRGB(hex).map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ncContrast(a, b) {
  const x = ncLum(a), y = ncLum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/* Walk a neon down towards ink until it clears 4.5:1 on the background it will
   be read against. #00F0FF on white is 1.3:1 — which, as the light palette
   below already says, is not a colour, it is a rumour. The hue survives; the
   brightness is what gives way. The loop is bounded, and by the last step the
   colour is nearly black, which passes on any light background. */
function ncOnLight(hex, bg) {
  let c = hex;
  for (let i = 0; i < 24 && ncContrast(c, bg) < 4.5; i++) c = ncMix(c, '#05070E', 0.08);
  return c;
}

/* Lift a hex colour towards white by a fraction. Panels, hairlines and hover
   states all come from the background this way, so a skin does not have to
   list nine colours to look finished. */
function ncLift(hex, amount) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/* Paint a skin by rewriting the palette variables. Removing the sheet is what
   returns the site to plain light or dark.

   TWO PAINTS PER SKIN, NOT ONE.
   A cyber theme is a set of hues, not a set of pixels: Neo Cyberpunk is cyan,
   hot pink and yellow whether the page behind them is near-black or near-white.
   So a skin now paints either way, and which one it paints is the theme's
   answer rather than the skin's.

   The dark side is what it always was — the skin's own background, panels
   lifted off it, the three colours used neat, because a neon on near-black is
   what a neon is for.

   The light side cannot use any of that. #00F0FF on white is 1.3:1, and all
   twelve skins are built from colours like it. So the background becomes white
   carrying a light wash of the skin's primary — enough that Bloodmoon and
   Matrix are visibly different pages — and the three colours are walked down
   towards ink until each one clears 4.5:1 against it. The hue is the part that
   carries the identity, and the hue is the part that survives. */
function ncPaintSkin(id, theme) {
  const skin = ncSkin(id);
  let tag = document.getElementById('nc-skin-css');
  if (!skin) {
    if (tag) tag.remove();
    try { localStorage.removeItem(NC_SKIN_KEY); localStorage.removeItem(NC_SKIN_KEY_L); } catch (e) {}
    document.documentElement.removeAttribute('data-skin');
    return null;
  }
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'nc-skin-css';
  }
  /* APPENDED EVERY TIME, NOT ONLY WHEN IT IS NEW — appendChild on a node that
     is already in the document MOVES it, and moving it to the end is the whole
     point. The skin sheet and the base palette use the same selectors at the
     same specificity, so the later one in <head> wins. On a fresh visit the
     skin was painted from a click, landed after nc-theme-css, and worked; on a
     reload with a skin already stored it was painted during parse, landed
     BEFORE nc-theme-css, and lost every variable it set. A cyber theme that
     only survives until you reload the page is not a theme. */
  document.head.appendChild(tag);

  const light = theme === 'light';
  /* Computed on both sides every time, because both caches have to be written:
     a reader on "Match my device" can cross between them overnight without
     this code running in between. */
  const bgL = ncMix('#F5F7FB', skin.primary, 0.07);
  const bg  = light ? bgL : skin.bg;

  tag.textContent =
    ':root, html[data-theme="dark"], html[data-theme="light"]{' +
      '--nc-bg:' + bg + ';' +
      (light
        ? '--nc-bg2:' + ncMix('#FFFFFF', skin.primary, 0.03) + ';' +
          '--nc-bg3:' + ncMix('#EAEEF6', skin.primary, 0.10) + ';' +
          '--nc-bar-bg:' + ncMix('#FFFFFF', skin.primary, 0.05) + ';' +
          '--nc-text:#0B0E16;--nc-dim:#59637A;--nc-dim2:#5D6880;' +
          '--nc-line:rgba(16,24,44,.12);--nc-line2:rgba(16,24,44,.20);'
        : '--nc-bg2:' + ncLift(skin.bg, 0.10) + ';' +
          '--nc-bg3:' + ncLift(skin.bg, 0.05) + ';' +
          '--nc-bar-bg:' + ncLift(skin.bg, 0.04) + ';' +
          '--nc-text:#F2F7FF;--nc-dim:#8D9AB5;--nc-dim2:#9AA6BE;' +
          '--nc-line:rgba(255,255,255,.10);--nc-line2:rgba(255,255,255,.18);') +
      (function () {
        const p = light ? ncOnLight(skin.primary, bgL) : skin.primary;
        const s = light ? ncOnLight(skin.secondary, bgL) : skin.secondary;
        const a = light ? ncOnLight(skin.accent, bgL) : skin.accent;
        return '--nc-cyan:' + p + ';--nc-cyan2:' + p + ';' +
               '--nc-blue:' + p + ';' +
               '--nc-pink:' + s + ';--nc-mag:' + s + ';' +
               '--nc-violet:' + s + ';--nc-violet2:' + s + ';' +
               '--nc-lime:' + a + ';--nc-amber:' + a + ';';
      })() +
    '}';
  try { localStorage.setItem(NC_SKIN_KEY_L, bgL); } catch (e) {}
  document.documentElement.setAttribute('data-skin', skin.id);
  /* Stored so the snippet in each page's <head> can paint the background
     before the first frame. Without it a cyber skin flashes the default dark
     on every navigation. */
  try { localStorage.setItem(NC_SKIN_KEY, skin.bg); } catch (e) {}
  return skin;
}

const NC_THEME_KEY = 'nc_theme';

/* This key holds light, dark or system and nothing else now. A skin id read
   here is somebody arriving from the old single-key world; ncSkinPref() moves
   it across on its own first call, and until it does, dark is what they were
   already looking at. */
function ncThemePref() {
  try {
    const v = localStorage.getItem(NC_THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    if (ncSkin(v)) { ncSkinPref(); return 'dark'; }
  } catch (e) {}
  return 'system';
}

function ncThemeResolved(pref) {
  const p = pref || ncThemePref();
  if (p === 'light' || p === 'dark') return p;
  try { return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; } catch (e) { return 'dark'; }
}

function ncApplyTheme(pref) {
  const p = pref || ncThemePref();
  const t = ncThemeResolved(p);
  const r = document.documentElement;
  r.setAttribute('data-theme', t);
  r.setAttribute('data-theme-pref', p);
  /* Tells the browser which way to paint form controls, scrollbars and the
     canvas behind the page, which CSS variables cannot reach. */
  r.style.colorScheme = t;
  /* The skin is asked for separately and painted for whichever side we
     resolved to. Empty removes any sheet, which is what plain light or plain
     dark looks like. */
  ncPaintSkin(ncSkinPref(), t);
  ncCategoryVibe();          // and the wash the chosen category lights it with
  return t;
}

/* Choosing a cyber theme, or choosing none. It never touches nc_theme: pick
   Bloodmoon in light mode and you stay in light mode, wearing Bloodmoon. */
function ncSetSkin(id) {
  try {
    if (ncSkin(id)) localStorage.setItem(NC_SKIN_ID, id);
    else localStorage.removeItem(NC_SKIN_ID);
  } catch (e) {}
  const r = document.documentElement;
  r.classList.add('nc-theming');
  const t = ncApplyTheme();
  setTimeout(() => r.classList.remove('nc-theming'), 320);
  try { if (typeof applyTheme === 'function') applyTheme('Dark'); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('nc:theme', { detail: { pref: ncThemePref(), theme: t, skin: id || '' } })); } catch (e) {}
}
window.ncSetSkin = ncSetSkin;
window.ncSkinPref = ncSkinPref;

/* ============================================================================
   THE VIBE — THE SITE WEARS THE CATEGORY
   ============================================================================
   Choosing a category used to be an act of faith: it changed the shortcuts on
   the Ask card, the Trend Spotter's first search and eight AI prompts, and not
   one of those is visible at the moment you choose. So the site now LOOKS
   different, immediately, and keeps looking different on every page. Gaming is
   violet and cyan, Food is amber and red, Sport is green — and a written-in
   category gets its own colours derived from what was typed, so the answer
   nobody's list could hold is not the one the site ignores.

   A WASH, NOT A REPAINT

   Two large, soft radial gradients pinned behind everything, and nothing else.
   It is deliberately not a palette change:

     - The palette is the reader's to set. Light, dark and the twelve cyber
       skins are an explicit choice made in the top bar, and a category is not
       a licence to overrule it. This layer sits behind both and works with
       either.
     - Contrast is a promise. Repainting --nc-cyan and --nc-pink per category
       would put every button, link and focus ring at the mercy of nine colour
       pairs, and one of them would eventually be unreadable somewhere. A wash
       at 14% behind the content cannot do that to anything.

   IT STANDS DOWN FOR A CYBER SKIN. Those twelve already commit the background
   to one strong colour; a food wash over Matrix Terminal is two designs
   arguing. Somebody who picked a skin has said what they want the site to look
   like, and that answer wins.

   Painted from ncApplyTheme so it survives a theme change, and re-painted on
   the nc-category event so choosing on categories.html is something you watch
   happen rather than something you have to navigate away to see.
   ============================================================================ */
function ncCategoryVibe() {
  const C = window.NC_CATEGORY;
  let tag = document.getElementById('nc-vibe-css');
  const skinOn = !!document.documentElement.getAttribute('data-skin');
  const v = (C && C.vibeOf) ? C.vibeOf() : null;

  if (!v || skinOn) {
    if (tag) tag.remove();
    document.documentElement.style.removeProperty('--nc-cat-a');
    document.documentElement.style.removeProperty('--nc-cat-b');
    return null;
  }

  /* Published as variables as well as used below, so a page that wants to
     pick the vibe up in its own artwork can, without reading localStorage or
     knowing the table. */
  document.documentElement.style.setProperty('--nc-cat-a', v[0]);
  document.documentElement.style.setProperty('--nc-cat-b', v[1]);

  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'nc-vibe-css';
  }
  /* LAST IN <head>, EVERY TIME. appendChild on a node that is already in the
     document MOVES it, which is what is wanted here: the base palette sheet is
     injected after ncApplyTheme runs, and at equal specificity the later sheet
     wins — so a vibe written first was overruled on the light theme and the
     page came back plain white. Measured: Food on light gave #F5F7FB, the
     untinted value. */
  document.head.appendChild(tag);
  /* TWO PARTS, AND THE FIRST IS THE ONE THAT ACTUALLY SHOWS.

     A fixed wash behind the page was the whole of this at first, and it was
     nearly invisible: index.html paints its own body background, its own hero
     aura and a canvas over the top, so a layer at z-index:-1 was underneath
     three opaque things. Measured on the Food category, where the page still
     came up violet.

     So the background family is tinted instead — the same mechanism the twelve
     cyber skins use, and the reason every page follows without knowing this
     exists. index.html's own --void is `var(--nc-bg, ...)`, so it comes along;
     so does every panel, card and bar on the site.

     ONLY the backgrounds. Not --nc-cyan, --nc-pink or --nc-text, which are
     what buttons, links and body copy are drawn in — nine colour pairs let
     loose on those would eventually put unreadable text somewhere, and a
     category is not worth that. color-mix at 14% moves the hue and leaves the
     lightness where the palette put it, so dark stays dark and light stays
     light and every contrast ratio on the site is the one it was checked at.

     The wash stays as the second part, for the glow. */
  tag.textContent =
    /* The doubled attribute — [data-theme="dark"][data-theme] — is not a typo.
       It matches exactly what the single one matches and scores one selector
       higher, which makes this rule beat the base palette REGARDLESS of which
       sheet the browser sees last. Ordering was the first attempt and it lost:
       nova.js appends six more stylesheets after ncApplyTheme runs, so the
       light theme came back untinted at #F5F7FB. Specificity is the thing that
       does not depend on when a file happens to load. */
    'html[data-theme="dark"][data-theme]{' +
      '--nc-bg:color-mix(in srgb,var(--nc-cat-a) 13%,#05070E);' +
      '--nc-bg2:color-mix(in srgb,var(--nc-cat-a) 11%,#0C1220);' +
      '--nc-bg3:color-mix(in srgb,var(--nc-cat-b) 10%,#080A11);' +
      '--nc-bar-bg:color-mix(in srgb,var(--nc-cat-a) 10%,rgba(10,13,24,.72));' +
      /* The rail is drawn from its own three, or it would stay the one part of
         the screen the category did not reach. */
      '--nc-rail1:color-mix(in srgb,var(--nc-cat-a) 14%,#0E1220);' +
      '--nc-rail2:color-mix(in srgb,var(--nc-cat-a) 12%,#0A0D18);' +
      '--nc-rail3:color-mix(in srgb,var(--nc-cat-b) 11%,#080B14);' +
    '}' +
    /* Lighter touch on white. The same 13% that reads as a tinted room on the
       dark base reads as a stain on a white page, so it is halved. */
    'html[data-theme="light"][data-theme]{' +
      '--nc-bg:color-mix(in srgb,var(--nc-cat-a) 7%,#F5F7FB);' +
      '--nc-bg2:color-mix(in srgb,var(--nc-cat-a) 4%,#FFFFFF);' +
      '--nc-bg3:color-mix(in srgb,var(--nc-cat-b) 7%,#EAEEF6);' +
      '--nc-bar-bg:color-mix(in srgb,var(--nc-cat-a) 5%,rgba(255,255,255,.78));' +
      '--nc-rail1:color-mix(in srgb,var(--nc-cat-a) 6%,#FFFFFF);' +
      '--nc-rail2:color-mix(in srgb,var(--nc-cat-a) 8%,#F7F9FD);' +
      '--nc-rail3:color-mix(in srgb,var(--nc-cat-b) 8%,#EFF3FA);' +
    '}' +
    /* A fixed pseudo-element on <html> rather than a background on <body>:
       body is scrolled, and a gradient that scrolls with a long page ends
       somewhere down it. z-index:-1 puts it behind every page's own content
       without any page needing a stacking context of its own. */
    /* ==================================================================
       WHY THESE ARE NOT AT z-index:-1 ANY MORE
       ==================================================================
       They were, and on the one page that matters most they were invisible.
       A layer at -1 sits behind its own element's background — and every page
       here paints an opaque body: index.html has `body{background:var(--void)}`
       and --void is var(--nc-bg). So the wash, the photograph and the drawn
       scene were all underneath it. It happened to show on pricing.html, which
       is what was tested, and not on the home page, which is what was looked
       at. Reported as "it's still the same", and it was.

       The fix is a stack rather than a hole: --nc-bg moves onto <html>, the
       body goes transparent, the layers sit at z-index 0, and the body's own
       content is lifted to 1 above them. Nothing on any page has to know.
       ================================================================== */
    'html[data-theme][data-theme]{background-color:var(--nc-bg)}' +
    'html[data-theme][data-theme] body{background-color:transparent}' +
    /* position:relative is what makes the z-index take. Body is static by
       default and a z-index on a static box is ignored. */
    'html[data-theme][data-theme] body{position:relative;z-index:1}' +
    /* ==================================================================
       THE PAGES' OWN DECORATION FOLLOWS THE CATEGORY TOO
       ==================================================================
       Seven pages float three big blurred orbs behind their content —
       violet, magenta and cyan, fixed. On the home page they are 460px
       across at 42% opacity, which makes them the loudest thing on the
       screen by some distance. Tinting the page background underneath them
       and leaving them purple meant Food turned the site warm everywhere
       except the part anybody was actually looking at.

       One rule here rather than an edit in each of the seven: they all use
       the same .orb.a/.b/.c names, this beats their own selectors on
       specificity without !important, and it is only ever injected when a
       category is set — so with none, or with a cyber skin, every page keeps
       exactly the colours it shipped with.
       ================================================================== */
    'html[data-theme][data-theme] .orb.a{background:var(--nc-cat-a)}' +
    'html[data-theme][data-theme] .orb.b{background:var(--nc-cat-b)}' +
    'html[data-theme][data-theme] .orb.c{background:var(--nc-cat-a)}' +
    /* index.html's hero aura and its cursor glow are both a fixed cyan. */
    'html[data-theme][data-theme] .hero::after{background:radial-gradient(circle at 50% 50%,' +
      'color-mix(in srgb,var(--nc-cat-b) 55%,transparent),transparent 42%)}' +
    'html[data-theme][data-theme] #mouseglow{background:radial-gradient(circle,' +
      'color-mix(in srgb,var(--nc-cat-a) 30%,transparent),transparent 65%)}' +
    'html::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;' +
      'background:' +
        'radial-gradient(58% 46% at 12% 0%,var(--nc-cat-a) 0%,transparent 68%),' +
        'radial-gradient(52% 44% at 92% 100%,var(--nc-cat-b) 0%,transparent 66%);' +
      'opacity:.16;transition:opacity .5s ease}' +
    'html[data-theme="light"][data-theme]::before{opacity:.10}' +
    '@media (prefers-reduced-motion:reduce){html::before{transition:none}}' +

    /* THE PHOTOGRAPH, WHEN THERE IS ONE.
       html::after is a second fixed layer above the wash and still behind
       every page's content. It is empty until ncCategoryPhoto() finds a file
       for this category and sets --nc-cat-img — see there for why it is a
       probe rather than a plain url(). */
    'html::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;' +
      'background-image:var(--nc-cat-img,none);background-size:cover;' +
      'background-position:center;opacity:var(--nc-cat-img-o,0);' +
      /* Blurred and desaturated on purpose. A photograph at full strength
         behind a page of text is a page you cannot read — this has to be a
         room the site is standing in, not a picture the site is written on
         top of. The scrim below does the rest.

         The amount is a variable because the two things that land here are not
         alike: a photograph carries detail that has to be taken away, and a
         drawn scene is already nothing but large shapes, so blurring it as
         hard only makes it muddy. */
      'filter:blur(var(--nc-cat-blur,6px)) saturate(.85);transform:scale(1.06);' +
      'transition:opacity .6s ease}' +
    /* The scrim. Without it the headline sits on whatever the photo happens to
       be at that pixel, which is different on every screen size — the one
       thing a background image must never be allowed to decide. */
    /* The scrim moved off body::before and onto a rule that sits with the
       other two layers. On body it was inside the lifted stacking context, so
       it would have been drawn OVER the page's text rather than under it — a
       grey veil across every word. */
    'html[data-theme="dark"][data-theme] body::before{content:"";position:fixed;inset:0;' +
      'z-index:-1;pointer-events:none;background:linear-gradient(180deg,' +
      'color-mix(in srgb,var(--nc-bg) 78%,transparent) 0%,' +
      'color-mix(in srgb,var(--nc-bg) 90%,transparent) 100%);' +
      'opacity:var(--nc-cat-img-o,0);transition:opacity .6s ease}' +
    'html[data-theme="light"][data-theme] body::before{content:"";position:fixed;inset:0;' +
      'z-index:-1;pointer-events:none;background:linear-gradient(180deg,' +
      'color-mix(in srgb,var(--nc-bg) 84%,transparent) 0%,' +
      'color-mix(in srgb,var(--nc-bg) 93%,transparent) 100%);' +
      'opacity:var(--nc-cat-img-o,0);transition:opacity .6s ease}';

  ncCategoryPhoto();
  return v;
}
window.ncCategoryVibe = ncCategoryVibe;
addEventListener('nc-category', function () { ncCategoryVibe(); });

/* ============================================================================
   AND A PHOTOGRAPH BEHIND IT, IF ONE HAS BEEN ADDED
   ============================================================================
   Asked for directly: choose cooking, get a kitchen behind the site. The
   colours above do that with no files at all, and this puts a real photograph
   behind them when there is one to use.

   THE FILES ARE NOT IN THIS REPO, AND THAT IS THE POINT OF THE PROBE

   A photograph is a licensing decision and a 200KB decision, and neither is
   one this file should make on somebody's behalf. So nothing is bundled.
   Instead each category looks for its own file at a fixed path:

       backgrounds/gaming.jpg      backgrounds/food.jpg
       backgrounds/music.jpg       backgrounds/comedy.jpg
       backgrounds/sport.jpg       backgrounds/tech.jpg
       backgrounds/irl.jpg         backgrounds/learning.jpg
       backgrounds/art.jpg

   Drop a file in and that category gains a background on the next load. Drop
   none in and every category still has its colours, and nothing 404s in a way
   a reader can see. Adding one is adding a file, not editing any code.

   IT IS AN Image() AND NOT A url() IN THE STYLESHEET, and the difference is
   how OFTEN the miss costs anything. Either way the first look for a file that
   is not there is a 404 — that is unavoidable and it is expected until a file
   is added. A url() in the stylesheet repeats it on every page load, forever.
   The probe asks once, writes the answer to sessionStorage, and every page
   after that in the same visit reads the answer instead of asking again. It
   also means the custom property is only ever set for a file that actually
   decoded, so a corrupt or half-uploaded image leaves the colours alone rather
   than showing a broken layer.

   A WRITTEN-IN CATEGORY IS NEVER PROBED. "Warhammer painting" would be
   backgrounds/warhammer%20painting.jpg, which is a guess at a filename rather
   than a lookup — and a guessed URL built from something a person typed is not
   a request worth making. Those keep their generated colours.
   ============================================================================ */
var NC_PHOTO_KEY = 'nc_cat_photo';        // sessionStorage: id -> '1' or '0'

function ncCategoryPhoto() {
  var C = window.NC_CATEGORY;
  var root = document.documentElement;
  var clear = function () {
    root.style.removeProperty('--nc-cat-img');
    root.style.removeProperty('--nc-cat-img-o');
    root.style.removeProperty('--nc-cat-blur');
  };
  if (!C || !C.presetOf || root.getAttribute('data-skin')) { clear(); return; }

  var p = C.presetOf();
  if (!p) { scene(); return; }   /* written in: no file to look for, still a scene */

  /* FOUR EXTENSIONS, TRIED IN ORDER, AND THIS IS NOT A NICETY.
     The first version of this looked for .jpg and only .jpg. Somebody saving a
     photograph off their phone or out of a chat gets a .png or a .webp far
     more often than a .jpg — they would have dropped the file into the folder,
     seen nothing happen, and had nothing at all to tell them why. A silent
     no-op with a correct-looking file sitting right there is the worst failure
     this feature could have.

     jpg first because it is the right format for a photograph and the one the
     README asks for; the other three are for the file somebody actually has. */
  var EXT = ['jpg', 'jpeg', 'png', 'webp'];
  var url = '';
  var known = null;
  try { known = sessionStorage.getItem(NC_PHOTO_KEY + ':' + p.id); } catch (e) {}

  /* THE REMEMBERED "NO" EXPIRES. THE REMEMBERED "YES" DOES NOT.
     This is the bug that made adding the photographs look like it had done
     nothing. A found filename is cached for the visit, which is right — the
     file is not going to move. A miss was cached the same way, which is
     wrong: somebody who opened the site before the files existed had '0'
     written into sessionStorage, and sessionStorage survives a reload,
     including a hard one. Only closing the tab cleared it. So the photos went
     up, the page was reloaded, and it kept saying there were none.

     A miss now carries the time it was recorded and is retried after two
     minutes. Long enough that a page load does not re-ask four times; short
     enough that "I just added the file" and "the site can see it" are the
     same minute. */
  if (known && known.indexOf('miss:') === 0) {
    var when = parseInt(known.slice(5), 10) || 0;
    if (Date.now() - when < 120000) { scene(); return; }
    known = null;                                     /* stale — look again */
  }
  if (known === '0') { known = null; }                /* written by the old code */
  if (known) { url = known; apply(); return; }

  tryExt(0);

  function tryExt(i) {
    if (i >= EXT.length) {
      try { sessionStorage.setItem(NC_PHOTO_KEY + ':' + p.id, 'miss:' + Date.now()); } catch (e) {}
      scene();                              /* drawn, since there is no photo */
      return;
    }
    var candidate = 'backgrounds/' + p.id + '.' + EXT[i];
    var probe = new Image();
    probe.onload = function () {
      url = candidate;
      try { sessionStorage.setItem(NC_PHOTO_KEY + ':' + p.id, candidate); } catch (e) {}
      apply();
    };
    probe.onerror = function () { tryExt(i + 1); };
    probe.src = candidate;
  }

  /* THE FLOOR: A SCENE DRAWN HERE, WHEN THERE IS NO PHOTOGRAPH.
     Every category has a background now, not only the ones somebody has found
     a picture for — which was the whole complaint about the colour-only
     version. category-scene.js composes it; this only places it. Less blur
     than a photograph gets, because it is already large shapes and nothing
     else, and a touch stronger, because a drawn scene at a photograph's
     opacity reads as a smudge rather than a place. */
  function scene() {
    var S = window.NC_SCENE;
    var cols = (C.vibeOf ? C.vibeOf() : null);
    if (!S || !cols) { clear(); return; }
    var id = p ? p.id : 'own';
    root.style.setProperty('--nc-cat-img', 'url("' + S.svg(id, cols[0], cols[1]) + '")');
    root.style.setProperty('--nc-cat-blur', '2px');
    var lightS = root.getAttribute('data-theme') === 'light';
    /* .44 on light, not .34. Measured from a screenshot: at .34 the Food scene
       was a faint smudge in one corner of a white page — present in the
       stylesheet and absent to a reader, which is the version of this feature
       that is not worth having. Dark carries it at .5 because the shapes are
       lighter than the ground they sit on; on white they are darker than it,
       and darker-on-white needs more of itself to register. */
    root.style.setProperty('--nc-cat-img-o', lightS ? '.44' : '.5');
    try { window.dispatchEvent(new CustomEvent('nc-cat-photo', { detail: 'scene:' + id })); } catch (e) {}
  }

  function apply() {
    root.style.setProperty('--nc-cat-img', 'url("' + url + '")');
    root.style.setProperty('--nc-cat-blur', '6px');
    /* Dark carries a photograph better than white does: the same image at the
       same strength on a light page fights the text rather than sitting under
       it. */
    var light = root.getAttribute('data-theme') === 'light';
    root.style.setProperty('--nc-cat-img-o', light ? '.28' : '.42');
    /* So a page can say out loud that it found one — categories.html does. */
    try { window.dispatchEvent(new CustomEvent('nc-cat-photo', { detail: url })); } catch (e) {}
  }
}
window.ncCategoryPhoto = ncCategoryPhoto;

/* Which file, if any, is behind the site right now. categories.html asks so it
   can tell somebody their drop worked — the alternative is dropping a file in a
   folder and having to take on trust that it landed. */
window.ncCategoryPhotoUrl = function () {
  var v = document.documentElement.style.getPropertyValue('--nc-cat-img') || '';
  var m = v.match(/url\("([^"]+)"\)/);
  return m ? m[1] : '';
};

function ncSetTheme(pref) {
  try { localStorage.setItem(NC_THEME_KEY, pref); } catch (e) {}
  /* A cross-fade over the whole page, rather than every element easing on its
     own schedule and arriving at slightly different times. */
  const r = document.documentElement;
  r.classList.add('nc-theming');
  ncApplyTheme(pref);
  setTimeout(() => r.classList.remove('nc-theming'), 320);
  document.querySelectorAll('.nc-themebtn').forEach(b => {
    const on = b.dataset.theme === pref;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  /* The skin survives a theme change now, so this re-states what is selected
     rather than clearing it — pressing Light with Bloodmoon on keeps Bloodmoon
     in the list, because it kept Bloodmoon on the page. */
  const sel = document.getElementById('nc-skinpick');
  if (sel) sel.value = ncSkinPref();
  /* --bg and --box are mirrored from the palette, so they have to be taken
     again once the palette has moved. */
  try { if (typeof applyTheme === 'function') applyTheme('Dark'); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('nc:theme', { detail: { pref, theme: ncThemeResolved(pref) } })); } catch (e) {}
}
window.ncSetTheme = ncSetTheme;
window.ncTheme = () => ncThemeResolved();
window.ncThemePref = ncThemePref;

/* APPLY IT ON LOAD, ON EVERY PAGE.
   ncApplyTheme was only ever called from ncSetTheme — from a click. Every page
   that looked themed was being themed by the inline snippet in its own <head>,
   and editor.html does not have that snippet, so on the editor data-theme was
   never set at all: the light button did nothing, forever, and no CSS keyed to
   the attribute could possibly have worked.

   Called here rather than on DOMContentLoaded because documentElement exists
   the moment this script parses, and the attribute wants to be on before
   anything paints. */
ncApplyTheme();

/* ============================================================================
   THE SITE'S TYPEFACES — REMOVED, DELIBERATELY
   ============================================================================
   A script face for the wordmark (Great Vibes) and a serif for every heading
   (EB Garamond) were injected from here onto every page. Both are gone at the
   owner's request, and the site is back to the sans each page already sets for
   itself.

   What went with them, and why it is worth knowing rather than rediscovering:

     - the <link> to fonts.googleapis.com, and its two preconnects. That was
       the site's only Google Fonts request, so privacy.html changed in the
       same commit as this to stop saying the typefaces load from there.
     - the @font-face pair pointing at /fonts/great-vibes-*.woff2 and
       /fonts/eb-garamond-*.woff2. Those two files were never added, so they
       were 404ing on every page load; that noise goes too.
     - --nc-brand and --nc-display, and the h1/h2/h3 and wordmark rules that
       used them.

   Nothing replaces it: headings inherit from each page's own stylesheet again,
   which is where they were before and is why no page needed editing to undo
   this. */

/* Following the device means following it for as long as the page is open. */
try {
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (ncThemePref() === 'system') ncApplyTheme('system');
  });
} catch (e) {}

const ncThemeStyle = document.createElement('style');
ncThemeStyle.id = 'nc-theme-css';
ncThemeStyle.textContent =
/* ---- the canonical palette, dark ---- */
":root{" +
  "--nc-bg:#05070E; --nc-bg2:#0C1220; --nc-bg3:#080A11; --nc-text:#EAF2FF;" +
  "--nc-dim:#7E8AA6; --nc-dim2:#8A97B4; --nc-line:rgba(255,255,255,.10);" +
  "--nc-line2:rgba(255,255,255,.16); --nc-cyan:#00F0FF; --nc-cyan2:#00E5FF;" +
  "--nc-pink:#FF2E97; --nc-mag:#F72585; --nc-violet:#7C5CFF; --nc-violet2:#7209B7;" +
  "--nc-blue:#4CC9F0; --nc-lime:#B6FF3C; --nc-amber:#FFB443;" +
  "--nc-card:rgba(255,255,255,.04); --nc-card2:rgba(255,255,255,.06);" +
  "--nc-shadow:rgba(0,0,0,.55);" +
  "--nc-rail1:#0E1220; --nc-rail2:#0A0D18; --nc-rail3:#080B14;" +
  "--nc-railline:rgba(255,255,255,.07); --nc-railglow:rgba(124,92,255,.10);" +
  "--nc-navhead:#5D6A88; --nc-navhover:#A8B8D8; --nc-navlink:#98A6C4; --nc-navon:#FFFFFF;" +
  /* Trend Spotter's rail vocabulary, now shared. Kept as variables so light
     mode can restate them rather than inheriting a dark wash on white. */
  "--nc-navhoverbg:rgba(255,255,255,.04);" +
  "--nc-navonbg:linear-gradient(90deg,rgba(167,139,250,.16),rgba(56,189,248,.08));" +
  "--nc-navonline:rgba(167,139,250,.28); --nc-navicohover:#38BDF8; --nc-navicoon:#A78BFA;" +
  "--nc-coinbg:linear-gradient(135deg,rgba(167,139,250,.12),rgba(244,114,182,.08));" +
  "--nc-cardbg:rgba(255,255,255,.03);" +
  "--nc-sel-bg:#0A0C14; --nc-sel-text:#EAF2FF; --nc-sel-line:rgba(0,240,255,.35);" +
"}" +

/* ---- light. The neons are the part that cannot survive the swap: #00F0FF on
   white is about 1.3:1, which is not a colour, it is a rumour. Each accent is
   replaced by a darker sibling of the same hue so the site keeps its identity
   and the text keeps its contrast. ---- */
"html[data-theme=\"light\"]{" +
  "--nc-bg:#F5F7FB; --nc-bg2:#FFFFFF; --nc-bg3:#EAEEF6; --nc-text:#0B0E16;" +
  "--nc-dim:#59637A; --nc-dim2:#5D6880; --nc-line:rgba(16,24,44,.12);" +
  "--nc-line2:rgba(16,24,44,.20); --nc-cyan:#00778C; --nc-cyan2:#0A6E86;" +
  "--nc-pink:#C4166F; --nc-mag:#BE1259; --nc-violet:#5B3FD6; --nc-violet2:#5B0F9C;" +
  "--nc-blue:#1E7FA8; --nc-lime:#4F7A00; --nc-amber:#9A5B00;" +
  "--nc-card:rgba(16,24,44,.035); --nc-card2:rgba(16,24,44,.06);" +
  "--nc-shadow:rgba(16,24,44,.14);" +
  "--nc-rail1:#FFFFFF; --nc-rail2:#F7F9FD; --nc-rail3:#EFF3FA;" +
  "--nc-railline:rgba(16,24,44,.13); --nc-railglow:rgba(91,63,214,.10);" +
  "--nc-navhead:#6B7690; --nc-navhover:#1B2437; --nc-navlink:#2B3448; --nc-navon:#0B0E16;" +
  /* Same shapes, stronger tints: at .16 on white the active row was invisible. */
  "--nc-navhoverbg:rgba(16,24,44,.05);" +
  "--nc-navonbg:linear-gradient(90deg,rgba(124,92,255,.16),rgba(56,189,248,.10));" +
  "--nc-navonline:rgba(124,92,255,.34); --nc-navicohover:#0A85C4; --nc-navicoon:#6D4AE0;" +
  "--nc-coinbg:linear-gradient(135deg,rgba(124,92,255,.13),rgba(247,37,133,.08));" +
  "--nc-cardbg:rgba(16,24,44,.035);" +
  "--nc-sel-bg:#FFFFFF; --nc-sel-text:#0B0E16; --nc-sel-line:rgba(16,24,44,.22);" +

  /* The families the pages declare for themselves, re-pointed at the palette
     above. Nine pages share the first set; index and tools have their own
     names for the same ideas. */
  "--ink:var(--nc-bg); --panel:var(--nc-bg2); --void:var(--nc-bg); --void2:var(--nc-bg3);" +
  "--txt:var(--nc-text); --white:var(--nc-text); --dim:var(--nc-dim);" +
  "--line:var(--nc-line); --cyan:var(--nc-cyan); --pink:var(--nc-pink);" +
  "--magenta:var(--nc-pink); --mag:var(--nc-mag); --violet:var(--nc-violet);" +
  "--lime:var(--nc-lime); --amber:var(--nc-amber);" +
  "--grad:linear-gradient(110deg,var(--nc-violet),var(--nc-cyan) 48%,var(--nc-pink));" +
"}" +

/* Body and the rail are painted per page, so they are set here rather than
   left to whichever literal happened to be in that page's stylesheet. */
"html[data-theme=\"light\"] body{background:var(--nc-bg);color:var(--nc-text);}" +
"html[data-theme=\"light\"] .sidebar{background:rgba(255,255,255,.86);" +
  "border-right:1px solid var(--nc-line);}" +
"html[data-theme=\"light\"] .sidebar a{color:var(--nc-text);}" +
"html[data-theme=\"light\"] .sidebar{border-right:1px solid var(--nc-line) !important;box-shadow:1px 0 0 rgba(16,24,44,.05) !important;}" +
"html[data-theme=\"light\"] .sidebar::before{opacity:.25;}" +
"html[data-theme=\"light\"] .sidebar a:hover{text-shadow:none !important;background:rgba(0,119,140,.09) !important;}" +
"html[data-theme=\"light\"] .sidebar a::after{opacity:.5;}" +
"html[data-theme=\"light\"] .card,html[data-theme=\"light\"] .panel,html[data-theme=\"light\"] .plan,html[data-theme=\"light\"] .tile,html[data-theme=\"light\"] .tool,html[data-theme=\"light\"] .box{" +
  "background:var(--nc-bg2);border:1px solid var(--nc-line);}" +

/* A white page with the dark theme's drop shadows looks like a photocopy of a
   page. Softer, tighter, and tinted with the ink colour instead of black. */
"html[data-theme=\"light\"] [class*=\"card\"],html[data-theme=\"light\"] [class*=\"panel\"]{" +
  "box-shadow:0 1px 2px rgba(16,24,44,.04),0 8px 24px -12px var(--nc-shadow);}" +

/* Images and video keep their own colour; the decorative blurred orbs on the
   AI pages are pure neon on black and turn into bruises on white. */
"html[data-theme=\"light\"] .orb{opacity:.13;}" +

/* The cross-fade. Painted properties only — never `all`, which would sweep up
   transforms and layout and make every theme flip a lurch. */
"html.nc-theming,html.nc-theming *{transition:background-color .28s ease,color .28s ease," +
  "border-color .28s ease,box-shadow .28s ease,fill .28s ease,stroke .28s ease !important;}" +
"@media (prefers-reduced-motion:reduce){html.nc-theming,html.nc-theming *{transition:none !important;}}" +

/* ---- the three-way switch ---- */
".nc-themerow{display:flex;gap:0;background:var(--nc-card);border:1px solid var(--nc-line2);" +
  "border-radius:10px;overflow:hidden;margin-top:6px;}" +
/* 44px, because a sweep of all 27 pages found these at 30 and 34 — the one
   control that appears on every single page, and the one that was too small
   to hit. The bar is 52px tall, so 44 fits inside it with room to spare. */
".nc-themebtn{flex:1;min-height:44px;padding:7px 4px;border:0;background:none;cursor:pointer;color:var(--nc-dim);" +
  "font:inherit;font-size:.72rem;font-weight:700;display:grid;place-items:center;gap:2px;" +
  "transition:background .18s,color .18s;}" +
/* The language picker is declared in each page's own sidebar markup and
   styled by that page, so 27 stylesheets each decided its height and all
   of them landed on 28px. One rule here reaches every one of them. */
".themewrap select,#ncbar select,select#langpick{min-height:44px;}" +
".nc-themebtn:hover{color:var(--nc-text);background:var(--nc-card2);}" +
".nc-themebtn:focus-visible{outline:2px solid var(--nc-cyan);outline-offset:-2px;}" +
".nc-themebtn.on{background:linear-gradient(135deg,var(--nc-violet),var(--nc-cyan));color:#04121a;}" +
"html[data-theme=\"light\"] .nc-themebtn.on{color:#fff;}" +
".nc-themebtn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;" +
  "stroke-linecap:round;stroke-linejoin:round;}";
document.head.appendChild(ncThemeStyle);
/* And the skin goes back on top of it. ncApplyTheme() ran further up, before
   this sheet existed, so anything it painted is now underneath the base
   palette. One more pass puts the cyber theme back at the end of the head,
   where it outranks what it is meant to override. No-op when no skin is on. */
ncApplyTheme();

/* The switch itself: sun, monitor, moon. Built wherever a page keeps its
   language box, which is the sidebar on most pages and the collapsed corner
   control on the ones without a rail. */
const NC_THEME_ICONS = {
  light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  system: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/>' +
    '<path d="M8 21h8M12 17v4"/></svg>',
  dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 13a8.5 8.5 0 01-10-10 8.5 8.5 0 1010 10z"/></svg>'
};

/* ============================================================================
   THE STICKY HEADER
   ============================================================================
   Language, Theme and Vibe used to live at the bottom of the sidebar. That is
   the one place on the page you cannot see once you scroll — and on the pages
   with no rail at all (editor, games, pricing, the family dashboard) they fell
   back to a collapsed corner button, so the same three controls were in two
   different places depending on which page you were on.

   This puts them in one fixed strip across the top that survives scrolling and
   is identical everywhere.

   It is built as a HOST rather than as three more controls: the inner div
   carries class "themewrap", which is exactly what ncBuildThemeSwitch() and
   ncBuildGenZToggle() already look for, and the bar is inserted as the first
   element of the body so querySelector finds it before the sidebar's. Neither
   builder needed changing. The language <select> is hard-coded into each
   page's sidebar markup, so that one is moved rather than rebuilt — moved, not
   copied, because two elements with id="langpick" is one element as far as
   getElementById is concerned, and the wrong one would win.
   ============================================================================ */
const NC_BAR_H = 52;

/* ============================================================================
   THE RAIL'S OWN SWITCH
   ============================================================================
   Read and applied at the top of this file rather than inside ncBuildBar,
   because ncBuildBar runs on DOMContentLoaded and this has to be on the
   element BEFORE the first paint or a reader who has put the rail away sees it
   flash in and slide out again on every single navigation. nova.js is a
   parser-blocking script at the end of <body>, so a class set here lands
   before the page is drawn.

   The state is one flag on this device. It is not an account setting and does
   not sync: "I want more room on this screen" is about the screen, and a
   reader on a laptop and a reader on a big monitor want different answers.
   ============================================================================ */
var NC_RAIL_KEY = 'nc_rail_off';

function ncRailHidden() {
  try { return localStorage.getItem(NC_RAIL_KEY) === '1'; } catch (e) { return false; }
}
function ncApplyRail(off) {
  document.documentElement.classList.toggle('nc-rail-off', !!off);
  var b = document.getElementById('ncrail');
  if (b) {
    b.setAttribute('aria-pressed', off ? 'true' : 'false');
    b.setAttribute('aria-label', off ? 'Show the sidebar' : 'Hide the sidebar');
    b.title = off ? 'Show the sidebar' : 'Hide the sidebar';
  }
}
function ncToggleRail() {
  var off = !ncRailHidden();
  try { localStorage.setItem(NC_RAIL_KEY, off ? '1' : '0'); } catch (e) {}
  ncApplyRail(off);
}
window.ncToggleRail = ncToggleRail;
/* Immediately, at parse time — see above. */
if (ncRailHidden()) document.documentElement.classList.add('nc-rail-off');

function ncBuildBar() {
  if (NC_EMBED) return null;                       // pages embedded in a tab host
  let bar = document.getElementById('ncbar');
  if (bar) return bar.querySelector('.themewrap');

  const css = document.createElement('style');
  css.id = 'ncbar-css';
  css.textContent =
    /* The bar's height, published so a page can position against it.

       It was a JS constant only, so anything that wanted to sit below the bar
       had to know the number by heart. The family dashboard's sticky header
       did not: it stuck at top:0, which is UNDER a fixed bar, so its title row
       was permanently hidden behind the bar and only the tab strip showed —
       with page content ghosting through the sliver that peeked out. Anything
       sticky on any page needs this, so it goes where CSS can reach it. */
    ':root{--nc-bar-h:' + NC_BAR_H + 'px}' +
    '#ncbar{position:fixed;top:0;left:0;right:0;height:' + NC_BAR_H + 'px;z-index:990;' +
      /* The right padding reserves the coins badge's strip. #ncpts is fixed to
         the top-right corner and sits ABOVE the bar, while .themewrap scrolls
         sideways once the controls stop fitting — so on a phone whichever
         control happened to be scrolled to the end ended up underneath the
         badge and could not be pressed. Measured at 320px the theme dropdown
         ran 33px under it, at 480px the language picker 58px. Reserving the
         badge's own width (63px plus its offset) means the scroll stops short
         of it instead. Costs nothing on a desktop, where the controls never
         reach that far anyway. */
      'display:flex;align-items:center;gap:14px;padding:0 88px 0 14px;box-sizing:border-box;' +
      'background:var(--nc-bar-bg,rgba(10,13,24,.72));' +
      'border-bottom:1px solid var(--nc-line2,rgba(255,255,255,.08));' +
      'backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4)}' +
    /* THE BAR IS NOT PART OF THE PAGE'S FORM.
       report.html styles its own submit control with a bare `button { width:
       100%; margin-top:22px }`, and a bare element selector reaches anything
       this file puts on that page. "Ask Nova" came out 738px wide on an 844px
       screen and shoved the "?" clean off the right-hand edge — at every
       width, on the one page whose whole purpose is reporting a problem.

       flex:0 0 auto did not save it: with flex-basis auto the basis IS the
       width, so width:100% still won.

       Margins are reset for the whole bar, since nothing in it sets one
       vertically and a page's `margin-top:22px` would drop a control through
       the bar's floor. Width is NOT: #ncrail and #ncguidebtn each declare
       36px, and a blanket `#ncbar button{width:auto}` outranks a plain
       `#ncrail{...}` and shrank both to the width of their own glyph. Only
       #ncaskbtn has no width of its own, so only #ncaskbtn is given one —
       just below, in its own rule, where it cannot reach anything else. */
    '#ncbar button,#ncbar>a{max-width:none;margin-top:0;margin-bottom:0}' +
    'html[data-theme="light"] #ncbar{--nc-bar-bg:rgba(255,255,255,.78)}' +
    /* Sits beside the rail, not under it — but only where there IS a rail.
       The editor, trends and the family page have no .sidebar, and offsetting
       the bar by a rail that is not there leaves a dead strip down the left,
       which is the same mistake the body margin made before it was scoped. */
    '@media (min-width:761px){body:has(.sidebar) #ncbar{left:var(--nc-rail)}}' +
    /* trends.html brings its own rail (.nc-sidebar, 248px, hidden at 900px)
       rather than the shared .sidebar, so the rule above never matched it and
       the bar started at x=0 — straight over that page's own navigation. Its
       width already lives in a variable the page defines, and its own
       breakpoint is 900px, so both are borrowed rather than guessed at. */
    '@media (min-width:901px){body:has(.nc-sidebar) #ncbar{left:var(--nc-sidebar,248px)}}' +
    /* flex:1 matters. As a bare flex item this scroller sized itself to 168px
       on editor.html while holding 607px of controls, so everything past the
       theme switch was clipped out of a page that had no sidebar to fall back
       on. Told to fill the bar, it stops guessing. */
    '#ncbar .themewrap{display:flex;align-items:center;gap:16px;min-width:0;flex:1 1 auto;' +
      'padding:0 !important;margin:0;flex-wrap:nowrap;overflow-x:auto;' +
      'scrollbar-width:none}' +
    '#ncbar .themewrap::-webkit-scrollbar{display:none}' +
    /* The controls were built for a narrow column: stacked, each with a block
       label above it and a bottom margin. Laid on their side here. */
    '#ncbar .themewrap > *{margin:0 !important;flex:none;display:flex;' +
      'align-items:center;gap:8px}' +
    '#ncbar .themewrap label{margin:0 !important;font-size:.72rem;opacity:.55;' +
      'white-space:nowrap;letter-spacing:.02em}' +
    '#ncbar #nc-themerow .nc-themerow{margin-top:0;width:104px}' +
    '#ncbar #nc-themerow .nc-themebtn{padding:5px 4px;min-height:44px}' +
    '#ncbar #genzToggle{width:148px}' +
    '#ncbar #genzToggle > div{padding:5px 4px}' +
    /* width:auto beats the pages that style their sidebar select as
       width:100% — in a flex row that resolved to 615px on publish.html and
       pushed everything else out of the bar. */
    '#ncbar select{width:auto !important;max-width:170px;' +
      'padding:5px 26px 5px 9px;border-radius:9px;font-size:.78rem;' +
      'background:var(--nc-card,rgba(255,255,255,.05));color:var(--nc-text,inherit);' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.15))}' +
    /* Reserve the strip's height. These are the same containers the rail
       offset uses, so a page that offsets a wrapper keeps offsetting the
       wrapper and one that offsets the body keeps offsetting the body —
       adding a second rule with a different idea of the layout is what put
       the hero 432px from the edge the last time. */
    '@media (min-width:761px){' +
      'body:has(#ncbar) .content,body:has(#ncbar) .shell,body:has(#ncbar) .main' +
        '{padding-top:' + NC_BAR_H + 'px}' +
      /* A BORDER, NOT PADDING, ON THIS BRANCH.
         These are the pages with no wrapper — Profile, Privacy, Terms, Report —
         and every one of them sets its own top padding for the gap it wants
         under its masthead. Writing padding-top here REPLACED that: Profile
         asks for 34px and got exactly 52, the bar's height and not a pixel
         more, so its title sat welded to the underside of the bar.

         A transparent top border reserves the same 52px and leaves the page's
         padding where it was, so the gap each page asked for is the gap it
         gets. The border is invisible: the bar is opaque and sits over it, and
         the body background paints under it by default. */
      'body:has(#ncbar):not(:has(.content)):not(:has(.shell)):not(:has(.main))' +
        '{border-top:' + NC_BAR_H + 'px solid transparent}' +
    '}' +
    /* On a phone the rail is a bottom strip and the bar is the full width.

       THE SETTINGS GO BEHIND ONE BUTTON.

       They used to be laid out flat, squeezed: the three theme buttons at
       84px, the skin picker at 116, the language picker, the Gen Z switch,
       and whatever was left over for the brand. On a 390px phone "whatever
       was left over" is 76px, so the site's own name rendered as "No" —
       clipped mid-word, in the most valuable strip on the screen, on every
       page. The three theme buttons came out 27px wide, which is not a tap
       target.

       None of those controls is something you touch twice a year. Appearance
       and language belong in a menu; they were only ever laid out flat
       because on a 1440px desktop there is room to be lazy about it. So on a
       phone the whole themewrap drops into a sheet under one 40px button and
       the bar gets its width back.

       1023 AND NOT 760, WHICH IS THE OTHER BREAKPOINT ON THIS BLOCK.

       760 is where the rail becomes a bottom strip; it is not where these
       controls stop fitting. Laid flat they need about 850px: the theme
       label and its three buttons, the skin picker at 170, the Gen Z switch
       at 261, the language label and its picker at 157. On a 768px tablet
       the bar also starts at the rail, so there are 592px for 850px of
       controls — the language picker ended up at x=814 on a 768 screen,
       entirely off the side, and took the page's horizontal scroll with it.

       So the sheet covers everything below 1024 and the strip rules keep
       their own 760 block further down. The two were one block until the
       tablet sweep caught this. */
    '@media (max-width:1023px){#ncbar{padding:0 96px 0 10px;gap:8px}' +
      /* Out of the bar's flow and into a panel hanging off it. Positioned
         from the right edge rather than the button, so it cannot be pushed
         off-screen by a page that adds something of its own to the bar. */
      /* padding carries !important because the flat-bar rule above sets
         `padding:0 !important` — it has to, because the pages this wrap is
         adopted from bring their own. In the sheet that left every control
         hard against the border and the labels touching the rounded corner;
         only another !important reaches it.
         overflow-x too: the bar version scrolls sideways, which in a
         column-shaped menu would clip the shadow and add a scrollbar to a
         list that already fits. */
      '#ncbar .themewrap{position:absolute;top:100%;right:8px;left:auto;' +
        'display:none;flex-direction:column;align-items:stretch;gap:14px;' +
        'width:min(19rem,calc(100vw - 16px));padding:14px !important;margin-top:6px;' +
        'overflow-x:hidden;' +
        'border-radius:14px;border:1px solid var(--nc-line2,rgba(255,255,255,.15));' +
        /* Two layers, and the bottom one is the point. --nc-bar-bg is the top
           bar's colour and every skin defines it translucent, because a bar
           is meant to have the page sliding under it. A menu is not: with
           just that, the page showed straight through the sheet and the word
           LANGUAGE was printed over BioSentinel's vault tiles. --nc-bg is the
           page's own background, so it is opaque in every skin and in both
           light and dark; the bar tint goes on top of it as an image so the
           sheet still looks like it belongs to the bar it hangs off. */
        'background-color:var(--nc-bg,#0a0d16);' +
        'background-image:linear-gradient(var(--nc-bar-bg,rgba(10,13,24,.98)),' +
          'var(--nc-bar-bg,rgba(10,13,24,.98)));' +
        '-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);' +
        'box-shadow:0 18px 50px rgba(0,0,0,.6);max-height:70vh;overflow-y:auto}' +
      '#ncbar.ncset-open .themewrap{display:flex}' +
      /* In a sheet there is room for the words again, so the labels come
         back — the flat bar was the only reason they had to go. */
      '#ncbar .themewrap label{display:block !important;font-size:.72rem;' +
        'font-weight:800;letter-spacing:.08em;text-transform:uppercase;' +
        'opacity:.6;margin:0 0 6px}' +
      /* Full width inside the sheet: these were the 27x44 targets.

         Named ids first, then a catch-all. The language picker arrives from
         whichever page shipped it, wrapped in whatever that page felt like
         wrapping it in — usually a label or a bare div sized to its content,
         which left the select 131px wide in a 304px sheet however many
         !importants the select itself carried. `width:100%` on a select is
         100% of that wrapper, so the wrapper is the thing to widen, and only
         a catch-all reaches all of them. */
      '#ncbar #nc-themerow,#ncbar #genzwrap,#ncbar #ncLangPick{width:100%}' +
      '#ncbar .themewrap > *{width:100%;max-width:100%;box-sizing:border-box}' +
      /* #nc-themerow is itself a flex ROW holding a label, the three theme
         buttons and the skin picker side by side — which is why width:100%
         on the select did nothing: it was a flex item sharing 302px with two
         siblings and came out 131 wide. In the sheet these are two separate
         settings and each gets its own line. */
      '#ncbar #nc-themerow,#ncbar #genzwrap{display:flex;flex-direction:column;' +
        'align-items:stretch;gap:8px}' +
      '#ncbar #nc-themerow .nc-themerow{width:100%;display:flex}' +
      '#ncbar #nc-themerow .nc-themerow button{flex:1 1 0;min-height:44px}' +
      '#ncbar #genzToggle{width:100%}' +
      '#ncbar #genzToggle > div{flex:1 1 0;text-align:center;min-height:44px;' +
        'display:flex;align-items:center;justify-content:center}' +
      /* width:auto is what the desktop rule needs; in the sheet the select
         should fill the row, so both the width and the cap are overridden. */
      '#ncbar select{width:100% !important;max-width:none;font-size:.9rem;' +
        'min-height:44px;padding:10px 30px 10px 12px}' +
      /* The button itself. 40px square, and it sits in the bar where the
         controls used to start. */
      '#ncgear{display:flex;align-items:center;justify-content:center;' +
        'width:40px;height:40px;flex:0 0 auto;padding:0;border-radius:11px;' +
        'cursor:pointer;color:var(--nc-text,inherit);' +
        'background:var(--nc-card,rgba(255,255,255,.05));' +
        'border:1px solid var(--nc-line2,rgba(255,255,255,.15))}' +
      '#ncbar.ncset-open #ncgear{background:var(--nc-cyan,#00F0FF);color:#04121a;' +
        'border-color:transparent}' +
      '#ncgear svg{width:20px;height:20px;display:block}' +
      /* The brand can breathe now: it is the reason for all of the above. */
      '#ncbar #ncbrand{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' +
        'min-width:0;flex:0 1 auto}}' +
    /* Reserving the bar's height is the strip's breakpoint, not the sheet's.
       Above 760 there are rules further up that offset .content/.shell/.main
       instead, and doing both puts the page 104px down. */
    '@media (max-width:760px){body{padding-top:' + NC_BAR_H + 'px}}' +
    /* Wide enough to lay the controls out flat, so the button that would open
       them has nothing to open. */
    '@media (min-width:1024px){#ncgear{display:none}}' +
    /* The sidebar copy would be a second set of the same three controls. */
    '.sidebar .themewrap{display:none !important}' +

    /* THE TWO BUTTONS THE BAR GAINED.
       Both are square-ish chrome in the same shape as the gear, so the bar
       reads as one row of controls rather than three different ideas. */
    '#ncrail{display:flex;align-items:center;justify-content:center;' +
      'width:36px;height:36px;flex:0 0 auto;padding:0;border-radius:10px;' +
      'cursor:pointer;color:var(--nc-text,inherit);' +
      'background:var(--nc-card,rgba(255,255,255,.05));' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.15))}' +
    '#ncrail svg{width:18px;height:18px;display:block}' +
    '#ncrail:hover{border-color:var(--nc-cyan,#00E5FF)}' +
    /* Pressed means the rail is away. The filled state says which way round
       it is without needing the tooltip, because the icon itself is the same
       shape either way. */
    '#ncrail[aria-pressed="true"]{background:var(--nc-cyan,#00F0FF);color:#04121a;' +
      'border-color:transparent}' +
    /* Below 761px the rail IS the navigation, so the switch that removes it
       is not offered. */
    '@media (max-width:760px){#ncrail{display:none}}' +

    /* Ask Nova sits at the far right of the flat bar, under the corner the
       card opens in. margin-left:auto rather than a spacer element, so it
       still lands right when the controls collapse into the phone sheet and
       the row is only this and the two icons. */
    /* width:auto is load-bearing — see the bar rule above. Without it a page
       with a bare `button { width:100% }` makes this control as wide as the
       screen and pushes the "?" off the edge. */
    '#ncaskbtn{margin-left:auto;display:flex;align-items:center;gap:7px;width:auto;' +
      'flex:0 0 auto;height:36px;padding:0 13px;border-radius:99px;cursor:pointer;' +
      'font:inherit;font-size:.78rem;font-weight:700;letter-spacing:.01em;' +
      'color:var(--nc-text,inherit);' +
      'background:var(--nc-card,rgba(255,255,255,.05));' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.15))}' +
    '#ncaskbtn svg{width:16px;height:16px;display:block;flex:0 0 auto;' +
      'color:var(--nc-cyan,#00E5FF)}' +
    '#ncaskbtn:hover{border-color:var(--nc-cyan,#00E5FF)}' +
    /* The words go before the bar does. Under about 560px the row is the two
       icons and this, and "Ask Nova" is the first thing that can be spared —
       the speech bubble is not ambiguous, and the tooltip and aria-label both
       still say it in full. */
    '@media (max-width:560px){#ncaskbtn{padding:0;width:36px;justify-content:center}' +
      '#ncaskbtn span{display:none}}' +
    /* The "?" beside it, in the same shape as the rail switch so the bar's
       three icons read as one set. margin-left:0 because Ask Nova has already
       taken the free space with its auto. */
    '#ncguidebtn{margin-left:0;display:flex;align-items:center;justify-content:center;' +
      'width:36px;height:36px;flex:0 0 auto;padding:0;border-radius:10px;cursor:pointer;' +
      'font:inherit;font-size:1rem;font-weight:800;line-height:1;' +
      'color:var(--nc-text,inherit);' +
      'background:var(--nc-card,rgba(255,255,255,.05));' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.15))}' +
    '#ncguidebtn:hover{border-color:var(--nc-cyan,#00E5FF)}' +
    /* The seventy lines that stood here placed the Jarvis pill in the bar's
       reserved gap, across four width bands, and docked its sheet under the
       bar. Every selector in them read `.jr-pill` or `.jr-sheet`, and both
       elements were built by jarvis.js — which is deleted. Rules that can
       never match are still parsed and still shipped on every page, and the
       comments around them described a collision with a file no longer here,
       which is worse than the bytes: the next person to read this would go
       looking for it. The bar keeps the gap; nothing sits in it now. */
    /* The coins badge and the Pro badge are already at the far right of the
       strip's height, so they read as part of the bar rather than fighting it —
       they only need centring against it. */
    '#ncpts{top:' + Math.round((NC_BAR_H - 32) / 2) + 'px}' +
    /* PRINTING.
       Everything nova.js pins to the viewport is screen furniture: the top
       bar, the settings cog, the coins badge, the corner button, the toast,
       the Nova pill and the cookie banner. On paper they are stamped wherever
       they happened to be sitting — measured, a printed copy of the terms had
       a cog over the first heading and a coin count in the top corner of
       every page.

       It lives here rather than in the two pages that get printed because
       nova.js is what puts these on the page, so nova.js is what should take
       them off it. Every page gets a printable version for free, and a new
       piece of furniture added later only has to be hidden once. */
    '@media print{#ncbar,#ncgear,#ncpts,#ncst,#nctoast,#nccookie,' +
      '.nca,.sidebar,.nc-sidebar{display:none !important}' +
      'body{padding-top:0 !important}}';
  document.head.appendChild(css);

  bar = document.createElement('div');
  bar.id = 'ncbar';
  const inner = document.createElement('div');
  inner.className = 'themewrap';              // what the two builders look for
  bar.appendChild(inner);

  /* PUT THE RAIL AWAY, BRING IT BACK.
     First in the bar, because the bar's left edge IS the rail's right edge on
     a desktop — the button sits exactly where the thing it controls stops.
     Hidden below 761px by the stylesheet above: down there the rail is the
     bottom strip and it is the only navigation there is. */
  const railBtn = document.createElement('button');
  railBtn.id = 'ncrail';
  railBtn.type = 'button';
  railBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"></rect>' +
    '<path d="M9 4v16"></path>' +
    '</svg>';
  railBtn.addEventListener('click', function (e) { e.stopPropagation(); ncToggleRail(); });
  bar.insertBefore(railBtn, inner);

  /* THE ONE BUTTON THE PHONE SHEET HANGS OFF.
     Built on every screen and hidden by CSS above 760px, rather than built
     conditionally — the bar is made once at parse time and a phone that is
     rotated, or a desktop window dragged narrow, would otherwise be left
     with a sheet and nothing to open it. It is in the DOM before .themewrap
     is filled, so it keeps its place at the left of the bar whatever the two
     builders and the adoption pass below put in there. */
  const gear = document.createElement('button');
  gear.id = 'ncgear';
  gear.type = 'button';
  gear.setAttribute('aria-label', 'Appearance and language');
  gear.setAttribute('aria-expanded', 'false');
  gear.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="3"></circle>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' +
    '</svg>';
  gear.addEventListener('click', function (e) {
    e.stopPropagation();
    const open = bar.classList.toggle('ncset-open');
    gear.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  bar.insertBefore(gear, inner);

  /* Anywhere else closes it. `mousedown` and not `click`, so a tap that
     starts outside the sheet closes it before whatever it landed on runs —
     otherwise the first tap on a page behind the sheet is spent shutting it.
     Taps inside the sheet are exempt: choosing a language is one tap, and
     the select's own dropdown counts as inside. */
  document.addEventListener('mousedown', function (e) {
    if (!bar.classList.contains('ncset-open')) return;
    if (inner.contains(e.target) || gear.contains(e.target)) return;
    bar.classList.remove('ncset-open');
    gear.setAttribute('aria-expanded', 'false');
  }, true);
  /* Escape closes it too — it is a menu, and that is what menus do. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !bar.classList.contains('ncset-open')) return;
    bar.classList.remove('ncset-open');
    gear.setAttribute('aria-expanded', 'false');
    gear.focus();
  });

  /* ASK NOVA, ON PURPOSE.
     The card still arrives on its own three seconds into a visit, but that is
     one moment and a reader who was reading something else at the time had no
     way back to it. This is that way back, and it is at the RIGHT end of the
     bar because that is where the card opens — a button on one side of the
     screen opening a panel on the other is a small puzzle nobody should have
     to solve.

     It resolves NC_ASK at click time rather than holding a reference: this
     file is a plain script and nova-ask.js is deferred, so nova-ask.js has not
     run yet when this button is built. If for any reason it never arrives, the
     button says so instead of doing nothing. */
  const askBtn = document.createElement('button');
  askBtn.id = 'ncaskbtn';
  askBtn.type = 'button';
  askBtn.title = 'Ask Nova what to do';
  askBtn.setAttribute('aria-label', 'Ask Nova what to do');
  askBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"></path>' +
    '</svg><span data-t="asknova">Ask Nova</span>';
  askBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (window.NC_ASK && window.NC_ASK.open) window.NC_ASK.open();
    else toast('The assistant has not loaded on this page.');
  });
  bar.appendChild(askBtn);

  /* HOW DO I USE THIS PAGE?
     nova-guide.js has a written walkthrough for twenty-four pages — local,
     instant, and working with the network off, which is the whole reason the
     steps are written down rather than asked of a model. It used to hang off
     the Jarvis pill; that file is deleted, so the button lives here now,
     beside the assistant it hands off to.

     Built even when nova-guide.js is missing, and says so if pressed. A "?"
     that silently does nothing is worse than no "?" at all. */
  const guideBtn = document.createElement('button');
  guideBtn.id = 'ncguidebtn';
  guideBtn.type = 'button';
  guideBtn.textContent = '?';
  guideBtn.title = 'How do I use this page?';
  guideBtn.setAttribute('aria-label', 'How do I use this page?');
  guideBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    /* The button asks "how do I use THIS PAGE?", so nova-guide.js answers it —
       it has the written detail for twenty-four pages. The site tour in
       nova-instructions.js answers a different question, "what is this site?",
       and it shows itself once on a first visit.

       The tour is the fallback rather than the first choice, so that a page
       nova-guide.js has never heard of still has something behind the "?"
       instead of a toast apologising. */
    if (window.ncGuide && window.ncGuide.show) { window.ncGuide.show(); return; }
    if (window.NC_HOWTO && window.NC_HOWTO.open(true)) return;
    toast('The page guide has not loaded on this page.');
  });
  bar.appendChild(guideBtn);

  document.body.insertBefore(bar, document.body.firstChild);

  /* Bring the page's own language picker across, label and all. */
  const old = document.querySelector('.sidebar .themewrap');
  if (old) while (old.firstChild) inner.appendChild(old.firstChild);

  /* ADOPT ANYTHING ALREADY BUILT.
     The Gen Z toggle boots from its own DOMContentLoaded listener, and on a
     page where nova.js is parsed after the document is ready that listener
     never waits — it runs at parse time, before this bar exists, and mounts
     into the corner box instead. The editor was doing exactly that. Rather
     than depend on an ordering that is not ours to guarantee, take back
     whatever landed elsewhere. */
  ['#genzwrap', '#nc-themerow'].forEach(function (sel) {
    const el = document.querySelector(sel);
    if (el && !bar.contains(el)) inner.appendChild(el);
  });
  const stray = document.getElementById('ncLangPick');
  if (stray && !bar.contains(stray)) inner.appendChild(stray.parentElement || stray);

  ncBuildBurger(bar);
  ncPhoneUI(bar);
  ncEscapeHatch(bar);

  return inner;
}

/* ============================================================================
   THE PHONE LAYER
   ============================================================================
   Everything below 760px, in one place, because the alternative is the same
   fix pasted into thirty-four pages and forgotten on the thirty-fifth.

   WHAT WAS ACTUALLY WRONG, MEASURED ON A 390px SCREEN

   Five controls in the top bar — settings, ask, help, menu, coins — on a strip
   narrow enough that the coin pill and the menu button had 17px between them.

   Two bars, not one, on the pages that bring their own header. Studio stacked
   nova.js's 52px bar on top of its own 60px one and then showed the points
   total twice, with the two copies disagreeing: 100 in its header, 0 in the
   badge. Socials did the same with its toolbar.

   Decoration landing on words. index.html floats three YouTube cards over the
   hero; on a phone one sits on the eyebrow text and another hangs 18px off the
   right-hand edge. They are positioned for a 1440px canvas and nothing told
   them the canvas had moved.

   Pages five to eleven screens long, because the line height, the section
   padding and the card spacing are all tuned for a desktop column.

   WHAT THIS DOES ABOUT IT

   Three things in the bar, not five: the wordmark, the coins, the menu. The
   settings, ask and help buttons move into the menu sheet, where there is room
   to label them — an icon nobody can name is not a control, and "?" next to
   "gear" next to "speech bubble" was three unlabelled icons in a row.

   One coin total. The badge is repositioned rather than duplicated, because
   addPts() and the sync both find it by id and a second copy would go stale.

   No decorative overlay on a phone, and no second header.
   ============================================================================ */
function ncPhoneUI(bar) {
  if (NC_EMBED) return;
  if (document.getElementById('ncphone-css')) return;

  /* The wordmark. The left third of the bar was empty on a phone once the
     gear moved out, and an empty third at the top of every page is where the
     name of the site belongs.

     CALLED ncbarbrand, NOT ncbrand, AND THAT MATTERS.
     ncBrand() further down this file already owns #ncbrand — the logo and
     wordmark at the top of the sidebar. Using the same id here meant the guard
     found the sidebar's copy, decided the job was done, and never built this
     one; the bar came up with no wordmark on every page that has a sidebar,
     and worked on Studio only because Studio has no .sidebar for ncBrand() to
     fill. A distinct id is the whole fix. */
  if (!document.getElementById('ncbarbrand')) {
    const b = document.createElement('a');
    b.id = 'ncbarbrand';
    b.href = 'index.html';
    b.textContent = 'NovaClip';
    bar.insertBefore(b, bar.firstChild);
  }

  const css = document.createElement('style');
  css.id = 'ncphone-css';
  css.textContent =
    '#ncbarbrand{display:none;text-decoration:none;font:800 1.02rem/1 system-ui,sans-serif;' +
      'letter-spacing:-.02em;color:var(--nc-text,#EAF2FF);flex:0 0 auto;padding:6px 2px}' +

    '@media (max-width:760px){' +

      /* ---- 1. THE BAR: THREE THINGS ---------------------------------- */
      '#ncbarbrand{display:block}' +
      '#ncbar{padding:0 12px !important;gap:10px}' +
      /* Moved into the sheet, where they get words next to them. */
      '#ncbar #ncgear,#ncbar #ncaskbtn,#ncbar #ncguidebtn{display:none !important}' +
      /* The wordmark takes the slack so coins and menu sit hard right. */
      '#ncbarbrand{margin-right:auto}' +

      /* ---- 2. ONE COIN TOTAL, ALWAYS IN THE SAME PLACE --------------- */
      /* html body raises this over the per-page rules that were moving the
         badge around — Studio had it pinned to the bottom-right corner, on top
         of the page, while its own header showed a different number. */
      /* Kept fixed, not made static: the badge is a child of <body>, so
         position:static drops it into the page flow rather than into the bar
         and it disappears off the top of the document. Pinned into the bar's
         row instead — left of the menu button, clear of the wordmark. */
      'html body #ncpts{position:fixed !important;top:' + Math.round((NC_BAR_H - 34) / 2) + 'px !important;' +
        'right:62px !important;left:auto !important;bottom:auto !important;' +
        'margin:0 !important;padding:7px 12px !important;height:34px !important;' +
        'display:flex !important;align-items:center;box-sizing:border-box;' +
        'font-size:.86rem !important;box-shadow:none !important;' +
        'border-radius:99px !important;white-space:nowrap;z-index:991}' +

      /* ---- 3. NO SECOND HEADER -------------------------------------- */
      /* Every one of these is a page's own top bar carrying a logo, a menu
         button and a points total that the site bar two pixels above it is
         already showing. Their real controls are reachable from the menu. */
      'html body .nc-topbar{display:none !important}' +

      /* ---- 4. DECORATION STAYS OFF THE WORDS ------------------------- */
      /* Positioned for a wide canvas, and there is no sane phone position for
         a thing whose whole job is to float in the margin — on 390px there is
         no margin. The orbs and the starfield stay: they sit behind the text
         at z-index 0 or below and cannot collide with it. */
      'html body .ytfloat{display:none !important}' +

      /* ---- 5. READABLE, AND SHORTER --------------------------------- */
      /* The body copy was set at desktop line-height on a column a third as
         wide, which is what made a page of four paragraphs three screens long.
         Floors rather than fixed sizes, so a page that already chose something
         sensible keeps it. */
      /* A 15px floor. Measured, not guessed: the tools shelf was setting body
         copy at 0.8rem, which is 12.8px — the smallest text on the site, on the
         smallest screen, describing what each of ten thousand tools does.
         max(15px,1em) lifts anything that shrank below the floor and leaves
         anything already at or above it alone. */
      /* !important, deliberately. A bare `p` selector loses to any page rule
         with a class in it, and the tools shelf has exactly that — which is
         why the first attempt at this floor changed the colour and left the
         size at 12.8px. A minimum readable size on a phone is not something
         an individual page gets to undercut. */
      'p,li{font-size:max(15px,1em) !important;line-height:1.5}' +

      /* Secondary text was #7E8AA6 everywhere. That holds up over the dark part
         of a page and collapses over the light middle of the hero gradients,
         which is exactly where the home page puts its explanatory copy. Lifted
         on the dark theme, darkened on the light one — the same token, moved
         away from the middle in whichever direction the background is. */
      ':root:not([data-theme="light"]){--nc-dim:#A7B2CC}' +
      ':root[data-theme="light"]{--nc-dim:#4A5568}' +

      'section,header{padding-top:min(6vh,44px);padding-bottom:min(6vh,44px)}' +

      /* ---- 6. NOTHING RUNS OFF THE RIGHT ----------------------------- */
      /* Chip rows are the usual culprit: a row of filters laid out for a wide
         screen puts its last chip past the edge, where it cannot be reached
         because the page itself does not scroll sideways. */
      'html body .chips,html body .filters,html body .tabs,html body .pills{' +
        'flex-wrap:wrap}' +

    '}';
  document.head.appendChild(css);

  /* The three controls the bar gave up, rebuilt in the sheet. They click the
     originals rather than reimplementing them, so there is still exactly one
     copy of what each button does. */
  window.NC_PHONE_EXTRAS = [
    ['ncgear', 'Settings', 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z' +
      'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33' +
      ' 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33' +
      'l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09' +
      'A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6' +
      'h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06' +
      'a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09' +
      'a1.65 1.65 0 0 0-1.51 1z'],
    ['ncaskbtn', 'Ask Nova', 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7' +
      'a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'],
    ['ncguidebtn', 'How this works', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01']
  ];
}

/* ============================================================================
   THE PHONE MENU
   ============================================================================
   On a phone the rail stops being a rail. It used to become a 64px strip
   docked along the bottom, holding all fourteen links behind a sideways
   scroll — which meant the navigation was a thing you had to swipe through to
   read, on the device where swiping past something is how you lose it. It also
   ate 74px of every page forever to show four icons at a time.

   So below 760px there is no strip. There is a button, and behind the button
   there are six things:

     Studio · Socials · Games · Family · Pricing · Profile

   Six, not fourteen. A phone menu that needs scrolling has the same problem
   the strip had. These are the six somebody actually opens; everything else on
   the site is reachable from inside them, and the full rail is still there the
   moment the screen is wide enough to hold it.

   The list is hrefs rather than a second copy of the labels: the entries are
   looked up in NC_NAV, so the wording, the icon and the twenty translations
   stay in one place. Rename Studio there and it renames here. */
const NC_PHONE_NAV = [
  'trends.html', 'socials.html', 'game.html',
  'parent.html', 'pricing.html', 'profile.html'
];

function ncPhoneItems() {
  const flat = [];
  NC_NAV.forEach(g => (g.items || []).forEach(i => flat.push(i)));
  /* Mapped in the order written above, not the order of the rail — this is a
     shortlist with its own priorities, and Profile belongs at the end of it
     rather than buried in the middle where NC_NAV keeps it. */
  return NC_PHONE_NAV
    .map(href => flat.find(i => i[0] === href))
    .filter(Boolean);
}

function ncBuildBurger(bar) {
  if (NC_EMBED) return;
  if (document.getElementById('ncburger')) return;

  const css = document.createElement('style');
  css.id = 'ncburger-css';
  css.textContent =
    /* The button is the only part that lives in the bar. */
    '#ncburger{display:none;align-items:center;justify-content:center;flex:0 0 auto;' +
      'width:40px;height:40px;padding:0;border-radius:11px;cursor:pointer;' +
      'background:none;color:var(--nc-text,#EAF2FF);' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.16))}' +
    '#ncburger span{display:block;width:19px;height:2px;border-radius:2px;background:currentColor;' +
      'box-shadow:0 -6px 0 currentColor,0 6px 0 currentColor}' +

    '@media (max-width:760px){' +
      '#ncburger{display:flex}' +
      /* NO STRIP. The geometry rules further up this file set the rail to
         display:flex !important on a phone, so this needs both the !important
         and the extra specificity of `html body` to actually win — same
         importance and same specificity would come down to source order, and
         source order between two injected stylesheets is not something worth
         depending on. */
      'html body .sidebar{display:none !important}' +
      /* And the 74px that was reserved for it goes back to the page. */
      'html body:has(.sidebar){padding-bottom:0 !important}' +
    '}' +

    /* ---- the sheet ---------------------------------------------------- */
    '#ncsheet{position:fixed;inset:0;z-index:99994;display:flex;flex-direction:column;' +
      'background:var(--nc-bg,#0A0D18);color:var(--nc-text,#EAF2FF);' +
      'padding:0 20px env(safe-area-inset-bottom,18px);overflow-y:auto}' +
    '#ncsheet[hidden]{display:none}' +
    '#ncsheet .nsh{display:flex;align-items:center;justify-content:space-between;' +
      'height:' + NC_BAR_H + 'px;flex:0 0 auto}' +
    '#ncsheet .nsh b{font:800 1rem/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;' +
      'color:var(--nc-cyan,#00E5FF)}' +
    '#ncsheet .nsx{width:40px;height:40px;border-radius:11px;cursor:pointer;font-size:22px;line-height:1;' +
      'background:none;color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.16))}' +
    '#ncsheet nav{display:flex;flex-direction:column;justify-content:center;flex:1 1 auto;' +
      'gap:2px;padding:8px 0 24px}' +
    '#ncsheet a{display:flex;align-items:center;gap:16px;text-decoration:none;color:inherit;' +
      'padding:15px 6px;border-radius:14px;' +
      'font:700 1.6rem/1.15 system-ui,sans-serif;letter-spacing:-.02em}' +
    '#ncsheet a .nci{width:23px;height:23px;flex:0 0 auto;opacity:.75}' +
    /* The page's own routes, set apart by a hairline rather than a heading —
       they are the same kind of thing as the rows above and do not need a
       label to say so. */
    '#ncsheet .nsgrp{display:flex;flex-direction:column;margin-top:10px;padding-top:10px;' +
      'border-top:1px solid var(--nc-line,rgba(255,255,255,.12))}' +
    '#ncsheet a.on{color:var(--nc-cyan,#00E5FF)}' +
    '#ncsheet a.on .nci{opacity:1}' +
    '#ncsheet a:active{background:var(--nc-card,rgba(255,255,255,.06))}' +
    /* A short phone with the browser chrome up has about 500px of room. Six
       rows at 1.6rem plus the header just fits; below that the type steps
       down rather than the last row falling off the bottom. */
    /* The secondary row. Quieter than the six destinations above it:
       these are settings, not places you are going. */
    '#ncsheet .nsx2{display:flex;flex-wrap:wrap;gap:8px;flex:0 0 auto;padding:14px 0 22px;' +
      'border-top:1px solid var(--nc-line,rgba(255,255,255,.14))}' +
    '#ncsheet .nsx2 button{display:flex;align-items:center;gap:9px;cursor:pointer;' +
      'padding:11px 15px;border-radius:12px;font:600 .98rem/1 system-ui,sans-serif;' +
      'background:var(--nc-card,rgba(255,255,255,.06));color:inherit;' +
      'border:1px solid var(--nc-line,rgba(255,255,255,.14))}' +
    '#ncsheet .nsx2 svg{width:17px;height:17px;flex:0 0 auto;opacity:.75}' +
    '@media (max-height:620px){#ncsheet a{font-size:1.3rem;padding:12px 6px}' +
      '#ncsheet .nsx2 button{padding:9px 12px;font-size:.9rem}}' +
    '@media (prefers-reduced-motion:no-preference){' +
      '#ncsheet nav a{animation:ncsIn .26s ease backwards}' +
      '@keyframes ncsIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}}';
  document.head.appendChild(css);

  const btn = document.createElement('button');
  btn.id = 'ncburger';
  btn.type = 'button';
  btn.title = 'Menu';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span>';
  bar.appendChild(btn);

  let sheet = null;

  function close() {
    if (!sheet) return;
    sheet.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    try { document.documentElement.style.overflow = ''; } catch (e) {}
    btn.focus();
  }

  function open() {
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'ncsheet';
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.setAttribute('aria-label', 'Menu');
      document.body.appendChild(sheet);
    }
    sheet.innerHTML =
      '<div class="nsh"><b>NovaClip</b>' +
        '<button type="button" class="nsx" aria-label="Close menu">&times;</button></div>' +
      '<nav>' +
        ncPhoneItems().map(([href, label, key, icon], i) => {
          const on = href.toLowerCase() === here;
          return '<a href="' + href + '"' + (on ? ' class="on" aria-current="page"' : '') +
                 ' style="animation-delay:' + (i * 32) + 'ms">' + ncIcon(icon) +
                 '<span class="nct"' + (key ? ' data-t="' + key + '"' : '') + '>' + label + '</span></a>';
        }).join('') +
        /* WHAT THE PAGE ITSELF NAVIGATES TO, WHEN THAT LIVES SOMEWHERE THIS
           MENU CANNOT SEE.
           The rule further up that hides a page's own second header says
           "their real controls are reachable from the menu". On Studio that
           was not true. Its rail is the app's own .nc-sidebar, hidden below
           900px by the bundle, and the burger that opens the drawer version of
           it sits in the .nc-topbar this site hides — so on a phone, Photo,
           Hype Lab and the analytics panel could not be reached at all, and
           from inside any panel there was no way back to Studio home short of
           the browser's back button.

           A page sets NC_PHONE_ROUTES and its own routes appear here, under
           the site's own, in a group of their own. Empty everywhere else, so
           this is one `if` on every other page. */
        (function () {
          var extra = window.NC_PHONE_ROUTES;
          if (!extra || !extra.length) return '';
          return '<div class="nsgrp">' +
            extra.map(function (r, i) {
              var on = r.href === location.hash;
              return '<a href="' + r.href + '"' + (on ? ' class="on" aria-current="page"' : '') +
                ' style="animation-delay:' + ((ncPhoneItems().length + i) * 32) + 'ms">' +
                '<svg class="nci" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<path d="' + r.path + '"/></svg>' +
                '<span class="nct">' + r.label + '</span></a>';
            }).join('') + '</div>';
        })() +
      '</nav>' +
      /* THE THREE THE BAR GAVE UP.
         Settings, Ask Nova and the page guide were three unlabelled icons in a
         row at the top of a 390px screen. Down here they have their names next
         to them, which is the only reason a phone user knows what any of them
         is. Rendered only where the original button exists, so a page without
         a guide does not advertise one. */
      '<div class="nsx2">' +
        (window.NC_PHONE_EXTRAS || []).filter(function (x) { return document.getElementById(x[0]); })
          .map(function (x) {
            return '<button type="button" data-proxy="' + x[0] + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
              'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + x[2] + '"/></svg>' +
              x[1] + '</button>';
          }).join('') +
      '</div>';
    sheet.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    /* The sheet covers the page; letting the page keep scrolling underneath it
       is how you close a menu and find yourself somewhere else. */
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
    sheet.querySelector('.nsx').onclick = close;
    /* A HASH LINK DOES NOT NAVIGATE, SO NOTHING WOULD CLOSE THIS.
       The site's own rows go to another page and the menu dies with it. The
       page's own routes change only the hash, so without this the sheet stays
       up, full screen, over the panel it just opened — which looks exactly
       like the link doing nothing. */
    [].forEach.call(sheet.querySelectorAll('.nsgrp a'), function (a) {
      a.onclick = function () { close(); };
    });
    /* Close first, then press the real control — several of them open a panel
       of their own, and opening one underneath a full-screen menu is the same
       as it not working. */
    [].forEach.call(sheet.querySelectorAll('[data-proxy]'), function (b) {
      b.onclick = function () {
        const target = document.getElementById(b.getAttribute('data-proxy'));
        close();
        if (target) setTimeout(function () { target.click(); }, 60);
      };
    });
    const first = sheet.querySelector('nav a');
    if (first) first.focus();
    if (typeof applyLangText === 'function') { try { applyLangText(); } catch (e) {} }
  }

  btn.onclick = function (e) {
    e.stopPropagation();
    (sheet && !sheet.hidden) ? close() : open();
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet && !sheet.hidden) close();
  });
  /* Back to a wide screen with the sheet still up would leave a full-screen
     panel over a page that has its rail back. */
  addEventListener('resize', function () {
    if (innerWidth > 760 && sheet && !sheet.hidden) close();
  }, { passive: true });
}

/* ============================================================================
   THE SITE TOUR
   ============================================================================
   nova-instructions.js is four screens explaining what NovaClip is, shown once
   on a first visit. It used to be five separate per-page walkthroughs, each
   loaded by its own <script> tag on its own page, which meant a newcomer met a
   new modal every time they arrived somewhere and never got told what the site
   was for.

   Loaded from here rather than from a tag on every page. It is one tour for
   the whole site and nova.js is the one file every page already has, so the
   alternative was thirty-five identical script tags and a thirty-sixth page
   shipping one day without one. It also keeps the hand-deploy honest: this
   file and that file go together, and nothing else has to.

   Failing to load is not an error worth reporting. The tour is orientation, so
   a visitor who never sees it has missed a nicety, not a feature — and the "?"
   falls back to nova-guide.js either way. */
function ncLoadTour() {
  if (NC_EMBED) return;
  if (window.NC_HOWTO || document.getElementById('nc-tour-js')) return;
  const s = document.createElement('script');
  s.id = 'nc-tour-js';
  s.src = 'nova-instructions.js';
  s.defer = true;
  document.head.appendChild(s);
}

/* ============================================================================
   A WAY OFF EVERY PAGE
   ============================================================================
   aim.html, flap.html and reaction.html had no link on them. Not a small rail,
   not a hidden one — zero anchors to another page, at every width. The only
   way out of the target game was the browser's back button, and on an
   installed PWA there is no browser back button. They went unnoticed because
   none of the three was in the width sweep's page list, so the check that
   exists precisely to catch this had never once looked at them.

   Fixing three pages by hand would leave the fourth to be found the same way,
   so the rule lives here instead: if a page has no visible link to another
   page of this site, it gets one. Pages with a rail, a back link or a footer
   already pass and are not touched — the test is the same one the sweep runs.

   Deliberately not on a timer and not repeated. A page that fills itself in
   later (the games do) never REMOVES its links, and re-running this on a
   MutationObserver is how fixRail() once fed itself into a 110-second load. */
function ncEscapeHatch(bar) {
  if (NC_EMBED) return;
  if (document.querySelector('.sidebar, .nc-sidebar')) return;   /* has a rail */

  const wayOut = [...document.querySelectorAll('a[href]')].some(a => {
    const href = a.getAttribute('href') || '';
    if (!/\.html(\?|#|$)/.test(href) || /^https?:/.test(href)) return false;
    const r = a.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cs = getComputedStyle(a);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  });
  if (wayOut) return;

  const out = document.createElement('a');
  out.id = 'ncwayout';
  out.href = 'index.html';
  out.innerHTML =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M15 18l-6-6 6-6"/></svg><span>NovaClip</span>';
  out.title = 'Back to NovaClip';
  const css = document.createElement('style');
  css.textContent =
    '#ncwayout{display:flex;align-items:center;gap:5px;text-decoration:none;color:inherit;' +
      'font:700 .84rem/1 system-ui,sans-serif;padding:8px 11px;border-radius:10px;' +
      'border:1px solid var(--nc-line,rgba(255,255,255,.16));flex:0 0 auto;min-height:36px}' +
    '#ncwayout:hover{border-color:var(--nc-cyan,#00E5FF)}' +
    /* On the narrowest phone the bar is already carrying a settings button and
       a coin badge; the word goes and the chevron stays, because a control
       that has fallen off the side is the bug this is fixing. */
    '@media (max-width:400px){#ncwayout span{display:none}#ncwayout{padding:8px}}';
  document.head.appendChild(css);
  bar.insertBefore(out, bar.firstChild);
}

function ncBuildThemeSwitch() {
  if (NC_EMBED) return;
  if (document.getElementById('nc-themerow')) return;
  const host = document.querySelector('.themewrap');
  if (!host) return;

  const wrap = document.createElement('div');
  wrap.id = 'nc-themerow';
  wrap.style.marginBottom = '14px';
  const label = document.createElement('label');
  label.setAttribute('data-t', 'theme');
  label.style.cssText = 'display:block;font-size:0.78rem;opacity:0.6;margin-bottom:6px;';
  label.textContent = tr('theme');
  const row = document.createElement('div');
  row.className = 'nc-themerow';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', tr('theme'));

  const pref = ncThemePref();
  ['light', 'system', 'dark'].forEach(k => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nc-themebtn' + (k === pref ? ' on' : '');
    b.dataset.theme = k;
    b.setAttribute('aria-pressed', String(k === pref));
    b.setAttribute('title', tr('theme_' + k));
    b.setAttribute('aria-label', tr('theme_' + k));
    b.innerHTML = NC_THEME_ICONS[k];
    b.addEventListener('click', () => ncSetTheme(k));
    row.appendChild(b);
  });

  /* THE CYBER THEMES, AS ONE DROPDOWN
     They were twelve swatches in a row. That made the theme block 638px wide,
     pushed the top bar into horizontal scrolling, and put twelve small targets
     where one would do. A <select> is the same control the language picker
     uses, so the bar now has two dropdowns that behave identically instead of
     one dropdown and a wall of chips.

     The three icon buttons stay: light, auto and dark are the ones people
     actually switch between, and they are one press rather than two. They and
     this list are now two independent controls — the buttons say which side of
     the site you are on, the list says which colours it wears, and neither
     cancels the other. It used to: choosing a cyber theme wrote over "light",
     so all twelve were dark themes whether or not you read on a white page. */
  const skinSel = document.createElement('select');
  skinSel.id = 'nc-skinpick';
  skinSel.setAttribute('aria-label', tr('ui_skin_none'));
  const skinOn = ncSkinPref();
  /* data-t on every option, not only the first, so switching language relabels
     the whole list in place. The names come from the table as skin_<id>; the
     English in NC_SKINS is the fallback for a language with no entry, so a
     missing translation shows the name rather than an empty row. */
  skinSel.innerHTML = '<option value="" data-t="ui_skin_none">' + tr('ui_skin_none') + '</option>' +
    NC_SKINS.map(sk => '<option value="' + sk.id + '" data-t="skin_' + sk.id + '"' +
      (sk.id === skinOn ? ' selected' : '') + '>' + (tr('skin_' + sk.id) || sk.name) +
      '</option>').join('');
  skinSel.addEventListener('change', () => {
    /* Off leaves the theme alone as well: none means plain light or plain
       dark, whichever you were already on. */
    ncSetSkin(skinSel.value);
  });

  if (!document.getElementById('nc-skinrow-css')) {
    const css = document.createElement('style');
    css.id = 'nc-skinrow-css';
    css.textContent =
      '#nc-skinpick{margin-top:8px;width:100%;min-height:44px;border-radius:10px;padding:6px 10px;' +
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:var(--nc-text,#EAF2FF);' +
        'border:1px solid var(--nc-line,rgba(255,255,255,.14));font:inherit;font-size:.86rem;cursor:pointer}' +
      '#ncbar #nc-skinpick{margin-top:0;width:auto;max-width:170px}' +
      '#ncbar #nc-themerow{display:flex;align-items:center;gap:10px;margin-bottom:0}' +
      '#ncbar #nc-themerow > label{margin-bottom:0}' +
      /* In the bar these two are squeezed into a strip beside everything
         else. In the phone sheet they are a settings list and each one has
         a line to itself, so the widths that keep the bar in order are the
         wrong ones. Both carry an id, which outranks the `#ncbar select`
         rule doing the same job over in the bar's own stylesheet — this is
         where the override has to be to reach them. */
      '@media (max-width:1023px){' +
        '#ncbar #nc-skinpick{width:100%;max-width:100%}' +
        '#ncbar #nc-themerow{flex-direction:column;align-items:stretch;gap:8px}}';
    document.head.appendChild(css);
  }

  wrap.append(label, row, skinSel);
  host.insertBefore(wrap, host.firstChild);
}


/* ============================================================================
   MOTION
   ============================================================================
   One sheet for the whole site, so the timings cannot drift between pages.

   Three rules it follows:

     Transform and opacity only. Those are the two properties a browser can
     animate on the compositor without touching layout or paint, so they hold
     60fps on a phone. Animating height, top or margin does not.

     Nothing animates for longer than it takes to read. Entrances are 420ms,
     hovers 160ms. Anything slower stops feeling like polish and starts
     feeling like waiting.

     prefers-reduced-motion turns all of it off. That setting is often set by
     people who get motion sickness or migraines from parallax and drifting
     panels, so it is honoured completely rather than merely shortened — and
     because the reveal below starts elements at opacity 0, the reduced-motion
     branch has to put them back to 1 or the page would be blank.
   --------------------------------------------------------------------------- */
const ncMotionStyle = document.createElement('style');
ncMotionStyle.id = 'nc-motion-css';
ncMotionStyle.textContent =

/* ---- entrances ---- */
"@keyframes nc-rise{from{opacity:0;transform:translate3d(0,14px,0)}to{opacity:1;transform:none}}" +
"@keyframes nc-fade{from{opacity:0}to{opacity:1}}" +
"@keyframes nc-pop{0%{opacity:0;transform:scale(.94)}60%{opacity:1;transform:scale(1.01)}100%{transform:scale(1)}}" +
"@keyframes nc-sweep{from{background-position:200% 0}to{background-position:-200% 0}}" +
"@keyframes nc-pulse{0%,100%{opacity:.55}50%{opacity:1}}" +

/* The page itself, on arrival. Short and only opacity, so it cannot fight
   whatever the page does with its own layout. */
"body{animation:nc-fade .3s ease both}" +

/* ---- scroll reveal ----
   Elements are marked by script (never by CSS alone), so a page whose script
   fails never ends up with permanently invisible content. */
".nc-reveal{opacity:0;transform:translate3d(0,16px,0)}" +
".nc-reveal.nc-in{animation:nc-rise .42s cubic-bezier(.22,.7,.3,1) both}" +

/* ---- hover ----
   Cards lift a little and the shadow deepens with them, which is what makes it
   read as height rather than as the card simply moving. */
"[class*=\"card\"],.tile,.plan,.tool,.clip,.scene{transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}" +
"@media (hover:hover){" +
  "[class*=\"card\"]:hover,.tile:hover,.plan:hover,.tool:hover{transform:translateY(-3px);" +
    "box-shadow:0 14px 34px -18px var(--nc-shadow,rgba(0,0,0,.55))}" +
"}" +

/* Buttons and links. The press is a real 1px dip: without it a click on a
   touchscreen has no feedback until the next page paints. */
"button,.btn,.go,.alt,a.button{transition:transform .14s ease,background-color .16s ease," +
  "border-color .16s ease,color .16s ease,box-shadow .16s ease}" +
"button:active,.btn:active,.go:active,.alt:active{transform:translateY(1px)}" +
"@media (hover:hover){button:not(:disabled):hover,.go:not(:disabled):hover{transform:translateY(-1px)}}" +

/* Rail links slide a hair toward the content they open. */
".sidebar a,.sidebar .navlink{transition:background-color .16s ease,color .16s ease,transform .16s ease}" +
"@media (hover:hover){.sidebar a:hover,.sidebar .navlink:hover{transform:translateX(2px)}}" +

/* ---- focus ----
   One visible ring everywhere, because several pages had none and a keyboard
   user could not tell where they were. */
":focus-visible{outline:2px solid var(--nc-cyan,#00F0FF);outline-offset:2px;border-radius:8px}" +

/* ---- loading ----
   A shimmer for anything the site marks as pending, instead of a dead panel. */
".nc-skel{background:linear-gradient(90deg,var(--nc-card,rgba(255,255,255,.04)) 25%," +
  "var(--nc-card2,rgba(255,255,255,.09)) 37%,var(--nc-card,rgba(255,255,255,.04)) 63%);" +
  "background-size:400% 100%;animation:nc-sweep 1.4s linear infinite;border-radius:10px;color:transparent}" +
".nc-busy{animation:nc-pulse 1.2s ease-in-out infinite}" +

/* Numbers that tick should not also reflow the line they sit on. */
"[data-nc-count]{font-variant-numeric:tabular-nums}" +

"@media (prefers-reduced-motion:reduce){" +
  "*,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;" +
    "transition-duration:.001ms !important;scroll-behavior:auto !important}" +
  /* the reveal starts hidden, so it has to be put back */
  ".nc-reveal,.nc-reveal.nc-in{opacity:1 !important;transform:none !important}" +
  "body{animation:none}" +
"}";
document.head.appendChild(ncMotionStyle);

/* ---------------------------------------------------------------------------
   Reveal on scroll.

   Marks the repeating blocks a page is built from — cards, plans, rows — and
   lets them arrive as they come into view, staggered a little so a grid does
   not snap in as one slab. Anything already on screen at load is revealed
   immediately, otherwise the top of the page would sit invisible waiting for a
   scroll that never comes.
   --------------------------------------------------------------------------- */
function ncReveal() {
  if (NC_EMBED) return;
  let reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduced || !('IntersectionObserver' in window)) return;

  const SEL = '.card, .tile, .plan, .tool, .clip, .scene, .fitem, .row > .box, ' +
              'section > h2, .two > div, .cards > *, .grid > *, .launch button';
  const seen = new WeakSet();

  const io = new IntersectionObserver(entries => {
    /* Stagger by position within this batch, not by index in the document, so
       a long page does not end up with a two-second delay near the bottom. */
    let n = 0;
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.style.animationDelay = Math.min(n++ * 45, 270) + 'ms';
      el.classList.add('nc-in');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  function mark(root) {
    let els;
    try { els = (root || document).querySelectorAll(SEL); } catch (e) { return; }
    els.forEach(el => {
      if (seen.has(el) || el.closest('.sidebar, #ncCorner')) return;
      seen.add(el);
      /* Already in view: show it now rather than animating something the
         reader is looking at. */
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return;
      el.classList.add('nc-reveal');
      io.observe(el);
    });
  }

  mark(document);
  /* Pages that build their content from script — the AI panels, the community
     feed — get marked as it appears. */
  try {
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) mark(n); }));
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
}

/* ---------------------------------------------------------------------------
   Count-up for any number the page tags with data-nc-count. Runs once, when
   the number scrolls into view, and finishes in under a second.
   --------------------------------------------------------------------------- */
function ncCountUp() {
  if (NC_EMBED || !('IntersectionObserver' in window)) return;
  let reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      const to = parseFloat(el.dataset.ncCount || el.textContent.replace(/[^\d.-]/g, ''));
      if (!isFinite(to)) return;
      if (reduced) { el.textContent = String(to); return; }
      const t0 = performance.now(), dur = 900;
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        /* ease-out: fast at the start, so the final value is readable early */
        const v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = to % 1 ? v.toFixed(1) : String(Math.round(v));
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-nc-count]').forEach(el => io.observe(el));
}

/* One corner control, not two.
   The language picker and the vibe switch each appended their own fixed box to
   the bottom-left of any page without a sidebar. They landed on the same
   corner, so they covered each other — and on pricing they sat on top of the
   first plan card, hiding its "Start free trial" button and its last bullet.
   Both now live in one box that stays collapsed behind a small button, so the
   page underneath is never obscured. Returns the body the controls go into. */
/* THE FLOATING CORNER BOX IS GONE.
   It was a globe pinned to the bottom-left of every page, opening a panel with
   the theme, the vibe and the language in it. That panel was built when those
   three had nowhere else to live — before the top bar was on every page. Since
   the bar arrived it has been a SECOND copy of controls already at the top of
   the screen, and in the editor it sat over the tool rail, in the one corner
   that page cannot spare.

   The three things that used to fall back to it now do not mount when there is
   no .themewrap, which happens only inside an embedded frame — and there the
   host page is already wearing all three. */

/* The floating corner picker for pages that were never given one — editor,
   trends, parent and pricing have no #langpick, so without this there was no
   way to switch language on them at all. */
function ncEnsureLangPick() {
  if (NC_EMBED) return;
  if (document.getElementById('langpick')) return;
  if (document.getElementById('ncLangPick')) return;
  const pick = document.createElement('select');
  pick.id = 'ncLangPick';
  for (const c in LANGS) { const o = document.createElement('option'); o.value = c; o.textContent = LANGS[c]; pick.appendChild(o); }
  pick.value = lang();
  pick.onchange = () => applyLang(pick.value);
  /* The header first — it is on every page now, so the corner box is only the
     fallback for the pages the bar deliberately skips (embedded tab hosts). */
  const bar = document.querySelector('#ncbar .themewrap');
  if (bar) {
    const w = document.createElement('div');
    const l = document.createElement('label');
    l.setAttribute('data-t', 'language');
    l.textContent = tr('language') || 'Language';
    w.appendChild(l); w.appendChild(pick);
    bar.appendChild(w);
    return;
  }
  /* No bar on this page means it is embedded in another one, and the host is
     already wearing the language picker. Nothing to do, rather than a second
     copy floating in a corner. */
}

/* ===== PHRASE LAYER — for UI that was never given data-t keys =====
   The editor (and other React pages) render plain English text nodes, so the
   dictionary sweep above can't touch them. This walks text nodes and swaps
   any visible label that matches a phrase below. It's cheap and idempotent,
   and the MutationObserver re-runs it when React re-renders. */
const P = {
  Media: { en:"Media", zh:"媒体", hi:"मीडिया", es:"Medios", ar:"وسائط", fr:"Médias", bn:"মিডিয়া", pt:"Mídia", ru:"Медиа", ur:"میڈیا", id:"Media", de:"Medien", ja:"メディア", tr:"Medya", ko:"미디어", fa:"رسانه", uk:"Медіа", it:"Media", pl:"Media", vi:"Phương tiện" },
  Text: { en:"Text", zh:"文字", hi:"टेक्स्ट", es:"Texto", ar:"نص", fr:"Texte", bn:"টেক্সট", pt:"Texto", ru:"Текст", ur:"ٹیکسٹ", id:"Teks", de:"Text", ja:"テキスト", tr:"Metin", ko:"텍스트", fa:"متن", uk:"Текст", it:"Testo", pl:"Tekst", vi:"Chữ" },
  Transitions: { en:"Transitions", zh:"转场", hi:"ट्रांज़िशन", es:"Transiciones", ar:"انتقالات", fr:"Transitions", bn:"ট্রানজিশন", pt:"Transições", ru:"Переходы", ur:"ٹرانزیشنز", id:"Transisi", de:"Übergänge", ja:"トランジション", tr:"Geçişler", ko:"전환", fa:"انتقال‌ها", uk:"Переходи", it:"Transizioni", pl:"Przejścia", vi:"Chuyển cảnh" },
  Effects: { en:"Effects", zh:"特效", hi:"इफ़ेक्ट", es:"Efectos", ar:"مؤثرات", fr:"Effets", bn:"ইফেক্ট", pt:"Efeitos", ru:"Эффекты", ur:"افیکٹس", id:"Efek", de:"Effekte", ja:"エフェクト", tr:"Efektler", ko:"효과", fa:"افکت‌ها", uk:"Ефекти", it:"Effetti", pl:"Efekty", vi:"Hiệu ứng" },
  Stickers: { en:"Stickers", zh:"贴纸", hi:"स्टिकर", es:"Pegatinas", ar:"ملصقات", fr:"Autocollants", bn:"স্টিকার", pt:"Adesivos", ru:"Стикеры", ur:"اسٹیکرز", id:"Stiker", de:"Sticker", ja:"ステッカー", tr:"Çıkartmalar", ko:"스티커", fa:"برچسب‌ها", uk:"Стикери", it:"Adesivi", pl:"Naklejki", vi:"Nhãn dán" },
  Audio: { en:"Audio", zh:"音频", hi:"ऑडियो", es:"Audio", ar:"صوت", fr:"Audio", bn:"অডিও", pt:"Áudio", ru:"Аудио", ur:"آڈیو", id:"Audio", de:"Audio", ja:"オーディオ", tr:"Ses", ko:"오디오", fa:"صدا", uk:"Аудіо", it:"Audio", pl:"Audio", vi:"Âm thanh" },
  Memes: { en:"Memes", zh:"表情包", hi:"मीम्स", es:"Memes", ar:"ميمات", fr:"Mèmes", bn:"মিম", pt:"Memes", ru:"Мемы", ur:"میمز", id:"Meme", de:"Memes", ja:"ミーム", tr:"Memler", ko:"밈", fa:"میم‌ها", uk:"Меми", it:"Meme", pl:"Memy", vi:"Meme" },
  SFX: { en:"SFX", zh:"音效", hi:"साउंड इफ़ेक्ट", es:"Efectos de sonido", ar:"مؤثرات صوتية", fr:"Effets sonores", bn:"সাউন্ড ইফেক্ট", pt:"Efeitos sonoros", ru:"Звуковые эффекты", ur:"ساؤنڈ افیکٹس", id:"Efek suara", de:"Soundeffekte", ja:"効果音", tr:"Ses efektleri", ko:"음향 효과", fa:"افکت‌های صوتی", uk:"Звукові ефекти", it:"Effetti sonori", pl:"Efekty dźwiękowe", vi:"Hiệu ứng âm thanh" },
  AI: { en:"AI", zh:"智能", hi:"एआई", es:"IA", ar:"ذكاء اصطناعي", fr:"IA", bn:"এআই", pt:"IA", ru:"ИИ", ur:"اے آئی", id:"AI", de:"KI", ja:"AI", tr:"YZ", ko:"AI", fa:"هوش مصنوعی", uk:"ШІ", it:"IA", pl:"AI", vi:"AI" },
  "Animation Studio": { en:"Animation Studio", zh:"动画工作室", hi:"एनीमेशन स्टूडियो", es:"Estudio de Animación", ar:"استوديو الأنيميشن", fr:"Studio d'animation", bn:"অ্যানিমেশন স্টুডিও", pt:"Estúdio de Animação", ru:"Студия анимации", ur:"اینیمیشن اسٹوڈیو", id:"Studio Animasi", de:"Animationsstudio", ja:"アニメーションスタジオ", tr:"Animasyon Stüdyosu", ko:"애니메이션 스튜디오", fa:"استودیو انیمیشن", uk:"Студія анімації", it:"Studio di Animazione", pl:"Studio animacji", vi:"Xưởng hoạt hình" },
  Animator: { en:"Animator", zh:"动画师", hi:"एनिमेटर", es:"Animador", ar:"محرك", fr:"Animateur", bn:"অ্যানিমেটর", pt:"Animador", ru:"Аниматор", ur:"اینیمیٹر", id:"Animator", de:"Animator", ja:"アニメーター", tr:"Animasyoncu", ko:"애니메이터", fa:"انیماتور", uk:"Аніматор", it:"Animatore", pl:"Animator", vi:"Hoạ sĩ hoạt hình" },
  Trends: { en:"Trends", zh:"趋势", hi:"ट्रेंड्स", es:"Tendencias", ar:"اتجاهات", fr:"Tendances", bn:"ট্রেন্ড", pt:"Tendências", ru:"Тренды", ur:"ٹرینڈز", id:"Tren", de:"Trends", ja:"トレンド", tr:"Trendler", ko:"트렌드", fa:"ترندها", uk:"Тренди", it:"Tendenze", pl:"Trendy", vi:"Xu hướng" },
  Export: { en:"Export", zh:"导出", hi:"एक्सपोर्ट", es:"Exportar", ar:"تصدير", fr:"Exporter", bn:"এক্সপোর্ট", pt:"Exportar", ru:"Экспорт", ur:"ایکسپورٹ", id:"Ekspor", de:"Exportieren", ja:"書き出し", tr:"Dışa aktar", ko:"내보내기", fa:"خروجی", uk:"Експорт", it:"Esporta", pl:"Eksport", vi:"Xuất" },
  Preview: { en:"Preview", zh:"预览", hi:"प्रीव्यू", es:"Vista previa", ar:"معاينة", fr:"Aperçu", bn:"প্রিভিউ", pt:"Pré-visualização", ru:"Предпросмотр", ur:"پیش منظر", id:"Pratinjau", de:"Vorschau", ja:"プレビュー", tr:"Önizleme", ko:"미리보기", fa:"پیش‌نمایش", uk:"Попередній перегляд", it:"Anteprima", pl:"Podgląd", vi:"Xem trước" },
  Save: { en:"Save", zh:"保存", hi:"सेव", es:"Guardar", ar:"حفظ", fr:"Enregistrer", bn:"সেভ", pt:"Salvar", ru:"Сохранить", ur:"سیو", id:"Simpan", de:"Speichern", ja:"保存", tr:"Kaydet", ko:"저장", fa:"ذخیره", uk:"Зберегти", it:"Salva", pl:"Zapisz", vi:"Lưu" },
  Publish: { en:"Publish", zh:"发布", hi:"पब्लिश", es:"Publicar", ar:"نشر", fr:"Publier", bn:"পাবলিশ", pt:"Publicar", ru:"Опубликовать", ur:"پبلش", id:"Terbitkan", de:"Veröffentlichen", ja:"公開", tr:"Yayınla", ko:"게시", fa:"انتشار", uk:"Опублікувати", it:"Pubblica", pl:"Opublikuj", vi:"Xuất bản" },
  Undo: { en:"Undo", zh:"撤销", hi:"अनडू", es:"Deshacer", ar:"تراجع", fr:"Annuler", bn:"আনডু", pt:"Desfazer", ru:"Отменить", ur:"انڈو", id:"Urungkan", de:"Rückgängig", ja:"元に戻す", tr:"Geri al", ko:"실행 취소", fa:"بازگردانی", uk:"Скасувати", it:"Annulla", pl:"Cofnij", vi:"Hoàn tác" },
  Redo: { en:"Redo", zh:"重做", hi:"रीडू", es:"Rehacer", ar:"إعادة", fr:"Rétablir", bn:"রিডু", pt:"Refazer", ru:"Повторить", ur:"ریڈو", id:"Ulangi", de:"Wiederholen", ja:"やり直す", tr:"Yinele", ko:"다시 실행", fa:"انجام دوباره", uk:"Повторити", it:"Ripeti", pl:"Ponów", vi:"Làm lại" },
  Duplicate: { en:"Duplicate", zh:"复制", hi:"डुप्लीकेट", es:"Duplicar", ar:"تكرار", fr:"Dupliquer", bn:"ডুপ্লিকেট", pt:"Duplicar", ru:"Дублировать", ur:"ڈپلیکیٹ", id:"Gandakan", de:"Duplizieren", ja:"複製", tr:"Çoğalt", ko:"복제", fa:"تکراری‌سازی", uk:"Дублювати", it:"Duplica", pl:"Duplikuj", vi:"Nhân bản" },
  Delete: { en:"Delete", zh:"删除", hi:"डिलीट", es:"Eliminar", ar:"حذف", fr:"Supprimer", bn:"ডিলিট", pt:"Excluir", ru:"Удалить", ur:"ڈیلیٹ", id:"Hapus", de:"Löschen", ja:"削除", tr:"Sil", ko:"삭제", fa:"حذف", uk:"Видалити", it:"Elimina", pl:"Usuń", vi:"Xoá" },
  Download: { en:"Download", zh:"下载", hi:"डाउनलोड", es:"Descargar", ar:"تنزيل", fr:"Télécharger", bn:"ডাউনলোড", pt:"Baixar", ru:"Скачать", ur:"ڈاؤن لوڈ", id:"Unduh", de:"Herunterladen", ja:"ダウンロード", tr:"İndir", ko:"다운로드", fa:"دانلود", uk:"Завантажити", it:"Scarica", pl:"Pobierz", vi:"Tải xuống" },
  Add: { en:"Add", zh:"添加", hi:"जोड़ें", es:"Añadir", ar:"إضافة", fr:"Ajouter", bn:"যোগ", pt:"Adicionar", ru:"Добавить", ur:"شامل کریں", id:"Tambah", de:"Hinzufügen", ja:"追加", tr:"Ekle", ko:"추가", fa:"افزودن", uk:"Додати", it:"Aggiungi", pl:"Dodaj", vi:"Thêm" },
  Settings: { en:"Settings", zh:"设置", hi:"सेटिंग्स", es:"Ajustes", ar:"الإعدادات", fr:"Paramètres", bn:"সেটিংস", pt:"Definições", ru:"Настройки", ur:"سیٹنگز", id:"Pengaturan", de:"Einstellungen", ja:"設定", tr:"Ayarlar", ko:"설정", fa:"تنظیمات", uk:"Налаштування", it:"Impostazioni", pl:"Ustawienia", vi:"Cài đặt" },
  "Project Name": { en:"Project Name", zh:"项目名称", hi:"प्रोजेक्ट नाम", es:"Nombre del proyecto", ar:"اسم المشروع", fr:"Nom du projet", bn:"প্রজেক্টের নাম", pt:"Nome do projeto", ru:"Название проекта", ur:"پروجیکٹ کا نام", id:"Nama proyek", de:"Projektname", ja:"プロジェクト名", tr:"Proje adı", ko:"프로젝트 이름", fa:"نام پروژه", uk:"Назва проєкту", it:"Nome del progetto", pl:"Nazwa projektu", vi:"Tên dự án" },
  Name: { en:"Name", zh:"名称", hi:"नाम", es:"Nombre", ar:"الاسم", fr:"Nom", bn:"নাম", pt:"Nome", ru:"Имя", ur:"نام", id:"Nama", de:"Name", ja:"名前", tr:"Ad", ko:"이름", fa:"نام", uk:"Ім'я", it:"Nome", pl:"Nazwa", vi:"Tên" },
  "New project": { en:"New project", zh:"新项目", hi:"नया प्रोजेक्ट", es:"Nuevo proyecto", ar:"مشروع جديد", fr:"Nouveau projet", bn:"নতুন প্রজেক্ট", pt:"Novo projeto", ru:"Новый проект", ur:"نیا پروجیکٹ", id:"Proyek baru", de:"Neues Projekt", ja:"新規プロジェクト", tr:"Yeni proje", ko:"새 프로젝트", fa:"پروژه جدید", uk:"Новий проєкт", it:"Nuovo progetto", pl:"Nowy projekt", vi:"Dự án mới" },
  Duration: { en:"Duration", zh:"时长", hi:"अवधि", es:"Duración", ar:"المدة", fr:"Durée", bn:"সময়কাল", pt:"Duração", ru:"Длительность", ur:"مدت", id:"Durasi", de:"Dauer", ja:"長さ", tr:"Süre", ko:"길이", fa:"مدت", uk:"Тривалість", it:"Durata", pl:"Czas trwania", vi:"Thời lượng" }
};
function ncPhrase() {
  const cur = lang();
  if (cur === 'en') return;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentNode;
    if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE' || p.nodeName === 'OPTION') continue;
    const raw = n.nodeValue || '';
    const key = raw.trim();
    if (!key || key.length > 44 || seen.has(key)) continue;
    const ph = P[key];
    if (ph && ph[cur]) { n.nodeValue = raw.replace(key, ph[cur]); seen.add(key); }
  }
}

const QUESTS = [[100,'1 day free NovaClip Pro'],[450,'1 week free NovaClip Pro'],[700,'2 weeks free NovaClip Pro'],[1250,'1 month free NovaClip Pro']];
const ACHIEVEMENTS = [[30,'Reached 30 NovaCoins'],[100,'Reached 100 NovaCoins'],[250,'Reached 250 NovaCoins'],[500,'Reached 500 NovaCoins']];
/* The English labels above double as stable ids in nc_unlocked. Translate only
   for display, never for storage. */
const Q_KEY = {
  '1 day free NovaClip Pro':'q1', '1 week free NovaClip Pro':'q2',
  '2 weeks free NovaClip Pro':'q3', '1 month free NovaClip Pro':'q4',
  'Reached 30 NovaCoins':'a1', 'Reached 100 NovaCoins':'a2',
  'Reached 250 NovaCoins':'a3', 'Reached 500 NovaCoins':'a4',
  'Connect your YouTube channel':'sk_yt', 'Export a video from the Editor':'sk_edit',
  'Run a Trend Spotter scan':'sk_trend', 'Save a video idea to your shortlist':'sk_idea',
  'Review your channel analytics':'sk_analytics', 'Ask a NovaClip AI tutor':'sk_ai',
  'Top the Strike Arena scoreboard':'sk_arena',
  'Finish a set of five in Reaction':'sk_reaction',
  'Finish a round of Target':'sk_aim',
  'Compare your channel in Fair Fight':'sk_fair',
  /* THESE THREE HAD NO KEY, AND qName RETURNS '' FOR A KEY IT DOES NOT HAVE.
     They are in SKILLS, they are logged from three real pages, and they were
     the obvious things to ask a certificate for — but a requirement built on
     them would have rendered as a blank row with a number after it, in every
     language including English. Which is most of why the certificates only
     ever asked for six things. */
  'Finish a 25-minute focus block':'sk_focus',
  'Join in on the community page':'sk_community',
  'Publish or animate something you made':'sk_editing'
};
const qName = n => tr(Q_KEY[n] || n);

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

  /* THE NEW QUESTS.
     logSkill() ignores any id that is not in this table — quietly, by design,
     so a typo cannot invent a skill. That also means a game calling
     logSkill('reaction') does nothing at all until the id is listed here,
     which is exactly what happened while these two were being written. */
  focus:      { icon:'', label:'Finish a 25-minute focus block' },

  /* THREE THAT WERE BEING LOGGED INTO NOTHING.
     logSkill() drops any id it does not recognise, so these three calls —
     one on biometrics.html, one on gift.html, one shared by publish.html and
     animator.js — have been running and doing nothing for as long as they
     have existed. Found by listing every logSkill() call on the site and
     comparing it against this table, which is a check worth repeating any
     time a new one is added. */
  /* 'biometric' IS GONE FROM THIS TABLE, AND HAS TO BE.
     It asked you to lock the device with a passkey, and the device lock is
     deleted — there is no page left that could log it. A row nobody can ever
     complete is worse than one row fewer: it sits in the list at 0 forever,
     and the only instruction it gives points at a control that is not there.

     Anybody who finished it keeps the NovaCoins it paid — those were added to
     the balance at the time and are not recomputed from this table. What they
     lose is the line in the list, which is the honest outcome. */
  community:  { icon:'', label:'Join in on the community page' },
  editing:    { icon:'', label:'Publish or animate something you made' },
  reaction:   { icon:'', label:'Finish a set of five in Reaction' },
  aim:        { icon:'', label:'Finish a round of Target' },
  fair_fight: { icon:'', label:'Compare your channel in Fair Fight' }
  /* arena_mvp — "Top the Strike Arena scoreboard" — is gone with the Arena
     itself. Nothing could log it any more, so the Progress page showed a row
     stuck at 0/3 and the Master Certificate could not be finished by anyone. A
     requirement with nothing behind it is worse than no requirement. */
};

/* Each tier needs points AND hands-on reps. Points on their own can be
   collected by playing, so the skill counts are what stop a certificate being
   awarded for time spent rather than work done. */
const CERT_REQS = {
  /* ASKED FOR MORE, AND THERE WAS MORE TO ASK FOR. Six ids carried the whole
     scheme while six others — focus, community, editing, reaction, aim,
     fair_fight — were being logged by real pages into a ledger nothing read.
     Every line below is something a page on this site can actually record;
     that is the only rule here, and it is the one that matters, because a
     requirement nothing can complete is a certificate nobody can finish.

     The shape of the three tiers is meant to say something:
       Basic     — you have been round the place once. One of each, nothing
                   deep, and it should take an afternoon.
       Advanced  — you have made things and you have come back. Saving ideas
                   and reviewing your own numbers are the two habits that
                   separate somebody using the site from somebody practising.
       Master    — you have done it enough times that it is not luck, and you
                   have been in the parts that are not the tools: the
                   community page, the games, the channel comparison. */
  'Basic Certificate': {
    pts: 150,
    skills: { yt_connect:1, edit_export:3, trend_scan:3, ai_ask:5,
              idea_save:2, focus:1 }
  },
  'Advanced Certificate': {
    pts: 600,
    skills: { yt_connect:1, edit_export:10, trend_scan:10, idea_save:5, analytics:5, ai_ask:15,
              focus:3, editing:3, community:1, reaction:1 }
  },
  'Master Certificate': {
    pts: 1500,
    skills: { yt_connect:1, edit_export:25, trend_scan:20, idea_save:15, analytics:15, ai_ask:30,
              focus:8, editing:10, community:3, reaction:3, aim:3, fair_fight:1 }
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
  else missing.push({ label: tr('ui_reach_pts').replace('{n}', req.pts), have: have, need: req.pts, icon:'' });

  for (const id in req.skills) {
    const need = req.skills[id], got = skillCount(id), meta = SKILLS[id] || { icon:'•', label:id };
    total++;
    if (got >= need) done++;
    else missing.push({ label: qName(meta.label), have: got, need: need, icon: meta.icon });
  }
  return { tier: tier, missing: missing, done: done, total: total, pct: Math.round(done / total * 100) };
}
function certEarned(tier) { const p = certProgress(tier); return !!p && p.missing.length === 0; }

const style = document.createElement('style');
style.textContent =
/* dropdown fix: dark options everywhere (fixes white-on-white lists) */
"select { background:var(--nc-sel-bg,#0A0C14) !important; color:var(--nc-sel-text,#EAF2FF) !important; border:1px solid var(--nc-sel-line,rgba(0,240,255,0.35)) !important; }" +
"select option { background:var(--nc-sel-bg,#0A0C14); color:var(--nc-sel-text,#EAF2FF); }" +
/* futuristic sidebar upgrade — applies on every page over local styles */
/* The rail, matched to Trend Spotter: a soft hairline edge and a blur
   instead of the cyan border and cyan bloom it had. The gradient still
   comes from --nc-rail1/2 so light mode keeps working — those already
   flip, and hard-coding that page's dark hexes would have put a near-black
   column down the side of every light-mode page. */
".sidebar { background: linear-gradient(180deg, var(--nc-rail1,rgba(8,9,16,0.96)), var(--nc-rail2,rgba(10,8,20,0.96))) !important; border-right:1px solid var(--nc-railline,rgba(255,255,255,.07)) !important; box-shadow:none; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }" +
/* The glowing rail down the sidebar's edge used to breathe forever. That
   animation lives on a pseudo-element of a FIXED, backdrop-filtered panel,
   which means the browser re-blurred roughly 195,000 pixels behind it on
   every frame, on every page, for as long as the tab was open — measured
   at a steady 29-31fps with nobody touching anything. A blank page in the
   same browser does 57, and a blank page WITH a backdrop-filter panel does
   60: the blur is free until something animates on top of it.
   It keeps the gradient and loses the pulse. */
".sidebar::before { content:''; position:absolute; top:0; right:-1px; bottom:0; width:2px; background:linear-gradient(180deg, transparent, #00F0FF, #FF2E97, transparent); opacity:0.6; }" +
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
"#ncWheel .ncw { height:44px; line-height:44px; scroll-snap-align:center; text-align:center; cursor:pointer; " +
  "font-size:1.5rem; font-weight:600; color:#5b6478; transition:color .18s, transform .18s; }" +
"#ncWheel .ncw.on { color:#EAF2FF; transform:scale(1.22); }" +
"#ncWheel .ncw.near { color:#8c96ad; }" +
"#ncWheelBand { position:absolute; left:0; right:0; top:88px; height:44px; pointer-events:none; " +
  "border-top:1px solid rgba(255,255,255,0.16); border-bottom:1px solid rgba(255,255,255,0.16); " +
  "background:rgba(255,255,255,0.04); border-radius:8px; }";
document.head.appendChild(style);

/* ============================================================================
   FITTING THE DEVICE
   ============================================================================
   One sheet, injected by the script every NovaClip page already loads, so the
   rules cannot drift between index, app, tools, analytics, editor and game.

   Three problems, three groups of rules:

   1. A fingertip is about 9mm across and a mouse pointer is one pixel. Targets
      built for the pointer are unhittable with the finger. These rules apply
      only where the primary input is coarse AND there is no hover, so a laptop
      with a touchscreen keeps the tighter desktop spacing it was designed for.

   2. iOS zooms the entire page in when a text field smaller than 16px takes
      focus, and leaves the visitor zoomed with no obvious way back. Setting
      16px on inputs is not a taste decision, it is the fix for that.

   3. Below about 380px the sidebar, the tab strips and the stat grids run out
      of room. They get narrower gutters rather than a horizontal scrollbar.
   ============================================================================ */
const ncFit = document.createElement('style');
ncFit.textContent =
"@media (pointer: coarse) and (hover: none) {" +
  "button, .btn, .tab, .chip, .pill, .navlink, .side a, .sidebar a, nav a," +
  "  [role=button], .card > a, .tool, .toolbtn {" +
  "    min-height:44px; }" +
  "input, textarea, select { min-height:44px; font-size:16px; }" +
  "input[type=range] { height:44px; }" +
  /* A 4px-tall track is impossible to grab; the thumb is what the finger
     actually aims at, so it gets the size rather than the track. */
  "input[type=range]::-webkit-slider-thumb { width:26px; height:26px; }" +
  "input[type=range]::-moz-range-thumb { width:26px; height:26px; }" +
  "input[type=checkbox], input[type=radio] { min-width:24px; min-height:24px; }" +
  /* A footer is a row of standalone destinations rather than a sentence, so
     each one gets a target box. Links inside a paragraph are deliberately left
     alone: WCAG exempts them, and padding them would break the line height of
     the text they sit in. */
  "footer a, .foot a, .footer a { display:inline-block; padding:11px 4px; }" +
"}" +

/* Nothing under 12px on a handset. These labels were sized for a monitor at
   arm's length, not a phone at reading distance. */
"@media (max-width: 520px) {" +
  ".tag, .chip, .badge, .meta, small { font-size:12px !important; }" +
  "table { font-size:13px; }" +
  /* A table wider than the screen scrolls inside its own box instead of
     forcing the whole page sideways. */
  "table { display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; }" +
"}" +

"@media (max-width: 380px) {" +
  "body { --pad:14px; }" +
  ".wrap, .container, .page, main { padding-left:14px !important; padding-right:14px !important; }" +
  "h1 { font-size:clamp(1.6rem, 8vw, 2.2rem); }" +
"}" +

/* Landscape on a phone leaves about 350px of height. Anything with a fixed
   vertical rhythm has to give some of it back or the content is unreachable. */
"@media (max-height: 430px) and (orientation: landscape) {" +
  ".hero, header.hero { padding-top:70px; padding-bottom:20px; }" +
  ".sheet, .modal, .sbox { max-height:92vh; }" +
"}" +

/* Nothing on these pages is meant to scroll sideways. This is the safety net
   that turns an overflow into a clipped edge rather than a broken page — the
   overflows themselves are fixed at the source, this is for the next one. */
"html { overflow-x:hidden; }" +

/* ---------------------------------------------------------------------------
   ONE RAIL WIDTH FOR EVERY SCREEN

   Twelve pages each hard-code a 200px sidebar and a matching 200px body
   margin. 200px is 22% of a 900px laptop and 8% of a 2560px monitor: cramped
   on one, a stripe of wasted chrome on the other. It is a share of the window
   here instead, clamped so it never gets too thin to read a label or so wide
   it starts competing with the page.

   clamp() does this in CSS, so there is no resize listener and no reflow on
   drag — the browser recomputes it as the window changes, including when a
   phone is rotated.

   This block is appended after every page's own <style>, and the selectors
   are no more specific than theirs, so it wins on source order alone. That is
   also why it is scoped above 760px: below that each page turns the rail into
   a bottom strip with its own rules, and overriding those would put the nav
   back down the left of a phone.
   --------------------------------------------------------------------------- */
/* 248 at the top end is Trend Spotter's --nc-sidebar, so the rail is now
   literally the same width as the page it is being matched to. The old
   232 truncated "Trend Spotter" and the profile name once the foot cards
   put an avatar in front of the text. */
/* Split in two so the rail can be put away without losing its own width.
   --nc-rail-w is how WIDE the rail is; --nc-rail is how much room the page
   leaves FOR it. They are the same number until somebody hides it, and then
   the second goes to zero while the first stays — a rail collapsed to 0px
   wide has nothing to slide off the edge, so it would blink out instead of
   leaving. Everything that offsets for the rail reads --nc-rail and needs no
   further change; only .sidebar itself reads --nc-rail-w. */
":root { --nc-rail-w: clamp(176px, 14vw, 248px); --nc-rail: var(--nc-rail-w); }" +
"@media (min-width: 761px) {" +
  /* Only pages that actually HAVE a rail get pushed over by it. editor.html,
     game.html, trends.html, parent.html and pricing.html have no .sidebar —
     they were getting a 232px left margin for a rail that was not there, which
     shoved the editor's inspector panel off the right edge of the screen. */
  "body:has(.sidebar) { margin-left: var(--nc-rail); }" +
  /* Not every page offsets the body. index.html offsets a .content wrapper
     instead, so the body rule above stacked on top of its own 200px and the
     hero started 432px in — the dead strip beside the sidebar. Where a
     wrapper does the offsetting, it keeps doing it and the body stands down. */
  "body:has(.content), body:has(.shell), body:has(.main) { margin-left: 0; }" +
  ".content, .shell, .main { margin-left: var(--nc-rail); }" +
  /* and its own 40px inner padding becomes the same ~60px every other
     page uses, rather than 40 on top of a 210 that is now doubled */
  ".main { padding-left: clamp(20px, 3.4vw, 64px); }" +
  ".sidebar { width: var(--nc-rail-w); }" +
  /* The brand and the first nav rows sat 20px of page padding plus a further
     margin below the rail's own top edge, which put the logo a thumb's width
     from the top on every page. The rail is the site's top edge now — the
     padding above it was wasted space, so it is pulled up to sit near it. */
  ".sidebar { padding-top: 8px; }" +
  /* the profile sits at the foot of the rail now, not above the logo */

  /* The reading column was centred in whatever space the rail left over, which
     on a 1920 screen was 760px of text floating in 1688px of room — a 400px
     dead strip against the sidebar on ai, community, publish, progress and
     trends. Widening it to 1120px is what fixed that, and it stays.

     PINNING IT LEFT WAS THE WRONG HALF OF THAT FIX

     It also carried `margin-left: clamp(24px,3.6vw,64px); margin-right:auto`,
     which put the whole of the slack on one side — and the dead strip came
     back on the other. Reported on four pages at once: pricing kept 470px of
     empty red beside the plans, and privacy, terms and report were worse
     still, because those three have no rail at all. They are 720px documents
     that centre themselves, and this rule reached them anyway and shoved them
     against the left edge of a 1900px window. Measured: 84px from the edge,
     1076px of nothing after them.

     Auto on both sides is what the column wanted in the first place. At 760px
     wide that centred badly; at 1120px it is a margin rather than a strip, and
     on a page with a rail the flex/`margin-left` offset has already been taken
     off before this centres in what is left. */
  ".wrap { padding-left: clamp(0px, 1.2vw, 22px); padding-right: clamp(0px, 1.2vw, 22px);" +
  " margin-left: auto; margin-right: auto;" +
  " width: min(1120px, 100% - clamp(24px, 3.6vw, 64px)); }" +
  /* The labels scale with the rail, or a 232px rail is a 164px rail with more
     empty space in it. */
  ".sidebar a, .sidebar .navlink { font-size: clamp(13px, .62vw + 8.6px, 15px); }" +
  ".sidebar .themewrap { padding: 14px clamp(14px, 1.1vw, 20px) 22px; }" +

  /* THE LAYOUT DOES NOT MIRROR ANY MORE, AND THAT IS THE WHOLE OF THIS BLOCK
     NOW BEING EMPTY.
     ---------------------------------------------------------------------
     There used to be a dozen rules here that flipped the site for Persian,
     Arabic and Urdu: rail to the right, body and wrapper margins to the other
     side, the top bar, the coin badge and the Ask card all swapped, and
     Trend Spotter's own rail with them. That is the textbook thing to do and
     it was not wanted — asked for twice, in those words.

     It was also never wholly true even before it was asked about. editor.html
     had to opt out of it with `#root { direction: ltr }`, because mirroring a
     workspace runs the timeline backwards and swaps every tool out from under
     the hand that reached for it. A rule that the biggest page on the site has
     to cancel is a rule worth doubting.

     What replaces it is further down this file and is one line: the text
     elements get `unicode-bidi: plaintext`, so every paragraph, heading and
     cell resolves its OWN direction from its own first letter and aligns
     itself accordingly. Persian reads right to left inside a page whose
     furniture stays where it was in English. The words flip; the room does
     not. */

  /* ---------------------------------------------------------------------
     PUTTING THE RAIL AWAY
     ---------------------------------------------------------------------
     Asked for, and it costs one variable. Everything on this site that makes
     room for the rail — the body margin, .content/.shell/.main, and the top
     bar's left edge — reads --nc-rail, so setting it to zero reclaims all of
     that in one line and nothing else has to know.

     The rail then slides out rather than vanishing, which is the difference
     between "I put that away" and "where did my navigation go".

     DESKTOP ONLY, deliberately. Below 761px every page turns the rail into
     the strip along the bottom, and that strip is the whole of the
     navigation on a phone — a button that removes it would leave a reader
     with no way to anywhere. The button hides itself down there too. */
  "html.nc-rail-off { --nc-rail: 0px; }" +
  ".sidebar { transition: transform .26s cubic-bezier(.2,.9,.3,1.1); }" +
  "html.nc-rail-off .sidebar { transform: translateX(-101%); pointer-events: none; }" +
  /* Trend Spotter's own rail is a different element with its own width
     variable, and it does not clip its contents — collapsed to 0px wide its
     buttons would still be drawn, stacked over the page. It is taken out
     rather than slid out. */
  "html.nc-rail-off { --nc-sidebar: 0px; }" +
  "html.nc-rail-off .nc-sidebar { display: none; }" +
  "@media (prefers-reduced-motion: reduce) { .sidebar { transition: none; } }" +

"}" +

/* ---------------------------------------------------------------------------
   RTL, PART TWO: THE CHROME THAT IS FIXED TO THE VIEWPORT
   ---------------------------------------------------------------------------
   The block above mirrors the rail and the content. What it never touched is
   everything pinned to the viewport with position:fixed — the top bar, the
   coins badge, the Nova pill, the corner controls. Those kept hugging the
   left/right edges they were written for, so in Farsi the bar started where
   the content starts and ran UNDER the rail on the right, leaving a dead strip
   on the left and the controls squashed into the corner underneath the pill.
   Reported on five pages; it was one cause.

   `left`/`right` are used rather than logical properties on purpose: these
   elements are positioned against the viewport, not against a text flow, so
   inset-inline-start would follow the direction of whatever contains them and
   two of them are direct children of <body>.
   --------------------------------------------------------------------------- */
/* The pill parks in the gap beside the badge — mirrored, same 176px offset.
   The three width bands are about how much room the controls need, which does
   not change with direction, so they are restated rather than rethought.

   Both bands stop at 761px. Below that the pill is a round button docked in
   a bottom corner, and these rules set the `left` and the `transform` that
   dock is made of — so in Farsi on a phone the orb went back to the middle
   of the page heading. The dock is mirrored just below instead, which is one
   line rather than three. */
/* The pill these mirrored is gone with jarvis.js, so the rules are too. The
   card that took its place mirrors in one line, below. */

/* ---------------------------------------------------------------------------
   ENGLISH SENTENCES INSIDE AN RTL PAGE
   ---------------------------------------------------------------------------
   Not every string is translated into all twenty languages, so a Farsi page
   carries English sentences. Inside dir=rtl the bidi algorithm treats the full
   stop at the end of an English sentence as neutral and moves it to the left
   edge: ".Race the clock" instead of "Race the clock." Every untranslated
   line on the site read like that.

   unicode-bidi:plaintext resolves each element's direction from its own first
   strong character instead of inheriting it. Farsi stays right-to-left,
   English goes left-to-right with its punctuation where it belongs, and no
   string has to be tagged by hand. Listed by element rather than applied to
   everything, so it only touches things that hold sentences.
   --------------------------------------------------------------------------- */
/* The element list matters more than it looks. The first version of this rule
   named p, li, headings, table cells and a few classes — and left out span,
   div, b, strong and button, which is where most of this site's prose actually
   lives. Forty-six lines across fourteen pages were still coming out with
   their full stop on the wrong side; "Wrapped. Send them this link." and
   "None of it is uploaded." among them.

   text-align is deliberately NOT set here any more. The first version added
   `text-align: start`, which reads as harmless and is not: at (0,1,1) it
   outranks a page's own `.something { text-align: center }` at (0,1,0), so it
   would have quietly left-aligned every centred caption in Farsi. It is also
   unnecessary — `start` is already the initial value, and under plaintext it
   resolves against each block's own detected direction on its own. */
"html.nc-rtl p, html.nc-rtl li, html.nc-rtl h1, html.nc-rtl h2," +
"html.nc-rtl h3, html.nc-rtl h4, html.nc-rtl h5, html.nc-rtl h6," +
"html.nc-rtl td, html.nc-rtl th, html.nc-rtl dd, html.nc-rtl dt," +
"html.nc-rtl figcaption, html.nc-rtl blockquote, html.nc-rtl label," +
"html.nc-rtl small, html.nc-rtl summary, html.nc-rtl option," +
"html.nc-rtl span, html.nc-rtl div, html.nc-rtl b, html.nc-rtl strong," +
"html.nc-rtl em, html.nc-rtl i, html.nc-rtl a, html.nc-rtl button," +
"html.nc-rtl code, html.nc-rtl output, html.nc-rtl legend, html.nc-rtl caption" +
"{ unicode-bidi: plaintext; }" +

/* Text that is comfortable on a 1280 laptop is small on a 2560 monitor, and
   the whole site is px-sized so nothing scales on its own. A gentle ramp:
   16px at 1280, 17px at about 1800, capped at 17.5. Deliberately narrow —
   a big jump here reflows every page at once. */
/* ---------------------------------------------------------------------------
   ONE MOBILE NAV, BECAUSE FOUR PAGES HAD NONE

   Each page wrote its own phone rules and they disagreed. Measured at 390px:
   ai, coder, gift, publish and typing turned the rail into a 64px strip along
   the bottom — the intended shape. credits, index, progress and trends set
   display:none, so a phone got no navigation whatsoever. analytics, app, pro
   and tools left it vertical at ~390px tall, half the screen.

   The rail is one component built by ncNav(), so its phone shape belongs here
   rather than seventeen times over. Pages that already had it right are
   unaffected; the rest now match them.
   --------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
   DEVICE CLASSES

   Twenty-five pages had invented their own breakpoints: 520, 560, 600, 620,
   700, 760, 820, 860, 900, 1024, 1280. Nothing lined up, so a layout that was
   fixed at 760 broke again at 820 on the next page, and "does it work on a
   phone" had no answer because there was no agreed idea of what a phone is.

   These six are the answer, named rather than numbered, and stamped on <html>
   as data-device so a rule can say which device it means:

     phone-s   < 380     iPhone SE at 375, older Androids at 360, 320 at worst
     phone     380-760   every current phone; a Pro Max is 430
     tablet    761-1023  tablet upright, or a phone turned sideways
     laptop-s  1024-1279 small laptop, tablet sideways
     laptop    1280-1679 the common laptop
     desktop   1680+     a monitor

   The 760 is not a round number and is not meant to be: it is where the rail
   already stops being a rail and becomes the strip along the bottom. Naming a
   boundary somewhere else would have given the site two answers to "is this a
   phone" — a class that said tablet and a layout that said phone — which is
   the exact failure this block exists to end. The names follow the layout.

   data-pointer says coarse or fine, which is the question that actually
   matters for hit targets — a touchscreen laptop is a fine screen with fat
   fingers, and width cannot tell you that.

   The width breakpoints stay in CSS as media queries too, because JavaScript
   that has not run yet cannot lay out a page. The attribute is the addition,
   not the mechanism.
   --------------------------------------------------------------------------- */
"html[data-pointer=\"coarse\"] a," +
"html[data-pointer=\"coarse\"] button," +
"html[data-pointer=\"coarse\"] [role=\"button\"]," +
"html[data-pointer=\"coarse\"] select {" +
  /* A finger is about 9mm across. Anything shorter than this is a target you
     miss, and the audit found dozens on every page. min-height, not height,
     so nothing that is already comfortable is stretched. */
  "min-height: 40px;" +
"}" +
/* Except where a taller row would break the line it sits in. */
"html[data-pointer=\"coarse\"] p a," +
"html[data-pointer=\"coarse\"] li a," +
"html[data-pointer=\"coarse\"] a[style*=\"inline\"] { min-height: 0; }" +

/* A finger is round, and only the height was ever checked. The audit found
   the other axis full of 27x44 and 30x40 controls — tall enough to pass the
   rule above and still too narrow to hit: the three theme buttons on every
   page, and the 1-5 rating rows on analytics.html and app.html.

   Buttons and selects only. `a` is deliberately not in this list: a link is
   usually a run of text inside a sentence, and a minimum width would either
   do nothing or stretch a two-letter link into a gap in the paragraph. Links
   that are really buttons carry role="button" and are covered. */
"html[data-pointer=\"coarse\"] button," +
"html[data-pointer=\"coarse\"] [role=\"button\"]," +
"html[data-pointer=\"coarse\"] select { min-width: 40px; }" +
/* An icon button inside a tight toolbar is sized by its row, and the editor
   has rows of them. Anything that has opted into being small stays small
   rather than breaking the row it is in. */
"html[data-pointer=\"coarse\"] button[class*=\"icon\"]," +
"html[data-pointer=\"coarse\"] button[class*=\"chip\"] { min-width: 0; }" +

/* THE STRIP HAS TO WIN, AND ON FOUR PAGES IT WAS LOSING.

   Every geometry line below is !important, which is not how the rest of this
   file is written and needs the reason on the record.

   Four pages pin the rail themselves: study.html and community.html in their
   own <style> block, socials.html and biometrics.html through
   `body.tv .sidebar` and `body.bio .sidebar` in the two skin stylesheets.
   All four say `position:fixed; left:0; top:0; bottom:0; width:200px`, which
   is correct for the tall desktop rail they were written for.

   A media query adds no specificity. `.sidebar` here scores (0,1,0);
   `body.tv .sidebar` scores (0,2,1) and beats it at every width — so on a
   390px phone those four pages kept the full-height 200px rail, pinned over
   the top-left corner of their own content, covering half the top bar. The
   TeenVerse feed was unreadable behind it.

   Raising the selector cannot fix this: whatever is written here, the next
   page added by hand can out-specify it, and this site is edited by hand
   between sessions. !important on the geometry says the thing that is
   actually true — below 760px there is no room for a vertical rail, and no
   page gets to decide otherwise. Colour, shadow and border are left alone,
   so a skin still looks like itself. */
"@media (max-width: 760px) {" +
  ".sidebar {" +
    "display: flex !important; flex-direction: row !important; align-items: center;" +
    "position: fixed !important;" +
    "top: auto !important; bottom: 0 !important; left: 0 !important; right: 0 !important;" +
    "z-index: 99990;" +
    /* border-box or the 4px padding is added to the 100% and the strip is
       wider than the screen — community.html measured 394 on a 390 phone. */
    /* 100% resolves against the containing block, and an ancestor with a
       filter or transform makes that something other than the viewport —
       community.html resolved it to 394 on a 390px phone and put a
       horizontal scrollbar on the page. 100vw is the viewport by
       definition, so it is the ceiling. */
    /* width is !important for a reason that is easy to miss: on a fixed box
       given left, right AND width, the width wins and the right is dropped.
       So `right:0 !important` above did nothing on the four themed pages —
       their `width: var(--nc-rail, 200px)` was still in force and the strip
       came out 176px wide in a 390px window, a sixth of the navigation with
       the rest of it off the end. */
    "width: 100% !important; max-width: 100vw; height: 64px !important;" +
    "padding: 0 4px; box-sizing: border-box;" +
    "overflow-x: auto; overflow-y: hidden;" +
  "}" +
  ".sidebar .themewrap { display: none !important; }" +
  /* Reserve the strip's height, or the last thing on every page sits under it.
     Only where there is a strip: the editor has no rail, and reserving 74px
     for one on a page that fills the screen exactly is 74px of dead grey
     under a timeline. */
  "body:has(.sidebar) { padding-bottom: 74px !important; }" +
  "body { margin-left: 0 !important; }" +
"}" +

/* A font ramp used to sit here, growing the root size on wider screens. It
   was the wrong instinct: a bigger screen should show MORE, not the same
   amount larger. The home page h1 is sized in rem, so the ramp inflated a
   headline by 9% at 1920 that already wrapped to three lines and pushed the
   buttons off a short laptop. The root size is left alone. */
"";
document.head.appendChild(ncFit);
/* ----------------------------------------------------------------------------
   ...and the attribute that names the class, so a rule can say "phone-s"
   instead of "max-width: 379px" and mean the same thing everywhere.

   Runs at parse time, before first paint, so nothing flashes at the wrong
   size — the same reason the theme is applied here rather than on DOMContentLoaded.
   ---------------------------------------------------------------------------- */
const NC_DEVICES = [
  [380,  'phone-s'],   [761,  'phone'],  [1024, 'tablet'],
  [1280, 'laptop-s'],  [1680, 'laptop'], [Infinity, 'desktop']
];
function ncDevice(w) {
  const width = w || innerWidth || document.documentElement.clientWidth || 1280;
  for (let i = 0; i < NC_DEVICES.length; i++)
    if (width < NC_DEVICES[i][0]) return NC_DEVICES[i][1];
  return 'desktop';
}
function ncStampDevice() {
  const d = document.documentElement;
  const dev = ncDevice();
  if (d.dataset.device !== dev) d.dataset.device = dev;
  /* Asked of the browser, not guessed from the width. A touchscreen laptop is
     a wide screen that still needs finger-sized buttons, and a phone plugged
     into a mouse is the reverse. */
  let coarse = false;
  try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) {}
  const ptr = coarse ? 'coarse' : 'fine';
  if (d.dataset.pointer !== ptr) d.dataset.pointer = ptr;
}
ncStampDevice();
/* Rotation and window drags both land here. Cheap enough to run raw: it
   compares before it writes, so a drag across one class costs one DOM write,
   not one per frame. */
addEventListener('resize', ncStampDevice);
addEventListener('orientationchange', ncStampDevice);
window.ncDevice = ncDevice;

/* The remains of an old background switcher. Two things it used to do are
   now actively harmful and have been removed:

     It set --txt as an INLINE style on <html>. Inline styles beat every
     stylesheet, so nine pages that read var(--txt) were pinned to #FAFAFA
     and the light palette could not move them.

     It wrote localStorage nc_theme on every page load. That key now belongs
     to the light/dark engine, so each navigation overwrote the reader's
     choice with the string "Dark" and the site drifted back to the default.

   --bg and --box are left because typing.html still reads them, and they are
   taken from the palette so they follow the theme like everything else. */
function applyTheme(name) {
  const cs = getComputedStyle(document.documentElement);
  const pick = (v, fb) => (cs.getPropertyValue(v).trim() || fb);
  document.documentElement.style.setProperty('--bg', pick('--nc-bg', '#0E1117'));
  document.documentElement.style.setProperty('--box', pick('--nc-bg2', '#1E2130'));
  document.body.dataset.theme = name;
}
function toast(msg) { const t = document.getElementById('nctoast'); if (!t) return; t.textContent = msg; t.style.display = 'block'; clearTimeout(t.hideTimer); t.hideTimer = setTimeout(() => { t.style.display = 'none'; }, 3000); }
window.toast = toast;   /* editor.html calls this for a missing tool script */
function getPts() { return parseInt(localStorage.getItem('nc_points') || '0'); }
function checkUnlocks(pts) { const u = JSON.parse(localStorage.getItem('nc_unlocked') || '[]'); for (const [need,name] of QUESTS.concat(ACHIEVEMENTS)) { if (pts >= need && !u.includes(name)) { u.push(name); setTimeout(() => toast(tr('ui_unlocked') + qName(name)), 1200); } } localStorage.setItem('nc_unlocked', JSON.stringify(u)); }
function addPts(n) { const p = getPts() + n; localStorage.setItem('nc_points', p); ncSyncSoon(); const b = document.getElementById('ncpts'); if (b) b.textContent = '🪙 ' + p; toast((n >= 0 ? '+' : '') + n + ' 🪙'); checkUnlocks(p); refreshPanels(); }
/* WHAT COUNTS AS HISTORY.
   This wrote 200 characters of the answer and no time at all, and only
   ai.html ever called it — so the History page was empty for somebody who had
   spent an afternoon on Ask Nova, the Studio and the Coder, which is what
   "the history aint working" was. Every surface where a person types a
   question of their own calls it now, and the bucket name is where they were
   standing when they asked.

   The entry is [question, answer, when]. Third element, appended: parent.html
   reads x[0] and .length in two places and neither notices a longer row, so
   the Family Dashboard keeps working without being touched.

   400 characters of answer rather than 200 because the old cut landed
   mid-sentence on almost everything, and the page shows the answer now
   instead of only listing the question. */
function saveHist(subject, q, a) {
  try {
    const h = JSON.parse(localStorage.getItem('nc_history') || '{}');
    const key = String(subject || 'NovaClip');
    const text = String(q == null ? '' : q).trim();
    if (!text) return;
    if (!h[key]) h[key] = [];
    h[key].push([text.slice(0, 300), String(a == null ? '' : a).slice(0, 400), Date.now()]);
    if (h[key].length > 30) h[key] = h[key].slice(-30);
    localStorage.setItem('nc_history', JSON.stringify(h));
  } catch (e) { /* a full quota is not worth losing the answer over */ }
  refreshPanels();
}
window.saveHist = saveHist;
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
const NC_SERVER = 'https://novaclip-server.eskondori-pt.workers.dev';

/* The address, with a local override in front of it.

   NC_SERVER above is the real setting and the one to fill in for everybody.
   But nova.js is 220 kB, and re-pasting the whole file to change one URL is
   enough friction that the URL does not get changed — so a value in
   localStorage under `nc_server` wins when it is set. That makes "I deployed
   the Worker, does it work?" a thing you can answer in ten seconds from the
   browser console:

       localStorage.setItem('nc_server', 'https://your-worker.workers.dev')

   It only affects the browser it is typed into. When you are happy, put it in
   NC_SERVER so everyone else gets it too. */
function ncServer() {
  try {
    const o = localStorage.getItem('nc_server');
    if (o && /^https:\/\//.test(o)) return o.replace(/\/$/, '');
  } catch (e) {}
  return (NC_SERVER || '').replace(/\/$/, '');
}
window.ncServer = ncServer;

/* What travels. Deliberately NOT nc_yt: that holds a YouTube OAuth token, and a
   token on someone else's server is a token you no longer control. The channel
   name is copied into nc_name instead, which is all the rest of the site needs. */
/* nc_username, nc_avatar_* — the profile itself, so the same account looks
   the same on a phone as it does on a laptop. Two short strings and a name;
   no image ever goes in here. */
const NC_SYNC_KEYS = ['nc_username', 'nc_avatar_color', 'nc_avatar_emblem',
                      'nc_points', 'nc_skills', 'nc_certs','nc_pro','nc_subscription', 'nc_cert_enrolled',
  /* New game bests, so they follow the code like the flap score does. */
  'nc_reaction_best', 'nc_aim_best',
                      'nc_ideas', 'nc_history', 'nc_unlocked', 'nc_lb', 'nc_name',
                      'nc_flap_best', 'nc_lang',
                      'nc_life_state', 'nc_life_time', 'nc_life_name', 'nc_life_ledger',
                      'nc_life_savings', 'nc_life_goal', 'nc_life_earn', 'nc_life_owned'];

function ncKey() { return localStorage.getItem('nc_key') || ''; }
function ncCode() { return localStorage.getItem('nc_code') || ''; }
/* ncServer() is the address — the localStorage override in front of the
   constant. Everything that talks to the Worker has to go through it. These
   three used the bare constant instead, so the override documented above was
   inert: with NC_SERVER empty, '' + '/account' is a *relative* URL, and every
   account, leaderboard and community call quietly went to the site's own host,
   which answers a 404 HTML page and fails as "HTTP 404" rather than as "no
   server configured". */
function ncSyncOn() { return !!ncServer(); }

async function ncApi(path, opts) {
  const base = ncServer();
  if (!base) throw new Error('No community server configured. Set NC_SERVER in nova.js, ' +
    "or run localStorage.setItem('nc_server','https://your-worker.workers.dev') to try one.");
  const r = await fetch(base + path, opts);
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
  /* 1 means "keep the bigger number when two devices disagree". Reaction is
     the exception on this whole site: a lower time is the better one, so it is
     merged with -1 rather than being silently overwritten by a slower go from
     another device. */
  const numeric = { nc_points: 1, nc_flap_best: 1, nc_aim_best: 1, nc_reaction_best: -1 };
  for (const k in remote) {
    if (NC_SYNC_KEYS.indexOf(k) < 0) continue;
    const mine = localStorage.getItem(k), theirs = remote[k];
    if (mine === theirs) continue;
    if (numeric[k]) {
      const a = parseInt(mine, 10) || 0, b = parseInt(theirs, 10) || 0;
      /* Direction matters. Everything here is "keep the bigger number" except
         a reaction time, where the better score is the smaller one — merging
         that the usual way would quietly replace a good time with a worse one
         from another device. Zero means "no score yet" on both sides, so it
         never wins a comparison it should lose. */
      const better = numeric[k] < 0
        ? (b > 0 && (a === 0 || b < a))
        : (b > a);
      if (better) { localStorage.setItem(k, String(b)); changed++; }
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
  if (n) { refreshPanels(); const b = document.getElementById('ncpts'); if (b) b.textContent = '🪙 ' + getPts(); }
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
    navigator.sendBeacon(ncServer() + '/save',
      new Blob([JSON.stringify({ key: ncKey(), data: ncCollect() })], { type: 'application/json' }));
  });
}
window.ncCreateAccount = ncCreateAccount; window.ncSignIn = ncSignIn;
window.ncPull = ncPull; window.ncPush = ncPush; window.ncSyncOn = ncSyncOn;
window.ncKey = ncKey; window.ncCode = ncCode;
/* account.js talks to the same worker through the same address override, so
   it needs the same wrapper rather than a second copy of the base-URL logic
   that could drift from this one. */
window.ncApi = ncApi;

function refreshPanels() {
  const pts = getPts();
  const ql = document.getElementById('questlist'); if (ql) ql.innerHTML = QUESTS.map(([need,name]) => pts >= need ? qName(name) + tr('ui_done') : qName(name) + ' — ' + (need - pts) + ' ' + tr('ui_go')).join('<br>');
  const al = document.getElementById('achlist'); if (al) al.innerHTML = ACHIEVEMENTS.map(([need,name]) => pts >= need ? qName(name) : tr('ui_reach').replace('{n}', need).replace('{p}', pts)).join('<br>');
  /* The questions go through ncEscape first. They are typed by the reader, but
     "their own browser" is not the whole story: parent.html shows this same
     nc_history to a parent, so an answer written to look like markup would run
     on a page somebody else is reading. */
  const hl = document.getElementById('histlist'); if (hl) ncRenderHist(hl);
}

/* THE HISTORY LIST.
   It used to group by subject, print the last three QUESTIONS of each and
   nothing else, and say "(1 chats)". Grouping is the wrong axis: somebody
   comes to this page asking "what did I ask?", which is a question about time,
   not about subject. So it is one list, newest first, each row carrying where
   it was asked, how long ago, the question, and the answer that came back —
   the answer being the part worth coming back for.

   Everything goes through ncEscape. It is the reader's own text, but
   parent.html renders this same store for somebody else, and an answer written
   to look like markup would run on their page. */
function ncRenderHist(el) {
  ncHistCSS();
  let h = {};
  try { h = JSON.parse(localStorage.getItem('nc_history') || '{}') || {}; } catch (e) {}
  const rows = [];
  for (const s in h) {
    if (!Array.isArray(h[s])) continue;
    h[s].forEach((x) => { if (x && x[0]) rows.push({ where: s, q: x[0], a: x[1] || '', at: x[2] || 0 }); });
  }
  if (!rows.length) { el.innerHTML = '<p class="nc-hist-none">' + tr('ui_no_chats') + '</p>'; return; }
  /* Undated rows sort last rather than first. They are the ones written before
     this carried a time, so they really are the oldest. */
  rows.sort((a, b) => (b.at || 0) - (a.at || 0));
  el.innerHTML =
    '<p class="nc-hist-count">' + tr('hist_count').replace('{n}', rows.length) +
    ' <button type="button" class="nc-hist-clear">' + tr('hist_clear') + '</button></p>' +
    rows.slice(0, 60).map((r) =>
      '<div class="nc-hist-row">' +
        '<div class="nc-hist-meta">' + ncEscape(r.where) +
          (r.at ? ' <span>' + ncEscape(ncAgo(r.at)) + '</span>' : '') + '</div>' +
        '<div class="nc-hist-q">' + ncEscape(r.q) + '</div>' +
        (r.a ? '<div class="nc-hist-a">' + ncEscape(r.a) + '</div>' : '') +
      '</div>').join('');
  const clear = el.querySelector('.nc-hist-clear');
  if (clear) clear.addEventListener('click', function () {
    if (!confirm(tr('hist_clear_sure'))) return;
    try { localStorage.removeItem('nc_history'); } catch (e) {}
    ncRenderHist(el);
  });
}
window.ncRenderHist = ncRenderHist;

/* The rows are built here, so they are styled here — splitting the two across
   nova.js and history.html is how you get a page that renders but looks like
   nothing. Injected on first render rather than at load, because every page
   loads nova.js and only one of them has a history list.

   Colours come from currentColor and the theme variables, not from hexes: this
   list has to read in light mode, in dark mode and under all nine cyber
   skins. */
function ncHistCSS() {
  if (document.getElementById('nc-hist-css')) return;
  const s = document.createElement('style');
  s.id = 'nc-hist-css';
  s.textContent = [
    '.nc-hist-count{display:flex;align-items:center;justify-content:space-between;gap:12px;',
    '  flex-wrap:wrap;margin:0 0 14px;font-size:.85rem;opacity:.7}',
    '.nc-hist-clear{font:inherit;cursor:pointer;padding:5px 12px;border-radius:999px;',
    '  background:transparent;color:inherit;opacity:.85;',
    '  border:1px solid color-mix(in srgb,currentColor 28%,transparent)}',
    '.nc-hist-clear:hover{opacity:1;background:color-mix(in srgb,currentColor 8%,transparent)}',
    '.nc-hist-row{padding:13px 0;border-top:1px solid color-mix(in srgb,currentColor 12%,transparent)}',
    '.nc-hist-row:first-of-type{border-top:0}',
    '.nc-hist-meta{font-size:.7rem;text-transform:uppercase;letter-spacing:.07em;opacity:.55;',
    '  margin-bottom:5px}',
    '.nc-hist-meta span{text-transform:none;letter-spacing:0;opacity:.8}',
    '.nc-hist-meta span::before{content:"· "}',
    '.nc-hist-q{font-weight:700;line-height:1.45}',
    /* The answer is the reason to come back, but it is a stored fragment, so it
       is set quieter than the question and given room to wrap rather than
       being cut again at render time. */
    '.nc-hist-a{margin-top:5px;opacity:.72;line-height:1.6;font-size:.92rem;',
    '  white-space:pre-wrap;overflow-wrap:anywhere}',
    '.nc-hist-none{opacity:.7;line-height:1.7;margin:0}'
  ].join('');
  document.head.appendChild(s);
}

/* "3 days ago" without pulling in a date library, and without pretending to
   more precision than a stored millisecond deserves. */
function ncAgo(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 90) return tr('ago_now');
  const m = Math.round(s / 60);
  if (m < 60) return tr('ago_min').replace('{n}', m);
  const hr = Math.round(m / 60);
  if (hr < 24) return tr('ago_hour').replace('{n}', hr);
  const d = Math.round(hr / 24);
  if (d < 30) return tr('ago_day').replace('{n}', d);
  return new Date(ts).toLocaleDateString();
}
window.ncAgo = ncAgo;
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
    '<span style="font-size:1.18rem;font-weight:800;letter-spacing:-0.5px;color:var(--nc-text,#EAF2FF);' +
    'font-family:Segoe UI,-apple-system,sans-serif">Nova<span style="color:var(--nc-cyan,#00F0FF)">Clip</span></span>';
  bar.insertBefore(a, bar.firstChild);
}


/* THE MINI AI IS GONE.
   The n8n chat widget used to float on every page, bottom right. It is
   removed along with the Nova pill: two assistants on one page, neither of
   which was asked for, both of which had to be dismissed. What replaces both
   is nova-ask.js — one prompt, once, three seconds in, that takes you where
   you asked to go. See that file for what it does instead.

   nc_history is still written by ai.html, so the Family Dashboard's count of
   AI chats is unaffected by this removal. */


/* ============================================================================
   SCREEN TIME
   ============================================================================
   Ninety minutes of use, then the site locks for fifteen and the budget
   resets. Both numbers are constants below because they are the sort of thing
   that gets argued about.

   It counts ACTIVE time, not wall-clock time. A tab left open on a second
   monitor all afternoon would otherwise burn the whole budget without anyone
   looking at it, and a limit that punishes you for forgetting to close a tab
   is one people learn to resent rather than respect. So the clock only runs
   while the tab is visible AND something has been touched in the last minute.

   Honest note for whoever maintains this: a browser-side limit is a nudge, not
   a lock. Clearing site data resets it, and anyone determined will work that
   out. Enforcing it properly needs an account and a server, which this site
   deliberately does not have. It is here to help someone who wants the help.
   ============================================================================ */
const NC_ST_BUDGET = 90 * 60 * 1000;   // 1 h 30 m of use
const NC_ST_BREAK  = 15 * 60 * 1000;   // then locked for 15 minutes
const NC_ST_IDLE   = 60 * 1000;        // no interaction for this long = not using it
const NC_ST_KEEP   = 30;               // days of history to keep

/* ----------------------------------------------------------------------------
   THE DAY BOOK

   The clock above only ever knew about the stretch in front of it: minutes
   since the last break, wiped the moment a break began. That is all it needs to
   enforce a limit, and it is nothing at all for a parent, who is not asking
   "how long right now" but "how much this week, and is it going up".

   So each tick also banks its milliseconds against today's date, and a break
   increments today's count when it starts. Thirty days, then the oldest day
   falls off — long enough to see a trend, short enough that this stays a small
   string in localStorage.

   Local dates on purpose: a parent reading "Tuesday" means the Tuesday the
   household had, not a UTC day that ends at 1am in Lisbon.
   ---------------------------------------------------------------------------- */
function ncStDay(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
    '-' + String(d.getDate()).padStart(2, '0');
}

function ncStRead() {
  try { return JSON.parse(localStorage.getItem('nc_st_log') || '{}') || {}; }
  catch (e) { return {}; }
}

function ncStLog(ms, breaks) {
  const log = ncStRead();
  const k = ncStDay();
  const day = log[k] || { ms: 0, breaks: 0 };
  day.ms += ms || 0;
  day.breaks += breaks || 0;
  log[k] = day;

  const keys = Object.keys(log).sort();
  while (keys.length > NC_ST_KEEP) delete log[keys.shift()];

  try { localStorage.setItem('nc_st_log', JSON.stringify(log)); } catch (e) {}
}

/* The last n days, oldest first, with the gaps filled in — a day nobody opened
   the site has no entry, and a chart with Wednesday missing is a lie about
   Wednesday rather than a gap in it. */
function ncScreenLog(days) {
  const log = ncStRead();
  const out = [];
  for (let i = (days || 7) - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = ncStDay(d);
    const e = log[k] || { ms: 0, breaks: 0 };
    out.push({ day: k, date: d, ms: e.ms || 0, breaks: e.breaks || 0 });
  }
  return out;
}
window.ncScreenLog = ncScreenLog;

/* ============================================================================
   WHAT THIS COULD PAY
   ============================================================================
   A parent looking at a teenager's channel is asking a fair question — is any
   of this ever going to be worth money — and the honest answer has three parts,
   so this returns all three rather than one confident number.

     1. It is not earning anything yet, and cannot, until YouTube's Partner
        Programme thresholds are met. Below those the answer is £0 no matter how
        good the videos are.
     2. Nobody under 18 can hold an AdSense account. The money does not go to
        the teenager on their eighteenth birthday — until then it can only be
        paid into an account a parent or guardian owns, in their name.
     3. What it would pay, once both of those are cleared, is a RANGE and not a
        figure. RPM depends on the niche, the audience's country, the season and
        how much of the watch time is Shorts. Anyone quoting one number is
        guessing; this quotes the band and shows the arithmetic.

   RPM here is the creator's share per 1,000 views — already net of YouTube's
   45% — so the output is take-home, not billings. The band is deliberately wide
   and starts low: a channel aimed at other teenagers sits near the bottom of it,
   because advertisers pay least for exactly that audience. That is a
   disappointing thing to tell a parent and it is the true thing.
   ============================================================================ */
const NC_YPP = { subs: 1000, watchHours: 4000, shortsViews: 10000000 };
const NC_RPM = { low: 0.50, high: 4.00 };     // per 1,000 views, creator's share
const NC_ADSENSE_AGE = 18;

function ncPayEstimate(snap, age) {
  const s = snap || {};
  const out = {
    connected: !!s.connected,
    subs: s.subscribers || 0,
    totalViews: s.totalViews || 0,
    needSubs: Math.max(0, NC_YPP.subs - (s.subscribers || 0)),
    rpm: NC_RPM,
    ageNow: age || 0,
    yearsTo18: age ? Math.max(0, NC_ADSENSE_AGE - age) : null,
    ownAccount: !!age && age >= NC_ADSENSE_AGE
  };
  if (!out.connected) return out;

  /* Views per month, averaged over the channel's whole life. A lifetime average
     understates a channel that is growing and flatters one that has stalled,
     which is why it is labelled as what it is wherever it is shown. */
  const created = Date.parse(s.created || '');
  const months = isFinite(created)
    ? Math.max(1, (Date.now() - created) / (30.44 * 86400000))
    : 1;
  out.months = months;
  out.viewsPerMonth = Math.round((s.totalViews || 0) / months);

  out.monthLow  = out.viewsPerMonth / 1000 * NC_RPM.low;
  out.monthHigh = out.viewsPerMonth / 1000 * NC_RPM.high;
  out.yearLow   = out.monthLow * 12;
  out.yearHigh  = out.monthHigh * 12;

  /* Eligibility is subscribers AND watch hours. Watch hours are not in this
     snapshot — the Analytics API has them and the dashboard does not call it —
     so the subscriber gate is reported as what it is, half the test. */
  out.subsMet = out.subs >= NC_YPP.subs;
  out.subsPct = Math.min(100, Math.round(out.subs / NC_YPP.subs * 100));
  return out;
}
window.ncPayEstimate = ncPayEstimate;
window.NC_YPP = NC_YPP;

function ncScreenTime() {
  const get = (k, d) => { const v = +localStorage.getItem(k); return isFinite(v) && v ? v : d; };
  const set = (k, v) => { try { localStorage.setItem(k, String(v)); } catch (e) {} };

  let lastTouch = Date.now();
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev =>
    addEventListener(ev, () => { lastTouch = Date.now(); }, { passive: true }));

  const badge = document.createElement('div');
  badge.id = 'ncst';
  badge.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9990;padding:7px 13px;' +
    'border-radius:999px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.02em;' +
    'border:1px solid rgba(255,255,255,0.14);background:rgba(8,11,20,0.82);color:#8A97B4;' +
    'backdrop-filter:blur(10px);pointer-events:none;display:none';
  document.body.appendChild(badge);

  let veil = null;
  function lockScreen(until) {
    if (veil) return;
    veil = document.createElement('div');
    veil.id = 'ncstlock';
    veil.style.cssText = 'position:fixed;inset:0;z-index:99997;display:grid;place-items:center;' +
      'background:rgba(4,6,12,0.97);backdrop-filter:blur(14px);color:#EAF2FF;text-align:center;' +
      'padding:26px;font-family:system-ui,sans-serif';
    veil.innerHTML =
      '<div style="max-width:340px">' +
      '<div style="font-size:44px;margin-bottom:14px">⏸</div>' +
      '<h2 style="font-size:1.5rem;font-weight:650;letter-spacing:-.02em">' + tr('ui_break_t') + '</h2>' +
      '<p style="color:#8A97B4;margin-top:12px;font-size:15px;line-height:1.6">' +
      tr('ui_break_b') + '</p>' +
      '<div id="ncstcd" style="margin-top:22px;font:700 34px/1 ui-monospace,monospace;' +
      'background:linear-gradient(110deg,#7C5CFF,#00E5FF);-webkit-background-clip:text;' +
      'background-clip:text;color:transparent">15:00</div>' +
      '</div>';
    document.body.appendChild(veil);
    document.body.style.overflow = 'hidden';
  }
  function unlockScreen() {
    if (!veil) return;
    veil.remove(); veil = null;
    document.body.style.overflow = '';
  }

  const mmss = ms => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };

  let last = Date.now();
  function tick() {
    const now = Date.now();
    const lockUntil = get('nc_st_lock', 0);

    if (now < lockUntil) {
      lockScreen(lockUntil);
      const cd = document.getElementById('ncstcd');
      if (cd) cd.textContent = mmss(lockUntil - now);
      badge.style.display = 'none';
      last = now;
      return;
    }
    unlockScreen();

    /* Only bill time that was actually spent using the site. */
    const active = !document.hidden && (now - lastTouch) < NC_ST_IDLE;
    const delta = Math.min(now - last, 10000);   // a sleeping laptop must not bill hours
    last = now;
    if (!active) { badge.style.display = 'none'; return; }

    const used = get('nc_st_used', 0) + delta;
    set('nc_st_used', used);
    ncStLog(delta, 0);              // banked per day, so a parent can see a week

    const left = NC_ST_BUDGET - used;
    if (left <= 0) {
      set('nc_st_lock', now + NC_ST_BREAK);
      set('nc_st_used', 0);
      ncStLog(0, 1);                // a break starts here
      return;
    }
    /* The badge only appears in the last ten minutes. A countdown visible the
       whole time is a nag; one that appears near the end is information. */
    if (left < 10 * 60 * 1000) {
      badge.style.display = 'block';
      badge.textContent = tr('ui_left').replace('{t}', mmss(left));
      badge.style.color = left < 60000 ? '#FFB443' : '#8A97B4';
    } else {
      badge.style.display = 'none';
    }
  }

  tick();
  setInterval(tick, 1000);
  window.ncScreenTimeReset = function () {   // for the parent page
    set('nc_st_used', 0); set('nc_st_lock', 0); unlockScreen();
  };
}


/* ============================================================================
   PROFILE — a name and a face
   ============================================================================
   Both live in this browser and nowhere else. There is no server here, so a
   profile picture cannot be seen by anyone but you — which is also why an
   uploaded image is safe to allow: it never leaves the device.

   The name goes through ncModerate() before it is accepted. On a site for
   13-18s a display name is the one piece of free text that follows you around,
   and it is worth checking once at the point of entry.
   ============================================================================ */
const NC_AVATARS = ['\u{1F984}','\u{1F98A}','\u{1F431}','\u{1F438}','\u{1F419}','\u{1F41D}',
  '\u{1F680}','\u{1F30D}','\u{26A1}','\u{1F525}','\u{1F308}','\u{1F3AE}',
  '\u{1F3A7}','\u{1F3AC}','\u{1F4F8}','\u{1F3A8}','\u{2B50}','\u{1F36A}'];

function ncName()   { return localStorage.getItem('nc_name') || ''; }
function ncAvatar() { return localStorage.getItem('nc_avatar') || NC_AVATARS[0]; }

function ncProfile() {
  const sb = document.querySelector('.sidebar');
  if (!sb || document.getElementById('ncprof')) return;

  /* ---------------------------------------------------------------------
     THE FOOT OF THE RAIL
     ---------------------------------------------------------------------
     Two cards pinned to the bottom, copied from the Trend Spotter page: what
     you have earned, and who you are. The profile used to sit at the very
     top, above the logo, which is the one spot on the page nobody looks for
     it — and it pushed the navigation down by its own height on every screen.

     margin-top:auto on the wrapper is what pins it. The rail's .themewrap had
     that too; two elements both claiming the free space would have split it
     and left a gap between them, so that one gives it up below.
     --------------------------------------------------------------------- */
  const foot = document.createElement('div');
  foot.id = 'ncfoot';

  const coins = document.createElement('a');
  coins.id = 'nccoins';
  coins.href = 'progress.html';   // the page that explains where they came from

  const box = document.createElement('button');
  box.id = 'ncprof';
  box.type = 'button';

  function paintCoins() {
    coins.innerHTML =
      '<span class="ncfi">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 010 3.6h-3a1.8 1.8 0 000 3.6h4"/>' +
        '</svg></span>' +
      /* Translated now. It was left in English on the grounds that it is the
         product's own name for them — but it is the label under a number
         somebody is reading, not a logo, and it was the last English word in
         the rail. data-t so a language switch repaints it without a reload. */
      '<span class="ncfb"><b>' + getPts().toLocaleString() +
      '</b><i data-t="ui_novacoins">' + tr('ui_novacoins') + '</i></span>';
  }

  function paint() {
    const pic = ncAvatar();
    const face = pic.startsWith('data:')
      ? '<img src="' + pic + '" alt="" class="ncav">'
      : '<span class="ncav ncave">' + pic + '</span>';
    /* The second line is the connected channel when there is one — that is
       the thing worth knowing at a glance, and it is what certificates get
       issued in the name of. Otherwise it names the product, as on Trend
       Spotter, rather than sitting empty. */
    let channel = '';
    try {
      const y = JSON.parse(localStorage.getItem('nc_yt') || 'null');
      if (y && y.channel) channel = String(y.channel);
    } catch (e) {}
    box.innerHTML = face + '<span class="ncfb"><b>' +
      (ncName() ? ncName().replace(/[<>&]/g, '') : tr('ui_set_name')) + '</b><i>' +
      (channel ? channel.replace(/[<>&]/g, '') : tr('ui_creator')) + '</i></span>';
  }

  /* WHAT THEY SAID THEY MAKE, WHERE THEY CAN SEE IT.
     The category steers the Ask card's shortcuts, Trend Spotter's first
     search and every AI prompt on the site, so a reader getting answers bent
     towards Gaming deserves to be able to see WHY, in one glance, and change
     it in one click. Hidden state that quietly changes the answers is the
     thing to avoid here — it is the difference between a site that knows you
     and a site that is behaving strangely.

     It also gives somebody who skipped the first-run question a standing
     offer rather than a dialog they have to be shown twice. */
  const cat = document.createElement('a');
  cat.id = 'nccat';
  cat.href = 'categories.html';

  function paintCat() {
    const C = window.NC_CATEGORY;
    const has = C && C.get();
    cat.innerHTML =
      '<span class="ncfi">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/>' +
        '<rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>' +
        '</svg></span>' +
      /* data-t on both lines, so switching language repaints the card without
         a reload. The key is only put on the name when the category is one of
         ours — a written-in one has no key, and stamping a made-up one would
         leave the pass looking up a string that does not exist. */
      '<span class="ncfb"><b' +
        (has && C.presetOf && C.presetOf() ? ' data-t="ccat_' + C.get() + '"' : '') + '>' +
        (has ? String(C.labelOf()).replace(/[<>&]/g, '') : tr('ui_pick_cat')) +
      '</b><i data-t="categories">' + tr('categories') + '</i></span>';
  }

  paintCoins();
  paint();
  paintCat();
  foot.append(cat, coins, box);
  sb.appendChild(foot);
  box.onclick = openProfile;
  /* categories.js fires this when the answer changes, including from the
     first-run dialog — so the rail is right without a reload. */
  addEventListener('nc-category', paintCat);
  addEventListener('storage', paintCat);
  /* And the welcome's first step fires this. The rail is built before the
     dialog opens, so without it the card still said "Set your name" to
     somebody who had just typed theirs in. */
  addEventListener('nc-name', paint);
  addEventListener('storage', paint);
  /* Points change while the page is open — a game finishing, a quest paying
     out. The badge in the top bar already listens for this. */
  addEventListener('storage', paintCoins);
  addEventListener('nc-points', paintCoins);

  function openProfile() {
    if (document.getElementById('ncprofui')) return;
    const o = document.createElement('div');
    o.id = 'ncprofui';
    o.style.cssText = 'position:fixed;inset:0;z-index:99996;display:grid;place-items:center;' +
      'background:rgba(4,6,12,0.9);backdrop-filter:blur(10px);padding:22px;font-family:system-ui,sans-serif';
    o.innerHTML =
      '<div style="width:100%;max-width:400px;background:#0C1220;border:1px solid rgba(255,255,255,0.12);' +
      'border-radius:20px;padding:26px;color:#EAF2FF">' +
      '<h2 style="font-size:1.25rem;font-weight:650;margin-bottom:16px">' + tr('ui_profile') + '</h2>' +
      '<label style="display:block;font-size:12.5px;color:#8A97B4;margin-bottom:6px">' + tr('ui_name') + '</label>' +
      '<input id="ncpname" maxlength="20" placeholder="' + tr('ui_name_ph') + '" ' +
      'style="width:100%;padding:11px 13px;border-radius:11px;border:1px solid rgba(255,255,255,0.14);' +
      'background:rgba(255,255,255,0.04);color:#EAF2FF;font:inherit;font-size:15px">' +
      '<p id="ncperr" style="color:#FF6B9D;font-size:13px;margin-top:7px;display:none"></p>' +
      '<label style="display:block;font-size:12.5px;color:#8A97B4;margin:18px 0 8px">' + tr('ui_picture') + '</label>' +
      '<div id="ncpavs" style="display:grid;grid-template-columns:repeat(6,1fr);gap:7px"></div>' +
      '<label style="display:block;margin-top:12px;font-size:12.5px;color:#8A97B4">' +
      tr('ui_or_own') + ' <input type="file" id="ncpfile" accept="image/*" style="display:block;margin-top:6px;font-size:12px"></label>' +
      '<p style="color:#8A97B4;font-size:12px;margin-top:10px;line-height:1.5">' +
      tr('ui_local_only') + '</p>' +
      '<label style="display:block;font-size:12.5px;color:#8A97B4;margin:20px 0 6px">' +
      tr('ui_ai_key') + '</label>' +
      '<input id="ncpkey" type="password" placeholder="AIza…" autocomplete="off" ' +
      'style="width:100%;padding:11px 13px;border-radius:11px;border:1px solid rgba(255,255,255,0.14);' +
      'background:rgba(255,255,255,0.04);color:#EAF2FF;font:inherit;font-size:14px">' +
      '<p id="ncpkerr" style="font-size:12.5px;margin-top:7px;display:none"></p>' +
      '<p style="color:#8A97B4;font-size:12px;margin-top:8px;line-height:1.5">' +
      tr('ui_key_shared').replace('{link}',
        '<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" ' +
        'style="color:#00E5FF">Google AI Studio</a>') + '</p>' +
      /* The honest answer to "is any of this still a demo?", asked rather
         than assumed. Collapsed, because most readers never need it. */
      '<details style="margin-top:20px;border-top:1px solid rgba(255,255,255,0.1);padding-top:14px">' +
      '<summary style="cursor:pointer;font-size:12.5px;color:#8A97B4;list-style:none">' +
      'Is anything still a demo? <span style="color:#00E5FF">Check now</span></summary>' +
      '<div id="ncdiag" style="font-size:12px;line-height:1.5;margin-top:11px;color:#8A97B4">Checking…</div>' +
      '</details>' +
      '<div style="display:flex;gap:9px;margin-top:20px">' +
      '<button id="ncpsave" style="flex:1;padding:12px;border:0;border-radius:12px;cursor:pointer;' +
      'background:linear-gradient(110deg,#7C5CFF,#00E5FF);color:#05070E;font:inherit;font-weight:650">' + tr('ui_save') + '</button>' +
      '<button id="ncpcancel" style="padding:12px 18px;border:1px solid rgba(255,255,255,0.14);' +
      'border-radius:12px;cursor:pointer;background:none;color:#EAF2FF;font:inherit">' + tr('ui_cancel') + '</button>' +
      '</div></div>';
    document.body.appendChild(o);

    let pick = ncAvatar();
    const grid = document.getElementById('ncpavs');
    function drawAvs() {
      grid.innerHTML = NC_AVATARS.map(a =>
        '<button data-a="' + a + '" style="aspect-ratio:1;border-radius:11px;cursor:pointer;font-size:19px;' +
        'border:2px solid ' + (a === pick ? '#00E5FF' : 'rgba(255,255,255,0.1)') + ';' +
        'background:rgba(255,255,255,0.04)">' + a + '</button>').join('');
      grid.querySelectorAll('button').forEach(b =>
        b.onclick = () => { pick = b.dataset.a; drawAvs(); });
    }
    drawAvs();
    document.getElementById('ncpname').value = ncName();
    document.getElementById('ncpkey').value = ncAIKey();

    /* Two network calls, so it waits until the section is actually opened. */
    const diagBox = document.getElementById('ncdiag');
    const diagWrap = diagBox && diagBox.parentElement;
    if (diagWrap) diagWrap.addEventListener('toggle', function once() {
      if (!diagWrap.open) return;
      diagWrap.removeEventListener('toggle', once);
      ncDiag().then(rows => {
        diagBox.innerHTML = rows.map(r =>
          '<div style="margin-bottom:9px">' +
          '<b style="color:' + (r.live ? '#5BE49B' : '#FFB45B') + '">' +
          (r.live ? '● LIVE' : '● DEMO') + '</b> ' +
          '<span style="color:#EAF2FF">' + ncEscape(r.name) + '</span><br>' +
          ncEscape(r.detail) + '</div>').join('');
      }).catch(e => { diagBox.textContent = 'The check itself failed: ' + (e && e.message || e); });
    });

    document.getElementById('ncpfile').onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      /* Downscaled to 128px before storing: local storage is small, and a
         modern phone photo would fill it on its own. */
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const x = c.getContext('2d');
        const s = Math.max(128 / img.width, 128 / img.height);
        x.drawImage(img, (128 - img.width * s) / 2, (128 - img.height * s) / 2,
                    img.width * s, img.height * s);
        pick = c.toDataURL('image/jpeg', 0.8);
        drawAvs();
      };
      img.src = URL.createObjectURL(f);
    };

    document.getElementById('ncpcancel').onclick = () => o.remove();
    document.getElementById('ncpsave').onclick = () => {
      const v = document.getElementById('ncpname').value.trim();
      const err = document.getElementById('ncperr');
      if (v.length < 2) { err.textContent = tr('ui_name_short'); err.style.display = 'block'; return; }
      const mod = window.ncModerate ? ncModerate(v) : { ok: true };
      if (!mod.ok) { err.textContent = tr('ui_name_taken'); err.style.display = 'block'; return; }
      /* An empty box means "use the shared key", which is a valid choice and
         not an error. Anything else has to look like a key, or the first AI
         request fails somewhere far away from the box you typed it into. */
      const k = document.getElementById('ncpkey').value.trim();
      const kerr = document.getElementById('ncpkerr');
      if (k && !ncKeyLooksReal(k)) {
        kerr.textContent = tr('ui_key_bad');
        kerr.style.color = '#FF6B9D'; kerr.style.display = 'block';
        return;
      }
      ncSetAIKey(k);
      try {
        localStorage.setItem('nc_name', v);
        localStorage.setItem('nc_avatar', pick);
      } catch (e) {}
      paint(); o.remove();
      if (window.ncSyncSoon) ncSyncSoon();
    };
  }
}

/* ============================================================================
   THE SIDEBAR
   ============================================================================
   Eleven links in a flat list did not fit on a laptop. The last three fell off
   the bottom of the screen, which is the same as not having them.

   So they are grouped by what you are trying to do, and the groups are the
   thing that scrolls rather than the links:

     Channel   Studio, Analytics        your numbers
     Create    Editor, Trend Spotter    making the video
     AI        NovaClip AI, Coder       asking something to do it for you
     Games     Games, Typing race       the fun end
     Socials   Gifts                    other people
     You       Progress, Family, Pricing

   On a short screen every group except the one you are in starts closed, which
   turns eleven rows into five and always fits. On a tall screen they all start
   open, because hiding things people can already see is just extra clicks.
   Either way the sidebar scrolls, so nothing can fall off the bottom again.

   Built here rather than in each page's markup. The nav had already drifted —
   some pages listed six links, some nine — and the only cure for that is one
   copy that every page gets.
   ============================================================================ */
/* Icons as inline SVG paths on a 24-grid. Not emoji: emoji render differently
   on every platform, they carry their own colour, and they cannot pick up the
   active state. These inherit currentColor, so one rule lights the whole row. */
const NC_ICONS = {
  home:      'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  /* TWO THAT WERE FALLING BACK TO THE HOUSE.
     ncIcon() returns NC_ICONS.home for any name it does not have, and 'signin'
     was never a key here — so the Profile link in the rail has been drawing a
     house this whole time. Nobody noticed at 19px in a fourteen-item rail. The
     phone menu is six rows of 26px type, where a house next to the word
     Profile is the first thing you see. Socials was pointed at the gift box,
     which is a real icon and the wrong one. */
  profile:   'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  socials:   'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  studio:    'M3 5h13v14H3zM19 8l3-2v12l-3-2z',
  analytics: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  editor:    'M3 6h18M3 12h18M3 18h11M17 15l4 3-4 3z',
  trends:    'M3 17l6-6 4 4 8-8M15 7h6v6',
  ai:        'M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4z',
  coder:     'M8 7l-5 5 5 5M16 7l5 5-5 5',
  games:     'M7 12h4m-2-2v4M15 11h.01M18 13h.01M4 8h16a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z',
  typing:    'M4 7h16v10H4zM7 10h.01M11 10h.01M15 10h.01M8 14h8',
  gift:      'M4 11h16v9H4zM2 7h20v4H2zM12 7v13M12 7S9 3 7 4s0 3 5 3zM12 7s3-4 5-3-0 3-5 3z',
  progress:  'M12 3a9 9 0 109 9h-9z',
  family:    'M8 11a3 3 0 100-6 3 3 0 000 6zM2 20a6 6 0 0112 0M17 11a3 3 0 100-6M16 20a6 6 0 016-6',
  pricing:   'M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  publish:   'M12 19V5M5 12l7-7 7 7M4 21h16',
  community: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  trends:    'M3 17l6-6 4 4 7-7M14 8h7v7',
  life: 'M12 21s-6.6-4.7-9.1-8.8C1 8.9 3.1 4.5 7.2 4.5c2.4 0 3.9 1.1 4.8 2.6.9-1.5 2.4-2.6 4.8-2.6 4.1 0 6.2 4.4 4.3 7.7C18.6 16.3 12 21 12 21z'
};

const NC_NAV = [
  { items: [['index.html', 'Home', 'home', 'home']] },
  /* PAIRS, NOT FOUR SEPARATE LINKS
     Studio and Analytics were two entries looking at the same channel, and
     Editor and Photo were two entries editing the same footage. Each pair is
     one link now, and the two halves are reached by a tab strip at the top of
     whichever one you are on — see ncPairTabs(). Fewer things in the rail, and
     nothing lost: every page is still one press away.

     The Trend Spotter is back as its own entry. It had disappeared from the
     rail entirely and was only reachable through a button inside the editor,
     which is a strange place to hide the research tool. */
  /* One way in, not two. Studio used to sit here beside Trend Spotter, and
     the two of them were halves of the same thing: you scan a trend, you make
     the video, and Studio is where you find out whether it worked. Studio now
     lives at the end of the Trend Spotter's own rail, in the flow it belongs
     to, so this group is the single door to all of it. */
  /* CALLED STUDIO IN THE RAIL, AND NOWHERE ELSE.
     The page is still Trend Spotter — its own heading, its own rail, its own
     name inside itself, all unchanged. What changed is that the page now
     carries the Editor and the AI Editor as well as the research tools, and
     "Trend Spotter" stopped describing the door once the room behind it held
     everything you make. Studio does.

     tr('studio') already exists in twenty languages and already means exactly
     this, so this is a different key, not a rewritten one — nothing that says
     "Trend Spotter" today stops saying it. */
  { name: 'Channel', key: 'nav_channel', icon: 'analytics', items: [
      ['trends.html', 'Studio', 'studio', 'trends']] },
  /* THE EDITOR AND THE AI EDITOR ARE NOT HERE ANY MORE.
     They live inside Studio, full screen, and having them in this rail as
     well meant two doors to one room — press one and you get the tool with
     the research three clicks away, press the other and you get both. Studio
     above is the single door now, and both tools open to the whole screen
     once you are through it.

     Photo has gone the same way, and for the same reason. It stayed behind
     when the other two left only because nothing else linked to it; it is the
     third tool inside Studio now, in the rail beside them, so this row was
     the second door again. photo.html is still a page and still opens on its
     own — the panel's own strip has the link. */
  { name: 'Create', key: 'nav_create', icon: 'editor', items: [
      ['studio-ai.html', 'AI', 'ai', 'ai']] },
  { name: 'Learn', key: 'nav_learn', icon: 'life', items: [
      ['game.html', 'Games', 'games', 'games']] },
  { items: [['socials.html', 'Socials', 'socials', 'socials']] },
  { name: 'You', key: 'nav_you', icon: 'progress', items: [
      /* First in the group, because it is the one somebody arrives looking
         for. */
      ['profile.html', 'Profile', 'profile', 'profile'],
      /* History replaces Progress here. Progress was a page of four panels and
         only one of them answered a question anybody arrives with — "what have
         I actually been asking?". The certificate reps moved to Pricing, beside
         the certificates they are the price of; the history got its own page.
         Biometrics is gone entirely. */
      ['history.html', 'History', 'history', 'progress'],
      /* NO 'Categories' ROW HERE.
         The rail was saying the same word twice: this link, and the category
         card down in the foot showing which one you are on. Two entries to one
         page, three rows apart, one of them already displaying the answer.

         The card stays and this goes, because the card is the better control —
         it tells you the current category as well as changing it, which is the
         question somebody actually has. #nccat, further up this file, and it
         points at the same categories.html this row did, so nothing is lost. */
      ['parent.html', 'Family', 'family', 'family'],
      ['pricing.html', 'Pricing', 'pricing', 'pricing']] }
];

function ncIcon(name) {
  const d = NC_ICONS[name] || NC_ICONS.home;
  return '<svg class="nci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
         'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
}

function ncNav() {
  const bar = document.querySelector('.sidebar');
  if (!bar || document.getElementById('ncnav')) return;

  if (!document.getElementById('ncnavcss')) {
    const st = document.createElement('style');
    st.id = 'ncnavcss';
    st.textContent = [
      /* the bar: a soft vertical wash and a hairline edge rather than a flat
         panel, so it reads as a surface the content sits in front of */
      /* overflow-x is NOT set here, and that is the whole point of the note.
         It used to say hidden — correct for a vertical rail, catastrophic for
         the phone strip. This stylesheet is appended after the layout one, so
         at equal specificity it won on source order and quietly replaced the
         strip's own overflow-x:auto. Measured on a 390px phone: the strip is
         1308px of nav in a 389px window, fifteen links of which five are
         reachable, and no swipe will move it. Every page on the site, on
         every phone. The axis is set per-shape below instead. */
      '.sidebar{overflow-y:auto;scrollbar-width:thin;',
      'scrollbar-color:rgba(255,255,255,.14) transparent;',
      'background:linear-gradient(175deg,var(--nc-rail1,#0E1220) 0%,var(--nc-rail2,#0A0D18) 55%,var(--nc-rail3,#080B14) 100%) !important;',
      'border-right:1px solid var(--nc-railline,rgba(255,255,255,.07)) !important;',
      'box-shadow:1px 0 0 var(--nc-railglow,rgba(124,92,255,.10)), 18px 0 44px -30px var(--nc-shadow,rgba(0,0,0,.9))}',
      '.sidebar::-webkit-scrollbar-thumb{background:var(--nc-line2,rgba(255,255,255,.14))}',
      '.sidebar::-webkit-scrollbar{width:5px}',
      '.sidebar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:3px}',
      '.sidebar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.26)}',
      /* Tall rail: nothing may stick out sideways. Bottom strip: sideways is
         the only direction there is, and the momentum flick is how you reach
         the far end of it. */
      '@media (min-width:761px){.sidebar{overflow-x:hidden}}',
      '@media (max-width:760px){.sidebar{overflow-x:auto;overflow-y:hidden;' +
        '-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;' +
        /* The profile button is stuck to the right edge and painted over the
           links, so the last 64px of the scrollport is not really visible.
           scrollIntoView does not know that on its own — it scrolled the
           active link to x=297 with the foot starting at x=337, which is
           "in view" by its arithmetic and half hidden on the screen. This is
           the number that tells it where the edge actually is. */
        'scroll-padding:0 64px 0 8px;' +
        /* A visible scrollbar inside a 64px strip eats a fifth of it. */
        'scrollbar-width:none}' +
        '.sidebar::-webkit-scrollbar{display:none}' +
        /* Rows in a row, not a column stacked inside a 64px-tall box.

           `.sidebar #ncnav` and not `#ncnav`, and this is the line that made
           the whole bottom bar useless. The tall rail's own rule further down
           this same stylesheet says `flex:1 1 auto` so the nav takes the
           leftover height and scrolls inside itself. Same specificity, later
           in the file, so it won here too — and `1 1 auto` in a ROW means the
           nav shrinks to whatever is left of the width.

           Measured on a 390px phone: #ncnav held 936px of links inside a
           321px box that clipped them, while the strip around it reported
           scrollWidth 390 and so had nothing to scroll. Four of the fifteen
           destinations were reachable and no swipe would reveal the other
           eleven. That is the site's entire navigation on a phone.

           `0 0 auto` lets the nav be its natural 936px, which makes the strip
           genuinely overflow, which is what turns on the scroll the strip has
           always asked for with overflow-x:auto. */
        /* The trailing padding is the sticky profile button's width. Without
           it the last link in the list can never be scrolled out from under
           the button — you reach the end of the scroll and Pricing is still
           behind the avatar. Links passing under it mid-scroll is what a
           pinned element does and is fine; the end of the list not being
           reachable at all is not. */
        '.sidebar #ncnav{flex-direction:row;align-items:center;gap:2px;' +
        'padding:0 60px 0 4px;flex:0 0 auto}' +
        '#ncnav .ncg{flex-direction:row;align-items:center;flex:0 0 auto}' +
        '#ncnav .ncgi{flex-direction:row;align-items:center;flex:0 0 auto}' +
        /* The group headings are collapse toggles for a vertical rail. In a
           strip they are captions in the middle of a line of buttons. */
        '#ncnav .ncgh{display:none}' +
        '#ncnav .ncg.shut .ncgi{display:flex}' +
        /* width:100% on a button in a row flexbox means "as wide as the row",
           and the row is 1300px — so the name broke onto three lines inside a
           64px strip and pushed the avatar off centre. In a strip it is the
           avatar plus one line that does not wrap. */
        /* The strip is navigation. What was in front of the navigation was a
           profile button reading "Set your name" and a NovaClip wordmark —
           250 of a 390px screen, so the only link you could see without
           swiping was Home, on a bar whose entire job is the other fourteen.
           The wordmark goes (you know which site you are on; it is at the top
           of every page anyway) and the profile becomes its avatar, which is
           what a bottom bar does everywhere else. */
        /* !important because the brand carries an inline display:flex, and an
           inline style beats a stylesheet no matter how specific. */
        '.sidebar #ncbrand{display:none !important}' +
        /* The two cards live in #ncfoot now, so the strip shrinks that instead
           of the profile directly: the coins card is already in the top bar's
           badge on a phone, and the profile keeps only its avatar. */
        /* The tag names are in these selectors on purpose. The two cards are
           styled further down this same stylesheet at the same specificity,
           and a later rule wins a tie — so without `a#` and `button#` the
           coins card stayed visible in the strip and ate a third of it. */
        /* Sticky to the right of the scrollport, not simply last in the row.
           Once the nav is allowed its full 936px the foot sits at x=936 —
           off the end of a strip you now have to swipe to reach, and your own
           profile is not something to go looking for. Stuck to the right edge
           it is always there, and the links scroll underneath it.

           It needs its own background for that: without one the link passing
           behind it is drawn through the avatar. The strip's own colour is
           the right one, and it is on --nc-rail1 like the rest of the bar.

           This is also what the hit test was complaining about. `Publish` was
           reported as stolen by the avatar on ten pages: with the nav clipped
           to 321px the foot was laid on top of the last link that fit, so the
           tap landed on the profile. Pinned and painted, that stops being an
           accident and becomes the arrangement. */
        '.sidebar #ncfoot{order:9;flex-direction:row;margin:0;padding:0 2px 0 6px;' +
          'gap:4px;align-items:center;position:sticky;right:0;flex:0 0 auto;' +
          'align-self:stretch;justify-content:center;z-index:2;' +
          'background:var(--nc-rail1,rgba(10,13,24,.96));' +
          'box-shadow:-10px 0 12px -8px var(--nc-shadow,rgba(0,0,0,.6))}' +
        '.sidebar #ncfoot a#nccoins,.sidebar #ncfoot a#nccat{display:none}' +
        '.sidebar #ncfoot button#ncprof{width:auto;flex:0 0 auto;' +
        'margin:0 0 0 4px;padding:5px;border-radius:12px;white-space:nowrap}' +
        '.sidebar #ncfoot #ncprof .ncfb{display:none}' +
        '.sidebar #ncfoot #ncprof .ncav{width:32px;height:32px;border-radius:10px}}',
      /* The nav takes the leftover height and scrolls inside itself, which is
         what pins the foot. Without this the column simply grew past the
         window and the coins card fell off the bottom of an 768px screen —
         sixteen links, four headers, the brand and two cards is about 800px
         of rail. min-height:0 is the part that is easy to miss: a flex item
         will not shrink below its content without it, so overflow-y would
         never have engaged. */
      '#ncnav{display:flex;flex-direction:column;gap:2px;padding:2px 10px 6px;',
      'flex:1 1 auto;min-height:0;overflow-y:auto;scrollbar-width:thin}',

      /* Group header, styled as Trend Spotter's .nc-nav-label: a quiet
         uppercase caption rather than a ruled divider. The gradient line that
         used to run to the right edge is gone with it — that page has none,
         and it was the loudest thing in a column of otherwise soft rows.
         The chevron stays, smaller and fainter: these groups collapse, and a
         header that collapses with nothing to say so is a trap. */
      '#ncnav .ncgh{display:flex;align-items:center;gap:7px;width:100%;min-height:30px;',
      'padding:clamp(7px,1.15vh,14px) 10px clamp(3px,.55vh,7px);background:none;border:0;cursor:pointer;text-align:left;',
      'font:800 10.5px/1 Segoe UI,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;',
      'color:var(--nc-navhead,#5D6A88);transition:color .18s}',
      '#ncnav .ncgh:hover{color:var(--nc-navhover,#A8B8D8)}',
      '#ncnav .ncgh .ncgl{flex:1}',
      '#ncnav .ncgh .ncar{width:12px;height:12px;flex:0 0 auto;transition:transform .22s cubic-bezier(.4,1.4,.5,1);opacity:.45}',
      '#ncnav .ncg.shut .ncar{transform:rotate(-90deg)}',
      /* The layout lives here, not in an inline style. An inline display:flex
         beats any stylesheet rule, so collapsing would silently do nothing. */
      '#ncnav .ncgi{display:flex;flex-direction:column;gap:2px}',
      '#ncnav .ncg.shut .ncgi{display:none}',

      /* the row. position:relative for the active rail; the gradient sits in a
         ::before at opacity 0 so hovering fades it rather than snapping. */
      /* 38px, which is the balance point. At the original 31 these were the
         hardest thing on the site to hit; at 44 the rail grew from 484px to
         734px and read as mostly empty space, which was the next thing
         reported. 38 is still well above the 24px minimum the guidelines
         ask for, and sixteen rows fit without the column feeling padded. */
      '.sidebar #ncnav a.ncl{position:relative;display:flex;align-items:center;gap:11px;margin:0;min-height:38px;',
      /* Sixteen links at a fixed 50px each, plus six group headers and the
         brand and profile blocks, is 1112px of nav. That fits a 1280x800
         laptop only because the groups collapse below 820px tall — between
         about 860 and 1120 nothing collapses and nothing fits either, so the
         rail scrolls and the last two links sit under the fold. A nav you
         have to scroll to reach is a nav with a hidden half. The row height
         is a share of the window now: tighter on a short screen, roomier on
         a tall one. */
      /* Trend Spotter's .nc-nav-item, now the whole site's. Its states are a
         background and a border rather than the old lit gradient with a bar
         welded to the left edge — softer, and it does not shift the row when
         it turns on. The border is transparent when idle so nothing moves by
         a pixel between states. */
      'padding:clamp(5px,.8vh,10px) 12px;border-radius:11px;font:700 14px/1.2 Segoe UI,system-ui,sans-serif;',
      'color:var(--nc-navlink,#98A6C4);text-decoration:none;border:1px solid transparent;',
      'background:none;transition:background .15s,color .15s,border-color .15s,transform .12s}',
      '.sidebar #ncnav a.ncl:hover{color:var(--nc-navon,#EAF2FF);background:var(--nc-navhoverbg,rgba(255,255,255,.04))}',
      '.sidebar #ncnav a.ncl:active{transform:scale(.985)}',
      '.sidebar #ncnav a.ncl:focus-visible{outline:2px solid #00E5FF;outline-offset:2px}',

      /* active: a violet-to-cyan wash with a violet edge, exactly as on the
         Trend Spotter page. No left rail, no ::before, no glow. */
      '.sidebar #ncnav a.ncl.on{color:var(--nc-navon,#fff);',
      'background:var(--nc-navonbg,linear-gradient(90deg,rgba(167,139,250,.16),rgba(56,189,248,.08)));',
      'border-color:var(--nc-navonline,rgba(167,139,250,.28))}',

      /* 19px icons that answer the state: muted at rest, blue on hover,
         violet when the row is the page you are on. */
      '.sidebar #ncnav a.ncl .nci{width:19px;height:19px;flex:0 0 auto;color:var(--nc-navhead,#5D6A88);',
      'opacity:1;transition:color .15s,transform .18s}',
      '.sidebar #ncnav a.ncl:hover .nci{color:var(--nc-navicohover,#38BDF8)}',
      '.sidebar #ncnav a.ncl.on .nci{color:var(--nc-navicoon,#A78BFA)}',
      '.sidebar #ncnav a.ncl .nct{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',

      /* ------------------------------------------------------------------
         THE FOOT: coins card, then profile card
         ------------------------------------------------------------------
         Trend Spotter's .nc-points-card and .nc-profile-card. Same 18px
         radius, same 12px/14px padding, same two-line block of a bold value
         over a small uppercase caption — so the two pages stop looking like
         two products.
         ------------------------------------------------------------------ */
      '.sidebar #ncfoot{margin-top:auto;display:flex;flex-direction:column;gap:10px;padding:12px 2px 4px}',
      '.sidebar #ncfoot #nccat,.sidebar #ncfoot #nccoins,.sidebar #ncfoot #ncprof{display:flex;align-items:center;gap:12px;',
      'width:100%;margin:0;padding:12px 14px;border-radius:18px;text-align:left;cursor:pointer;',
      'border:1px solid var(--nc-railline,rgba(255,255,255,.08));color:inherit;font:inherit;',
      'text-decoration:none;transition:background .15s,border-color .15s,transform .12s}',
      '.sidebar #ncfoot #nccoins{background:var(--nc-coinbg,linear-gradient(135deg,rgba(167,139,250,.12),rgba(244,114,182,.08)))}',
      '.sidebar #ncfoot #ncprof,.sidebar #ncfoot #nccat{background:var(--nc-cardbg,rgba(255,255,255,.03))}',
      '.sidebar #ncfoot #nccat:hover,.sidebar #ncfoot #nccoins:hover,.sidebar #ncfoot #ncprof:hover{border-color:var(--nc-navonline,rgba(167,139,250,.28))}',
      '.sidebar #ncfoot #nccoins:active,.sidebar #ncfoot #ncprof:active{transform:scale(.985)}',
      '.sidebar #ncfoot #nccoins:focus-visible,.sidebar #ncfoot #ncprof:focus-visible{outline:2px solid #00E5FF;outline-offset:2px}',
      /* the gradient tile the coin icon sits in */
      '.sidebar #ncfoot .ncfi{width:38px;height:38px;border-radius:12px;flex:0 0 auto;display:grid;',
      'place-items:center;color:#fff;background:linear-gradient(135deg,#F72585,#7C5CFF,#00E5FF);',
      'box-shadow:0 4px 16px rgba(124,92,255,.35)}',
      '.sidebar #ncfoot .ncfi svg{width:19px;height:19px}',
      /* the avatar, square-cornered like Trend Spotter's rather than a circle */
      '.sidebar #ncfoot .ncav{width:40px;height:40px;border-radius:12px;flex:0 0 auto;object-fit:cover}',
      '.sidebar #ncfoot .ncave{display:grid;place-items:center;font-size:19px;',
      'background:linear-gradient(135deg,var(--nc-rail1,#0E1220),var(--nc-rail3,#080B14));',
      'border:1px solid var(--nc-railline,rgba(255,255,255,.12))}',
      /* value over caption */
      '.sidebar #ncfoot .ncfb{display:flex;flex-direction:column;min-width:0;line-height:1.2}',
      '.sidebar #ncfoot .ncfb b{font-weight:900;font-size:.95rem;letter-spacing:-.01em;',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--nc-navon,#EAF2FF)}',
      '.sidebar #ncfoot #nccoins .ncfb b{font-size:1.05rem;font-family:ui-monospace,Consolas,monospace}',
      '.sidebar #ncfoot .ncfb i{font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.1em;',
      'text-transform:uppercase;color:var(--nc-navhead,#5D6A88);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',

      /* The foot claims the free space now, so this must not also claim it —
         two auto margins in a flex column split the gap and would have left
         a hole between the cards and the controls. */
      '.sidebar .themewrap{border-top:1px solid rgba(255,255,255,.06);margin-top:0;position:sticky;bottom:0;z-index:2;background:var(--nc-rail3,#080B14)}',

      /* phones: a horizontal strip, icons above labels so it stays readable */
      '@media (max-width:760px){',
      '.sidebar{background:var(--nc-rail1,rgba(10,13,24,.96)) !important;box-shadow:0 -8px 30px var(--nc-shadow,rgba(0,0,0,.6))}',
      '#ncnav{flex-direction:row;padding:0;gap:0}',
      '#ncnav .ncgh{display:none}#ncnav .ncg{display:flex}#ncnav .ncg.shut .ncgi{display:flex}',
      '#ncnav .ncgi{flex-direction:row}',
      '.sidebar #ncnav a.ncl{flex-direction:column;gap:3px;white-space:nowrap;padding:7px 13px;',
      'border-radius:12px;font-size:10.5px;letter-spacing:.01em}',
      '.sidebar #ncnav a.ncl:hover{transform:none}',
      '.sidebar #ncnav a.ncl .nci{width:19px;height:19px}',
      '.sidebar #ncnav a.ncl.on::after{left:50%;top:auto;bottom:-1px;transform:translateX(-50%);',
      'width:20px;height:3px;border-radius:3px 3px 0 0}}'
    ].join('');
    document.head.appendChild(st);
  }

  /* --------------------------------------------------------------------
     HOW TALL IS THE PHONE STRIP, AND IS IT AT THE TOP?
     --------------------------------------------------------------------
     On a phone the rail becomes a horizontal strip. Most pages let it sit
     at the bottom of the screen; analytics.html pins its own .sidebar to
     `position:static`, so on that page the strip flows directly under the
     top bar instead — and the Nova pill, parked at a fixed 60px, landed
     right on top of it. In English as well as in Farsi; the RTL sweep is
     just what finally surfaced it.

     Rather than special-casing that page, measure. If the strip is up at
     the top, publish its height and the pill's own rule adds it on.
     -------------------------------------------------------------------- */
  function ncStripHeight() {
    var el = document.querySelector('.sidebar');
    var root = document.documentElement;
    if (!el || innerWidth > 760) { root.style.setProperty('--nc-strip-h', '0px'); return; }
    var b = el.getBoundingClientRect();
    /* "at the top" means it starts in the upper third and is short — a
       bottom-docked strip and a full-height rail both fail that. */
    var docked = b.top < innerHeight / 3 && b.height < innerHeight / 2;
    root.style.setProperty('--nc-strip-h', docked ? Math.round(b.height) + 'px' : '0px');
  }
  addEventListener('resize', ncStripHeight, { passive: true });
  setTimeout(ncStripHeight, 0);

  /* --------------------------------------------------------------------
     LAND ON THE PAGE YOU ARE ACTUALLY ON.
     --------------------------------------------------------------------
     Fifteen destinations in a strip that shows four means eleven of them
     are behind a swipe. That is survivable for going somewhere else; it is
     not survivable for knowing where you are, because the strip always
     starts at the left and the highlighted link is usually not there. On
     biometrics.html — the eleventh link — the bar looked exactly as it does
     on the home page.

     So scroll the active one into view once, at the start. `nearest` and
     not `center`: for the first few links the answer is "do not move", and
     centring Home would scroll Studio and Trend Spotter off the left for
     no reason. Instant rather than smooth — this is the state the page
     opens in, not an animation somebody asked for.
     -------------------------------------------------------------------- */
  function ncStripFocus() {
    if (innerWidth > 760) return;
    var el = document.querySelector('.sidebar #ncnav a.ncl.on');
    if (!el || !el.scrollIntoView) return;
    try {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    } catch (e) {
      /* behavior:'instant' is newer than the rest of this; if it is not
         understood the call throws rather than falling back. */
      try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e2) {}
    }
  }
  setTimeout(ncStripFocus, 0);

  /* Any link the page shipped with is replaced. Keeping them would mean two
     navigations disagreeing about where things are. */
  [...bar.querySelectorAll('a')].forEach(a => {
    if (a.id === 'ncbrand') return;
    /* The foot's cards are ours, and the coins one is an <a> — it was being
       swept up here and deleted the moment the nav was built, which is why it
       rendered and then vanished. Anything inside #ncfoot stays. */
    if (a.closest('#ncfoot')) return;
    a.remove();
  });

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const nav = document.createElement('nav');
  nav.id = 'ncnav';

  /* On a short screen, only the group you are in is open.

     This used to be `innerHeight >= 820`, a number picked when the list had
     eleven rows. It has sixteen now, so between roughly 860 and 1130 tall
     nothing collapsed and nothing fitted either: the rail scrolled and the
     last links sat under the fold, which is the one thing a nav must never
     do. Guessing a new number would just move the broken band somewhere else.

     So it is measured instead. Build it open, and if it does not fit, shut
     every group except the one you are in and measure again. The threshold
     is "does this fit", which is the actual question. */
  let roomy = true;

  NC_NAV.forEach(group => {
    const mine = group.items.some(it => it[0].toLowerCase() === here);
    const g = document.createElement('div');
    g.className = 'ncg' + (group.name && !mine && !roomy ? ' shut' : '');

    if (group.name) {
      const h = document.createElement('button');
      h.className = 'ncgh';
      h.type = 'button';
      h.innerHTML = '<span' + (group.key ? ' data-t="' + group.key + '"' : '') + '>' + group.name + '</span><span class="ncgl"></span>' +
        '<svg class="ncar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
      h.setAttribute('aria-expanded', String(!g.classList.contains('shut')));
      h.onclick = () => {
        g.classList.toggle('shut');
        h.setAttribute('aria-expanded', String(!g.classList.contains('shut')));
      };
      g.appendChild(h);
    }

    const box = document.createElement('div');
    box.className = 'ncgi';
    group.items.forEach(([href, label, key, icon]) => {
      const a = document.createElement('a');
      const on = href.toLowerCase() === here;
      a.className = 'ncl' + (on ? ' on' : '');
      a.href = href;
      if (on) a.setAttribute('aria-current', 'page');
      /* data-t goes on the label span, never on the <a>. applyLang() assigns
         textContent, which on the anchor would delete the icon inside it. */
      a.innerHTML = ncIcon(icon) + '<span class="nct"' +
        (key ? ' data-t="' + key + '"' : '') + '>' + label + '</span>';
      box.appendChild(a);
    });
    g.appendChild(box);
    nav.appendChild(g);
  });

  /* above the language box, below the logo and the profile button */
  const tail = bar.querySelector('.themewrap');
  tail ? bar.insertBefore(nav, tail) : bar.appendChild(nav);

}


/* ============================================================================
   THE SITE'S AI KEY, AND ONE WAY TO ASK
   ============================================================================
   Every AI feature on the site used to reach the model its own way. That is
   how you end up with four copies of the same fetch and only three of them
   handling a 429. There is one function now: ncAsk().

   There are two routes to a model and the difference matters:

     THE SITE WORKER   the default. The key lives on the Cloudflare Worker, not
                       in the page, which is the only correct place for it —
                       anything shipped to a browser is public, and a Gemini key
                       in a static file is a key someone else is spending.

     YOUR OWN KEY      optional. If you paste a key into your profile it is used
                       instead, straight from your browser to Google. It stays
                       in this browser. Two honest warnings go with that and
                       both are shown in the UI: the request is visible in your
                       own network tab, and the spend is yours.

   The reason to offer the second at all is that the worker is one free tier
   shared by everyone here. When it is rate-limited, a key of your own is the
   difference between the feature working and a shrug.
   ============================================================================ */
const NC_AI_WORKER = 'https://novaclip-ai.eskondori-pt.workers.dev';
const NC_AI_DIRECT = 'https://generativelanguage.googleapis.com/v1beta/models/';

/* The active AI provider. ?ncai=openrouter on the URL or the nc_ai_provider
   localStorage value override the default for the whole site — every feature
   that calls ncAsk honors it, so one selection swaps every AI feature at once.
   Unknown ids fall back to gemini, the always-on default. */
function ncActiveProvider() {
  try {
    const q = new URLSearchParams(location.search).get('ncai');
    if (q && /^(gemini|openrouter|openai|local)$/.test(q)) return q;
    const ls = localStorage.getItem('nc_ai_provider');
    if (ls && /^(gemini|openrouter|openai|local)$/.test(ls)) return ls;
  } catch (e) { /* storage may be off in a privacy mode — fall through */ }
  return 'gemini';
}

function ncDefaultModel(provider) {
  if (provider === 'openrouter') return 'openai/gpt-4o-mini';
  if (provider === 'openai') return 'gpt-4o-mini';
  if (provider === 'local') return ncLocalModel();
  return 'gemini-3.6-flash';
}

/* ---------------------------------------------------------------------------
   THE MODEL ON YOUR OWN MACHINE
   ---------------------------------------------------------------------------
   Ollama serves an HTTP API on localhost:11434. With it running, every AI
   feature on this site can be answered by a model on the visitor's own
   computer: no key, no quota, no request leaving the machine, and it works
   with the wifi off.

   TWO THINGS ABOUT BROWSERS THAT WILL OTHERWISE WASTE AN HOUR.

   Mixed content: a page on https normally may not fetch http. localhost is
   the exception — the spec calls it "potentially trustworthy", so Chrome and
   Edge allow https://novaclip.org to reach http://localhost:11434. Other
   browsers have been stricter at times; if it is refused there, the site has
   to be opened over http for this provider to work.

   CORS: Ollama answers only origins it has been told about, and by default
   that does not include this site. It is set on the OLLAMA_ORIGINS
   environment variable before Ollama starts. Without it the request is
   blocked by the browser and the failure looks identical to Ollama not
   running, which is why ncLocalCheck below reports them apart.
   --------------------------------------------------------------------------- */
const NC_LOCAL_DEFAULT = 'http://localhost:11434';

function ncLocalUrl() {
  try { return (localStorage.getItem('nc_local_url') || NC_LOCAL_DEFAULT).replace(/\/+$/, ''); }
  catch (e) { return NC_LOCAL_DEFAULT; }
}
function ncSetLocalUrl(u) {
  try { u ? localStorage.setItem('nc_local_url', u) : localStorage.removeItem('nc_local_url'); } catch (e) {}
}
/* A 3B model rather than the 7B: it is about 2GB, which fits alongside a
   browser on a 16GB machine without closing anything, and a tool that runs
   beats a better one that swaps. */
function ncLocalModel() {
  try { return localStorage.getItem('nc_local_model') || 'qwen2.5:3b'; } catch (e) { return 'qwen2.5:3b'; }
}
function ncSetLocalModel(m) {
  try { m ? localStorage.setItem('nc_local_model', m) : localStorage.removeItem('nc_local_model'); } catch (e) {}
}

/* Is it there, and what has it got? Returns { ok, models, err } and never
   throws. The three failures it separates are the three that actually happen:
   nothing listening, listening but refusing this origin, and running with the
   wrong model pulled. */
async function ncLocalCheck() {
  const url = ncLocalUrl();
  try {
    const res = await fetch(url + '/api/tags', { method: 'GET' });
    if (!res.ok) return { ok: false, models: [], err: 'Ollama answered ' + res.status + '.' };
    const j = await res.json();
    const models = (j.models || []).map(m => m.name);
    return {
      ok: true, models: models, err: models.length ? '' :
        'Ollama is running but has no models. Run: ollama pull ' + ncLocalModel()
    };
  } catch (e) {
    /* fetch rejects the same way for "nothing is listening" and "CORS said
       no", so both possibilities are named rather than guessed between. */
    return { ok: false, models: [], err:
      'No answer from ' + url + '. Either Ollama is not running, or it has not been ' +
      'told to accept this site — set OLLAMA_ORIGINS=' + location.origin + ' and restart it.' };
  }
}

/* Models that answered 400 when told how much to think. Learned at runtime
   rather than listed, and per session — a page load is cheap to re-learn on,
   and a stale list is what this replaces. */
const NC_NO_THINKING = new Set();

function ncAIKey()     { try { return localStorage.getItem('nc_ai_key') || ''; } catch (e) { return ''; } }
function ncSetAIKey(k) { try { k ? localStorage.setItem('nc_ai_key', k) : localStorage.removeItem('nc_ai_key'); } catch (e) {} }

/* A Gemini key is 39 characters starting AIza. Checking the shape before the
   first request turns "the AI is broken" into "that is not a key", which is a
   much shorter conversation. */
function ncKeyLooksReal(k) { return /^AIza[\w-]{30,}$/.test((k || '').trim()); }

/* Returns { text, image, err }. It never throws and it never returns a made-up
   answer: if the model could not be reached, err says so and text is empty, so
   callers can tell "it said nothing" apart from "it could not be asked".

   opts: { provider, model, temperature, maxTokens, search }. provider defaults to
   the active selection (ncActiveProvider); model defaults per provider. A personal
   key applies only to gemini — an AIza key cannot be spent at OpenRouter or
   OpenAI, so those two always go through the worker's shared key. search:true
   grounds the answer in a live Google Search (Gemini-only; the tools: block is
   what asks Google to look it up) and returns the hits in sources. */
/* Vendor error text is written for whoever wrote the request, not for whoever
   is sitting in front of the page. "Request contains an invalid argument" is a
   true sentence that helps a thirteen-year-old with none of it, and it is the
   one they see most, so the handful that actually recur get put into words
   about what to do next. Anything unrecognised is passed through untouched —
   a wrong-but-specific message still beats a vague friendly one. */
function ncSayWhy(reason, status) {
  const r = String(reason || '');
  if (!r) return '';
  if (/invalid argument/i.test(r))
    return 'The AI refused the request as malformed. This is a NovaClip bug rather than ' +
           'anything you did — try once more, and if it keeps happening the model this site ' +
           'asks for has probably changed under it.';
  if (/quota|rate limit|resource has been exhausted/i.test(r))
    return 'NovaClip\'s shared AI is out of free requests for now. Add your own key in your ' +
           'profile to keep going, or come back in a few minutes.';
  if (/api key not valid|invalid api key|api_key_invalid/i.test(r))
    return 'The key this site uses was rejected by Google. If it is your own key, check it in ' +
           'your profile; if not, whoever deployed the worker needs to replace it.';
  if (/safety|blocked|harm/i.test(r))
    return 'The AI would not answer that one. Rephrasing usually works.';
  /* Ollama says: model "qwen2.5:3b" not found, try pulling it first — which is
     exactly right and exactly actionable, so it is passed through with the
     command rather than replaced by something vaguer. */
  if (/try pulling it|not found, try pulling/i.test(r))
    return 'That model is not on this machine yet. In a terminal: ollama pull ' + ncLocalModel();
  if (/not found|does not exist/i.test(r))
    return 'The AI model this page asks for is no longer available. It needs updating in ' +
           'nova.js and on the worker.';
  if (status === 503 || /overloaded|unavailable/i.test(r))
    return 'The AI is overloaded right now. Wait a moment and try again.';
  return r;
}

async function ncAsk(prompt, opts) {
  opts = opts || {};
  const provider = opts.provider || ncActiveProvider();
  const model = opts.model || ncDefaultModel(provider);
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: opts.temperature == null ? 0.7 : opts.temperature }
  };
  if (opts.maxTokens) body.generationConfig.maxOutputTokens = opts.maxTokens;
  if (opts.search) body.tools = [{ google_search: {} }];

  /* THINKING TOKENS COUNT AGAINST maxOutputTokens.
     A thinking Gemini reasons before it answers, and that reasoning is billed
     to the same budget as the reply — but it is not returned, so from the page
     it looks like the model simply stopped mid-sentence. Publish asked for 1200
     tokens of edit plan, the model spent most of them thinking, and what came
     back was half a JSON object. The page called that "unreadable", which sent
     us looking at the key and the worker for an hour.

     Every JSON-shaped feature here wants the answer, not the reasoning, so
     thinking is off by default and opt-in per call with { think: true }.

     Which models accept the field is NOT hard-coded. It was, against
     gemini-2.5-flash, and then the default model became gemini-3.6-flash and
     the rule silently stopped matching — a list of model names is a thing that
     goes stale without failing loudly. Sending the field to a model that does
     not take it is a 400, so instead it is sent, and a rejection that names it
     is caught below and retried once without it. The answer is remembered for
     the rest of the session, so it costs one wasted call per model per page. */
  const wantThinking = provider === 'gemini' && !NC_NO_THINKING.has(model);
  if (wantThinking) {
    body.generationConfig.thinkingConfig = { thinkingBudget: opts.think ? -1 : 0 };
  }

  const own = provider === 'gemini' ? ncAIKey() : '';
  let data = null, err = '';
  try {
    let r, raw;

    /* One request, in a form both routes take. Called twice at most: once as
       asked, and once more without thinkingConfig if that is what was refused. */
    async function send() {
      /* Ollama speaks its own request and reply shape. Rather than teach every
         caller of ncAsk a second one, the reply is translated here into the
         shape the rest of this function already reads — so a page that asks
         for an edit plan cannot tell which machine answered. */
      if (provider === 'local') {
        const res = await fetch(ncLocalUrl() + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            stream: false,
            messages: [{ role: 'user', content: prompt }],
            options: {
              temperature: body.generationConfig.temperature,
              /* Ollama's own name for the cap, and unlike Gemini it does not
                 spend any of it thinking. */
              num_predict: opts.maxTokens || -1
            }
          })
        });
        const txt = await res.text().catch(function () { return ''; });
        if (!res.ok) return { res: res, raw: txt };
        let j = null;
        try { j = JSON.parse(txt); } catch (e) { return { res: res, raw: txt }; }
        const said = (j.message && j.message.content) || j.response || '';
        return {
          res: res,
          raw: JSON.stringify({
            candidates: [{
              content: { parts: [{ text: said }] },
              finishReason: j.done_reason === 'length' ? 'MAX_TOKENS' : 'STOP'
            }]
          })
        };
      }
      if (ncKeyLooksReal(own)) {
        /* The key goes in a header, not in ?key=. A URL is the most-copied
           string in a browser: it lands in history, in devtools, in any
           extension that watches requests, and in the Referer of anything the
           page loads next. A header is none of those places. Google accepts
           x-goog-api-key for exactly this reason, and ai-worker.js has always
           used it — this was the one call that did not. */
        const res = await fetch(NC_AI_DIRECT + model + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': own.trim() },
          body: JSON.stringify(body)
        });
        return { res: res, raw: await res.text().catch(function () { return ''; }) };
      }
      const res = await fetch(NC_AI_WORKER, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: provider, model: model, payload: body, search: opts.search === true }) });
      return { res: res, raw: await res.text().catch(function () { return ''; }) };
    }

    let out = await send();

    /* "This model does not know what thinkingConfig is." Drop it, remember
       that, and ask again — otherwise a model rename turns every AI feature on
       the site off at once.

       This used to fire only when the refusal mentioned "thinking" or
       "thought", which assumed Google names the field it rejected. It very
       often does not: the reply is the bare

         Request contains an invalid argument.

       with nothing pointing at a cause. So the retry never ran, publish.html
       showed that sentence to a fourteen-year-old, and the self-healing this
       whole block exists for did nothing.

       Any 400 is now enough to try once more without the field. The cost is
       one extra call, only on a request that already failed, only while
       thinkingConfig was in it — and the answer is remembered for the session,
       so a model that rejects it costs one wasted call per page rather than
       one per feature. If the second attempt fails too, its error is the one
       reported, so a genuine problem is not hidden behind the retry. */
    if (out.res.status === 400 && wantThinking && body.generationConfig.thinkingConfig) {
      NC_NO_THINKING.add(model);
      delete body.generationConfig.thinkingConfig;
      out = await send();
    }

    /* ------------------------------------------------------------------
       RAN OUT OF ROOM? ASK AGAIN WITH MORE ROOM.
       ------------------------------------------------------------------
       Every caller here asks for one JSON object, and half a JSON object is
       worth nothing — so a MAX_TOKENS finish is not a result, it is a failed
       call that happens to have a body.

       What the pages did instead was tell the reader to type less. Publish
       said "a shorter description usually gets a complete one" to somebody
       whose description was "Neymar playing football": three words, and the
       advice was both useless and wrong about whose fault it was. The length
       of the question is almost never what filled the budget.

       What fills it is thinking. The block above exists because some models
       refuse thinkingConfig, and when one does, the retry goes out with
       thinking ON — and a reasoning model can spend a thousand tokens before
       it writes its first brace. Neither the caller nor the reader can see
       any of that; from the page it looks like the model stopped mid-word.

       So: one more attempt, with three times the budget, only when the answer
       came back truncated. Bounded — it never loops, and it only ever costs a
       second call on a request that already failed. */
    try {
      const first = JSON.parse(out.raw || '{}');
      const why = first.candidates && first.candidates[0] && first.candidates[0].finishReason;
      const asked = body.generationConfig.maxOutputTokens;
      if (why === 'MAX_TOKENS' && asked && !opts.__widened) {
        body.generationConfig.maxOutputTokens = Math.min(asked * 3, 8192);
        opts.__widened = true;
        out = await send();
      }
    } catch (e) { /* not JSON, or no candidates — the paths below report it */ }

    r = out.res; raw = out.raw;
    if (ncKeyLooksReal(own)) {
      if (r.status === 400 || r.status === 403) err = 'That key was refused by Google. Check it in your profile.';
      else if (r.status === 429) err = 'Your own key is out of quota for now.';
    }

    /* Both Google and ai-worker.js explain a failure in the body; the status
       alone is the least useful part of it. "The AI service answered 500." is
       what this page used to say when the worker was sitting there telling us
       its key was missing. */

    if (!err && !r.ok) {
      let reason = '';
      try {
        const j = JSON.parse(raw || '{}');
        reason = j.error && (typeof j.error === 'string' ? j.error : j.error.message) || '';
      } catch (e) {}
      err = ncSayWhy(reason, r.status) || ('The AI service answered ' + r.status + '.');
      /* A 5xx with nothing to say is the one case where the status really is all
         we know, so name the likely cause rather than leaving a bare number. */
      if (!reason && r.status >= 500) {
        err = 'The AI service answered ' + r.status + '. That usually means the ' +
              'NovaClip worker is misconfigured — open ' + NC_AI_WORKER + '/health to see. ' +
              'Adding your own key in your profile works around it.';
      }
    }
    if (!err) {
      try { data = JSON.parse(raw); }
      catch (e) { err = 'The AI service sent something that was not an answer.'; }
    }
  } catch (e) {
    /* For a model on this machine the connection is not the suspect, and
       "check your connection" sends someone to their router over a service
       that is simply not started. */
    err = provider === 'local'
      ? 'No answer from ' + ncLocalUrl() + '. Start Ollama, or check it is allowed ' +
        'to answer this site (OLLAMA_ORIGINS=' + location.origin + ').'
      : 'Could not reach the AI. Check your connection.';
  }
  if (err) return { text: '', image: '', err: err };

  let text = '', image = '';
  const cand = data && data.candidates && data.candidates[0];
  const parts = cand && cand.content && cand.content.parts;
  (parts || []).forEach(p => {
    if (p.text) text += p.text;
    if (p.inlineData) image = 'data:image/png;base64,' + p.inlineData.data;
  });

  /* Why it stopped, not just that it stopped. A truncated answer and a refused
     one both arrive as "no usable text", and telling a user to try again is
     only good advice for one of them. */
  const finish = (cand && cand.finishReason) || '';
  const blocked = (data && data.promptFeedback && data.promptFeedback.blockReason) || '';
  const cut = finish === 'MAX_TOKENS';

  if (!text && !image) {
    if (blocked || finish === 'SAFETY') {
      err = 'The AI declined to answer that one. Rephrase it and try again.';
    } else if (cut) {
      /* The retry above already tripled the budget, so reaching here means it
         filled a very large one without writing a word. Almost always the
         model reasoning past its own limit; almost never the question. */
      err = 'The AI used up its whole budget without writing an answer — twice. '
          + 'That is the model, not your question. Try once more.';
    } else {
      err = 'The AI returned nothing that time. Try again.';
    }
  }

  /* Live-search hits, when search:true was asked for. Gemini puts them in
     groundingMetadata — top-level in some versions, on the candidate in others.
     Only real pages are listed: Gemini also names the search tool itself, and a
     source list that starts with "Google Search" is noise. */
  const gm = data && (data.groundingMetadata ||
    (data.candidates && data.candidates[0] && data.candidates[0].groundingMetadata));
  const chunks = gm && gm.groundingChunks || [];
  const sources = [];
  chunks.forEach(c => {
    if (c.web && c.web.uri && c.web.title) sources.push({ uri: c.web.uri, title: c.web.title });
  });

  return { text: text, image: image, sources: sources, err: err, cut: cut, finish: finish };
}

/* ============================================================================
   READING JSON OUT OF AN ANSWER
   ============================================================================
   Four pages ask the model for JSON and then have to find it in a reply that
   may be fenced, prefaced with "Sure!", or cut off mid-object. The obvious
   /\{[\s\S]*\}/ is wrong in the last case: it runs from the first brace to the
   LAST one in the string, and in a truncated answer that last brace closes an
   inner object, so the match is unbalanced and never parses.

   This walks the text instead, ignoring braces inside strings, and returns the
   first balanced value. Returns null when there is no complete one — which is
   a real answer to "did it send me JSON", unlike a throw.

   The subtlety is which opening brace to trust. Scanning for "the first brace
   that balances" is not enough: in a truncated plan the outer object never
   closes but the step objects inside it do, so that rule hands back one step
   and the page shows a confident, wrong, one-line plan. Silently wrong is worse
   than the error this replaced.

   So a brace only counts as a start if what follows it could begin real JSON —
   a quoted key, or an empty object. That skips prose ("use { curly braces }")
   while committing to the genuine outer object, and when that one does not
   close we stop rather than descend into its wreckage, because everything after
   it is a fragment of it.
   ============================================================================ */
function ncJSON(text) {
  if (!text) return null;
  const fence = String(text).match(/```(?:json)?\s*([\s\S]*?)```/i);
  const s = fence ? fence[1] : String(text);

  for (let i = 0; i < s.length; i++) {
    const open = s[i];
    if (open !== '{' && open !== '[') continue;
    const rest = s.slice(i + 1).replace(/^\s+/, '');
    const plausible = open === '{'
      ? /^["}]/.test(rest)
      : /^[["\d\-{\]]|^(true|false|null)/.test(rest);
    if (!plausible) continue;

    const close = open === '{' ? '}' : ']';
    let depth = 0, inStr = false, esc = false, balanced = false;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === open) depth++;
      else if (c === close && --depth === 0) {
        balanced = true;
        try { return JSON.parse(s.slice(i, j + 1)); } catch (e) { break; }
      }
    }
    /* Balanced but unparseable is a bad candidate — keep looking. Never
       balanced means the answer stops inside this value, and nothing further
       along is a sibling of it. */
    if (!balanced) return null;
  }
  return null;
}
window.ncJSON = ncJSON; window.ncSayWhy = ncSayWhy;

window.ncAIKey = ncAIKey; window.ncSetAIKey = ncSetAIKey;
window.ncKeyLooksReal = ncKeyLooksReal; window.ncAsk = ncAsk;
/* The local-model controls, so a page (or the console) can point the site at
   a model on this machine and check whether it is actually there. */
window.ncLocalCheck = ncLocalCheck; window.ncLocalUrl = ncLocalUrl;
window.ncSetLocalUrl = ncSetLocalUrl;
window.ncLocalModel = ncLocalModel; window.ncSetLocalModel = ncSetLocalModel;
/* One call to move every AI feature on the site onto your own machine, and
   the same call with no argument to put it back. */
window.ncUseLocal = function (on) {
  try {
    if (on === false) localStorage.removeItem('nc_ai_provider');
    else localStorage.setItem('nc_ai_provider', 'local');
  } catch (e) {}
  return ncActiveProvider();
};
window.ncActiveProvider = ncActiveProvider; window.ncDefaultModel = ncDefaultModel;
/* The worker's address, exported for the same consumers that use ncAsk:
   hype.js, moderate.js and nova-globe.js all reach it through this. jarvis.js
   used it too, for the /tts endpoint its voice spoke through; that file and
   that voice are gone, the other three are not. */
window.NC_AI_WORKER_URL = NC_AI_WORKER;

/* ============================================================================
   THE SELF-CHECK — "how do I know this is not still a demo?"
   ============================================================================
   Several things on this site have two modes, and from the outside they look
   identical. Checkout either charges a card or plays a convincing animation.
   The community pages either reach a Worker or fall back to this browser
   alone. The AI either reaches a Worker holding a key or refuses. Signing in
   with Google is a fourth, separate thing that does not switch any of the
   other three on — which is the confusion this exists to end.

   So each row here is answered by actually asking, not by assuming. Both
   Workers already say which of the two they are at /health, because deploying
   one at the other's address is the mistake that made every AI feature answer
   500 — and a self-check that trusted the address would have reported that
   catastrophe as fine.

   Nothing here prints a secret. A key is "set" or "not set"; that is the whole
   vocabulary, and it is deliberate.
   ============================================================================ */
function ncYouTube() {
  try {
    const s = JSON.parse(localStorage.getItem('nc_yt') || 'null');
    if (s && s.exp > Date.now()) return { on: true, channel: s.channel || '' };
    if (s) return { on: false, expired: true, channel: s.channel || '' };
  } catch (e) {}
  return { on: false };
}

async function ncProbe(base, want) {
  if (!base) return { live: false, why: 'No address configured.' };
  try {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 8000) : 0;
    const r = await fetch(base.replace(/\/$/, '') + '/health', ctl ? { signal: ctl.signal } : undefined);
    clearTimeout(timer);
    const body = await r.json().catch(() => ({}));
    /* The wrong Worker at the right address answers 200 and looks healthy.
       This is the check that catches it. */
    if (body.worker && body.worker !== want)
      return { live: false, why: 'This address is running the ' + body.worker +
        ' Worker, not the ' + want + ' one. The two are swapped.' };
    if (!body.worker)
      return { live: false, why: 'Answered, but not as a NovaClip Worker — check the address.' };
    if (!body.ok)
      return { live: false, why: want === 'ai'
        ? 'Deployed, but no GEMINI_API_KEY secret is set on it.'
        : 'Deployed, but its DB KV namespace is not bound.' };
    return { live: true, why: 'Answering as the ' + want + ' Worker, configured.' };
  } catch (e) {
    return { live: false, why: 'No answer from ' + base + ' — not deployed, or the address is wrong.' };
  }
}

async function ncDiag() {
  const yt = ncYouTube();
  const rows = [{
    name: 'Google sign-in',
    live: yt.on,
    detail: yt.on
      ? 'Signed in' + (yt.channel ? ' as ' + yt.channel : '') + '. Real YouTube data.'
      : (yt.expired
        ? 'The hour-long session ran out. Sign in again in Studio.'
        : 'Not signed in. Studio and Analytics show nothing until you do.'),
    fix: 'app.html'
  }];

  /* Payments cannot be checked from here: the Stripe links live in
     pricing.html. It records what it found last time it was open, and this
     says so rather than guessing. */
  let pay = null;
  try { pay = localStorage.getItem('nc_pay_mode'); } catch (e) {}
  rows.push({
    name: 'Payments',
    live: pay === 'stripe',
    detail: pay === 'stripe' ? 'Stripe Payment Links are configured — checkout charges for real.'
      : pay === 'demo' ? 'DEMO. No Stripe Payment Links are filled in, so checkout is a simulation and no card is charged.'
      : 'Not checked yet — open the Pricing page once and come back.',
    fix: 'pricing.html'
  });

  const [ai, srv] = await Promise.all([
    ncProbe(NC_AI_WORKER, 'ai'),
    ncProbe(ncServer(), 'leaderboard')
  ]);
  rows.push({ name: 'AI', live: ai.live, detail: ai.why +
    (ncAIKey() ? ' Your own key is set in this browser, so AI works either way.' : '') });
  rows.push({ name: 'Accounts and scores', live: srv.live, detail: srv.why });
  return rows;
}
window.ncDiag = ncDiag; window.ncYouTube = ncYouTube;

/* ============================================================================
   THE EDITOR'S EXTRA TOOLS
   ============================================================================
   animator.js adds the paper animation and the object remover to the editor.
   It was supposed to be loaded by a script tag in editor.html — but editor.html
   is a 339 kB compiled bundle, so that one line means re-pasting the whole
   file, and the line went missing. The tools were on the server with nothing
   loading them.

   nova.js is already loaded by the editor, so it can load them instead. No
   change to the bundle, and the tools cannot go missing again from a paste
   that was too big to be worth doing.
   ============================================================================ */
function ncEditorTools() {
  /* This used to also fire on any page with a #root, as a catch for the editor
     being served from a directory URL. #root is React's usual mount point, so
     the moment a second React page existed — the typing game — the editor's
     Animate and Remove buttons appeared on top of it. The opt-in below is the
     same escape hatch without the false positive: put data-nc-editor-tools on
     the body of any page that genuinely wants them. */
  const wanted = /editor\.html/i.test(location.pathname) ||
                 document.body.hasAttribute('data-nc-editor-tools');
  if (!wanted) return;
  if (document.getElementById('ncanimjs')) return;
  /* animator.js, motionlabs.js and motion-transfer.js are no longer loaded.
     They backed the Animator, Animation Studio and Copy a move tabs, which
     have been taken off the editor's rail — and a script whose only way in
     was a tab that no longer exists is 200 kB fetched on every editor load to
     define a global nothing calls. The files stay in the repo; putting the
     tabs back is putting these three lines back. */
  [/* Dragging a clip around the preview instead of typing two decimals into
      the Transform panel. The bundle is 397 kB, so a script tag inside it is
      a re-paste of the whole file — hence a separate load. */
   ['ncmovejs', 'editor-move.js', 'Drag on the preview'],
   /* Changing a voice, and recording one to change. All arithmetic, no
      server — see the file header for why this is not the "Voice Cloning"
      the bundle still lists as unavailable. */
   ['ncvcjs', 'voice-changer.js', 'Voice changer'],
   /* Camera, screen-as-ring-light, straight onto the timeline. */
   ['ncssjs', 'selfie-studio.js', 'Record yourself']].forEach(function (f) {
    const s = document.createElement('script');
    s.id = f[0];
    s.src = f[1];
    s.onerror = () => console.warn(f[1] + ' is not on the server yet — the ' +
      f[2] + ' button will not appear until it is uploaded.');
    document.body.appendChild(s);
  });
}

/* Pages that are hosted inside another page — Games, AI, Socials each put two
   existing pages behind tabs — must not draw a second sidebar inside the first
   one, or a second points badge over it. The host adds ?embed=1; everything
   else about the page behaves normally. */
const NC_EMBED = /[?&]embed=1/.test(location.search);
window.NC_EMBED = NC_EMBED;

window.addEventListener('DOMContentLoaded', () => {
  if (NC_EMBED) {
    const st = document.createElement('style');
    st.textContent = '.sidebar,#ncpts,#nctoast{display:none!important}' +
                     'body{margin-left:0!important;padding-bottom:0!important}' +
                     '.content{margin-left:0!important}' +
                     /* .shell, not only .content. photo.html's shell is
                        position:fixed at `left:var(--nc-rail)` and, under
                        761px, `top:52px;bottom:74px` — room reserved for the
                        rail, the top bar and the phone strip. None of those
                        three is drawn inside a frame, so embedded it left a
                        rail-wide empty column down the left and, in a narrow
                        frame, 126px of nothing above and below the tool.
                        Hiding .sidebar was never enough on its own; the space
                        it was offset by has to go too. Inert on game.html and
                        studio-ai.html, whose shells are in ordinary flow. */
                     '.shell{left:0!important;top:0!important;bottom:0!important;' +
                       'margin-left:0!important}';
    document.head.appendChild(st);
  }
  dedupeChrome();
  ncBrand();
  ncProfile();
  if (!NC_EMBED) ncNav();
  ncEditorTools();
  /* Not inside an iframe. Games, Socials and AI are hosts that put existing
     pages behind tabs, so nova.js runs once in the host and again in each
     frame — which meant a screen-time clock counting every minute twice. The
     rail already stands down under ?embed=1; this one did not.

     ncChatWhenIdle() used to sit here too and opened the n8n chat widget after
     a stretch of no clicks. Both it and the widget are gone; nova-ask.js asks
     once, three seconds in, and does its own ?embed=1 check. */
  if (!NC_EMBED) ncScreenTime();
  /* The channel cache used to be warmed here so the chat widget's first
     message already had the numbers in hand. ncYTToken() and
     ncChannelSnapshot() both belonged to that widget and went with it, and
     nothing else on the site called either — analytics.html reads the channel
     through its own sign-in. Warming a cache for a reader that no longer
     exists is one API call per page load for nobody. */
  const badge = document.createElement('div'); badge.id = 'ncpts'; badge.textContent = '🪙 ' + getPts(); document.body.appendChild(badge);
  const t = document.createElement('div'); t.id = 'nctoast'; document.body.appendChild(t);
  const lpick = document.getElementById('langpick');
  if (lpick) { for (const c in LANGS) { const o = document.createElement('option'); o.value = c; o.textContent = LANGS[c]; lpick.appendChild(o); } lpick.value = lang(); lpick.onchange = () => applyLang(lpick.value); }
  /* Before the two builders below, and before ncEnsureLangPick's fallback:
     each of them mounts into the first .themewrap it finds, and the bar has to
     exist by then or they mount into the sidebar and the bar comes up empty. */
  ncBuildBar();
  ncLoadTour();
  /* The class is already on <html> from parse time; this is only the button
     catching up with it, now that there is a button. */
  ncApplyRail(ncRailHidden());
  ncEnsureLangPick();
  ncBuildThemeSwitch();
  ncReveal();
  ncCountUp();
  ncWatchLang();
  applyTheme('Dark');   // fixed dark theme — background switcher removed
  applyLang(lang());
  refreshPanels();

  applyLang(lang());

  ncSyncBoot();
});

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

  /* Words that legitimately contain a banned one. Checked and removed FIRST,
     because the cost of a false positive here is a two-day suspension for
     somebody who typed "Scunthorpe" or "shiitake". This list is the difference
     between a filter and a trap, and it is meant to grow. */
  const INNOCENT = ['scunthorpe','shiitake','shitake','cocktail','cockpit','cockney','peacock',
    'assignment','assassin','assess','assist','associate','assume','bass','class','glass','grass',
    'pass','mass','embarrass','compass','analysis','canal','dickens','dickinson','dictionary',
    'penistone','lightwater','clitheroe','arsenal','sussex','essex','middlesex','hancock',
    'butter','shuttle','titan','titanic','matsushita','damnation','crappie'];

  /* Two foldings, because one cannot catch both cases. Collapsing a repeated
     letter to ONE turns "fuuuck" into "fuck" but also "book" into "bok";
     collapsing to TWO keeps "book" but leaves "shiiiit" as "shiit". Testing both
     catches the padding without mangling ordinary words. */
  function foldBase(v) {
    return String(v || '').toLowerCase()
      .replace(/[3]/g, 'e').replace(/[1!|]/g, 'i').replace(/[0]/g, 'o')
      .replace(/[4@]/g, 'a').replace(/[5$]/g, 's').replace(/[7]/g, 't')
      .replace(/[^a-z]+/g, ' ')
      .trim();
  }
  function foldVariants(v) {
    let base = ' ' + foldBase(v) + ' ';
    INNOCENT.forEach(w => { base = base.split(w).join(' '); });
    return [base.replace(/(.)\1{2,}/g, '$1$1'), base.replace(/(.)\1+/g, '$1')];
  }

  /* Whole words only. A plain includes() finds a swear inside "classic" and
     "grasshopper". Three trailing letters are allowed so -s, -ed, -er and -ing
     all still land — "fucking" is the base word plus three, and capping at two
     let it straight through. Three is only safe because INNOCENT above is
     subtracted first: without it, "shitake" is "shit" plus three as well. */
  function hitsWord(text, word) {
    if (word.includes(' ')) return text.includes(word);
    return new RegExp('(^| )' + word + '[a-z]{0,3}( |$)').test(text);
  }

  /* Someone spacing a word out — "f u c k". Only single letters standing alone
     are joined up, so ordinary sentences are never squashed into false hits. */
  function spacedOut(v) {
    const m = foldBase(v).match(/\b(?:[a-z] ){2,}[a-z]\b/g);
    return m ? m.join(' ').replace(/ /g, '') : '';
  }

  /* THIS MUST MATCH THE WORKER. The server runs the same test on arrival and
     suspends on a hit. If this one were more lenient the page would tell
     someone their message was fine and the server would ban them for it —
     a trap, not moderation. Change one, change both. */
  window.ncModerate = function (text) {
    const vars = foldVariants(text);
    const spaced = spacedOut(text);
    const hits = [];
    let severity = 'clean';
    const test = w => vars.some(v => hitsWord(v, w)) ||
                      (spaced && spaced.includes(w.replace(/ /g, '')) && w.replace(/ /g,'').length >= 4);
    SWEARS.forEach(w => { if (test(w)) { hits.push(w); severity = 'swear'; } });
    SLURS_AND_ABUSE.forEach(w => { if (test(w)) { hits.push(w); severity = 'abuse'; } });
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
        '<h1 style="font-size:1.8rem;margin-bottom:10px">' + tr('ui_susp_t') + '</h1>' +
        '<p style="color:#7E8AA6;line-height:1.7;margin-bottom:14px">' + tr('ui_susp_b').replace('{n}', '<b style="color:#FF2E97">' + days + '</b>').replace('{unit}', tr(days > 1 ? 'ui_days' : 'ui_day')) + '</p>' +
        '<div style="background:rgba(255,46,151,0.08);border-left:3px solid #FF2E97;border-radius:10px;padding:12px 16px;text-align:left;color:#b8bccb;font-size:0.9rem">' + tr('ui_reason') + reason + '</div>' +
        '<p style="color:#7E8AA6;font-size:0.85rem;margin-top:16px">' + tr('ui_susp_help') + '</p></div>';
      document.body.appendChild(o);
    }
    return true;
  };

  // ---- age gate (13-18) ----

  /* The two ends of who this site is for, in one place. 13 is not an
     arbitrary choice: it is the number every page of this site already says,
     and it is the line COPPA draws — under it, a service aimed at children
     needs verifiable parental consent, which this site has no way to obtain
     and does not pretend to. */
  const NC_MIN_AGE = 13;
  /* There is no upper limit any more. There used to be one — anybody who
     answered 19 or over was shown "this will not be your account" and pointed
     at the Family Dashboard, which turned a nineteen-year-old creator, a
     teacher and an older sibling all into somebody else's parent. Thirteen is
     a legal line and worth holding; eighteen never was one, it was an
     assumption about who the site is for, and it was enforced as if it were a
     rule.

     ncControlsRelaxed keeps its 16 floor and loses its 18 ceiling, which is
     the same bug in miniature: an adult was having their chats logged for a
     parent who does not exist. */

  /* Pages the blocked screen SENDS people to. Gating these would trap a child
     in a loop between the block and the page it tells them to open, which is
     worse than not blocking at all — they would simply clear their storage. */
  /* privacy.html joins this list because a privacy policy that cannot be
     read without first answering how old you are is not much of a privacy
     policy. A parent checking what their child's site collects, and a
     store reviewer checking the same thing, both arrive here before they
     have any reason to tell us anything about themselves. */
  /* terms.html joins it for the same reason privacy.html did, and one more:
     the terms are what says you have to be 13. A page that will not show you
     the rule until you have already answered the question the rule is about
     has the order backwards. */
  const NC_AGE_EXEMPT = /(^|\/)(parent|shield|report|privacy|terms)\.html$/i;

  window.ncAge = function () { return parseInt(localStorage.getItem('nc_user_age') || '0'); };
  window.ncControlsRelaxed = function () { return ncAge() >= 16; };
  window.ncAgeAllowed = function () { const a = ncAge(); return a >= NC_MIN_AGE; };

  /* WHO IS HOLDING THE LAPTOP.
     Asked once, in the welcome, and it is a different question from the age.
     Age is the legal one — is this person old enough to be here. This one is
     about what to show first, and the two answers want opposite things: a
     creator wants the editor and the trends, a parent wants the dashboard,
     the screen-time limits and the comment alerts, and neither is served by
     being handed the other one's front page.

     It changes what is SHOWN, never what is allowed. A parent who wants to
     look at the editor still can, and every row of the rail is where it was —
     nothing is hidden behind this answer, because a preference that locks
     doors is not a preference. */
  const NC_ROLE_KEY = 'nc_role';
  window.ncRole = function () {
    try {
      const v = localStorage.getItem(NC_ROLE_KEY);
      return (v === 'parent' || v === 'creator') ? v : '';
    } catch (e) { return ''; }
  };
  window.ncSetRole = function (v) {
    try {
      if (v === 'parent' || v === 'creator') localStorage.setItem(NC_ROLE_KEY, v);
      else localStorage.removeItem(NC_ROLE_KEY);
    } catch (e) {}
  };

  /* The screen an under-age visitor gets, every time, on every page.

     IT IS SEPARATE FROM THE QUESTION ON PURPOSE. The gate used to ask once,
     store the answer, and then short-circuit on `if (ncAge()) return` — which
     meant a child who answered honestly was blocked exactly once. One reload
     and the stored 8 counted as "already answered", and they walked in. The
     honest answer was the thing that let them past.

     Nothing here is dismissable and nothing writes a flag that would let the
     next load skip it. The only way out is a different answer, which means
     going back through the question. */
  function ncAgeBlocked() {
    if (document.getElementById('ncAgeGate')) return;
    const o = document.createElement('div');
    o.id = 'ncAgeGate';
    o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(5,6,10,0.98);color:#EAF2FF;' +
      'display:flex;align-items:center;justify-content:center;padding:24px;' +
      'font-family:Segoe UI,system-ui,sans-serif;backdrop-filter:blur(8px);';
    o.innerHTML = '<div style="width:100%;max-width:420px;text-align:center;background:rgba(255,255,255,0.04);' +
      'border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px 26px">' +
      '<h2 style="margin-bottom:10px;font-size:1.4rem">' + tr('ui_age_u_t') + '</h2>' +
      '<p style="color:#7E8AA6;font-size:0.94rem;line-height:1.7">' + tr('ui_age_u_b') + '</p>' +
      '<a href="parent.html" style="display:inline-block;margin-top:18px;padding:13px 28px;border-radius:30px;' +
      'font-weight:800;text-decoration:none;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a">' +
      tr('ui_fam_dash') + '</a>' +
      '<p style="margin-top:20px"><a href="report.html?about=age" style="' +
      'color:#7E8AA6;font-size:0.82rem;text-decoration:underline">' +
      tr('ui_age_report') + '</a></p>' +
      '</div>';
    document.body.appendChild(o);
    /* The way out is a REPORT, not a retry.

       This used to be a button that cleared the stored answer and asked
       again — which is a "wrong number?" escape hatch printed on the screen
       that blocks you, and there is only one thing anybody would do with it.
       It undid the gate for whoever pressed it.

       Now it goes to a person. Nobody self-serves their way back in, and a
       genuine mistake still gets fixed — by someone reading it. */
    /* The page underneath keeps running scripts; this stops it being read or
       used while the block is up. */
    document.documentElement.style.overflow = 'hidden';
  }
  window.ncAgeBlocked = ncAgeBlocked;

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
    const had = ncAge();
    /* Under age: blocked, every page, every load. This is the line that used
       to read `if (ncAge()) return`, which treated ANY stored answer as
       permission — so answering 8 honestly bought a single block and then
       free entry on the next reload. */
    if (had && had < NC_MIN_AGE) return ncAgeBlocked();
    if (had) return;
    /* Inside an embedded page the host has already asked; asking again would
       stack two overlays. The block above still applies, so ?embed=1 cannot
       be used to walk past it. */
    if (window.NC_EMBED) return;

    const o = document.createElement('div');
    o.id = 'ncAgeGate';
    o.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(5,6,10,0.96);color:#EAF2FF;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Segoe UI,sans-serif;backdrop-filter:blur(8px);';
    o.innerHTML = '<div style="width:100%;max-width:360px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px 26px">' +
      '<h2 style="margin-bottom:14px;font-size:1.5rem">' + tr('ui_age_q') + '</h2>' +
      '<div id="ncWheelWrap" style="position:relative">' +
        '<div id="ncWheelBand"></div>' +
        '<div id="ncWheel" tabindex="0" role="listbox" aria-label="' + tr('ui_age_aria') + '"></div>' +
      '</div>' +
      '<button id="ncAgeGo" disabled style="width:100%;padding:14px;border:none;border-radius:30px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;font-size:1rem;opacity:0.35;transition:opacity .2s">' + tr('ui_continue') + '</button>' +
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

    /* ONE AGE PER NOTCH.

       A mouse wheel notch scrolls about 100px and a row is 44, so one notch
       crossed more than two ages and the snap landed on whichever it was
       nearest. Half the range was simply unreachable: you went 12, 14, 16 and
       could never stop on 13 — the exact age this gate cares most about.

       So the wheel event is taken over. Small deltas (a trackpad sends a
       stream of 3-10px) accumulate until they add up to an intent; a mouse
       notch clears the threshold on its own. Either way the result is one age,
       and never two. */
    /* Instant, not smooth, and that is the whole reason this works.

       With behavior:'smooth' the animation is still running when the next
       notch arrives, so Math.round(scrollTop / H) reads a position halfway
       between two rows and computes the row it is already heading to. Every
       other notch then did nothing: the step sizes came out 0,1,0,1,0,1.

       A 44px hop needs no animation — CSS scroll-snap already smooths the
       feel on touch — and setting scrollTop directly means the next read is
       always the truth. */
    function step(d) {
      const max = HIGH - LOW;
      const i = Math.max(0, Math.min(max, Math.round(wheel.scrollTop / H) + d));
      wheel.scrollTop = i * H;
    }

    let acc = 0;
    wheel.addEventListener('wheel', (e) => {
      e.preventDefault();
      arm();
      acc += e.deltaY;
      if (Math.abs(acc) < 40) return;
      step(acc > 0 ? 1 : -1);
      acc = 0;
    }, { passive: false });

    /* And you can just tap the number you want. Scrolling ten rows to reach
       your own age is a chore on a phone, and the numbers were sitting there
       looking like buttons the whole time. */
    wheel.addEventListener('click', (e) => {
      const el = e.target.closest && e.target.closest('.ncw');
      if (!el) return;
      arm();
      wheel.scrollTop = (parseInt(el.dataset.a, 10) - LOW) * H;
    });

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
      step(e.key === 'ArrowDown' ? 1 : -1);
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
      /* Recomputed here rather than trusted from the last paint: a smooth
         scroll may still be in flight when Continue is pressed. */
      const a = LOW + Math.round(wheel.scrollTop / H);
      localStorage.setItem('nc_user_age', String(a));   // written first, whatever it is

      if (a < NC_MIN_AGE) {
        /* The same screen the next page load will show, rather than a
           one-off that a refresh clears. */
        o.remove();
        ncAgeBlocked();
        return;
      }
      if (a >= 16) {
        localStorage.setItem('nc_controls_relaxed', '1');
        /* Was an alert(), which is a browser dialog on a page that has its own
           voice — and it fired before the user had seen the site at all. */
        outcome(tr('ui_age_s_t'),
          tr('ui_age_s_b'),
          '<button id="ncAgeDone" style="margin-top:18px;padding:13px 30px;border:none;border-radius:30px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;font-size:0.98rem">' + tr('ui_got_it') + '</button>');
        const done = document.getElementById('ncAgeDone');
        if (done) done.onclick = () => o.remove();
        return;
      }
      o.remove();
    };
  };

  /* THE GATE RUNS ON EVERY PAGE, WHICH IT DID NOT.

     ncAgeGate() was called from one script tag, in index.html, and nowhere
     else. Every other page — the editor, the games, the AI tools, all
     twenty-three of them — never ran it at all. Anyone who typed
     novaclip.org/editor.html, or followed a link straight to it, or had it
     bookmarked, skipped the question entirely. Blocking under-13s on the
     front door means nothing while every other door is open.

     nova.js is on every page, so the gate belongs here rather than in a tag
     each page has to remember to carry.

     What this is NOT: a wall. It is a browser, and a child who clears
     localStorage answers the question again. Nothing done in a page can stop
     that, and pretending otherwise would be the dishonest part. It stops the
     accidental arrival and the casual one, which is what an age gate is for;
     the Family Dashboard and the Family Shield are what a parent uses when
     more than that is needed. */
  function ncAgeBoot() {
    if (NC_AGE_EXEMPT.test(location.pathname)) return;
    if (window.ncAgeGate) ncAgeGate();
    ncSignupGate();
    ncCategoryGate();
  }

  /* ==========================================================================
     THE WELCOME — YOUR NAME, THEN WHAT YOU MAKE
     ==========================================================================
     Two questions, once, on the first visit, on a night sky. Both answers are
     read all over the site afterwards: the name is what the rail, the profile
     card and the certificates use, and the category is what the Trend Spotter,
     the idea generator and every AI tutor were guessing at until now.

     WHY THE NAME COMES FIRST

     Asked for in that order, and it is the right order anyway. "What do you
     make?" from a site that does not know who you are is a form. The same
     question after it has your name is a conversation, and the second question
     is the one whose answer is actually hard to give — so the easy one goes
     first and the reader is already answering by the time it arrives.

     IT IS LAST IN THE QUEUE OF GATES ON PURPOSE. The age gate is a legal
     question and the sign-up gate is an account question; both must be
     answered before a preference is worth collecting, and three dialogs
     stacked on one screen is nobody's first visit. Each of the two above
     returns early if it is showing something, so this only ever appears on a
     clear screen.

     SKIPPING IS AN ANSWER, ON BOTH STEPS. Somebody who closes it is not asked
     again — the skip is recorded separately from the choice, so "has not
     chosen" and "has not been asked" stay different things. The name can be
     set later from the profile card at the foot of the rail, and the category
     from Categories, which is a row in that same rail.

     WHY THE SKY IS DRAWN RATHER THAN FETCHED

     It is a first visit, which is the one page load with nothing in the cache;
     a background image would be the largest thing on the screen and the last
     thing to arrive, so the welcome would appear on a flat colour and then
     change under the reader. Two elements and a long box-shadow cost about a
     kilobyte of generated CSS, paint with the first frame, and scale to any
     screen without a second file. The positions come from a seeded generator
     so the sky is the same sky on every visit rather than reshuffling.
     ========================================================================== */

  /* A small deterministic generator. Math.random() would redraw the sky on
     every page load, which on a site somebody navigates around is a background
     that will not sit still. */
  function ncStars(count, seed, spread, minPx, maxPx, colours) {
    var out = [], i, x, y, sz, c;
    for (i = 0; i < count; i++) {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      x = (seed / 4294967296) * spread;
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      y = (seed / 4294967296) * spread;
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      sz = minPx + (seed / 4294967296) * (maxPx - minPx);
      c = colours[i % colours.length];
      out.push(x.toFixed(0) + 'px ' + y.toFixed(0) + 'px 0 ' + (sz / 2).toFixed(2) + 'px ' + c);
    }
    return out.join(',');
  }

  function ncCategoryGate() {
    if (window.NC_EMBED) return;
    if (NC_SIGNUP_SKIP.test(location.pathname)) return;
    var C = window.NC_CATEGORY;
    if (!C || C.asked()) return;
    /* Do not pile onto whatever the two gates above have already put up. */
    if (document.getElementById('ncAgeGate') || document.getElementById('ncSignup')) return;
    if (ncAge() < NC_MIN_AGE) return;

    var o = document.createElement('div');
    o.id = 'ncCatGate';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', tr('wel_aria'));
    o.innerHTML =
      '<div class="nccg-sky" aria-hidden="true"><i class="s1"></i><i class="s2"></i><i class="s3"></i></div>' +
      '<div class="nccg-box">' +
        '<div class="nccg-sky in" aria-hidden="true"><i class="s1"></i><i class="s2"></i><i class="s3"></i></div>' +
        '<div class="nccg-in">' +
          '<div class="nccg-face" id="ncCatFace" aria-hidden="true"></div>' +

          /* STEP ONE — WHO IS THIS, which decides what the next screen is.
             It goes first because the two answers want different sites, and
             asking a parent to pick a video category before finding out they
             are a parent is two wasted questions and a wrong first page. */
          '<div class="nccg-step" id="ncCatStep0">' +
            '<span class="nccg-of" data-t="wel_of1">' + tr('wel_of1') + '</span>' +
            '<h2 data-t="wel_role_h">' + tr('wel_role_h') + '</h2>' +
            '<p data-t="wel_role_p">' + tr('wel_role_p') + '</p>' +
            '<div class="nccg-grid" id="ncRoleGrid">' +
              '<button type="button" id="ncRoleCreator">' +
                '<b data-t="wel_role_ct">' + tr('wel_role_ct') + '</b>' +
                '<span data-t="wel_role_cs">' + tr('wel_role_cs') + '</span></button>' +
              '<button type="button" id="ncRoleParent">' +
                '<b data-t="wel_role_pt">' + tr('wel_role_pt') + '</b>' +
                '<span data-t="wel_role_ps">' + tr('wel_role_ps') + '</span></button>' +
            '</div>' +
          '</div>' +

          /* THE PARENT BRANCH. Not the name and the category — those are a
             creator's questions, and a parent answering "what do you make?"
             is the site asking the wrong person. Four things to do, in the
             order they have to be done in, and a button to the page that
             does them. */
          '<div class="nccg-step" id="ncCatStepP" hidden>' +
            '<span class="nccg-of" data-t="wel_of_par">' + tr('wel_of_par') + '</span>' +
            '<h2 data-t="wel_par_h">' + tr('wel_par_h') + '</h2>' +
            '<p data-t="wel_par_p">' + tr('wel_par_p') + '</p>' +
            '<ol class="nccg-steps">' +
              '<li data-t="wel_par_1">' + tr('wel_par_1') + '</li>' +
              '<li data-t="wel_par_2">' + tr('wel_par_2') + '</li>' +
              '<li data-t="wel_par_3">' + tr('wel_par_3') + '</li>' +
              '<li data-t="wel_par_4">' + tr('wel_par_4') + '</li>' +
            '</ol>' +
            '<div class="nccg-row">' +
              '<button class="nccg-save" id="ncParentGo" data-t="wel_par_go">' + tr('wel_par_go') + '</button>' +
            '</div>' +
            '<button class="nccg-skip" id="ncParentSkip" data-t="wel_par_skip">' + tr('wel_par_skip') + '</button>' +
          '</div>' +

          /* STEP TWO */
          '<div class="nccg-step" id="ncCatStep1" hidden>' +
            '<span class="nccg-of" data-t="wel_of2">' + tr('wel_of2') + '</span>' +
            '<h2 data-t="wel_name_h">' + tr('wel_name_h') + '</h2>' +
            '<p data-t="wel_name_p">' + tr('wel_name_p') + '</p>' +
            '<div class="nccg-row">' +
              '<input type="text" id="ncCatName" maxlength="20" autocomplete="nickname" ' +
                     'spellcheck="false" data-tph="wel_name_ph" placeholder="' + tr('wel_name_ph') + '">' +
              '<button class="nccg-save" id="ncCatNameGo" data-t="wel_cont">' + tr('wel_cont') + '</button>' +
            '</div>' +
            '<button class="nccg-skip" id="ncCatNameSkip" data-t="wel_skip1">' + tr('wel_skip1') + '</button>' +
          '</div>' +

          /* STEP THREE */
          '<div class="nccg-step" id="ncCatStep2" hidden>' +
            '<span class="nccg-of" data-t="wel_of3">' + tr('wel_of3') + '</span>' +
            '<h2 id="ncCatH2" data-t="wel_cat_h">' + tr('wel_cat_h') + '</h2>' +
            '<p data-t="wel_cat_p">' + tr('wel_cat_p') + '</p>' +
            '<div class="nccg-grid" id="ncCatGrid"></div>' +
            '<label class="nccg-lbl" for="ncCatOwn" data-t="wel_cat_lbl">' + tr('wel_cat_lbl') + '</label>' +
            '<div class="nccg-row">' +
              '<input type="text" id="ncCatOwn" maxlength="40" spellcheck="false" ' +
                     'data-tph="wel_cat_ph" placeholder="' + tr('wel_cat_ph') + '">' +
              '<button class="nccg-save" id="ncCatSave" data-t="wel_save">' + tr('wel_save') + '</button>' +
            '</div>' +
            '<button class="nccg-skip" id="ncCatSkip" data-t="wel_skip2">' + tr('wel_skip2') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(o);

    /* Three layers: a lot of faint dust, fewer mid stars, and a handful of
       bright blue-white ones. That is what the night sky in the reference
       actually is, and one uniform layer reads as noise instead. */
    /* Counts measured against the reference rather than picked: at 160 dust
       the sky read as a dark panel with a few specks on it, which is a
       gradient, not a night sky. The spread is 2600 so a 2560-wide monitor is
       covered corner to corner — stars generated outside the viewport cost
       nothing to skip and are what stops the pattern ending in a visible
       edge on a wide screen. */
    var DUST = ncStars(620, 20260909, 2600, 0.9, 1.5, ['rgba(198,216,255,.5)', 'rgba(168,190,240,.36)', 'rgba(214,228,255,.6)']);
    var MID  = ncStars(150, 777331,   2600, 1.6, 2.3, ['rgba(226,238,255,.82)', 'rgba(150,196,255,.76)']);
    var BRIG = ncStars(30,  4242424,  2600, 2.5, 3.4, ['#DCEBFF', '#7FB4FF']);

    var st = document.createElement('style');
    st.id = 'ncCatGateCss';
    st.textContent =
      /* 99993, not 99988. The rail is 99990, so at 99988 the phone's bottom
         navigation strip was drawn straight through the welcome — a modal
         with the site's own navigation sitting on top of it. Above the rail
         and below the age gate (99998) and the suspension screens (99999),
         which both outrank a preference and must stay that way. */
      '#ncCatGate{position:fixed;inset:0;z-index:99993;display:flex;align-items:center;' +
        'justify-content:center;padding:18px;overflow:auto;' +
        /* The sky itself, not a wash over the page. A first visit has nothing
           behind it worth showing through. */
        'background:radial-gradient(120% 90% at 50% 0%,#0B1740 0%,#050B24 45%,#01030E 100%)}' +
      /* Both skies — the full screen and the one inside the card — are the same
         three elements. One box-shadow list, drawn twice. */
      '#ncCatGate .nccg-sky{position:absolute;inset:0;overflow:hidden;pointer-events:none}' +
      '#ncCatGate .nccg-sky i{position:absolute;top:0;left:0;width:1px;height:1px;border-radius:50%;' +
        'display:block}' +
      '#ncCatGate .nccg-sky i.s1{box-shadow:' + DUST + '}' +
      '#ncCatGate .nccg-sky i.s2{box-shadow:' + MID + '}' +
      '#ncCatGate .nccg-sky i.s3{box-shadow:' + BRIG + '}' +
      /* The card's own sky is offset so it is a different patch of the same
         sky rather than the identical one showing through twice. */
      '#ncCatGate .nccg-sky.in i{transform:translate(-380px,-260px)}' +
      /* Slow, and only where motion is welcome. A twinkling background behind
         a form somebody is typing into is a distraction, so it is a drift of a
         few pixels over a minute rather than a flicker. */
      '@media (prefers-reduced-motion:no-preference){' +
        '#ncCatGate .nccg-sky i.s1{animation:ncdrift 90s linear infinite}' +
        '#ncCatGate .nccg-sky i.s3{animation:ncdrift 140s linear infinite reverse}}' +
      '@keyframes ncdrift{from{translate:0 0}to{translate:34px 22px}}' +

      '#ncCatGate .nccg-box{position:relative;width:min(620px,100%);max-height:92vh;overflow:auto;' +
        'border-radius:26px;isolation:isolate;' +
        'background:radial-gradient(120% 100% at 30% 0%,#12224F 0%,#0A1234 40%,#050A1E 100%);' +
        'border:1px solid rgba(140,178,255,.34);' +
        'box-shadow:0 40px 120px rgba(0,0,0,.7),0 0 0 1px rgba(10,18,44,.9) inset,' +
        '0 0 60px -20px rgba(90,150,255,.45);' +
        'color:#EAF2FF;font:14px/1.6 "Segoe UI",system-ui,sans-serif}' +
      '#ncCatGate .nccg-in{position:relative;z-index:1;padding:26px 26px 24px}' +

      /* The circle in the corner: Nova, in a ring, on the sky. */
      '#ncCatGate .nccg-face{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;' +
        'margin-bottom:16px;background:radial-gradient(circle at 34% 30%,#1B2E67,#070E28);' +
        'border:1px solid rgba(150,190,255,.45);' +
        'box-shadow:0 0 26px -6px rgba(96,158,255,.6),0 0 0 6px rgba(90,150,255,.07)}' +
      '#ncCatGate .nccg-face svg{display:block}' +

      '#ncCatGate .nccg-of{display:block;font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;' +
        'font-weight:800;color:#7FB4FF;margin-bottom:8px}' +
      '#ncCatGate h2{margin:0 0 7px;font-size:1.38rem;line-height:1.25;letter-spacing:-.01em;color:#F2F7FF}' +
      '#ncCatGate p{margin:0 0 18px;color:#9FB0D4;font-size:.9rem}' +
      '#ncCatGate p b{color:#DCE8FF}' +

      '#ncCatGate .nccg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(170px,100%),1fr));' +
        'gap:8px;margin-bottom:18px}' +
      '#ncCatGate .nccg-grid button{text-align:left;padding:11px 13px;border-radius:14px;cursor:pointer;' +
        'font:inherit;border:1px solid rgba(140,178,255,.22);background:rgba(120,160,255,.07);' +
        'color:#EAF2FF;transition:.14s}' +
      '#ncCatGate .nccg-grid button:hover{border-color:#7FB4FF;background:rgba(127,180,255,.16);' +
        'transform:translateY(-1px)}' +
      '#ncCatGate .nccg-grid b{display:block;font-size:.92rem;font-weight:650}' +
      '#ncCatGate .nccg-grid span{font-size:.76rem;color:#9FB0D4}' +

      '#ncCatGate .nccg-lbl{display:block;font-size:.83rem;color:#9FB0D4;margin-bottom:7px}' +
      /* The parent screen's four steps. Numbered, because they are in an order
         — the PIN has to exist before there is a dashboard to put limits in —
         and a list of four bullets would say they were interchangeable. */
      '#ncCatGate .nccg-steps{margin:0 0 18px;padding:0 0 0 22px;color:#9FB0D4;font-size:.9rem}' +
      '#ncCatGate .nccg-steps li{margin:0 0 9px;line-height:1.55}' +
      '#ncCatGate .nccg-steps li::marker{color:#7FB4FF;font-weight:800}' +
      '#ncCatGate .nccg-steps b{color:#DCE8FF}' +
      /* The two role buttons are the only place this grid holds exactly two
         things, and at the category grid's 170px minimum they sat in a narrow
         pair with a lot of empty card beside them. */
      '#ncCatGate #ncRoleGrid{grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr))}' +
      '#ncCatGate #ncRoleGrid button{padding:15px 16px}' +
      '#ncCatGate .nccg-row{display:flex;gap:8px;flex-wrap:wrap}' +
      '#ncCatGate .nccg-row input{flex:1 1 200px;min-width:0;padding:12px 14px;border-radius:13px;font:inherit;' +
        'font-size:.95rem;background:rgba(6,12,32,.75);color:#EAF2FF;' +
        'border:1px solid rgba(140,178,255,.28)}' +
      '#ncCatGate .nccg-row input::placeholder{color:#6F82AC}' +
      '#ncCatGate .nccg-row input:focus{outline:none;border-color:#7FB4FF;' +
        'box-shadow:0 0 0 3px rgba(127,180,255,.16)}' +
      '#ncCatGate .nccg-save{padding:12px 22px;border-radius:13px;border:0;cursor:pointer;font:inherit;' +
        'font-weight:700;color:#04121a;' +
        'background:linear-gradient(110deg,#7FB4FF,#8FE3FF 55%,#C9B3FF)}' +
      '#ncCatGate .nccg-save:hover{filter:brightness(1.07)}' +
      '#ncCatGate .nccg-skip{margin-top:14px;background:none;border:0;cursor:pointer;font:inherit;' +
        'font-size:.83rem;color:#8296BE;text-decoration:underline;padding:6px 0}' +
      '#ncCatGate .nccg-skip:hover{color:#DCE8FF}' +
      '@media (max-width:520px){#ncCatGate .nccg-in{padding:20px 18px 18px}' +
        '#ncCatGate h2{font-size:1.18rem}}';
    document.head.appendChild(st);

    /* Nova, if she loaded. The ring is drawn either way — an empty circle on
       the sky still reads as deliberate, where a collapsed one does not. */
    try {
      if (window.NC_MASCOT) document.getElementById('ncCatFace').appendChild(window.NC_MASCOT.el(40));
    } catch (e) {}

    function done() {
      try { C.markAsked(); } catch (e) {}
      o.remove();
      var css = document.getElementById('ncCatGateCss');
      if (css) css.remove();
    }

    /* ---- step one: who is this -------------------------------------------- */
    var step0 = document.getElementById('ncCatStep0');
    var stepP = document.getElementById('ncCatStepP');
    var step1 = document.getElementById('ncCatStep1');
    var step2 = document.getElementById('ncCatStep2');
    var nameIn = document.getElementById('ncCatName');

    document.getElementById('ncRoleCreator').onclick = function () {
      window.ncSetRole('creator');
      step0.hidden = true;
      step1.hidden = false;
      try { nameIn.focus({ preventScroll: true }); } catch (e) {}
    };
    document.getElementById('ncRoleParent').onclick = function () {
      window.ncSetRole('parent');
      step0.hidden = true;
      stepP.hidden = false;
    };
    /* Both parent buttons close the welcome for good — the category question
       is answered by not applying, and asking a parent next visit what kind of
       videos they make would be the same wrong question a week later. */
    document.getElementById('ncParentGo').onclick = function () {
      done();
      location.href = 'parent.html';
    };
    document.getElementById('ncParentSkip').onclick = done;

    /* Already have one — from an account, or a previous visit that set it
       before this dialog existed. Asking again for something we know is the
       fastest way to look like nothing was saved. */
    try { if (ncName()) nameIn.value = ncName(); } catch (e) {}

    function toStep2() {
      step1.hidden = true;
      step2.hidden = false;
      var n = '';
      try { n = ncName(); } catch (e) {}
      /* Their name in the second question, which is the whole reason for
         asking it first. */
      if (n) {
        var h2 = document.getElementById('ncCatH2');
        h2.textContent = tr('wel_cat_hi').replace('{n}', n);
        h2.removeAttribute('data-t');
      }
      try { document.getElementById('ncCatOwn').focus({ preventScroll: true }); } catch (e) {}
    }

    function saveName() {
      /* Same rules the profile sheet uses: control characters out, angle
         brackets out — this string is written into the rail as markup. */
      var v = String(nameIn.value || '').replace(/[\x00-\x1f<>&]/g, '').trim().slice(0, 20);
      if (v) {
        try {
          localStorage.setItem('nc_name', v);
          /* The rail's profile card is already on screen and reads this. */
          window.dispatchEvent(new CustomEvent('nc-name', { detail: v }));
        } catch (e) {}
      }
      toStep2();
    }

    document.getElementById('ncCatNameGo').onclick = saveName;
    document.getElementById('ncCatNameSkip').onclick = toStep2;
    nameIn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') saveName();
    });

    /* ---- step two: the category ------------------------------------------ */
    var grid = document.getElementById('ncCatGrid');
    C.PRESETS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      /* data-t on both halves and the translation used to fill them, so this
         grid is not ten English subtitles under ten translated headings — and
         so a language switch while the dialog is open repaints it. The names
         come from the same ccat_ keys the rail card reads; the hints have
         their own. categories.js keeps the English as the fallback. */
      b.innerHTML = '<b></b><span></span>';
      var bn = b.querySelector('b'), sp = b.querySelector('span');
      bn.setAttribute('data-t', 'ccat_' + p.id);
      sp.setAttribute('data-t', 'chint_' + p.id);
      bn.textContent = tr('ccat_' + p.id) || p.label;
      sp.textContent = tr('chint_' + p.id) || p.hint;
      b.onclick = function () { C.set(p.id); done(); };
      grid.appendChild(b);
    });
    document.getElementById('ncCatSave').onclick = function () {
      var v = document.getElementById('ncCatOwn').value.trim();
      if (!v) return;
      C.set(v); done();
    };
    document.getElementById('ncCatOwn').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('ncCatSave').click();
    });
    document.getElementById('ncCatSkip').onclick = done;

    /* The first screen is two buttons now, not a text box, so the focus goes
       to the first of them. Focusing the name field here would have been
       reaching into a screen that is still hidden — no error, and no focus
       either, which is worse than none because it looks deliberate. */
    try { document.getElementById('ncRoleCreator').focus({ preventScroll: true }); } catch (e) {}
  }

  /* ==========================================================================
     THE SIGN-UP GATE
     ==========================================================================
     First visit, once the age question is answered: make an account. Anybody
     who already has one — a key in this browser from any previous visit — never
     sees it.

     THREE WAYS OUT, AND ALL OF THEM ARE DELIBERATE

     A gate on a static site is a promise that the server is up. This one is
     not allowed to become a locked door:

       ALREADY HAVE ONE   sign in with a username or a recovery code, in the
                          same sheet, without going anywhere.
       SKIP               it says "have a look round first" and means it.
                          Everything on this site works without an account;
                          what an account buys is your progress following you
                          to another device. Making that mandatory to read a
                          page would be a lie about what it is for.
       THE SERVER IS DOWN If there is no worker configured, or it cannot be
                          reached, the sheet says so and lets you past. The
                          alternative is a site nobody can open because a
                          Cloudflare Worker is having a bad afternoon.

     It is not shown on the pages the age gate also skips — a parent reading
     the privacy policy, or a store reviewer checking what is collected,
     should not be asked to register first. Nor on profile.html, which is the
     same thing with more room.
     ========================================================================== */
  var NC_SIGNUP_SKIP = /(^|\/)(parent|shield|report|privacy|terms|profile|offline)\.html$/i;

  function ncSignupGate() {
    if (window.NC_EMBED) return;
    if (NC_SIGNUP_SKIP.test(location.pathname)) return;
    if (ncAge() < NC_MIN_AGE) return;                 // the age gate owns this moment
    /* A USERNAME, NOT A KEY.
       The obvious test — "do they have nc_key" — is the wrong one, and
       measurably so: ncPush() calls ncCreateAccount() the first time anything
       syncs, so a random key lands in localStorage within a second or two of
       the first page load. Gating on that meant the sheet raced the sync and
       usually lost, and when it did win it was asking somebody to make an
       account they had silently been given.

       An anonymous key is not an account anybody knows they have. A username
       is. That is also what was asked for: the people who should see this are
       the ones without a profile. Registering attaches the name to whatever
       key is already here, so nothing they have done is lost. */
    try {
      if (localStorage.getItem('nc_username')) return;
      if (localStorage.getItem('nc_signup_skipped')) return;
    } catch (e) { return; }
    if (!ncSyncOn()) return;                          // no worker configured: nothing to join

    /* account.js is not on most pages. Fetched once, here, rather than added
       to twenty-nine script tags for a sheet most visits never see. */
    ncNeed('account.js', function () { ncSignupSheet(); });
  }

  function ncNeed(src, then) {
    if (document.querySelector('script[data-nc-need="' + src + '"]')) return then();
    var t = document.createElement('script');
    t.src = src;
    t.setAttribute('data-nc-need', src);
    t.onload = then;
    t.onerror = function () { /* no sheet rather than a broken one */ };
    document.head.appendChild(t);
  }

  function ncSignupSheet() {
    if (!window.NC_ACCOUNT || document.getElementById('ncSignup')) return;

    var o = document.createElement('div');
    o.id = 'ncSignup';
    o.style.cssText = 'position:fixed;inset:0;z-index:99997;background:rgba(5,6,10,.96);' +
      'color:#EAF2FF;display:flex;align-items:center;justify-content:center;padding:20px;' +
      'font-family:Segoe UI,-apple-system,sans-serif;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);' +
      'overflow-y:auto';
    /* The same editorial look as profile.html — serif heading, mono labels,
       warm neutrals — so the sheet somebody meets on their first visit and the
       page they manage the account on afterwards are recognisably one thing.
       Inline because nova.js is on every page and this sheet is on almost none
       of them: a stylesheet for it would be a request on every visit for
       markup most visits never build. */
    var SER = "'Newsreader','Playfair Display',Georgia,serif";
    var MON = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace";
    var fld = 'width:100%;min-height:46px;padding:11px 13px;margin-top:7px;border-radius:11px;' +
      'font:inherit;font-size:.95rem;color:#EAF2FF;background:rgba(255,255,255,.055);' +
      'border:1px solid rgba(255,255,255,.16);box-sizing:border-box';
    var lbl = 'display:block;margin-top:15px;font-family:' + MON + ';font-size:.6rem;' +
      'letter-spacing:.16em;text-transform:uppercase;color:#a8a29e';
    var go = 'width:100%;min-height:48px;margin-top:18px;padding:13px;border:0;border-radius:12px;' +
      'cursor:pointer;font-weight:600;font-size:.95rem;background:#ededed;color:#0c0d10';
    var alt = 'margin-top:10px;background:none;border:0;color:#a8a29e;font:inherit;font-size:.85rem;' +
      'text-decoration:underline;cursor:pointer;padding:8px;min-height:40px';

    o.innerHTML =
      '<div style="width:100%;max-width:390px;background:rgba(255,255,255,.035);' +
        'border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:26px 24px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
          '<span style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;' +
            'background:#ededed;color:#0c0d10;font-family:' + SER + ';font-weight:700">&#10022;</span>' +
          '<span style="font-family:' + SER + ';font-size:1.05rem">NovaClip</span>' +
          '<span style="margin-left:auto;font-family:' + MON + ';font-size:.58rem;letter-spacing:.16em;' +
            'text-transform:uppercase;color:#a8a29e;padding:3px 8px;border-radius:5px;' +
            'background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1)">' +
            tr('ui_su_chip') + '</span>' +
        '</div>' +
        '<h2 style="font-family:' + SER + ';font-size:1.5rem;font-weight:500;' +
          'letter-spacing:-.02em;margin-bottom:6px">' + tr('ui_su_h') + '</h2>' +
        '<p style="color:#a8a29e;font-size:.85rem;line-height:1.6">' + tr('ui_su_p') + '</p>' +
        '<label style="' + lbl + '" for="ncSuUser">' + tr('ui_su_user') + '</label>' +
        '<input id="ncSuUser" style="' + fld + '" autocomplete="username" maxlength="20" ' +
          'spellcheck="false" autocapitalize="none">' +
        '<label style="' + lbl + '" for="ncSuPass">' + tr('ui_su_pass') + '</label>' +
        '<input id="ncSuPass" type="password" style="' + fld + '" autocomplete="new-password">' +
        '<button id="ncSuGo" style="' + go + '">' + tr('ui_su_go') + '</button>' +
        '<div id="ncSuSay" style="margin-top:12px;font-size:.84rem;line-height:1.55;color:#c2683f"></div>' +
        '<div style="text-align:center">' +
          '<button id="ncSuHave" style="' + alt + '">' + tr('ui_su_have') + '</button><br>' +
          '<button id="ncSuSkip" style="' + alt + '">' + tr('ui_su_skip') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(o);

    var user = o.querySelector('#ncSuUser'), pass = o.querySelector('#ncSuPass');
    var btn = o.querySelector('#ncSuGo'), say = o.querySelector('#ncSuSay');
    var mode = 'new';

    function done() { o.remove(); }
    function tell(msg, good) { say.style.color = good ? '#34d399' : '#fb7185'; say.textContent = msg; }

    o.querySelector('#ncSuSkip').onclick = function () {
      /* Remembered, so it is asked once rather than on every page of a look
         round — which would be the same wall wearing a friendlier hat. */
      try { localStorage.setItem('nc_signup_skipped', '1'); } catch (e) {}
      done();
    };

    o.querySelector('#ncSuHave').onclick = function () {
      mode = mode === 'new' ? 'in' : 'new';
      pass.setAttribute('autocomplete', mode === 'new' ? 'new-password' : 'current-password');
      btn.textContent = tr(mode === 'new' ? 'ui_su_go' : 'ui_su_in');
      o.querySelector('#ncSuHave').textContent = tr(mode === 'new' ? 'ui_su_have' : 'ui_su_new');
      o.querySelector('h2').textContent = tr(mode === 'new' ? 'ui_su_h' : 'ui_su_h2');
      tell('');
    };

    btn.onclick = async function () {
      var u = user.value.trim(), p = pass.value;
      var bad = mode === 'new'
        ? (NC_ACCOUNT.checkUsername(u) || NC_ACCOUNT.checkPassword(p, u))
        : (!u || !p ? tr('ui_su_both') : null);
      if (bad) return tell(bad);
      btn.disabled = true;
      var was = btn.textContent;
      btn.textContent = tr('ui_su_wait');
      tell(tr('ui_su_local'), true);
      try {
        await (mode === 'new' ? NC_ACCOUNT.register(u, p) : NC_ACCOUNT.login(u, p));
        if (typeof ncPull === 'function') { try { await ncPull(); } catch (e) {} }
        done();
      } catch (e) {
        var m = (e && e.message) || String(e);
        /* A worker that cannot be reached must not hold the door shut. */
        if (/failed to fetch|networkerror|load failed|no community server/i.test(m)) {
          tell(tr('ui_su_off'));
          setTimeout(done, 2200);
          return;
        }
        tell(m);
      } finally {
        btn.disabled = false;
        btn.textContent = was;
      }
    };

    user.focus();
  }
  window.ncSignupGate = ncSignupGate;

  /* THE IDENTITY GATE IS GONE, AND THIS CLEARS UP AFTER IT.

     What used to be here injected guard.js into every page, which drew a
     full-screen "prove it is you" wall over the site whenever a passkey had
     been enrolled in this browser. It is deleted — guard.js, passkey.js and
     locker.js with it, and the enrolment controls on the Profile page.

     Why it goes rather than getting another fix: it locked people out of
     their own site. The device refuses a prompt for a dozen ordinary reasons
     — the dialog was dismissed, it timed out, the finger was wet, the browser
     was in a state WebAuthn does not like — and every one of them produced the
     same wall with nothing behind it. There was a "remove the lock" button,
     but it was on the Profile page, which is behind the wall. A lock whose
     only key is inside the locked room is not a lock, it is a trap, and this
     one caught the person who owns the site.

     Nothing is lost that was protecting anything: it was JavaScript in a page,
     and it said so itself. Signing in is unaffected — that is the account, on
     the server, and it never went through this.

     What is left to do is throw away what it stored. These keys are inert the
     moment nothing reads them, but "inert" is not "gone", and a handle to a
     credential is exactly the kind of leftover that should not sit in a
     browser for years after the feature that made it.

     Every page load, not once behind a flag. A flag would have meant storing a
     key of my own to remember that I had deleted somebody else's, and leaving
     anything that reappeared afterwards — a second tab mid-write, a restored
     profile, a synced browser — sitting there forever because the flag said
     the job was done. removeItem on a key that is not there costs nothing and
     writes nothing. */
  function ncForgetLock() {
    try {
      ['nc_passkeys', 'nc_locker',
       /* Older still: the face descriptor, the voiceprint and the click
          pattern, from before those were removed. Some browsers have been
          carrying them since. */
       'nc_bio_profiles', 'nc_bio_session', 'nc_click_rhythm']
        .forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      try { sessionStorage.removeItem('nc_gate_ok'); } catch (e) {}
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () { ncCheckSuspension(); ncAgeBoot(); ncForgetLock(); });
  if (document.readyState !== 'loading') { ncCheckSuspension(); ncAgeBoot(); ncForgetLock(); }
})();

/* ============================================================
   GEN-Z / NORMAL TEXT TOGGLE
   ============================================================ */
(function () {
  const GENZ = {
    hero_line1:'run ur channel', hero_line2:'like a game fr',
    startchannel:'lock in', seerewards:'peep the rewards',
    home:'Home', studio:'Studio', analytics:'Stats', trends:'Studio',
    editor:'Editor', sniper:'Games', ai:'NovaClip AI',
    studio_h:'NovaClip Studio', studio_sub:'link ur channel n scope the competition',
    analytics_h:'Stats', analytics_sub:'ur numbers vs the ops — no cap',
    analytics_hint:'link ur channel to pull the stats.',
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
    /* THE BAR MAY NOT BE BUILT YET, AND THAT IS A RACE, NOT AN ABSENCE.
       This runs from its own DOMContentLoaded handler and ncBuildBar() runs
       from another one — on the editor this one won, found no .themewrap, and
       used to answer by creating the floating corner button. That is WHY there
       was a globe in the corner of the editor and not on most other pages.

       Removing the fallback without removing the race just moved the fault:
       the Vibe toggle stopped appearing at all. So it waits for the bar
       instead, briefly and with an end to it — a page genuinely without a bar
       is an embedded frame, and the host already has the control. */
    let wrap = document.querySelector('.themewrap');
    if (!wrap) {
      if (window.NC_EMBED) return;
      var tries = 0;
      (function later() {
        if (document.querySelector('.themewrap')) return window.ncBuildGenZToggle();
        if (++tries < 40) setTimeout(later, 50);       // two seconds, then give up
      })();
      return;
    }
    const on = ncGenZ();
    const d = document.createElement('div');
    d.id = 'genzwrap';
    d.style.cssText = 'margin-bottom:14px;';
    d.innerHTML =
      '<label data-t="vibe" style="display:block;font-size:0.78rem;opacity:0.6;margin-bottom:6px;">' + tr('vibe') + '</label>' +
      /* The track and the unselected half read from the palette rather than
         from three literals. They were rgba(255,255,255,...) on a white-ish
         bar and #7E8AA6 text at 1.78:1 in light mode — the half you are being
         asked to click was the half you could not read. The fallbacks are the
         values that were here, so dark mode is unchanged to the pixel; light
         mode gets --nc-dim #59637A, which is 5.9:1. */
      '<div id="genzToggle" style="display:flex;background:var(--nc-card,rgba(255,255,255,0.05));border:1px solid var(--nc-line2,rgba(255,255,255,0.15));border-radius:10px;overflow:hidden;cursor:pointer;font-size:0.8rem;font-weight:700;">' +
      '<div data-v="0" data-t="vibe_normal" style="flex:1;text-align:center;padding:8px 4px;transition:.2s;' + (!on ? 'background:linear-gradient(90deg,var(--nc-cyan,#00F0FF),var(--nc-blue,#4CC9F0));color:#04121a;' : 'color:var(--nc-dim,#7E8AA6);') + '">' + tr('vibe_normal') + '</div>' +
      '<div data-v="1" data-t="vibe_genz" style="flex:1;text-align:center;padding:8px 4px;transition:.2s;' + (on ? 'background:linear-gradient(90deg,var(--nc-mag,#F72585),var(--nc-violet2,#7209B7));color:#fff;' : 'color:var(--nc-dim,#7E8AA6);') + '">' + tr('vibe_genz') + '</div>' +
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

/* ============================================================================
   INSTALLING NOVACLIP — the service worker registration
   ============================================================================
   Here rather than in a <script> tag because all 24 pages already load
   nova.js, so this is the one place that covers the whole site. Adding the
   snippet to every page by hand would be 24 chances to get one wrong.

   Registered after `load` deliberately: registration competes for the network
   with whatever the page is still fetching, and on the editor that is a large
   bundle. Nothing here changes what the page does — a worker that fails to
   register leaves the site exactly as it was.

   The guards matter. file:// has no service worker support and throws;
   http:// on anything except localhost is refused by the browser, so a
   preview server over plain HTTP would log an error on every page for no
   reason. novaclip.org is HTTPS, which is where this actually runs.
   ============================================================================ */
(function () {
  if (!('serviceWorker' in navigator)) return;
  var secure = location.protocol === 'https:' ||
               location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (reg) {
      watchForUpdate(reg);
      /* A worker can already be waiting from a previous visit — updatefound
         will not fire for that one, so it has to be checked directly. */
      if (reg.waiting) takeOver(reg.waiting);
      reg.addEventListener('updatefound', function () { watchForUpdate(reg); });
      /* Ask the server whether there is a newer worker. Without this a tab
         that stays open for days never finds out. */
      setInterval(function () { reg.update().catch(function () {}); }, 60 * 60 * 1000);
    }).catch(function (e) {
      /* Not fatal and not worth a dialog: the site works without it. */
      if (window.console && console.warn) console.warn('NovaClip: service worker not registered —', e && e.message);
    });
  });

  /* --------------------------------------------------------------------------
     TAKING A NEW VERSION, WHICH THE SITE PREVIOUSLY NEVER DID
     --------------------------------------------------------------------------
     sw.js does not call skipWaiting, for a good reason it states itself: a new
     worker swapping assets under a page that is mid-edit can break it. But
     registration was fire-and-forget, so nothing ever asked the waiting worker
     to take over — and a browser only retires the old one when EVERY tab of
     the site is closed. In practice that is never. Weeks of deploys sat in
     'waiting' while people were served the old files, which is exactly what a
     site looking unchanged after a push feels like.

     So: pages with nothing to lose swap and reload themselves. The editor and
     the photo tool can have work open, so they ask instead — the same handover,
     at a moment the reader picks.
     -------------------------------------------------------------------------- */
  var reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  function risky() {
    var here = (location.pathname.split('/').pop() || '').toLowerCase();
    if (window.NC_UNSAVED) return true;              // any page may declare itself busy
    return here === 'editor.html' || here === 'photo.html';
  }

  function takeOver(worker) {
    if (!worker) return;
    if (!navigator.serviceWorker.controller) return; // first ever visit: nothing to replace
    if (!risky()) { worker.postMessage({ type: 'SKIP_WAITING' }); return; }
    offerReload(worker);
  }

  function watchForUpdate(reg) {
    var w = reg.installing || reg.waiting;
    if (!w) return;
    if (w.state === 'installed') return takeOver(w);
    w.addEventListener('statechange', function () {
      if (w.state === 'installed') takeOver(w);
    });
  }

  /* A quiet pill, not a modal. It never steals focus and never reloads on its
     own, because the pages that show it are the ones holding work. */
  function offerReload(worker) {
    if (document.getElementById('ncupdate')) return;
    var box = document.createElement('div');
    box.id = 'ncupdate';
    box.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;' +
      'display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border-radius:999px;' +
      'background:#12172a;color:#EAF2FF;border:1px solid rgba(167,139,250,.45);' +
      'box-shadow:0 16px 40px rgba(0,0,0,.5);font:600 13px/1.3 "Segoe UI",system-ui,sans-serif;' +
      'max-width:calc(100vw - 24px)';
    var msg = document.createElement('span');
    msg.textContent = 'A new version of NovaClip is ready.';
    var go = document.createElement('button');
    go.type = 'button';
    go.textContent = 'Reload';
    go.style.cssText = 'min-height:36px;padding:0 14px;border-radius:999px;cursor:pointer;border:0;' +
      'background:linear-gradient(90deg,#7C5CFF,#00E5FF);color:#04121a;font:800 13px/1 inherit';
    go.onclick = function () { worker.postMessage({ type: 'SKIP_WAITING' }); };
    var no = document.createElement('button');
    no.type = 'button';
    no.setAttribute('aria-label', 'Not now');
    no.textContent = '\u00d7';
    no.style.cssText = 'min-height:36px;min-width:36px;border-radius:999px;cursor:pointer;' +
      'border:1px solid rgba(255,255,255,.18);background:transparent;color:inherit;font-size:16px';
    no.onclick = function () { box.remove(); };
    box.append(msg, go, no);
    document.body.appendChild(box);
  }
})();


/* ============================================================================
   PAIRED PAGES — one rail entry, two tabs
   ============================================================================
   Studio and Analytics look at the same channel; Editor and Photo work on the
   same footage. Four rail entries for two jobs made the rail longer without
   making anything easier to find, so each pair is one entry now and this puts
   the other half back within one press.

   Rendered here rather than in each page for the usual reason: four pages, one
   strip, and editor.html is a compiled bundle that should not be reopened to
   add a link.

   Fair Fight sits with Studio and Analytics because it is the same question —
   how is this channel doing — asked against somebody else's numbers.
   ============================================================================ */
const NC_PAIRS = [
  /* Studio and Analytics used to be two pages with a tab strip between them.
     They are one page now, so the strip is gone with them — a tab bar with one
     tab is furniture. Editor and Photo are still two pages and still need it. */
  { tabs: [['editor.html', 'Editor', 'editor'],
           ['photo.html', 'Photo', 'photo']] }
];

function ncPairTabs() {
  /* NOT INSIDE A FRAME. Embedded in Studio, this floated the Editor/Photo
     switch over the editor's own Simple/Complex toggle — two controls in the
     same 40px of the tool's title bar — and its Photo tab pointed at the full
     photo.html, rail and all, inside a frame the size of a panel. The host
     page has a rail; a second one drawn on top of the tool is not navigation.
     Photo is its own entry in the site rail now, so nothing is lost. */
  if (NC_EMBED) return;
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const pair = NC_PAIRS.find(p => p.tabs.some(t => t[0].split('#')[0] === here));
  if (!pair || document.getElementById('ncpairtabs')) return;

  const wrap = document.createElement('div');
  wrap.id = 'ncpairtabs';
  wrap.setAttribute('role', 'tablist');

  wrap.innerHTML = pair.tabs.map(([href, label, key]) => {
    /* Fair Fight is a section of the analytics page rather than a page, so it
       counts as current only when that anchor is actually open. */
    const anchor = href.includes('#') ? href.split('#')[1] : '';
    const on = href.split('#')[0] === here &&
               (anchor ? location.hash === '#' + anchor : !location.hash.startsWith('#fair'));
    /* data-t="editor" / "photo", not "pair_editor" / "pair_photo". The pair_
       prefix invented two keys that were never added to the table, so this
       strip has been in English in every language since it was written — the
       table has had `editor` and `photo` in twenty languages the whole time,
       which is what the rail beside it uses. */
    return '<a href="' + href + '" data-t="' + key + '"' +
           ' class="ncpt' + (on ? ' on' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
           label + '</a>';
  }).join('');

  const css = document.createElement('style');
  css.textContent =
    '#ncpairtabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px;padding:5px;' +
      'background:var(--nc-bg2,rgba(255,255,255,.04));border:1px solid var(--nc-line,rgba(255,255,255,.1));' +
      'border-radius:14px;width:max-content;max-width:100%}' +
    '#ncpairtabs .ncpt{padding:9px 16px;border-radius:10px;text-decoration:none;font:700 .86rem/1 system-ui;' +
      'color:var(--nc-dim,#8c96ad);white-space:nowrap;min-height:38px;display:flex;align-items:center}' +
    '#ncpairtabs .ncpt:hover{color:var(--nc-text,#EAF2FF)}' +
    '#ncpairtabs .ncpt.on{background:var(--nc-cyan,#00F0FF);color:#04121a}' +
    /* editor.html has no content column to sit inside, so there it floats. */
    '#ncpairtabs.float{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99991;' +
      'background:var(--nc-bg,#0a0d16);box-shadow:0 6px 22px rgba(0,0,0,.45)}' +
    /* On a desktop the bar has a wide empty middle for the floating pair to
       sit in. On a phone the bar is a settings button and a coins badge with
       32px between them, so `top:10px` put the Editor/Photo switch straight
       on top of both — and on editor.html the project button lands there too,
       three fixed things in the same 52px strip. Below the bar instead, on a
       row of their own, with the body making room for it so the row is not
       covering the first thing on the page in turn. */
    '@media (max-width:760px){' +
      '#ncpairtabs.float{top:calc(' + NC_BAR_H + 'px + 6px);left:8px;transform:none;' +
        'max-width:calc(100vw - 16px)}' +
      'body:has(#ncpairtabs.float){padding-top:' + (NC_BAR_H + 56) + 'px}}';
  document.head.appendChild(css);

  const host = document.querySelector('.main') || document.querySelector('.shell');
  if (host) host.insertBefore(wrap, host.firstChild);
  else { wrap.classList.add('float'); document.body.appendChild(wrap); }
}

/* ============================================================================
   GETTING OUT OF THE WAY OF A DIALOG
   ============================================================================
   The floating chrome this file adds — the Editor/Photo tabs at z-index 99991
   and the Nova pill at 99995 — sits above everything a page can reasonably
   give a modal. The editor's Project settings dialog is z-index 50, so both
   were drawn on top of it: the tabs across its title and the pill over its
   top-right corner.

   Raising the dialog is not possible from here, and lowering the pill would
   put it under things it is meant to float over the rest of the time. So they
   stand down while a dialog is open, and come back when it closes.

   "A dialog is open" is deliberately narrow: a fixed element that covers most
   of the viewport, or one that says aria-modal. A dropdown or a toast covers
   neither test and does not make the chrome vanish.
   ============================================================================ */
function ncModalWatch() {
  if (!document.body) return;

  function anyModal() {
    var nodes = document.querySelectorAll('[aria-modal="true"], [role="dialog"], .fixed');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
      if (n.getAttribute('aria-modal') === 'true') return true;
      if (cs.position !== 'fixed') continue;
      var b = n.getBoundingClientRect();
      /* most of the screen, both ways — a top bar is wide but not tall, a
         side panel is tall but not wide, and neither should count. */
      if (b.width >= innerWidth * 0.8 && b.height >= innerHeight * 0.8) return true;
    }
    return false;
  }

  var on = false;
  function check() {
    var now = anyModal();
    if (now === on) return;
    on = now;
    document.body.classList.toggle('nc-modal-open', on);
  }

  if (!document.getElementById('ncmodalcss')) {
    var st = document.createElement('style');
    st.id = 'ncmodalcss';
    st.textContent =
      'body.nc-modal-open #ncpairtabs.float,' +
      'body.nc-modal-open .nca{opacity:0;pointer-events:none;transition:opacity .15s}';
    document.head.appendChild(st);
  }

  check();

  /* Throttled, NOT debounced. The first version cleared the pending timer on
     every mutation — and the editor mutates continuously while a timeline is
     on screen, so the check was pushed back a few milliseconds at a time and
     never ran once. A debounce only settles if the noise stops, and here it
     never stops. This runs at most once every 120ms and always runs. */
  var pending = 0;
  new MutationObserver(function () {
    if (pending) return;
    pending = setTimeout(function () { pending = 0; check(); }, 120);
  }).observe(document.body, { childList: true, subtree: true, attributes: true,
                              attributeFilter: ['class', 'style', 'aria-modal', 'hidden'] });
  addEventListener('resize', check, { passive: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ncPairTabs);
else ncPairTabs();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ncModalWatch);
else ncModalWatch();


/* ============================================================================
   THE COOKIE QUESTION, ASKED ONCE
   ============================================================================
   Google Analytics is set to denied in every page's head, so nothing is
   measured and no analytics cookie exists until this banner is answered. That
   ordering is the whole point: a banner that appears after the tag has already
   fired is decoration.

   HOW IT IS WRITTEN

   Two buttons of equal weight. The dark pattern in this corner of the web is a
   bright "Accept all" beside a grey "Manage preferences" that takes four more
   presses to say no — on a site whose users are 13 to 18, that is not a thing
   to copy. "No thanks" is the same size, the same shape, and one press.

   It says what it is for in one sentence, in the words a fifteen-year-old
   would use, and links to the page that explains the rest.

   Not shown on report.html or privacy.html: somebody arriving to report a
   problem or to read what is collected should not have to clear a banner
   first, and the answer is remembered from wherever it is given.
   ============================================================================ */
const NC_CONSENT_KEY = 'nc_consent';

function ncConsent() {
  try { return localStorage.getItem(NC_CONSENT_KEY); } catch (e) { return null; }
}

function ncSetConsent(answer) {
  try { localStorage.setItem(NC_CONSENT_KEY, answer); } catch (e) {}
  try {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: answer === 'yes' ? 'granted' : 'denied' });
    }
  } catch (e) {}
  const el = document.getElementById('nccookie');
  if (el) el.remove();
}
window.ncSetConsent = ncSetConsent;
window.ncConsent = ncConsent;

function ncCookieBanner() {
  if (NC_EMBED) return;                       // inside a tab host, the host asks
  if (ncConsent()) return;                    // already answered, on any page
  if (document.getElementById('nccookie')) return;
  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  /* terms.html too: it is one of the two pages people print, and a cookie
     banner across the bottom of a document somebody is trying to read — or
     save as a PDF — is the wrong thing in the wrong place. */
  if (/^(report|privacy|terms|offline)\.html$/.test(here)) return;

  const css = document.createElement('style');
  css.textContent =
    '#nccookie{position:fixed;left:12px;right:12px;bottom:12px;z-index:99992;max-width:560px;' +
      'margin:0 auto;padding:16px 18px;border-radius:18px;' +
      'background:var(--nc-bg2,#11151f);color:var(--nc-text,#EAF2FF);' +
      'border:1px solid var(--nc-line2,rgba(255,255,255,.18));' +
      'box-shadow:0 14px 40px rgba(0,0,0,.5);font:15px/1.55 system-ui,"Segoe UI",sans-serif}' +
    '#nccookie p{margin:0 0 12px}' +
    '#nccookie a{color:var(--nc-cyan,#00F0FF)}' +
    '#nccookie .ncbtns{display:flex;gap:10px;flex-wrap:wrap}' +
    /* Equal weight on purpose — see the note above. */
    '#nccookie button{flex:1 1 130px;min-height:44px;padding:11px 18px;border-radius:12px;' +
      'font:700 15px system-ui;cursor:pointer;border:1px solid var(--nc-line2,rgba(255,255,255,.2))}' +
    '#nccookie .yes{background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}' +
    '#nccookie .no{background:transparent;color:var(--nc-text,#EAF2FF)}';
  document.head.appendChild(css);

  const box = document.createElement('div');
  box.id = 'nccookie';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Cookies');
  box.innerHTML =
    '<p>Can we count which pages get visited? It is one tool, Google Analytics, ' +
    'and it never sees your name, your account code or anything you type. ' +
    'Nothing is counted until you say yes. ' +
    '<a href="/privacy.html">What it records</a>.</p>' +
    '<div class="ncbtns">' +
      '<button type="button" class="yes" id="nccookieyes">Yes, that is fine</button>' +
      '<button type="button" class="no" id="nccookieno">No thanks</button>' +
    '</div>';
  document.body.appendChild(box);
  document.getElementById('nccookieyes').addEventListener('click', () => ncSetConsent('yes'));
  document.getElementById('nccookieno').addEventListener('click', () => ncSetConsent('no'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ncCookieBanner);
else ncCookieBanner();

/* ============================================================
   COMING BACK TO WHERE YOU WERE

   Reported like this: read a long page, press the link back to the site, and
   land at the very top of the home page rather than at the row of cards the
   link was in — "make it go to where they clicked the button not at the start
   of the page, and make it for all the pages possible".

   The browser does this for its own Back button and cannot do it for anything
   else, because a link is a brand-new navigation to a page it has no scroll
   position for. Every "back to the site" link on this site is an ordinary
   link. So the position is kept here.

   WHAT IS KEPT AND FOR HOW LONG. One entry per path in sessionStorage, which
   is per tab and dies with the tab — a position from yesterday's reading is
   not something anybody asked to come back to, and a shared computer should
   not hand the next person a map of where the last one had got to. It is only
   a number of pixels, but it is a number of pixels about somebody's reading.

   WHEN IT IS *NOT* RESTORED, which is most of the rules:
     - a URL with a #hash, because that is an explicit instruction about where
       to land and it outranks a remembered one;
     - a page opened with nothing saved for it, i.e. the first visit in this
       tab — a fresh arrival belongs at the top;
     - a saved position of 0, which is the top anyway;
     - a position past the bottom of the page as it is now, since the page may
       be shorter than it was;
     - the moment the reader scrolls, touches or presses a key themselves. A
       restore that fights the person doing the scrolling is worse than no
       restore, and this fires late enough to matter.

   WHY IT FIRES MORE THAN ONCE. The height of these pages is not settled at
   DOMContentLoaded: nova.js adds a bar and a rail, fonts swap, the category
   scene paints. Scrolling to 900px before the content is 900px tall does
   nothing at all. So it tries on ready, again on load, and a few times over
   the second after that, stopping early the moment it lands or the reader
   takes over.
   ============================================================ */
(function ncScrollMemory() {
  var KEY = 'nc_scroll_at';
  var path = location.pathname || '/';

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function write(map) {
    try { sessionStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {}
  }
  function y() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  /* Saved on the way out rather than on every scroll: pagehide is the one
     event that fires for a link click, a Back press, a tab close and a phone
     switching apps alike, and writing storage on scroll would be a write per
     frame. */
  function remember() {
    var map = read();
    var at = y();
    if (at > 20) map[path] = at; else delete map[path];
    /* A cap, so a long session in one tab does not grow this without limit.
       Oldest out first — the keys go in in visit order. */
    var keys = Object.keys(map);
    while (keys.length > 40) delete map[keys.shift()];
    write(map);
  }
  window.addEventListener('pagehide', remember);
  /* Safari used not to fire pagehide on a same-tab link; visibilitychange
     covers that and costs nothing where pagehide already worked. */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') remember();
  });

  if (location.hash) return;
  var want = read()[path];
  if (!want || want < 40) return;

  var stop = false;
  function theyTookOver() { stop = true; }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (e) {
    window.addEventListener(e, theyTookOver, { passive: true, once: true });
  });

  function tryIt() {
    if (stop) return true;
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (max < want - 4) return false;          /* page is not tall enough yet */
    window.scrollTo(0, want);
    return Math.abs(y() - want) < 4;
  }

  var tries = 0;
  function attempt() {
    if (tryIt() || ++tries > 12) return;
    setTimeout(attempt, 90);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attempt);
  else attempt();
  window.addEventListener('load', function () { tries = 0; attempt(); });
})();
