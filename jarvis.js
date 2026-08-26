/* NOVA — a Siri-style voice assistant for NovaClip.
 *
 * Site-wide, no dependencies, no build step. Loaded with defer on every page
 * after biometric.js, whose face sign-in it fronts: when the camera recognises
 * your face, Nova greets you by name out loud, then listens for a command.
 *
 * The UI is a Siri-style sheet pinned to the top of the screen: a glowing orb
 * that opens a translucent bar with a sound waveform while it listens, and a
 * caption that shows — and speaks — the answer. It is not a chat: no log, no
 * typing box, no panel that can block the page. Tap the orb to talk, or say
 * "hey Nova".
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
 * gen-Z mode, Nova, fullscreen, ...) and search the web — "search <thing>"
 * answers from DuckDuckGo, or opens Google for it. Anything else is answered
 * by the same ncAsk() every AI feature uses. Pages can register their own
 * controls with ncNova.register({ match, run, desc }).
 */
(function () {
  if (window.ncNova) return;                    /* never double-mount */
  if (location.search.indexOf('embed=1') !== -1) return;  /* iframe shells: the parent owns the assistant */

  var $ = function (id) { return document.getElementById(id); };

  /* ----------------------------------------------------------------
   * personalisation
   * ---------------------------------------------------------------- */
  function storedName() {
    try { return localStorage.getItem('nc_nova_name') || ''; } catch (e) { return ''; }
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
      'editor.html':'Editor', 'game.html':'Games',
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

  function speak(text, onDone) {
    /* Speech needs either the browser voice or the site's worker, and the
       toggle to actually speak at all. Either way, finish the flow (close the
       sheet, start listening) so the interaction never hangs. */
    if (!TTS && !window.NC_AI_WORKER_URL) { if (onDone) onDone(); return; }
    if (!speakOn()) { if (onDone) onDone(); return; }
    stopTTS();
    setMode('speak');
    var done = function () { setMode(wake.armed && !active ? 'armed' : 'idle'); if (onDone) onDone(); };

    /* Preferred path: the AI worker reads it aloud with a proper voice. The
       browser's own voice is only the fallback for when the worker is down,
       out of quota, or unreachable — the answer is on screen either way. */
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
        u.onend = function () { setMode(wake.armed && !active ? 'armed' : 'idle'); if (onDone) onDone(); };
        u.onerror = function () { setMode(wake.armed && !active ? 'armed' : 'idle'); if (onDone) onDone(); };
        TTS.speak(u);
      } catch (e) { setMode(wake.armed && !active ? 'armed' : 'idle'); if (onDone) onDone(); }
    }
  }

  /* ---- one-shot capture: the orb and the wake word both use it ---- */
  var bioWasOn = false, rec = null;
  function stopListen() {
    if (rec) { try { rec.onend = null; rec.onerror = null; rec.abort(); } catch (e) {} rec = null; }
    if (bioWasOn) bioStart();
    bioWasOn = false;
    setMode(wake.armed && !active ? 'armed' : 'idle');
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
      if (wake.armed && !active && !wake.capturing) setTimeout(reArm, 700);
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
    setMode('listen');
    try { rec.start(); } catch (e) { finish(); if (cb) cb(''); }
  }
  function startListen() {
    if (!SR) { say('Voice input needs Chrome, Edge or Safari.'); return; }
    setMode('listen');
    captureOnce(function (text) {
      if (text && text.trim()) handle(text.trim());
      else {
        say(s('Couldn\u2019t hear you \u2014 try again.', 'Couldn\u2019t hear that \u2014 say it again.'));
        setTimeout(close, 1800);
      }
    });
  }

  /* ---- wake word: always listening for "hey Nova" ---- */
  var wake = { armed: wakeArmed(), rec: null, capturing: false, errAt: 0 };
  function wakeArmed() { try { return localStorage.getItem('nc_nova_wake') !== '0'; } catch (e) { return true; } }
  function wakeMatch(t) {
    /* Cheap reject before the regex, and it has to look for the CURRENT
       wake word. Left as 'jarvis' this returned false for every phrase and
       the assistant would never wake at all. */
    if (t.indexOf('nova') === -1) return false;
    if (t.length > 70) return false;
    /* "nova", but never the "nova" in "NovaClip" — this site says its own
       name out loud constantly, and a wake word that fires on the product
       name would have the assistant interrupting every sentence about it. */
    return /\b(hey|hey there|ok|okay|yo|alright|a\.i\.?)?\s*nova\b(?!\s*clip)/.test(t);
  }
  function setWake(v) {
    try { localStorage.setItem('nc_nova_wake', v ? '1' : '0'); } catch (e) {}
    wake.armed = v;
    var b = $('jr-wake');
    if (b) b.classList.toggle('off', !v);
    if (v) { reArm(); setMode('armed'); }
    else { stopWake(); setMode('idle'); }
  }
  function startWake() {
    if (!SR || wake.rec || !wake.armed || wake.capturing || active) return;
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
        if (wake.armed && !active && !wake.capturing) setTimeout(reArm, 500);
      };
      wake.rec = r;
      r.start();
    } catch (e) { wake.rec = null; }
  }
  function stopWake() {
    if (wake.rec) { try { wake.rec.onend = null; wake.rec.onerror = null; wake.rec.abort(); } catch (e) {} wake.rec = null; }
  }
  function reArm() {
    if (!wake.armed || active || wake.capturing) return;
    if (bioVoiceOn()) { setTimeout(reArm, 2500); return; }
    if (wake.errAt && Date.now() - wake.errAt < 30000) { setTimeout(reArm, 30000); return; }
    if (!wake.rec) startWake();
  }
  function wakeHit() {
    if (wake.capturing || active) return;
    wake.capturing = true;
    stopWake();
    bioWasOn = bioVoiceOn();
    if (bioWasOn) bioStop();
    openSheet();
    var g = s('Hey ' + fixName() + '. What can I do for you?', 'yo ' + fixName() + ', what we doin?');
    say(g);
    speak(g, function () {
      wake.capturing = false;
      captureOnce(function (text) {
        wake.capturing = false;
        if (text && text.trim()) handle(text.trim());
        else { say(s('Didn\u2019t catch that \u2014 say it again.', 'Didn\u2019t catch that \u2014 say it again.')); setTimeout(close, 1800); }
      }, 8000);
    });
  }

  /* ----------------------------------------------------------------
   * control registry — pages can teach Nova new tricks
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
    ['publish', 'publish.html'], ['family', 'parent.html'],
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
      'I run this app hands-free. Tap the orb to talk, or say "hey Nova". Then try: ' +
      '"my points", "open editor", "open games", "sign me in", "turn on voice commands", "gen-z on". ' +
      'Or just ask me anything \u2014 "how do I beat Minecraft", "why is my video not getting views", ' +
      '"explain photosynthesis". ' +
      '"tickle Nova", "go fullscreen", "what time is it", "search <anything>", "where am I" or "sign out". ' +
      'Tell me your name with "call me <name>" and I\u2019ll remember. Anything else, I ask the AI.',
      'I run this whole app fr. Tap the orb to talk, or say "hey Nova". Then try: ' +
      '"my points", "open editor", "open games", "sign me in", "voice commands on", "gen-z on". ' +
      'Or just ask me anything fr \u2014 "how do I beat Minecraft", "why my video flopped", ' +
      '"explain photosynthesis". ' +
      '"tickle Nova", "go fullscreen", "what time is it", "search <anything>", "where am I" or "sign out". ' +
      'Hit me with "call me <name>" and I\u2019ll remember. Anything else, the AI.');
  }

  /* A web search that returns an actual answer: it routes through ncAsk with
     Gemini's grounding tool, so the model looks the term up on the live web and
     comes back with a sourced answer instead of DuckDuckGo's short blurb. It
     costs the same shared quota as any other AI call and needs no key of its
     own. Grounding is a Gemini feature, so this one call forces the gemini
     provider regardless of the site-wide selection. On any failure, fall back
     to opening Google in a new tab — the tab is always the honest answer for
     "go look it up". */
  function webSearch(term) {
    if (typeof window.ncAsk !== 'function') return fallbackSearch(term);
    return window.ncAsk(
      'You are Nova, a personal AI assistant. Search the live web for: "' + term + '". ' +
      (gz() ? 'Answer in heavy gen-z slang with a few emojis, but stay genuinely useful. ' : 'Answer in clear, friendly everyday English. ') +
      'Be specific, under 90 words, and don\u2019t invent numbers or links \u2014 the search results are the only source of truth.\n\n' +
      'Search for: ' + term,
      { provider: 'gemini', search: true, maxTokens: 400, temperature: 0.3 }
    ).then(function (r) {
      if (r && !r.err && r.text) {
        var reply = r.text.trim();
        if (r.sources && r.sources.length) {
          reply += '\n\nSources:';
          r.sources.slice(0, 4).forEach(function (src, i) {
            reply += '\n' + (i + 1) + '. ' + src.title + ' \u2014 ' + src.uri;
          });
        }
        return reply;
      }
      return fallbackSearch(term);
    });
  }

  function fallbackSearch(term) {
    try { window.open('https://www.google.com/search?q=' + encodeURIComponent(term), '_blank', 'noopener'); } catch (e) {}
    return s('I couldn\u2019t search just now, so I opened Google for "' + term + '" in a new tab.',
             'Search buggin rn \u2014 opened Google for "' + term + '" in a new tab.');
  }

  function respond(q) {
    var raw = q;
    q = q.toLowerCase().replace(/[!.?]+$/g, '').replace(/^(hey|ok|okay|yo|alright|a\.i\.?)?\s*nova[,!]?\s*/i, '').trim();

    /* wake word on/off — "hey nova off" / "turn off the wake word" */
    var wakeCmd =
      (/\b(wake word|always listening)\b/.test(q) && /\b(on|off|stop|start|turn|switch)\b/.test(q)) ||
      (/^(hey|ok|okay|yo|alright)?\s*nova\b/i.test(raw) && /^(on|off|stop|start)\b/.test(q));
    if (wakeCmd) {
      var wakOn = /\b(on|start)\b/.test(q) && !/\b(off|stop)\b/.test(q);
      setWake(wakOn);
      return s(wakOn
          ? 'Wake word on \u2014 I\u2019m always listening. Just say "hey Nova".'
          : 'Wake word off \u2014 say "hey Nova" to turn it back on.',
               wakOn
          ? 'Wake word on \u2014 I\u2019m always listening. Just say "hey Nova".'
          : 'Wake word off \u2014 say "hey Nova" to turn it back on.');
    }

    /* "call me X" / "my name is X" — remember it */
    var who = q.match(/(?:call me|my name'?s|my name is|i'?m called|please call me)\s+(.{1,24})$/i);
    if (who) {
      var nm = who[1].replace(/\s+/g, ' ').trim();
      if (nm) {
        try { localStorage.setItem('nc_nova_name', nm); } catch (e) {}
        return 'Nice to meet you, ' + nm + '. I\u2019m Nova, your NovaClip assistant. I can control this app for you.';
      }
    }

    if (/(^|[^a-z])(hi|hey|hello|yo|sup|hiii?|good (morning|afternoon|evening)|howdy)\b/.test(q)) {
      return s('Hey ' + fixName() + '. I\u2019m Nova. I can run this app for you \u2014 say "help" to see how.',
               'yo ' + fixName() + ', it\u2019s Nova fr. I run this app \u2014 say "help" to see how.');
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
      return s('I\u2019m Nova \u2014 your Iron Man-style assistant for NovaClip. I live in the orb at the top of every page, and I can control the app for you.',
               'I\u2019m Nova \u2014 ur Iron Man-style assistant for NovaClip. I live in the orb on top of every page and I control the app fr.');
    }
    if (/(^|[^a-z])(what time|what'?s the time|the date|what day)\b/.test(q)) {
      return new Date().toLocaleString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    }
    if (/(where am i|what page|this page|which page|where are we|what'?s this)/.test(q)) {
      return s('You are on the ' + pageName() + ' page.', 'U on the ' + pageName() + ' page rn.');
    }
    if (/(sign out|log out|logout|sign me out)/.test(q)) {
      try { if (window.ncBiometric && typeof ncBiometric.signOut === 'function') ncBiometric.signOut(); } catch (e) {}
      return s('Signed you out.', 'Signed u out.');
    }
    if (/(sign (me )?in|log (me )?in|login|unlock|face id|scan my face|open biometric)/.test(q)) {
      try { if (window.ncBiometric && typeof ncBiometric.signIn === 'function') ncBiometric.signIn(); } catch (e) {}
      return s('Opening the camera so I can recognise your face.', 'Opening the cam so I can recognise u.');
    }
    if (/(voice commands|turn .*voice|voice .*on|voice .*off|start listening|stop listening)/.test(q)) {
      var on = /on|start/.test(q) && !/off/.test(q);
      try {
        if (window.ncBiometric) on ? ncBiometric.startVoice() : ncBiometric.stopVoice();
      } catch (e) {}
      return s(on ? 'Voice commands on \u2014 try "Nova, my points".' : 'Voice commands off.',
               on ? 'Voice commands on \u2014 say "Nova, my points".' : 'Voice commands off.');
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
    if (/(^|[^a-z])(open|go to|take me to|navigate to|bring me to|load|launch|switch to)\s+(.+)/.test(q)) {
      return doOpen(RegExp.$3);
    }

    /* web search — kept after the page-navigation cases so "open editor" never
       becomes a search for "editor". */
    if (/^(search|google|look up|look for|find on the web)\s+(?:for\s+)?(.{3,})/.test(q)) {
      return webSearch(RegExp.$2);
    }
    if (/^(who is|what is|define|tell me about)\s+(.{3,})/.test(q)) {
      return webSearch(RegExp.$2);
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
      'You are Nova, a personal AI assistant inside the NovaClip app for ' + fixName() + '. ' +
      'You can also control the app itself (open pages, check NovaCoins, sign in/out, voice, gen-z mode). ' +
      /* It was answering "how do I beat Minecraft" by steering back to the
         app, because the prompt only ever described the app. It is a
         general assistant that HAPPENS to live here; questions about
         games, homework, editing or anything else get a real answer. */
      'Questions do not have to be about NovaClip. Games, school, how something works, ' +
      'advice \u2014 answer them properly and directly. Only mention NovaClip when it is ' +
      'genuinely relevant to what was asked. ' +
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
   * Siri-style UI
   * ---------------------------------------------------------------- */
  var active = false;          /* the sheet is open */
  var listenAfterGreet = false;/* tap started a face sign-in; listen once it greets */
  var suppressTap = false;     /* a drag just ended; swallow the click that follows */

  function say(text) {
    var cap = $('jr-cap');
    if (cap) cap.textContent = text;
  }
  function typing(on) { setMode(on ? 'busy' : 'idle'); }

  function handle(text) {
    typing(true);
    var out = respond(text);
    Promise.resolve(out).then(function (reply) {
      typing(false);
      say(reply);
      speak(reply, close);
    });
  }

  function speakOn() {
    try { return localStorage.getItem('nc_nova_speak') !== '0'; } catch (e) { return true; }
  }
  function setSpeakOn(v) {
    try { localStorage.setItem('nc_nova_speak', v ? '1' : '0'); } catch (e) {}
    if (!v) { stopTTS(); setMode(wake.armed && !active ? 'armed' : 'idle'); }
    var b = $('jr-speak');
    if (b) b.classList.toggle('off', !v);
  }

  function setMode(mode) {
    var pl = $('jr-pill'), sh = $('jr-sheet');
    if (pl) pl.classList.remove('listen', 'speak', 'busy', 'sleep', 'armed');
    if (sh) sh.classList.remove('listen', 'speak', 'busy', 'sleep', 'armed');
    var map = {
      idle:  'systems online',
      armed: 'say \u201chey Nova\u201d',
      listen: 'listening\u2026',
      speak:  'speaking\u2026',
      busy:   'thinking\u2026',
      sleep:  'standby'
    };
    if (mode !== 'idle') {
      if (pl) pl.classList.add(mode);
      if (sh) sh.classList.add(mode);
    }
    var em = $('jr-status');
    if (em) em.textContent = map[mode] || map.idle;
  }

  var ICONS = {
    sound: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    wake: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M8 8a6 6 0 0 0 0 8"/><path d="M16 8a6 6 0 0 1 0 8"/><path d="M5 5a10 10 0 0 0 0 14"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>'
  };

  function build() {
    if (document.getElementById('jr-css')) return;
    var st = document.createElement('style');
    st.id = 'jr-css';
    st.textContent = [
      /* ---------- the idle pill ---------- */
      '.jr-pill{position:fixed;top:calc(var(--nc-bar-h, 0px) + 12px);left:50%;transform:translateX(-50%);z-index:99995;display:flex;align-items:center;gap:9px;padding:5px 13px 5px 7px;border-radius:999px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;background:linear-gradient(160deg,rgba(16,22,40,.82),rgba(8,11,22,.92));border:1px solid rgba(0,229,255,.3);box-shadow:0 0 0 1px rgba(124,92,255,.12),0 0 22px -5px rgba(0,229,255,.55),0 0 44px -16px rgba(124,92,255,.7),0 12px 30px rgba(0,0,0,.5);backdrop-filter:blur(16px) saturate(1.5);-webkit-backdrop-filter:blur(16px) saturate(1.5);transition:box-shadow .25s,transform .25s}',
      '.jr-pill:hover{box-shadow:0 0 0 1px rgba(124,92,255,.22),0 0 30px -4px rgba(0,229,255,.75),0 0 60px -12px rgba(124,92,255,.9),0 14px 36px rgba(0,0,0,.55);transform:translateX(-50%) translateY(-1px)}',
      '.jr-pill.dragging{cursor:grabbing}',
      '.jr-pill.hidden{opacity:0;pointer-events:none;transform:translateX(-50%) translateY(-8px)}',
      '.jr-pill .jr-togs{display:flex;gap:4px;margin-left:2px}',
      /* 24px was below anything a thumb can reliably hit, and these two sit on
   every page inside the assistant pill. */
      '.jr-pill .jr-tog{width:36px;height:36px;border-radius:50%;border:1px solid rgba(0,229,255,.22);background:rgba(0,229,255,.07);color:#9FE8FF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;padding:0}',
      '.jr-pill .jr-tog:hover{background:rgba(0,229,255,.16)}',
      '.jr-pill .jr-tog.off{opacity:.4}',
      '.jr-ptxt{display:flex;flex-direction:column;line-height:1.12;min-width:0}',
      '.jr-ptxt b{font:800 .72rem/1.1 Segoe UI,system-ui,sans-serif;letter-spacing:2.6px;color:#DFF6FF;white-space:nowrap;text-shadow:0 0 10px rgba(0,229,255,.8)}',
      '.jr-ptxt em{font:600 .6rem/1 Segoe UI,system-ui,sans-serif;font-style:normal;letter-spacing:1.2px;text-transform:uppercase;color:#7FA8C9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}',
      /* The dot used to pulse forever, and it sits INSIDE .jr-pill, which has
         a backdrop-filter. Anything animating inside a backdrop-filtered
         element makes the browser recompute that blur every single frame —
         so a 7px decorative dot held the whole page at 37fps, on every page,
         for as long as it was open, with nothing else happening at all.
         It now pulses only when there is something to pulse about. */
      '.jr-idot{width:7px;height:7px;border-radius:50%;flex:none;background:#B6FF3C;box-shadow:0 0 10px #B6FF3C}',
      '.jr-pill.listen .jr-idot,.jr-pill.speak .jr-idot,.jr-pill.busy .jr-idot{animation:jrDot 1.6s ease-in-out infinite}',
      '@keyframes jrDot{0%,100%{opacity:.55}50%{opacity:1}}',
      '.jr-pill.listen .jr-idot{background:#F72585;box-shadow:0 0 12px #F72585}',
      '.jr-pill.speak .jr-idot{background:#00E5FF;box-shadow:0 0 14px #00E5FF}',
      '.jr-pill.busy .jr-idot{background:#FFB703;box-shadow:0 0 12px #FFB703}',
      '.jr-pill.sleep .jr-idot{background:#5D6A88;box-shadow:none;animation:none}',
      '.jr-pill.sleep .jr-ptxt b{color:#6E7EA0}',

      /* ---------- the orb ---------- */
      '.jr-orb{border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 32% 28%,#F2FCFF,#A9EEFF 22%,#4FC3FF 45%,#7C5CFF 72%,#A25CFF 88%,#E05CFF);box-shadow:0 0 16px -2px rgba(0,229,255,.8),inset 0 0 14px rgba(255,255,255,.22);position:relative}',
      '.jr-orb.small{width:24px;height:24px}',
      '.jr-orb.big{width:64px;height:64px;margin:2px 0 4px}',
      '.jr-orb .jr-eye{position:relative;width:40%;height:26%;border-radius:50% 50% 46% 46%;background:linear-gradient(135deg,#fff,#A9EEFF);box-shadow:0 0 12px rgba(255,255,255,.9)}',
      '.jr-orb .jr-eye::after{content:"";position:absolute;inset:22% 18%;border-radius:50%;background:rgba(8,12,24,.85)}',
      '.jr-orb.big::after{content:"";position:absolute;inset:-7px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 38%,rgba(255,255,255,.9) 50%,transparent 62% 100%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));}',
      /* Spins only while it is doing something. Left running it sat inside
         the pill's backdrop-filter and forced the blur to recompute every
         frame for the life of the page. */
      '.jr-pill.listen .jr-orb.big::after,.jr-pill.speak .jr-orb.big::after,.jr-pill.busy .jr-orb.big::after,.jr-sheet.open .jr-orb.big::after{animation:jrSpin 3.2s linear infinite}',
      '@keyframes jrSpin{to{transform:rotate(360deg)}}',

      /* ---------- the listening sheet ---------- */
      '.jr-sheet{position:fixed;top:10px;left:50%;transform:translateX(-50%) translateY(-14px) scale(.94);z-index:99997;width:min(520px,94vw);display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 20px 14px;border-radius:28px;background:linear-gradient(165deg,rgba(18,24,44,.92),rgba(9,12,24,.97));border:1px solid rgba(0,229,255,.25);backdrop-filter:blur(22px) saturate(1.4);-webkit-backdrop-filter:blur(22px) saturate(1.4);box-shadow:0 0 0 1px rgba(124,92,255,.16),0 0 44px -8px rgba(0,229,255,.5),0 30px 80px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06);opacity:0;pointer-events:none;transition:opacity .22s,transform .3s cubic-bezier(.2,.9,.3,1.12);font-family:"Segoe UI",-apple-system,sans-serif}',
      '.jr-sheet.open{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0) scale(1)}',
      '.jr-x{min-height:36px;min-width:36px;position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;border:1px solid rgba(0,229,255,.22);background:rgba(0,229,255,.07);color:#9FE8FF;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;padding:0}',
      '.jr-x:hover{background:rgba(0,229,255,.16);box-shadow:0 0 14px -2px rgba(0,229,255,.6)}',
      '.jr-bars{display:flex;align-items:center;gap:3px;height:30px}',
      '.jr-bar{width:3px;border-radius:3px;background:linear-gradient(180deg,#A9F3FF,#00E5FF 40%,#7C5CFF);height:5px;animation:jrBar 1.1s ease-in-out infinite}',
      '@keyframes jrBar{0%,100%{height:5px}50%{height:30px}}',
      '.jr-sheet.listen .jr-bar,.jr-sheet.speak .jr-bar{animation:jrBar 1.1s ease-in-out infinite}',
      '.jr-sheet.busy .jr-bar{animation:jrBar 1.6s ease-in-out infinite}',
      '.jr-sheet:not(.listen):not(.speak):not(.busy) .jr-bar{animation:none}',
      '.jr-sheet.listen .jr-orb.big{animation:jrOrbPulse 1.2s ease-in-out infinite}',
      '@keyframes jrOrbPulse{50%{transform:scale(1.09);box-shadow:0 0 44px -4px rgba(0,229,255,.95)}}',
      '.jr-cap{font:.84rem/1.45 Segoe UI,system-ui,sans-serif;color:#E8EEFF;text-align:center;max-width:100%;min-height:1.3em;word-wrap:break-word}',
      '.jr-hint{font:600 .58rem/1 Segoe UI,system-ui,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#5D6A88;text-align:center}',

      /* ON A PHONE THE PILL STOPS BEING A BAR AND BECOMES A BUTTON.

         Parked at the top centre it is 300px of "NOVA / hi, I'm Nova — tap
         me" laid across whatever the page opens with. Measured on a 390px
         phone: the <h1> on tools.html, the hero on index.html, the search
         row on socials.html, the transport controls on editor.html. It is
         the first thing on the page and it is on top of the second thing.

         Nothing about that is fixable by nudging the offset — the top of a
         phone screen is where every page puts its heading, so anything
         floating there lands on something. It moves to the bottom-right
         corner instead, above the nav strip, which is where a phone puts a
         chat button and is the one part of the screen no page uses.

         The name and status line come out with it: they are what made it
         wide, and a 56px orb reads as Nova perfectly well. The two toggles
         go into the sheet, which is where a setting belongs anyway.

         `left:auto` and the transform reset are load-bearing. The pill is
         draggable and centred with translateX(-50%) at wider widths; both
         have to be undone here or it sits half off the right edge. */
      /* 1023 and not 760: the top of a tablet is as much "where the page puts
         its heading" as the top of a phone is. At 768 the centred pill was
         sitting on BioSentinel's own title. Below 1024 it docks. */
      '@media (max-width:1023px){' +
        'html body .jr-pill{top:auto;left:auto;right:12px;transform:none;' +
          'bottom:calc(14px + env(safe-area-inset-bottom,0px));' +
          'width:56px;height:56px;padding:0;border-radius:50%;' +
          'justify-content:center;gap:0}' +
        /* Every state the drag and the hide put on it was written as a
           transform built around that centring translate. */
        'html body .jr-pill:hover{transform:none}' +
        'html body .jr-pill.hidden{transform:translateY(-8px)}' +
        'html body .jr-pill .jr-ptxt,' +
        'html body .jr-pill .jr-idot,' +
        'html body .jr-pill .jr-togs{display:none}' +
        'html body .jr-pill .jr-orb.small{width:34px;height:34px}}' +
      /* Clear of the nav strip, which only exists below 761 — above that the
         rail is back down the left-hand side and there is nothing along the
         bottom to clear. The editor has no rail at any width, so it keeps the
         14px above and the orb does not float up the preview. */
      '@media (max-width:760px){' +
        'html body:has(.sidebar) .jr-pill{' +
          'bottom:calc(74px + env(safe-area-inset-bottom,0px))}' +
        '.jr-sheet{top:6px;width:calc(100vw - 12px);padding:16px 12px 12px}}',
      '@media (prefers-reduced-motion:reduce){.jr-pill,.jr-sheet,.jr-orb.big::after,.jr-idot,.jr-bar{animation:none!important;transition:none}}'
    ].join('');
    document.head.appendChild(st);

    var pill = document.createElement('div');
    pill.className = 'jr-pill';
    pill.id = 'jr-pill';
    pill.setAttribute('role', 'button');
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('aria-label', 'Nova voice assistant');
    pill.setAttribute('aria-expanded', 'false');
    pill.innerHTML =
      '<span class="jr-orb small"><i class="jr-eye"></i></span>' +
      '<span class="jr-ptxt"><b>NOVA</b><em id="jr-status">systems online</em></span>' +
      '<span class="jr-idot"></span>' +
      '<span class="jr-togs">' +
        '<button id="jr-wake" class="jr-tog" title="Wake word">' + ICONS.wake + '</button>' +
        '<button id="jr-speak" class="jr-tog" title="Voice replies">' + ICONS.sound + '</button>' +
      '</span>';
    document.body.appendChild(pill);

    /* Remember where the reader parked the pill, so it stays put on the next
       page instead of blocking something again. */
    /* Not on a phone. Where it was parked is a coordinate on whatever screen
       it was parked on, restored as an inline style — which outranks every
       rule in the stylesheet, so a spot picked on a 1440px desktop puts the
       pill somewhere off the right edge of a 390px phone with no way to get
       it back. On a phone it is docked in the corner by CSS and that is the
       only place it goes. */
    var savedPos = null;
    var phone = (innerWidth || document.documentElement.clientWidth || 0) <= 760;
    try { if (!phone) savedPos = JSON.parse(localStorage.getItem('nc_nova_pos') || 'null'); } catch (e) {}
    if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
      pill.style.left = savedPos.x + 'px';
      pill.style.top = savedPos.y + 'px';
      pill.style.transform = 'none';
    }
    makeDraggable(pill);

    var sheet = document.createElement('div');
    sheet.className = 'jr-sheet';
    sheet.id = 'jr-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Nova voice assistant');
    var bars = '';
    for (var i = 0; i < 26; i++) {
      bars += '<i class="jr-bar" style="animation-delay:' + (Math.random() * 1.1).toFixed(2) + 's;animation-duration:' + (0.8 + Math.random() * 0.5).toFixed(2) + 's"></i>';
    }
    sheet.innerHTML =
      '<button id="jr-x" class="jr-x" aria-label="Close">' + ICONS.close + '</button>' +
      '<div class="jr-bars" id="jr-bars">' + bars + '</div>' +
      '<span class="jr-orb big" id="jr-bigorb"><i class="jr-eye"></i></span>' +
      '<p class="jr-cap" id="jr-cap">Nova online \u2014 tap the orb and talk.</p>' +
      '<p class="jr-hint">tap the orb to talk</p>';
    document.body.appendChild(sheet);

    pill.addEventListener('click', onTap);
    pill.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); }
    });
    $('jr-wake').onclick = function (e) { e.stopPropagation(); setWake(!wakeArmed()); };
    $('jr-speak').onclick = function (e) { e.stopPropagation(); setSpeakOn(!speakOn()); };
    $('jr-x').onclick = close;
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.altKey && (e.key === 'j' || e.key === 'J')) onTap();
    });
    document.addEventListener('click', function (e) {
      if (!active) return;
      if (sheet.contains(e.target) || pill.contains(e.target)) return;
      close();
    });

    setSpeakOn(speakOn());
    setWake(wakeArmed());

    /* Face recognition greeting. biometric.js fires nc:bio-signin whenever a
       face (or voice) sign-in succeeds — here, Nova becomes the voice that
       says hello, and starts listening if the tap started the sign-in. */
    document.addEventListener('nc:bio-signin', function (e) {
      var nm = e.detail && e.detail.name;
      if (!nm) return;
      openSheet();
      var g = s('Hello, ' + nm + '. What can I do for you?', 'yo ' + nm + ', what we doin?');
      say(g);
      speak(g, function () {
        if (listenAfterGreet) { listenAfterGreet = false; startListen(); }
        else setTimeout(close, 1600);
      });
    });
    document.addEventListener('nc:bio-signout', function () {
      if (active) say(s('Signed out.', 'Signed out.'));
    });

    startPeek();
  }

  /* Drag the idle pill so it stops covering things. A real drag (more than a
     few pixels) parks the pill where the reader dropped it, clamps it to the
     window, and remembers the spot — the click that browsers fire after a drag
     is swallowed so letting go never opens the sheet. Toggles inside the pill
     are left alone, and pointer capture keeps a fast drag from wandering off. */
  function makeDraggable(el) {
    var dragging = false, moved = false, sx = 0, sy = 0, ex = 0, ey = 0;
    function onDown(e) {
      if (e.target && e.target.closest && e.target.closest('.jr-tog')) return;
      if (e.button !== undefined && e.button !== 0) return;
      var r = el.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY;
      ex = r.left; ey = r.top;
      moved = false;
      dragging = true;
      el.classList.add('dragging');
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      moved = true;
      var x = Math.min(Math.max(0, ex + dx), window.innerWidth - el.offsetWidth);
      var y = Math.min(Math.max(0, ey + dy), window.innerHeight - el.offsetHeight);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = 'none';
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
      if (moved) {
        try {
          localStorage.setItem('nc_nova_pos',
            JSON.stringify({ x: el.getBoundingClientRect().left, y: el.getBoundingClientRect().top }));
        } catch (err) {}
        suppressTap = true;
        setTimeout(function () { suppressTap = false; }, 150);
      }
    }
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  }

  /* ---- tap: open the sheet and listen. If you are not signed in and face
     sign-in exists, the camera scans first and Nova greets you by name
     before listening. ---- */
  function onTap() {
    if (suppressTap) { suppressTap = false; return; }
    if (active) { close(); return; }
    var bio = window.ncBiometric;
    var signedIn = !!(bio && typeof bio.isSignedIn === 'function' && bio.isSignedIn());
    openSheet();
    if (!signedIn && bio && typeof bio.signIn === 'function') {
      listenAfterGreet = true;
      try { bio.signIn(); } catch (e) { listenAfterGreet = false; startListen(); }
      setTimeout(function () {
        if (listenAfterGreet) { listenAfterGreet = false; startListen(); }
      }, 6000);
    } else {
      startListen();
    }
  }

  function openSheet() {
    build();
    var sh = $('jr-sheet'), pl = $('jr-pill');
    if (!sh) return;
    active = true;
    sh.classList.add('open');
    if (pl) { pl.classList.add('hidden'); pl.setAttribute('aria-expanded', 'true'); }
  }
  function close() {
    active = false;
    listenAfterGreet = false;
    stopListen();
    var sh = $('jr-sheet'), pl = $('jr-pill');
    if (sh) sh.classList.remove('open');
    if (pl) { pl.classList.remove('hidden'); pl.setAttribute('aria-expanded', 'false'); }
    setMode(wake.armed && !active ? 'armed' : 'idle');
  }

  var peeked = false;
  function startPeek() {
    setTimeout(function () {
      if (active || peeked) return;
      peeked = true;
      var pl = $('jr-pill');
      if (!pl) return;
      var em = $('jr-status');
      if (em) em.textContent = 'hi, I\u2019m Nova \u2014 tap me';
      setTimeout(function () {
        if (em && !active) em.textContent = wake.armed ? 'say \u201chey Nova\u201d' : 'systems online';
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

  /* Old name kept as an alias: other files on the server may still be an
     older paste that calls ncJarvis, and a rename that silently breaks them
     is not worth the tidiness. */
  window.ncNova = {
    open: openSheet,
    close: close,
    toggle: onTap,
    ask: handle,
    register: register,
    controls: controls
  };
})();
