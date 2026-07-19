const THEMES = {
  'Dark': ['#0E1117', '#1E2130', '#FAFAFA'],
  'Light': ['#FFFFFF', '#F0F2F6', '#111111'],
  'Blue': ['#0A1A3F', '#14295E', '#D6E4FF'],
  'Red': ['#2B0A0A', '#4A1414', '#FFD6D6'],
  'Green': ['#0A2B14', '#14472A', '#D6FFE0'],
  'Rainbow': ['#1A0A2B', '#2B1450', '#FFFFFF'],
  'Rainy Window': ['#0B1016', '#161E28', '#D8E4F0']
};

const QUESTS = [[100, '⚔️ 1 day free NovaClip Pro'], [450, '⚔️ 1 week free NovaClip Pro'],
  [700, '⚔️ 2 weeks free NovaClip Pro'], [1250, '⚔️ 1 month free NovaClip Pro']];
const ACHIEVEMENTS = [[30, '🏅 Reached 30 points'], [100, '🏅 Reached 100 points'],
  [250, '🏅 Reached 250 points'], [500, '🏅 Reached 500 points']];

const style = document.createElement('style');
style.textContent =
"body[data-theme='Rainbow'] { background: linear-gradient(135deg, #ff0055, #ff9900, #ffee00, #00cc66, #0099ff, #9900ff) fixed !important; }" +
"body[data-theme='Rainy Window'] { background: linear-gradient(180deg, #1a2733 0%, #0B1016 100%) fixed !important; }" +
"body[data-theme='Rainy Window']::before { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; backdrop-filter: blur(1px); background-image: repeating-linear-gradient(102deg, transparent 0, transparent 3px, rgba(180,215,245,0.28) 3px, rgba(180,215,245,0.28) 4px), repeating-linear-gradient(99deg, transparent 0, transparent 7px, rgba(160,205,240,0.18) 7px, rgba(160,205,240,0.18) 8px), radial-gradient(circle at 20% 30%, rgba(200,225,255,0.15) 0 2px, transparent 3px), radial-gradient(circle at 65% 60%, rgba(200,225,255,0.15) 0 3px, transparent 4px), radial-gradient(circle at 80% 20%, rgba(200,225,255,0.12) 0 2px, transparent 3px); background-size: 100% 100%, 100% 100%, 120px 120px, 160px 160px, 90px 90px; animation: ncrainfall 0.5s linear infinite; opacity: 0.7; }" +
"body[data-theme='Rainy Window']::after { content: ''; position: fixed; inset: 3vh 3vw 3vh calc(3vw + 200px); z-index: 0; pointer-events: none; border: 16px solid; border-image: linear-gradient(160deg, #5a4633, #2e2016) 1; border-radius: 6px; box-shadow: inset 0 0 60px rgba(0,0,0,0.7), inset 0 0 12px rgba(180,210,240,0.15); background: linear-gradient(90deg, transparent 49.3%, #4a3826 49.3%, #4a3826 50.7%, transparent 50.7%), linear-gradient(0deg, transparent 49.3%, #4a3826 49.3%, #4a3826 50.7%, transparent 50.7%); }" +
"@keyframes ncrainfall { 0% { background-position: 0 0, 0 0, 0 0, 0 0, 0 0; } 100% { background-position: -40px 200px, -30px 200px, 0 120px, 0 160px, 0 90px; } }" +
"#nctoast { position: fixed; top: 20px; right: 20px; background: linear-gradient(90deg, #F72585, #7209B7); color: white; padding: 14px 22px; border-radius: 14px; font-weight: 700; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 9999; display: none; }" +
"#ncpts { position: fixed; top: 16px; right: 16px; background: var(--box); color: var(--txt); border: 2px solid #7209B7; border-radius: 20px; padding: 6px 14px; font-weight: 700; z-index: 997; }" +
".radar { width: 220px; height: 220px; border-radius: 50%; margin: 30px auto; position: relative; background: radial-gradient(circle, rgba(76,201,240,0.12) 0%, rgba(14,17,23,0.6) 70%); border: 2px solid rgba(76,201,240,0.5); box-shadow: 0 0 30px rgba(76,201,240,0.3) inset; overflow: hidden; }" +
".radar::before, .radar::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(76,201,240,0.25); margin: 40px; }" +
".radar::after { margin: 80px; }" +
".radar .sweep { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(from 0deg, rgba(76,201,240,0.55) 0deg, rgba(76,201,240,0) 60deg, transparent 360deg); animation: ncsweep 1.6s linear infinite; }" +
"@keyframes ncsweep { to { transform: rotate(360deg); } }";
document.head.appendChild(style);

