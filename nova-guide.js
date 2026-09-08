/* ============================================================================
   NOVA GUIDE — "how do I use this page?"
   ============================================================================
   A small button floats beside the Nova pill on every page. Press it and Nova
   leaves her corner, flies to the middle of the screen, scans the page, and
   answers there — steps for whatever page you are standing on.

   WHY THE ANSWERS ARE WRITTEN DOWN HERE AND NOT ASKED OF THE MODEL

   "How do I use the editor" has one correct answer and it does not change
   between visits. Sending it to Gemini would cost tokens on the one thing the
   Business Model Canvas identifies as the only cost that scales with free
   users, take a second and a half, and — the part that actually matters —
   would fail on a train. This site is offline-capable and installable; a help
   button that needs the network is a help button that is missing exactly when
   somebody is stuck.

   So the steps are local, instant and free. The AI is still one tap away for
   anything not covered, which is what the assistant was always for.

   WHY IT IS A SEPARATE FILE

   jarvis.js is 908 lines and loads on twenty-two pages. This touches nothing
   inside it: it reads #jr-pill from the outside, borrows it for a few seconds,
   and puts it back exactly where it found it — including a position the reader
   had dragged it to. If this file fails to load, the assistant is untouched.

   THE ONE THING TO BE CAREFUL WITH

   The pill is draggable and its position is remembered in localStorage as
   inline left/top. Flying it to the centre means overwriting those, so every
   inline value is recorded before the flight and restored afterwards — not
   recomputed, restored. Getting that wrong would quietly move somebody's
   assistant every time they asked for help.
   ========================================================================== */
