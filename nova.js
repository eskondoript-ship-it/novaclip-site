const THEMES = { 'Dark':['#0E1117','#1E2130','#FAFAFA'], 'Light':['#FFFFFF','#F0F2F6','#111111'], 'Blue':['#0A1A3F','#14295E','#D6E4FF'], 'Red':['#2B0A0A','#4A1414','#FFD6D6'], 'Green':['#0A2B14','#14472A','#D6FFE0'], 'Rainbow':['#1A0A2B','#2B1450','#FFFFFF'], 'Rainy Window':['#0B1016','#161E28','#D8E4F0'] };
const LANGS = { en:'English', zh:'中文', hi:'हिन्दी', es:'Español', ar:'العربية', fr:'Français', bn:'বাংলা', pt:'Português', ru:'Русский', ur:'اردو', id:'Bahasa Indonesia', de:'Deutsch', ja:'日本語', tr:'Türkçe', ko:'한국어', fa:'فارسی', uk:'Українська', it:'Italiano', pl:'Polski', vi:'Tiếng Việt' };
const RTL = ['ar','fa','ur'];
const T = {
  welcome: { en:'👋 Welcome to NovaClip!', pt:'👋 Bem-vindo ao NovaClip!', es:'👋 ¡Bienvenido a NovaClip!', fr:'👋 Bienvenue sur NovaClip !', de:'👋 Willkommen bei NovaClip!', ar:'👋 مرحبًا بك في NovaClip!', fa:'👋 به NovaClip خوش آمدید!', ru:'👋 Добро пожаловать в NovaClip!', uk:'👋 Ласкаво просимо!', tr:'👋 NovaClip\'e hoş geldin!', ko:'👋 NovaClip에 오신 것을 환영합니다!', ja:'👋 NovaClipへようこそ！', zh:'👋 欢迎来到 NovaClip！', hi:'👋 NovaClip में आपका स्वागत है!', it:'👋 Benvenuto su NovaClip!', pl:'👋 Witamy w NovaClip!', vi:'👋 Chào mừng đến với NovaClip!', id:'👋 Selamat datang di NovaClip!', bn:'👋 NovaClip-এ স্বাগতম!', ur:'👋 NovaClip میں خوش آمدید!' },
  home: { en:'Home', pt:'Início', es:'Inicio', fr:'Accueil', de:'Start', ar:'الرئيسية', fa:'خانه', ru:'Главная', uk:'Головна', tr:'Ana Sayfa', ko:'홈', ja:'ホーム', zh:'首页', hi:'होम', it:'Home', pl:'Start', vi:'Trang chủ', id:'Beranda', bn:'হোম', ur:'ہوم' },
  studio: { en:'Studio', pt:'Estúdio', es:'Estudio', fr:'Studio', de:'Studio', ar:'استوديو', fa:'استودیو', ru:'Студия', uk:'Студія', tr:'Stüdyo', ko:'스튜디오', ja:'スタジオ', zh:'工作室', hi:'स्टूडियो', it:'Studio', pl:'Studio', vi:'Studio', id:'Studio', bn:'স্টুডিও', ur:'اسٹوڈیو' },
  trends: { en:'Trend Spotter', pt:'Radar de Tendências', es:'Detector de Tendencias', fr:'Détecteur de Tendances', de:'Trend-Radar', ar:'راصد الاتجاهات', fa:'ردیاب ترند', ru:'Радар трендов', uk:'Радар трендів', tr:'Trend Radarı', ko:'트렌드 탐지기', ja:'トレンド探知', zh:'趋势雷达', hi:'ट्रेंड स्पॉटर', it:'Rileva Tendenze', pl:'Radar Trendów', vi:'Dò Xu Hướng', id:'Pemantau Tren', bn:'ট্রেন্ড স্পটার', ur:'ٹرینڈ اسپاٹر' },
  ai: { en:'NovaClip AI', pt:'IA NovaClip', es:'IA NovaClip', fr:'IA NovaClip', de:'NovaClip KI', ar:'ذكاء NovaClip', fa:'هوش مصنوعی', ru:'ИИ NovaClip', uk:'ШІ NovaClip', tr:'NovaClip YZ', ko:'NovaClip AI', ja:'NovaClip AI', zh:'NovaClip 智能', hi:'NovaClip एआई', it:'IA NovaClip', pl:'AI NovaClip', vi:'AI NovaClip', id:'AI NovaClip', bn:'NovaClip এআই', ur:'NovaClip اے آئی' },
  intro: { en:'Your AI coach for YouTube growth. Analyze your channel, duel rivals, generate thumbnails and plan videos. Earn points and unlock NovaClip Pro rewards! 🏆', pt:'O teu treinador de IA para crescer no YouTube. Ganha pontos e desbloqueia recompensas! 🏆', es:'Tu entrenador de IA para crecer en YouTube. ¡Gana puntos y desbloquea recompensas! 🏆', fr:'Votre coach IA pour grandir sur YouTube. Gagnez des points ! 🏆', de:'Dein KI-Coach für YouTube-Wachstum. Sammle Punkte! 🏆', ar:'مدربك بالذكاء الاصطناعي للنمو على يوتيوب. اكسب النقاط! 🏆', fa:'مربی هوش مصنوعی شما برای رشد در یوتیوب. امتیاز بگیرید! 🏆', ru:'Ваш ИИ-тренер для роста на YouTube. Зарабатывайте очки! 🏆', uk:'Ваш ШІ-тренер для зростання на YouTube. Заробляйте бали! 🏆', tr:'YouTube büyümen için YZ koçun. Puan kazan! 🏆', ko:'유튜브 성장을 위한 AI 코치. 포인트를 모으세요! 🏆', ja:'YouTube成長のためのAIコーチ。ポイントを獲得！🏆', zh:'助你在YouTube成长的AI教练。赚取积分！🏆', hi:'YouTube ग्रोथ के लिए आपका AI कोच। पॉइंट कमाएं! 🏆', it:'Il tuo coach IA per crescere su YouTube. Guadagna punti! 🏆', pl:'Twój trener AI do rozwoju na YouTube. Zdobywaj punkty! 🏆', vi:'Huấn luyện viên AI giúp bạn phát triển YouTube. Kiếm điểm! 🏆', id:'Pelatih AI untuk pertumbuhan YouTube. Kumpulkan poin! 🏆', bn:'YouTube বৃদ্ধির জন্য আপনার AI কোচ। পয়েন্ট অর্জন করুন! 🏆', ur:'یوٹیوب کی ترقی کے لیے آپ کا AI کوچ۔ پوائنٹس کمائیں! 🏆' }
};
function lang() { return localStorage.getItem('nc_lang') || 'en'; }
function tr(key) { return (T[key] && T[key][lang()]) || (T[key] && T[key].en) || ''; }
function langInstruction() { return ' Reply ONLY in this language: ' + (LANGS[lang()] || 'English') + '. '; }
function applyLang(code) { localStorage.setItem('nc_lang', code); document.documentElement.lang = code; document.documentElement.dir = RTL.includes(code) ? 'rtl' : 'ltr'; document.querySelectorAll('[data-t]').forEach(el => { el.textContent = tr(el.dataset.t); }); }

