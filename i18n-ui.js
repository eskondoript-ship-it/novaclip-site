/* ============================================================================
   i18n-ui.js — the UI labels that were never given a dictionary key
   ============================================================================
   nova.js has two translation mechanisms and they cover different things. The
   `T` dictionary covers the furniture nova.js builds itself — the rail, the
   top bar, the pricing cards — and is complete: 725 keys in all 20 languages.
   The `P` phrase layer swaps whole text nodes by their exact English wording,
   for UI that React or a page's own HTML renders and that `T` can therefore
   never reach. `P` held 27 phrases.

   Measured across 34 pages in all 19 non-English languages, about half of every
   page was still English, and the count was the same in each language to within
   three points. That is the signature of strings missing from the SITE rather
   than from a language: there is nothing to look up, so every language falls
   back to English together. Filling a language column would have fixed nothing.

   So this file is the phrase layer made big enough to matter, and kept apart
   from nova.js so it can keep growing without pushing that file past the point
   anybody can read it. nova.js loads it and merges it in; a phrase here behaves
   exactly as one declared in `P`.

   HOW TO ADD TO IT

   Key by the EXACT English string as it appears on screen, including case and
   any punctuation or symbol in the same text node, then nineteen values in the
   order of L below. The match is exact and whole-node: "Upload" will not touch
   "Upload a file", which is deliberate — a substring match would rewrite words
   inside sentences and break them.

   WHAT IS DELIBERATELY NOT HERE

   Brand names (NovaClip, NovaFlap, TypeMaster, YouTube), the long prose on
   privacy.html and terms.html — those are legal text and want a translator,
   not a dictionary — and anything a page generates with a number baked into
   it, which needs a {n} template in `T` instead.
   ========================================================================= */
