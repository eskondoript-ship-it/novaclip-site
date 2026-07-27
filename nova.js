const THEMES = { 'Dark':['#0E1117','#1E2130','#FAFAFA'], 'Light':['#FFFFFF','#F0F2F6','#111111'], 'Blue':['#0A1A3F','#14295E','#D6E4FF'], 'Red':['#2B0A0A','#4A1414','#FFD6D6'], 'Green':['#0A2B14','#14472A','#D6FFE0'], 'Rainbow':['#1A0A2B','#2B1450','#FFFFFF'], 'Rainy Window':['#0B1016','#161E28','#D8E4F0'] };
const LANGS = { en:'English', zh:'中文', hi:'हिन्दी', es:'Español', ar:'العربية', fr:'Français', bn:'বাংলা', pt:'Português', ru:'Русский', ur:'اردو', id:'Bahasa Indonesia', de:'Deutsch', ja:'日本語', tr:'Türkçe', ko:'한국어', fa:'فارسی', uk:'Українська', it:'Italiano', pl:'Polski', vi:'Tiếng Việt' };
const RTL = ["ar", "fa", "ur"];
const T = {
  home: { en:"Home", zh:"首页", hi:"होम", es:"Inicio", ar:"الرئيسية", fr:"Accueil", bn:"হোম", pt:"Início", ru:"Главная", ur:"ہوم", id:"Beranda", de:"Start", ja:"ホーム", tr:"Ana Sayfa", ko:"홈", fa:"خانه", uk:"Головна", it:"Home", pl:"Start", vi:"Trang chủ" },
  studio: { en:"Studio", zh:"工作室", hi:"स्टूडियो", es:"Estudio", ar:"استوديو", fr:"Studio", bn:"স্টুডিও", pt:"Estúdio", ru:"Студия", ur:"اسٹوڈیو", id:"Studio", de:"Studio", ja:"スタジオ", tr:"Stüdyo", ko:"스튜디오", fa:"استودیو", uk:"Студія", it:"Studio", pl:"Studio", vi:"Studio" },
  trends: { en:"Trend Spotter", zh:"趋势雷达", hi:"ट्रेंड स्पॉटर", es:"Detector de Tendencias", ar:"راصد الاتجاهات", fr:"Détecteur de Tendances", bn:"ট্রেন্ড স্পটার", pt:"Radar de Tendências", ru:"Радар трендов", ur:"ٹرینڈ اسپاٹر", id:"Pemantau Tren", de:"Trend-Radar", ja:"トレンド探知", tr:"Trend Radarı", ko:"트렌드 탐지기", fa:"ردیاب ترند", uk:"Радар трендів", it:"Rileva Tendenze", pl:"Radar Trendów", vi:"Dò Xu Hướng" },
  ai: { en:"NovaClip AI", zh:"NovaClip 智能", hi:"NovaClip एआई", es:"IA NovaClip", ar:"ذكاء NovaClip", fr:"IA NovaClip", bn:"NovaClip এআই", pt:"IA NovaClip", ru:"ИИ NovaClip", ur:"NovaClip اے آئی", id:"AI NovaClip", de:"NovaClip KI", ja:"NovaClip AI", tr:"NovaClip YZ", ko:"NovaClip AI", fa:"هوش مصنوعی NovaClip", uk:"ШІ NovaClip", it:"IA NovaClip", pl:"AI NovaClip", vi:"AI NovaClip" },
  editor: { en:"Editor", zh:"编辑器", hi:"एडिटर", es:"Editor", ar:"المحرر", fr:"Éditeur", bn:"এডিটর", pt:"Editor", ru:"Редактор", ur:"ایڈیٹر", id:"Editor", de:"Editor", ja:"エディター", tr:"Editör", ko:"에디터", fa:"ویرایشگر", uk:"Редактор", it:"Editor", pl:"Edytor", vi:"Trình chỉnh sửa" },
  sniper: { en:"Sniper", zh:"狙击手", hi:"स्नाइपर", es:"Francotirador", ar:"قناص", fr:"Sniper", bn:"স্নাইপার", pt:"Sniper", ru:"Снайпер", ur:"سنائپر", id:"Sniper", de:"Sniper", ja:"スナイパー", tr:"Keskin Nişancı", ko:"스나이퍼", fa:"تک‌تیرانداز", uk:"Снайпер", it:"Cecchino", pl:"Snajper", vi:"Bắn tỉa" },
  family: { en:"👨‍👩‍👧 Family", zh:"👨‍👩‍👧 家庭", hi:"👨‍👩‍👧 परिवार", es:"👨‍👩‍👧 Familia", ar:"👨‍👩‍👧 العائلة", fr:"👨‍👩‍👧 Famille", bn:"👨‍👩‍👧 পরিবার", pt:"👨‍👩‍👧 Família", ru:"👨‍👩‍👧 Семья", ur:"👨‍👩‍👧 خاندان", id:"👨‍👩‍👧 Keluarga", de:"👨‍👩‍👧 Familie", ja:"👨‍👩‍👧 家族", tr:"👨‍👩‍👧 Aile", ko:"👨‍👩‍👧 가족", fa:"👨‍👩‍👧 خانواده", uk:"👨‍👩‍👧 Сім’я", it:"👨‍👩‍👧 Famiglia", pl:"👨‍👩‍👧 Rodzina", vi:"👨‍👩‍👧 Gia đình" },
  pricing: { en:"💳 Pricing", zh:"💳 定价", hi:"💳 मूल्य", es:"💳 Precios", ar:"💳 الأسعار", fr:"💳 Tarifs", bn:"💳 মূল্য", pt:"💳 Preços", ru:"💳 Цены", ur:"💳 قیمتیں", id:"💳 Harga", de:"💳 Preise", ja:"💳 料金", tr:"💳 Fiyat", ko:"💳 요금", fa:"💳 قیمت‌گذاری", uk:"💳 Ціни", it:"💳 Prezzi", pl:"💳 Cennik", vi:"💳 Giá" },
  eyebrow: { en:"For teen creators · 13–18", zh:"面向青少年创作者 · 13–18", hi:"किशोर क्रिएटर्स के लिए · 13–18", es:"Para creadores adolescentes · 13–18", ar:"لصناع المحتوى المراهقين · 13–18", fr:"Pour les jeunes créateurs · 13–18", bn:"কিশোর নির্মাতাদের জন্য · 13–18", pt:"Para criadores adolescentes · 13–18", ru:"Для юных авторов · 13–18", ur:"نوجوان تخلیق کاروں کے لیے · 13–18", id:"Untuk kreator remaja · 13–18", de:"Für junge Creator · 13–18", ja:"10代のクリエイター向け · 13–18", tr:"Genç içerik üreticileri için · 13–18", ko:"청소년 크리에이터를 위해 · 13–18", fa:"برای سازندگان نوجوان · 13–18", uk:"Для юних авторів · 13–18", it:"Per giovani creator · 13–18", pl:"Dla młodych twórców · 13–18", vi:"Cho nhà sáng tạo trẻ · 13–18" },
  startchannel: { en:"Start your channel →", zh:"开启你的频道 →", hi:"अपना चैनल शुरू करें →", es:"Inicia tu canal →", ar:"ابدأ قناتك →", fr:"Lance ta chaîne →", bn:"আপনার চ্যানেল শুরু করুন →", pt:"Começa o teu canal →", ru:"Начни свой канал →", ur:"اپنا چینل شروع کریں →", id:"Mulai channel-mu →", de:"Starte deinen Kanal →", ja:"チャンネルを始めよう →", tr:"Kanalını başlat →", ko:"채널을 시작하세요 →", fa:"کانالت را شروع کن →", uk:"Почни свій канал →", it:"Avvia il tuo canale →", pl:"Załóż swój kanał →", vi:"Bắt đầu kênh của bạn →" },
  seerewards: { en:"See the rewards", zh:"查看奖励", hi:"रिवॉर्ड्स देखें", es:"Ver recompensas", ar:"شاهد الجوائز", fr:"Voir les récompenses", bn:"পুরস্কার দেখুন", pt:"Ver recompensas", ru:"Смотреть награды", ur:"انعامات دیکھیں", id:"Lihat hadiah", de:"Belohnungen ansehen", ja:"リワードを見る", tr:"Ödülleri gör", ko:"보상 보기", fa:"جوایز را ببین", uk:"Дивитись нагороди", it:"Vedi le ricompense", pl:"Zobacz nagrody", vi:"Xem phần thưởng" },
  meta_ai: { en:"AI tutors on call", zh:"AI 导师随时待命", hi:"एआई ट्यूटर उपलब्ध", es:"tutores de IA disponibles", ar:"مدرسو ذكاء اصطناعي", fr:"tuteurs IA disponibles", bn:"এআই টিউটর প্রস্তুত", pt:"tutores de IA disponíveis", ru:"ИИ-наставника на связи", ur:"AI ٹیوٹر دستیاب", id:"tutor AI siap", de:"KI-Tutoren bereit", ja:"AIチューター待機", tr:"yapay zeka eğitmeni", ko:"AI 튜터 대기", fa:"مربی هوش مصنوعی", uk:"ШІ-наставники", it:"tutor IA disponibili", pl:"tutorzy AI", vi:"gia sư AI trực" },
  meta_editor: { en:"browser editor", zh:"浏览器编辑器", hi:"ब्राउज़र एडिटर", es:"editor en navegador", ar:"محرر في المتصفح", fr:"éditeur navigateur", bn:"ব্রাউজার এডিটর", pt:"editor no browser", ru:"редактор в браузере", ur:"براؤزر ایڈیٹر", id:"editor peramban", de:"Browser-Editor", ja:"ブラウザ編集", tr:"tarayıcı editörü", ko:"브라우저 편집기", fa:"ویرایشگر مرورگر", uk:"редактор у браузері", it:"editor nel browser", pl:"edytor w przeglądarce", vi:"trình sửa trên web" },
  meta_rewards: { en:"quests & rewards", zh:"任务与奖励", hi:"क्वेस्ट और रिवॉर्ड", es:"misiones y recompensas", ar:"مهام وجوائز", fr:"quêtes et récompenses", bn:"কোয়েস্ট ও পুরস্কার", pt:"missões e recompensas", ru:"квесты и награды", ur:"کوئسٹ اور انعامات", id:"misi & hadiah", de:"Quests & Belohnungen", ja:"クエストと報酬", tr:"görevler ve ödüller", ko:"퀘스트와 보상", fa:"ماموریت‌ها و جوایز", uk:"квести й нагороди", it:"missioni e premi", pl:"zadania i nagrody", vi:"nhiệm vụ & thưởng" },
  scrolldown: { en:"▼ SCROLL", zh:"▼ 向下滚动", hi:"▼ स्क्रॉल", es:"▼ DESLIZA", ar:"▼ مرّر", fr:"▼ DÉFILER", bn:"▼ স্ক্রোল", pt:"▼ DESLIZA", ru:"▼ ВНИЗ", ur:"▼ اسکرول", id:"▼ GULIR", de:"▼ SCROLLEN", ja:"▼ スクロール", tr:"▼ KAYDIR", ko:"▼ 스크롤", fa:"▼ اسکرول", uk:"▼ ГОРТАЙ", it:"▼ SCORRI", pl:"▼ PRZEWIŃ", vi:"▼ CUỘN" },
  background: { en:"Background", zh:"背景", hi:"बैकग्राउंड", es:"Fondo", ar:"الخلفية", fr:"Arrière-plan", bn:"ব্যাকগ্রাউন্ড", pt:"Fundo", ru:"Фон", ur:"پس منظر", id:"Latar", de:"Hintergrund", ja:"背景", tr:"Arka Plan", ko:"배경", fa:"پس‌زمینه", uk:"Тло", it:"Sfondo", pl:"Tło", vi:"Nền" },
  language: { en:"Language", zh:"语言", hi:"भाषा", es:"Idioma", ar:"اللغة", fr:"Langue", bn:"ভাষা", pt:"Idioma", ru:"Язык", ur:"زبان", id:"Bahasa", de:"Sprache", ja:"言語", tr:"Dil", ko:"언어", fa:"زبان", uk:"Мова", it:"Lingua", pl:"Język", vi:"Ngôn ngữ" },
  welcome: { en:"👋 Welcome to NovaClip!", zh:"👋 欢迎来到 NovaClip！", hi:"👋 NovaClip में आपका स्वागत है!", es:"👋 ¡Bienvenido a NovaClip!", ar:"👋 مرحبًا بك في NovaClip!", fr:"👋 Bienvenue sur NovaClip !", bn:"👋 NovaClip-এ স্বাগতম!", pt:"👋 Bem-vindo ao NovaClip!", ru:"👋 Добро пожаловать в NovaClip!", ur:"👋 NovaClip میں خوش آمدید!", id:"👋 Selamat datang di NovaClip!", de:"👋 Willkommen bei NovaClip!", ja:"👋 NovaClipへようこそ！", tr:"👋 NovaClip'e hoş geldin!", ko:"👋 NovaClip에 오신 것을 환영합니다!", fa:"👋 به NovaClip خوش آمدید!", uk:"👋 Ласкаво просимо до NovaClip!", it:"👋 Benvenuto su NovaClip!", pl:"👋 Witamy w NovaClip!", vi:"👋 Chào mừng đến với NovaClip!" },
  card_ai: { en:"NovaClip AI", zh:"NovaClip 智能", hi:"NovaClip एआई", es:"IA NovaClip", ar:"ذكاء NovaClip", fr:"IA NovaClip", bn:"NovaClip এআই", pt:"IA NovaClip", ru:"ИИ NovaClip", ur:"NovaClip اے آئی", id:"AI NovaClip", de:"NovaClip KI", ja:"NovaClip AI", tr:"NovaClip YZ", ko:"NovaClip AI", fa:"هوش مصنوعی NovaClip", uk:"ШІ NovaClip", it:"IA NovaClip", pl:"AI NovaClip", vi:"AI NovaClip" },
  card_ai_d: { en:"Three tutors — YouTube, Space and Business — answer in your language, tuned for teen creators.", zh:"三位导师——YouTube、太空和商业——用你的语言回答，为青少年创作者定制。", hi:"तीन ट्यूटर — YouTube, स्पेस और बिज़नेस — आपकी भाषा में जवाब देते हैं।", es:"Tres tutores — YouTube, Espacio y Negocios — responden en tu idioma, hechos para creadores jóvenes.", ar:"ثلاثة معلمين — يوتيوب والفضاء والأعمال — يجيبون بلغتك، مصمّمون للمبدعين الشباب.", fr:"Trois tuteurs — YouTube, Espace et Business — répondent dans ta langue, pensés pour les jeunes créateurs.", bn:"তিনজন টিউটর — YouTube, স্পেস ও বিজনেস — আপনার ভাষায় উত্তর দেয়।", pt:"Três tutores — YouTube, Espaço e Negócios — respondem na tua língua, feitos para jovens criadores.", ru:"Три наставника — YouTube, космос и бизнес — отвечают на твоём языке.", ur:"تین ٹیوٹر — یوٹیوب، خلا اور کاروبار — آپ کی زبان میں جواب دیتے ہیں۔", id:"Tiga tutor — YouTube, Luar Angkasa, dan Bisnis — menjawab dalam bahasamu.", de:"Drei Tutoren — YouTube, Weltraum und Business — antworten in deiner Sprache, gemacht für junge Creator.", ja:"3人のチューター — YouTube・宇宙・ビジネス — があなたの言語で答えます。", tr:"Üç eğitmen — YouTube, Uzay ve İş — senin dilinde cevap verir.", ko:"세 명의 튜터 — YouTube, 우주, 비즈니스 — 가 당신의 언어로 답합니다.", fa:"سه مربی — یوتیوب، فضا و کسب‌وکار — به زبان شما پاسخ می‌دهند.", uk:"Три наставники — YouTube, космос і бізнес — відповідають твоєю мовою.", it:"Tre tutor — YouTube, Spazio e Business — rispondono nella tua lingua.", pl:"Trzech tutorów — YouTube, Kosmos i Biznes — odpowiada w Twoim języku.", vi:"Ba gia sư — YouTube, Vũ trụ và Kinh doanh — trả lời bằng ngôn ngữ của bạn." },
  card_duel: { en:"Channel Duels", zh:"频道对决", hi:"चैनल ड्यूल", es:"Duelos de Canales", ar:"مبارزات القنوات", fr:"Duels de Chaînes", bn:"চ্যানেল ডুয়েল", pt:"Duelos de Canais", ru:"Дуэли каналов", ur:"چینل ڈوئل", id:"Duel Kanal", de:"Kanal-Duelle", ja:"チャンネル対決", tr:"Kanal Düelloları", ko:"채널 대결", fa:"دوئل کانال‌ها", uk:"Дуелі каналів", it:"Duelli tra Canali", pl:"Pojedynki Kanałów", vi:"Đấu Kênh" },
  card_duel_d: { en:"Battle channels within 20k subs of you. Subs and views decide the winner — win and bank points.", zh:"挑战与你相差2万订阅以内的频道。订阅和播放量决定胜负——获胜赚积分。", hi:"अपने से 20k सब्स के अंदर के चैनलों से लड़ें। जीतें और पॉइंट कमाएँ।", es:"Lucha contra canales a menos de 20k subs de ti. Gana y suma puntos.", ar:"نافس قنوات ضمن 20 ألف مشترك منك. اربح واجمع النقاط.", fr:"Affronte des chaînes à moins de 20k abonnés de toi. Gagne et empoche des points.", bn:"আপনার থেকে ২০ হাজার সাবের মধ্যে চ্যানেলের সাথে লড়ুন। জিতুন, পয়েন্ট নিন।", pt:"Batalha canais até 20k subs de diferença. Ganha e acumula pontos.", ru:"Сражайся с каналами в пределах 20 тыс. подписчиков. Побеждай и получай очки.", ur:"اپنے سے 20 ہزار سبس کے اندر چینلز سے مقابلہ کریں۔ جیتیں اور پوائنٹس کمائیں۔", id:"Lawan kanal dalam selisih 20k subs. Menang dan kumpulkan poin.", de:"Kämpfe gegen Kanäle mit max. 20k Abo-Abstand. Gewinne und sammle Punkte.", ja:"登録者差2万以内のチャンネルと対決。勝ってポイント獲得。", tr:"Senden en fazla 20k abone farkı olan kanallarla savaş. Kazan, puan topla.", ko:"당신과 2만 구독자 이내의 채널과 대결하세요. 이기고 포인트를 받으세요.", fa:"با کانال‌های تا ۲۰ هزار مشترک اختلاف مبارزه کن. ببر و امتیاز بگیر.", uk:"Бийся з каналами в межах 20 тис. підписників. Перемагай і збирай бали.", it:"Sfida canali entro 20k iscritti da te. Vinci e accumula punti.", pl:"Walcz z kanałami w granicach 20 tys. subów. Wygrywaj i zbieraj punkty.", vi:"Đấu với các kênh chênh lệch dưới 20k sub. Thắng và nhận điểm." },
  card_ana: { en:"Analytics", zh:"数据分析", hi:"एनालिटिक्स", es:"Analíticas", ar:"التحليلات", fr:"Analytique", bn:"অ্যানালিটিক্স", pt:"Análises", ru:"Аналитика", ur:"تجزیات", id:"Analitik", de:"Analysen", ja:"分析", tr:"Analizler", ko:"분석", fa:"تحلیل‌ها", uk:"Аналітика", it:"Analisi", pl:"Analityka", vi:"Phân tích" },
  card_ana_d: { en:"Your stats, best videos, and closest rivals — at a glance.", zh:"你的数据、最佳视频和最接近的对手，一目了然。", hi:"आपके आँकड़े, बेस्ट वीडियो और करीबी राइवल — एक नज़र में।", es:"Tus estadísticas, mejores vídeos y rivales más cercanos — de un vistazo.", ar:"إحصاءاتك وأفضل فيديوهاتك وأقرب منافسيك — بنظرة واحدة.", fr:"Tes stats, tes meilleures vidéos et tes rivaux les plus proches — en un clin d’œil.", bn:"আপনার পরিসংখ্যান, সেরা ভিডিও ও নিকটতম প্রতিদ্বন্দ্বী — এক নজরে।", pt:"As tuas estatísticas, melhores vídeos e rivais mais próximos — num relance.", ru:"Твоя статистика, лучшие видео и ближайшие соперники — с первого взгляда.", ur:"آپ کے اعداد و شمار، بہترین ویڈیوز اور قریبی حریف — ایک نظر میں۔", id:"Statistikmu, video terbaik, dan rival terdekat — sekilas.", de:"Deine Statistiken, besten Videos und nächsten Rivalen — auf einen Blick.", ja:"あなたの統計、ベスト動画、最接近のライバルを一目で。", tr:"İstatistiklerin, en iyi videoların ve en yakın rakiplerin — bir bakışta.", ko:"내 통계, 최고의 영상, 가장 가까운 라이벌 — 한눈에.", fa:"آمار تو، بهترین ویدیوها و نزدیک‌ترین رقبا — در یک نگاه.", uk:"Твоя статистика, найкращі відео та найближчі суперники — з першого погляду.", it:"Le tue statistiche, i migliori video e i rivali più vicini — a colpo d’occhio.", pl:"Twoje statystyki, najlepsze filmy i najbliżsi rywale — w mgnieniu oka.", vi:"Số liệu, video hay nhất và đối thủ gần nhất — trong nháy mắt." },
  card_quest: { en:"Rewards and Achievements", zh:"奖励与成就", hi:"रिवॉर्ड और अचीवमेंट", es:"Recompensas y Logros", ar:"الجوائز والإنجازات", fr:"Récompenses et Succès", bn:"পুরস্কার ও অর্জন", pt:"Recompensas e Conquistas", ru:"Награды и достижения", ur:"انعامات اور کامیابیاں", id:"Hadiah dan Pencapaian", de:"Belohnungen und Erfolge", ja:"リワードと実績", tr:"Ödüller ve Başarılar", ko:"보상과 업적", fa:"جوایز و دستاوردها", uk:"Нагороди та досягнення", it:"Ricompense e Obiettivi", pl:"Nagrody i Osiągnięcia", vi:"Phần thưởng và Thành tựu" },
  card_quest_d: { en:"Every action earns points. Hit the milestones, unlock free NovaClip Pro time.", zh:"每个操作都能赚积分。达到里程碑，解锁免费 NovaClip Pro。", hi:"हर एक्शन से पॉइंट मिलते हैं। माइलस्टोन पूरे करें, फ्री Pro पाएं।", es:"Cada acción suma puntos. Alcanza las metas y desbloquea NovaClip Pro gratis.", ar:"كل إجراء يكسبك نقاطًا. حقق الأهداف وافتح NovaClip Pro مجانًا.", fr:"Chaque action rapporte des points. Atteins les paliers, débloque du Pro gratuit.", bn:"প্রতিটি কাজে পয়েন্ট। মাইলস্টোন ছুঁয়ে ফ্রি Pro আনলক করুন।", pt:"Cada ação dá pontos. Atinge as metas e desbloqueia NovaClip Pro grátis.", ru:"Каждое действие даёт очки. Достигай целей — открывай бесплатный Pro.", ur:"ہر عمل پوائنٹس دیتا ہے۔ سنگ میل عبور کریں، مفت Pro کھولیں۔", id:"Setiap aksi menghasilkan poin. Capai target, buka Pro gratis.", de:"Jede Aktion bringt Punkte. Erreiche die Meilensteine, schalte gratis Pro frei.", ja:"行動すればポイント。マイルストーン達成で無料Proを解放。", tr:"Her eylem puan kazandırır. Hedeflere ulaş, ücretsiz Pro aç.", ko:"모든 행동이 포인트가 됩니다. 목표를 달성하고 무료 Pro를 열어보세요.", fa:"هر اقدامی امتیاز می‌دهد. به نقاط عطف برس و Pro رایگان باز کن.", uk:"Кожна дія дає бали. Досягай цілей — відкривай безплатний Pro.", it:"Ogni azione dà punti. Raggiungi i traguardi, sblocca Pro gratis.", pl:"Każda akcja daje punkty. Osiągaj cele, odblokuj darmowe Pro.", vi:"Mỗi hành động đều có điểm. Đạt mốc, mở khóa Pro miễn phí." },
  footer: { en:"Classic app with quizzes and streaks", zh:"带测验和连胜的经典应用", hi:"क्विज़ और स्ट्रीक वाला क्लासिक ऐप", es:"App clásica con quizzes y rachas", ar:"التطبيق الكلاسيكي مع الاختبارات", fr:"App classique avec quiz et séries", bn:"কুইজ ও স্ট্রিক সহ ক্লাসিক অ্যাপ", pt:"App clássica com quizzes e sequências", ru:"Классическое приложение с квизами", ur:"کوئز اور سٹریکس والی کلاسک ایپ", id:"Aplikasi klasik dengan kuis", de:"Klassische App mit Quiz und Serien", ja:"クイズと連続記録のクラシック版", tr:"Quiz ve serilerle klasik uygulama", ko:"퀴즈와 스트릭이 있는 클래식 앱", fa:"اپ کلاسیک با آزمون‌ها", uk:"Класичний застосунок із квізами", it:"App classica con quiz e serie", pl:"Klasyczna apka z quizami", vi:"Ứng dụng cổ điển với quiz" },
  signin: { en:"🔑 Sign in with Google", zh:"🔑 使用 Google 登录", hi:"🔑 Google से साइन इन करें", es:"🔑 Iniciar sesión con Google", ar:"🔑 تسجيل الدخول بجوجل", fr:"🔑 Se connecter avec Google", bn:"🔑 Google দিয়ে সাইন ইন", pt:"🔑 Entrar com Google", ru:"🔑 Войти через Google", ur:"🔑 گوگل سے سائن ان کریں", id:"🔑 Masuk dengan Google", de:"🔑 Mit Google anmelden", ja:"🔑 Googleでログイン", tr:"🔑 Google ile giriş yap", ko:"🔑 Google로 로그인", fa:"🔑 ورود با گوگل", uk:"🔑 Увійти через Google", it:"🔑 Accedi con Google", pl:"🔑 Zaloguj przez Google", vi:"🔑 Đăng nhập bằng Google" },
  signout: { en:"Sign out", zh:"退出登录", hi:"साइन आउट", es:"Cerrar sesión", ar:"تسجيل الخروج", fr:"Se déconnecter", bn:"সাইন আউট", pt:"Terminar sessão", ru:"Выйти", ur:"سائن آؤٹ", id:"Keluar", de:"Abmelden", ja:"ログアウト", tr:"Çıkış yap", ko:"로그아웃", fa:"خروج", uk:"Вийти", it:"Esci", pl:"Wyloguj", vi:"Đăng xuất" },
  t_stats: { en:"📈 My analytics", zh:"📈 我的数据", hi:"📈 मेरी एनालिटिक्स", es:"📈 Mis analíticas", ar:"📈 تحليلاتي", fr:"📈 Mes analytiques", bn:"📈 আমার অ্যানালিটিক্স", pt:"📈 As minhas análises", ru:"📈 Моя аналитика", ur:"📈 میرے تجزیات", id:"📈 Analitik saya", de:"📈 Meine Analysen", ja:"📈 マイ分析", tr:"📈 Analizlerim", ko:"📈 내 분석", fa:"📈 تحلیل‌های من", uk:"📈 Моя аналітика", it:"📈 Le mie analisi", pl:"📈 Moja analityka", vi:"📈 Phân tích của tôi" },
  t_comp: { en:"🥊 Closest competitors", zh:"🥊 最接近的对手", hi:"🥊 करीबी प्रतिद्वंद्वी", es:"🥊 Competidores cercanos", ar:"🥊 أقرب المنافسين", fr:"🥊 Concurrents proches", bn:"🥊 নিকটতম প্রতিযোগী", pt:"🥊 Concorrentes próximos", ru:"🥊 Ближайшие соперники", ur:"🥊 قریبی حریف", id:"🥊 Pesaing terdekat", de:"🥊 Nächste Konkurrenten", ja:"🥊 最接近のライバル", tr:"🥊 En yakın rakipler", ko:"🥊 가장 가까운 경쟁자", fa:"🥊 نزدیک‌ترین رقبا", uk:"🥊 Найближчі суперники", it:"🥊 Concorrenti più vicini", pl:"🥊 Najbliżsi rywale", vi:"🥊 Đối thủ gần nhất" },
  t_duel: { en:"⚔️ Duel a channel", zh:"⚔️ 频道对决", hi:"⚔️ चैनल से ड्यूल", es:"⚔️ Duelo con un canal", ar:"⚔️ نازل قناة", fr:"⚔️ Défier une chaîne", bn:"⚔️ চ্যানেল ডুয়েল", pt:"⚔️ Desafiar um canal", ru:"⚔️ Дуэль с каналом", ur:"⚔️ چینل سے ڈوئل", id:"⚔️ Duel dengan kanal", de:"⚔️ Kanal herausfordern", ja:"⚔️ チャンネル対決", tr:"⚔️ Bir kanalla düello", ko:"⚔️ 채널과 대결", fa:"⚔️ دوئل با یک کانال", uk:"⚔️ Дуель із каналом", it:"⚔️ Sfida un canale", pl:"⚔️ Pojedynek z kanałem", vi:"⚔️ Đấu với một kênh" },
  t_trend: { en:"🔥 Trending topics", zh:"🔥 热门话题", hi:"🔥 ट्रेंडिंग टॉपिक्स", es:"🔥 Temas en tendencia", ar:"🔥 المواضيع الرائجة", fr:"🔥 Sujets tendance", bn:"🔥 ট্রেন্ডিং টপিক", pt:"🔥 Tópicos em tendência", ru:"🔥 В тренде", ur:"🔥 ٹرینڈنگ موضوعات", id:"🔥 Topik tren", de:"🔥 Trend-Themen", ja:"🔥 トレンドの話題", tr:"🔥 Trend konular", ko:"🔥 인기 주제", fa:"🔥 موضوعات پرطرفدار", uk:"🔥 У тренді", it:"🔥 Argomenti di tendenza", pl:"🔥 Popularne tematy", vi:"🔥 Chủ đề thịnh hành" },
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
  e_export: { en:"⬆ Export", zh:"⬆ 导出", hi:"⬆ निर्यात", es:"⬆ Exportar", ar:"⬆ تصدير", fr:"⬆ Exporter", bn:"⬆ এক্সপোর্ট", pt:"⬆ Exportar", ru:"⬆ Экспорт", ur:"⬆ برآمد", id:"⬆ Ekspor", de:"⬆ Exportieren", ja:"⬆ 書き出し", tr:"⬆ Dışa aktar", ko:"⬆ 내보내기", fa:"⬆ خروجی", uk:"⬆ Експорт", it:"⬆ Esporta", pl:"⬆ Eksportuj", vi:"⬆ Xuất" },
  analytics: { en:"📊 Analytics", zh:"📊 分析", hi:"📊 एनालिटिक्स", es:"📊 Analíticas", ar:"📊 التحليلات", fr:"📊 Analytique", bn:"📊 অ্যানালিটিক্স", pt:"📊 Análises", ru:"📊 Аналитика", ur:"📊 تجزیات", id:"📊 Analitik", de:"📊 Analysen", ja:"📊 分析", tr:"📊 Analizler", ko:"📊 분석", fa:"📊 تحلیل‌ها", uk:"📊 Аналітика", it:"📊 Analisi", pl:"📊 Analityka", vi:"📊 Phân tích" },
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
  duel_label: { en:"⚔️ Views and subs duel (max 20k subs difference)", zh:"⚔️ 播放与订阅对决（最多相差2万订阅）", hi:"⚔️ व्यूज़ और सब्स ड्यूल (अधिकतम 20k अंतर)", es:"⚔️ Duelo de vistas y subs (máx. 20k de diferencia)", ar:"⚔️ مبارزة المشاهدات والمشتركين (فرق 20 ألف كحد أقصى)", fr:"⚔️ Duel vues et abonnés (écart max 20k)", bn:"⚔️ ভিউ ও সাব ডুয়েল (সর্বোচ্চ ২০ হাজার পার্থক্য)", pt:"⚔️ Duelo de views e subs (máx. 20k de diferença)", ru:"⚔️ Дуэль просмотров и подписчиков (макс. 20 тыс. разницы)", ur:"⚔️ ویوز اور سبس ڈوئل (زیادہ سے زیادہ 20 ہزار فرق)", id:"⚔️ Duel views dan subs (selisih maks 20k)", de:"⚔️ Views- und Abo-Duell (max. 20k Unterschied)", ja:"⚔️ 再生数と登録者の対決（差2万まで）", tr:"⚔️ İzlenme ve abone düellosu (en fazla 20k fark)", ko:"⚔️ 조회수·구독자 대결 (최대 2만 차이)", fa:"⚔️ دوئل بازدید و مشترک (حداکثر ۲۰ هزار اختلاف)", uk:"⚔️ Дуель переглядів і підписників (макс. 20 тис.)", it:"⚔️ Duello di views e iscritti (max 20k di differenza)", pl:"⚔️ Pojedynek wyświetleń i subów (maks. 20 tys. różnicy)", vi:"⚔️ Đấu lượt xem và sub (chênh tối đa 20k)" },
  opp_ph: { en:"Opponent channel name...", zh:"对手频道名称...", hi:"विरोधी चैनल का नाम...", es:"Nombre del canal rival...", ar:"اسم قناة الخصم...", fr:"Nom de la chaîne adverse...", bn:"প্রতিপক্ষ চ্যানেলের নাম...", pt:"Nome do canal adversário...", ru:"Название канала соперника...", ur:"مخالف چینل کا نام...", id:"Nama kanal lawan...", de:"Name des Gegner-Kanals...", ja:"相手チャンネル名...", tr:"Rakip kanal adı...", ko:"상대 채널 이름...", fa:"نام کانال حریف...", uk:"Назва каналу суперника...", it:"Nome del canale avversario...", pl:"Nazwa kanału rywala...", vi:"Tên kênh đối thủ..." },
  fight: { en:"Fight!", zh:"开战！", hi:"लड़ो!", es:"¡Pelea!", ar:"قاتِل!", fr:"Combat !", bn:"লড়াই!", pt:"Lutar!", ru:"В бой!", ur:"لڑو!", id:"Lawan!", de:"Kämpfen!", ja:"対戦！", tr:"Savaş!", ko:"대결!", fa:"مبارزه!", uk:"У бій!", it:"Combatti!", pl:"Walcz!", vi:"Chiến!" },
  ai_h: { en:"✨ NovaClip AI", zh:"✨ NovaClip 智能", hi:"✨ NovaClip एआई", es:"✨ IA NovaClip", ar:"✨ ذكاء NovaClip", fr:"✨ IA NovaClip", bn:"✨ NovaClip এআই", pt:"✨ IA NovaClip", ru:"✨ ИИ NovaClip", ur:"✨ NovaClip اے آئی", id:"✨ AI NovaClip", de:"✨ NovaClip KI", ja:"✨ NovaClip AI", tr:"✨ NovaClip YZ", ko:"✨ NovaClip AI", fa:"✨ هوش مصنوعی NovaClip", uk:"✨ ШІ NovaClip", it:"✨ IA NovaClip", pl:"✨ AI NovaClip", vi:"✨ AI NovaClip" },
  /* ===== PROGRESS PAGE ===== */
  progress: { en:"🏆 Progress", zh:"🏆 进度", hi:"🏆 प्रगति", es:"🏆 Progreso", ar:"🏆 التقدّم", fr:"🏆 Progression", bn:"🏆 অগ্রগতি", pt:"🏆 Progresso", ru:"🏆 Прогресс", ur:"🏆 پیش رفت", id:"🏆 Progres", de:"🏆 Fortschritt", ja:"🏆 進捗", tr:"🏆 İlerleme", ko:"🏆 진행도", fa:"🏆 پیشرفت", uk:"🏆 Прогрес", it:"🏆 Progressi", pl:"🏆 Postęp", vi:"🏆 Tiến độ" },
  prog_h: { en:"🏆 Your progress", zh:"🏆 你的进度", hi:"🏆 आपकी प्रगति", es:"🏆 Tu progreso", ar:"🏆 تقدّمك", fr:"🏆 Ta progression", bn:"🏆 আপনার অগ্রগতি", pt:"🏆 O teu progresso", ru:"🏆 Твой прогресс", ur:"🏆 آپ کی پیش رفت", id:"🏆 Progresmu", de:"🏆 Dein Fortschritt", ja:"🏆 あなたの進捗", tr:"🏆 İlerlemen", ko:"🏆 내 진행도", fa:"🏆 پیشرفت تو", uk:"🏆 Твій прогрес", it:"🏆 I tuoi progressi", pl:"🏆 Twój postęp", vi:"🏆 Tiến độ của bạn" },
  prog_sub: { en:"Everything you have earned in one place — points, rewards, achievements, the skills that count towards a certificate, and your AI chat history.", zh:"你赚到的一切都在这里——积分、奖励、成就、计入证书的技能，以及你的 AI 聊天记录。", hi:"आपकी सारी कमाई एक जगह — पॉइंट, रिवॉर्ड, अचीवमेंट, सर्टिफिकेट में गिने जाने वाले स्किल, और एआई चैट हिस्ट्री।", es:"Todo lo que has ganado en un solo sitio: puntos, recompensas, logros, las habilidades que cuentan para un certificado y tu historial de chat con la IA.", ar:"كل ما كسبته في مكان واحد — النقاط والجوائز والإنجازات والمهارات التي تُحتسب للشهادة وسجل محادثاتك مع الذكاء الاصطناعي.", fr:"Tout ce que tu as gagné au même endroit : points, récompenses, succès, les compétences qui comptent pour un certificat et ton historique de chat avec l'IA.", bn:"আপনার সব অর্জন এক জায়গায় — পয়েন্ট, পুরস্কার, অ্যাচিভমেন্ট, সার্টিফিকেটে গণ্য দক্ষতা এবং এআই চ্যাট ইতিহাস।", pt:"Tudo o que ganhaste num só sítio — pontos, recompensas, conquistas, as competências que contam para um certificado e o teu histórico de conversas com a IA.", ru:"Всё заработанное в одном месте — очки, награды, достижения, навыки, которые идут в зачёт сертификата, и история чатов с ИИ.", ur:"آپ کی تمام کمائی ایک جگہ — پوائنٹس، انعامات، کامیابیاں، سرٹیفکیٹ میں شمار ہونے والی مہارتیں، اور اے آئی چیٹ ہسٹری۔", id:"Semua yang kamu dapat dalam satu tempat — poin, hadiah, pencapaian, keterampilan yang dihitung untuk sertifikat, dan riwayat obrolan AI-mu.", de:"Alles Erreichte an einem Ort — Punkte, Belohnungen, Erfolge, die für ein Zertifikat zählenden Fähigkeiten und dein KI-Chatverlauf.", ja:"獲得したすべてをここに — ポイント、リワード、実績、証明書に加算されるスキル、そしてAIとの会話履歴。", tr:"Kazandığın her şey tek yerde — puanlar, ödüller, başarılar, sertifikaya sayılan beceriler ve YZ sohbet geçmişin.", ko:"획득한 모든 것을 한곳에 — 포인트, 보상, 업적, 수료증에 반영되는 스킬, 그리고 AI 대화 기록.", fa:"هرچه به دست آورده‌ای یک‌جا — امتیازها، جوایز، دستاوردها، مهارت‌هایی که برای گواهی حساب می‌شوند، و تاریخچه گفتگوهایت با هوش مصنوعی.", uk:"Усе зароблене в одному місці — бали, нагороди, досягнення, навички, що зараховуються до сертифіката, та історія чатів зі ШІ.", it:"Tutto ciò che hai guadagnato in un unico posto: punti, premi, obiettivi, le competenze che contano per un certificato e la cronologia delle chat con l'IA.", pl:"Wszystko, co zdobyłeś, w jednym miejscu — punkty, nagrody, osiągnięcia, umiejętności liczące się do certyfikatu i historia rozmów z AI.", vi:"Mọi thứ bạn đạt được ở một nơi — điểm, phần thưởng, thành tựu, các kỹ năng tính vào chứng chỉ, và lịch sử trò chuyện với AI." },
  prog_rewards_d: { en:"Free NovaClip Pro time, unlocked by points.", zh:"用积分解锁的免费 NovaClip Pro 时长。", hi:"पॉइंट से अनलॉक होने वाला मुफ़्त NovaClip Pro समय।", es:"Tiempo gratis de NovaClip Pro, desbloqueado con puntos.", ar:"وقت مجاني من NovaClip Pro يُفتح بالنقاط.", fr:"Du temps NovaClip Pro gratuit, débloqué avec des points.", bn:"পয়েন্ট দিয়ে আনলক হওয়া ফ্রি NovaClip Pro সময়।", pt:"Tempo grátis de NovaClip Pro, desbloqueado com pontos.", ru:"Бесплатное время NovaClip Pro за очки.", ur:"پوائنٹس سے کھلنے والا مفت NovaClip Pro وقت۔", id:"Waktu NovaClip Pro gratis, dibuka dengan poin.", de:"Kostenlose NovaClip-Pro-Zeit, mit Punkten freigeschaltet.", ja:"ポイントで解放される無料のNovaClip Pro期間。", tr:"Puanlarla açılan ücretsiz NovaClip Pro süresi.", ko:"포인트로 잠금 해제하는 무료 NovaClip Pro 이용 기간.", fa:"زمان رایگان NovaClip Pro که با امتیاز باز می‌شود.", uk:"Безплатний час NovaClip Pro, який відкривають бали.", it:"Tempo gratis di NovaClip Pro, sbloccato con i punti.", pl:"Darmowy czas NovaClip Pro odblokowywany punktami.", vi:"Thời gian NovaClip Pro miễn phí, mở khóa bằng điểm." },
  prog_ach_d: { en:"Milestones you have passed.", zh:"你已达成的里程碑。", hi:"आपने पार किए माइलस्टोन।", es:"Hitos que ya has superado.", ar:"محطات تجاوزتها.", fr:"Les paliers que tu as franchis.", bn:"আপনি যেসব মাইলফলক পেরিয়েছেন।", pt:"Marcos que já ultrapassaste.", ru:"Пройденные вехи.", ur:"وہ سنگ میل جو آپ عبور کر چکے ہیں۔", id:"Tonggak yang sudah kamu lewati.", de:"Meilensteine, die du erreicht hast.", ja:"達成したマイルストーン。", tr:"Geçtiğin kilometre taşları.", ko:"지나온 마일스톤.", fa:"نقاط عطفی که رد کرده‌ای.", uk:"Пройдені віхи.", it:"I traguardi che hai superato.", pl:"Osiągnięte kamienie milowe.", vi:"Những cột mốc bạn đã vượt qua." },
  prog_skills: { en:"🎓 Certificate skills", zh:"🎓 证书技能", hi:"🎓 सर्टिफिकेट स्किल", es:"🎓 Habilidades del certificado", ar:"🎓 مهارات الشهادة", fr:"🎓 Compétences du certificat", bn:"🎓 সার্টিফিকেট দক্ষতা", pt:"🎓 Competências do certificado", ru:"🎓 Навыки для сертификата", ur:"🎓 سرٹیفکیٹ مہارتیں", id:"🎓 Keterampilan sertifikat", de:"🎓 Zertifikats-Fähigkeiten", ja:"🎓 証明書スキル", tr:"🎓 Sertifika becerileri", ko:"🎓 수료증 스킬", fa:"🎓 مهارت‌های گواهی", uk:"🎓 Навички для сертифіката", it:"🎓 Competenze del certificato", pl:"🎓 Umiejętności do certyfikatu", vi:"🎓 Kỹ năng chứng chỉ" },
  prog_skills_d: { en:"Hands-on work counts towards a NovaClip Creator Certificate. Points alone are not enough — these are the reps.", zh:"实际操作才计入 NovaClip 创作者证书。光有积分不够——这些才是真正的练习量。", hi:"असली काम ही NovaClip क्रिएटर सर्टिफिकेट में गिना जाता है। सिर्फ पॉइंट काफी नहीं — ये असली अभ्यास हैं।", es:"El trabajo práctico cuenta para el Certificado de Creador NovaClip. Los puntos por sí solos no bastan: estas son las repeticiones.", ar:"العمل التطبيقي هو ما يُحتسب لشهادة صانع NovaClip. النقاط وحدها لا تكفي — هذه هي التمارين الفعلية.", fr:"Le travail concret compte pour le Certificat Créateur NovaClip. Les points seuls ne suffisent pas : voici les répétitions.", bn:"হাতে-কলমে কাজই NovaClip ক্রিয়েটর সার্টিফিকেটে গণ্য হয়। শুধু পয়েন্ট যথেষ্ট নয় — এগুলোই আসল অনুশীলন।", pt:"O trabalho prático conta para o Certificado de Criador NovaClip. Só pontos não chega — estas são as repetições.", ru:"К сертификату создателя NovaClip идёт практическая работа. Одних очков мало — вот реальные повторения.", ur:"عملی کام ہی NovaClip کریئٹر سرٹیفکیٹ میں شمار ہوتا ہے۔ صرف پوائنٹس کافی نہیں — یہ اصل مشقیں ہیں۔", id:"Kerja nyata yang dihitung untuk Sertifikat Kreator NovaClip. Poin saja tidak cukup — ini repetisinya.", de:"Praktische Arbeit zählt für das NovaClip-Creator-Zertifikat. Punkte allein reichen nicht — das hier sind die Wiederholungen.", ja:"実際の作業がNovaClipクリエイター証明書に加算されます。ポイントだけでは足りません。これが実践量です。", tr:"NovaClip Yaratıcı Sertifikası için pratik iş sayılır. Sadece puan yetmez — asıl tekrarlar bunlar.", ko:"실제 작업이 NovaClip 크리에이터 수료증에 반영됩니다. 포인트만으로는 부족합니다 — 이것이 실전 횟수입니다.", fa:"کار عملی است که برای گواهی سازنده NovaClip حساب می‌شود. فقط امتیاز کافی نیست — این‌ها تمرین‌های واقعی‌اند.", uk:"До сертифіката творця NovaClip зараховується практична робота. Самих балів замало — ось реальні повторення.", it:"Il lavoro pratico conta per il Certificato Creator NovaClip. I punti da soli non bastano: queste sono le ripetizioni.", pl:"Do Certyfikatu Twórcy NovaClip liczy się praktyka. Same punkty nie wystarczą — oto powtórzenia.", vi:"Công việc thực tế mới tính vào Chứng chỉ Nhà sáng tạo NovaClip. Chỉ điểm thôi là chưa đủ — đây mới là số lần thực hành." },
  prog_hist_d: { en:"Your recent questions to the AI tutors.", zh:"你最近向 AI 导师提出的问题。", hi:"एआई ट्यूटर से आपके हाल के सवाल।", es:"Tus preguntas recientes a los tutores de IA.", ar:"أسئلتك الأخيرة لمدرّسي الذكاء الاصطناعي.", fr:"Tes questions récentes aux tuteurs IA.", bn:"এআই টিউটরদের কাছে আপনার সাম্প্রতিক প্রশ্ন।", pt:"As tuas perguntas recentes aos tutores de IA.", ru:"Твои недавние вопросы ИИ-наставникам.", ur:"اے آئی ٹیوٹرز سے آپ کے حالیہ سوالات۔", id:"Pertanyaan terbaru kamu ke tutor AI.", de:"Deine letzten Fragen an die KI-Tutoren.", ja:"AIチューターへの最近の質問。", tr:"YZ eğitmenlerine son sorduklarınız.", ko:"AI 튜터에게 한 최근 질문.", fa:"پرسش‌های اخیر تو از مربی‌های هوش مصنوعی.", uk:"Твої нещодавні запитання ШІ-наставникам.", it:"Le tue domande recenti ai tutor IA.", pl:"Twoje ostatnie pytania do korepetytorów AI.", vi:"Các câu hỏi gần đây của bạn cho gia sư AI." },

  /* ===== HOME PAGE: ticker, play & earn, stats, closing block, vibe switch ===== */
  ticker: { en:"<b>AI TUTORS</b> · <i>VIDEO EDITOR</i> · <u>CHANNEL DUELS</u> · <b>TREND RADAR</b> · <i>ROOFTOP SNIPER</i> · <u>ANALYTICS</u> · <b>REWARDS</b> · ", zh:"<b>AI 导师</b> · <i>视频编辑器</i> · <u>频道对决</u> · <b>趋势雷达</b> · <i>屋顶狙击</i> · <u>数据分析</u> · <b>奖励</b> · ", hi:"<b>एआई ट्यूटर</b> · <i>वीडियो एडिटर</i> · <u>चैनल ड्यूल</u> · <b>ट्रेंड रडार</b> · <i>रूफटॉप स्नाइपर</i> · <u>एनालिटिक्स</u> · <b>रिवॉर्ड</b> · ", es:"<b>TUTORES IA</b> · <i>EDITOR DE VÍDEO</i> · <u>DUELOS DE CANALES</u> · <b>RADAR DE TENDENCIAS</b> · <i>FRANCOTIRADOR</i> · <u>ANALÍTICAS</u> · <b>RECOMPENSAS</b> · ", ar:"<b>مدرّسو الذكاء الاصطناعي</b> · <i>محرّر الفيديو</i> · <u>مبارزات القنوات</u> · <b>رادار الاتجاهات</b> · <i>قنّاص السطح</i> · <u>التحليلات</u> · <b>الجوائز</b> · ", fr:"<b>TUTEURS IA</b> · <i>ÉDITEUR VIDÉO</i> · <u>DUELS DE CHAÎNES</u> · <b>RADAR DE TENDANCES</b> · <i>SNIPER SUR LES TOITS</i> · <u>ANALYSES</u> · <b>RÉCOMPENSES</b> · ", bn:"<b>এআই টিউটর</b> · <i>ভিডিও এডিটর</i> · <u>চ্যানেল ডুয়েল</u> · <b>ট্রেন্ড রাডার</b> · <i>রুফটপ স্নাইপার</i> · <u>অ্যানালিটিক্স</u> · <b>পুরস্কার</b> · ", pt:"<b>TUTORES IA</b> · <i>EDITOR DE VÍDEO</i> · <u>DUELOS DE CANAIS</u> · <b>RADAR DE TENDÊNCIAS</b> · <i>SNIPER NO TELHADO</i> · <u>ANÁLISES</u> · <b>RECOMPENSAS</b> · ", ru:"<b>ИИ-НАСТАВНИКИ</b> · <i>ВИДЕОРЕДАКТОР</i> · <u>ДУЭЛИ КАНАЛОВ</u> · <b>РАДАР ТРЕНДОВ</b> · <i>СНАЙПЕР НА КРЫШЕ</i> · <u>АНАЛИТИКА</u> · <b>НАГРАДЫ</b> · ", ur:"<b>اے آئی ٹیوٹرز</b> · <i>ویڈیو ایڈیٹر</i> · <u>چینل ڈوئل</u> · <b>ٹرینڈ ریڈار</b> · <i>روف ٹاپ سنائپر</i> · <u>اینالیٹکس</u> · <b>انعامات</b> · ", id:"<b>TUTOR AI</b> · <i>EDITOR VIDEO</i> · <u>DUEL KANAL</u> · <b>RADAR TREN</b> · <i>SNIPER ATAP</i> · <u>ANALITIK</u> · <b>HADIAH</b> · ", de:"<b>KI-TUTOREN</b> · <i>VIDEO-EDITOR</i> · <u>KANAL-DUELLE</u> · <b>TREND-RADAR</b> · <i>DACH-SNIPER</i> · <u>ANALYSEN</u> · <b>BELOHNUNGEN</b> · ", ja:"<b>AIチューター</b> · <i>動画エディター</i> · <u>チャンネル対決</u> · <b>トレンドレーダー</b> · <i>ルーフトップ狙撃</i> · <u>アナリティクス</u> · <b>リワード</b> · ", tr:"<b>YZ EĞİTMENLERİ</b> · <i>VİDEO EDİTÖRÜ</i> · <u>KANAL DÜELLOSU</u> · <b>TREND RADARI</b> · <i>ÇATI KESKİN NİŞANCI</i> · <u>ANALİTİK</u> · <b>ÖDÜLLER</b> · ", ko:"<b>AI 튜터</b> · <i>영상 편집기</i> · <u>채널 대결</u> · <b>트렌드 레이더</b> · <i>루프탑 스나이퍼</i> · <u>애널리틱스</u> · <b>보상</b> · ", fa:"<b>مربی‌های هوش مصنوعی</b> · <i>ویرایشگر ویدیو</i> · <u>دوئل کانال‌ها</u> · <b>رادار ترند</b> · <i>تک‌تیرانداز پشت‌بام</i> · <u>تحلیل‌ها</u> · <b>جوایز</b> · ", uk:"<b>ШІ-НАСТАВНИКИ</b> · <i>ВІДЕОРЕДАКТОР</i> · <u>ДУЕЛІ КАНАЛІВ</u> · <b>РАДАР ТРЕНДІВ</b> · <i>СНАЙПЕР НА ДАХУ</i> · <u>АНАЛІТИКА</u> · <b>НАГОРОДИ</b> · ", it:"<b>TUTOR IA</b> · <i>EDITOR VIDEO</i> · <u>DUELLI TRA CANALI</u> · <b>RADAR TENDENZE</b> · <i>CECCHINO SUL TETTO</i> · <u>ANALISI</u> · <b>PREMI</b> · ", pl:"<b>KOREPETYTORZY AI</b> · <i>EDYTOR WIDEO</i> · <u>POJEDYNKI KANAŁÓW</u> · <b>RADAR TRENDÓW</b> · <i>SNAJPER NA DACHU</i> · <u>ANALITYKA</u> · <b>NAGRODY</b> · ", vi:"<b>GIA SƯ AI</b> · <i>TRÌNH SỬA VIDEO</i> · <u>ĐẤU KÊNH</u> · <b>RADAR XU HƯỚNG</b> · <i>BẮN TỈA TRÊN MÁI</i> · <u>PHÂN TÍCH</u> · <b>PHẦN THƯỞNG</b> · " },
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
  st_themes: { en:"Themes", zh:"主题", hi:"थीम", es:"Temas", ar:"سمات", fr:"Thèmes", bn:"থিম", pt:"Temas", ru:"Тем", ur:"تھیمز", id:"Tema", de:"Designs", ja:"テーマ", tr:"Tema", ko:"테마", fa:"پوسته", uk:"Тем", it:"Temi", pl:"Motywów", vi:"Chủ đề" },
  st_tools: { en:"Tools", zh:"工具", hi:"टूल", es:"Herramientas", ar:"أدوات", fr:"Outils", bn:"টুল", pt:"Ferramentas", ru:"Инструментов", ur:"ٹولز", id:"Alat", de:"Werkzeuge", ja:"ツール", tr:"Araç", ko:"도구", fa:"ابزار", uk:"Інструментів", it:"Strumenti", pl:"Narzędzi", vi:"Công cụ" },
  st_free: { en:"Free", zh:"免费", hi:"मुफ़्त", es:"Gratis", ar:"مجاني", fr:"Gratuit", bn:"বিনামূল্যে", pt:"Grátis", ru:"Бесплатно", ur:"مفت", id:"Gratis", de:"Kostenlos", ja:"無料", tr:"Ücretsiz", ko:"무료", fa:"رایگان", uk:"Безплатно", it:"Gratis", pl:"Za darmo", vi:"Miễn phí" },
  final_h: { en:"Your channel's <span class='g'>next level</span><br>starts in a tab.", zh:"你频道的<span class='g'>下一个阶段</span><br>就从一个标签页开始。", hi:"आपके चैनल का <span class='g'>अगला लेवल</span><br>एक टैब से शुरू होता है।", es:"El <span class='g'>siguiente nivel</span> de tu canal<br>empieza en una pestaña.", ar:"<span class='g'>المستوى التالي</span> لقناتك<br>يبدأ من تبويب واحد.", fr:"Le <span class='g'>niveau supérieur</span> de ta chaîne<br>commence dans un onglet.", bn:"আপনার চ্যানেলের <span class='g'>পরের ধাপ</span><br>একটি ট্যাব থেকেই শুরু।", pt:"O <span class='g'>próximo nível</span> do teu canal<br>começa num separador.", ru:"<span class='g'>Новый уровень</span> твоего канала<br>начинается во вкладке.", ur:"آپ کے چینل کا <span class='g'>اگلا لیول</span><br>ایک ٹیب سے شروع ہوتا ہے۔", id:"<span class='g'>Level berikutnya</span> kanalmu<br>dimulai dari satu tab.", de:"Das <span class='g'>nächste Level</span> deines Kanals<br>beginnt in einem Tab.", ja:"チャンネルの<span class='g'>次のレベル</span>は<br>タブひとつから始まる。", tr:"Kanalının <span class='g'>bir sonraki seviyesi</span><br>bir sekmede başlıyor.", ko:"채널의 <span class='g'>다음 단계</span>는<br>탭 하나에서 시작됩니다.", fa:"<span class='g'>سطح بعدی</span> کانالت<br>از یک تب شروع می‌شود.", uk:"<span class='g'>Новий рівень</span> твого каналу<br>починається у вкладці.", it:"Il <span class='g'>livello successivo</span> del tuo canale<br>inizia in una scheda.", pl:"<span class='g'>Kolejny poziom</span> twojego kanału<br>zaczyna się w karcie.", vi:"<span class='g'>Cấp độ tiếp theo</span> của kênh bạn<br>bắt đầu trong một tab." },
  final_p: { en:"Free to start. No downloads. Just you, the tools, and the grind.", zh:"免费开始，无需下载。只有你、工具和努力。", hi:"शुरू करना मुफ़्त। कोई डाउनलोड नहीं। बस आप, टूल और मेहनत।", es:"Empezar es gratis. Sin descargas. Solo tú, las herramientas y el esfuerzo.", ar:"البداية مجانية. بلا تنزيلات. أنت والأدوات والمثابرة فقط.", fr:"Démarrage gratuit. Aucun téléchargement. Juste toi, les outils et le travail.", bn:"শুরু করা বিনামূল্যে। কোনো ডাউনলোড নেই। শুধু আপনি, টুল আর পরিশ্রম।", pt:"Começar é grátis. Sem downloads. Só tu, as ferramentas e o esforço.", ru:"Начать бесплатно. Без загрузок. Только ты, инструменты и труд.", ur:"شروع کرنا مفت۔ کوئی ڈاؤن لوڈ نہیں۔ بس آپ، ٹولز اور محنت۔", id:"Mulai gratis. Tanpa unduhan. Hanya kamu, alatnya, dan kerja keras.", de:"Kostenlos starten. Keine Downloads. Nur du, die Werkzeuge und die Arbeit.", ja:"無料で開始。ダウンロード不要。あなたとツールと努力だけ。", tr:"Başlamak ücretsiz. İndirme yok. Sadece sen, araçlar ve emek.", ko:"무료로 시작. 다운로드 없음. 당신과 도구, 그리고 노력뿐.", fa:"شروعش رایگان است. بدون دانلود. فقط تو، ابزارها و تلاش.", uk:"Почати безплатно. Без завантажень. Лише ти, інструменти й праця.", it:"Iniziare è gratis. Nessun download. Solo tu, gli strumenti e l'impegno.", pl:"Start za darmo. Bez pobierania. Tylko ty, narzędzia i praca.", vi:"Bắt đầu miễn phí. Không cần tải. Chỉ có bạn, công cụ và nỗ lực." },
  final_btn: { en:"Open the Studio →", zh:"打开工作室 →", hi:"स्टूडियो खोलें →", es:"Abrir el Estudio →", ar:"افتح الاستوديو ←", fr:"Ouvrir le Studio →", bn:"স্টুডিও খুলুন →", pt:"Abrir o Estúdio →", ru:"Открыть Студию →", ur:"اسٹوڈیو کھولیں ←", id:"Buka Studio →", de:"Studio öffnen →", ja:"スタジオを開く →", tr:"Stüdyoyu aç →", ko:"스튜디오 열기 →", fa:"استودیو را باز کن ←", uk:"Відкрити Студію →", it:"Apri lo Studio →", pl:"Otwórz Studio →", vi:"Mở Studio →" },
  vibe: { en:"Vibe", zh:"风格", hi:"वाइब", es:"Estilo", ar:"الأسلوب", fr:"Style", bn:"ভাইব", pt:"Estilo", ru:"Стиль", ur:"انداز", id:"Gaya", de:"Stil", ja:"雰囲気", tr:"Tarz", ko:"분위기", fa:"حال‌وهوا", uk:"Стиль", it:"Stile", pl:"Styl", vi:"Phong cách" },
  vibe_normal: { en:"Normal", zh:"普通", hi:"सामान्य", es:"Normal", ar:"عادي", fr:"Normal", bn:"সাধারণ", pt:"Normal", ru:"Обычный", ur:"عام", id:"Normal", de:"Normal", ja:"ふつう", tr:"Normal", ko:"보통", fa:"عادی", uk:"Звичайний", it:"Normale", pl:"Zwykły", vi:"Bình thường" },
  vibe_genz: { en:"Gen&nbsp;Z", zh:"Z世代", hi:"Gen&nbsp;Z", es:"Gen&nbsp;Z", ar:"جيل&nbsp;Z", fr:"Gen&nbsp;Z", bn:"Gen&nbsp;Z", pt:"Gen&nbsp;Z", ru:"Зумер", ur:"Gen&nbsp;Z", id:"Gen&nbsp;Z", de:"Gen&nbsp;Z", ja:"Z世代", tr:"Z&nbsp;Kuşağı", ko:"Z세대", fa:"نسل&nbsp;Z", uk:"Зумер", it:"Gen&nbsp;Z", pl:"Pokolenie&nbsp;Z", vi:"Gen&nbsp;Z" },

  quests: { en:"🎁 Rewards", zh:"🎁 奖励", hi:"🎁 रिवॉर्ड्स", es:"🎁 Recompensas", ar:"🎁 الجوائز", fr:"🎁 Récompenses", bn:"🎁 পুরস্কার", pt:"🎁 Recompensas", ru:"🎁 Награды", ur:"🎁 انعامات", id:"🎁 Hadiah", de:"🎁 Belohnungen", ja:"🎁 リワード", tr:"🎁 Ödüller", ko:"🎁 보상", fa:"🎁 جوایز", uk:"🎁 Нагороди", it:"🎁 Ricompense", pl:"🎁 Nagrody", vi:"🎁 Phần thưởng" },
  achievements: { en:"🏅 Achievements", zh:"🏅 成就", hi:"🏅 उपलब्धियाँ", es:"🏅 Logros", ar:"🏅 الإنجازات", fr:"🏅 Succès", bn:"🏅 অর্জন", pt:"🏅 Conquistas", ru:"🏅 Достижения", ur:"🏅 کامیابیاں", id:"🏅 Pencapaian", de:"🏅 Erfolge", ja:"🏅 実績", tr:"🏅 Başarılar", ko:"🏅 업적", fa:"🏅 دستاوردها", uk:"🏅 Досягнення", it:"🏅 Obiettivi", pl:"🏅 Osiągnięcia", vi:"🏅 Thành tựu" },
  history: { en:"📜 History", zh:"📜 历史", hi:"📜 इतिहास", es:"📜 Historial", ar:"📜 السجل", fr:"📜 Historique", bn:"📜 ইতিহাস", pt:"📜 Histórico", ru:"📜 История", ur:"📜 تاریخ", id:"📜 Riwayat", de:"📜 Verlauf", ja:"📜 履歴", tr:"📜 Geçmiş", ko:"📜 기록", fa:"📜 تاریخچه", uk:"📜 Історія", it:"📜 Cronologia", pl:"📜 Historia", vi:"📜 Lịch sử" },
  ask: { en:"💬 Ask", zh:"💬 提问", hi:"💬 पूछें", es:"💬 Preguntar", ar:"💬 اسأل", fr:"💬 Demander", bn:"💬 জিজ্ঞাসা", pt:"💬 Perguntar", ru:"💬 Спросить", ur:"💬 پوچھیں", id:"💬 Tanya", de:"💬 Fragen", ja:"💬 質問", tr:"💬 Sor", ko:"💬 질문", fa:"💬 بپرس", uk:"💬 Запитати", it:"💬 Chiedi", pl:"💬 Zapytaj", vi:"💬 Hỏi" },
  thumb: { en:"🎨 Thumbnail", zh:"🎨 缩略图", hi:"🎨 थंबनेल", es:"🎨 Miniatura", ar:"🎨 صورة مصغرة", fr:"🎨 Miniature", bn:"🎨 থাম্বনেইল", pt:"🎨 Thumbnail", ru:"🎨 Превью", ur:"🎨 تھمب نیل", id:"🎨 Thumbnail", de:"🎨 Thumbnail", ja:"🎨 サムネイル", tr:"🎨 Küçük resim", ko:"🎨 썸네일", fa:"🎨 تصویر بندانگشتی", uk:"🎨 Прев’ю", it:"🎨 Miniatura", pl:"🎨 Miniatura", vi:"🎨 Ảnh thu nhỏ" },
  video: { en:"🎬 Video maker", zh:"🎬 视频制作", hi:"🎬 वीडियो मेकर", es:"🎬 Creador de vídeo", ar:"🎬 صانع الفيديو", fr:"🎬 Créateur vidéo", bn:"🎬 ভিডিও মেকার", pt:"🎬 Criador de vídeo", ru:"🎬 Создатель видео", ur:"🎬 ویڈیو میکر", id:"🎬 Pembuat video", de:"🎬 Video-Macher", ja:"🎬 動画メーカー", tr:"🎬 Video yapıcı", ko:"🎬 영상 제작", fa:"🎬 ویدیوساز", uk:"🎬 Творець відео", it:"🎬 Crea video", pl:"🎬 Kreator wideo", vi:"🎬 Tạo video" },
  trend_h: { en:"🛰️ Trend Spotter", zh:"🛰️ 趋势雷达", hi:"🛰️ ट्रेंड स्पॉटर", es:"🛰️ Detector de Tendencias", ar:"🛰️ راصد الاتجاهات", fr:"🛰️ Détecteur de Tendances", bn:"🛰️ ট্রেন্ড স্পটার", pt:"🛰️ Radar de Tendências", ru:"🛰️ Радар трендов", ur:"🛰️ ٹرینڈ اسپاٹر", id:"🛰️ Pemantau Tren", de:"🛰️ Trend-Radar", ja:"🛰️ トレンド探知", tr:"🛰️ Trend Radarı", ko:"🛰️ 트렌드 탐지기", fa:"🛰️ ردیاب ترند", uk:"🛰️ Радар трендів", it:"🛰️ Rileva Tendenze", pl:"🛰️ Radar Trendów", vi:"🛰️ Dò Xu Hướng" },
  trend_p: { en:"Type your niche and drop the radar — NovaClip AI predicts what's about to blow up.", zh:"输入你的领域并启动雷达——NovaClip AI 预测即将爆火的内容。", hi:"अपना निच लिखें और रडार चलाएँ — AI बताएगा क्या वायरल होगा।", es:"Escribe tu nicho y lanza el radar — la IA predice lo que va a explotar.", ar:"اكتب مجالك وأطلق الرادار — الذكاء الاصطناعي يتنبأ بما سينفجر.", fr:"Tape ta niche et lance le radar — l’IA prédit ce qui va exploser.", bn:"আপনার নিশ লিখুন, রাডার চালান — AI বলবে কী ভাইরাল হবে।", pt:"Escreve o teu nicho e lança o radar — a IA prevê o que vai bombar.", ru:"Введи свою нишу и запусти радар — ИИ предскажет, что взлетит.", ur:"اپنا نیش لکھیں اور ریڈار چلائیں — AI بتائے گا کیا وائرل ہوگا۔", id:"Ketik niche-mu dan jalankan radar — AI memprediksi yang akan meledak.", de:"Gib deine Nische ein und starte das Radar — die KI sagt voraus, was explodiert.", ja:"ニッチを入力してレーダー起動 — AIが次のバズを予測。", tr:"Nişini yaz, radarı çalıştır — YZ neyin patlayacağını tahmin eder.", ko:"니치를 입력하고 레이더를 돌리세요 — AI가 뜰 콘텐츠를 예측합니다.", fa:"حوزه‌ات را بنویس و رادار را بینداز — هوش مصنوعی پیش‌بینی می‌کند چه چیزی می‌ترکد.", uk:"Введи свою нішу й запусти радар — ШІ передбачить, що вибухне.", it:"Scrivi la tua nicchia e lancia il radar — l’IA prevede cosa esploderà.", pl:"Wpisz swoją niszę i odpal radar — AI przewidzi, co wybuchnie.", vi:"Nhập lĩnh vực và thả radar — AI dự đoán điều sắp bùng nổ." },
  niche_ph: { en:"Your niche (e.g. Minecraft, cooking, football)", zh:"你的领域（如 Minecraft、烹饪、足球）", hi:"आपका निच (जैसे Minecraft, कुकिंग, फुटबॉल)", es:"Tu nicho (ej. Minecraft, cocina, fútbol)", ar:"مجالك (مثل ماينكرافت، الطبخ، كرة القدم)", fr:"Ta niche (ex : Minecraft, cuisine, football)", bn:"আপনার নিশ (যেমন Minecraft, রান্না, ফুটবল)", pt:"O teu nicho (ex: Minecraft, culinária, futebol)", ru:"Твоя ниша (напр. Minecraft, кулинария, футбол)", ur:"آپ کا نیش (مثلاً Minecraft، کھانا، فٹبال)", id:"Niche-mu (mis. Minecraft, memasak, sepak bola)", de:"Deine Nische (z.B. Minecraft, Kochen, Fußball)", ja:"あなたのニッチ（例：マイクラ、料理、サッカー）", tr:"Nişin (örn. Minecraft, yemek, futbol)", ko:"니치 (예: 마인크래프트, 요리, 축구)", fa:"حوزه شما (مثلاً ماینکرافت، آشپزی، فوتبال)", uk:"Твоя ніша (напр. Minecraft, кулінарія, футбол)", it:"La tua nicchia (es. Minecraft, cucina, calcio)", pl:"Twoja nisza (np. Minecraft, gotowanie, piłka)", vi:"Lĩnh vực của bạn (VD: Minecraft, nấu ăn, bóng đá)" },
  scan: { en:"🛰️ Scan for trends", zh:"🛰️ 扫描趋势", hi:"🛰️ ट्रेंड स्कैन करें", es:"🛰️ Buscar tendencias", ar:"🛰️ افحص الاتجاهات", fr:"🛰️ Scanner les tendances", bn:"🛰️ ট্রেন্ড স্ক্যান", pt:"🛰️ Procurar tendências", ru:"🛰️ Сканировать тренды", ur:"🛰️ ٹرینڈز اسکین کریں", id:"🛰️ Pindai tren", de:"🛰️ Nach Trends suchen", ja:"🛰️ トレンドをスキャン", tr:"🛰️ Trendleri tara", ko:"🛰️ 트렌드 스캔", fa:"🛰️ اسکن ترندها", uk:"🛰️ Сканувати тренди", it:"🛰️ Scansiona tendenze", pl:"🛰️ Skanuj trendy", vi:"🛰️ Quét xu hướng" },
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

const QUESTS = [[100,'🎁 1 day free NovaClip Pro'],[450,'🎁 1 week free NovaClip Pro'],[700,'🎁 2 weeks free NovaClip Pro'],[1250,'🎁 1 month free NovaClip Pro']];
const ACHIEVEMENTS = [[30,'🏅 Reached 30 points'],[100,'🏅 Reached 100 points'],[250,'🏅 Reached 250 points'],[500,'🏅 Reached 500 points']];

/* ===== SKILL LEDGER =====
   Certificates are credentials, so they have to be earned. Every skill below
   is logged from the place where the learner actually does the work, and the
   count is what the certificate requirements are checked against. */
const SKILLS = {
  yt_connect: { icon:'🔗', label:'Connect your YouTube channel' },
  edit_export:{ icon:'🎬', label:'Export a video from the Editor' },
  trend_scan: { icon:'🛰️', label:'Run a Trend Spotter scan' },
  idea_save:  { icon:'💡', label:'Save a video idea to your shortlist' },
  analytics:  { icon:'📊', label:'Review your channel analytics' },
  ai_ask:     { icon:'✨', label:'Ask a NovaClip AI tutor' },
  arena_mvp:  { icon:'🎯', label:'Top the Strike Arena scoreboard' }
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
  localStorage.setItem('nc_skills', JSON.stringify(s));
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
  else missing.push({ label:'Reach ' + req.pts + ' points', have: have, need: req.pts, icon:'🏆' });

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
"@keyframes ncsweep { to { transform:rotate(360deg); } }";
document.head.appendChild(style);

function applyTheme(name) { const t = THEMES[name] || THEMES['Dark']; document.documentElement.style.setProperty('--bg',t[0]); document.documentElement.style.setProperty('--box',t[1]); document.documentElement.style.setProperty('--txt',t[2]); document.body.dataset.theme = name; localStorage.setItem('nc_theme',name); }
function toast(msg) { const t = document.getElementById('nctoast'); if (!t) return; t.textContent = msg; t.style.display = 'block'; clearTimeout(t.hideTimer); t.hideTimer = setTimeout(() => { t.style.display = 'none'; }, 3000); }
function getPts() { return parseInt(localStorage.getItem('nc_points') || '0'); }
function checkUnlocks(pts) { const u = JSON.parse(localStorage.getItem('nc_unlocked') || '[]'); for (const [need,name] of QUESTS.concat(ACHIEVEMENTS)) { if (pts >= need && !u.includes(name)) { u.push(name); setTimeout(() => toast('🎉 UNLOCKED: ' + name), 1200); } } localStorage.setItem('nc_unlocked', JSON.stringify(u)); }
function addPts(n) { const p = getPts() + n; localStorage.setItem('nc_points', p); const b = document.getElementById('ncpts'); if (b) b.textContent = '🏆 ' + p + ' pts'; toast('+' + n + ' pts!'); checkUnlocks(p); refreshPanels(); }
function saveHist(subject,q,a) { const h = JSON.parse(localStorage.getItem('nc_history') || '{}'); if (!h[subject]) h[subject] = []; h[subject].push([q,a.slice(0,200)]); if (h[subject].length > 10) h[subject].shift(); localStorage.setItem('nc_history', JSON.stringify(h)); refreshPanels(); }
function refreshPanels() {
  const pts = getPts();
  const ql = document.getElementById('questlist'); if (ql) ql.innerHTML = QUESTS.map(([need,name]) => pts >= need ? name + ' — DONE ✅' : name + ' — ' + (need - pts) + ' pts to go 🔒').join('<br>');
  const al = document.getElementById('achlist'); if (al) al.innerHTML = ACHIEVEMENTS.map(([need,name]) => pts >= need ? name + ' ✅' : '🔒 Reach ' + need + ' points (you have ' + pts + ')').join('<br>');
  const hl = document.getElementById('histlist'); if (hl) { const h = JSON.parse(localStorage.getItem('nc_history') || '{}'); let html = ''; for (const s in h) { html += '<b>' + s + '</b> (' + h[s].length + ' chats)<br>' + h[s].slice(-3).map(x => '• ' + x[0]).join('<br>') + '<br><br>'; } hl.innerHTML = html || 'No chats yet - start talking!'; }
}
/* A page should only ever have one sidebar. If a file has been pasted into
   rather than replaced, the markup ends up duplicated — and because the sidebar
   is position:fixed, the two stack exactly on top of each other, so the copy
   that never received the injected links is the one you see. Drop the extras and
   keep the first, which is the one everything else is wired to. */
function dedupeChrome() {
  const bars = document.querySelectorAll('.sidebar');
  for (let i = 1; i < bars.length; i++) bars[i].remove();
  const badges = document.querySelectorAll('#ncpts');
  for (let i = 1; i < badges.length; i++) badges[i].remove();
  if (bars.length > 1) console.warn('removed ' + (bars.length - 1) + ' duplicate sidebar(s) — ' +
    'this page\'s markup appears twice, which usually means a paste was appended instead of replacing the file');
}

window.addEventListener('DOMContentLoaded', () => {
  dedupeChrome();
  const badge = document.createElement('div'); badge.id = 'ncpts'; badge.textContent = '🏆 ' + getPts() + ' pts'; document.body.appendChild(badge);
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
});

/* ===== SEASONAL EVENTS — automatic by date, no button =====
   Fixed dates use MM-DD every year; movable feasts (Islamic calendar, Easter,
   Diwali, Chinese New Year) use explicit dates per year (2026–2028). */
const SEASONS = [
  { name: 'Ramadan',        emo: '🌙✨🕌',  color: '#7bd4a8', ranges: [['2026-02-18','2026-03-19'],['2027-02-08','2027-03-09'],['2028-01-28','2028-02-26']], greet: 'Ramadan Kareem!' },
  { name: 'Eid al-Fitr',    emo: '🌙🎉🍬',  color: '#ffd166', ranges: [['2026-03-20','2026-03-23'],['2027-03-10','2027-03-13'],['2028-02-27','2028-03-01']], greet: 'Eid Mubarak!' },
  { name: 'Eid al-Adha',    emo: '🕌🐑💚',  color: '#8fd694', ranges: [['2026-05-26','2026-05-30'],['2027-05-16','2027-05-20'],['2028-05-04','2028-05-08']], greet: 'Eid Mubarak!' },
  { name: 'Halloween',      emo: '🎃👻🦇',  color: '#ff8c42', ranges: 'yearly:10-24:11-01', greet: 'Happy Halloween!' },
  { name: 'Christmas',      emo: '🎄❄️🎁',  color: '#ff5d5d', ranges: 'yearly:12-14:12-26', greet: 'Merry Christmas!' },
  { name: 'New Year',       emo: '🎆🥳✨',  color: '#ffd700', ranges: 'yearly:12-27:01-02', greet: 'Happy New Year!' },
  { name: 'Easter',         emo: '🐣🌸🥚',  color: '#c3a6ff', ranges: [['2026-03-30','2026-04-06'],['2027-03-22','2027-03-29'],['2028-04-10','2028-04-17']], greet: 'Happy Easter!' },
  { name: 'Diwali',         emo: '🪔✨🎇',  color: '#ffb347', ranges: [['2026-11-05','2026-11-10'],['2027-10-25','2027-10-30'],['2028-10-14','2028-10-19']], greet: 'Happy Diwali!' },
  { name: 'Chinese New Year', emo: '🧧🐉🏮', color: '#ff4d4d', ranges: [['2026-02-15','2026-02-19'],['2027-02-04','2027-02-08'],['2028-01-24','2028-01-28']], greet: 'Happy New Year!' }
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
    e.textContent = emos[i % emos.length] || '✨';
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
      o.innerHTML = '<div style="max-width:520px"><div style="font-size:3rem;margin-bottom:12px">⛔</div>' +
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

  window.ncAgeGate = function () {
    if (ncAge()) return;
    const o = document.createElement('div');
    o.id = 'ncAgeGate';
    o.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(5,6,10,0.96);color:#EAF2FF;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Segoe UI,sans-serif;backdrop-filter:blur(8px);';
    o.innerHTML = '<div style="max-width:460px;text-align:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px">' +
      '<div style="font-size:2.4rem;margin-bottom:10px">👋</div>' +
      '<h2 style="margin-bottom:8px">How old are you?</h2>' +
      '<p style="color:#7E8AA6;font-size:0.92rem;line-height:1.6;margin-bottom:16px">NovaClip is built for creators aged 13–18. Your answer sets the right safety level for your account.</p>' +
      '<input id="ncAgeInput" type="text" inputmode="numeric" maxlength="2" placeholder="Your age" style="width:100%;padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:#0A0C14;color:#EAF2FF;font-size:1.05rem;text-align:center;margin-bottom:12px">' +
      '<button id="ncAgeGo" style="width:100%;padding:14px;border:none;border-radius:30px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#00F0FF,#4CC9F0);color:#04121a;font-size:1rem">Continue</button>' +
      '<div id="ncAgeMsg" style="color:#FF2E97;font-size:0.85rem;margin-top:10px;min-height:20px"></div></div>';
    document.body.appendChild(o);
    document.getElementById('ncAgeGo').onclick = () => {
      const a = parseInt(document.getElementById('ncAgeInput').value, 10);
      const msg = document.getElementById('ncAgeMsg');
      if (isNaN(a) || a < 1 || a > 120) { msg.textContent = 'Please enter a valid age.'; return; }
      if (a < 13) { msg.innerHTML = 'Sorry — NovaClip is for ages 13 and over. Under-13 accounts need verified parental consent (COPPA/GDPR-K).'; return; }
      if (a > 18) { msg.innerHTML = 'NovaClip is designed for teen creators aged 13–18.'; return; }
      localStorage.setItem('nc_user_age', String(a));
      o.remove();
      if (a >= 16) {
        localStorage.setItem('nc_controls_relaxed', '1');
        alert('You are 16+, so monitoring is lighter: your chats are no longer logged for your parent.\n\nParental controls can only be fully removed by your parent from the Family Dashboard.');
      }
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
    startchannel:'lock in 🔒', seerewards:'peep the rewards 👀',
    home:'🏠 Home', studio:'📈 Studio', analytics:'📊 Stats', trends:'🛰️ Whats Hot',
    editor:'🎬 Editor', sniper:'🎯 Arena', ai:'✨ NovaClip AI',
    studio_h:'NovaClip Studio', studio_sub:'link ur channel n scope the competition 👁️',
    analytics_h:'Stats', analytics_sub:'ur numbers vs the ops — no cap 📈',
    analytics_hint:'link ur channel to pull the stats.',
    t_comp:'closest ops', t_comp_d:'channels ur size — full stats, no cap.',
    t_duel:'1v1 a channel', t_duel_d:'run it with a channel within 20k subs n bag points.',
    t_analytics:'full stats', t_analytics_d:'deep charts vs the ops — own page.',
    e_media:'Media', e_effects:'FX', e_audio:'Sound', e_memes:'Memes', e_text:'Text', e_voice:'Voice',
    e_effects_h:'fx n filters', e_memes_h:'meme search', e_text_h:'text on screen',
    e_voice_h:'AI voiceover', e_clip_h:'selected clip', e_filter:'filter', e_trans:'transition',
    e_import:'⊕ drop ur media', e_export:'⬆ export',
    language:'Language'
  };

  window.ncGenZ = function () { return localStorage.getItem('nc_genz') === '1'; };

  window.ncApplyGenZ = function () {
    if (!ncGenZ()) return;                       // normal mode: leave translations alone
    const lang = localStorage.getItem('nc_lang') || 'en';
    if (lang !== 'en') return;                   // slang only makes sense in English
    document.querySelectorAll('[data-t]').forEach(el => {
      const k = el.getAttribute('data-t');
      if (GENZ[k]) el.textContent = GENZ[k];
    });
  };

  window.ncSetGenZ = function (on) {
    localStorage.setItem('nc_genz', on ? '1' : '0');
    location.reload();
  };

  // toggle switch, injected into every sidebar
  window.ncBuildGenZToggle = function () {
    const wrap = document.querySelector('.themewrap');
    if (!wrap || document.getElementById('genzwrap')) return;
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

  function boot() { ncBuildGenZToggle(); setTimeout(ncApplyGenZ, 60); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
