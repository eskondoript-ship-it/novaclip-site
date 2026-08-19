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
  publish: { en:"Publish", zh:"发布", hi:"प्रकाशित करें", es:"Publicar", ar:"نشر", fr:"Publier", bn:"প্রকাশ করুন", pt:"Publicar", ru:"Опубликовать", ur:"شائع کریں", id:"Terbitkan", de:"Veröffentlichen", ja:"公開", tr:"Yayınla", ko:"게시", fa:"انتشار", uk:"Опублікувати", it:"Pubblica", pl:"Opublikuj", vi:"Xuất bản" },
  socials: { en:"Socials", zh:"社交", hi:"सोशल", es:"Redes", ar:"التواصل", fr:"Réseaux", bn:"সোশ্যাল", pt:"Redes sociais", ru:"Соцсети", ur:"سوشلز", id:"Media sosial", de:"Social Media", ja:"SNS", tr:"Sosyal medya", ko:"소셜", fa:"شبکه‌های اجتماعی", uk:"Соцмережі", it:"Social", pl:"Sociale", vi:"Mạng xã hội" },
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
  sysonline: { en:"Jarvis · systems online", zh:"贾维斯 · 系统在线", hi:"Jarvis · सिस्टम ऑनलाइन", es:"Jarvis · sistemas en línea", ar:"جارفيس · الأنظمة متصلة", fr:"Jarvis · systèmes en ligne", bn:"জারভিস · সিস্টেম অনলাইন", pt:"Jarvis · sistemas online", ru:"Джарвис · системы в сети", ur:"جارویس · سسٹم آن لائن", id:"Jarvis · sistem online", de:"Jarvis · Systeme online", ja:"ジャービス · システムオンライン", tr:"Jarvis · sistemler çevrimiçi", ko:"자비스 · 시스템 온라인", fa:"جارویس · سامانه آنلاین", uk:"Джарвіс · системи онлайн", it:"Jarvis · sistemi online", pl:"Jarvis · systemy online", vi:"Jarvis · hệ thống trực tuyến" },
  controldeck: { en:"// Control deck", zh:"// 控制台", hi:"// कंट्रोल डेक", es:"// Panel de control", ar:"// لوحة التحكم", fr:"// Pupitre de commande", bn:"// কন্ট্রোল ডেক", pt:"// Painel de controle", ru:"// Панель управления", ur:"// کنٹرول ڈیک", id:"// Dasbor kendali", de:"// Kontrollzentrum", ja:"// コントロールデッキ", tr:"// Kontrol masası", ko:"// 컨트롤 데크", fa:"// عرشه کنترل", uk:"// Панель керування", it:"// Pannello di controllo", pl:"// Pokład kontrolny", vi:"// Bảng điều khiển" },
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
  biometrics: { en:"Biometrics", zh:"生物识别", hi:"बायोमेट्रिक्स", es:"Biometría", ar:"القياسات الحيوية", fr:"Biométrie", bn:"বায়োমেট্রিক্স", pt:"Biometria", ru:"Биометрия", ur:"بایومیٹرکس", id:"Biometrik", de:"Biometrie", ja:"生体認証", tr:"Biyometri", ko:"생체 인식", fa:"زیست‌سنجی", uk:"Біометрія", it:"Biometria", pl:"Biometria", vi:"Sinh trắc học" },
  theme: { en:"Theme", zh:"主题", hi:"थीम", es:"Tema", ar:"المظهر", fr:"Thème", bn:"থিম", pt:"Tema", ru:"Тема", ur:"تھیم", id:"Tema", de:"Design", ja:"テーマ", tr:"Tema", ko:"테마", fa:"پوسته", uk:"Тема", it:"Tema", pl:"Motyw", vi:"Giao diện" },
  theme_light: { en:"Light", zh:"浅色", hi:"लाइट", es:"Claro", ar:"فاتح", fr:"Clair", bn:"লাইট", pt:"Claro", ru:"Светлая", ur:"لائٹ", id:"Terang", de:"Hell", ja:"ライト", tr:"Açık", ko:"라이트", fa:"روشن", uk:"Світла", it:"Chiaro", pl:"Jasny", vi:"Sáng" },
  theme_dark: { en:"Dark", zh:"深色", hi:"डार्क", es:"Oscuro", ar:"داكن", fr:"Sombre", bn:"ডার্ক", pt:"Escuro", ru:"Тёмная", ur:"ڈارک", id:"Gelap", de:"Dunkel", ja:"ダーク", tr:"Koyu", ko:"다크", fa:"تیره", uk:"Темна", it:"Scuro", pl:"Ciemny", vi:"Tối" },
  theme_system: { en:"System", zh:"跟随系统", hi:"सिस्टम", es:"Sistema", ar:"النظام", fr:"Système", bn:"সিস্টেম", pt:"Sistema", ru:"Системная", ur:"سسٹم", id:"Sistem", de:"System", ja:"システム", tr:"Sistem", ko:"시스템", fa:"سیستم", uk:"Системна", it:"Sistema", pl:"Systemowy", vi:"Hệ thống" },
  vibe: { en:"Vibe", zh:"风格", hi:"वाइब", es:"Estilo", ar:"الأسلوب", fr:"Style", bn:"ভাইব", pt:"Estilo", ru:"Стиль", ur:"انداز", id:"Gaya", de:"Stil", ja:"雰囲気", tr:"Tarz", ko:"분위기", fa:"حال‌وهوا", uk:"Стиль", it:"Stile", pl:"Styl", vi:"Phong cách" },
  vibe_normal: { en:"Normal", zh:"普通", hi:"सामान्य", es:"Normal", ar:"عادي", fr:"Normal", bn:"সাধারণ", pt:"Normal", ru:"Обычный", ur:"عام", id:"Normal", de:"Normal", ja:"ふつう", tr:"Normal", ko:"보통", fa:"عادی", uk:"Звичайний", it:"Normale", pl:"Zwykły", vi:"Bình thường" },
  vibe_genz: { en:"Gen\u00a0Z", zh:"Z世代", hi:"Gen\u00a0Z", es:"Gen\u00a0Z", ar:"جيل\u00a0Z", fr:"Gen\u00a0Z", bn:"Gen\u00a0Z", pt:"Gen\u00a0Z", ru:"Зумер", ur:"Gen\u00a0Z", id:"Gen\u00a0Z", de:"Gen\u00a0Z", ja:"Z世代", tr:"Z\u00a0Kuşağı", ko:"Z세대", fa:"نسل\u00a0Z", uk:"Зумер", it:"Gen\u00a0Z", pl:"Pokolenie\u00a0Z", vi:"Gen\u00a0Z" },

  quests: { en:"Rewards", zh:"奖励", hi:"रिवॉर्ड्स", es:"Recompensas", ar:"الجوائز", fr:"Récompenses", bn:"পুরস্কার", pt:"Recompensas", ru:"Награды", ur:"انعامات", id:"Hadiah", de:"Belohnungen", ja:"リワード", tr:"Ödüller", ko:"보상", fa:"جوایز", uk:"Нагороди", it:"Ricompense", pl:"Nagrody", vi:"Phần thưởng" },
  achievements: { en:"Achievements", zh:"成就", hi:"उपलब्धियाँ", es:"Logros", ar:"الإنجازات", fr:"Succès", bn:"অর্জন", pt:"Conquistas", ru:"Достижения", ur:"کامیابیاں", id:"Pencapaian", de:"Erfolge", ja:"実績", tr:"Başarılar", ko:"업적", fa:"دستاوردها", uk:"Досягнення", it:"Obiettivi", pl:"Osiągnięcia", vi:"Thành tựu" },
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

