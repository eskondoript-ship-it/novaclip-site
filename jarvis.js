/* JARVIS — an Iron Man-style assistant for NovaClip.
 *
 * Site-wide, no dependencies, no build step. Loaded with defer on every page
 * right after biometric.js, so it can share the microphone politely: while
 * Jarvis is listening for a voice message it pauses biometric voice commands
 * and restores them afterwards.
 *
 * The UI is a Dynamic Island: a floating pill at the top of the screen that
 * pulses with a friendly hello, then expands into the chat panel when tapped.
 *
 * What it knows about you (all local, nothing sent anywhere except the AI
 * prompt you trigger yourself — and that same text, read aloud by the site's
 * AI worker when it can speak for you):
 *   - your biometric sign-in name, or your connected channel name
 *   - your NovaCoin balance
 *   - the page you are on
 * A "call me <name>" or "my name is <name>" tells it your name for good.
 *
 * It can control the app directly (open pages, sign in/out, voice commands,
 * gen-Z mode, Nova, fullscreen, ...) and anything else is answered by the
 * same ncAsk() every AI feature uses. Pages can register their own controls
 * with ncJarvis.register({ match, run, desc }).
 */
(function () {
  if (window.ncJarvis) return;                    /* never double-mount */
  if (location.search.indexOf('embed=1') !== -1) return;  /* iframe shells: the parent owns the island */

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
   * speech + listening
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

  var ttsAudio = null;
  function stopTTS() {
    if (!ttsAudio) return;
    try { ttsAudio.pause(); ttsAudio.removeAttribute('src'); ttsAudio.load(); } catch (e) {}
    ttsAudio = null;
  }

  function speak(text) {
    /* Speech needs either the browser voice or the site's worker, and the
       toggle to actually speak at all. */
    if (!TTS && !window.NC_AI_WORKER_URL) return;
    if (!speakOn()) return;
    stopTTS();
    setMode('speak');
    var done = function () { setMode(wake.armed && !open ? 'armed' : 'idle'); };

    /* Preferred path: the AI worker reads it aloud with a proper voice. The
       browser's own voice is only the fallback for when the worker is down,
       out of quota, or unreachable — the reply is on screen either way, so a
       voice failing is never worth being stuck on. */
    if (window.NC_AI_WORKER_URL) {
      fetch(window.NC_AI_WORKER_URL + '/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      }).then(function (r) {
        return r.ok ? r.blob() : null;
      }).then(function (blob) {
        if (!blob) return local();
        var url = URL.createObjectURL(blob);
        var a = new Audio(url);
        ttsAudio = a;
        var release = function () {
          try { URL.revokeObjectURL(url); } catch (e) {}
          ttsAudio = null;
        };
        var fellBack = false;
        var localOnce = function () { if (fellBack) return; fellBack = true; release(); local(); };
        a.onended = function () { release(); done(); };
        a.onerror = function () { release(); localOnce(); };
        a.play().catch(function () { release(); localOnce(); });
      }).catch(function () { local(); });
      return;
    }

    local();
    function local() {
      if (!TTS) return done();
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
        u.onend = function () { setMode(wake.armed && !open ? 'armed' : 'idle'); };
        u.onerror = function () { setMode(wake.armed && !open ? 'armed' : 'idle'); };
        TTS.speak(u);
      } catch (e) { setMode(wake.armed && !open ? 'armed' : 'idle'); }
    }
  }

  /* ---- one-shot capture: the mic button and the wake word both use it ---- */
  var bioWasOn = false, rec = null;
  function stopListen() {
    if (rec) { try { rec.onend = null; rec.onerror = null; rec.abort(); } catch (e) {} rec = null; }
    if (bioWasOn) bioStart();
    bioWasOn = false;
    var m = $('jr-mic');
    if (m) m.classList.remove('live');
    setMode(wake.armed && !open ? 'armed' : 'idle');
  }
  function captureOnce(cb, ms) {
    if (!SR) { if (cb) cb(''); return; }
    var done = false, tim = setTimeout(function () { finish(); if (cb) cb(''); }, ms || 9000);
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(tim);
      if (rec) { try { rec.onend = null; rec.onerror = null; rec.abort(); } catch (e) {} rec = null; }
      if (bioWasOn) bioStart();
      bioWasOn = false;
      var m = $('jr-mic');
      if (m) m.classList.remove('live');
      if (wake.armed && !open && !wake.capturing) setTimeout(reArm, 700);
    }
    bioWasOn = bioVoiceOn();
    if (bioWasOn) bioStop();
    stopWake();
    rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = function (e) {
      var text = '';
      for (var i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
      finish();
      if (cb) cb(text);
    };
    rec.onerror = function () { finish(); if (cb) cb(''); };
    rec.onend = function () { if (!done) { finish(); if (cb) cb(''); } };
    var m = $('jr-mic');
    if (m) m.classList.add('live');
    setMode('listen');
    try { rec.start(); } catch (e) { finish(); if (cb) cb(''); }
  }
  function startListen() {
    if (!SR) { say('Voice input needs Chrome, Edge or Safari.', 'jar'); return; }
    setMode('listen');
    captureOnce(function (text) {
      if (text && text.trim()) handle(text.trim());
      else say('Couldn\u2019t hear you \u2014 try again.', 'jar');
    });
  }

  /* ---- wake word: always listening for "hey Jarvis" ---- */
  var wake = { armed: wakeArmed(), rec: null, capturing: false, errAt: 0 };
  function wakeArmed() { try { return localStorage.getItem('nc_jarvis_wake') !== '0'; } catch (e) { return true; } }
  function wakeMatch(t) {
    if (t.indexOf('jarvis') === -1) return false;
    if (t.length > 70) return false;
    return /\b(hey|hey there|ok|okay|yo|alright|a\.i\.?)?\s*jarvis\b/.test(t);
  }
  function setWake(v) {
    try { localStorage.setItem('nc_jarvis_wake', v ? '1' : '0'); } catch (e) {}
    wake.armed = v;
    var b = $('jr-wake');
    if (b) b.classList.toggle('off', !v);
    if (v) { reArm(); setMode('armed'); }
    else { stopWake(); setMode('idle'); }
  }
  function startWake() {
    if (!SR || wake.rec || !wake.armed || wake.capturing || open) return;
    if (bioVoiceOn()) { setTimeout(reArm, 2500); return; }   /* yield to biometric */
    try {
      var r = new SR();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 3;
      r.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var t = (e.results[i][0].transcript || '').toLowerCase();
          if (wakeMatch(t)) { wakeHit(); break; }
        }
      };
      r.onerror = function (ev) {
        if (ev && /not-allowed|service-not-allowed|audio-capture/.test(ev.error)) wake.errAt = Date.now();
      };
      r.onend = function () {
        wake.rec = null;
        if (wake.armed && !open && !wake.capturing) setTimeout(reArm, 500);
      };
      wake.rec = r;
      r.start();
    } catch (e) { wake.rec = null; }
  }
  function stopWake() {
    if (wake.rec) { try { wake.rec.onend = null; wake.rec.onerror = null; wake.rec.abort(); } catch (e) {} wake.rec = null; }
  }
  function reArm() {
    if (!wake.armed || open || wake.capturing) return;
    if (bioVoiceOn()) { setTimeout(reArm, 2500); return; }
    if (wake.errAt && Date.now() - wake.errAt < 30000) { setTimeout(reArm, 30000); return; }
    if (!wake.rec) startWake();
  }
  function wakeHit() {
    if (wake.capturing || open) return;
    wake.capturing = true;
    stopWake();
    bioWasOn = bioVoiceOn();
    if (bioWasOn) bioStop();
    openPanel();
    say(s('Hey ' + fixName() + '. What can I do for you?', 'yo ' + fixName() + ', what we doin?'), 'jar');
    setMode('listen');
    captureOnce(function (text) {
      wake.capturing = false;
      if (text && text.trim()) handle(text.trim());
      else say(s('Didn\u2019t catch that \u2014 say it again.', 'Didn\u2019t catch that \u2014 say it again.'), 'jar');
    }, 8000);
  }

  /* ----------------------------------------------------------------
   * control registry — pages can teach Jarvis new tricks
   * ---------------------------------------------------------------- */
  var controls = [];
  function register(opts) { if (opts && typeof opts.run === 'function') controls.push(opts); }

  /* ----------------------------------------------------------------
   * the brain
   * ---------------------------------------------------------------- */
  var PAGE_KEY = [
    ['editor', 'editor.html'], ['analytics', 'analytics.html'], ['ai', 'studio-ai.html'],
    ['coder', 'coder.html'], ['studio', 'app.html'], ['trend', 'trends.html'],
    ['games', 'game.html'], ['game', 'game.html'], ['pricing', 'pricing.html'],
    ['home', 'index.html'], ['progress', 'progress.html'], ['social', 'socials.html'],
    ['publish', 'publish.html'], ['novalife', 'novalife.html'], ['family', 'parent.html'],
    ['cert', 'progress.html']
  ];

  function s(plain, slang) { return gz() ? slang : plain; }
  function fixName() {
    var n = userName();
    return n ? n : s('friend', 'bestie');
  }

  function doOpen(q) {
    var target = q.replace(/^(open|go to|take me to|navigate to|bring me to|load|launch|switch to)\s+/i, '');
    target = target.replace(/^the\s+/, '').trim();
    if (/^studio\b/.test(target)) { location.href = 'app.html'; return 'Opening the Studio.'; }
    if (/^a\s*\/\s*ai/.test(target)) { location.href = 'studio-ai.html'; return 'Opening AI.'; }
    for (var i = 0; i < PAGE_KEY.length; i++) {
      if (target.indexOf(PAGE_KEY[i][0]) !== -1) {
        location.href = PAGE_KEY[i][1];
        return s('Opening ' + PAGE_KEY[i][1] + '.', 'Opening ' + PAGE_KEY[i][1] + '.');
      }
    }
    return s('I don\u2019t know that page yet \u2014 try "open editor" or "open games".',
             'I don\u2019t know that page yet \u2014 try "open editor" or "open games".');
  }

  function helpText() {
    return s(
      'I run this app hands-free. Say "hey Jarvis" anywhere and I\u2019ll wake up and listen. Then try: ' +
      '"my points", "open editor", "open games", "sign me in", "turn on voice commands", "gen-z on", ' +
      '"tickle Nova", "go fullscreen", "what time is it", "where am I" or "sign out". Tell me your name ' +
      'with "call me <name>" and I\u2019ll remember. Anything else, I ask the AI.',
      'I run this whole app fr. Say "hey Jarvis" anywhere and I\u2019ll wake up and listen. Then try: ' +
      '"my points", "open editor", "open games", "sign me in", "voice commands on", "gen-z on", ' +
      '"tickle Nova", "go fullscreen", "what time is it", "where am I" or "sign out". Hit me with ' +
      '"call me <name>" and I\u2019ll remember. Anything else, the AI.');
  }

  function respond(q) {
    var raw = q;
    q = q.toLowerCase().replace(/[!.?]+$/g, '').replace(/^(hey|ok|okay|yo|alright|a\.i\.?)?\s*jarvis[,!]?\s*/i, '').trim();

    /* wake word on/off — "hey jarvis off" / "turn off the wake word" */
    var wakeCmd =
      (/\b(wake word|always listening)\b/.test(q) && /\b(on|off|stop|start|turn|switch)\b/.test(q)) ||
      (/^(hey|ok|okay|yo|alright)?\s*jarvis\b/i.test(raw) && /^(on|off|stop|start)\b/.test(q));
    if (wakeCmd) {
      var wakOn = /\b(on|start)\b/.test(q) && !/\b(off|stop)\b/.test(q);
      setWake(wakOn);
      return s(wakOn
          ? 'Wake word on \u2014 I\u2019m always listening. Just say "hey Jarvis".'
          : 'Wake word off \u2014 say "hey Jarvis" to turn it back on.',
               wakOn
          ? 'Wake word on \u2014 I\u2019m always listening. Just say "hey Jarvis".'
          : 'Wake word off \u2014 say "hey Jarvis" to turn it back on.');
    }

    /* "call me X" / "my name is X" — remember it */
    var who = q.match(/(?:call me|my name'?s|my name is|i'?m called|please call me)\s+(.{1,24})$/i);
    if (who) {
      var nm = who[1].replace(/\s+/g, ' ').trim();
      if (nm) {
        try { localStorage.setItem('nc_jarvis_name', nm); } catch (e) {}
        return 'Nice to meet you, ' + nm + '. I\u2019m Jarvis, your NovaClip assistant. I can control this app for you.';
      }
    }

    if (/(^|[^a-z])(hi|hey|hello|yo|sup|hiii?|good (morning|afternoon|evening)|howdy)\b/.test(q)) {
      return s('Hey ' + fixName() + '. I\u2019m Jarvis. I can run this app for you \u2014 say "help" to see how.',
               'yo ' + fixName() + ', it\u2019s Jarvis fr. I run this app \u2014 say "help" to see how.');
    }
    if (/(^|[^a-z])(what can you do|help|commands|your skills|abilities|control)\b/.test(q)) {
      return helpText();
    }
    if (/(point|coin|balance|wallet|how much (do i|have)|earned|nova.?coins)/.test(q)) {
      var p = points();
      return s('You have ' + p.toLocaleString() + ' NovaCoins in the bank.',
               'U got ' + p.toLocaleString() + ' NovaCoins in the bag fr.');
    }
    if (/(who am i|what'?s my name|my name\b)/.test(q)) {
      return s('You are ' + fixName() + '.', 'U \u2019re ' + fixName() + '.');
    }
    if (/(^|[^a-z])(who are you|your name|what are you|about you)\b/.test(q)) {
      return s('I\u2019m Jarvis \u2014 your Iron Man-style assistant for NovaClip. I live in the island at the top of every page, and I can control the app for you.',
               'I\u2019m Jarvis \u2014 ur Iron Man-style assistant for NovaClip. I live in the island on top of every page and I control the app fr.');
    }
    if (/(^|[^a-z])(what time|what'?s the time|the date|what day)\b/.test(q)) {
      return new Date().toLocaleString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    }
    if (/(where am i|what page|this page|which page|where are we|what'?s this)/.test(q)) {
      return s('You are on the ' + pageName() + ' page.', 'U on the ' + pageName() + ' page rn.');
    }
    if (/(sign out|log out|logout|sign me out)/.test(q)) {
      try { if (window.ncBiometric && typeof ncBiometric.signOut === 'function') ncBiometric.signOut(); } catch (e) {}
      return s('Signed you out of biometric sign-in.', 'Signed u out of bio sign-in.');
    }
    if (/(sign (me )?in|log (me )?in|login|unlock|face id|scan my face|open biometric)/.test(q)) {
      try { if (window.ncBiometric && typeof ncBiometric.open === 'function') ncBiometric.open(); } catch (e) {}
      return s('Opening the biometric sign-in panel \u2014 look at the camera or say your passphrase.', 'Opening bio sign-in \u2014 look at the cam or say ur passphrase.');
    }
    if (/(voice commands|turn .*voice|voice .*on|voice .*off|start listening|stop listening)/.test(q)) {
      var on = /on|start/.test(q) && !/off/.test(q);
      try {
        if (window.ncBiometric) on ? ncBiometric.startVoice() : ncBiometric.stopVoice();
      } catch (e) {}
      return s(on ? 'Voice commands on \u2014 try "Jarvis, my points".' : 'Voice commands off.',
               on ? 'Voice commands on \u2014 say "Jarvis, my points".' : 'Voice commands off.');
    }
    if (/(gen.?z|slang|vibe).*(on|off)|switch .*(gen.?z|normal)/.test(q)) {
      var gzOn = /on/.test(q) && !/off/.test(q);
      try { if (typeof ncSetGenZ === 'function') ncSetGenZ(gzOn); } catch (e) {}
      return s('Switching to ' + (gzOn ? 'Gen-Z mode' : 'normal mode') + '. Reloading\u2026',
               'Switching to ' + (gzOn ? 'Gen-Z mode' : 'normal mode') + '. Reloading\u2026');
    }
    if (/(mute|unmute|quiet|stop (talking|speaking)|turn .*audio|turn .*voice|shut up)/.test(q)) {
      var m = /off|stop|quiet|mute|shut/.test(q);
      setSpeakOn(m ? false : true);
      return s(m ? 'Voice replies muted.' : 'Voice replies on.', m ? 'Voice replies muted.' : 'Voice replies on.');
    }
    if (/(fullscreen|full screen|go fullscreen|maximize)/.test(q)) {
      try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) {}
      return s('Going fullscreen.', 'Going fullscreen.');
    }
    if (/(go to sleep|take a nap|standby)/.test(q)) {
      setMode('sleep');
      return s('Going to sleep. Say "wake up" to bring me back.', 'Goin to sleep. Say "wake up" to bring me back.');
    }
    if (/(wake up|good morning|back online)/.test(q)) {
      setMode('idle');
      return s('Online again. What do you need?', 'Back online fr. What we doin?');
    }
    if (/(tickle|pet|play with) nova/.test(q)) {
      if ((location.pathname || '').indexOf('novalife.html') !== -1) {
        try { if (window.ncLife && typeof ncLife.tickle === 'function') { ncLife.tickle(); return s('Done \u2014 Nova giggled!', 'Done \u2014 Nova giggling fr!'); } } catch (e) {}
      }
      location.href = 'novalife.html';
      return s('Off to NovaLife \u2014 tap Nova once you\u2019re there, or say it again.', 'Headed to NovaLife \u2014 tap Nova when ur there, or say it again.');
    }
    if (/(^|[^a-z])(open|go to|take me to|navigate to|bring me to|load|launch|switch to)\s+(.+)/.test(q)) {
      return doOpen(RegExp.$3);
    }

    /* page-registered controls */
    for (var i = 0; i < controls.length; i++) {
      try {
        var hit = (typeof controls[i].match === 'function') ? controls[i].match(q)
                : (controls[i].match instanceof RegExp ? controls[i].match.test(q) : false);
        if (hit) {
          var out = controls[i].run(q);
          if (out !== undefined && out !== null && out !== false) return out;
        }
      } catch (e) {}
    }

    return askAI(q);
  }

  function askAI(q) {
    if (typeof window.ncAsk !== 'function') {
      return s('My brain is offline on this page \u2014 try the NovaClip AI page, or say "help" for what I can control here.',
               'My brain offline rn \u2014 try the NovaClip AI page, or say "help" for what I can do here.');
    }
    return window.ncAsk(
      'You are JARVIS, a personal AI assistant inside the NovaClip app for ' + fixName() + '. ' +
      'You can also control the app itself (open pages, check NovaCoins, sign in/out, voice, gen-z mode). ' +
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
      setMode('busy');
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
    if (!v) { stopTTS(); setMode(wake.armed && !open ? 'armed' : 'idle'); }
    var b = $('jr-speak');
    if (b) b.classList.toggle('off', !v);
  }

  function setMode(mode) {
    var isl = $('jr-island');
    if (!isl) return;
    isl.classList.remove('listen', 'speak', 'busy', 'sleep', 'armed');
    var em = $('jr-status');
    var map = {
      idle:  'systems online',
      armed: 'wake word armed',
      listen: 'listening\u2026',
      speak:  'transmitting',
      busy:   'thinking\u2026',
      sleep:  'standby'
    };
    if (mode !== 'idle') isl.classList.add(mode);
    if (em) em.textContent = map[mode] || map.idle;
  }

  var ICONS = {
    mic: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    dots: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    wake: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M8 8a6 6 0 0 0 0 8"/><path d="M16 8a6 6 0 0 1 0 8"/><path d="M5 5a10 10 0 0 0 0 14"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>'
  };

  var HEX = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='62' viewBox='0 0 36 62'%3E%3Cpath d='M18 1 L35 9.5 V26.5 L18 35 L1 26.5 V9.5 Z' fill='none' stroke='%2300E5FF' stroke-width='1'/%3E%3C/svg%3E\")";

  function build() {
    if (document.getElementById('jr-css')) return;
    var st = document.createElement('style');
    st.id = 'jr-css';
    st.textContent = [
      /* ---------- island ---------- */
      '.jr-island{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:99995;display:flex;align-items:center;gap:10px;padding:7px 18px 7px 9px;border-radius:999px;cursor:pointer;user-select:none;-webkit-user-select:none;background:linear-gradient(160deg,rgba(16,22,40,.82),rgba(8,11,22,.9));border:1px solid rgba(0,229,255,.32);box-shadow:0 0 0 1px rgba(124,92,255,.12),0 0 22px -5px rgba(0,229,255,.55),0 0 44px -16px rgba(124,92,255,.7),0 12px 30px rgba(0,0,0,.5);backdrop-filter:blur(18px) saturate(1.5);-webkit-backdrop-filter:blur(18px) saturate(1.5);transition:box-shadow .25s,transform .25s}',
      '.jr-island:hover{box-shadow:0 0 0 1px rgba(124,92,255,.22),0 0 30px -4px rgba(0,229,255,.75),0 0 60px -12px rgba(124,92,255,.9),0 14px 36px rgba(0,0,0,.55);transform:translateX(-50%) translateY(-1px)}',
      '.jr-island::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(120deg,rgba(0,229,255,.18),transparent 32%,transparent 68%,rgba(124,92,255,.18));opacity:0;transition:opacity .3s}',
      '.jr-island:hover::after{opacity:1}',
      '.jr-island.peek{animation:jrPeekPulse 2s ease-in-out infinite}',
      '@keyframes jrPeekPulse{0%,100%{box-shadow:0 0 0 1px rgba(124,92,255,.12),0 0 22px -5px rgba(0,229,255,.55),0 0 44px -16px rgba(124,92,255,.7),0 12px 30px rgba(0,0,0,.5)}50%{box-shadow:0 0 0 1px rgba(124,92,255,.3),0 0 34px -3px rgba(0,229,255,.85),0 0 70px -10px rgba(124,92,255,1),0 14px 36px rgba(0,0,0,.55)}}',
      '.jr-island.hidden{opacity:0;pointer-events:none;transform:translateX(-50%) scale(.8)}',
      '.jr-reactor{position:relative;width:30px;height:30px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,rgba(0,229,255,.28),rgba(10,14,26,.92) 70%);border:1px solid rgba(0,229,255,.5);box-shadow:0 0 14px -2px rgba(0,229,255,.8),inset 0 0 10px rgba(0,229,255,.25)}',
      '.jr-reactor::before{content:"";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 38%,rgba(0,229,255,.95) 50%,transparent 62% 100%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2px));animation:jrSpin 3.2s linear infinite}',
      '@keyframes jrSpin{to{transform:rotate(360deg)}}',
      '.jr-reactor .jr-eye{position:relative;width:16px;height:9px;border-radius:50% 50% 46% 46%;background:linear-gradient(135deg,#00E5FF,#7C5CFF);box-shadow:0 0 12px #00E5FF;display:block}',
      '.jr-reactor .jr-eye::after{content:"";position:absolute;inset:2.5px 2px;border-radius:50%;background:rgba(6,10,20,.92)}',
      '.jr-island.listen .jr-reactor{animation:jrReact 1s ease-in-out infinite}',
      '@keyframes jrReact{50%{box-shadow:0 0 22px -2px rgba(247,37,133,.9),inset 0 0 12px rgba(247,37,133,.4);border-color:rgba(247,37,133,.7)}}',
      '.jr-itxt{display:flex;flex-direction:column;line-height:1.12;min-width:0}',
      '.jr-itxt b{font:800 .72rem/1.1 Segoe UI,system-ui,sans-serif;letter-spacing:2.6px;color:#DFF6FF;white-space:nowrap;text-shadow:0 0 10px rgba(0,229,255,.8)}',
      '.jr-itxt em{font:600 .6rem/1 Segoe UI,system-ui,sans-serif;font-style:normal;letter-spacing:1.2px;text-transform:uppercase;color:#7FA8C9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;transition:max-width .3s}',
      '.jr-island.listen .jr-itxt em{color:#FF9EC6}',
      '.jr-idot{width:7px;height:7px;border-radius:50%;flex:none;background:#B6FF3C;box-shadow:0 0 10px #B6FF3C;animation:jrDot 1.6s ease-in-out infinite}',
      '@keyframes jrDot{0%,100%{opacity:.55}50%{opacity:1}}',
      '.jr-island.listen .jr-idot{background:#F72585;box-shadow:0 0 12px #F72585;animation:jrMic 1s ease-in-out infinite}',
      '.jr-island.speak .jr-idot{background:#00E5FF;box-shadow:0 0 14px #00E5FF}',
      '.jr-island.busy .jr-idot{background:#FFB703;box-shadow:0 0 12px #FFB703}',
      '.jr-island.sleep .jr-idot{background:#5D6A88;box-shadow:none;animation:none}',
      '.jr-island.sleep .jr-itxt b{color:#6E7EA0}',
      '@keyframes jrMic{50%{box-shadow:0 0 20px rgba(247,37,133,.9)}}',

      /* ---------- panel ---------- */
      '.jr-panel{position:fixed;top:18px;left:50%;z-index:99997;width:min(400px,94vw);height:min(560px,84vh);display:flex;flex-direction:column;border-radius:24px;overflow:hidden;background:linear-gradient(165deg,rgba(14,19,36,.94),rgba(7,10,20,.98));border:1px solid rgba(0,229,255,.3);backdrop-filter:blur(22px) saturate(1.4);-webkit-backdrop-filter:blur(22px) saturate(1.4);box-shadow:0 0 0 1px rgba(124,92,255,.16),0 0 44px -8px rgba(0,229,255,.5),0 30px 80px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06);opacity:0;pointer-events:none;transform:translateX(-50%) scale(.72) translateY(-16px);transform-origin:top center;transition:opacity .22s,transform .32s cubic-bezier(.2,.9,.3,1.12);font-family:"Segoe UI",-apple-system,sans-serif}',
      '.jr-panel.open{opacity:1;pointer-events:auto;transform:translateX(-50%) scale(1) translateY(0)}',
      '.jr-panel .jr-hex{position:absolute;inset:0;opacity:.05;pointer-events:none;background-image:' + HEX + ';background-size:36px 62px}',
      '.jr-panel .jr-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 18% 0%,rgba(124,92,255,.16),transparent 46%),radial-gradient(circle at 86% 100%,rgba(0,229,255,.12),transparent 46%)}',
      '.jr-panel .jr-scan{position:absolute;left:0;right:0;top:-40%;height:36%;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(0,229,255,.07),transparent);animation:jrScan 5.5s linear infinite}',
      '@keyframes jrScan{to{top:120%}}',
      '.jr-head{position:relative;display:flex;align-items:center;gap:11px;padding:12px 14px;border-bottom:1px solid rgba(0,229,255,.14);background:linear-gradient(90deg,rgba(124,92,255,.16),rgba(0,229,255,.08) 60%,transparent)}',
      '.jr-head .jr-reactor{width:34px;height:34px}',
      '.jr-ttl{font:800 .82rem/1 Segoe UI,system-ui,sans-serif;letter-spacing:3px;color:#DFF6FF;text-shadow:0 0 12px rgba(0,229,255,.8)}',
      '.jr-on{display:flex;align-items:center;gap:5px;font:700 .6rem/1 Segoe UI,system-ui,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:#B6FF3C;margin-top:4px}',
      '.jr-on i{width:7px;height:7px;border-radius:50%;background:#B6FF3C;box-shadow:0 0 8px #B6FF3C;font-style:normal}',
      '.jr-acts{margin-left:auto;display:flex;gap:6px}',
      '.jr-acts button{width:32px;height:32px;border-radius:12px;border:1px solid rgba(0,229,255,.22);background:rgba(0,229,255,.07);color:#9FE8FF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}',
      '.jr-acts button:hover{background:rgba(0,229,255,.16);box-shadow:0 0 14px -2px rgba(0,229,255,.6)}',
      '.jr-acts button.off{opacity:.45}',
      '.jr-body{position:relative;flex:1;min-height:0;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin;scrollbar-color:rgba(0,229,255,.22) transparent}',
      '.jr-body::-webkit-scrollbar{width:5px}.jr-body::-webkit-scrollbar-thumb{background:rgba(0,229,255,.22);border-radius:3px}',
      '.jr-msg{max-width:84%;padding:9px 12px;border-radius:14px;font-size:.84rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;position:relative;animation:jrMsg .18s ease both}',
      '@keyframes jrMsg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
      '.jr-msg.user{align-self:flex-end;background:linear-gradient(135deg,#7C5CFF,#00E5FF);color:#fff;border-bottom-right-radius:4px;box-shadow:0 4px 16px rgba(124,92,255,.35)}',
      '.jr-msg.jar{background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.14);color:#E8EEFF;border-bottom-left-radius:4px}',
      '.jr-msg.jar .jr-name{display:block;font:800 .58rem/1 Segoe UI,system-ui,sans-serif;letter-spacing:2.2px;text-transform:uppercase;color:#7FA8C9;margin-bottom:4px}',
      '.jr-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:10px 14px;border-radius:14px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.14)}',
      '.jr-typing i{width:6px;height:6px;border-radius:50%;background:#7FA8C9;animation:jrDot 1s infinite}',
      '.jr-typing i:nth-child(2){animation-delay:.15s}.jr-typing i:nth-child(3){animation-delay:.3s}',
      '.jr-chips{display:flex;gap:6px;padding:9px 12px 3px;overflow-x:auto;flex-wrap:wrap}',
      '.jr-chip{padding:6px 11px;border-radius:16px;border:1px solid rgba(0,229,255,.3);background:rgba(0,229,255,.08);color:#9FE8FF;font:700 .72rem/1 Segoe UI,system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:.15s}',
      '.jr-chip:hover{background:rgba(0,229,255,.18);border-color:rgba(0,229,255,.55)}',
      '.jr-in{position:relative;display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid rgba(0,229,255,.1)}',
      '.jr-in input{flex:1;min-width:0;padding:10px 13px;border-radius:14px;border:1px solid rgba(0,229,255,.2);background:rgba(0,229,255,.05);color:#E8EEFF;font:.85rem/1 Segoe UI,system-ui,sans-serif;outline:none;transition:.15s}',
      '.jr-in input:focus{border-color:rgba(0,229,255,.55);box-shadow:0 0 0 3px rgba(0,229,255,.14)}',
      '.jr-in input::placeholder{color:#5D6A88}',
      '.jr-in button{width:38px;height:38px;flex:none;border-radius:12px;border:1px solid rgba(0,229,255,.22);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}',
      '.jr-send{background:linear-gradient(135deg,#7C5CFF,#00E5FF);color:#fff}',
      '.jr-send:hover{box-shadow:0 0 18px rgba(0,229,255,.45)}',
      '.jr-in .jr-mic{background:rgba(0,229,255,.06);color:#9FE8FF}',
      '.jr-in .jr-mic:hover{background:rgba(0,229,255,.14)}',
      '.jr-in .jr-mic.live{background:rgba(247,37,133,.22);border-color:#F72585;color:#FF9EC6;animation:jrMic 1s ease-in-out infinite}',

      '@media (max-width:640px){.jr-island{top:8px}.jr-itxt em{max-width:90px}.jr-panel{top:8px;width:calc(100vw - 12px);height:min(560px,86vh)}}',
      '@media (prefers-reduced-motion:reduce){.jr-island,.jr-panel.open,.jr-msg,.jr-typing i,.jr-scan,.jr-reactor::before,.jr-idot,.jr-in .jr-mic.live{animation:none!important;transition:none}}'
    ].join('');
    document.head.appendChild(st);

    var island = document.createElement('button');
    island.className = 'jr-island';
    island.id = 'jr-island';
    island.setAttribute('aria-label', 'Open Jarvis assistant');
    island.setAttribute('aria-expanded', 'false');
    island.innerHTML =
      '<span class="jr-reactor"><i class="jr-eye"></i></span>' +
      '<span class="jr-itxt"><b>JARVIS</b><em id="jr-status">systems online</em></span>' +
      '<span class="jr-idot"></span>';
    island.onclick = toggle;
    island.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    document.body.appendChild(island);

    var pan = document.createElement('div');
    pan.className = 'jr-panel';
    pan.id = 'jr-panel';
    pan.setAttribute('role', 'dialog');
    pan.setAttribute('aria-label', 'Jarvis assistant');
    pan.innerHTML =
      '<div class="jr-hex"></div><div class="jr-glow"></div><div class="jr-scan"></div>' +
      '<div class="jr-head">' +
        '<span class="jr-reactor"><i class="jr-eye"></i></span>' +
        '<div><div class="jr-ttl">JARVIS</div><div class="jr-on"><i></i>online &middot; synced</div></div>' +
        '<div class="jr-acts">' +
          '<button id="jr-speak" title="Voice replies">' + ICONS.sound + '</button>' +
          '<button id="jr-close" title="Close">' + ICONS.close + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="jr-body" id="jr-body"></div>' +
      '<div class="jr-chips" id="jr-chips">' +
        '<button class="jr-chip" data-c="What can you control?">What can you control?</button>' +
        '<button class="jr-chip" data-c="My points">My points</button>' +
        '<button class="jr-chip" data-c="Open editor">Open editor</button>' +
        '<button class="jr-chip" data-c="Open games">Open games</button>' +
        '<button class="jr-chip" data-c="Call me Nova">Call me Nova</button>' +
      '</div>' +
      '<div class="jr-in">' +
        '<input id="jr-inp" placeholder="Command Jarvis\u2026" autocomplete="off" aria-label="Ask Jarvis">' +
        '<button class="jr-mic" id="jr-mic" title="Voice input">' + ICONS.mic + '</button>' +
        '<button class="jr-send" id="jr-send" title="Send">' + ICONS.send + '</button>' +
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.altKey && (e.key === 'j' || e.key === 'J')) toggle();
    });
    document.addEventListener('click', function (e) {
      if (!open) return;
      if (pan.contains(e.target) || island.contains(e.target)) return;
      close();
    });

    startPeek();
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
    var pan = $('jr-panel');
    var isl = $('jr-island');
    if (!pan) return;
    open = true;
    pan.classList.add('open');
    if (isl) isl.classList.add('hidden');
    if (isl) isl.setAttribute('aria-expanded', 'true');
    if (!$('jr-body').children.length) {
      say(s('Hey ' + fixName() + '. I\u2019m Jarvis \u2014 tap the chips or ask me to control the app.',
            'yo ' + fixName() + ', Jarvis here \u2014 tap the chips or tell me what to do fr.'), 'jar');
    }
    setTimeout(function () { var i = $('jr-inp'); if (i) i.focus(); }, 90);
  }
  function close() {
    open = false;
    stopListen();
    var pan = $('jr-panel');
    var isl = $('jr-island');
    if (pan) pan.classList.remove('open');
    if (isl) { isl.classList.remove('hidden'); isl.setAttribute('aria-expanded', 'false'); }
    setMode('idle');
  }

  var peeked = false;
  function startPeek() {
    setTimeout(function () {
      if (open || peeked) return;
      peeked = true;
      var isl = $('jr-island');
      if (!isl) return;
      var em = $('jr-status');
      isl.classList.add('peek');
      if (em) em.textContent = 'hi, I\u2019m Jarvis \u2014 tap me';
      setTimeout(function () {
        isl.classList.remove('peek');
        if (em && !open) em.textContent = 'systems online';
      }, 4200);
    }, 1500);
  }

  /* mount only after the page has a body (defer already guarantees it, but a
     copy of this file is also loadable by hand from a script tag in the head) */
  function mount() {
    if (!document.body) { setTimeout(mount, 60); return; }
    build();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.ncJarvis = {
    open: openPanel,
    close: close,
    toggle: toggle,
    ask: handle,
    register: register,
    controls: controls
  };
})();
