/* ============================================================================
   NOVA HELP — the assistant, on every screen, knowing exactly where you are
   ============================================================================
   The "?" in the top bar answers "how do I use this page" out of a written
   table, and that was the whole of the site's help. Two things were wrong with
   it, and this file fixes both.

   IT WAS NOT EVERYWHERE. The top bar is not drawn inside a frame — ncBuildBar
   returns null under ?embed=1 — and Studio shows the Photo tool, the editor,
   the AI Editor and Hype Lab as frames, as do the Games, Socials and AI tab
   hosts. So exactly where somebody is deepest inside a tool, with the most to
   ask about, there was no help at all. This button is drawn by the page
   itself, so it is there in a frame too.

   IT WAS NOT SPECIFIC. A page is not a place. trends.html is ten screens
   behind a hash and the editor is twenty-two panels, so somebody standing in
   the Memes panel asking how to put words on a meme got a paragraph about
   dropping a clip on the timeline — true, and useless. This works the place
   out from the editor's own panel, the hash, the frame and the page, and
   prints it at the top of the card so you can see whether it understood you
   before you read the answer.

   AND IT IS BUILT FOR SOMEBODY WHO IS STUCK, WHICH IS NOT THE SAME AS
   SOMEBODY READING DOCUMENTATION.

     The ask box is at the top. The question people have is rarely the one a
     walkthrough answers; "how do I make the music quieter under the talking"
     has never been step three of anything.

     Three real questions sit under it as buttons. An empty box is a hard
     thing to be handed when you are stuck, because you have to know what is
     possible before you can ask for it, and that is the thing you do not
     know. One tap, no typing, no spelling.

     The written steps are folded away. They are good and they are long, and a
     card that opens as a wall of text gets shut before the box at the top is
     noticed.

     The button says "Help", not just "?". An unlabelled circle in the corner
     of a screen is a thing people ignore.

   WHERE THE WORDS COME FROM. nova-guide.js already holds twenty-four page
   walkthroughs and editor-help.js holds twenty-one panel ones. Neither is
   copied here — this reads them. One table per thing, and this file is the
   one that decides which table you are standing in.

   IN THE EDITOR IT STANDS DOWN. editor-help.js knows the rail, the windows
   and the inspector tabs, which is finer than anything this file could work
   out from outside, so where that exists this one draws no button.
   ============================================================================ */