function tr(key) { return (T[key] && T[key][lang()]) || (T[key] && T[key].en) || ''; }
function langInstruction() { return ' Reply ONLY in this language: ' + (LANGS[lang()] || 'English') + '. '; }
function applyLangText() {
  document.documentElement.lang = lang();
  document.documentElement.dir = RTL.includes(lang()) ? 'rtl' : 'ltr';
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
const NC_THEME_KEY = 'nc_theme';

function ncThemePref() {
  try { const v = localStorage.getItem(NC_THEME_KEY); if (v === 'light' || v === 'dark' || v === 'system') return v; } catch (e) {}
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
  return t;
}

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
".nc-themebtn{flex:1;padding:7px 4px;border:0;background:none;cursor:pointer;color:var(--nc-dim);" +
  "font:inherit;font-size:.72rem;font-weight:700;display:grid;place-items:center;gap:2px;" +
  "transition:background .18s,color .18s;}" +
".nc-themebtn:hover{color:var(--nc-text);background:var(--nc-card2);}" +
".nc-themebtn:focus-visible{outline:2px solid var(--nc-cyan);outline-offset:-2px;}" +
".nc-themebtn.on{background:linear-gradient(135deg,var(--nc-violet),var(--nc-cyan));color:#04121a;}" +
"html[data-theme=\"light\"] .nc-themebtn.on{color:#fff;}" +
".nc-themebtn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;" +
  "stroke-linecap:round;stroke-linejoin:round;}";
document.head.appendChild(ncThemeStyle);

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
      'display:flex;align-items:center;gap:14px;padding:0 14px;box-sizing:border-box;' +
      'background:var(--nc-bar-bg,rgba(10,13,24,.72));' +
      'border-bottom:1px solid var(--nc-line2,rgba(255,255,255,.08));' +
      'backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4)}' +
    'html[data-theme="light"] #ncbar{--nc-bar-bg:rgba(255,255,255,.78)}' +
    /* Sits beside the rail, not under it — but only where there IS a rail.
       The editor, trends and the family page have no .sidebar, and offsetting
       the bar by a rail that is not there leaves a dead strip down the left,
       which is the same mistake the body margin made before it was scoped. */
    '@media (min-width:761px){body:has(.sidebar) #ncbar{left:var(--nc-rail)}}' +
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
    '#ncbar #nc-themerow .nc-themebtn{padding:5px 4px}' +
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
      'body:has(#ncbar):not(:has(.content)):not(:has(.shell)):not(:has(.main))' +
        '{padding-top:' + NC_BAR_H + 'px}' +
    '}' +
    /* On a phone the rail is a bottom strip and the bar is the full width. */
    '@media (max-width:760px){#ncbar{padding:0 10px;gap:10px}' +
      '#ncbar .themewrap{gap:10px}' +
      /* The labels go: the sun/screen/moon row and a Normal|Gen Z switch say
         what they are, and on a 390px screen the three controls only fit
         without a sideways swipe if the words come out. */
      /* !important because both labels are built with an inline
         style="display:block" — an inline style outranks any stylesheet rule
         that does not say otherwise, so without this only the Language label
         (the one nova.js builds without inline styles) actually went away. */
      '#ncbar .themewrap label{display:none !important}' +
      '#ncbar #nc-themerow .nc-themerow{width:84px}' +
      '#ncbar #genzToggle{width:112px}' +
      '#ncbar select{max-width:116px;font-size:.74rem}' +
      'body{padding-top:' + NC_BAR_H + 'px}}' +
    /* The sidebar copy would be a second set of the same three controls. */
    '.sidebar .themewrap{display:none !important}' +
    /* JARVIS MOVES INTO THE BAR.
       The pill is fixed at top:14px in the centre of the viewport with a
       z-index of 99995, so it does not care what is under it — and centred at
       the top of the page is exactly where every page puts something. It was
       over the Language control here, and it has already been over the
       editor's Export button and its Simple/Complex toggle. Pushing it down
       just moved the collision onto the editor's transport controls.

       The bar has a permanent gap between the controls and the coins badge, on
       every page, so the pill goes there: still fixed, still always visible,
       and now in a strip that is reserved rather than borrowed. Its three
       transform states have to be restated because the centring translate they
       were built on is gone.

       NOT with !important, and NOT using `right`. The pill is draggable now,
       and a drag writes style.left/style.top straight onto the element — an
       !important rule here would outrank those and the orb would refuse to
       move. `html body` outranks jarvis.js's own `.jr-pill` while still losing
       to an inline style, which is exactly the order wanted: this places it,
       and the reader gets the final say. `right` is avoided for the same
       reason — a dragged pill has an inline `left`, and left+right together on
       an auto-width box stretches it across the gap. */
    'html body .jr-pill{top:8px;left:calc(100% - 176px);transform:translateX(-100%)}' +
    'html body .jr-pill:hover{transform:translateX(-100%) translateY(-1px)}' +
    'html body .jr-pill.hidden{transform:translateX(-100%) translateY(-8px)}' +
    /* Not enough room beside the controls on a small screen: it goes back to
       the centre, below the bar, where the page has not started yet. */
    '@media (max-width:1180px){html body .jr-pill{top:' + (NC_BAR_H + 8) + 'px;' +
      'left:50%;transform:translateX(-50%)}' +
      'html body .jr-pill:hover{transform:translateX(-50%) translateY(-1px)}' +
      'html body .jr-pill.hidden{transform:translateX(-50%) translateY(-8px)}}' +
    'html body .jr-sheet{top:' + (NC_BAR_H + 6) + 'px}' +
    /* The coins badge and the Pro badge are already at the far right of the
       strip's height, so they read as part of the bar rather than fighting it —
       they only need centring against it. */
    '#ncpts{top:' + Math.round((NC_BAR_H - 32) / 2) + 'px}';
  document.head.appendChild(css);

  bar = document.createElement('div');
  bar.id = 'ncbar';
  const inner = document.createElement('div');
  inner.className = 'themewrap';              // what the two builders look for
  bar.appendChild(inner);
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

  return inner;
}

