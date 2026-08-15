/* JARVIS — a personal AI assistant for each NovaClip user.
 *
 * Site-wide, no dependencies, no build step. Loaded with defer on every page
 * right after biometric.js, so it can share the microphone politely: while
 * Jarvis is listening for a voice message it pauses biometric voice commands
 * and restores them afterwards.
 *
 * What it knows about you (all local, nothing sent anywhere except the AI
 * prompt you trigger yourself):
 *   - your biometric sign-in name, or your connected channel name
 *   - your NovaCoin balance
 *   - the page you are on
 * A "call me <name>" or "my name is <name>" tells it your name for good.
 *
 * Commands it can run without the AI: points, help, open a page, tickle Nova,
 * time/date, who you are, which page you are on, sign out. Everything else is
 * answered by the same ncAsk() every AI feature uses, with a Jarvis persona.
 */
(function () {
  if (window.ncJarvis) return;                    /* never double-mount */
  if (location.search.indexOf('embed=1') !== -1) return;  /* iframe shells: the parent owns the FAB */

  var $ = function (id) { return document.getElementById(id); };

  /* ----------------------------------------------------------------
   * personalisation
   * ---------------------------------------------------------------- */
  function storedName() {
    try { return localStorage.getItem('nc_jarvis_name') || ''; } catch (e) { return ''; }
  }
  function bioName() {
    try {
      if (window.ncBiometric && typeof ncBiometric.signedInName === 'function') {
        var n = ncBiometric.signedInName();
        if (n) return n;
      }
      var r = localStorage.getItem('nc_name');
      if (r) return r;
    } catch (e) {}
    return '';
  }
  function channelName() {
    try {
      var y = JSON.parse(localStorage.getItem('nc_yt') || 'null');
      if (y && y.channel) return y.channel;
    } catch (e) {}
    return '';
  }
  function userName() { return storedName() || bioName() || channelName() || ''; }
  function points() {
    try {
      if (typeof getPts === 'function') return getPts();
      return parseInt(localStorage.getItem('nc_points') || '0');
    } catch (e) { return 0; }
  }
  function pageName() {
    var p = (location.pathname || '').split('/').pop() || '';
    var map = { 'index.html':'Home', 'app.html':'Studio', 'analytics.html':'Analytics',
      'editor.html':'Editor', 'game.html':'Games', 'novalife.html':'NovaLife',
      'pricing.html':'Pricing', 'progress.html':'Progress', 'publish.html':'Publish',
      'socials.html':'Socials', 'studio-ai.html':'AI', 'trends.html':'Trend Spotter',
      'ai.html':'NovaClip AI', 'coder.html':'Coder', 'parent.html':'Family' };
    return map[p] || p || 'this page';
  }
  function gz() { try { return typeof ncGenZ === 'function' && ncGenZ(); } catch (e) { return false; } }

  /* ----------------------------------------------------------------
   * speech
   * ---------------------------------------------------------------- */
  var TTS = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function bioVoiceOn() {
    try {
      if (!window.ncBiometric) return false;
      return typeof ncBiometric.voiceOn === 'function' ? ncBiometric.voiceOn() : !!ncBiometric.voiceOn;
    } catch (e) { return false; }
  }
  function bioStop() { try { if (window.ncBiometric && bioVoiceOn()) ncBiometric.stopVoice(); } catch (e) {} }
  function bioStart() { try { if (window.ncBiometric) ncBiometric.startVoice(); } catch (e) {} }

  function speak(text) {
    if (!TTS || !speakOn()) return;
    try {
      TTS.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1.04;
      var voices = TTS.getVoices();
      for (var i = 0; i < voices.length; i++) {
        if (/male|Daniel|Alex|Google UK English Male|Google US English Male|Microsoft David|Microsoft Mark/i.test(voices[i].name)) {
          u.voice = voices[i]; break;
        }
      }
      TTS.speak(u);
    } catch (e) {}
  }

  var bioWasOn = false, rec = null;
  function stopListen() {
    if (rec) { try { rec.onend = null; rec.onerror = null; rec.abort(); } catch (e) {} rec = null; }
    var mic = $('jr-mic');
    if (mic) mic.classList.remove('live');
    if (bioWasOn) bioStart();
    bioWasOn = false;
  }
  function startListen() {
    if (!SR) { say('Voice input needs Chrome, Edge or Safari.', 'jar'); return; }
    bioWasOn = bioVoiceOn();
    if (bioWasOn) bioStop();
    rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = function (e) {
      var text = '';
      for (var i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
      stopListen();
      if (text && text.trim()) handle(text.trim());
    };
    rec.onerror = function () { stopListen(); say('Couldn\u2019t hear you \u2014 try again.', 'jar'); };
    rec.onend = function () { if (rec) stopListen(); };
    var mic = $('jr-mic');
    if (mic) mic.classList.add('live');
    try { rec.start(); } catch (e) { stopListen(); say('Couldn\u2019t start the microphone.', 'jar'); }
  }

  /* ----------------------------------------------------------------
   * the brain
   * ---------------------------------------------------------------- */
  var PAGE_KEY = [
    ['editor', 'editor.html'], ['studio', 'app.html'], ['analytics', 'analytics.html'],
    ['trend', 'trends.html'], ['games', 'game.html'], ['game', 'game.html'],
    ['ai', 'studio-ai.html'], ['pricing', 'pricing.html'], ['home', 'index.html'],
    ['progress', 'progress.html'], ['social', 'socials.html'], ['publish', 'publish.html'],
    ['novalife', 'novalife.html'], ['family', 'parent.html']
  ];

  function s(plain, slang) { return gz() ? slang : plain; }
  function fixName() {
    var n = userName();
    return n ? n : s('friend', 'bestie');
  }

  function respond(q) {
    q = q.toLowerCase().replace(/[!.?]+$/g, '').trim();

    /* "call me X" / "my name is X" — remember it */
    var who = q.match(/(?:call me|my name'?s|my name is|i'?m called|please call me)\s+(.{1,24})$/i);
    if (who) {
      var nm = who[1].replace(/\s+/g, ' ').trim();
      if (nm) {
        try { localStorage.setItem('nc_jarvis_name', nm); } catch (e) {}
        return 'Nice to meet you, ' + nm + '. I\u2019m Jarvis, your NovaClip assistant.';
      }
    }

    if (/(^|[^a-z])(hi|hey|hello|yo|sup|hiii?|good (morning|afternoon|evening)|howdy)\b/.test(q)) {
      return s('Hey ' + fixName() + '. I\u2019m Jarvis, your NovaClip assistant. Ask me about your points, or say "help" to see what I can do.',
               'yo ' + fixName() + ', it\u2019s Jarvis fr. Ask me about ur points, or say "help" to see what I can do.');
    }
    if (/(^|[^a-z])(what can you do|help|commands|your skills|abilities)\b/.test(q)) {
      return s(
        'I can: check your NovaCoins \u00b7 open any page \u00b7 tickle Nova \u00b7 tell the time \u00b7 say which page you\u2019re on \u00b7 sign you out. ' +
        'Tell me your name and I\u2019ll remember it. Anything else, I\u2019ll ask the AI.',
        'I can: check ur NovaCoins \u00b7 open any page \u00b7 tickle Nova \u00b7 drop the time \u00b7 tell u what page u on \u00b7 sign u out. Tell me ur name and I\u2019ll remember it fr. Anything else, the AI handles.');
    }
    if (/(point|coin|balance|wallet|how much (do i|have)|earned|nova.?coins)/.test(q)) {
      var p = points();
      return s('You have ' + p.toLocaleString() + ' NovaCoins in the bank.',
               'U got ' + p.toLocaleString() + ' NovaCoins in the bag fr.');
    }
    if (/(^|[^a-z])(who are you|your name|what are you|about you)\b/.test(q)) {
      return s('I\u2019m Jarvis — your personal AI assistant for NovaClip. I live in every page and I\u2019m here to help you create, learn and keep track of your NovaCoins.',
               'I\u2019m Jarvis \u2014 ur personal AI assistant for NovaClip. I\u2019m in every page, here to help u create, learn n keep ur NovaCoins in check.');
    }
    if (/(^|[^a-z])(what time|what'?s the time|the date|what day)\b/.test(q)) {
      return new Date().toLocaleString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    }
    if (/(where am i|what page|this page|which page|where are we|what'?s this)/.test(q)) {
      return s('You are on the ' + pageName() + ' page.', 'U on the ' + pageName() + ' page rn.');
    }
    if (/(sign out|log out|logout)/.test(q)) {
      try { if (window.ncBiometric && typeof ncBiometric.signOut === 'function') ncBiometric.signOut(); } catch (e) {}
      return s('Signed you out of biometric sign-in.', 'Signed u out of bio sign-in.');
    }
    if (/(tickle|pet|play with) nova/.test(q)) {
      if ((location.pathname || '').indexOf('novalife.html') !== -1) {
        try { if (window.ncLife && typeof ncLife.tickle === 'function') { ncLife.tickle(); return s('Done \u2014 Nova giggled!', 'Done \u2014 Nova giggling fr!'); } } catch (e) {}
      }
      location.href = 'novalife.html';
      return s('Off to NovaLife \u2014 tap Nova once you\u2019re there, or say it again.', 'Headed to NovaLife \u2014 tap Nova when ur there, or say it again.');
    }

    /* "open <page>" */
    if (/(^|[^a-z])(open|go to|take me to|navigate to|bring me to)\s+(.+)/.test(q)) {
      var target = RegExp.$3;
      for (var i = 0; i < PAGE_KEY.length; i++) {
        if (target.indexOf(PAGE_KEY[i][0]) !== -1) {
          location.href = PAGE_KEY[i][1];
          return s('Opening ' + PAGE_KEY[i][1] + '.', 'Opening ' + PAGE_KEY[i][1] + '.');
        }
      }
      return s('I don\u2019t know that page yet \u2014 try "open editor" or "open games".', 'I don\u2019t know that page yet \u2014 try "open editor" or "open games".');
    }

    return askAI(q);
  }

  function askAI(q) {
    if (typeof window.ncAsk !== 'function') {
      return s('My brain is offline on this page \u2014 try the NovaClip AI page, or say "help" for what I can do here.',
               'My brain offline rn \u2014 try the NovaClip AI page, or say "help" for what I can do here.');
    }
    return window.ncAsk(
      'You are JARVIS, a friendly personal AI assistant inside the NovaClip app for ' + fixName() + '. ' +
      (gz() ? 'Answer in heavy gen-z slang with a few emojis, but stay genuinely useful. ' : 'Answer in clear, friendly everyday English. ') +
      'Context: the user has ' + points() + ' NovaCoins and is on the ' + pageName() + ' page. ' +
      'Keep it under 90 words, be specific and helpful, and don\u2019t invent numbers.\n\n' + q,
      { maxTokens: 220, temperature: 0.7 }
    ).then(function (r) {
      if (r && !r.err && r.text) return r.text.trim();
      return s('My AI is being flaky right now \u2014 try again in a moment. Meanwhile, say "help" to see what I can do directly.',
               'The AI be buggin rn \u2014 try again in a sec. Meanwhile, say "help" to see what I can do directly.');
    });
  }

  /* ----------------------------------------------------------------
   * panel rendering
   * ---------------------------------------------------------------- */
  var open = false;
  function say(text, who) {
    var body = $('jr-body');
    if (!body) return;
    var d = document.createElement('div');
    d.className = 'jr-msg ' + who;
    if (who === 'jar') {
      var nm = document.createElement('span');
      nm.className = 'jr-name';
      nm.textContent = 'Jarvis';
      d.appendChild(nm);
    }
    d.appendChild(document.createTextNode(text));
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function typing(on) {
    var body = $('jr-body');
    if (!body) return;
    var t = $('jr-typing');
    if (on && !t) {
      t = document.createElement('div');
      t.id = 'jr-typing';
      t.className = 'jr-typing';
      t.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(t);
      body.scrollTop = body.scrollHeight;
    } else if (!on && t) {
      t.remove();
    }
  }

  function handle(text) {
    say(text, 'user');
    typing(true);
    var out = respond(text);
    Promise.resolve(out).then(function (reply) {
      typing(false);
      say(reply, 'jar');
      speak(reply);
    });
  }

  function speakOn() {
    try { return localStorage.getItem('nc_jarvis_speak') !== '0'; } catch (e) { return true; }
  }
  function setSpeakOn(v) {
    try { localStorage.setItem('nc_jarvis_speak', v ? '1' : '0'); } catch (e) {}
    var b = $('jr-speak');
    if (b) b.textContent = v ? '\ud83d\udd0a' : '\ud83d\udd07';
  }

  function build() {
    var st = document.createElement('style');
    st.id = 'jr-css';
    st.textContent = [
      '.jr-fab{position:fixed;right:86px;bottom:18px;z-index:99980;width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,.18);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px;background:linear-gradient(135deg,rgba(18,24,40,.85),rgba(10,14,26,.92));color:#fff;font-family:inherit;box-shadow:0 8px 30px rgba(0,0,0,.55),0 0 0 1px rgba(124,92,255,.25),0 0 24px rgba(124,92,255,.35);backdrop-filter:blur(12px);transition:transform .2s,box-shadow .2s}',
      '.jr-fab:hover{transform:scale(1.07);box-shadow:0 10px 34px rgba(0,0,0,.6),0 0 0 1px rgba(124,92,255,.5),0 0 34px rgba(124,92,255,.55)}',
      '.jr-fab .jr-eye{width:22px;height:13px;border-radius:60% 60% 55% 55%;background:linear-gradient(135deg,#00E5FF,#7C5CFF);box-shadow:0 0 12px #00E5FF;position:relative;display:block}',
      '.jr-fab .jr-eye::after{content:"";position:absolute;inset:3px;border-radius:50%;background:rgba(6,10,20,.88)}',
      '.jr-fab .jr-lbl{font-size:8.5px;letter-spacing:.7px;color:#9fb0cc;text-transform:uppercase}',
      '.jr-bubble{position:absolute;right:calc(100% + 14px);bottom:10px;white-space:nowrap;padding:8px 13px;border-radius:14px 14px 4px 14px;background:linear-gradient(135deg,#7C5CFF,#00E5FF);color:#fff;font-size:.78rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45),0 0 18px rgba(0,229,255,.35);font-family:inherit;animation:jrBub .35s .9s cubic-bezier(.2,.9,.3,1.2) backwards}',
      '.jr-bubble::after{content:"";position:absolute;right:-8px;bottom:13px;border:8px solid transparent;border-left-color:#00B8FF;border-bottom-color:#00B8FF}',
      '.jr-bubble.out{opacity:0;transform:translateX(8px);transition:.3s}',
      '@keyframes jrBub{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}',
      '.jr-panel{position:fixed;right:18px;bottom:88px;z-index:99985;width:344px;max-width:calc(100vw - 28px);height:480px;max-height:calc(100vh - 110px);display:none;flex-direction:column;border-radius:20px;overflow:hidden;background:linear-gradient(165deg,rgba(17,22,38,.92),rgba(9,13,24,.96));border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(20px);box-shadow:0 24px 70px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.08),0 0 0 1px rgba(124,92,255,.18),0 0 44px -10px rgba(124,92,255,.35);font-family:"Segoe UI",-apple-system,sans-serif}',
      '.jr-panel.open{display:flex;animation:jrPop .25s cubic-bezier(.2,.9,.3,1.3) both}',
      '@keyframes jrPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}',
      '.jr-head{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(90deg,rgba(124,92,255,.18),rgba(0,229,255,.10))}',
      '.jr-ava{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;background:linear-gradient(135deg,#7C5CFF,#00E5FF);box-shadow:0 0 16px rgba(0,229,255,.45)}',
      '.jr-ttl{font-weight:800;font-size:.95rem;color:#fff;letter-spacing:.3px}',
      '.jr-on{display:flex;align-items:center;gap:5px;font-size:.66rem;color:#B6FF3C;text-transform:uppercase;letter-spacing:.6px}',
      '.jr-on i{width:7px;height:7px;border-radius:50%;background:#B6FF3C;box-shadow:0 0 8px #B6FF3C;font-style:normal}',
      '.jr-acts{margin-left:auto;display:flex;gap:4px}',
      '.jr-acts button{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#cfd8ea;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:.15s}',
      '.jr-acts button:hover{background:rgba(255,255,255,.12)}',
      '.jr-body{flex:1;min-height:0;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent}',
      '.jr-body::-webkit-scrollbar{width:5px}.jr-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:3px}',
      '.jr-msg{max-width:82%;padding:9px 12px;border-radius:14px;font-size:.84rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;animation:jrMsg .18s ease both}',
      '@keyframes jrMsg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
      '.jr-msg.user{align-self:flex-end;background:linear-gradient(135deg,#7C5CFF,#00E5FF);color:#fff;border-bottom-right-radius:4px;box-shadow:0 4px 14px rgba(124,92,255,.3)}',
      '.jr-msg.jar{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#E8EEFF;border-bottom-left-radius:4px}',
      '.jr-msg.jar .jr-name{display:block;font-size:.62rem;letter-spacing:1.4px;text-transform:uppercase;color:#9fb0cc;margin-bottom:3px}',
      '.jr-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}',
      '.jr-typing i{width:6px;height:6px;border-radius:50%;background:#9fb0cc;animation:jrDot 1s infinite}',
      '.jr-typing i:nth-child(2){animation-delay:.15s}.jr-typing i:nth-child(3){animation-delay:.3s}',
      '@keyframes jrDot{0%,100%{opacity:.25}50%{opacity:1}}',
      '.jr-chips{display:flex;gap:6px;padding:8px 12px 2px;overflow-x:auto;flex-wrap:wrap}',
      '.jr-chip{padding:6px 11px;border-radius:16px;border:1px solid rgba(0,229,255,.3);background:rgba(0,229,255,.08);color:#9feaff;font-size:.72rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:.15s}',
      '.jr-chip:hover{background:rgba(0,229,255,.18);border-color:rgba(0,229,255,.5)}',
      '.jr-in{display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.08)}',
      '.jr-in input{flex:1;min-width:0;padding:10px 13px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#E8EEFF;font-size:.85rem;font-family:inherit;outline:none}',
      '.jr-in input:focus{border-color:rgba(0,229,255,.5);box-shadow:0 0 0 3px rgba(0,229,255,.15)}',
      '.jr-in button{width:38px;height:38px;flex:none;border-radius:12px;border:1px solid rgba(255,255,255,.14);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:.15s}',
      '.jr-send{background:linear-gradient(135deg,#7C5CFF,#00E5FF);color:#fff}',
      '.jr-send:hover{box-shadow:0 0 18px rgba(0,229,255,.4)}',
      '.jr-mic{background:rgba(255,255,255,.07);color:#cfd8ea}',
      '.jr-mic:hover{background:rgba(255,255,255,.14)}',
      '.jr-mic.live{background:rgba(247,37,133,.2);border-color:#F72585;color:#ff9ec6;animation:jrMic 1s ease-in-out infinite}',
      '@keyframes jrMic{50%{box-shadow:0 0 16px rgba(247,37,133,.5)}}',
      '@media (max-width:560px){.jr-fab{right:82px}.jr-panel{right:10px;left:10px;width:auto;max-width:none}}',
      '@media (prefers-reduced-motion:reduce){.jr-panel.open,.jr-msg,.jr-typing i,.jr-mic.live{animation:none}}'
    ].join('');
    document.head.appendChild(st);

    var fab = document.createElement('button');
    fab.className = 'jr-fab';
    fab.setAttribute('aria-label', 'Open Jarvis assistant');
    fab.innerHTML = '<span class="jr-eye"></span><span class="jr-lbl">Jarvis</span>';
    fab.style.right = document.getElementById('ncb-fab') ? '86px' : '18px';
    fab.onclick = toggle;
    document.body.appendChild(fab);

    var bubble = document.createElement('button');
    bubble.className = 'jr-bubble';
    bubble.setAttribute('aria-label', 'Say hi to Jarvis');
    bubble.innerHTML = 'Hi! I\u2019m Jarvis';
    bubble.onclick = function (e) { e.stopPropagation(); dismissBubble(); openPanel(); };
    fab.appendChild(bubble);
    setTimeout(dismissBubble, 6500);

    var pan = document.createElement('div');
    pan.className = 'jr-panel';
    pan.id = 'jr-panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-label', 'Jarvis assistant');
    pan.innerHTML =
      '<div class="jr-head">' +
        '<div class="jr-ava">\u2728</div>' +
        '<div><div class="jr-ttl">Jarvis</div><div class="jr-on"><i></i>online</div></div>' +
        '<div class="jr-acts">' +
          '<button id="jr-speak" title="Voice replies">\ud83d\udd0a</button>' +
          '<button id="jr-close" title="Close">\u2715</button>' +
        '</div>' +
      '</div>' +
      '<div class="jr-body" id="jr-body"></div>' +
      '<div class="jr-chips" id="jr-chips">' +
        '<button class="jr-chip" data-c="What can you do?">What can you do?</button>' +
        '<button class="jr-chip" data-c="My points">My points</button>' +
        '<button class="jr-chip" data-c="Open editor">Open editor</button>' +
        '<button class="jr-chip" data-c="Who are you?">Who are you?</button>' +
      '</div>' +
      '<div class="jr-in">' +
        '<input id="jr-inp" placeholder="Ask Jarvis\u2026" autocomplete="off">' +
        '<button class="jr-mic" id="jr-mic" title="Voice input">\ud83c\udfa4</button>' +
        '<button class="jr-send" id="jr-send" title="Send">\u27a4</button>' +
      '</div>';
    document.body.appendChild(pan);

    $('jr-send').onclick = function () { sendInput(); };
    $('jr-mic').onclick = function () { if (rec) stopListen(); else startListen(); };
    $('jr-close').onclick = close;
    $('jr-speak').onclick = function () { setSpeakOn(!speakOn()); };
    setSpeakOn(speakOn());
    $('jr-inp').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendInput(); });
    document.querySelectorAll('#jr-chips .jr-chip').forEach(function (c) {
      c.onclick = function () { handle(c.dataset.c); };
    });
  }

  function sendInput() {
    var inp = $('jr-inp');
    var v = (inp.value || '').trim();
    if (!v) return;
    inp.value = '';
    handle(v);
  }

  function toggle() { open ? close() : openPanel(); }
  function openPanel() {
    build();
    dismissBubble();
    var pan = $('jr-panel');
    if (!pan) return;
    open = true;
    pan.classList.add('open');
    if (!$('jr-body').children.length) {
      say(s('Hey ' + fixName() + '. I\u2019m Jarvis \u2014 your personal assistant. What can I do for you?',
            'yo ' + fixName() + ', Jarvis here \u2014 ur personal assistant. What we doin?'), 'jar');
    }
    $('jr-inp').focus();
  }
  function dismissBubble() {
    var b = document.querySelector('.jr-bubble');
    if (!b) return;
    b.classList.add('out');
    setTimeout(function () { if (b.parentNode) b.remove(); }, 320);
  }
  function close() {
    open = false;
    stopListen();
    var pan = $('jr-panel');
    if (pan) pan.classList.remove('open');
  }

  /* mount only after the page has a body (defer already guarantees it, but a
     copy of this file is also loadable by hand from a script tag in the head) */
  function mount() {
    if (!document.body) { setTimeout(mount, 60); return; }
    build();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.ncJarvis = { open: openPanel, close: close, toggle: toggle, ask: handle };
})();
