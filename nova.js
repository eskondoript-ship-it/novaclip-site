const THEMES = { 'Dark':['#0E1117','#1E2130','#FAFAFA'], 'Light':['#FFFFFF','#F0F2F6','#111111'], 'Blue':['#0A1A3F','#14295E','#D6E4FF'], 'Red':['#2B0A0A','#4A1414','#FFD6D6'], 'Green':['#0A2B14','#14472A','#D6FFE0'], 'Rainbow':['#1A0A2B','#2B1450','#FFFFFF'], 'Rainy Window':['#0B1016','#161E28','#D8E4F0'] };
const LANGS = { en:'English', zh:'中文', hi:'हिन्दी', es:'Español', ar:'العربية', fr:'Français', bn:'বাংলা', pt:'Português', ru:'Русский', ur:'اردو', id:'Bahasa Indonesia', de:'Deutsch', ja:'日本語', tr:'Türkçe', ko:'한국어', fa:'فارسی', uk:'Українська', it:'Italiano', pl:'Polski', vi:'Tiếng Việt' };
const RTL = ['ar','fa','ur'];

// Full translations for the main 5 languages (EN/PT/FR/DE/FA). Others fall back to English automatically.
const T = {
  home:        { en:'Home', pt:'Início', fr:'Accueil', de:'Start', fa:'خانه' },
  studio:      { en:'Studio', pt:'Estúdio', fr:'Studio', de:'Studio', fa:'استودیو' },
  trends:      { en:'Trend Spotter', pt:'Radar de Tendências', fr:'Détecteur de Tendances', de:'Trend-Radar', fa:'ردیاب ترند' },
  ai:          { en:'NovaClip AI', pt:'IA NovaClip', fr:'IA NovaClip', de:'NovaClip KI', fa:'هوش مصنوعی NovaClip' },
  background:  { en:'Background', pt:'Fundo', fr:'Arrière-plan', de:'Hintergrund', fa:'پس‌زمینه' },
  language:    { en:'Language', pt:'Idioma', fr:'Langue', de:'Sprache', fa:'زبان' },
  welcome:     { en:'👋 Welcome to NovaClip!', pt:'👋 Bem-vindo ao NovaClip!', fr:'👋 Bienvenue sur NovaClip !', de:'👋 Willkommen bei NovaClip!', fa:'👋 به NovaClip خوش آمدید!' },
  intro:       { en:'Your AI coach for YouTube growth. Analyze your channel, duel rival creators, generate thumbnails and plan whole videos. Earn points and unlock NovaClip Pro rewards! 🏆',
                 pt:'O teu treinador de IA para crescer no YouTube. Analisa o teu canal, desafia rivais, cria thumbnails e planeia vídeos. Ganha pontos e desbloqueia recompensas NovaClip Pro! 🏆',
                 fr:'Votre coach IA pour grandir sur YouTube. Analysez votre chaîne, défiez des rivaux, créez des miniatures et planifiez des vidéos. Gagnez des points et débloquez des récompenses NovaClip Pro ! 🏆',
                 de:'Dein KI-Coach für YouTube-Wachstum. Analysiere deinen Kanal, fordere Rivalen heraus, erstelle Thumbnails und plane Videos. Sammle Punkte und schalte NovaClip Pro-Belohnungen frei! 🏆',
                 fa:'مربی هوش مصنوعی شما برای رشد در یوتیوب. کانالتان را تحلیل کنید، با رقبا مبارزه کنید، تصویر بندانگشتی بسازید و ویدیو برنامه‌ریزی کنید. امتیاز بگیرید و جوایز NovaClip Pro را باز کنید! 🏆' },
  card_ai:     { en:'NovaClip AI', pt:'IA NovaClip', fr:'IA NovaClip', de:'NovaClip KI', fa:'هوش مصنوعی NovaClip' },
  card_ai_d:   { en:'Three tutors: YouTube Coach, Space Tutor and Business Tutor - right in your browser.', pt:'Três tutores: Treinador de YouTube, Tutor Espacial e Tutor de Negócios - no teu navegador.', fr:'Trois tuteurs : Coach YouTube, Tuteur Spatial et Tuteur Business - dans votre navigateur.', de:'Drei Tutoren: YouTube-Coach, Weltraum-Tutor und Business-Tutor - direkt im Browser.', fa:'سه مربی: مربی یوتیوب، مربی فضا و مربی کسب‌وکار - در مرورگر شما.' },
  card_duel:   { en:'Channel Duels', pt:'Duelos de Canais', fr:'Duels de Chaînes', de:'Kanal-Duelle', fa:'دوئل کانال‌ها' },
  card_duel_d: { en:'Battle channels near your size in subs and views. Max 20k gap - fair fights only.', pt:'Batalha canais do teu tamanho em subs e views. Diferença máx. 20k - só lutas justas.', fr:'Affrontez des chaînes de votre taille en abonnés et vues. Écart max 20k - combats équitables.', de:'Kämpfe gegen Kanäle deiner Größe in Abos und Aufrufen. Max. 20k Abstand - faire Kämpfe.', fa:'با کانال‌های هم‌اندازه خود در مشترکین و بازدید مبارزه کنید. حداکثر فاصله ۲۰ هزار - فقط مبارزه عادلانه.' },
  card_ana:    { en:'Channel Analytics', pt:'Análise de Canal', fr:'Analytique de Chaîne', de:'Kanal-Analyse', fa:'تحلیل کانال' },
  card_ana_d:  { en:'Your stats, best and worst videos, trending topics and closest rivals.', pt:'As tuas estatísticas, melhores e piores vídeos, tendências e rivais mais próximos.', fr:'Vos statistiques, meilleures et pires vidéos, tendances et rivaux les plus proches.', de:'Deine Statistiken, beste und schlechteste Videos, Trends und nächste Rivalen.', fa:'آمار شما، بهترین و بدترین ویدیوها، موضوعات پرطرفدار و نزدیک‌ترین رقبا.' },
  card_quest:  { en:'Quests and Achievements', pt:'Missões e Conquistas', fr:'Quêtes et Succès', de:'Quests und Erfolge', fa:'مأموریت‌ها و دستاوردها' },
  card_quest_d:{ en:'Earn points with every action. Unlock free NovaClip Pro time at 100, 450, 700 and 1250 points.', pt:'Ganha pontos com cada ação. Desbloqueia NovaClip Pro grátis aos 100, 450, 700 e 1250 pontos.', fr:'Gagnez des points à chaque action. Débloquez NovaClip Pro gratuit à 100, 450, 700 et 1250 points.', de:'Sammle Punkte mit jeder Aktion. Schalte kostenloses NovaClip Pro bei 100, 450, 700 und 1250 Punkten frei.', fa:'با هر عمل امتیاز بگیرید. NovaClip Pro رایگان را در ۱۰۰، ۴۵۰، ۷۰۰ و ۱۲۵۰ امتیاز باز کنید.' },
  footer:      { en:'Classic app with quizzes and streaks', pt:'App clássica com quizzes e sequências', fr:'App classique avec quiz et séries', de:'Klassische App mit Quiz und Serien', fa:'اپلیکیشن کلاسیک با آزمون‌ها و رکوردها' },
  signin:      { en:'🔑 Sign in with Google', pt:'🔑 Entrar com Google', fr:'🔑 Se connecter avec Google', de:'🔑 Mit Google anmelden', fa:'🔑 ورود با گوگل' },
  t_stats:     { en:'📈 My analytics', pt:'📈 As minhas análises', fr:'📈 Mes analytiques', de:'📈 Meine Analysen', fa:'📈 تحلیل‌های من' },
  t_comp:      { en:'🥊 Closest competitors', pt:'🥊 Concorrentes próximos', fr:'🥊 Concurrents proches', de:'🥊 Nächste Konkurrenten', fa:'🥊 نزدیک‌ترین رقبا' },
  t_duel:      { en:'⚔️ Duel a channel', pt:'⚔️ Desafiar um canal', fr:'⚔️ Défier une chaîne', de:'⚔️ Kanal herausfordern', fa:'⚔️ دوئل با یک کانال' },
  t_trend:     { en:'🔥 Trending topics', pt:'🔥 Tópicos em tendência', fr:'🔥 Sujets tendance', de:'🔥 Trend-Themen', fa:'🔥 موضوعات پرطرفدار' },
  studio_h:    { en:'NovaClip Studio', pt:'Estúdio NovaClip', fr:'Studio NovaClip', de:'NovaClip Studio', fa:'استودیو NovaClip' },
  compare:     { en:'Compare with 2 competitors', pt:'Comparar com 2 concorrentes', fr:'Comparer avec 2 concurrents', de:'Mit 2 Konkurrenten vergleichen', fa:'مقایسه با ۲ رقیب' },
  duel_label:  { en:'⚔️ Views and subs duel (max 20k subs difference between channels)', pt:'⚔️ Duelo de views e subs (diferença máx. de 20k subs entre canais)', fr:'⚔️ Duel de vues et abonnés (écart max 20k abonnés entre chaînes)', de:'⚔️ Aufrufe- und Abo-Duell (max. 20k Abo-Unterschied zwischen Kanälen)', fa:'⚔️ دوئل بازدید و مشترکین (حداکثر اختلاف ۲۰ هزار مشترک بین کانال‌ها)' },
  opp_ph:      { en:'Opponent channel name...', pt:'Nome do canal adversário...', fr:'Nom de la chaîne adverse...', de:'Name des Gegner-Kanals...', fa:'نام کانال حریف...' },
  fight:       { en:'Fight!', pt:'Lutar!', fr:'Combattre !', de:'Kämpfen!', fa:'مبارزه!' },
  ai_h:        { en:'✨ NovaClip AI', pt:'✨ IA NovaClip', fr:'✨ IA NovaClip', de:'✨ NovaClip KI', fa:'✨ هوش مصنوعی NovaClip' },
  quests:      { en:'⚔️ Quests', pt:'⚔️ Missões', fr:'⚔️ Quêtes', de:'⚔️ Quests', fa:'⚔️ مأموریت‌ها' },
  achievements:{ en:'🏅 Achievements', pt:'🏅 Conquistas', fr:'🏅 Succès', de:'🏅 Erfolge', fa:'🏅 دستاوردها' },
  history:     { en:'📜 History', pt:'📜 Histórico', fr:'📜 Historique', de:'📜 Verlauf', fa:'📜 تاریخچه' },
  ask:         { en:'💬 Ask', pt:'💬 Perguntar', fr:'💬 Demander', de:'💬 Fragen', fa:'💬 بپرس' },
  thumb:       { en:'🎨 Thumbnail', pt:'🎨 Thumbnail', fr:'🎨 Miniature', de:'🎨 Thumbnail', fa:'🎨 تصویر بندانگشتی' },
  video:       { en:'🎬 Video maker', pt:'🎬 Criador de vídeo', fr:'🎬 Créateur de vidéo', de:'🎬 Video-Macher', fa:'🎬 ویدیوساز' },
  trend_h:     { en:'🛰️ Trend Spotter', pt:'🛰️ Radar de Tendências', fr:'🛰️ Détecteur de Tendances', de:'🛰️ Trend-Radar', fa:'🛰️ ردیاب ترند' },
  trend_p:     { en:"Type your niche and drop the radar - NovaClip AI predicts what's about to blow up.", pt:'Escreve o teu nicho e lança o radar - a IA NovaClip prevê o que vai bombar.', fr:"Tapez votre niche et lancez le radar - l'IA NovaClip prédit ce qui va exploser.", de:'Gib deine Nische ein und starte das Radar - NovaClip KI sagt voraus, was durchstartet.', fa:'حوزه خود را بنویسید و رادار را رها کنید - هوش مصنوعی NovaClip پیش‌بینی می‌کند چه چیزی منفجر می‌شود.' },
  niche_ph:    { en:'Your niche (e.g. Minecraft, cooking, football)', pt:'O teu nicho (ex: Minecraft, culinária, futebol)', fr:'Votre niche (ex : Minecraft, cuisine, football)', de:'Deine Nische (z.B. Minecraft, Kochen, Fußball)', fa:'حوزه شما (مثلاً ماینکرافت، آشپزی، فوتبال)' },
  scan:        { en:'🛰️ Scan for trends', pt:'🛰️ Procurar tendências', fr:'🛰️ Chercher des tendances', de:'🛰️ Nach Trends suchen', fa:'🛰️ اسکن ترندها' },
  scanning:    { en:'Scanning the airwaves...', pt:'A analisar o espetro...', fr:'Analyse des ondes...', de:'Scanne die Wellen...', fa:'در حال اسکن امواج...' }
};