function ncBuildThemeSwitch() {
  if (NC_EMBED) return;
  if (document.getElementById('nc-themerow')) return;
  const host = document.querySelector('.themewrap') ||
    (typeof ncCornerBox === 'function' ? ncCornerBox() : null);
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

  wrap.append(label, row);
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
function ncCornerBox() {
  let box = document.getElementById('ncCorner');
  if (box) return box.querySelector('.nccbody');

  const st = document.createElement('style');
  st.textContent =
    '#ncCorner{position:fixed;left:14px;bottom:14px;z-index:99994;display:flex;' +
      'flex-direction:column-reverse;align-items:flex-start;gap:8px}' +
    '#ncCorner .nccbtn{width:38px;height:38px;display:grid;place-items:center;cursor:pointer;' +
      'border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(12,14,20,.92);' +
      'color:#EAF2FF;box-shadow:0 8px 26px rgba(0,0,0,.45);padding:0}' +
    '#ncCorner .nccbtn:hover{border-color:rgba(0,240,255,.55)}' +
    '#ncCorner .nccbtn svg{width:18px;height:18px;stroke:currentColor;fill:none;' +
      'stroke-width:2;stroke-linecap:round}' +
    '#ncCorner .nccbody{width:190px;border-radius:12px;padding:10px 12px;' +
      'background:rgba(10,12,20,.92);backdrop-filter:blur(8px);' +
      'border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 26px rgba(0,0,0,.45)}' +
    '#ncCorner .nccbody[hidden]{display:none}' +
    '#ncCorner .nccbody select{width:100%;padding:8px 10px;border-radius:10px;' +
      'border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);' +
      'color:#EAF2FF;font:600 13px inherit;cursor:pointer}' +
    '@media (max-width:760px){#ncCorner{bottom:74px}}';
  document.head.appendChild(st);

  box = document.createElement('div');
  box.id = 'ncCorner';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nccbtn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ncCornerBody');
  btn.setAttribute('aria-label', tr('vibe') + ' / ' + (LANGS[lang()] || 'Language'));
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/>' +
    '<path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></svg>';
  const body = document.createElement('div');
  body.className = 'nccbody themewrap';
  body.id = 'ncCornerBody';
  body.hidden = true;
  box.append(btn, body);
  document.body.appendChild(box);

  const setOpen = o => { body.hidden = !o; btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', e => { e.stopPropagation(); setOpen(body.hidden); });
  document.addEventListener('click', e => { if (!box.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  return body;
}

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
  ncCornerBox().appendChild(pick);
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
  'Top the Strike Arena scoreboard':'sk_arena'
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
  ai_ask:     { icon:'', label:'Ask a NovaClip AI tutor' }
  /* arena_mvp — "Top the Strike Arena scoreboard" — is gone with the Arena
     itself. Nothing could log it any more, so the Progress page showed a row
     stuck at 0/3 and the Master Certificate could not be finished by anyone. A
     requirement with nothing behind it is worse than no requirement. */
};

/* Each tier needs points AND hands-on reps. Points on their own can be
   collected by playing, so the skill counts are what stop a certificate being
   awarded for time spent rather than work done. */
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
    skills: { yt_connect:1, edit_export:25, trend_scan:20, idea_save:15, analytics:15, ai_ask:30 }
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
".sidebar { background: linear-gradient(180deg, var(--nc-rail1,rgba(8,9,16,0.96)), var(--nc-rail2,rgba(10,8,20,0.96))) !important; border-right:1px solid rgba(0,240,255,0.18) !important; box-shadow: 8px 0 40px rgba(0,240,255,0.05); }" +
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
":root { --nc-rail: clamp(164px, 13vw, 232px); }" +
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
  ".sidebar { width: var(--nc-rail); }" +
  /* The brand and the first nav rows sat 20px of page padding plus a further
     margin below the rail's own top edge, which put the logo a thumb's width
     from the top on every page. The rail is the site's top edge now — the
     padding above it was wasted space, so it is pulled up to sit near it. */
  ".sidebar { padding-top: 8px; }" +
  "#ncprof { margin-top: 2px; }" +
  /* The reading column was centred in whatever space the rail left over, which
     on a 1920 screen is 760px of text floating in 1688px of room — a 400px
     dead strip against the sidebar on ai, community, publish, progress and
     trends. Pinned to the same ~60px the home page uses, and allowed to grow
     to 1120px before it stops, so wide screens gain content rather than
     margin. The slack goes to the right, where nothing is competing with it. */
  ".wrap { padding-left: clamp(0px, 1.2vw, 22px); padding-right: clamp(0px, 1.2vw, 22px);" +
  " margin-left: clamp(24px, 3.6vw, 64px); margin-right: auto;" +
  " width: min(1120px, 100% - clamp(24px, 3.6vw, 64px)); }" +
  /* The labels scale with the rail, or a 232px rail is a 164px rail with more
     empty space in it. */
  ".sidebar a, .sidebar .navlink { font-size: clamp(13px, .62vw + 8.6px, 15px); }" +
  ".sidebar .themewrap { padding: 14px clamp(14px, 1.1vw, 20px) 22px; }" +

  /* RTL: the rail sits on the right, everything that pushed for a left rail
     mirrors. Scoped to desktop because the phone strip spans the whole width
     and its left:0;right:0 must stay. */
  "html[dir=rtl] .sidebar { left:auto; right:0; border-right:0; " +
    "border-left:1px solid var(--nc-railline,rgba(255,255,255,.07)); }" +
  "html[dir=rtl] .sidebar::before { right:auto; left:-1px; }" +
  "html[dir=rtl] body:has(.sidebar) { margin-left:0; margin-right:var(--nc-rail); }" +
  "html[dir=rtl] .content, html[dir=rtl] .shell, html[dir=rtl] .main { margin-left:0; margin-right:var(--nc-rail); }" +
  "html[dir=rtl] .main { padding-left:clamp(0px, 1.2vw, 22px); padding-right:clamp(20px, 3.4vw, 64px); }" +
  "html[dir=rtl] .wrap { margin-left:auto; margin-right:clamp(24px, 3.6vw, 64px); }" +

"}" +

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

"@media (max-width: 760px) {" +
  ".sidebar {" +
    "display: flex; flex-direction: row; align-items: center;" +
    "top: auto; bottom: 0; left: 0; right: 0;" +
    /* border-box or the 4px padding is added to the 100% and the strip is
       wider than the screen — community.html measured 394 on a 390 phone. */
    /* 100% resolves against the containing block, and an ancestor with a
       filter or transform makes that something other than the viewport —
       community.html resolved it to 394 on a 390px phone and put a
       horizontal scrollbar on the page. 100vw is the viewport by
       definition, so it is the ceiling. */
    "width: 100%; max-width: 100vw; height: 64px; padding: 0 4px; box-sizing: border-box;" +
    "overflow-x: auto; overflow-y: hidden;" +
  "}" +
  ".sidebar .themewrap { display: none; }" +
  /* Reserve the strip's height, or the last thing on every page sits under it. */
  "body { padding-bottom: 74px; margin-left: 0; }" +
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
const NC_SYNC_KEYS = ['nc_points', 'nc_skills', 'nc_certs','nc_pro','nc_subscription', 'nc_cert_enrolled',
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

function refreshPanels() {
  const pts = getPts();
  const ql = document.getElementById('questlist'); if (ql) ql.innerHTML = QUESTS.map(([need,name]) => pts >= need ? qName(name) + tr('ui_done') : qName(name) + ' — ' + (need - pts) + ' ' + tr('ui_go')).join('<br>');
  const al = document.getElementById('achlist'); if (al) al.innerHTML = ACHIEVEMENTS.map(([need,name]) => pts >= need ? qName(name) : tr('ui_reach').replace('{n}', need).replace('{p}', pts)).join('<br>');
  /* The questions go through ncEscape first. They are typed by the reader, but
     "their own browser" is not the whole story: parent.html shows this same
     nc_history to a parent, so an answer written to look like markup would run
     on a page somebody else is reading. */
  const hl = document.getElementById('histlist'); if (hl) { const h = JSON.parse(localStorage.getItem('nc_history') || '{}'); let html = ''; for (const s in h) { html += '<b>' + ncEscape(s) + '</b> (' + h[s].length + ' chats)<br>' + h[s].slice(-3).map(x => '• ' + ncEscape(x[0])).join('<br>') + '<br><br>'; } hl.innerHTML = html || tr('ui_no_chats'); }
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
    '<span style="font-size:1.18rem;font-weight:800;letter-spacing:-0.5px;color:var(--nc-text,#EAF2FF);' +
    'font-family:Segoe UI,-apple-system,sans-serif">Nova<span style="color:var(--nc-cyan,#00F0FF)">Clip</span></span>';
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

  const box = document.createElement('button');
  box.id = 'ncprof';
  box.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;margin:2px 0 6px;' +
    'padding:9px 10px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);' +
    'background:rgba(255,255,255,0.03);color:inherit;font:inherit;cursor:pointer;text-align:left';
  function paint() {
    const pic = ncAvatar();
    const face = pic.startsWith('data:')
      ? '<img src="' + pic + '" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover">'
      : '<span style="display:grid;place-items:center;width:32px;height:32px;border-radius:50%;' +
        'background:linear-gradient(120deg,#7C5CFF,#00E5FF);font-size:17px">' + pic + '</span>';
    box.innerHTML = face + '<span style="font-size:13.5px;font-weight:600">' +
      (ncName() ? ncName().replace(/[<>&]/g, '') : tr('ui_set_name')) + '</span>';
  }
  paint();
  sb.insertBefore(box, sb.firstChild);
  box.onclick = openProfile;

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
  life: 'M12 21s-6.6-4.7-9.1-8.8C1 8.9 3.1 4.5 7.2 4.5c2.4 0 3.9 1.1 4.8 2.6.9-1.5 2.4-2.6 4.8-2.6 4.1 0 6.2 4.4 4.3 7.7C18.6 16.3 12 21 12 21z'
};

const NC_NAV = [
  { items: [['index.html', 'Home', 'home', 'home']] },
  { name: 'Channel', key: 'nav_channel', icon: 'analytics', items: [
      ['app.html', 'Studio', 'studio', 'studio'], ['analytics.html', 'Analytics', 'analytics', 'analytics']] },
  /* Everything you make lives in Create: the editor, publishing and the AI
     toolkit. Games and NovaLife are for learning and play, so they sit in
     their own Learn group instead of pretending to be creation tools. */
  { name: 'Create', key: 'nav_create', icon: 'editor', items: [
      ['editor.html', 'Editor', 'editor', 'editor'], ['photo.html', 'Photo', 'photo', 'editor'],
      ['publish.html', 'Publish', 'publish', 'publish'],
      ['studio-ai.html', 'AI', 'ai', 'ai']] },
  { name: 'Learn', key: 'nav_learn', icon: 'life', items: [
      ['novalife.html', 'NovaLife', 'life', 'life'], ['game.html', 'Games', 'games', 'games']] },
  { items: [['socials.html', 'Socials', 'socials', 'gift']] },
  { name: 'You', key: 'nav_you', icon: 'progress', items: [
      ['progress.html', 'Progress', 'progress', 'progress'], ['parent.html', 'Family', 'family', 'family'],
      ['biometrics.html', 'Biometrics', 'biometrics', 'signin'],
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
        /* A visible scrollbar inside a 64px strip eats a fifth of it. */
        'scrollbar-width:none}' +
        '.sidebar::-webkit-scrollbar{display:none}' +
        /* Rows in a row, not a column stacked inside a 64px-tall box. */
        '#ncnav{flex-direction:row;align-items:center;gap:2px;padding:0 4px;' +
        'flex:0 0 auto}' +
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
        '.sidebar #ncprof{order:9;width:auto !important;flex:0 0 auto;' +
        'margin:0 0 0 4px !important;padding:6px !important;white-space:nowrap}' +
        '.sidebar #ncprof span:last-child{display:none}}',
      '#ncnav{display:flex;flex-direction:column;gap:2px;padding:2px 10px 6px}',

      /* group header */
      '#ncnav .ncgh{display:flex;align-items:center;gap:7px;width:100%;',
      'padding:clamp(7px,1.15vh,14px) 9px clamp(3px,.55vh,7px);background:none;border:0;cursor:pointer;text-align:left;',
      'font:700 10px/1 Segoe UI,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase;',
      'color:var(--nc-navhead,#5D6A88);transition:color .18s}',
      '#ncnav .ncgh:hover{color:var(--nc-navhover,#A8B8D8)}',
      '#ncnav .ncgh .ncgl{flex:1;height:1px;background:linear-gradient(90deg,var(--nc-line2,rgba(255,255,255,.10)),transparent)}',
      '#ncnav .ncgh .ncar{width:13px;height:13px;flex:0 0 auto;transition:transform .22s cubic-bezier(.4,1.4,.5,1);opacity:.6}',
      '#ncnav .ncg.shut .ncar{transform:rotate(-90deg)}',
      /* The layout lives here, not in an inline style. An inline display:flex
         beats any stylesheet rule, so collapsing would silently do nothing. */
      '#ncnav .ncgi{display:flex;flex-direction:column;gap:2px}',
      '#ncnav .ncg.shut .ncgi{display:none}',

      /* the row. position:relative for the active rail; the gradient sits in a
         ::before at opacity 0 so hovering fades it rather than snapping. */
      '.sidebar #ncnav a.ncl{position:relative;display:flex;align-items:center;gap:11px;margin:0;',
      /* Sixteen links at a fixed 50px each, plus six group headers and the
         brand and profile blocks, is 1112px of nav. That fits a 1280x800
         laptop only because the groups collapse below 820px tall — between
         about 860 and 1120 nothing collapses and nothing fits either, so the
         rail scrolls and the last two links sit under the fold. A nav you
         have to scroll to reach is a nav with a hidden half. The row height
         is a share of the window now: tighter on a short screen, roomier on
         a tall one. */
      'padding:clamp(5px,.8vh,10px) 12px;border-radius:11px;font:600 14px/1.2 Segoe UI,system-ui,sans-serif;',
      'color:var(--nc-navlink,#98A6C4);text-decoration:none;background:none;isolation:isolate;',
      'transition:color .18s,transform .18s}',
      '.sidebar #ncnav a.ncl::before{content:"";position:absolute;inset:0;border-radius:11px;z-index:-1;',
      'background:linear-gradient(105deg,rgba(124,92,255,.22),rgba(0,229,255,.13));',
      'opacity:0;transition:opacity .2s}',
      '.sidebar #ncnav a.ncl:hover{color:var(--nc-navon,#EAF2FF);transform:translateX(2px)}',
      '.sidebar #ncnav a.ncl:hover::before{opacity:1}',
      '.sidebar #ncnav a.ncl:focus-visible{outline:2px solid #00E5FF;outline-offset:2px}',

      /* active: the gradient stays lit, plus a rail on the left edge */
      '.sidebar #ncnav a.ncl.on{color:var(--nc-navon,#fff)}',
      '.sidebar #ncnav a.ncl.on::before{opacity:1;',
      'background:linear-gradient(105deg,rgba(247,37,133,.26),rgba(124,92,255,.30) 55%,rgba(0,229,255,.18))}',
      '.sidebar #ncnav a.ncl.on::after{content:"";position:absolute;left:-10px;top:50%;transform:translateY(-50%);',
      'width:3px;height:22px;border-radius:0 3px 3px 0;background:linear-gradient(180deg,#F72585,#7C5CFF,#00E5FF);',
      'box-shadow:0 0 12px rgba(124,92,255,.75)}',

      /* the icon sits in its own tile so the rows line up whatever the glyph */
      '.sidebar #ncnav a.ncl .nci{width:17px;height:17px;flex:0 0 auto;opacity:.72;transition:opacity .18s,transform .18s}',
      '.sidebar #ncnav a.ncl:hover .nci{opacity:1;transform:scale(1.08)}',
      '.sidebar #ncnav a.ncl.on .nci{opacity:1}',
      '.sidebar #ncnav a.ncl .nct{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',

      /* profile and brand, tidied to match */
      '.sidebar #ncprof{border-radius:13px !important;transition:background .18s,border-color .18s}',
      '.sidebar #ncprof:hover{background:rgba(255,255,255,.07) !important;border-color:rgba(124,92,255,.5) !important}',
      '.sidebar .themewrap{border-top:1px solid rgba(255,255,255,.06);margin-top:auto;position:sticky;bottom:0;z-index:2;background:var(--nc-rail3,#080B14)}',

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

  /* Any link the page shipped with is replaced. Keeping them would mean two
     navigations disagreeing about where things are. */
  [...bar.querySelectorAll('a')].forEach(a => {
    if (a.id === 'ncbrand') return;
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
    if (q && /^(gemini|openrouter|openai)$/.test(q)) return q;
    const ls = localStorage.getItem('nc_ai_provider');
    if (ls && /^(gemini|openrouter|openai)$/.test(ls)) return ls;
  } catch (e) { /* storage may be off in a privacy mode — fall through */ }
  return 'gemini';
}

function ncDefaultModel(provider) {
  if (provider === 'openrouter') return 'openai/gpt-4o-mini';
  if (provider === 'openai') return 'gpt-4o-mini';
  return 'gemini-3.6-flash';
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
    err = 'Could not reach the AI. Check your connection.';
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
      err = 'The AI ran out of room before it wrote anything. Ask for something shorter.';
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
window.ncActiveProvider = ncActiveProvider; window.ncDefaultModel = ncDefaultModel;
/* The worker's address, exported for the same consumers that use ncAsk —
   jarvis.js reads it to reach the /tts endpoint for its voice. */
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
  /* Two files, two tools, and they are not the same thing:
       animator.js  the limb puppet, plus the object remover
       motionlabs.js the paper cut-out effect (Animation Studio)
     Loaded separately so one missing file does not take the other down. */
  [['ncanimjs', 'animator.js', 'Animate a drawing and Remove something'],
   ['ncmljs', 'motionlabs.js', 'Paper animation'],
   /* Dragging a clip around the preview instead of typing two decimals into
      the Transform panel. Same reason as the other two: the bundle is 397 kB,
      so a script tag inside it is a re-paste of the whole file. */
   ['ncmovejs', 'editor-move.js', 'Drag on the preview']].forEach(function (f) {
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
                     '.content{margin-left:0!important}';
    document.head.appendChild(st);
  }
  dedupeChrome();
  ncBrand();
  ncProfile();
  if (!NC_EMBED) ncNav();
  ncEditorTools();
  /* Not inside an iframe. Games, Socials and AI are hosts that put existing
     pages behind tabs, so nova.js runs once in the host and again in each
     frame — which meant two chat widgets stacked on top of each other, and a
     screen-time clock counting every minute twice. The rail already stands
     down under ?embed=1; these are the two that did not. */
  if (!NC_EMBED) {
    ncScreenTime();
    ncMiniAI();
  }
  // warm the channel cache in the background so message one already has it
  if (ncYTToken()) setTimeout(function () { ncChannelSnapshot(); }, 1200);
  const badge = document.createElement('div'); badge.id = 'ncpts'; badge.textContent = '🪙 ' + getPts(); document.body.appendChild(badge);
  const t = document.createElement('div'); t.id = 'nctoast'; document.body.appendChild(t);
  const lpick = document.getElementById('langpick');
  if (lpick) { for (const c in LANGS) { const o = document.createElement('option'); o.value = c; o.textContent = LANGS[c]; lpick.appendChild(o); } lpick.value = lang(); lpick.onchange = () => applyLang(lpick.value); }
  /* Before the two builders below, and before ncEnsureLangPick's fallback:
     each of them mounts into the first .themewrap it finds, and the bar has to
     exist by then or they mount into the sidebar and the bar comes up empty. */
  ncBuildBar();
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
        outcome(tr('ui_age_u_t'),
          tr('ui_age_u_b'),
          '<a href="parent.html" style="display:inline-block;margin-top:18px;padding:13px 28px;border-radius:30px;font-weight:800;text-decoration:none;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a">' + tr('ui_fam_dash') + '</a>');
        return;
      }
      if (a > 18) {
        outcome(tr('ui_age_o_t'),
          tr('ui_age_o_b'),
          '<a href="parent.html" style="display:inline-block;margin-top:18px;padding:13px 28px;border-radius:30px;font-weight:800;text-decoration:none;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a">' + tr('ui_fam_dash') + '</a>');
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
    sysonline:'jarvis · all systems up', controldeck:'// control deck',
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
    /* Not every page has a sidebar — pricing, the editor and the family page do
       not — and on those the switch simply never appeared, so the mode was
       unreachable from half the site. Fall back to a small floating control in
       the corner rather than skipping the page. */
    let wrap = document.querySelector('.themewrap') || ncCornerBox();
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