function applyTheme(name) {
  const t = THEMES[name] || THEMES['Dark'];
  document.documentElement.style.setProperty('--bg', t[0]);
  document.documentElement.style.setProperty('--box', t[1]);
  document.documentElement.style.setProperty('--txt', t[2]);
  document.body.dataset.theme = name;
  localStorage.setItem('nc_theme', name);
  const audio = document.getElementById('ncrain');
  if (audio) audio.style.display = name === 'Rainy Window' ? 'block' : 'none';
}

function toast(msg) {
  const t = document.getElementById('nctoast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t.hideTimer);
  t.hideTimer = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function getPts() { return parseInt(localStorage.getItem('nc_points') || '0'); }

function checkUnlocks(pts) {
  const unlocked = JSON.parse(localStorage.getItem('nc_unlocked') || '[]');
  for (const [need, name] of QUESTS.concat(ACHIEVEMENTS)) {
    if (pts >= need && !unlocked.includes(name)) {
      unlocked.push(name);
      setTimeout(() => toast('🎉 UNLOCKED: ' + name), 1200);
    }
  }
  localStorage.setItem('nc_unlocked', JSON.stringify(unlocked));
}

function addPts(n) {
  const p = getPts() + n;
  localStorage.setItem('nc_points', p);
  const b = document.getElementById('ncpts');
  if (b) b.textContent = '🏆 ' + p + ' pts';
  toast('+' + n + ' pts!');
  checkUnlocks(p);
  refreshPanels();
}

function saveHist(subject, q, a) {
  const h = JSON.parse(localStorage.getItem('nc_history') || '{}');
  if (!h[subject]) h[subject] = [];
  h[subject].push([q, a.slice(0, 200)]);
  if (h[subject].length > 10) h[subject].shift();
  localStorage.setItem('nc_history', JSON.stringify(h));
  refreshPanels();
}

function refreshPanels() {
  const pts = getPts();
  const ql = document.getElementById('questlist');
  if (ql) ql.innerHTML = QUESTS.map(([need, name]) =>
    pts >= need ? name + ' — DONE ✅' : name + ' — ' + (need - pts) + ' pts to go 🔒').join('<br>');
  const al = document.getElementById('achlist');
  if (al) al.innerHTML = ACHIEVEMENTS.map(([need, name]) =>
    pts >= need ? name + ' ✅' : '🔒 Reach ' + need + ' points (you have ' + pts + ')').join('<br>');
  const hl = document.getElementById('histlist');
  if (hl) {
    const h = JSON.parse(localStorage.getItem('nc_history') || '{}');
    let html = '';
    for (const s in h) {
      html += '<b>' + s + '</b> (' + h[s].length + ' chats)<br>' + h[s].slice(-3).map(x => '• ' + x[0]).join('<br>') + '<br><br>';
    }
    hl.innerHTML = html || 'No chats yet - start talking!';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const badge = document.createElement('div');
  badge.id = 'ncpts';
  badge.textContent = '🏆 ' + getPts() + ' pts';
  document.body.appendChild(badge);
  const t = document.createElement('div');
  t.id = 'nctoast';
  document.body.appendChild(t);
  const audio = document.createElement('audio');
  audio.id = 'ncrain';
  audio.src = 'https://cdn.pixabay.com/download/audio/2022/07/04/audio_f52a5754b1.mp3';
  audio.controls = true;
  audio.loop = true;
  audio.style.cssText = 'position:fixed; bottom:16px; left:216px; display:none; z-index:997; width:220px;';
  document.body.appendChild(audio);
  const pick = document.getElementById('themepick');
  if (pick) {
    for (const name in THEMES) {
      const o = document.createElement('option');
      o.value = name;
      o.textContent = name;
      pick.appendChild(o);
    }
    pick.value = localStorage.getItem('nc_theme') || 'Dark';
    pick.onchange = () => applyTheme(pick.value);
  }
  applyTheme(localStorage.getItem('nc_theme') || 'Dark');
  refreshPanels();
});