const QUESTS = [[100,'⚔️ 1 day free NovaClip Pro'],[450,'⚔️ 1 week free NovaClip Pro'],[700,'⚔️ 2 weeks free NovaClip Pro'],[1250,'⚔️ 1 month free NovaClip Pro']];
const ACHIEVEMENTS = [[30,'🏅 Reached 30 points'],[100,'🏅 Reached 100 points'],[250,'🏅 Reached 250 points'],[500,'🏅 Reached 500 points']];

const style = document.createElement('style');
style.textContent =
"body[data-theme='Rainbow'] { background: linear-gradient(135deg,#ff0055,#ff9900,#ffee00,#00cc66,#0099ff,#9900ff) fixed !important; }" +
"body[data-theme='Rainy Window'] { background: linear-gradient(180deg,#1a2733 0%,#0B1016 100%) fixed !important; }" +
"body[data-theme='Rainy Window']::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none; backdrop-filter:blur(1px); background-image: repeating-linear-gradient(102deg, transparent 0, transparent 3px, rgba(180,215,245,0.28) 3px, rgba(180,215,245,0.28) 4px), repeating-linear-gradient(99deg, transparent 0, transparent 7px, rgba(160,205,240,0.18) 7px, rgba(160,205,240,0.18) 8px), radial-gradient(circle at 20% 30%, rgba(200,225,255,0.15) 0 2px, transparent 3px), radial-gradient(circle at 65% 60%, rgba(200,225,255,0.15) 0 3px, transparent 4px); background-size:100% 100%,100% 100%,120px 120px,160px 160px; animation:ncrainfall 0.5s linear infinite; opacity:0.7; }" +
"body[data-theme='Rainy Window']::after { content:''; position:fixed; inset:3vh 3vw 3vh calc(3vw + 200px); z-index:0; pointer-events:none; border:16px solid; border-image:linear-gradient(160deg,#5a4633,#2e2016) 1; border-radius:6px; box-shadow:inset 0 0 60px rgba(0,0,0,0.7); background:linear-gradient(90deg,transparent 49.3%,#4a3826 49.3%,#4a3826 50.7%,transparent 50.7%),linear-gradient(0deg,transparent 49.3%,#4a3826 49.3%,#4a3826 50.7%,transparent 50.7%); }" +
"@keyframes ncrainfall { 0% { background-position:0 0,0 0,0 0,0 0; } 100% { background-position:-40px 200px,-30px 200px,0 120px,0 160px; } }" +
"#nctoast { position:fixed; top:20px; right:20px; background:linear-gradient(90deg,#F72585,#7209B7); color:white; padding:14px 22px; border-radius:14px; font-weight:700; box-shadow:0 4px 20px rgba(0,0,0,0.5); z-index:9999; display:none; }" +
"#ncpts { position:fixed; top:16px; right:16px; background:var(--box); color:var(--txt); border:2px solid #7209B7; border-radius:20px; padding:6px 14px; font-weight:700; z-index:997; }" +
".radar { width:220px; height:220px; border-radius:50%; margin:30px auto; position:relative; background:radial-gradient(circle,rgba(76,201,240,0.12) 0%,rgba(14,17,23,0.6) 70%); border:2px solid rgba(76,201,240,0.5); box-shadow:0 0 30px rgba(76,201,240,0.3) inset; overflow:hidden; }" +
".radar::before,.radar::after { content:''; position:absolute; inset:0; border-radius:50%; border:1px solid rgba(76,201,240,0.25); margin:40px; }" +
".radar::after { margin:80px; }" +
".radar .sweep { position:absolute; inset:0; border-radius:50%; background:conic-gradient(from 0deg,rgba(76,201,240,0.55) 0deg,rgba(76,201,240,0) 60deg,transparent 360deg); animation:ncsweep 1.6s linear infinite; }" +
"@keyframes ncsweep { to { transform:rotate(360deg); } }" +
".sidebar { transition: transform 0.25s; }" +
"body.navclosed .sidebar { transform: translateX(-210px); }" +
"body.navclosed .hero, body.navclosed .wrap { margin-left: 0 !important; }" +
"body.navclosed #ncmenu { left: 12px; }" +
"#ncmenu { position:fixed; top:14px; left:210px; z-index:999; background:var(--box); color:var(--txt); border:2px solid #7209B7; border-radius:10px; width:40px; height:40px; font-size:1.2rem; cursor:pointer; transition:left 0.25s; }";
document.head.appendChild(style);