function lang() { return localStorage.getItem('nc_lang') || 'en'; }
function tr(key) { return (T[key] && T[key][lang()]) || (T[key] && T[key].en) || ''; }
function langInstruction() { return ' Reply ONLY in this language: ' + (LANGS[lang()] || 'English') + '. '; }
function applyLang(code) {
  localStorage.setItem('nc_lang', code);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.includes(code) ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-t]').forEach(el => { const v = tr(el.dataset.t); if (v) el.textContent = v; });
  document.querySelectorAll('[data-tph]').forEach(el => { const v = tr(el.dataset.tph); if (v) el.placeholder = v; });
}

const QUESTS = [[100,'⚔️ 1 day free NovaClip Pro'],[450,'⚔️ 1 week free NovaClip Pro'],[700,'⚔️ 2 weeks free NovaClip Pro'],[1250,'⚔️ 1 month free NovaClip Pro']];
const ACHIEVEMENTS = [[30,'🏅 Reached 30 points'],[100,'🏅 Reached 100 points'],[250,'🏅 Reached 250 points'],[500,'🏅 Reached 500 points']];

const style = document.createElement('style');
style.textContent =
"body[data-theme='Rainbow'] { background: linear-gradient(135deg,#ff0055,#ff9900,#ffee00,#00cc66,#0099ff,#9900ff) fixed !important; }" +
"body[data-theme='Rainy Window'] { background: linear-gradient(160deg,#243447 0%,#131c26 55%,#0B1016 100%) fixed !important; }" +
"body[data-theme='Rainy Window']::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none; backdrop-filter:blur(2px); background-image: repeating-linear-gradient(103deg, transparent 0, transparent 2px, rgba(190,220,250,0.30) 2px, rgba(190,220,250,0.30) 3px), repeating-linear-gradient(101deg, transparent 0, transparent 6px, rgba(165,205,240,0.16) 6px, rgba(165,205,240,0.16) 7px), repeating-linear-gradient(105deg, transparent 0, transparent 11px, rgba(210,235,255,0.10) 11px, rgba(210,235,255,0.10) 12px), radial-gradient(circle at 18% 24%, rgba(220,240,255,0.55) 0 2.5px, transparent 3.5px), radial-gradient(circle at 62% 58%, rgba(220,240,255,0.5) 0 3.5px, transparent 4.5px), radial-gradient(circle at 82% 30%, rgba(220,240,255,0.45) 0 2px, transparent 3px), radial-gradient(circle at 40% 78%, rgba(220,240,255,0.5) 0 3px, transparent 4px), radial-gradient(circle at 90% 70%, rgba(220,240,255,0.4) 0 2.5px, transparent 3.5px); background-size:100% 100%,100% 100%,100% 100%,140px 140px,180px 180px,110px 110px,160px 160px,130px 130px; animation:ncrainfall 0.55s linear infinite; opacity:0.8; }" +
"body[data-theme='Rainy Window']::after { content:''; position:fixed; inset:2.5vh 2.5vw 2.5vh calc(2.5vw + 200px); z-index:0; pointer-events:none; border:18px solid; border-image:linear-gradient(155deg,#6b5238,#3a2a1a,#241810) 1; border-radius:4px; box-shadow:inset 0 0 80px rgba(0,0,0,0.75), inset 0 0 20px rgba(190,215,245,0.12), 0 0 30px rgba(0,0,0,0.5); background:linear-gradient(90deg,transparent 49.4%,#4a3826 49.4%,#4a3826 50.6%,transparent 50.6%),linear-gradient(0deg,transparent 49.4%,#4a3826 49.4%,#4a3826 50.6%,transparent 50.6%); }" +
"@keyframes ncrainfall { 0% { background-position:0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0; } 100% { background-position:-52px 260px,-40px 260px,-64px 260px,0 140px,0 180px,0 110px,0 160px,0 130px; } }" +
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