(function () {
  'use strict';
  if (window.ncGuide) return;

  var PILL = 'jr-pill';
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ------------------------------------------------------------------------
     WHAT EACH PAGE IS FOR

     Keyed on the filename. `title` is what the page is, `steps` is the order
     somebody should actually do things in, and `tip` is the one thing people
     get wrong or never find. Anything not listed falls back to GENERIC, which
     is deliberately about the site rather than pretending to know the page.
     ---------------------------------------------------------------------- */
  var GUIDE = {
    'index.html': {
      title: 'Home',
      what: 'The front door. Everything else is reachable from the rail on the left.',
      steps: [
        'Use the rail on the left: <b>Create</b> for the editor, publishing and the AI; <b>Learn</b> for games and socials; <b>You</b> for your profile and progress.',
        'The top bar sets the theme, the language and the vibe. They follow you to every other page.',
        'Nothing here needs an account. A profile is offered when it starts to be worth having.'
      ],
      tip: 'The whole site works offline once you have opened it — you can install it from your browser menu.'
    },
    'editor.html': {
      title: 'The video editor',
      what: 'Cut, grade, mix and export a video without installing anything.',
      steps: [
        'Drop a clip on the timeline, or use <b>Upload</b> in the media panel on the left.',
        'Drag the ends of a clip to trim it. Use the tabs on the right — <b>Transform</b>, <b>Color</b>, <b>Effects</b>, <b>Audio</b>, <b>Keyframes</b> — to change the selected clip.',
        'Add text, transitions, stickers and sound from the rail on the far left.',
        'Press <b>Export</b> when you are done. The clip is checked for heavy flashing and blank footage first, on your own machine.'
      ],
      tip: 'Nothing you drop in here is uploaded. The editing happens in your browser, which is why it works with the wifi off.'
    },
    'publish.html': {
      title: 'Publish',
      what: 'Everything a video needs before it goes out, and a score for it.',
      steps: [
        'Answer the questions in order — the later steps stay locked until the earlier ones are answered, on purpose.',
        'Write or generate the title, description and tags.',
        'Make a 1280×720 thumbnail in the thumbnail step.',
        'Read the <b>score out of 10</b> and the reason it gives. It names the weakest of four parts, worst first.',
        'The schedule step holds everything together and reminds you — it does not upload for you. It says so on the page and it means it.'
      ],
      tip: 'The same 1–10 scale is used here and in the Studio, so the number before you post and the number after mean the same thing.'
    },
    'analytics.html': {
      title: 'Studio',
      what: 'Your channel, scored. Every upload with the reasons behind its number.',
      steps: [
        'Connect a channel if you have one, or look at the sample data first.',
        'Open the <b>Optimize</b> tab for the per-upload grid — each card carries a score out of 10.',
        'Read the reasons under each card. The weakest one is named first because that is the one worth fixing.'
      ],
      tip: 'A score is only useful next to its reason. If a video is a 4, the panel tells you which of the four parts made it a 4.'
    },
    'trends.html': {
      title: 'Trend Spotter',
      what: 'Research, ideas, scripts, thumbnails, Hype Lab and the Studio — one pipeline, in place.',
      steps: [
        'Search a subject to see what is being watched right now.',
        'Move down the rail: <b>Video Ideas</b> → <b>Scripts</b> → <b>Thumbnails</b> → <b>Hype Lab</b> → <b>Studio</b>.',
        'Each step hands its work to the next — pick an idea and the script step already has its title.'
      ],
      tip: 'None of these open a new page any more. It is one app, so nothing is lost moving between the steps.'
    },
    'hype.html': {
      title: 'Hype Lab',
      what: 'Finds the seconds a finished edit goes flat, and fills them.',
      steps: [
        'Drop in a video you have already edited.',
        'It measures the clip against <b>its own median</b> — not a rule — and marks where attention drops.',
        'Choose which effects to allow: music, light, words, motion.',
        'Export. Generated flashing is capped at three per second to stay inside WCAG 2.3.1, whatever you ask for.'
      ],
      tip: 'All of it runs on your machine, so it is free to use and works offline. Only "ask the AI for the words" needs the network.'
    },
    'photo.html': {
      title: 'The photo editor',
      what: 'A layered image editor: 39 effects and 17 tools, all on your own machine.',
      steps: [
        'Open an image, or place one onto the canvas.',
        'Pick a tool from the rail on the left. The panel on the right changes to match it.',
        'Use <b>Levels and curves</b> under Adjust for tone, and the <b>Filters</b> chips for effects.',
        'Layers, masks and blend modes are in the right-hand panel. <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes anything.'
      ],
      tip: 'The magic wand, blemish and red-eye tools are near the bottom of the rail, under the separator.'
    },
    'profile.html': {
      title: 'Profile',
      what: 'Your account, and how your progress follows you to another device.',
      steps: [
        'Pick a username and a password, or continue with Google to fill it in faster.',
        'Keep the <b>recovery code</b> you are given. It is nine characters and it <b>is</b> the account.',
        'Sign in on a phone with the same username and everything comes with you — points, streaks, certificates and your place on the leaderboard.'
      ],
      tip: 'Anyone holding the recovery code holds the account, the same way a shared document link works. Fine for badges; do not treat it as a bank login.'
    },
    'socials.html': {
      title: 'Socials',
      what: 'TeenVerse — post what you have made, join a club, use the study lounge.',
      steps: [
        'Pick a channel along the top: arts, study, tech, music.',
        'Press <b>Create</b> to post. You need a profile first so a post has a name on it.',
        'The right-hand column holds clubs and the study lounge.'
      ],
      tip: 'Everything posted here is moderated on the server, not just in your browser — a cleared browser does not clear a suspension.'
    },
    'community.html': {
      title: 'Community',
      what: 'The feed, clubs and friends.',
      steps: [
        'Sign in on the Profile page first — a post needs a name attached to it.',
        'Choose a channel, then write or reply.',
        'Report anything that needs a person to look at it. A report is deliberately cheap to make.'
      ],
      tip: 'Friends and groups live in the same place; the tabs across the top switch between them.'
    },
    'study.html': {
      title: 'Focus timer',
      what: 'Twenty-five minutes on, five off. The clock runs off the wall clock.',
      steps: [
        'Press start and leave the tab alone.',
        'The timer keeps correct time in the background — it reads the real clock rather than counting frames.',
        'Breaks are part of it. Take them.'
      ],
      tip: 'This is the page most worth opening with the wifi off on purpose. It is cached for exactly that.'
    },
    'typing.html': {
      title: 'TypeMaster',
      what: 'A typing test with real stakes — modes, difficulties, and a global board.',
      steps: [
        'Press <b>Take the typing test</b> and just start typing. There is no "begin" to press.',
        'Pick a mode and a difficulty from the menu when you want something harder.',
        'Your score posts to the leaderboard automatically once you have a name.'
      ],
      tip: 'If your score is not appearing on the board, set a display name or sign in — a board cannot list somebody it has no name for.'
    },
    'game.html': {
      title: 'Games',
      what: 'Four games, one shared leaderboard.',
      steps: [
        'Pick a game. Each one posts to the same world board.',
        'Reaction is the one where <b>lower wins</b>; the others are higher-is-better.',
        'Set a name on your profile first if you want to appear on the board.'
      ],
      tip: 'Coins earned here unlock cosmetics — never anything that shortens the path to a certificate.'
    },
    'pricing.html': {
      title: 'Pricing',
      what: 'What is free, what is paid, and who pays for it.',
      steps: [
        'The creator side is free and stays free. That is the whole model, not an introductory offer.',
        'The paid plans are for a parent: the dashboard, the kids’ tools, or the bundle.',
        'Certificates are one-off and gate on work actually done.'
      ],
      tip: 'Prices are shown in seven currencies. Whether they include VAT depends on your country and the page says which.'
    },
    'parent.html': {
      title: 'Family',
      what: 'The parent dashboard: what was made, what was blocked, and the controls.',
      steps: [
        'Set a PIN first — the controls are behind it.',
        'Review the activity overview. It is an overview on purpose: it is oversight, not message-reading.',
        'The block log shows what the filter actually stopped, which is how "nothing happened" becomes something you can see.'
      ],
      tip: 'The filtering itself lives in the browser extension. The dashboard configures it; it does not do the filtering.'
    },
    'shield.html': {
      title: 'Family Shield',
      what: 'Category filtering inside YouTube, TikTok, Instagram and Twitch.',
      steps: [
        'Install the extension in your browser.',
        'Turn on the categories you want blocked — there are nine, each with its own allow and block lists.',
        'Check the log to see what it stopped.'
      ],
      tip: 'This is the part the operating system’s own controls cannot do: they block whole apps, this blocks content inside them.'
    },
    'biometrics.html': {
      title: 'Biometrics',
      what: 'Sign in by face, voice, click rhythm or a passkey.',
      steps: [
        'Pick a method and enrol it. Follow the reader on screen.',
        'Enrol a second method as a backup before you rely on the first.',
        'A passkey is the strongest of them and the one your device already knows how to protect.'
      ],
      tip: 'None of this leaves your machine. The face and voice profiles are stored on the device and never uploaded — that is why it works offline.'
    },
    'progress.html': {
      title: 'Progress',
      what: 'Points, streaks, skills and certificates in one place.',
      steps: [
        'Everything here is earned by doing things elsewhere on the site.',
        'Certificates gate on real work — exports, scans, Arena wins — not on time spent.',
        'Sign in on the Profile page if you want this to follow you to another device.'
      ],
      tip: 'A streak survives a missed day less often than people expect. Check the streak card for what it actually counts.'
    },
    'ai.html': {
      title: 'NovaClip AI',
      what: 'The AI tools: director, tutors, ideas and the rest.',
      steps: [
        'Pick a tool, then type what you want in plain words.',
        'Be specific about the subject and the length; short prompts get short answers.',
        'Answers are cached, so asking the same thing twice is instant and costs nothing.'
      ],
      tip: 'Nothing you type is stored on our side. If a tool needs to look at a clip it says so first and sends four still frames, never the video.'
    },
    'coder.html': {
      title: 'Coder',
      what: 'Write, run and learn code in the browser.',
      steps: [
        'Pick a language, then write in the editor.',
        'Run it and read the output panel underneath.',
        'Ask the tutor if something does not do what you expected — it can see the code you have written.'
      ],
      tip: 'It runs in your browser, so nothing you write is sent anywhere unless you ask the tutor about it.'
    },
    'tools.html': {
      title: 'Tools',
      what: 'The small utilities that do not need a page of their own.',
      steps: [
        'Pick a tool from the grid.',
        'Most take something in and give something back immediately, with nothing to set up.'
      ],
      tip: 'These are the ones worth knowing exist. Skim the grid once and you will remember the one you need later.'
    },
    'app.html': {
      title: 'Studio',
      what: 'The app shell that holds the creative pages together.',
      steps: [
        'Use the rail to move between the parts of the pipeline.',
        'Your work stays put moving between them — leaving a panel does not throw it away.'
      ],
      tip: 'If a panel looks empty, check the top of it for a step you have not answered yet.'
    }
  };

  var GAMES = ['flap.html', 'reaction.html', 'aim.html'];
  GAMES.forEach(function (g) { GUIDE[g] = GUIDE['game.html']; });
  GUIDE['studio-ai.html'] = GUIDE['ai.html'];

  var GENERIC = {
    title: 'NovaClip',
    what: 'This page does not have its own walkthrough yet — here is how the site works.',
    steps: [
      'The rail on the left moves you around. The top bar sets the theme, the language and the vibe.',
      'Nothing needs an account to try. A profile is offered when it starts to be worth having.',
      'Nova is always in the corner — tap her and ask in plain words.'
    ],
    tip: 'Everything you have opened once works offline afterwards.'
  };

  function pageKey() {
    var p = (location.pathname || '').split('/').pop() || '';
    if (!p || p === '/') p = 'index.html';
    return p;
  }
  function guideFor() { return GUIDE[pageKey()] || GENERIC; }

  /* ---------------------------------------------------------------------- */
  var CSS = [
    /* The button. A child of the pill so it drags with it, but sitting just
       outside its edge — "next to Nova", with no position syncing to go wrong. */
    '.ncg-btn{position:absolute;left:100%;top:50%;transform:translateY(-50%);margin-left:9px;',
      'width:34px;height:34px;border-radius:50%;flex:none;cursor:pointer;padding:0;',
      'display:flex;align-items:center;justify-content:center;',
      'font:800 15px/1 "Segoe UI",system-ui,sans-serif;',
      'color:#04121A;background:linear-gradient(150deg,#7DE3FF,#00E5FF 45%,#7C5CFF);',
      'border:1px solid rgba(255,255,255,.5);',
      'box-shadow:0 0 0 1px rgba(0,229,255,.25),0 0 16px -3px rgba(0,229,255,.8),0 6px 16px rgba(0,0,0,.45);',
      'transition:transform .18s,box-shadow .18s}',
    '.ncg-btn:hover{transform:translateY(-50%) scale(1.1);box-shadow:0 0 0 1px rgba(0,229,255,.4),0 0 26px -3px rgba(0,229,255,1),0 8px 20px rgba(0,0,0,.5)}',
    '.ncg-btn:focus-visible{outline:2px solid #B6FF3C;outline-offset:2px}',
    /* On a phone the pill is docked against the right edge, so a button hung
       off its right side would be off the screen. */
    '@media (max-width:760px){.ncg-btn{left:auto;right:100%;margin-left:0;margin-right:9px}}',

    /* STACKING, decided once.
         99990 backdrop · 99991 rings · 99992 the flying pill · 99993 the scan
         band, which has to be ABOVE the pill or it sweeps behind an opaque
         gradient and is invisible · 99994 the answer. All of it under the voice
         sheet's 99997, so that still wins if it is ever opened over the top. */
    '.ncg-back{position:fixed;inset:0;z-index:99990;background:radial-gradient(circle at 50% 34%,rgba(10,16,34,.72),rgba(3,5,12,.92));',
      'backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);opacity:0;transition:opacity .3s;pointer-events:none}',
    '.ncg-back.on{opacity:1;pointer-events:auto}',

    /* The flight. left/top are animated, so they have to be transitionable —
       the pill's own rule only transitions transform and box-shadow. */
    '.jr-pill.ncg-fly{transition:left .55s cubic-bezier(.22,.9,.25,1.06),top .55s cubic-bezier(.22,.9,.25,1.06),transform .55s cubic-bezier(.22,.9,.25,1.06)!important;z-index:99992!important;pointer-events:none}',
    '.jr-pill.ncg-fly:hover{transform:var(--ncg-t)!important}',
    /* nova.js hides the floating pill whenever a modal is open —
         body.nc-modal-open .jr-pill{opacity:0}
       which is right everywhere except here. The answer card declares itself
       aria-modal="true" (it is one, and screen readers need to know), so that
       rule fired and faded out the very thing the reader had just watched fly
       to the middle of the screen. Three classes to their two, so this wins on
       specificity without !important doing the arguing. */
    'body.nc-modal-open .jr-pill.ncg-fly{opacity:1;pointer-events:none}',

    /* The scan: a band sweeping down the pill, and rings leaving the orb. */
    '.ncg-scan{position:fixed;z-index:99993;pointer-events:none;border-radius:999px;overflow:hidden;opacity:0;transition:opacity .2s}',
    '.ncg-scan.on{opacity:1}',
    '.ncg-scan i{position:absolute;left:-10%;width:120%;height:34%;',
      'background:linear-gradient(180deg,transparent,rgba(0,229,255,.85),rgba(182,255,60,.5),transparent);',
      'filter:blur(1px);animation:ncgSweep 1s linear infinite}',
    '@keyframes ncgSweep{0%{top:-40%}100%{top:104%}}',
    '.ncg-ring{position:fixed;z-index:99991;pointer-events:none;border-radius:50%;',
      'border:2px solid rgba(0,229,255,.55);opacity:0;animation:ncgRing 1.5s ease-out infinite}',
    '@keyframes ncgRing{0%{transform:scale(.5);opacity:.75}100%{transform:scale(2.6);opacity:0}}',

    /* Not vertically centred: `top` is set at runtime from where Nova actually
       landed, so the answer always sits UNDER her rather than on top of her.
       She flew to the middle to be looked at; covering her with the answer
       would undo the whole gesture. */
    '.ncg-card{position:fixed;z-index:99994;left:50%;transform:translateX(-50%) scale(.94);',
      'width:min(620px,92vw);overflow:auto;opacity:0;pointer-events:none;',
      'padding:22px 24px 20px;border-radius:24px;text-align:left;',
      'background:linear-gradient(165deg,rgba(18,24,44,.95),rgba(9,12,24,.98));',
      'border:1px solid rgba(0,229,255,.28);',
      'box-shadow:0 0 0 1px rgba(124,92,255,.16),0 0 50px -10px rgba(0,229,255,.5),0 30px 80px rgba(0,0,0,.75);',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
      'font:15px/1.6 "Segoe UI",system-ui,sans-serif;color:#E8EEFF;',
      'transition:opacity .34s,transform .44s cubic-bezier(.2,.9,.3,1.1)}',
    '.ncg-card.on{opacity:1;pointer-events:auto;transform:translateX(-50%) scale(1)}',
    '.ncg-card h2{margin:0 0 3px;font:800 1.28rem/1.2 "Segoe UI",system-ui,sans-serif;color:#fff;letter-spacing:-.01em}',
    '.ncg-card .ncg-what{margin:0 0 15px;color:#9FB6D8;font-size:.93rem}',
    '.ncg-card ol{margin:0;padding-left:0;list-style:none;counter-reset:ncg}',
    '.ncg-card li{counter-increment:ncg;position:relative;padding-left:34px;margin-bottom:11px;font-size:.94rem}',
    '.ncg-card li::before{content:counter(ncg);position:absolute;left:0;top:1px;width:23px;height:23px;',
      'border-radius:50%;display:flex;align-items:center;justify-content:center;',
      'font:800 .74rem/1 "Segoe UI",system-ui,sans-serif;color:#04121A;',
      'background:linear-gradient(150deg,#7DE3FF,#00E5FF)}',
    '.ncg-card b{color:#fff}',
    '.ncg-card kbd{font:600 .8em/1 ui-monospace,Consolas,monospace;background:rgba(255,255,255,.1);',
      'border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:2px 5px}',
    '.ncg-tip{margin:14px 0 0;padding:11px 13px;border-radius:13px;font-size:.88rem;color:#CFE6FF;',
      'background:rgba(0,229,255,.08);border-left:3px solid #00E5FF}',
    '.ncg-row{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}',
    '.ncg-row button{flex:1 1 auto;min-height:42px;padding:10px 18px;border-radius:12px;cursor:pointer;',
      'font:700 .9rem/1 "Segoe UI",system-ui,sans-serif;border:1px solid rgba(0,229,255,.3);',
      'background:rgba(0,229,255,.1);color:#DFF6FF;transition:.15s}',
    '.ncg-row button:hover{background:rgba(0,229,255,.2)}',
    '.ncg-row button.prim{background:linear-gradient(150deg,#00E5FF,#7C5CFF);color:#04121A;border-color:transparent}',
    '.ncg-status{position:fixed;z-index:99994;left:50%;transform:translateX(-50%);',
      'font:700 .78rem/1 "Segoe UI",system-ui,sans-serif;letter-spacing:2.4px;text-transform:uppercase;',
      'color:#7DE3FF;text-shadow:0 0 12px rgba(0,229,255,.7);opacity:0;transition:opacity .25s}',
    '.ncg-status.on{opacity:1}',
    '@media (prefers-reduced-motion:reduce){',
      '.jr-pill.ncg-fly{transition:none!important}',
      '.ncg-scan i,.ncg-ring{animation:none}',
      '.ncg-card{transition:opacity .2s}}'
  ].join('');

  var back, card, scan, status, rings = [], saved = null, homeRect = null,
      open = false, timers = [];

  function el(tag, cls) { var d = document.createElement(tag); if (cls) d.className = cls; return d; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function ensure() {
    if (document.getElementById('ncg-css')) return;
    var st = el('style'); st.id = 'ncg-css'; st.textContent = CSS;
    document.head.appendChild(st);

    back = el('div', 'ncg-back'); back.id = 'ncg-back';
    back.addEventListener('click', close);
    document.body.appendChild(back);

    scan = el('div', 'ncg-scan'); scan.innerHTML = '<i></i>';
    document.body.appendChild(scan);

    status = el('div', 'ncg-status');
    document.body.appendChild(status);

    card = el('div', 'ncg-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'How to use this page');
    document.body.appendChild(card);

    for (var i = 0; i < 3; i++) {
      var r = el('div', 'ncg-ring');
      r.style.animationDelay = (i * 0.5) + 's';
      r.style.display = 'none';
      document.body.appendChild(r);
      rings.push(r);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) close();
    });
    addEventListener('resize', function () { if (open) close(); });
  }

  /* Put the scan band and the rings exactly over wherever the pill is now. */
  function placeOver(pill) {
    var r = pill.getBoundingClientRect();
    scan.style.left = r.left + 'px';
    scan.style.top = r.top + 'px';
    scan.style.width = r.width + 'px';
    scan.style.height = r.height + 'px';
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.max(r.width, r.height);
    rings.forEach(function (ring) {
      ring.style.display = 'block';
      ring.style.width = d + 'px';
      ring.style.height = d + 'px';
      ring.style.left = (cx - d / 2) + 'px';
      ring.style.top = (cy - d / 2) + 'px';
    });
    status.style.top = (r.top + r.height + 18) + 'px';
  }

  function render(g) {
    card.innerHTML =
      '<h2>' + esc(g.title) + '</h2>' +
      '<p class="ncg-what">' + g.what + '</p>' +
      '<ol>' + g.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
      (g.tip ? '<p class="ncg-tip">' + g.tip + '</p>' : '') +
      '<div class="ncg-row">' +
        '<button class="prim" id="ncg-ok">Got it</button>' +
        '<button id="ncg-ask">Ask Nova something else</button>' +
      '</div>';
    document.getElementById('ncg-ok').onclick = close;
    document.getElementById('ncg-ask').onclick = function () {
      close();
      later(function () { try { if (window.ncNova) ncNova.open(); } catch (e) {} }, 420);
    };
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[<>&]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
    });
  }

  function show() {
    var pill = document.getElementById(PILL);
    if (!pill || open) return;
    ensure();
    open = true;
    clearTimers();

    /* Record every inline value before touching any of them. The pill's
       position may have been dragged and remembered, and it has to go back
       exactly there — restored, not recomputed. */
    var r = pill.getBoundingClientRect();
    saved = { left: pill.style.left, top: pill.style.top, right: pill.style.right,
              bottom: pill.style.bottom, transform: pill.style.transform,
              zIndex: pill.style.zIndex };
    homeRect = { left: r.left, top: r.top };

    back.classList.add('on');

    /* Pin it where it visually is, so the flight has a start point. */
    pill.style.left = r.left + 'px';
    pill.style.top = r.top + 'px';
    pill.style.right = 'auto';
    pill.style.bottom = 'auto';
    pill.style.transform = 'none';
    void pill.offsetWidth;                       // commit before transitioning

    pill.classList.add('ncg-fly');
    var cx = Math.max(8, (innerWidth - r.width) / 2);
    var cy = Math.max(14, innerHeight * 0.15 - r.height / 2);
    pill.style.setProperty('--ncg-t', 'scale(1.45)');
    pill.style.left = cx + 'px';
    pill.style.top = cy + 'px';
    pill.style.transform = 'scale(1.45)';

    var fly = reduced ? 0 : 560;
    var scanMs = reduced ? 0 : 1450;

    later(function () {
      placeOver(pill);
      if (!reduced) {
        scan.classList.add('on');
        rings.forEach(function (x) { x.style.display = 'block'; });
      }
      status.textContent = 'reading this page…';
      status.classList.add('on');
    }, fly);

    later(function () {
      scan.classList.remove('on');
      rings.forEach(function (x) { x.style.display = 'none'; });
      status.classList.remove('on');
      render(guideFor());
      var pr = pill.getBoundingClientRect();
      var top = Math.round(pr.bottom + 26);
      card.style.top = top + 'px';
      card.style.maxHeight = Math.max(180, innerHeight - top - 22) + 'px';
      card.classList.add('on');
      var ok = document.getElementById('ncg-ok');
      if (ok) try { ok.focus({ preventScroll: true }); } catch (e) { ok.focus(); }
    }, fly + scanMs);
  }

  function close() {
    if (!open) return;
    open = false;
    clearTimers();
    var pill = document.getElementById(PILL);
    card.classList.remove('on');
    scan.classList.remove('on');
    status.classList.remove('on');
    rings.forEach(function (x) { x.style.display = 'none'; });
    back.classList.remove('on');

    if (!pill || !saved) { saved = null; return; }

    /* Fly home, then hand the inline styles back exactly as they were found.

       Two cases, and the difference matters. If the pill had an inline left/top
       it had been DRAGGED there and must land on those coordinates. If it did
       not, it was sitting wherever the stylesheet puts it — so the flight home
       aims at the rect recorded on the way in, and the restore then clears the
       inline values so the stylesheet takes it back over. Either way the reader
       finds their assistant where they left it. */
    var home = saved;
    pill.style.transform = 'none';
    pill.style.left = home.left || (homeRect.left + 'px');
    pill.style.top = home.top || (homeRect.top + 'px');

    later(function () {
      pill.classList.remove('ncg-fly');
      pill.style.left = home.left;
      pill.style.top = home.top;
      pill.style.right = home.right;
      pill.style.bottom = home.bottom;
      pill.style.transform = home.transform;
      pill.style.zIndex = home.zIndex;
      pill.style.removeProperty('--ncg-t');
      saved = null;
    }, reduced ? 0 : 500);
  }

  /* ---- the button --------------------------------------------------------
     Added to the pill itself so it inherits the drag, and pinned just outside
     its edge. Waits for jarvis.js to have built the pill. */
  function addButton() {
    var pill = document.getElementById(PILL);
    if (!pill) return false;
    if (pill.querySelector('.ncg-btn')) return true;
    ensure();
    var b = el('button', 'ncg-btn');
    b.type = 'button';
    b.id = 'ncg-btn';
    b.textContent = '?';
    b.title = 'How do I use this page?';
    b.setAttribute('aria-label', 'How do I use this page?');
    b.addEventListener('click', function (e) {
      /* The pill opens the voice sheet when clicked, and this button lives
         inside it. Without both of these, asking for instructions also starts
         the microphone. */
      e.preventDefault();
      e.stopPropagation();
      show();
    });
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    pill.appendChild(b);
    return true;
  }

  var tries = 0;
  (function wait() {
    if (addButton()) return;
    if (++tries > 60) return;            // jarvis is not on this page; fine
    setTimeout(wait, 120);
  })();

  window.ncGuide = { show: show, close: close, guideFor: guideFor, pages: GUIDE };
})();
