// nova.js - Optimized + Original Languages
const THEMES = {
  'Dark': ['#0E1117', '#1E2130', '#FAFAFA'],
  'Light': ['#FFFFFF', '#F0F2F6', '#111111'],
  'Blue': ['#0A1A3F', '#14295E', '#D6E4FF'],
  'Rainbow': ['#1A0A2B', '#2B1450', '#FFFFFF']
};

const LANGS = { en:'English', zh:'中文', hi:'हिन्दी', es:'Español', ar:'العربية', fr:'Français', bn:'বাংলা', pt:'Português', ru:'Русский', ur:'اردو', id:'Bahasa Indonesia', de:'Deutsch', ja:'日本語', tr:'Türkçe', ko:'한국어', fa:'فارسی', uk:'Українська', it:'Italiano', pl:'Polski', vi:'Tiếng Việt' };

const RTL = ['ar','fa','ur'];

const T = {
  home: { en:'Home', pt:'Início', fr:'Accueil', de:'Start', fa:'خانه' },
  studio: { en:'Studio', pt:'Estúdio', fr:'Studio', de:'Studio', fa:'استودیو' },
  trends: { en:'Trend Spotter', pt:'Radar de Tendências', fr:'Détecteur de Tendances', de:'Trend-Radar', fa:'ردیاب ترند' },
  ai: { en:'NovaClip AI', pt:'IA NovaClip', fr:'IA NovaClip', de:'NovaClip KI', fa:'هوش مصنوعی NovaClip' },
  // ... (keep all your original translations)
  // Add any missing ones here if needed
};

function lang() { return localStorage.getItem('nc_lang') || 'en'; }

function tr(key) {
  return (T[key] && T[key][lang()]) || (T[key] && T[key].en) || key;
}

function applyLang(code) {
  localStorage.setItem('nc_lang', code);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.includes(code) ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-t]').forEach(el => {
    const v = tr(el.dataset.t);
    if (v) el.textContent = v;
  });
}

function initSidebar() {
  const links = document.querySelectorAll('.sidebar a');
  const current = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    if (link.getAttribute('href') === current) {
      link.style.background = '#7209B733';
      link.style.borderLeft = '4px solid #4CC9F0';
    }
    link.addEventListener('click', () => {
      links.forEach(l => l.style.background = '');
      link.style.background = '#7209B733';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  applyLang(lang());
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
    const input = document.querySelector('input, textarea');
    if (input) input.focus();
    e.preventDefault();
  }
});