function applyTheme(name) { const t = THEMES[name] || THEMES['Dark']; document.documentElement.style.setProperty('--bg',t[0]); document.documentElement.style.setProperty('--box',t[1]); document.documentElement.style.setProperty('--txt',t[2]); document.body.dataset.theme = name; localStorage.setItem('nc_theme',name); const a = document.getElementById('ncrain'); if (a) a.style.display = name === 'Rainy Window' ? 'block' : 'none'; }
function toast(msg) { const t = document.getElementById('nctoast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(t.hideTimer); t.hideTimer = setTimeout(() => { t.style.display = 'none'; }, 3000); }
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
window.addEventListener('DOMContentLoaded', () => {
  const badge = document.createElement('div'); badge.id = 'ncpts'; badge.textContent = '🏆 ' + getPts() + ' pts'; document.body.appendChild(badge);
  const t = document.createElement('div'); t.id = 'nctoast'; document.body.appendChild(t);
  const audio = document.createElement('audio'); audio.id = 'ncrain'; audio.src = 'https://cdn.pixabay.com/download/audio/2022/07/04/audio_f52a5754b1.mp3'; audio.controls = true; audio.loop = true; audio.style.cssText = 'position:fixed; bottom:16px; left:216px; display:none; z-index:997; width:220px;'; document.body.appendChild(audio);
  const menu = document.createElement('button'); menu.id = 'ncmenu'; menu.textContent = '☰'; menu.onclick = () => { document.body.classList.toggle('navclosed'); localStorage.setItem('nc_nav', document.body.classList.contains('navclosed') ? '1' : '0'); }; document.body.appendChild(menu);
  if (localStorage.getItem('nc_nav') === '1') document.body.classList.add('navclosed');
  const pick = document.getElementById('themepick');
  if (pick) { for (const name in THEMES) { const o = document.createElement('option'); o.value = name; o.textContent = name; pick.appendChild(o); } pick.value = localStorage.getItem('nc_theme') || 'Dark'; pick.onchange = () => applyTheme(pick.value); }
  const lpick = document.getElementById('langpick');
  if (lpick) { for (const c in LANGS) { const o = document.createElement('option'); o.value = c; o.textContent = LANGS[c]; lpick.appendChild(o); } lpick.value = lang(); lpick.onchange = () => applyLang(lpick.value); }
  applyTheme(localStorage.getItem('nc_theme') || 'Dark');
  applyLang(lang());
  refreshPanels();
});