(function () {
  var L = ['zh','hi','es','ar','fr','bn','pt','ru','ur','id','de','ja','tr','ko','fa','uk','it','pl','vi'];

  var R = {

  /* ---- the editor: left rail, media panel, inspector, timeline ---------- */
  "Media Library": ["媒体库","मीडिया लाइब्रेरी","Biblioteca de medios","مكتبة الوسائط","Bibliothèque média","মিডিয়া লাইব্রেরি","Biblioteca de mídia","Медиатека","میڈیا لائبریری","Pustaka media","Medienbibliothek","メディアライブラリ","Medya kitaplığı","미디어 보관함","کتابخانهٔ رسانه","Медіатека","Libreria media","Biblioteka mediów","Thư viện media"],
  "Upload": ["上传","अपलोड","Subir","رفع","Importer","আপলোড","Carregar","Загрузить","اپ لوڈ","Unggah","Hochladen","アップロード","Yükle","업로드","بارگذاری","Завантажити","Carica","Prześlij","Tải lên"],
  "Drop media here": ["把媒体拖到这里","मीडिया यहाँ छोड़ें","Suelta los medios aquí","أفلت الوسائط هنا","Dépose tes fichiers ici","মিডিয়া এখানে ছাড়ো","Larga os ficheiros aqui","Перетащи файлы сюда","میڈیا یہاں چھوڑیں","Letakkan media di sini","Medien hierher ziehen","ここにメディアをドロップ","Medyayı buraya bırak","여기에 미디어를 놓으세요","رسانه را اینجا رها کن","Перетягни файли сюди","Trascina qui i file","Upuść media tutaj","Thả media vào đây"],
  "Transform": ["变换","ट्रांसफ़ॉर्म","Transformar","تحويل","Transformer","ট্রান্সফর্ম","Transformar","Трансформация","ٹرانسفارم","Transformasi","Transformieren","変形","Dönüştür","변형","دگرگونی","Трансформація","Trasforma","Przekształć","Biến đổi"],
  "Color": ["颜色","रंग","Color","اللون","Couleur","রঙ","Cor","Цвет","رنگ","Warna","Farbe","カラー","Renk","색상","رنگ","Колір","Colore","Kolor","Màu"],
  "Keyframes": ["关键帧","कीफ़्रेम","Fotogramas clave","الإطارات المفتاحية","Images clés","কীফ্রেম","Fotogramas-chave","Ключевые кадры","کی فریمز","Keyframe","Keyframes","キーフレーム","Anahtar kareler","키프레임","کلیدفریم‌ها","Ключові кадри","Fotogrammi chiave","Klatki kluczowe","Khung hình khóa"],
  "No clip selected": ["未选择片段","कोई क्लिप चुनी नहीं","Ningún clip seleccionado","لم يتم اختيار مقطع","Aucun clip sélectionné","কোনো ক্লিপ বাছাই করা হয়নি","Nenhum clipe selecionado","Клип не выбран","کوئی کلپ منتخب نہیں","Tidak ada klip dipilih","Kein Clip ausgewählt","クリップが選択されていません","Seçili klip yok","선택된 클립 없음","هیچ کلیپی انتخاب نشده","Кліп не вибрано","Nessuna clip selezionata","Nie wybrano klipu","Chưa chọn clip nào"],
  "+ Timeline": ["+ 时间线","+ टाइमलाइन","+ Línea de tiempo","+ خط زمني","+ Montage","+ টাইমলাইন","+ Linha temporal","+ Таймлайн","+ ٹائم لائن","+ Lini masa","+ Zeitleiste","+ タイムライン","+ Zaman çizelgesi","+ 타임라인","+ خط زمانی","+ Таймлайн","+ Timeline","+ Oś czasu","+ Dòng thời gian"],
  "Snap": ["吸附","स्नैप","Ajustar","محاذاة","Magnétisme","স্ন্যাপ","Ajustar","Привязка","اسنیپ","Rekat","Einrasten","スナップ","Yapış","스냅","چسبیدن","Прив'язка","Aggancia","Przyciąganie","Hít dính"],
  "tracks": ["轨道","ट्रैक","pistas","مسارات","pistes","ট্র্যাক","faixas","дорожек","ٹریکس","trek","Spuren","トラック","iz","트랙","ترک","доріжок","tracce","ścieżki","rãnh"],
  "clips": ["片段","क्लिप","clips","مقاطع","clips","ক্লিপ","clipes","клипов","کلپس","klip","Clips","クリップ","klip","클립","کلیپ","кліпів","clip","klipy","clip"],
  "Photos": ["照片","फ़ोटो","Fotos","صور","Photos","ছবি","Fotos","Фото","تصاویر","Foto","Fotos","写真","Fotoğraflar","사진","عکس","Фото","Foto","Zdjęcia","Ảnh"],
  "Footage": ["素材","फुटेज","Metraje","لقطات","Rushes","ফুটেজ","Imagens","Видеоматериал","فوٹیج","Cuplikan","Filmmaterial","映像素材","Görüntüler","영상 소스","فیلم خام","Відеоматеріал","Filmati","Materiał","Cảnh quay"],
  "Emojis": ["表情符号","इमोजी","Emojis","إيموجي","Émojis","ইমোজি","Emojis","Эмодзи","ایموجی","Emoji","Emojis","絵文字","Emoji","이모지","ایموجی","Емодзі","Emoji","Emoji","Emoji"],
  "Voice changer": ["变声器","वॉइस चेंजर","Cambiador de voz","مغيّر الصوت","Modulateur de voix","ভয়েস চেঞ্জার","Alterador de voz","Изменение голоса","وائس چینجر","Pengubah suara","Stimmverzerrer","ボイスチェンジャー","Ses değiştirici","음성 변조","تغییردهندهٔ صدا","Зміна голосу","Cambia voce","Zmieniacz głosu","Đổi giọng"],
  "Record yourself": ["录下你自己","खुद को रिकॉर्ड करें","Grábate","سجّل نفسك","Enregistre-toi","নিজেকে রেকর্ড করো","Grava-te","Запиши себя","خود کو ریکارڈ کریں","Rekam dirimu","Nimm dich auf","自分を録音する","Kendini kaydet","직접 녹음하기","خودت را ضبط کن","Запиши себе","Registrati","Nagraj siebie","Tự ghi âm"],
  "Simple": ["简单","सरल","Sencillo","بسيط","Simple","সহজ","Simples","Простой","سادہ","Sederhana","Einfach","かんたん","Basit","간단","ساده","Простий","Semplice","Prosty","Đơn giản"],
  "Complex": ["复杂","उन्नत","Avanzado","متقدّم","Avancé","উন্নত","Avançado","Расширенный","پیچیدہ","Lanjutan","Erweitert","詳細","Gelişmiş","고급","پیشرفته","Розширений","Avanzato","Zaawansowany","Nâng cao"],
  "Untitled Project": ["未命名项目","बिना नाम प्रोजेक्ट","Proyecto sin título","مشروع بلا عنوان","Projet sans titre","নামহীন প্রজেক্ট","Projeto sem título","Проект без названия","بے نام پروجیکٹ","Proyek tanpa judul","Unbenanntes Projekt","無題のプロジェクト","Adsız proje","제목 없는 프로젝트","پروژهٔ بی‌نام","Проєкт без назви","Progetto senza titolo","Projekt bez nazwy","Dự án chưa đặt tên"],
  "same media, separate cut": ["同一素材，独立剪辑","वही मीडिया, अलग कट","mismo medio, corte aparte","نفس الوسيط، قَصّ منفصل","même média, coupe distincte","একই মিডিয়া, আলাদা কাট","mesmo ficheiro, corte separado","тот же файл, отдельная нарезка","وہی میڈیا، الگ کٹ","media sama, potongan terpisah","dieselbe Datei, eigener Schnitt","同じ素材、別のカット","aynı medya, ayrı kesim","같은 소스, 별도 컷","همان رسانه، برش جدا","той самий файл, окремий монтаж","stesso media, taglio separato","to samo media, osobne cięcie","cùng media, cắt riêng"],
  "Help": ["帮助","मदद","Ayuda","مساعدة","Aide","সাহায্য","Ajuda","Помощь","مدد","Bantuan","Hilfe","ヘルプ","Yardım","도움말","راهنما","Довідка","Aiuto","Pomoc","Trợ giúp"],
  "Back to the site": ["返回网站","साइट पर वापस","Volver al sitio","العودة إلى الموقع","Retour au site","সাইটে ফিরে যাও","Voltar ao site","Назад на сайт","سائٹ پر واپس","Kembali ke situs","Zurück zur Website","サイトに戻る","Siteye dön","사이트로 돌아가기","بازگشت به سایت","Назад на сайт","Torna al sito","Powrót do strony","Quay lại trang"],
  "▶ Clip finder": ["▶ 片段查找","▶ क्लिप फ़ाइंडर","▶ Buscador de clips","▶ باحث المقاطع","▶ Chercheur de clips","▶ ক্লিপ ফাইন্ডার","▶ Localizador de clipes","▶ Поиск клипов","▶ کلپ فائنڈر","▶ Pencari klip","▶ Clip-Finder","▶ クリップ検索","▶ Klip bulucu","▶ 클립 찾기","▶ یابندهٔ کلیپ","▶ Пошук кліпів","▶ Trova clip","▶ Wyszukiwarka klipów","▶ Tìm clip"],
  "Clip": ["片段","क्लिप","Clip","مقطع","Clip","ক্লিপ","Clipe","Клип","کلپ","Klip","Clip","クリップ","Klip","클립","کلیپ","Кліп","Clip","Klip","Clip"],
  "Video": ["视频","वीडियो","Vídeo","فيديو","Vidéo","ভিডিও","Vídeo","Видео","ویڈیو","Video","Video","動画","Video","영상","ویدیو","Відео","Video","Wideo","Video"],

  /* ---- the Studio landing page ------------------------------------------ */
  "Creator Studio": ["创作者工作室","क्रिएटर स्टूडियो","Estudio del creador","استوديو صانع المحتوى","Studio du créateur","ক্রিয়েটর স্টুডিও","Estúdio do criador","Студия автора","کری ایٹر اسٹوڈیو","Studio kreator","Creator-Studio","クリエイタースタジオ","Üretici stüdyosu","크리에이터 스튜디오","استودیوی سازنده","Студія автора","Studio del creator","Studio twórcy","Xưởng của nhà sáng tạo"],
  "NovaClip Studio": ["NovaClip 工作室","NovaClip स्टूडियो","Estudio NovaClip","استوديو NovaClip","Studio NovaClip","NovaClip স্টুডিও","Estúdio NovaClip","Студия NovaClip","NovaClip اسٹوڈیو","Studio NovaClip","NovaClip Studio","NovaClip スタジオ","NovaClip Stüdyo","NovaClip 스튜디오","استودیوی NovaClip","Студія NovaClip","Studio NovaClip","Studio NovaClip","Xưởng NovaClip"],
  "Studio": ["工作室","स्टूडियो","Estudio","استوديو","Studio","স্টুডিও","Estúdio","Студия","اسٹوڈیو","Studio","Studio","スタジオ","Stüdyo","스튜디오","استودیو","Студія","Studio","Studio","Xưởng"],
  "Creator": ["创作者","क्रिएटर","Creador","صانع المحتوى","Créateur","ক্রিয়েটর","Criador","Автор","کری ایٹر","Kreator","Creator","クリエイター","Üretici","크리에이터","سازنده","Автор","Creator","Twórca","Nhà sáng tạo"],
  "Open Trend Spotter": ["打开趋势雷达","ट्रेंड स्पॉटर खोलें","Abrir el Detector de tendencias","افتح راصد الاتجاهات","Ouvrir le Détecteur de tendances","ট্রেন্ড স্পটার খোলো","Abrir o Detetor de tendências","Открыть «Тренд-радар»","ٹرینڈ اسپاٹر کھولیں","Buka Pemantau Tren","Trend-Spotter öffnen","トレンドスポッターを開く","Trend Bulucu'yu aç","트렌드 스포터 열기","ردیاب ترند را باز کن","Відкрити «Трендошукач»","Apri il Rilevatore di tendenze","Otwórz Wykrywacz trendów","Mở Dò xu hướng"],
  "Go to Trend Spotter": ["前往趋势雷达","ट्रेंड स्पॉटर पर जाएँ","Ir al Detector de tendencias","اذهب إلى راصد الاتجاهات","Aller au Détecteur de tendances","ট্রেন্ড স্পটারে যাও","Ir para o Detetor de tendências","Перейти к «Тренд-радару»","ٹرینڈ اسپاٹر پر جائیں","Ke Pemantau Tren","Zum Trend-Spotter","トレンドスポッターへ","Trend Bulucu'ya git","트렌드 스포터로 가기","به ردیاب ترند برو","До «Трендошукача»","Vai al Rilevatore di tendenze","Przejdź do Wykrywacza trendów","Tới Dò xu hướng"],
  "Trend Spotter": ["趋势雷达","ट्रेंड स्पॉटर","Detector de tendencias","راصد الاتجاهات","Détecteur de tendances","ট্রেন্ড স্পটার","Detetor de tendências","Тренд-радар","ٹرینڈ اسپاٹر","Pemantau Tren","Trend-Spotter","トレンドスポッター","Trend Bulucu","트렌드 스포터","ردیاب ترند","Трендошукач","Rilevatore di tendenze","Wykrywacz trendów","Dò xu hướng"],
  "Nova Points": ["Nova 积分","Nova पॉइंट","Puntos Nova","نقاط Nova","Points Nova","Nova পয়েন্ট","Pontos Nova","Очки Nova","Nova پوائنٹس","Poin Nova","Nova-Punkte","Nova ポイント","Nova puanı","Nova 포인트","امتیاز Nova","Бали Nova","Punti Nova","Punkty Nova","Điểm Nova"],
  "Trend Scans": ["趋势扫描","ट्रेंड स्कैन","Escaneos de tendencias","مسح الاتجاهات","Scans de tendances","ট্রেন্ড স্ক্যান","Análises de tendências","Сканы трендов","ٹرینڈ اسکینز","Pindaian tren","Trend-Scans","トレンドスキャン","Trend taramaları","트렌드 스캔","اسکن ترند","Скани трендів","Scansioni di tendenze","Skany trendów","Lượt quét xu hướng"],
  "Pipeline Steps": ["流程步骤","पाइपलाइन चरण","Pasos del flujo","خطوات المسار","Étapes du flux","পাইপলাইন ধাপ","Passos do fluxo","Шаги конвейера","پائپ لائن مراحل","Langkah alur","Pipeline-Schritte","パイプラインの手順","Akış adımları","파이프라인 단계","گام‌های خط تولید","Кроки конвеєра","Fasi del flusso","Kroki procesu","Các bước quy trình"],
  "Creator pipeline": ["创作流程","क्रिएटर पाइपलाइन","Flujo del creador","مسار صانع المحتوى","Flux du créateur","ক্রিয়েটর পাইপলাইন","Fluxo do criador","Конвейер автора","کری ایٹر پائپ لائن","Alur kreator","Creator-Pipeline","クリエイターの流れ","Üretici akışı","크리에이터 파이프라인","خط تولید سازنده","Конвеєр автора","Flusso del creator","Proces twórcy","Quy trình sáng tạo"],
  "Find what to make before it peaks.": ["在爆火之前就知道该做什么。","चरम पर पहुँचने से पहले जानें क्या बनाना है।","Descubre qué hacer antes de que explote.","اعرف ما تصنعه قبل أن يبلغ ذروته.","Trouve quoi faire avant que ça explose.","চূড়ায় ওঠার আগেই জেনে নাও কী বানাবে।","Descobre o que fazer antes de rebentar.","Узнай, что снимать, до пика.","عروج سے پہلے جانیں کیا بنانا ہے۔","Tahu harus bikin apa sebelum memuncak.","Finde heraus, was angesagt wird, bevor es das ist.","ピークが来る前に、作るものを見つける。","Zirveye çıkmadan ne çekeceğini bul.","정점에 오르기 전에 무엇을 만들지 찾기.","پیش از اوج گرفتن، بفهم چه بسازی.","Дізнайся, що знімати, до піку.","Scopri cosa fare prima che esploda.","Dowiedz się, co robić, zanim wystrzeli.","Biết nên làm gì trước khi nó bùng nổ."],
  "Video Ideas": ["视频创意","वीडियो आइडिया","Ideas de vídeo","أفكار فيديو","Idées de vidéos","ভিডিও আইডিয়া","Ideias de vídeo","Идеи для видео","ویڈیو آئیڈیاز","Ide video","Videoideen","動画のアイデア","Video fikirleri","영상 아이디어","ایده‌های ویدیو","Ідеї для відео","Idee video","Pomysły na filmy","Ý tưởng video"],
  "Titles, hooks and formats to steal the feed.": ["抢占信息流的标题、钩子和形式。","फ़ीड पर छा जाने वाले टाइटल, हुक और फ़ॉर्मेट।","Títulos, ganchos y formatos para arrasar en el feed.","عناوين وخطّافات وصيغ تخطف الواجهة.","Titres, accroches et formats pour rafler le fil.","ফিড দখল করার টাইটেল, হুক আর ফরম্যাট।","Títulos, ganchos e formatos para dominar o feed.","Заголовки, зацепки и форматы, чтобы забрать ленту.","فیڈ پر چھا جانے والے ٹائٹل، ہُک اور فارمیٹ۔","Judul, pancingan, dan format untuk merebut feed.","Titel, Hooks und Formate, die den Feed holen.","フィードを奪うタイトル・フック・フォーマット。","Akışı kapan başlıklar, kancalar ve formatlar.","피드를 가져올 제목과 후킹, 포맷.","عنوان، قلاب و قالبی که فید را می‌قاپد.","Заголовки, гачки й формати, щоб забрати стрічку.","Titoli, hook e formati per prendersi il feed.","Tytuły, haczyki i formaty, które zgarną feed.","Tiêu đề, cú móc và định dạng để chiếm feed."],
  "Scripts": ["脚本","स्क्रिप्ट","Guiones","نصوص","Scripts","স্ক্রিপ্ট","Guiões","Сценарии","اسکرپٹس","Naskah","Skripte","台本","Senaryolar","대본","فیلمنامه‌ها","Сценарії","Copioni","Scenariusze","Kịch bản"],
  "Turn a trend into a full script.": ["把一个趋势变成完整脚本。","एक ट्रेंड को पूरी स्क्रिप्ट में बदलें।","Convierte una tendencia en un guion completo.","حوّل اتجاهًا إلى نص كامل.","Transforme une tendance en script complet.","একটা ট্রেন্ডকে পুরো স্ক্রিপ্টে বদলে নাও।","Transforma uma tendência num guião completo.","Преврати тренд в полный сценарий.","ایک ٹرینڈ کو مکمل اسکرپٹ بنائیں۔","Ubah satu tren jadi naskah utuh.","Mach aus einem Trend ein ganzes Skript.","トレンドを台本一本に変える。","Bir trendi tam senaryoya çevir.","트렌드 하나를 완성된 대본으로.","یک ترند را به فیلمنامهٔ کامل تبدیل کن.","Перетвори тренд на повний сценарій.","Trasforma una tendenza in un copione completo.","Zamień trend w pełny scenariusz.","Biến một xu hướng thành kịch bản đầy đủ."],
  "Thumbnails": ["缩略图","थंबनेल","Miniaturas","صور مصغّرة","Miniatures","থাম্বনেইল","Miniaturas","Обложки","تھمب نیلز","Thumbnail","Thumbnails","サムネイル","Küçük resimler","썸네일","بندانگشتی‌ها","Обкладинки","Miniature","Miniatury","Ảnh thu nhỏ"],
  "Click-through thumbnails that convert.": ["让人忍不住点的缩略图。","क्लिक करवाने वाले थंबनेल।","Miniaturas que se hacen clic.","صور مصغّرة تدفع للنقر.","Des miniatures qui font cliquer.","যেসব থাম্বনেইলে ক্লিক পড়ে।","Miniaturas que levam ao clique.","Обложки, на которые кликают.","کلک کرانے والے تھمب نیل۔","Thumbnail yang bikin diklik.","Thumbnails, auf die geklickt wird.","クリックされるサムネイル。","Tıklatan küçük resimler.","클릭을 부르는 썸네일.","بندانگشتی‌هایی که کلیک می‌گیرند.","Обкладинки, на які клікають.","Miniature su cui si clicca.","Miniatury, w które się klika.","Ảnh thu nhỏ khiến người ta bấm."],
  "Editor": ["剪辑器","एडिटर","Editor","المحرر","Éditeur","এডিটর","Editor","Редактор","ایڈیٹر","Editor","Editor","エディター","Düzenleyici","편집기","ویرایشگر","Редактор","Editor","Edytor","Trình biên tập"],
  "Cut, pace and package your video.": ["剪辑、把握节奏、包装你的视频。","अपने वीडियो को काटें, लय दें और सजाएँ।","Corta, marca el ritmo y empaqueta tu vídeo.","قُصّ وأضبط الإيقاع وغلّف الفيديو.","Coupe, rythme et habille ta vidéo.","ভিডিও কাটো, গতি দাও, সাজাও।","Corta, dá ritmo e embala o teu vídeo.","Нарежь, задай темп и упакуй видео.","اپنی ویڈیو کاٹیں، رفتار دیں اور سجائیں۔","Potong, atur tempo, dan kemas videomu.","Schneide, takte und verpacke dein Video.","動画を切って、テンポをつけて、仕上げる。","Videonu kes, ritmini ayarla, paketle.","영상을 자르고 흐름을 잡고 포장하기.","ویدیو را ببر، ریتم بده و بسته‌بندی کن.","Наріж, задай темп і запакуй відео.","Taglia, dai ritmo e confeziona il video.","Potnij, nadaj tempo i opakuj film.","Cắt, tạo nhịp và đóng gói video."],
  "Ship to every platform at once.": ["一次发布到所有平台。","एक बार में हर प्लैटफ़ॉर्म पर भेजें।","Publica en todas las plataformas a la vez.","انشر على كل المنصات دفعة واحدة.","Publie partout d'un seul coup.","একবারে সব প্ল্যাটফর্মে পাঠাও।","Publica em todas as plataformas de uma vez.","Опубликуй сразу на всех площадках.","ایک ہی بار میں ہر پلیٹ فارم پر بھیجیں۔","Kirim ke semua platform sekaligus.","Auf einen Schlag überall veröffentlichen.","すべてのプラットフォームへ一度に。","Hepsine aynı anda gönder.","모든 플랫폼에 한 번에 올리기.","یک‌باره روی همهٔ پلتفرم‌ها منتشر کن.","Опублікуй одразу всюди.","Pubblica su ogni piattaforma in una volta.","Wyślij na wszystkie platformy naraz.","Đăng lên mọi nền tảng cùng lúc."],
  "Jump back into a niche you already scanned.": ["回到你扫描过的领域。","जिस निच को पहले स्कैन किया था, उसमें लौटें।","Vuelve a un nicho que ya escaneaste.","عُد إلى مجال سبق أن مسحته.","Reviens sur une niche déjà scannée.","আগেই স্ক্যান করা নিশে ফিরে যাও।","Volta a um nicho que já analisaste.","Вернись к нише, которую уже сканировал.","جو نِچ پہلے اسکین کیا، اس پر واپس جائیں۔","Kembali ke niche yang sudah kamu pindai.","Zurück in eine Nische, die du schon gescannt hast.","すでにスキャンしたニッチに戻る。","Daha önce taradığın bir alana dön.","이미 스캔한 분야로 돌아가기.","به حوزه‌ای که قبلاً اسکن کردی برگرد.","Повернись до ніші, яку вже сканував.","Torna su una nicchia che hai già scansionato.","Wróć do niszy, którą już skanowałeś.","Quay lại ngách bạn đã quét."],

  /* ---- the games ------------------------------------------------------- */
  "Time": ["时间","समय","Tiempo","الوقت","Temps","সময়","Tempo","Время","وقت","Waktu","Zeit","タイム","Süre","시간","زمان","Час","Tempo","Czas","Thời gian"],
  "Hits": ["命中","हिट","Aciertos","إصابات","Touchés","হিট","Acertos","Попадания","ہٹس","Kena","Treffer","ヒット","İsabet","적중","اصابت","Влучання","Colpi","Trafienia","Trúng"],
  "Misses": ["未命中","मिस","Fallos","إخفاقات","Ratés","মিস","Falhas","Промахи","مِسز","Meleset","Fehlschüsse","ミス","Iska","빗나감","خطا","Промахи","Errori","Pudła","Trượt"],
  "Score": ["得分","स्कोर","Puntuación","النتيجة","Score","স্কোর","Pontuação","Счёт","اسکور","Skor","Punktzahl","スコア","Skor","점수","امتیاز","Рахунок","Punteggio","Wynik","Điểm"],
  "Accuracy": ["准确率","सटीकता","Precisión","الدقّة","Précision","নির্ভুলতা","Precisão","Точность","درستگی","Akurasi","Genauigkeit","正確率","İsabet oranı","정확도","دقت","Точність","Precisione","Celność","Độ chính xác"],
  "Ready?": ["准备好了吗？","तैयार?","¿Listo?","جاهز؟","Prêt ?","তৈরি?","Pronto?","Готов?","تیار؟","Siap?","Bereit?","準備はいい？","Hazır mısın?","준비됐나요?","آماده‌ای؟","Готовий?","Pronto?","Gotowy?","Sẵn sàng chưa?"],
  "Points": ["积分","पॉइंट","Puntos","النقاط","Points","পয়েন্ট","Pontos","Очки","پوائنٹس","Poin","Punkte","ポイント","Puan","포인트","امتیاز","Бали","Punti","Punkty","Điểm"],
  "Press to start": ["按下开始","शुरू करने के लिए दबाएँ","Pulsa para empezar","اضغط للبدء","Appuie pour commencer","শুরু করতে চাপো","Carrega para começar","Нажми, чтобы начать","شروع کرنے کے لیے دبائیں","Tekan untuk mulai","Zum Start drücken","押してスタート","Başlamak için bas","눌러서 시작","برای شروع بزن","Натисни, щоб почати","Premi per iniziare","Naciśnij, aby zacząć","Nhấn để bắt đầu"],
  "Start": ["开始","शुरू","Empezar","ابدأ","Démarrer","শুরু","Começar","Старт","شروع","Mulai","Start","スタート","Başla","시작","شروع","Старт","Inizia","Start","Bắt đầu"],
  "Target": ["靶心","टारगेट","Diana","الهدف","Cible","টার্গেট","Alvo","Мишень","ٹارگٹ","Target","Ziel","ターゲット","Hedef","타깃","هدف","Ціль","Bersaglio","Cel","Mục tiêu"],
  "Reaction": ["反应","रिएक्शन","Reacción","رد الفعل","Réaction","রিঅ্যাকশন","Reação","Реакция","ری ایکشن","Reaksi","Reaktion","反応速度","Tepki","반응속도","واکنش","Реакція","Reazione","Refleks","Phản xạ"],
  "Median of five": ["五次中位数","पाँच का माध्यिका","Mediana de cinco","وسيط خمس محاولات","Médiane sur cinq","পাঁচটির মধ্যমা","Mediana de cinco","Медиана из пяти","پانچ کا میڈین","Median dari lima","Median aus fünf","5回の中央値","Beşin ortancası","다섯 번의 중앙값","میانهٔ پنج","Медіана з п'яти","Mediana di cinque","Mediana z pięciu","Trung vị của năm"],
  "Fastest single go": ["单次最快","सबसे तेज़ एक बार","El intento más rápido","أسرع محاولة واحدة","Meilleur essai","সবচেয়ে দ্রুত একটি","A tentativa mais rápida","Самая быстрая попытка","سب سے تیز ایک کوشش","Percobaan tercepat","Schnellster Einzelversuch","最速の1回","En hızlı tek deneme","가장 빠른 한 번","سریع‌ترین تک‌تلاش","Найшвидша спроба","Il tentativo più veloce","Najszybsza próba","Lần nhanh nhất"],
  "Space": ["空格","स्पेस","Espacio","مسافة","Espace","স্পেস","Espaço","Пробел","اسپیس","Spasi","Leertaste","スペース","Boşluk","스페이스","فاصله","Пробіл","Spazio","Spacja","Phím cách"],
  "tap": ["点击","टैप","toca","انقر","appuie","ট্যাপ","toca","тап","ٹیپ","ketuk","tippen","タップ","dokun","탭","ضربه","тап","tocca","dotknij","chạm"],
  "Typing race": ["打字竞速","टाइपिंग रेस","Carrera de escritura","سباق الكتابة","Course de frappe","টাইপিং রেস","Corrida de escrita","Гонка на печать","ٹائپنگ ریس","Balapan mengetik","Tipp-Rennen","タイピングレース","Yazma yarışı","타자 경주","مسابقهٔ تایپ","Перегони з набору","Gara di battitura","Wyścig pisania","Đua gõ phím"],
  "Nova Flap": ["Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap","Nova Flap"],
  "Leaderboard": ["排行榜","लीडरबोर्ड","Clasificación","لوحة الصدارة","Classement","লিডারবোর্ড","Classificação","Таблица лидеров","لیڈر بورڈ","Papan peringkat","Bestenliste","ランキング","Sıralama","리더보드","جدول صدرنشینان","Таблиця лідерів","Classifica","Ranking","Bảng xếp hạng"],
  "Profile": ["个人资料","प्रोफ़ाइल","Perfil","الملف الشخصي","Profil","প্রোফাইল","Perfil","Профиль","پروفائل","Profil","Profil","プロフィール","Profil","프로필","پروفایل","Профіль","Profilo","Profil","Hồ sơ"],
  "Home": ["主页","होम","Inicio","الرئيسية","Accueil","হোম","Início","Главная","ہوم","Beranda","Start","ホーム","Ana sayfa","홈","خانه","Головна","Home","Start","Trang chủ"],
  "Play": ["开始玩","खेलें","Jugar","العب","Jouer","খেলো","Jogar","Играть","کھیلیں","Main","Spielen","プレイ","Oyna","플레이","بازی","Грати","Gioca","Graj","Chơi"],
  "Modes": ["模式","मोड","Modos","الأنماط","Modes","মোড","Modos","Режимы","موڈز","Mode","Modi","モード","Modlar","모드","حالت‌ها","Режими","Modalità","Tryby","Chế độ"],
  "Challenges": ["挑战","चैलेंज","Retos","التحديات","Défis","চ্যালেঞ্জ","Desafios","Испытания","چیلنجز","Tantangan","Challenges","チャレンジ","Meydan okumalar","챌린지","چالش‌ها","Виклики","Sfide","Wyzwania","Thử thách"],
  "Stats": ["数据","आँकड़े","Estadísticas","إحصاءات","Stats","পরিসংখ্যান","Estatísticas","Статистика","اعداد و شمار","Statistik","Statistiken","統計","İstatistik","통계","آمار","Статистика","Statistiche","Statystyki","Thống kê"],
  "Guest": ["访客","मेहमान","Invitado","ضيف","Invité","অতিথি","Convidado","Гость","مہمان","Tamu","Gast","ゲスト","Misafir","손님","مهمان","Гість","Ospite","Gość","Khách"],
  "Today": ["今天","आज","Hoy","اليوم","Aujourd'hui","আজ","Hoje","Сегодня","آج","Hari ini","Heute","今日","Bugün","오늘","امروز","Сьогодні","Oggi","Dziś","Hôm nay"],
  "Week": ["本周","सप्ताह","Semana","أسبوع","Semaine","সপ্তাহ","Semana","Неделя","ہفتہ","Minggu","Woche","週","Hafta","주","هفته","Тиждень","Settimana","Tydzień","Tuần"],
  "Month": ["本月","महीना","Mes","شهر","Mois","মাস","Mês","Месяц","مہینہ","Bulan","Monat","月","Ay","월","ماه","Місяць","Mese","Miesiąc","Tháng"],
  "Year": ["全年","साल","Año","سنة","Année","বছর","Ano","Год","سال","Tahun","Jahr","年","Yıl","연","سال","Рік","Anno","Rok","Năm"],

  /* ---- the Coder page --------------------------------------------------- */
  "Coder": ["编码器","कोडर","Programador","المبرمج","Codeur","কোডার","Programador","Кодер","کوڈر","Coder","Coder","コーダー","Kodlayıcı","코더","کدنویس","Кодер","Coder","Koder","Lập trình"],
  "What do you want built?": ["你想让它做什么？","आप क्या बनवाना चाहते हैं?","¿Qué quieres que te construya?","ماذا تريد أن نبني؟","Tu veux qu'on construise quoi ?","তুমি কী বানাতে চাও?","O que queres que seja construído?","Что построить?","آپ کیا بنوانا چاہتے ہیں؟","Mau dibuatkan apa?","Was soll gebaut werden?","何を作りますか？","Ne inşa edelim?","무엇을 만들까요?","می‌خواهی چه چیزی ساخته شود؟","Що побудувати?","Cosa vuoi che venga costruito?","Co mamy zbudować?","Bạn muốn dựng gì?"],
  "Build it": ["开始构建","बनाओ","Constrúyelo","ابنِه","Construire","বানাও","Construir","Построить","بنائیں","Buat","Bauen","作る","İnşa et","만들기","بسازش","Побудувати","Costruisci","Zbuduj","Dựng"],
  "✓ Things it can build": ["✓ 它能做的","✓ जो यह बना सकता है","✓ Lo que sí puede construir","✓ ما يستطيع بناءه","✓ Ce qu'il sait construire","✓ যা এটি বানাতে পারে","✓ O que consegue construir","✓ Что он может построить","✓ جو یہ بنا سکتا ہے","✓ Yang bisa dibuat","✓ Was es bauen kann","✓ 作れるもの","✓ Yapabildikleri","✓ 만들 수 있는 것","✓ آنچه می‌تواند بسازد","✓ Що він може зробити","✓ Cosa sa costruire","✓ Co potrafi zbudować","✓ Những thứ nó dựng được"],
  "✕ Things it will refuse, and say so": ["✕ 它会拒绝，并直说","✕ जो यह मना करेगा, और बता देगा","✕ Lo que rechazará, y lo dirá","✕ ما سيرفضه، وسيقولها","✕ Ce qu'il refusera, et le dira","✕ যা এটি করবে না, এবং বলে দেবে","✕ O que vai recusar, e dizer","✕ Что он откажется делать и так и скажет","✕ جو یہ نہیں کرے گا، اور بتا دے گا","✕ Yang akan ditolak, dan dikatakan","✕ Was es ablehnt — und das sagt","✕ 断るもの、そしてそう言う","✕ Reddedecekleri, ve söyleyecekleri","✕ 거절할 것, 그리고 그렇게 말할 것","✕ آنچه رد می‌کند و می‌گوید","✕ Від чого відмовиться — і скаже про це","✕ Cosa rifiuterà, dicendolo","✕ Czego odmówi — i powie o tym","✕ Những thứ nó từ chối, và nói thẳng"],
  "Animated lower thirds and end screens": ["动态字幕条和片尾画面","एनिमेटेड लोअर थर्ड और एंड स्क्रीन","Rótulos animados y pantallas finales","أشرطة سفلية متحركة وشاشات ختامية","Bandeaux animés et écrans de fin","অ্যানিমেটেড লোয়ার থার্ড ও এন্ড স্ক্রিন","Oráculos animados e ecrãs finais","Анимированные титры и конечные заставки","اینیمیٹڈ لوئر تھرڈ اور اینڈ اسکرینز","Lower third animasi dan layar penutup","Animierte Bauchbinden und Endscreens","アニメーションのテロップとエンドカード","Animasyonlu alt bantlar ve bitiş ekranları","애니메이션 자막 바와 엔드 화면","نوار پایین متحرک و صفحهٔ پایانی","Анімовані титри та кінцеві екрани","Sottopancia animati e schermate finali","Animowane belki i ekrany końcowe","Thanh chữ động và màn hình kết"],
  "A landing page for your channel links": ["放你频道链接的落地页","आपके चैनल लिंक के लिए लैंडिंग पेज","Una página con los enlaces de tu canal","صفحة هبوط لروابط قناتك","Une page d'accueil pour tes liens","তোমার চ্যানেল লিংকের ল্যান্ডিং পেজ","Uma página com os links do teu canal","Лендинг со ссылками твоего канала","آپ کے چینل لنکس کے لیے لینڈنگ پیج","Halaman untuk semua tautan kanalmu","Eine Landingpage für deine Kanal-Links","チャンネルのリンクをまとめたページ","Kanal bağlantıların için bir açılış sayfası","채널 링크를 모은 랜딩 페이지","صفحهٔ فرود برای لینک‌های کانالت","Лендинг із посиланнями твого каналу","Una pagina con i link del tuo canale","Strona z linkami twojego kanału","Trang đích cho các liên kết kênh"],
  "Thumbnail templates you fill in and screenshot": ["填好再截图的缩略图模板","थंबनेल टेम्पलेट जो भरकर स्क्रीनशॉट लें","Plantillas de miniatura que rellenas y capturas","قوالب صور مصغّرة تملؤها ثم تلتقطها","Des modèles de miniatures à remplir et capturer","থাম্বনেইল টেমপ্লেট — পূরণ করে স্ক্রিনশট নাও","Modelos de miniatura que preenches e capturas","Шаблоны обложек: заполни и сделай скриншот","تھمب نیل ٹیمپلیٹس جو بھر کر اسکرین شاٹ لیں","Templat thumbnail yang kamu isi lalu tangkap layar","Thumbnail-Vorlagen zum Ausfüllen und Abfotografieren","書き込んでスクショするサムネのひな形","Doldurup ekran görüntüsü aldığın küçük resim şablonları","채워서 캡처하는 썸네일 템플릿","قالب بندانگشتی که پر می‌کنی و اسکرین‌شات می‌گیری","Шаблони обкладинок: заповни і зроби скриншот","Modelli di miniatura da riempire e catturare","Szablony miniatur do wypełnienia i zrzutu","Mẫu ảnh thu nhỏ bạn điền rồi chụp màn hình"],
  "Small games and widgets for your community": ["给你社群的小游戏和小组件","आपकी कम्युनिटी के लिए छोटे गेम और विजेट","Juegos y widgets pequeños para tu comunidad","ألعاب صغيرة وأدوات لمجتمعك","Petits jeux et widgets pour ta communauté","তোমার কমিউনিটির জন্য ছোট গেম ও উইজেট","Jogos pequenos e widgets para a tua comunidade","Мини-игры и виджеты для твоего сообщества","آپ کی کمیونٹی کے لیے چھوٹے گیمز اور وجٹس","Gim kecil dan widget untuk komunitasmu","Kleine Spiele und Widgets für deine Community","コミュニティ向けの小さなゲームやウィジェット","Topluluğun için küçük oyunlar ve araçlar","커뮤니티용 작은 게임과 위젯","بازی‌های کوچک و ابزارک برای جامعه‌ات","Міні-ігри та віджети для твоєї спільноти","Piccoli giochi e widget per la tua community","Małe gry i widżety dla twojej społeczności","Trò chơi nhỏ và tiện ích cho cộng đồng"],
  "Anything with a server, a database or a login": ["任何需要服务器、数据库或登录的东西","कुछ भी जिसमें सर्वर, डेटाबेस या लॉगिन हो","Cualquier cosa con servidor, base de datos o inicio de sesión","أي شيء فيه خادم أو قاعدة بيانات أو تسجيل دخول","Tout ce qui a un serveur, une base ou une connexion","সার্ভার, ডেটাবেস বা লগইন লাগে এমন কিছু","Qualquer coisa com servidor, base de dados ou login","Всё, где нужен сервер, база данных или вход","کوئی بھی چیز جس میں سرور، ڈیٹابیس یا لاگ اِن ہو","Apa pun yang perlu server, basis data, atau login","Alles mit Server, Datenbank oder Login","サーバー・データベース・ログインが要るもの","Sunucu, veritabanı veya giriş gerektiren her şey","서버, 데이터베이스, 로그인이 필요한 것","هر چیزی که سرور، پایگاه‌داده یا ورود بخواهد","Усе, де потрібен сервер, база даних чи вхід","Qualsiasi cosa con server, database o login","Cokolwiek z serwerem, bazą danych lub logowaniem","Bất cứ thứ gì cần máy chủ, cơ sở dữ liệu hay đăng nhập"],
  "Getting into an account that is not yours": ["登入不属于你的账号","किसी और के अकाउंट में घुसना","Entrar en una cuenta que no es tuya","الدخول إلى حساب ليس لك","Entrer dans un compte qui n'est pas le tien","তোমার নয় এমন অ্যাকাউন্টে ঢোকা","Entrar numa conta que não é tua","Вход в чужой аккаунт","کسی اور کے اکاؤنٹ میں داخل ہونا","Masuk ke akun yang bukan milikmu","In ein fremdes Konto kommen","自分のものでないアカウントに入ること","Sana ait olmayan bir hesaba girmek","남의 계정에 들어가기","ورود به حسابی که مال تو نیست","Вхід у чужий обліковий запис","Entrare in un account non tuo","Wchodzenie na cudze konto","Vào tài khoản không phải của bạn"],
  "Downloading videos that are not yours": ["下载不属于你的视频","दूसरों के वीडियो डाउनलोड करना","Descargar vídeos que no son tuyos","تنزيل فيديوهات ليست لك","Télécharger des vidéos qui ne sont pas les tiennes","তোমার নয় এমন ভিডিও ডাউনলোড করা","Descarregar vídeos que não são teus","Скачивание чужих видео","دوسروں کی ویڈیوز ڈاؤن لوڈ کرنا","Mengunduh video yang bukan milikmu","Fremde Videos herunterladen","自分のものでない動画をダウンロードすること","Sana ait olmayan videoları indirmek","남의 영상 내려받기","دانلود ویدیوهایی که مال تو نیستند","Завантаження чужих відео","Scaricare video non tuoi","Pobieranie cudzych filmów","Tải video không phải của bạn"],

  /* ---- the analytics tiles, which every channel page repeats ------------- */
  "Views": ["观看次数","व्यूज़","Visualizaciones","المشاهدات","Vues","ভিউ","Visualizações","Просмотры","ویوز","Penayangan","Aufrufe","再生回数","Görüntülenme","조회수","بازدید","Перегляди","Visualizzazioni","Wyświetlenia","Lượt xem"],
  "Subscribers": ["订阅者","सब्सक्राइबर","Suscriptores","المشتركون","Abonnés","সাবস্ক্রাইবার","Subscritores","Подписчики","سبسکرائبرز","Pelanggan","Abonnenten","登録者","Aboneler","구독자","دنبال‌کننده","Підписники","Iscritti","Subskrybenci","Người đăng ký"],
  "Videos": ["视频数","वीडियो","Vídeos","الفيديوهات","Vidéos","ভিডিও","Vídeos","Видео","ویڈیوز","Video","Videos","動画数","Videolar","영상","ویدیوها","Відео","Video","Filmy","Video"],
  "Total views": ["总观看次数","कुल व्यूज़","Visualizaciones totales","إجمالي المشاهدات","Vues totales","মোট ভিউ","Visualizações totais","Всего просмотров","کل ویوز","Total penayangan","Aufrufe insgesamt","総再生回数","Toplam görüntülenme","총 조회수","کل بازدید","Усього переглядів","Visualizzazioni totali","Łączne wyświetlenia","Tổng lượt xem"],
  "Your channel": ["你的频道","आपका चैनल","Tu canal","قناتك","Ta chaîne","তোমার চ্যানেল","O teu canal","Твой канал","آپ کا چینل","Kanalmu","Dein Kanal","あなたのチャンネル","Kanalın","내 채널","کانال تو","Твій канал","Il tuo canale","Twój kanał","Kênh của bạn"],
  "Last 28 days": ["最近 28 天","पिछले 28 दिन","Últimos 28 días","آخر 28 يومًا","28 derniers jours","গত ২৮ দিন","Últimos 28 dias","Последние 28 дней","پچھلے 28 دن","28 hari terakhir","Letzte 28 Tage","直近28日","Son 28 gün","최근 28일","۲۸ روز گذشته","Останні 28 днів","Ultimi 28 giorni","Ostatnie 28 dni","28 ngày qua"],
  "Performance": ["表现","प्रदर्शन","Rendimiento","الأداء","Performances","পারফরম্যান্স","Desempenho","Показатели","کارکردگی","Performa","Leistung","パフォーマンス","Performans","성과","عملکرد","Показники","Rendimento","Wyniki","Hiệu suất"],
  "Compare": ["对比","तुलना करें","Comparar","قارن","Comparer","তুলনা করো","Comparar","Сравнить","موازنہ کریں","Bandingkan","Vergleichen","比較する","Karşılaştır","비교하기","مقایسه کن","Порівняти","Confronta","Porównaj","So sánh"],
  "Top countries": ["主要国家/地区","शीर्ष देश","Países principales","أهم البلدان","Principaux pays","শীর্ষ দেশ","Principais países","Основные страны","سرفہرست ممالک","Negara teratas","Top-Länder","上位の国","En çok ülkeler","상위 국가","کشورهای برتر","Основні країни","Paesi principali","Główne kraje","Quốc gia hàng đầu"],
  "Who is watching": ["谁在看","कौन देख रहा है","Quién te ve","من يشاهد","Qui regarde","কে দেখছে","Quem está a ver","Кто смотрит","کون دیکھ رہا ہے","Siapa yang menonton","Wer zuschaut","誰が見ているか","Kim izliyor","누가 보고 있는가","چه کسی تماشا می‌کند","Хто дивиться","Chi ti guarda","Kto ogląda","Ai đang xem"],
  "Channel review": ["频道复盘","चैनल समीक्षा","Revisión del canal","مراجعة القناة","Bilan de la chaîne","চ্যানেল পর্যালোচনা","Revisão do canal","Разбор канала","چینل جائزہ","Tinjauan kanal","Kanal-Rückblick","チャンネル診断","Kanal değerlendirmesi","채널 리뷰","مرور کانال","Огляд каналу","Analisi del canale","Przegląd kanału","Đánh giá kênh"],
  "Fair Fight": ["公平对决","फेयर फ़ाइट","Duelo justo","مواجهة عادلة","Duel équitable","ফেয়ার ফাইট","Duelo justo","Честный бой","فیئر فائٹ","Duel Adil","Fairer Vergleich","フェアファイト","Adil Karşılaşma","공정 대결","نبرد منصفانه","Чесний бій","Sfida equa","Uczciwy pojedynek","Đấu công bằng"],

  /* ---- the analytics consent strip, which is on every page --------------- */
  "Yes, that is fine": ["可以，没问题","हाँ, ठीक है","Sí, de acuerdo","نعم، لا بأس","Oui, d'accord","হ্যাঁ, ঠিক আছে","Sim, tudo bem","Да, хорошо","ہاں، ٹھیک ہے","Ya, boleh","Ja, ist in Ordnung","はい、かまいません","Evet, olur","네, 괜찮아요","بله، اشکالی ندارد","Так, гаразд","Sì, va bene","Tak, w porządku","Được, không sao"],
  "No thanks": ["不用了","नहीं, धन्यवाद","No, gracias","لا، شكرًا","Non merci","না, ধন্যবাদ","Não, obrigado","Нет, спасибо","نہیں، شکریہ","Tidak, terima kasih","Nein, danke","いいえ、結構です","Hayır, teşekkürler","괜찮습니다","نه، ممنون","Ні, дякую","No, grazie","Nie, dziękuję","Không, cảm ơn"],
  "What it records": ["它记录了什么","यह क्या रिकॉर्ड करता है","Qué registra","ما الذي يسجّله","Ce qu'il enregistre","এটি কী রেকর্ড করে","O que regista","Что он записывает","یہ کیا ریکارڈ کرتا ہے","Apa yang dicatat","Was aufgezeichnet wird","何を記録するか","Neyi kaydediyor","무엇을 기록하는지","چه چیزی ثبت می‌کند","Що він записує","Cosa registra","Co zapisuje","Nó ghi lại gì"],
  "Classic": ["经典","क्लासिक","Clásico","كلاسيكي","Classique","ক্লাসিক","Clássico","Классика","کلاسک","Klasik","Klassisch","クラシック","Klasik","클래식","کلاسیک","Класика","Classico","Klasyczny","Cổ điển"]
,

    /* ------------------------------------------------------------------
       PORTUGUESE, AND ONLY PORTUGUESE, FOR THE 159 LINES BELOW.

       Measured by walking all 34 pages with the site set to pt and reading
       every visible line: 159 of them were still English, because the text
       is written into the page and was never in a dictionary — which is the
       signature this file was built for. Legal prose on terms.html and
       privacy.html is deliberately still not here, for the reason given at
       the top: it wants a translator, not a dictionary.

       Each row carries nineteen slots and fills one, the seventh, which is
       pt. nova.js looks a phrase up with `ph && ph[cur]`, so an empty slot
       is read as "nothing to say about this language" and the English is
       left exactly as it was: the other eighteen languages are no worse off
       than before, and the row is ready for them.

       European Portuguese: ficheiro not arquivo, ecrã not tela, guardar not
       salvar, transferir not baixar, and tu throughout, because the site
       speaks to a teenager and the other pt strings here already do.
       ------------------------------------------------------------------ */
    "Could not reach the Academy: Failed to fetch": ["","","","","","","Não foi possível contactar a Academia: a ligação falhou","","","","","","","","","","","",""],
    "3 title ideas for a Minecraft build video": ["","","","","","","3 ideias de título para um vídeo de construção em Minecraft","","","","","","","","","","","",""],
    "A 16:9 thumbnail from a one-line description.": ["","","","","","","Uma miniatura 16:9 a partir de uma descrição de uma linha.","","","","","","","","","","","",""],
    "A description and tags that read like a person wrote them.": ["","","","","","","Uma descrição e etiquetas que parecem escritas por uma pessoa.","","","","","","","","","","","",""],
    "Paste what was said, get the moments worth cutting.": ["","","","","","","Cola o que foi dito e recebe os momentos que vale a pena cortar.","","","","","","","","","","","",""],
    "Scores a few titles against each other, with the why.": ["","","","","","","Compara alguns títulos entre si, e explica porquê.","","","","","","","","","","","",""],
    "Three options and a pick, not a paragraph of \"stay consistent\".": ["","","","","","","Três opções e uma escolha, não um parágrafo sobre “ser consistente”.","","","","","","","","","","","",""],
    "Three options and a pick, not a paragraph.": ["","","","","","","Três opções e uma escolha, não um parágrafo.","","","","","","","","","","","",""],
    "how long should a Short be?": ["","","","","","","qual deve ser a duração de um Short?","","","","","","","","","","","",""],
    "Thirty seconds. One target at a time, and they get smaller. Misses count against you, so flailing does not work.": ["","","","","","","Trinta segundos. Um alvo de cada vez, e vão ficando mais pequenos. Os falhanços contam contra ti, por isso clicar à toa não resulta.","","","","","","","","","","","",""],
    "Connect your channel and this fills in with your last twelve months.": ["","","","","","","Liga o teu canal e isto preenche-se com os teus últimos doze meses.","","","","","","","","","","","",""],
    "How many times something of yours started playing.": ["","","","","","","Quantas vezes algo teu começou a ser reproduzido.","","","","","","","","","","","",""],
    "Minutes actually watched — the number YouTube pays attention to.": ["","","","","","","Minutos realmente vistos — o número a que o YouTube presta atenção.","","","","","","","","","","","",""],
    "People who chose to keep seeing you, on the right-hand scale.": ["","","","","","","Pessoas que escolheram continuar a ver-te, na escala da direita.","","","","","","","","","","","",""],
    "Sign in above and this fills with channels close to your own size. Nothing here is a rating of anybody — it is your numbers and theirs, divided by how big each channel is.": ["","","","","","","Inicia sessão acima e isto preenche-se com canais do tamanho do teu. Nada aqui é uma classificação de ninguém — são os teus números e os deles, divididos pelo tamanho de cada canal.","","","","","","","","","","","",""],
    "Or write your own — anything at all": ["","","","","","","Ou escreve a tua — o que quiseres","","","","","","","","","","","",""],
    "What are you making? The Trend Spotter, the idea generator and the AI tutors all answer better when they know. Pick one, or write your own — and change it whenever you like.": ["","","","","","","O que é que fazes? O Radar de Tendências, o gerador de ideias e os tutores de IA respondem melhor quando sabem. Escolhe uma, ou escreve a tua — e muda sempre que quiseres.","","","","","","","","","","","",""],
    "Anything that needs a paid API key it does not have": ["","","","","","","Qualquer coisa que precise de uma chave de API paga que não tem","","","","","","","","","","","",""],
    "Describe a small web thing you want for your channel and it writes it, runs it here, and hands you the file. It will also tell you when what you asked for is not something it can build — which happens a lot, and is more useful than a confident answer that does not work.": ["","","","","","","Descreve uma coisa pequena para a web que queiras para o teu canal e ele escreve-a, corre-a aqui e entrega-te o ficheiro. Também te diz quando o que pediste não é algo que consiga construir — o que acontece muitas vezes, e é mais útil do que uma resposta confiante que não funciona.","","","","","","","","","","","",""],
    "⌘/Ctrl + Enter to run, or the Build button.": ["","","","","","","⌘/Ctrl + Enter para correr, ou o botão Construir.","","","","","","","","","","","",""],
    "Comments everyone can read, friends you actually agreed to, and small groups with their own feed. The rules are short and they are enforced by the server, not by this page.": ["","","","","","","Comentários que todos podem ler, amigos que aceitaste mesmo, e grupos pequenos com o seu próprio mural. As regras são curtas e quem as aplica é o servidor, não esta página.","","","","","","","","","","","",""],
    "You need a NovaClip account before you can post, because a comment has to belong to someone. Make one from the Studio page — it takes a tap and gives you a code to swap with friends.": ["","","","","","","Precisas de uma conta NovaClip antes de publicares, porque um comentário tem de pertencer a alguém. Cria uma na página do Estúdio — demora um toque e dá-te um código para trocares com amigos.","","","","","","","","","","","",""],
    "Select a clip on the timeline to edit its properties": ["","","","","","","Seleciona um clipe na linha de tempo para editar as suas propriedades","","","","","","","","","","","",""],
    "Race the clock. Your best words-per-minute counts towards Progress.": ["","","","","","","Corre contra o relógio. As tuas melhores palavras por minuto contam para o Progresso.","","","","","","","","","","","",""],
    "Add something to the box": ["","","","","","","Põe alguma coisa na caixa","","","","","","","","","","","",""],
    "Everything you type is checked the same way names are. Boxes are for people you actually know. Nothing is uploaded — the link is the box.": ["","","","","","","Tudo o que escreves é verificado da mesma forma que os nomes. As caixas são para pessoas que conheces mesmo. Nada é enviado para lado nenhum — a ligação é a caixa.","","","","","","","","","","","",""],
    "Fill a box with small things for one friend — a note, a doodle, a badge, some of your NovaCoins — then send them a single link. They unwrap it one thing at a time.": ["","","","","","","Enche uma caixa com coisas pequenas para um amigo — um recado, um desenho, um emblema, algumas das tuas NovaMoedas — e envia-lhe uma única ligação. Ele desembrulha uma coisa de cada vez.","","","","","","","","","","","",""],
    "Who is it for?": ["","","","","","","Para quem é?","","","","","","","","","","","",""],
    "It stays on your device. Opening it here uploads nothing.": ["","","","","","","Fica no teu aparelho. Abri-lo aqui não envia nada.","","","","","","","","","","","",""],
    "MP4, WebM or MOV — the finished cut, not the raw footage": ["","","","","","","MP4, WebM ou MOV — o vídeo final, não as imagens em bruto","","","","","","","","","","","",""],
    "Share wins, ask for feedback, hype each other up. Every post is checked automatically — bullying and swearing are blocked before they're ever posted.": ["","","","","","","Partilha vitórias, pede opiniões, dá força aos outros. Todas as publicações são verificadas automaticamente — insultos e palavrões são bloqueados antes de chegarem a ser publicados.","","","","","","","","","","","",""],
    "Go to the home page": ["","","","","","","Ir para a página inicial","","","","","","","","","","","",""],
    "NovaClip could not reach the network, so this page has not been loaded.": ["","","","","","","O NovaClip não conseguiu chegar à rede, por isso esta página não foi carregada.","","","","","","","","","","","",""],
    "Pages you have already opened still work. Anything you were working on is saved on this device and will be there when you are back.": ["","","","","","","As páginas que já abriste continuam a funcionar. O que estavas a fazer fica guardado neste aparelho e estará lá quando voltares.","","","","","","","","","","","",""],
    "You are offline": ["","","","","","","Estás offline","","","","","","","","","","","",""],
    "The checkout was closed before it finished, so no money moved and nothing has changed. Your basket is still where you left it.": ["","","","","","","O pagamento foi fechado antes de terminar, por isso não saiu dinheiro nenhum e nada mudou. O teu cesto continua onde o deixaste.","","","","","","","","","","","",""],
    "Open a picture, or drop one anywhere on this panel. It is decoded in the tab and never uploaded — there is no server in this page at all.": ["","","","","","","Abre uma imagem, ou larga uma em qualquer sítio deste painel. É descodificada no separador e nunca enviada — não há servidor nenhum nesta página.","","","","","","","","","","","",""],
    "Open an image to see layers, adjustments and filters.": ["","","","","","","Abre uma imagem para veres camadas, ajustes e filtros.","","","","","","","","","","","",""],
    "A parent pays for these, and it is their card that is asked for.": ["","","","","","","Quem paga isto é um adulto, e é o cartão dele que é pedido.","","","","","","","","","","","",""],
    "Coins are earned by making things — an export from the Editor is worth more than everything else on the site put together — and they can be bought if somebody would rather not wait. They pay for up to 40% of a lesson in the Academy; the rest is paid for. They never turn back into money.": ["","","","","","","As moedas ganham-se a fazer coisas — uma exportação do Editor vale mais do que tudo o resto do site junto — e podem ser compradas por quem preferir não esperar. Pagam até 40% de uma lição na Academia; o resto é pago a dinheiro. Nunca voltam a ser dinheiro.","","","","","","","","","","","",""],
    "Subscriptions renew every month and can be cancelled any time.": ["","","","","","","As subscrições renovam-se todos os meses e podem ser canceladas a qualquer momento.","","","","","","","","","","","",""],
    "The coin shop needs the community server, which is not reachable from here right now.": ["","","","","","","A loja de moedas precisa do servidor da comunidade, que neste momento não está acessível daqui.","","","","","","","","","","","",""],
    "A PIN on purchases, and limits you set rather than ones we assume.": ["","","","","","","Um PIN nas compras, e limites definidos por ti em vez de limites que nós inventamos.","","","","","","","","","","","",""],
    "Every upload scored on hook, title, thumbnail and consistency, with the one change that would help most.": ["","","","","","","Cada publicação avaliada no gancho, no título, na miniatura e na constância, com a única mudança que mais ajudaria.","","","","","","","","","","","",""],
    "Export up to 10 minutes instead of 60 seconds, at full quality.": ["","","","","","","Exporta até 10 minutos em vez de 60 segundos, com qualidade máxima.","","","","","","","","","","","",""],
    "For the parent": ["","","","","","","Para quem é pai ou mãe","","","","","","","","","","","",""],
    "Here is exactly what you are paying for and where to find each part of it.": ["","","","","","","Aqui está exatamente aquilo que estás a pagar e onde encontrar cada parte.","","","","","","","","","","","",""],
    "Scans comments on their videos and alerts you, with one-tap reporting to YouTube.": ["","","","","","","Analisa os comentários nos vídeos dele e avisa-te, com denúncia ao YouTube num toque.","","","","","","","","","","","",""],
    "The free editor stamps finished videos. This takes it off.": ["","","","","","","O editor gratuito marca os vídeos terminados. Isto tira essa marca.","","","","","","","","","","","",""],
    "The full effects shelf rather than the free four.": ["","","","","","","A prateleira de efeitos completa em vez dos quatro gratuitos.","","","","","","","","","","","",""],
    "The tutors think for longer and answer in more depth instead of giving you the short version.": ["","","","","","","Os tutores pensam durante mais tempo e respondem com mais profundidade, em vez de te darem a versão curta.","","","","","","","","","","","",""],
    "What the plan unlocks": ["","","","","","","O que o plano desbloqueia","","","","","","","","","","","",""],
    "What your child actually used this week — time, tools, and what they made.": ["","","","","","","O que o teu filho usou mesmo esta semana — tempo, ferramentas e o que fez.","","","","","","","","","","","",""],
    "You have the full bundle, so everything above is on.": ["","","","","","","Tens o pacote completo, por isso está tudo o que está acima ligado.","","","","","","","","","","","",""],
    "Fills in your name and picture, and signs you in to Studio at the same time so it does not ask again.": ["","","","","","","Preenche o teu nome e a tua imagem, e inicia a sessão no Estúdio ao mesmo tempo para não voltar a perguntar.","","","","","","","","","","","",""],
    "It does not replace your password, and it is not how you get in on a different device — your NOVA-XXXX-XXXX code is still the only thing that moves the account. Nothing is posted to Google; NovaClip only reads the name and picture on your account.": ["","","","","","","Não substitui a tua palavra-passe, e não é assim que entras noutro aparelho — o teu código NOVA-XXXX-XXXX continua a ser a única coisa que move a conta. Nada é publicado no Google; o NovaClip só lê o nome e a imagem da tua conta.","","","","","","","","","","","",""],
    "Pick a name and a password. Nothing that says who you are.": ["","","","","","","Escolhe um nome e uma palavra-passe. Nada que diga quem tu és.","","","","","","","","","","","",""],
    "Read this bit. A password here is not a stronger lock than the recovery code — both open the same account. It is a way in you can remember. There is no email on file, so nobody can reset it for you: if you forget it, the code is what gets you back in.": ["","","","","","","Lê esta parte. Uma palavra-passe aqui não é um cadeado mais forte do que o código de recuperação — ambos abrem a mesma conta. É uma forma de entrar de que te consegues lembrar. Não há email nenhum guardado, por isso ninguém ta pode repor: se a esqueceres, é o código que te faz voltar a entrar.","","","","","","","","","","","",""],
    "Sign in with the code": ["","","","","","","Entrar com o código","","","","","","","","","","","",""],
    "The way that has always worked. No profile needed.": ["","","","","","","A forma que sempre funcionou. Não é preciso perfil nenhum.","","","","","","","","","","","",""],
    "← Back to the site": ["","","","","","","← Voltar ao site","","","","","","","","","","","",""],
    "Nothing is uploaded and nothing is published. The numbers are read once, kept on this device, and used here and on the parent dashboard.": ["","","","","","","Nada é enviado e nada é publicado. Os números são lidos uma vez, ficam neste aparelho e são usados aqui e no painel dos pais.","","","","","","","","","","","",""],
    "See the certificates and their requirements →": ["","","","","","","Ver os certificados e os seus requisitos →","","","","","","","","","","","",""],
    "This level is your channel, not your points — the coins and the bar above are what you have done on NovaClip, and they are a different thing. Connect your YouTube channel in Studio and this fills in.": ["","","","","","","Este nível é o teu canal, não os teus pontos — as moedas e a barra acima são o que fizeste no NovaClip, e são coisas diferentes. Liga o teu canal do YouTube no Estúdio e isto preenche-se.","","","","","","","","","","","",""],
    "Your points, the rewards they unlock, and the milestones you have passed.": ["","","","","","","Os teus pontos, as recompensas que desbloqueiam e as metas por que já passaste.","","","","","","","","","","","",""],
    "A plan you carry out in the Editor. It only ever suggests tools that exist here.": ["","","","","","","Um plano que executas no Editor. Só sugere ferramentas que existem aqui.","","","","","","","","","","","",""],
    "Add to the schedule": ["","","","","","","Juntar ao calendário","","","","","","","","","","","",""],
    "Grabbed from the clip at the moment you choose, with your text over it.": ["","","","","","","Tirada do clipe no momento que escolheres, com o teu texto por cima.","","","","","","","","","","","",""],
    "It stays on your device. Nothing is uploaded by opening it here.": ["","","","","","","Fica no teu aparelho. Abri-lo aqui não envia nada.","","","","","","","","","","","",""],
    "Pick a time. Read the note underneath before you rely on it.": ["","","","","","","Escolhe uma hora. Lê a nota em baixo antes de contares com isso.","","","","","","","","","","","",""],
    "Pick per job. You can change your mind on any of them afterwards.": ["","","","","","","Escolhe para cada tarefa. Podes mudar de ideias em qualquer uma delas depois.","","","","","","","","","","","",""],
    "Text on it (short — it is read at the size of a stamp)": ["","","","","","","Texto por cima (curto — é lido do tamanho de um selo)","","","","","","","","","","","",""],
    "The frame and the text on it.": ["","","","","","","A imagem e o texto por cima dela.","","","","","","","","","","","",""],
    "What is the video about?": ["","","","","","","De que é que fala o vídeo?","","","","","","","","","","","",""],
    "Written for you, or by you. The counters are YouTube's real limits.": ["","","","","","","Escrito para ti, ou por ti. Os contadores são os limites verdadeiros do YouTube.","","","","","","","","","","","",""],
    "Wait for green, then press. Five goes — the middle one is your score, because a single lucky go is not a reflex.": ["","","","","","","Espera pelo verde e carrega. Cinco tentativas — a do meio é a tua pontuação, porque uma única tentativa com sorte não é um reflexo.","","","","","","","","","","","",""],
    "A mistake in the age question, something broken, or something that did not feel right. A person reads these.": ["","","","","","","Um erro na pergunta da idade, alguma coisa avariada, ou algo que não te pareceu bem. Isto é lido por uma pessoa.","","","","","","","","","","","",""],
    "What is it about?": ["","","","","","","É sobre o quê?","","","","","","","","","","","",""],
    "Your email, if you want a reply": ["","","","","","","O teu email, se quiseres resposta","","","","","","","","","","","",""],
    "Click Load unpacked, and choose the novaclip-family-shield folder you unzipped.": ["","","","","","","Clica em Carregar expandida e escolhe a pasta novaclip-family-shield que descompactaste.","","","","","","","","","","","",""],
    "Going this way you get the entire site, and the folder you want is the one called extension inside it — not the whole download. That extra step is exactly what the button above exists to remove.": ["","","","","","","Por este caminho recebes o site inteiro, e a pasta que queres é a que se chama extension lá dentro — não a transferência toda. Esse passo a mais é exatamente o que o botão acima existe para evitar.","","","","","","","","","","","",""],
    "It does not watch the video, so a clean title on a bad video can still get through. It is a filter, not a guarantee, and it is not a substitute for knowing what your kid watches.": ["","","","","","","Não vê o vídeo, por isso um título limpo num vídeo mau ainda pode passar. É um filtro, não uma garantia, e não substitui saber o que o teu filho vê.","","","","","","","","","","","",""],
    "One folder, about 40 KB. It is not on the Chrome Web Store yet, so it installs the way extensions are installed before they are listed — nothing unusual, and nothing to pay.": ["","","","","","","Uma pasta, cerca de 40 KB. Ainda não está na Chrome Web Store, por isso instala-se como se instalam as extensões antes de serem listadas — nada de invulgar e nada a pagar.","","","","","","","","","","","",""],
    "Only needed if the automatic pairing cannot happen — for example if you are reading this on a different computer from the one the shield is installed on. On the Chrome extensions page, the shield's ID is the long string of letters under its name.": ["","","","","","","Só é preciso se o emparelhamento automático não acontecer — por exemplo, se estiveres a ler isto num computador diferente daquele onde o escudo está instalado. Na página de extensões do Chrome, o ID do escudo é aquela longa sequência de letras por baixo do nome.","","","","","","","","","","","",""],
    "The download did not work / I would rather get it from GitHub": ["","","","","","","A transferência não resultou / prefiro obtê-lo no GitHub","","","","","","","","","","","",""],
    "The shield is not installed yet.This strip turns green on its own the moment it is — leave the page open while you install.": ["","","","","","","O escudo ainda não está instalado. Esta faixa fica verde sozinha assim que estiver — deixa a página aberta enquanto instalas.","","","","","","","","","","","",""],
    "The shield reads the text a platform puts on screen — titles, channel names, descriptions, search terms — on YouTube, TikTok, Instagram and Twitch, and hides or blocks what matches your rules. That covers the three ways a child actually reaches bad content: searching for it, being recommended it, and clicking it.": ["","","","","","","O escudo lê o texto que a plataforma põe no ecrã — títulos, nomes de canais, descrições, termos de pesquisa — no YouTube, TikTok, Instagram e Twitch, e esconde ou bloqueia o que corresponder às tuas regras. Isso cobre as três formas por que uma criança chega mesmo a conteúdo mau: procurá-lo, ser-lhe recomendado e clicar nele.","","","","","","","","","","","",""],
    "Turn on Developer mode — the switch in the top right corner.": ["","","","","","","Liga o Modo de programador — o interruptor no canto superior direito.","","","","","","","","","","","",""],
    "What it does, and what it does not": ["","","","","","","O que faz, e o que não faz","","","","","","","","","","","",""],
    "← Back to the Family Dashboard": ["","","","","","","← Voltar ao Painel da Família","","","","","","","","","","","",""],
    "A youth-first community for making things, studying and asking.": ["","","","","","","Uma comunidade feita primeiro para jovens, para criar, estudar e perguntar.","","","","","","","","","","","",""],
    "No clubs yet. Start one from the Clubs tab.": ["","","","","","","Ainda não há clubes. Começa um no separador Clubes.","","","","","","","","","","","",""],
    "No posts in this channel. Be the first — that is genuinely how every one of these starts.": ["","","","","","","Não há publicações neste canal. Sê o primeiro — é mesmo assim que cada um destes começa.","","","","","","","","","","","",""],
    "Show your edits, code, art and music, join a focus room, swap advice that is actually useful, and find people working on the same thing you are.": ["","","","","","","Mostra as tuas edições, código, arte e música, entra numa sala de foco, troca conselhos que sirvam mesmo para alguma coisa, e encontra pessoas a trabalhar no mesmo que tu.","","","","","","","","","","","",""],
    "Somebody out there is stuck on exactly the thing you worked out last week.": ["","","","","","","Há alguém por aí preso exatamente naquilo que tu resolveste a semana passada.","","","","","","","","","","","",""],
    "Twenty-five minutes on, five off. The clock runs off the wall, so it stays right even when the tab is in the background.": ["","","","","","","Vinte e cinco minutos a trabalhar, cinco de pausa. O relógio conta pelo relógio da parede, por isso continua certo mesmo com o separador em segundo plano.","","","","","","","","","","","",""],
    "Vibe of the day": ["","","","","","","Vibe do dia","","","","","","","","","","","",""],
    "Generated here in the tab rather than downloaded — no files, and it works with no connection at all.": ["","","","","","","Gerado aqui no separador em vez de transferido — sem ficheiros, e funciona sem ligação nenhuma.","","","","","","","","","","","",""],
    "The clock keeps time from the wall, not from a counter, so it stays right even when the tab is in the background and the browser slows it down.": ["","","","","","","O relógio conta o tempo pelo relógio da parede, não por um contador, por isso continua certo mesmo quando o separador está em segundo plano e o navegador o abranda.","","","","","","","","","","","",""],
    "Twenty-five minutes on, five off. A list of what you are actually doing, and quiet sound if the room is too loud. Everything here stays on this device.": ["","","","","","","Vinte e cinco minutos a trabalhar, cinco de pausa. Uma lista do que estás mesmo a fazer, e som calmo se a sala estiver barulhenta. Tudo isto fica neste aparelho.","","","","","","","","","","","",""],
    "What you mean to get through. Kept between visits, so an unfinished list is still here tomorrow.": ["","","","","","","O que queres despachar. Fica guardado entre visitas, por isso uma lista por acabar continua aqui amanhã.","","","","","","","","","","","",""],
    "10,003 tools, all of them running in this tab.": ["","","","","","","10 003 ferramentas, todas a correr neste separador.","","","","","","","","","","","",""],
    "16, 32, 48, 180 and 512 px from one image, downloaded together.": ["","","","","","","16, 32, 48, 180 e 512 px a partir de uma imagem, transferidos juntos.","","","","","","","","","","","",""],
    "A to Z, by length, reversed or shuffled — and drop repeats.": ["","","","","","","De A a Z, por comprimento, ao contrário ou baralhado — e remove repetidos.","","","","","","","","","","","",""],
    "Across the whole text, with regular expressions if you want them.": ["","","","","","","Em todo o texto, com expressões regulares se as quiseres.","","","","","","","","","","","",""],
    "Because that is what you said you make. Everything else is below, and you can change your category any time from Categories.": ["","","","","","","Porque foi isso que disseste que fazes. Está tudo o resto mais abaixo, e podes mudar de categoria quando quiseres em Categorias.","","","","","","","","","","","",""],
    "Binary, octal, decimal and hex, all at once.": ["","","","","","","Binário, octal, decimal e hexadecimal, tudo ao mesmo tempo.","","","","","","","","","","","",""],
    "Build a gradient and copy the CSS.": ["","","","","","","Cria um gradiente e copia o CSS.","","","","","","","","","","","",""],
    "Complementary, triadic, analogous and shades from one colour.": ["","","","","","","Complementares, triádicas, análogas e tons a partir de uma cor.","","","","","","","","","","","",""],
    "Dial in a shadow and take the rule.": ["","","","","","","Afina uma sombra e leva a regra.","","","","","","","","","","","",""],
    "Drop a clip in and it plans the edit, applies it, and writes the title, description and tags.": ["","","","","","","Larga um clipe e ele planeia a edição, aplica-a e escreve o título, a descrição e as etiquetas.","","","","","","","","","","","",""],
    "Escape and unescape &, <, quotes and the rest.": ["","","","","","","Escapa e desescapa &, <, aspas e o resto.","","","","","","","","","","","",""],
    "Exact age in years, months and days, plus the next birthday.": ["","","","","","","Idade exata em anos, meses e dias, mais o próximo aniversário.","","","","","","","","","","","",""],
    "Fit any size to 16:9, 9:16 or 1:1, and a sane bitrate for the result.": ["","","","","","","Ajusta qualquer tamanho a 16:9, 9:16 ou 1:1, e uma taxa de bits sensata para o resultado.","","","","","","","","","","","",""],
    "HEX, RGB and HSL together, with a swatch.": ["","","","","","","HEX, RGB e HSL juntos, com amostra de cor.","","","","","","","","","","","",""],
    "Headings, bold, links, lists and code to HTML.": ["","","","","","","Títulos, negrito, ligações, listas e código para HTML.","","","","","","","","","","","",""],
    "How big a render will be, from length, bitrate and audio.": ["","","","","","","O tamanho que uma exportação vai ter, a partir da duração, da taxa de bits e do áudio.","","","","","","","","","","","",""],
    "Live count against the real caps for YouTube, TikTok, X and the rest.": ["","","","","","","Contagem ao vivo contra os limites verdadeiros do YouTube, TikTok, X e os restantes.","","","","","","","","","","","",""],
    "Live matches, groups and a count, with the usual flags.": ["","","","","","","Correspondências ao vivo, grupos e contagem, com as marcas do costume.","","","","","","","","","","","",""],
    "Mean, median, mode, range and standard deviation from a list.": ["","","","","","","Média, mediana, moda, amplitude e desvio-padrão a partir de uma lista.","","","","","","","","","","","",""],
    "One moment, shown in the zones you care about.": ["","","","","","","Um momento, mostrado nos fusos que te interessam.","","","","","","","","","","","",""],
    "Paint over what you want gone and the surrounding texture is grown in over it.": ["","","","","","","Pinta por cima do que queres tirar e a textura à volta é recriada por cima.","","","","","","","","","","","",""],
    "Percent of, change between, and what percent one number is of another.": ["","","","","","","Percentagem de, variação entre, e que percentagem um número é de outro.","","","","","","","","","","","",""],
    "Photograph a character you drew, drop a skeleton on it, and it walks, waves or dances.": ["","","","","","","Fotografa uma personagem que desenhaste, põe-lhe um esqueleto, e ela anda, acena ou dança.","","","","","","","","","","","",""],
    "Pick winners from a list, or roll numbers. No repeats unless you ask.": ["","","","","","","Escolhe vencedores de uma lista, ou lança números. Sem repetições, a não ser que peças.","","","","","","","","","","","",""],
    "Pretty-print, minify and validate — with the position of the error.": ["","","","","","","Formata, minifica e valida — com a posição do erro.","","","","","","","","","","","",""],
    "RFC 4122 v4 identifiers from the browser crypto source.": ["","","","","","","Identificadores RFC 4122 v4 a partir da fonte criptográfica do navegador.","","","","","","","","","","","",""],
    "Read the header, payload and expiry of a token. Nothing is sent anywhere.": ["","","","","","","Lê o cabeçalho, o conteúdo e a validade de um token. Não é enviado nada para lado nenhum.","","","","","","","","","","","",""],
    "Reduce a ratio and scale it to any side.": ["","","","","","","Simplifica uma proporção e ajusta-a a qualquer lado.","","","","","","","","","","","",""],
    "SHA-1, SHA-256, SHA-384 and SHA-512 from the browser crypto engine.": ["","","","","","","SHA-1, SHA-256, SHA-384 e SHA-512 a partir do motor criptográfico do navegador.","","","","","","","","","","","",""],
    "See where the duration badge and UI cover your thumbnail.": ["","","","","","","Vê onde o selo de duração e a interface tapam a tua miniatura.","","","","","","","","","","","",""],
    "Split a URL into its parts and every parameter.": ["","","","","","","Divide um URL nas suas partes e em cada parâmetro.","","","","","","","","","","","",""],
    "Strong passwords with real entropy, and how long a crack would take.": ["","","","","","","Palavras-passe fortes com entropia a sério, e quanto tempo demoraria a quebrá-las.","","","","","","","","","","","",""],
    "Tagged campaign links that analytics can actually group.": ["","","","","","","Ligações de campanha etiquetadas que as estatísticas conseguem mesmo agrupar.","","","","","","","","","","","",""],
    "Text to Base64 and back, UTF-8 safe.": ["","","","","","","Texto para Base64 e de volta, seguro em UTF-8.","","","","","","","","","","","",""],
    "Trade quality for size and see the saving before you download.": ["","","","","","","Troca qualidade por tamanho e vê a poupança antes de transferires.","","","","","","","","","","","",""],
    "Turn a rough list into a valid chapter block — the rules are strict.": ["","","","","","","Transforma uma lista à bruta num bloco de capítulos válido — as regras são rígidas.","","","","","","","","","","","",""],
    "Turn a title into a clean URL slug, accents folded.": ["","","","","","","Transforma um título num URL limpo, sem acentos.","","","","","","","","","","","",""],
    "Unix seconds or milliseconds to a readable date, and back.": ["","","","","","","Segundos ou milissegundos Unix para uma data legível, e ao contrário.","","","","","","","","","","","",""],
    "What a view is worth, and what a sponsor slot should cost.": ["","","","","","","Quanto vale uma visualização, e quanto deve custar um espaço de patrocínio.","","","","","","","","","","","",""],
    "Your rate, and how it reads against the usual band.": ["","","","","","","A tua taxa, e como fica face à faixa do costume.","","","","","","","","","","","",""],
    "No scans yet. Open Trend Spotter and scan your first niche.": ["","","","","","","Ainda não há análises. Abre o Radar de Tendências e analisa o teu primeiro nicho.","","","","","","","","","","","",""],
    "NovaClip turns trends into scripts, thumbnails and publish-ready videos — so you always know exactly what to make next.": ["","","","","","","O NovaClip transforma tendências em guiões, miniaturas e vídeos prontos a publicar — para saberes sempre exatamente o que fazer a seguir.","","","","","","","","","","","",""],
    "37 achievements track every milestone. Unlock them all and prove your typing pedigree.": ["","","","","","","37 conquistas acompanham cada marco. Desbloqueia-as todas e prova o teu pedigree a escrever.","","","","","","","","","","","",""],
    "9 themes, custom cursors, keyboards, avatars, backgrounds and badges. Earn coins to personalize.": ["","","","","","","9 temas, cursores personalizados, teclados, avatares, fundos e emblemas. Ganha moedas para personalizar.","","","","","","","","","","","",""],
    "A taste of the lineup.": ["","","","","","","Uma amostra do alinhamento.","","","","","","","","","","","",""],
    "A typing speed test with real stakes — 13 game modes, 5 difficulty levels, daily challenges, achievements and global leaderboards. All free, all offline-ready.": ["","","","","","","Um teste de velocidade a escrever com algo em jogo — 13 modos de jogo, 5 níveis de dificuldade, desafios diários, conquistas e tabelas globais. Tudo grátis, tudo pronto a funcionar offline.","","","","","","","","","","","",""],
    "Choose a game mode, difficulty, language and duration that fit your goal for the session.": ["","","","","","","Escolhe o modo de jogo, a dificuldade, a língua e a duração que encaixam no teu objetivo para a sessão.","","","","","","","","","","","",""],
    "Classic, Words, Speed Run, Code, Zen, Sudden Death and more. There is a mode for every mood.": ["","","","","","","Clássico, Palavras, Corrida, Código, Zen, Morte Súbita e mais. Há um modo para cada estado de espírito.","","","","","","","","","","","",""],
    "Earn XP and coins, unlock achievements, beat your records and climb the leaderboard.": ["","","","","","","Ganha XP e moedas, desbloqueia conquistas, bate os teus recordes e sobe na tabela.","","","","","","","","","","","",""],
    "Everything runs locally and works without a connection. Your progress is always saved.": ["","","","","","","Corre tudo localmente e funciona sem ligação. O teu progresso fica sempre guardado.","","","","","","","","","","","",""],
    "From Easy warm-ups to Insane punishment. XP rewards scale with the risk you take.": ["","","","","","","Do aquecimento Fácil ao castigo Insano. As recompensas de XP crescem com o risco que corres.","","","","","","","","","","","",""],
    "It takes two minutes to discover how fast you already are.": ["","","","","","","Demora dois minutos a descobrir a velocidade a que já escreves.","","","","","","","","","","","",""],
    "One platform, every kind of typer": ["","","","","","","Uma plataforma, todos os tipos de dactilógrafo","","","","","","","","","","","",""],
    "Race against your personal bests and climb the daily, weekly and all-time rankings.": ["","","","","","","Corre contra os teus melhores resultados e sobe nas tabelas diária, semanal e de sempre.","","","","","","","","","","","",""],
    "Stay accurate and keep your combo alive. Errors punish you, streaks reward you.": ["","","","","","","Mantém-te certeiro e não percas o combo. Os erros castigam-te, as sequências recompensam-te.","","","","","","","","","","","",""],
    "Three fresh challenges every day. Keep your streak alive and stack the rewards.": ["","","","","","","Três desafios novos todos os dias. Mantém a tua sequência viva e acumula as recompensas.","","","","","","","","","","","",""],
    "Whether you are chasing a personal best, drilling your weak keys, or grinding leaderboards — TypeMaster adapts to the way you practice.": ["","","","","","","Quer estejas atrás de um recorde pessoal, a treinar as teclas fracas ou a moer nas tabelas — o TypeMaster adapta-se à forma como praticas.","","","","","","","","","","","",""],
    "Every NovaClip certificate carries a number. Type it in and this page says who it was issued to, which certificate it is, and the day it was issued — straight from our own records. If what comes back does not match the document in front of you, the document is not one of ours.": ["","","","","","","Cada certificado NovaClip tem um número. Escreve-o aqui e esta página diz a quem foi passado, qual é o certificado e o dia em que foi emitido — diretamente dos nossos próprios registos. Se o que aparecer não corresponder ao documento à tua frente, o documento não é nosso.","","","","","","","","","","","",""],

    /* The same pass, one level down: these are the nodes the walker itself
       reads, which is not always a whole sentence. A <b> or an <a> in the
       middle of a line splits it into separate text nodes, and each one is
       looked up alone — so the key here is the fragment, exactly as it comes
       out of the page, punctuation and leading comma included. */
    "is posting daily worth it?": ["","","","","","","vale a pena publicar todos os dias?","","","","","","","","","","","",""],
    "Where the answers come from.": ["","","","","","","De onde vêm as respostas.","","","","","","","","","","","",""],
    "Every tool here goes through the same": ["","","","","","","Todas as ferramentas aqui passam pelo mesmo","","","","","","","","","","","",""],
    "Check anything it tells you about numbers.": ["","","","","","","Confirma tudo o que te disser sobre números.","","","","","","","","","","","",""],
    "It is told not to invent statistics and it mostly does not, but \"mostly\" is not \"never\", and a made-up figure looks exactly like a real one.": ["","","","","","","Está instruída para não inventar estatísticas e na maior parte das vezes não inventa, mas “na maior parte” não é “nunca”, e um número inventado é igualzinho a um verdadeiro.","","","","","","","","","","","",""],
    "Nothing answered at that address. Either the worker is not deployed, or it is not sending the CORS header the browser needs.": ["","","","","","","Não houve resposta nesse endereço. Ou o worker não está publicado, ou não está a enviar o cabeçalho CORS de que o navegador precisa.","","","","","","","","","","","",""],
    "Your edit is done.": ["","","","","","","A tua edição está pronta.","","","","","","","","","","","",""],
    "Now make it hold.": ["","","","","","","Agora faz com que prenda.","","","","","","","","","","","",""],
    "Drop your edited video here, or click to choose": ["","","","","","","Larga aqui o teu vídeo editado, ou clica para escolher","","","","","","","","","","","",""],
    "Be kind. Harassment or swearing gives you a strike —": ["","","","","","","Sê porreiro. Assédio ou palavrões dão-te uma falta —","","","","","","","","","","","",""],
    "three strikes is a 7-day suspension": ["","","","","","","três faltas são 7 dias de suspensão","","","","","","","","","","","",""],
    "Coins are earned by making things — an export from the Editor is worth more than everything else on the site put together — and they can be bought if somebody would rather not wait. They pay for up to": ["","","","","","","As moedas ganham-se a fazer coisas — uma exportação do Editor vale mais do que tudo o resto do site junto — e podem ser compradas por quem preferir não esperar. Pagam até","","","","","","","","","","","",""],
    "of a lesson in the Academy; the rest is paid for. They never turn back into money.": ["","","","","","","de uma lição na Academia; o resto é pago a dinheiro. Nunca voltam a ser dinheiro.","","","","","","","","","","","",""],
    "replace your password, and it is not how you get in on a different device — your": ["","","","","","","substitui a tua palavra-passe, e não é assim que entras noutro aparelho — o teu código","","","","","","","","","","","",""],
    "code is still the only thing that moves the account. Nothing is posted to Google; NovaClip only reads the name and picture on your account.": ["","","","","","","continua a ser a única coisa que move a conta. Nada é publicado no Google; o NovaClip só lê o nome e a imagem da tua conta.","","","","","","","","","","","",""],
    "A password here is not a stronger lock than the recovery code — both open the same account. It is a way in you can remember. There is no email on file, so": ["","","","","","","Uma palavra-passe aqui não é um cadeado mais forte do que o código de recuperação — ambos abrem a mesma conta. É uma forma de entrar de que te consegues lembrar. Não há email nenhum guardado, por isso","","","","","","","","","","","",""],
    "nobody can reset it for you": ["","","","","","","ninguém ta pode repor","","","","","","","","","","","",""],
    ": if you forget it, the code is what gets you back in.": ["","","","","","",": se a esqueceres, é o código que te faz voltar a entrar.","","","","","","","","","","","",""],
    "This level is your": ["","","","","","","Este nível é o teu","","","","","","","","","","","",""],
    ", not your points — the coins and the bar above are what you have done on NovaClip, and they are a different thing. Connect your YouTube channel in Studio and this fills in.": ["","","","","","",", não os teus pontos — as moedas e a barra acima são o que fizeste no NovaClip, e são coisas diferentes. Liga o teu canal do YouTube no Estúdio e isto preenche-se.","","","","","","","","","","","",""],
    "What each certificate takes, and how far along you are, now lives beside what each one costs.": ["","","","","","","O que cada certificado exige, e o teu progresso em cada um, está agora ao lado do que cada um custa.","","","","","","","","","","","",""],
    "Drop a video here, or click to choose one": ["","","","","","","Larga aqui um vídeo, ou clica para escolher um","","","","","","","","","","","",""],
    "When it goes out": ["","","","","","","Quando sai","","","","","","","","","","","",""],
    "What this schedule is, honestly.": ["","","","","","","O que este calendário é, com honestidade.","","","","","","","","","","","",""],
    "in Studio — that runs on their servers, and it works.": ["","","","","","","no Estúdio — isso corre nos servidores deles, e funciona.","","","","","","","","","","","",""],
    "This opens your email app with the report written out, so you can see exactly what is being sent before you send it. Nothing leaves this page on its own. If the button does nothing, email": ["","","","","","","Isto abre a tua aplicação de email com a denúncia já escrita, para veres exatamente o que vai ser enviado antes de enviares. Nada sai desta página sozinho. Se o botão não fizer nada, envia um email para","","","","","","","","","","","",""],
    "The shield is not installed yet.": ["","","","","","","O escudo ainda não está instalado.","","","","","","","","","","","",""],
    "This strip turns green on its own the moment it is — leave the page open while you install.": ["","","","","","","Esta faixa fica verde sozinha assim que estiver — deixa a página aberta enquanto instalas.","","","","","","","","","","","",""],
    "You get a file called": ["","","","","","","Vais receber um ficheiro chamado","","","","","","","","","","","",""],
    ". That folder is the whole thing; there is nothing to find inside it.": ["","","","","","",". Essa pasta é tudo; não há nada para procurar lá dentro.","","","","","","","","","","","",""],
    "Going this way you get the entire site, and the folder you want is the one called": ["","","","","","","Por este caminho recebes o site inteiro, e a pasta que queres é a que se chama","","","","","","","","","","","",""],
    "inside it — not the whole download. That extra step is exactly what the button above exists to remove.": ["","","","","","","lá dentro — não a transferência toda. Esse passo a mais é exatamente o que o botão acima existe para evitar.","","","","","","","","","","","",""],
    "Add it to your browser": ["","","","","","","Adiciona-o ao teu navegador","","","","","","","","","","","",""],
    "Open the extensions page. It cannot be opened from a link — Chrome does not allow it — so copy the address and paste it into the address bar:": ["","","","","","","Abre a página de extensões. Não pode ser aberta a partir de uma ligação — o Chrome não deixa — por isso copia o endereço e cola-o na barra de endereços:","","","","","","","","","","","",""],
    "— the switch in the top right corner.": ["","","","","","","— o interruptor no canto superior direito.","","","","","","","","","","","",""],
    ", and choose the": ["","","","","","",", e escolhe a","","","","","","","","","","","",""],
    "Edge and Brave work exactly the same way, with": ["","","","","","","O Edge e o Brave funcionam exatamente da mesma maneira, com","","","","","","","","","","","",""],
    ". Firefox and Safari use a different extension format and are not supported yet.": ["","","","","","",". O Firefox e o Safari usam um formato de extensão diferente e ainda não são suportados.","","","","","","","","","","","",""],
    "Back on the Family Dashboard, unlock with your PIN, choose the age profile and the categories, then press": ["","","","","","","De volta ao Painel da Família, desbloqueia com o teu PIN, escolhe o perfil de idade e as categorias, e depois carrega em","","","","","","","","","","","",""],
    "Save and send to the shield": ["","","","","","","Guardar e enviar para o escudo","","","","","","","","","","","",""],
    "For creators aged 13–18 • nothing here is sent to advertisers": ["","","","","","","Para criadores dos 13 aos 18 • nada aqui é enviado a anunciantes","","","","","","","","","","","",""],
    "Why there is nobody else in here.": ["","","","","","","Porque é que não está aqui mais ninguém.","","","","","","","","","","","",""],
    "The design this came from has a list of study buddies to sit and work with over voice chat. NovaClip has no server to match people through, so that list could only be invented names — and putting thirteen-year-olds in a voice call with a stranger is not something to ship without moderation behind it. The timer, the list and the sound all work on their own, so that is what this is.": ["","","","","","","O desenho de onde isto veio tem uma lista de colegas de estudo para te sentares a trabalhar com eles em chamada de voz. O NovaClip não tem servidor nenhum para juntar pessoas, por isso essa lista só poderia ter nomes inventados — e pôr miúdos de treze anos numa chamada de voz com um desconhecido não é coisa para lançar sem moderação por trás. O temporizador, a lista e o som funcionam todos sozinhos, e por isso é isso que isto é.","","","","","","","","","","","",""],
    "tools, all of them running in this tab.": ["","","","","","","ferramentas, todas a correr neste separador.","","","","","","","","","","","",""],
    "Remove something from a photo": ["","","","","","","Tirar alguma coisa de uma fotografia","","","","","","","","","","","",""],
    "Ten title options for a video, from the assistant that knows your channel.": ["","","","","","","Dez opções de título para um vídeo, do assistente que conhece o teu canal.","","","","","","","","","","","",""],
    "A description with timestamps and a tag set, written for your video.": ["","","","","","","Uma descrição com marcações de tempo e um conjunto de etiquetas, escrita para o teu vídeo.","","","","","","","","","","","",""],
    "Openings that stop the scroll, rewritten until one lands.": ["","","","","","","Aberturas que travam o deslizar, reescritas até uma resultar.","","","","","","","","","","","",""],
    "Which letters and words a piece of text leans on.": ["","","","","","","Em que letras e palavras um texto se apoia.","","","","","","","","","","","",""],
    "Flesch reading ease and the school year it maps to.": ["","","","","","","Facilidade de leitura Flesch e o ano de escolaridade a que corresponde.","","","","","","","","","","","",""],
    "Type the mirror of the text": ["","","","","","","Escreve o espelho do texto","","","","","","","","","","","",""],
    "Why a number and not a seal.": ["","","","","","","Porquê um número e não um selo.","","","","","","","","","","","",""],
    "A certificate is a document, and any document can be copied or edited. What cannot be copied is the number: it is calculated from the holder’s name, the certificate and the date, using a key that exists only on our server. Change the name on a certificate and its number stops matching it. Invent a number and it belongs to nobody. Neither can be worked out from the certificate itself.": ["","","","","","","Um certificado é um documento, e qualquer documento pode ser copiado ou alterado. O que não pode ser copiado é o número: é calculado a partir do nome de quem o recebeu, do certificado e da data, com uma chave que só existe no nosso servidor. Muda o nome num certificado e o número deixa de corresponder. Inventa um número e ele não pertence a ninguém. Nem um nem outro se conseguem deduzir a partir do próprio certificado.","","","","","","","","","","","",""],
    "What this page does not tell you.": ["","","","","","","O que esta página não te diz.","","","","","","","","","","","",""],
    "Only the three things printed on the certificate. No points, no history, no account. And it cannot tell you that the person holding a certificate is the person named on it — no certificate ever could.": ["","","","","","","Apenas as três coisas impressas no certificado. Sem pontos, sem histórico, sem conta. E não te consegue dizer que a pessoa que tem o certificado é a pessoa nele nomeada — nenhum certificado alguma vez conseguiu.","","","","","","","","","","","",""]
  };

  /* ------------------------------------------------------------------
     THE GEN Z COLUMN
     nova.js's ncApplyGenZ() can only reach an element carrying data-t,
     and most of the editor, the Studio tiles and the games have no key
     at all — which is why Gen Z mode used to look finished on the home
     page and stop at the Studio door. These rows are already indexed by
     their exact English wording for the translator, so the slang rides
     along in the same row.

     Only where the two voices genuinely differ. "Score", "Upload" and
     "Time" are the same word either way, and a row that only lower-cases
     a word is not worth the bytes.
     ------------------------------------------------------------------ */
  var Z = {
    "Media Library": "ur media",
    "Drop media here": "drop ur media here",
    "Photos": "pics",
    "Record yourself": "record urself",
    "No clip selected": "nothing selected",
    "same media, separate cut": "same clip, separate cut",
    "Back to the site": "back to the site",
    "Creator Studio": "creator studio",
    "Open Trend Spotter": "open the trend radar",
    "Go to Trend Spotter": "go to the trend radar",
    "Trend Spotter": "trend radar",
    "Find what to make before it peaks.": "catch it before it goes mid.",
    "Titles, hooks and formats to steal the feed.": "titles, hooks n formats that take the feed.",
    "Turn a trend into a full script.": "turn a trend into a whole script.",
    "Click-through thumbnails that convert.": "thumbnails people actually click.",
    "Cut, pace and package your video.": "cut it, pace it, package it.",
    "Ship to every platform at once.": "post everywhere at once.",
    "Jump back into a niche you already scanned.": "hop back into a niche u already scanned.",
    "Subscribers": "subs",
    "Your channel": "ur channel",
    "Performance": "how its going",
    "Who is watching": "whos watching",
    "Ready?": "u ready?",
    "Press to start": "press to start",
    "What do you want built?": "what do u want built?",
    "Build it": "build it",
    "✓ Things it can build": "✓ stuff it can build",
    "✕ Things it will refuse, and say so": "✕ stuff it will refuse, n say so",
    "A landing page for your channel links": "a landing page for ur channel links",
    "Thumbnail templates you fill in and screenshot": "thumbnail templates u fill in n screenshot",
    "Small games and widgets for your community": "small games n widgets for ur community",
    "Getting into an account that is not yours": "getting into an account that isnt urs",
    "Downloading videos that are not yours": "downloading videos that arent urs",
    "Yes, that is fine": "yeah thats fine",
    "No thanks": "nah"
  };

  var out = {}, k, i, o;
  for (k in R) {
    if (!Object.prototype.hasOwnProperty.call(R, k)) continue;
    o = { en: k };
    for (i = 0; i < L.length; i++) o[L[i]] = R[k][i];
    if (Z[k]) o.genz = Z[k];
    out[k] = o;
  }
  window.NC_PHRASES = out;
  /* nova.js may have run its first translation pass before this file landed,
     so tell it to run another one. It is idempotent. */
  if (typeof window.ncRephrase === 'function') window.ncRephrase();
})();