(function () {
  'use strict';
  if (window.NC_HELP) return;

  /* ------------------------------------------------------------------------
     WHERE ARE WE?
     Four answers, narrowest first: the editor's own panel, a Studio route, a
     framed tool, the page. The label is what gets shown and what the model is
     told, so it is written the way somebody would say it out loud.
     ---------------------------------------------------------------------- */

  /* Studio is one page with ten screens behind a hash. Each names the page
     whose written steps apply, so a route gets the real walkthrough rather
     than Studio's overview. */
  var ROUTES = {
    '/':           { label: 'Studio home',          guide: 'trends.html' },
    '/trends':     { label: 'Trend Spotter',        guide: 'trends.html' },
    /* These three are panels inside trends.html rather than pages, so there is
       no written walkthrough that is actually about them — showing Studio's
       steps under the heading "Video Ideas" would be worse than admitting it.
       guide is empty, so one gets written for the screen instead; bg is what
       the model is told about the place they are standing in. */
    '/ideas':      { label: 'Video Ideas',          guide: '', bg: 'trends.html' },
    '/scripts':    { label: 'Scripts',              guide: '', bg: 'trends.html' },
    '/thumbnails': { label: 'Thumbnails',           guide: '', bg: 'trends.html' },
    '/editor':     { label: 'the video editor',     guide: 'editor.html' },
    '/publish':    { label: 'the AI Editor',        guide: 'publish.html' },
    '/photo':      { label: 'the Photo editor',     guide: 'photo.html' },
    '/hype':       { label: 'Hype Lab',             guide: 'hype.html' },
    '/studio':     { label: 'Studio',               guide: 'analytics.html' }
  };

  /* What a page is called in a sentence. Anything missing falls back to the
     page's own <h1> and then to the filename, so a new page is never nameless
     — only less well described. */
  var PAGES = {
    'index.html': 'the NovaClip home page', 'photo.html': 'the Photo editor',
    'hype.html': 'Hype Lab', 'publish.html': 'the AI Editor',
    'analytics.html': 'Studio', 'trends.html': 'Studio',
    'editor.html': 'the video editor', 'community.html': 'the community page',
    'socials.html': 'the socials page', 'profile.html': 'your profile',
    'progress.html': 'your progress and certificates', 'history.html': 'your AI history',
    'coder.html': 'the Coder', 'tools.html': 'the tools page',
    'pricing.html': 'the pricing page', 'game.html': 'the games page',
    'study.html': 'the study tool', 'typing.html': 'the typing game',
    'reaction.html': 'the reaction game', 'aim.html': 'the aim game',
    'flap.html': 'the flappy game', 'shield.html': 'the content shield',
    'parent.html': 'the family dashboard', 'app.html': 'the app page',
    'ai.html': 'the AI tools page'
  };

  /* Three things somebody might actually ask here, written the way a person
     would say them rather than as a feature list. The last one is always the
     "what am I missing" question, because that is the one nobody thinks to
     ask and the one that most often helps. */
  var SUGGEST = {
    'photo.html':     ['How do I crop it?', 'How do I make it look better?', 'How do I save it?'],
    'editor.html':    ['How do I add music?', 'How do I cut a bit out?', 'How do I save my video?'],
    'trends.html':    ['What should I make next?', 'How do I use a trend?', 'What is worth my time here?'],
    'publish.html':   ['How do I write a good title?', 'What makes a thumbnail work?', 'Is my video ready?'],
    'hype.html':      ['How does this work?', 'What makes a hook good?', 'What am I missing here?'],
    'analytics.html': ['What do my numbers mean?', 'Which video should I fix first?', 'What am I missing?'],
    'index.html':     ['What can NovaClip do?', 'Where should I start?', 'How do I make my first video?'],
    'community.html': ['How do I post something?', 'How do I get points?', 'What are the rules here?'],
    'progress.html':  ['How do I earn a certificate?', 'What is closest to done?', 'How do points work?'],
    'game.html':      ['How do I play?', 'How do I get a high score?', 'Do points count for anything?'],
    'socials.html':   ['Which platform suits me?', 'When should I post?', 'What am I missing?'],
    'coder.html':     ['What can I build here?', 'How do I run my code?', 'I am stuck — help'],
    'profile.html':   ['How do I change my name?', 'How do I pick a picture?', 'What is saved about me?']
  };
  var SUGGEST_ANY = ['What can I do here?', 'How do I start?', 'What am I missing?'];

  /* ------------------------------------------------------------------------
     READING THE SCREEN

     Knowing which panel somebody is on is not the same as knowing what is on
     it. "Explain this" is only worth asking if the answer is about the actual
     headings, buttons and values in front of them — including the ones this
     file has never heard of, which is most of them, because the site changes
     faster than any table in it.

     So the card reads the screen: visible text in document order, the controls
     with their current values, and nothing else. It is capped hard, because a
     prompt that carries an entire page costs real money on a free tier and
     buries the question at the end of it.

     WHAT IT REFUSES TO READ, AND WHY THAT MATTERS.
     Reading the screen means sending the screen. A password field, and any
     field whose name looks like a key or a token, is named but never valued —
     the profile page has a box holding the visitor's own Gemini key, and a
     help feature that posts that key to a Worker would be the single worst bug
     in this repository. Hidden and file inputs go the same way.
     ---------------------------------------------------------------------- */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, HEAD: 1, LINK: 1, META: 1, SVG: 1, PATH: 1, CANVAS: 1, IFRAME: 1, VIDEO: 1, AUDIO: 1 };
  var SECRET_RE = /key|password|passcode|token|secret|api|auth|pin\b/i;

  function onScreen(el) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    /* A screenful either side of the viewport: what they can see, plus what a
       small scroll would show, which is usually the rest of the panel. */
    if (r.bottom < -220 || r.top > innerHeight + 700) return false;
    var s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  }

  function readScreen(cap) {
    cap = cap || 2600;
    var out = [], seen = {}, total = 0;

    /* THE PAGE, NOT THE FURNITURE.
       The first version read in document order, which meant the top bar and
       the rail went first — Theme, Vibe, Language, Ask Nova, Home, Channel,
       Studio, Create, Learn, Games — and the cap was spent on the navigation
       that is identical on all thirty-four pages before it reached a word of
       the thing somebody was actually looking at. The content container is
       read where a page has one, and the site's own chrome is skipped
       wherever it sits. */
    var root = document.querySelector('main') || document.querySelector('.content') ||
               document.querySelector('.shell') || document.getElementById('nova-root') ||
               document.body;
    if (!root) return '';

    var chrome = [];
    try {
      var sel = '#ncbar,#ncrail,#ncpts,#nctoast,#nchq-card,#nchq-btn,#ncguidebtn,#ncaskbtn,' +
                '.sidebar,.themewrap,nav,footer,#ncanav,#nca-card,#ncsheet,#nccookie';
      document.querySelectorAll(sel).forEach(function (e) { chrome.push(e); });
    } catch (e) {}
    function furniture(el) {
      for (var i = 0; i < chrome.length; i++) if (chrome[i] === el || chrome[i].contains(el)) return true;
      return false;
    }

    function push(tag, text) {
      text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      if (!text) return;
      var k = (tag + '|' + text).toLowerCase();
      if (seen[k]) return;
      seen[k] = 1;
      var line = tag ? tag + ' ' + text : text;
      if (total + line.length + 1 > cap) return;
      total += line.length + 1;
      out.push(line);
    }

    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length && i < 4000 && total < cap; i++) {
      var el = all[i], tag = el.tagName;
      if (SKIP_TAGS[tag]) continue;
      if (furniture(el)) continue;
      if (!onScreen(el)) continue;

      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        var type = String(el.type || '').toLowerCase();
        var name = (el.name || el.id || el.placeholder || el.getAttribute('aria-label') || '').trim();
        if (type === 'password' || type === 'hidden' || type === 'file' || SECRET_RE.test(name)) {
          push('[field]', (name || 'a private field') + ' — not read');
          continue;
        }
        var val = tag === 'SELECT'
          ? (el.selectedOptions && el.selectedOptions[0] ? el.selectedOptions[0].textContent : '')
          : (el.value || '');
        push('[field]', (name || 'field') + (String(val).trim() ? ' = ' + String(val).slice(0, 80) : ' (empty)'));
        continue;
      }

      /* Its own words, not its children's — otherwise every wrapper repeats
         the whole page and the cap is spent three levels above the content. */
      var own = '';
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) own += n.nodeValue + ' ';
      if (!own.trim()) continue;

      if (/^H[1-6]$/.test(tag)) push('##', own);
      else if (tag === 'BUTTON' || el.getAttribute('role') === 'button') push('[button]', own);
      else if (tag === 'A') push('[link]', own);
      else if (tag === 'LABEL') push('[label]', own);
      else if (tag === 'LI') push('•', own);
      else push('', own);
    }
    return out.join('\n');
  }

  function pageFile() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
  }
  function h1() {
    var h = document.querySelector('h1');
    var t = h && (h.textContent || '').trim();
    return (t && t.length < 60) ? t : '';
  }

  /* { label, guide, topic?, route?, embed? } */
  function place() {
    var file = pageFile();

    /* 1. The editor names its own panel, better than we could from outside. */
    if (window.__ncHelp && window.__ncHelp.now) {
      var id = window.__ncHelp.now();
      var t = window.__ncHelp.topics && window.__ncHelp.topics[id];
      if (t) return { label: t.title + ', in the video editor', guide: 'editor.html', topic: id };
    }
    /* 2. A Studio route. */
    if (/trends\.html/.test(file)) {
      var hash = (location.hash || '#/').replace(/^#/, '') || '/';
      var r = ROUTES[hash] || ROUTES['/'];
      return { label: r.label, guide: r.guide, bg: r.bg || r.guide, route: hash };
    }
    /* 3. A tool inside a frame. The page is the right answer, but saying so
          matters: somebody in Studio's Photo panel is not "in Studio". */
    var name = PAGES[file] || h1() || file.replace(/\.html$/, '');
    if (window.NC_EMBED) return { label: name + ', open inside Studio', guide: file, embed: true };
    return { label: name, guide: file };
  }

  /* The written steps for this place, out of nova-guide's table. Never copied
     into this file: one table, one place to fix it. */
  function written(p) {
    var g = window.ncGuide && window.ncGuide.pages;
    if (!g) return null;
    return g[p.guide] || g[p.bg] || null;
  }
  /* The walkthrough that is genuinely ABOUT this screen, as opposed to the one
     about the page it lives in. Only the first is worth showing as steps. */
  function ownWritten(p) {
    var g = window.ncGuide && window.ncGuide.pages;
    return (g && p.guide && g[p.guide]) || null;
  }
  function suggestions(p) { return SUGGEST[p.guide] || SUGGEST_ANY; }

  /* A few true things about right now, for the model only. Cheap to gather,
     and the difference between a general answer and one about this screen. */
  function around(p) {
    var bits = [];
    if (p.route) bits.push('Studio route ' + p.route);
    if (p.topic) bits.push('editor panel "' + p.topic + '"');
    if (p.embed) bits.push('shown inside Studio rather than on its own page');
    var head = h1();
    if (head) bits.push('the heading on screen is "' + head + '"');
    try {
      var labels = [], seen = {}, btns = document.querySelectorAll('button, a.btn, [role="button"]');
      for (var i = 0; i < btns.length && labels.length < 22; i++) {
        var r = btns[i].getBoundingClientRect();
        if (!r.width || r.top > innerHeight || r.bottom < 0) continue;
        var s = (btns[i].textContent || '').replace(/\s+/g, ' ').trim();
        if (!s || s.length > 26 || seen[s] || /^(Help|Ask)$/.test(s)) continue;
        seen[s] = 1; labels.push(s);
      }
      if (labels.length) bits.push('buttons on screen: ' + labels.join(', '));
    } catch (e) {}
    return bits.join('; ');
  }

  /* --------------------------------------------------------------------- */
  var CSS =
    /* A pill that says what it is, not a lone "?" somebody has to risk a tap
       to identify. It keeps its word on a phone too — the corner of a screen
       is exactly where an unlabelled circle gets ignored. */
    '#nchq-btn{position:fixed;right:15px;bottom:15px;z-index:99990;height:42px;padding:0 15px 0 13px;' +
      'display:flex;align-items:center;gap:7px;border-radius:999px;cursor:pointer;' +
      'font:700 13.5px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#fff;' +
      'background:linear-gradient(135deg,#a78bfa,#38bdf8);border:1px solid rgba(255,255,255,.25);' +
      'box-shadow:0 10px 26px rgba(0,0,0,.4);transition:transform .15s,filter .15s}' +
    '#nchq-btn i{font-style:normal;font-size:16px;font-weight:800;line-height:1}' +
    '#nchq-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}' +
    '@keyframes nchq-pulse{0%{box-shadow:0 10px 26px rgba(0,0,0,.4),0 0 0 0 rgba(167,139,250,.6)}' +
      '70%{box-shadow:0 10px 26px rgba(0,0,0,.4),0 0 0 16px rgba(167,139,250,0)}' +
      '100%{box-shadow:0 10px 26px rgba(0,0,0,.4),0 0 0 0 rgba(167,139,250,0)}}' +
    '#nchq-btn.new{animation:nchq-pulse 2s ease-out 3}' +
    '@media (prefers-reduced-motion:reduce){#nchq-btn.new{animation:none}}' +

    '#nchq-card{position:fixed;right:15px;bottom:66px;z-index:99991;width:min(380px,calc(100vw - 30px));' +
      'max-height:min(78vh,660px);display:none;flex-direction:column;border-radius:18px;overflow:hidden;' +
      'background:#11162a;color:#e8edf8;border:1px solid rgba(255,255,255,.14);' +
      'box-shadow:0 26px 60px rgba(0,0,0,.55);unicode-bidi:plaintext;' +
      'font:400 13.5px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#nchq-card.on{display:flex}' +
    '#nchq-card .hd{display:flex;align-items:flex-start;gap:8px;padding:13px 15px;' +
      'border-bottom:1px solid rgba(255,255,255,.1);' +
      'background:linear-gradient(120deg,rgba(167,139,250,.24),rgba(56,189,248,.14))}' +
    '#nchq-card .hd div{flex:1;min-width:0}' +
    '#nchq-card .hd b{display:block;font-size:14.5px}' +
    '#nchq-card .hd s{display:block;text-decoration:none;color:#c3cfe6;font-size:12px;margin-top:2px}' +
    '#nchq-card .x{border:0;background:transparent;color:#9aa8c3;font-size:20px;line-height:1;' +
      'cursor:pointer;padding:0 2px}' +
    '#nchq-card .x:hover{color:#fff}' +

    '#nchq-ask{padding:12px 15px}' +
    /* The first thing in the card, because "what even is this" comes before
       any question somebody could phrase. It reads the screen and explains it. */
    '#nchq-explain{width:100%;margin-bottom:9px;padding:11px 12px;border-radius:11px;cursor:pointer;' +
      'border:1px solid rgba(56,189,248,.4);background:rgba(56,189,248,.14);color:#dff1ff;' +
      'font:700 13px/1.3 inherit;text-align:left}' +
    '#nchq-explain:hover{background:rgba(56,189,248,.26);color:#fff}' +
    '#nchq-explain:before{content:"\\1F50D  "}' +
    '#nchq-explain[disabled]{opacity:.6;cursor:default}' +
    '#nchq-read{margin-top:9px;color:#8494b4;font-size:11.5px;line-height:1.45}' +
    '#nchq-ask .row{display:flex;gap:7px}' +
    '#nchq-ask input{flex:1;min-width:0;padding:10px 12px;border-radius:10px;color:#e8edf8;' +
      'border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);font:inherit}' +
    '#nchq-ask input:focus{outline:none;border-color:rgba(167,139,250,.7)}' +
    '#nchq-ask input::placeholder{color:#7f8db0}' +
    '#nchq-ask .row button{padding:10px 15px;border-radius:10px;border:0;background:#7c5cff;color:#fff;' +
      'font:700 13.5px/1 inherit;cursor:pointer}' +
    '#nchq-ask .row button[disabled]{opacity:.55;cursor:default}' +
    '#nchq-out{margin-top:10px;white-space:pre-wrap;color:#dbe4f7;line-height:1.6;unicode-bidi:plaintext}' +
    '#nchq-out:empty{margin:0}' +
    '#nchq-out.bad{color:#fca5a5}' +
    '#nchq-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}' +
    '#nchq-chips button{padding:7px 12px;border-radius:999px;cursor:pointer;text-align:left;' +
      'border:1px solid rgba(167,139,250,.35);background:rgba(167,139,250,.12);' +
      'color:#d9d2ff;font:500 12.5px/1.35 inherit}' +
    '#nchq-chips button:hover{background:rgba(167,139,250,.26);color:#fff}' +

    /* The written steps, folded away. */
    '#nchq-body{padding:0 15px 13px;overflow:auto;flex:1}' +
    '#nchq-body details{border-top:1px solid rgba(255,255,255,.09)}' +
    '#nchq-body summary{cursor:pointer;padding:11px 0 4px;color:#9fb0d0;font-size:12.5px;' +
      'list-style:none;user-select:none}' +
    '#nchq-body summary::-webkit-details-marker{display:none}' +
    '#nchq-body summary:hover,#nchq-body details[open] summary{color:#e8edf8}' +
    '#nchq-body p.w{margin:6px 0 9px;color:#c6d0e6}' +
    '#nchq-body ol{margin:0;padding-left:18px}' +
    '#nchq-body li{margin:0 0 7px}' +
    '#nchq-body b{color:#fff}' +
    '#nchq-body .tip{margin:11px 0 0;padding:10px 12px;border-radius:11px;color:#cfe6f7;' +
      'background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.22)}' +
    '#nchq-body .tip s{display:block;text-decoration:none;font-weight:700;color:#7dd3fc;font-size:11px;' +
      'letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}' +

    '@media (max-width:620px){#nchq-card{right:8px;left:8px;width:auto;bottom:64px;max-height:76vh}' +
      '#nchq-btn{right:10px;bottom:10px}}';

  function css() {
    if (document.getElementById('nchq-css')) return;
    var s = document.createElement('style');
    s.id = 'nchq-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var card = null, btn = null;

  /* ------------------------------------------------------------------------
     THE WALKTHROUGH CARD, FOR A SCREEN THAT HAS NO WALKTHROUGH

     nova-guide.js's card — Nova flying out, reading the page, three numbered
     steps, "Got it" — is the thing people actually recognise as help here, and
     it existed for twenty-four filenames. A filename is not a screen: Video
     Ideas, Scripts and Thumbnails are panels inside trends.html and had no
     steps of their own, and neither does any page added after that table was
     written.

     So where there is no written walkthrough, one is written for this screen,
     from what is on it. Nova is already saying "reading this page…" while she
     flies, which is exactly what is happening — the card renders when the
     answer lands, and the steps are about the four boxes actually in front of
     somebody rather than about the page in general.

     Kept for the session, per screen and per language: the same screen does
     not pay for it twice, and a page reload is a fair moment to look again.
     ---------------------------------------------------------------------- */
  function genKey(p) {
    var lang = 'en';
    try { if (typeof window.lang === 'function') lang = window.lang(); } catch (e) {}
    return 'nc_help_gen_' + lang + '_' + (p.topic || p.route || p.guide || pageFile());
  }
  function genRead(p) {
    try {
      var j = JSON.parse(sessionStorage.getItem(genKey(p)) || 'null');
      return (j && j.steps && j.steps.length) ? j : null;
    } catch (e) { return null; }
  }
  function genSave(p, g) { try { sessionStorage.setItem(genKey(p), JSON.stringify(g)); } catch (e) {} }

  function generate(p, then) {
    if (typeof window.ncAsk !== 'function') { then(null); return; }
    var w = written(p), screen = readScreen(2600);
    window.ncAsk(
      'You are writing the help card for one screen of NovaClip, a video and content site used by ' +
      'teenagers. The screen is: ' + p.label + '.\n' +
      (w ? 'The part of the site it lives in: ' + w.what + '\n' : '') +
      '\nTHIS IS WHAT IS ON THE SCREEN, read off the page. ## is a heading, [button] is a button, ' +
      '[field] is a box with its current value:\n<<<\n' + screen + '\n>>>\n\n' +
      'Write the card in ' + langName() + ', as JSON and nothing else:\n' +
      '{"title":"", "what":"", "steps":["","",""], "tip":""}\n' +
      'title: what this screen is called, two or three words.\n' +
      'what: one sentence on what it is for.\n' +
      'steps: three or four, in the order somebody should actually do them, each under 25 words, ' +
      'naming the real buttons and boxes above so they can be found on screen.\n' +
      'tip: one thing people miss or get wrong here. Never invent a feature that is not on the screen.',
      { maxTokens: 700, temperature: 0.3 }
    ).then(function (r) {
      if (!r || r.err) { then(null); return; }
      var j = (typeof window.ncJSON === 'function') ? window.ncJSON(r.text) : null;
      if (!j || !j.steps || !j.steps.length) { then(null); return; }
      var g = { title: String(j.title || p.label).slice(0, 60),
                what: String(j.what || '').slice(0, 220),
                steps: j.steps.slice(0, 5).map(function (x) { return String(x).slice(0, 220); }),
                tip: j.tip ? String(j.tip).slice(0, 240) : '' };
      genSave(p, g);
      then(g);
    }, function () { then(null); });
  }

  /* The walkthrough to show for this screen, if we already have one. */
  function walkthrough(p) {
    if (p.topic && window.__ncHelp && window.__ncHelp.topics) {
      var t = window.__ncHelp.topics[p.topic];
      if (t) return { title: t.title, what: t.what, steps: t.steps, tip: t.tip };
    }
    return ownWritten(p) || genRead(p);
  }

  /* The Help button opens the card people recognise, about the screen they are
     on. Where nothing is written for it, Nova flies and reads while the model
     writes one, and the card renders when it lands — which is the animation
     doing what it has always claimed to be doing. */
  function guide() {
    var p = place(), have = walkthrough(p);
    if (!window.ncGuide || !window.ncGuide.show) { open(); return; }   /* no guide file — the compact card still works */
    window.ncGuide.show(have || null);
    if (have) return;
    generate(p, function (g) {
      if (!g) return;
      try { window.ncGuide.render(g); } catch (e) {}
    });
  }

  function langName() {
    try {
      if (typeof LANGS === 'object' && typeof window.lang === 'function') return LANGS[window.lang()] || 'English';
    } catch (e) {}
    return 'English';
  }

  function ask(p, q, out, go, mode) {
    out.className = '';
    out.textContent = mode === 'explain' ? 'Reading the screen…' : 'Thinking…';
    if (go) go.disabled = true;
    var w = written(p);
    var steps = (w && w.steps) ? w.steps.map(function (s) { return s.replace(/<[^>]+>/g, ''); }) : [];
    var screen = readScreen(mode === 'explain' ? 3000 : 2200);

    var prompt =
      'You are the help assistant inside NovaClip, a video and content site a teenager is using in a ' +
      'browser. Right now they are on: ' + p.label + '.\n' +
      (w ? 'What that is: ' + w.what + '\n' : '') +
      (steps.length ? 'What it is for:\n- ' + steps.join('\n- ') + '\n' : '') +
      (p.route || p.topic || p.embed ? 'Context: ' + around(p) + '\n' : '') +
      (p.topic && window.__ncHelp && window.__ncHelp.state ? (function () {
        /* The timeline, from the editor's own store: how many clips, which
           lanes, what is selected. It is the difference between "select a
           clip" and "the clip you have selected". */
        try { return window.__ncHelp.state() + '\n'; } catch (e) { return ''; }
      })() : '') +
      '\nTHIS IS WHAT IS ACTUALLY ON THEIR SCREEN RIGHT NOW, read off the page. ## is a heading, ' +
      '[button] is a button they can press, [field] is a box with its current value, • is a list item:\n' +
      '<<<\n' + screen + '\n>>>\n\n';

    prompt += (mode === 'explain')
      ? 'Explain this screen to them in at most 90 words, in ' + langName() + '. Say what it is for, ' +
        'then name the two or three things worth doing first — using the exact button names above so ' +
        'they can find them. If a field already has something in it, say what that means. ' +
        'Talk to them directly. No greeting, no headings, no markdown, no lists of everything.'
      : 'They asked: "' + q + '"\n\n' +
        'Answer in at most 70 words, in ' + langName() + '. Use what is on their screen above: name the ' +
        'exact buttons to press, in order. If what they want is not on this screen, say where it is ' +
        'instead. If NovaClip cannot do it at all, say so in one sentence and say what it can do ' +
        'instead. Talk to them directly, no greeting, no headings, no markdown.';

    if (typeof window.ncAsk !== 'function') {
      out.className = 'bad';
      out.textContent = 'The AI has not loaded on this page. The steps below still work.';
      if (go) go.disabled = false;
      return;
    }
    window.ncAsk(prompt, { maxTokens: mode === 'explain' ? 500 : 400, temperature: 0.4 }).then(function (r) {
      if (go) go.disabled = false;
      if (!r || r.err) {
        out.className = 'bad';
        out.textContent = ((r && r.err) || 'The AI could not be reached.') +
          (written(p) ? ' The steps below still work.' : '');
        return;
      }
      out.className = '';
      out.textContent = (r.text || '').trim() || 'Nothing came back that time. Try asking it differently.';
    }, function () {
      if (go) go.disabled = false;
      out.className = 'bad';
      out.textContent = 'The AI could not be reached.';
    });
  }

  function draw() {
    var p = place(), w = written(p);
    card.innerHTML =
      '<div class="hd"><div><b>Need a hand?</b><s></s></div>' +
        '<button class="x" type="button" aria-label="Close">×</button></div>' +
      '<div id="nchq-ask">' +
        '<button type="button" id="nchq-explain">Explain what is on this screen</button>' +
        '<div class="row"><input type="text"><button type="button">Ask</button></div>' +
        '<div id="nchq-out"></div>' +
        '<div id="nchq-chips"></div>' +
        '<div id="nchq-read"></div>' +
      '</div>' +
      '<div id="nchq-body"></div>';

    card.querySelector('.hd s').textContent = 'You are in ' + p.label;
    card.querySelector('.x').onclick = close;

    var input = card.querySelector('#nchq-ask input'),
        go = card.querySelector('#nchq-ask .row button'),
        out = card.querySelector('#nchq-out'),
        chips = card.querySelector('#nchq-chips'),
        exp = card.querySelector('#nchq-explain');

    exp.onclick = function () { input.value = ''; ask(p, '', out, exp, 'explain'); };

    input.placeholder = 'Ask anything about this screen…';
    go.onclick = function () {
      var q = input.value.trim();
      if (!q) { input.focus(); return; }
      ask(p, q, out, go);
    };
    input.onkeydown = function (e) { if (e.key === 'Enter') go.onclick(); };

    suggestions(p).forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.onclick = function () { input.value = q; ask(p, q, out, go); };
      chips.appendChild(b);
    });

    /* Said out loud rather than buried in a policy page: answering means
       sending what is on screen. The exception is the one that matters — a
       password or a key box is named to the model and never valued. */
    card.querySelector('#nchq-read').textContent =
      'To answer, it reads what is on this screen and sends it to the AI. Password and key boxes are never read.';

    var body = card.querySelector('#nchq-body');
    if (w) {
      var d = document.createElement('details');
      var sum = document.createElement('summary');
      sum.textContent = '▸ Show me how this works (' + (w.steps || []).length + ' steps)';
      d.appendChild(sum);
      d.addEventListener('toggle', function () {
        sum.textContent = (d.open ? '▾ Hide the steps' : '▸ Show me how this works (' + (w.steps || []).length + ' steps)');
      });
      var wp = document.createElement('p');
      wp.className = 'w';
      wp.textContent = w.what || '';
      d.appendChild(wp);
      var ol = document.createElement('ol');
      (w.steps || []).forEach(function (s) {
        var li = document.createElement('li');
        li.innerHTML = s;                 /* ours, and written with <b> on purpose */
        ol.appendChild(li);
      });
      d.appendChild(ol);
      if (w.tip) {
        var tip = document.createElement('p');
        tip.className = 'tip';
        tip.innerHTML = '<s>The bit people miss</s>';
        var sp = document.createElement('span');
        sp.innerHTML = w.tip;
        tip.appendChild(sp);
        d.appendChild(tip);
      }
      body.appendChild(d);
    }
    setTimeout(function () { try { if (innerWidth > 620) input.focus(); } catch (e) {} }, 40);
  }

  function open() {
    css();
    if (!card) {
      card = document.createElement('div');
      card.id = 'nchq-card';
      document.body.appendChild(card);
    }
    draw();
    card.classList.add('on');
  }
  function close() { if (card) card.classList.remove('on'); }
  function toggle() { (card && card.classList.contains('on')) ? close() : open(); }

  function boot() {
    /* It used to stand down in the editor, because editor-help.js drew two
       "How?" pills of its own there. Those are gone — three help buttons on one
       screen is not three times the help — so this one is the editor's button
       as well, and editor-help.js is what it asks about the panel. */
    if (document.getElementById('nchq-btn')) return;
    css();
    btn = document.createElement('button');
    btn.id = 'nchq-btn';
    btn.type = 'button';
    btn.innerHTML = '<i>?</i><span>Help</span>';
    btn.title = 'Ask about this screen';
    btn.setAttribute('aria-label', 'Ask about this screen');
    btn.onclick = function (e) {
      e.preventDefault(); e.stopPropagation();
      /* The card they recognise first. Its own "Ask Nova something else"
         button opens the compact one, which is where a typed question goes. */
      if (card && card.classList.contains('on')) { close(); return; }
      /* Pressing it again while the walkthrough is up closes it, rather than
         being a button that does nothing because show() sees itself open. */
      try { if (window.ncGuide && window.ncGuide.isOpen && window.ncGuide.isOpen()) { window.ncGuide.close(); return; } } catch (e) {}
      guide();
    };
    document.body.appendChild(btn);

    /* ONE BUTTON PER CORNER, AND THE INNER ONE WINS.

       A framed page sits inside a page that has one of these too, so Studio's
       Photo panel came up with two Help buttons stacked on each other in the
       same corner, reading as one broken one. Geometry cannot settle it — the
       Studio panels fill the screen, the Games and Socials tab hosts inset
       their frames — so the frame says so instead, and the host stands down.

       The inner one wins because it is the specific one: "the Photo editor" is
       a better answer than "Studio" to somebody looking at the Photo editor.
       The host takes its button back on a hash change, when the panel it was
       standing down for has been left; whatever frame comes next announces
       itself the same way. */
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ nc: 'help-in-frame' }, '*'); } catch (e) {}
    }
    addEventListener('message', function (e) {
      if (!e || !e.data || e.data.nc !== 'help-in-frame') return;
      if (btn) btn.style.display = 'none';
      close();
    });
    addEventListener('hashchange', function () { if (btn) btn.style.display = ''; });

    /* Once, ever: say hello so it is noticed, then never again. */
    try {
      if (!localStorage.getItem('nc_help_hello')) {
        localStorage.setItem('nc_help_hello', '1');
        btn.classList.add('new');
        setTimeout(function () { btn.classList.remove('new'); }, 6500);
      }
    } catch (e) {}

    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    /* Studio changes screen without changing page, so the card has to notice.
       Redrawn rather than closed: somebody who moved from Ideas to Scripts
       with it open wants it to be about Scripts. */
    addEventListener('hashchange', function () { if (card && card.classList.contains('on')) draw(); });
  }

  /* editor-help.js and nova-guide.js are both deferred, so this waits a beat
     rather than deciding before they exist. */
  function start() {
    if (!document.body) { setTimeout(start, 60); return; }
    setTimeout(boot, 350);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start);
  else start();

  /* read() is exported on purpose: "what exactly would you send?" is a fair
     question, and the only honest answer is to let it be printed. */
  window.NC_HELP = { open: open, close: close, where: place, read: readScreen, guide: guide };
})();
