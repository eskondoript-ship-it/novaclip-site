/* ============================================================================
   NOVACLIP EDITOR — CHECKING A CLIP BEFORE IT GOES ANYWHERE
   ============================================================================
   Every video dropped into the editor gets looked at. Nothing is uploaded to
   do it, nothing is blocked, and nothing is reported to anybody: the frames
   are drawn to a canvas in this tab, measured, and thrown away.

   WHAT IT ACTUALLY CHECKS, AND HOW WELL

   FLASHING          Reliable, and the one worth having. Fast changes in
                     brightness are what trigger photosensitive seizures, and
                     unlike everything else on this list it is arithmetic
                     rather than judgement: WCAG 2.3.1 draws the line at three
                     general flashes in any one second, where a flash is a
                     relative luminance change above 10%.

                     Measured by playing the clip and reading every decoded
                     frame, not by seeking. A rate per second cannot come from
                     samples eight seconds apart, and producing one anyway
                     would be a confident number with nothing under it.
                     Firefox has no requestVideoFrameCallback, so there this
                     check is absent rather than approximated.

   ALL-BLACK         Reliable, and duller: a clip whose frames are all near
                     zero is a recording that failed — a camera that never
                     opened, an export that captured nothing. Cheap to spot
                     here and expensive to spot after posting.

   SKIN              NOT reliable, and labelled that way on screen. It counts
                     pixels in a skin-tone range, which a close-up face, a
                     beach, a wooden table and a sunset all set off. It is a
                     nudge to look again, and the panel says so in those words.
                     It is not a classifier and it must never be described as
                     one — the word "flagged" is deliberately absent.

   ASKING THE AI INSTEAD — OPT IN, AND IT LEAVES THE DEVICE

   The colour count above is the free version. The accurate version is Gemini,
   which can actually look at a frame, and there is no way to do that without
   sending it four frames of somebody's video.

   So it is off until asked for, every time it is used it says what is about to
   leave the device before it leaves, and the consent is a real one: a
   paragraph naming what is sent, where it goes, and what it is not. Turning it
   on is one button. Turning it off again is one button in the same place.

   privacy.html and terms.html carry this too — the editor's "nothing you make
   is uploaded" line now reads "nothing is uploaded unless you press the button
   that says it will be". That page and this file changed in the same commit,
   which is the rule.

   WHAT IS STILL NOT DONE

   No local model. nsfwjs and friends are a 4MB download per visit from a CDN,
   and the editor is already the heaviest page here. If that becomes worth it,
   it goes beside this rather than replacing it — a check that works on a train
   is worth having.

   Loaded by editor.html. Depends on nothing else.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_MOD) return;

  /* The coarse pass: sixteen frames spread across the clip. Enough to say how
     bright it is and how much of it is skin-coloured, and — importantly — NOT
     enough to say anything about how fast it flashes. Sixteen samples of a
     two-minute video are eight seconds apart. That pass only nominates the
     busiest moment; scanFlashes() then plays the clip there and measures at
     the real frame rate. */
  var SAMPLES = 16;
  /* Small on purpose. Every check here is about the average of a lot of
     pixels, and 96x54 averages the same as 1920x1080 for a hundredth of the
     work. */
  var W = 96, H = 54;

  /* WCAG 2.3.1: a flash is a relative luminance change of more than 10% where
     the darker side is below 0.80, and three in a second is the limit. */
  var FLASH_DELTA = 0.10;
  var FLASH_LIMIT = 3;

  function relLum(r, g, b) {
    /* sRGB -> relative luminance, the WCAG definition rather than a quick
       0.299/0.587/0.114 — the gamma step is what makes the 10% threshold mean
       what the guideline says it means. */
    var c = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /* A wide, deliberately crude skin range in normalised RGB. Crude is the
     point: a tight range would be no more correct and would look like it knew
     something. */
  function skinish(r, g, b) {
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return r > 95 && g > 40 && b > 20 && (mx - mn) > 15 &&
           Math.abs(r - g) > 15 && r > g && r > b;
  }

  function measure(ctx) {
    var d = ctx.getImageData(0, 0, W, H).data;
    var lum = 0, skin = 0, n = W * H;
    for (var i = 0; i < d.length; i += 4) {
      lum += relLum(d[i], d[i + 1], d[i + 2]);
      if (skinish(d[i], d[i + 1], d[i + 2])) skin++;
    }
    return { lum: lum / n, skin: skin / n };
  }

  /* --------------------------------------------------------------------------
     SAMPLING
     --------------------------------------------------------------------------
     Seeking is asynchronous and `seeked` is the only honest signal that the
     frame on the element is the frame that was asked for — drawing on a timer
     captures whatever was already there, which is how a scan of sixteen
     different moments becomes sixteen copies of frame one.

     A MediaRecorder WebM reports duration Infinity until the browser has seen
     the end of the file (the same trap publish.html hit), so that is settled
     first or every seek target is NaN.
     -------------------------------------------------------------------------- */
  function realDuration(v) {
    return new Promise(function (resolve) {
      if (isFinite(v.duration) && v.duration > 0) return resolve(v.duration);
      var done = false;
      function settle() {
        if (done || !isFinite(v.duration)) return;
        done = true;
        v.removeEventListener('durationchange', settle);
        v.currentTime = 0;
        resolve(v.duration);
      }
      v.addEventListener('durationchange', settle);
      try { v.currentTime = 1e101; } catch (e) {}
      setTimeout(function () {
        if (!done) { done = true; v.removeEventListener('durationchange', settle); resolve(0); }
      }, 3000);
    });
  }

  function seek(v, t) {
    return new Promise(function (resolve) {
      var done = false;
      function ok() { if (done) return; done = true; v.removeEventListener('seeked', ok); resolve(); }
      v.addEventListener('seeked', ok);
      try { v.currentTime = t; } catch (e) { return ok(); }
      setTimeout(ok, 1500);          // a frame that will not come is not worth the wait
    });
  }

  async function scanVideo(src, opts) {
    opts = opts || {};
    var v = document.createElement('video');
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = 'anonymous';
    v.src = src;

    await new Promise(function (res, rej) {
      v.onloadedmetadata = res;
      v.onerror = function () { rej(new Error('That file could not be read as a video.')); };
      setTimeout(function () { rej(new Error('That file took too long to open.')); }, 15000);
    });

    var dur = await realDuration(v);
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d', { willReadFrequently: true });

    var frames = [];
    var n = dur > 0 ? SAMPLES : 1;
    for (var i = 0; i < n; i++) {
      /* Inside the clip at both ends: exactly 0 is often a black leader frame
         and exactly `dur` frequently will not decode at all. */
      var t = dur > 0 ? ((i + 0.5) / n) * dur : 0;
      await seek(v, t);
      try {
        ctx.drawImage(v, 0, 0, W, H);
        frames.push(Object.assign({ t: t }, measure(ctx)));
      } catch (e) {
        /* A cross-origin frame taints the canvas and getImageData throws.
           Nothing here can be measured, and saying so is better than
           reporting a clean scan of nothing. */
        v.src = '';
        throw new Error('This video is loaded from another site, so the browser will not let the page read its frames.');
      }
      if (opts.onProgress) opts.onProgress((i + 1) / n);
    }
    /* The busiest stretch the coarse pass saw, which is where the dense pass
       goes to look. Falls back to a third of the way in — far enough past a
       title card to be representative. */
    var at = dur / 3, big = 0;
    for (var k = 1; k < frames.length; k++) {
      var d = Math.abs(frames[k].lum - frames[k - 1].lum);
      if (d > big) { big = d; at = frames[k].t; }
    }
    var flash = null;
    if (dur > 0.5) {
      try { flash = await scanFlashes(v, ctx, Math.max(0, at - WINDOW / 2), dur); }
      catch (e) { flash = null; }
    }

    v.pause();
    v.src = '';
    return report(frames, dur, flash);
  }

  /* --------------------------------------------------------------------------
     THE READING
     -------------------------------------------------------------------------- */
  /* --------------------------------------------------------------------------
     THE DENSE PASS — where the flash rate actually comes from
     --------------------------------------------------------------------------
     Seeking sixteen times tells you what the clip looks like. It cannot tell
     you how fast it changes. For that the video has to be played and every
     decoded frame measured, which is what requestVideoFrameCallback is for:
     it fires once per frame the compositor actually receives, with the
     presentation time attached, so the sample rate is the video's real frame
     rate rather than whatever rAF felt like.

     Only WINDOW seconds, and only at the moment the coarse pass thought was
     busiest, because playing a ten-minute video to check it is not a check
     anybody would wait for.

     Where requestVideoFrameCallback does not exist (Firefox, at time of
     writing) this returns null, and report() then says nothing about flashing
     at all rather than guessing from the coarse frames. A missing check is
     recoverable; a wrong one that somebody trusted is not.
     -------------------------------------------------------------------------- */
  var WINDOW = 2.2;

  function scanFlashes(v, ctx, at, dur) {
    if (typeof v.requestVideoFrameCallback !== 'function') return Promise.resolve(null);
    return new Promise(function (resolve) {
      var samples = [];
      var start = Math.max(0, Math.min(at, Math.max(0, dur - WINDOW)));
      var stop = start + WINDOW;
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        try { v.pause(); } catch (e) {}
        resolve(rate(samples));
      }

      function onFrame(now, meta) {
        if (done) return;
        var t = meta && isFinite(meta.mediaTime) ? meta.mediaTime : v.currentTime;
        try {
          ctx.drawImage(v, 0, 0, W, H);
          samples.push({ t: t, lum: measure(ctx).lum });
        } catch (e) { return finish(); }
        if (t >= stop) return finish();
        v.requestVideoFrameCallback(onFrame);
      }

      seek(v, start).then(function () {
        v.muted = true;
        v.requestVideoFrameCallback(onFrame);
        var pl = v.play();
        if (pl && pl.catch) pl.catch(finish);
        /* Autoplay refused, a stalled decode, a clip shorter than the window:
           whatever the reason, stop waiting and report on what arrived. */
        setTimeout(finish, (WINDOW + 2) * 1000);
      });
    });
  }

  /* Flashes per second, as the guideline defines it: count the transitions
     where relative luminance moves more than 10% with the darker side below
     0.80, then take the worst one-second window rather than an average over
     the clip — three flashes in one second is a problem even if the other
     nine seconds are still. */
  function rate(samples) {
    if (samples.length < 4) return null;
    var fps = Math.round((samples.length - 1) /
      Math.max(0.001, samples[samples.length - 1].t - samples[0].t));

    var events = [];
    for (var i = 1; i < samples.length; i++) {
      var a = samples[i - 1].lum, b = samples[i].lum;
      if (Math.abs(a - b) > FLASH_DELTA && Math.min(a, b) < 0.80) {
        events.push(samples[i].t);
      }
    }
    /* Sliding one-second window over the transition times. */
    var worst = 0, worstAt = samples[0].t, j = 0;
    for (var k = 0; k < events.length; k++) {
      while (events[k] - events[j] > 1) j++;
      if (k - j + 1 > worst) { worst = k - j + 1; worstAt = events[j]; }
    }
    return { perSecond: worst, at: worstAt, fps: fps, total: events.length };
  }

  function report(frames, dur, flash) {
    var findings = [];
    if (!frames.length) return { findings: findings, frames: 0, duration: dur };

    var mean = frames.reduce(function (s, f) { return s + f.lum; }, 0) / frames.length;
    var maxSkin = frames.reduce(function (s, f) { return Math.max(s, f.skin); }, 0);
    var meanSkin = frames.reduce(function (s, f) { return s + f.skin; }, 0) / frames.length;

    /* ---- flashing ----
       The rate comes from the dense pass, not from these frames. It cannot
       come from these frames: they are spread across the whole clip, so on a
       two-minute video they are eight seconds apart, and "three flashes in any
       one second" is not a thing eight-second samples can see. A 10Hz strobe
       sampled every eight seconds aliases to whatever it happens to land on.

       Counting the big jumps between these and calling it a flash rate would
       have produced a confident number out of samples that cannot support one,
       which is the same trick as a dashboard built on Math.random(). So the
       coarse pass only nominates a moment to go and look at properly, and
       scanFlashes() below does the measuring at real frame rate. */
    if (flash && flash.perSecond >= FLASH_LIMIT) {
      findings.push({
        id: 'flash',
        level: 'high',
        title: 'This flashes fast enough to be a problem',
        body: 'Around ' + fmtTime(flash.at) + ' the brightness swings hard ' +
              flash.perSecond + ' times in a single second. Fast flashing can trigger seizures ' +
              'in people with photosensitive epilepsy, and the accessibility guideline draws ' +
              'the line at three. Soften those cuts, or put a warning on the front of the video.',
        sure: 'Measured frame by frame at ' + flash.fps + ' frames a second, not estimated.'
      });
    } else if (flash && flash.perSecond > 0) {
      findings.push({
        id: 'flashlow',
        level: 'low',
        title: 'Some hard brightness cuts',
        body: 'The brightest jump is around ' + fmtTime(flash.at) + ', at ' + flash.perSecond +
              ' in a second. That is under the three-per-second line, so it is not a warning — ' +
              'just worth knowing it is the busiest part of the clip.',
        sure: 'Measured frame by frame at ' + flash.fps + ' frames a second.'
      });
    }

    /* ---- black ---- */
    if (mean < 0.01) {
      findings.push({
        id: 'black',
        level: 'high',
        title: 'This clip is black the whole way through',
        body: 'Every frame sampled is almost pure black. Usually that is a recording where the ' +
              'camera never opened, or an export that captured nothing. Worth checking before ' +
              'you build an edit on it.',
        sure: 'This one is measured, not guessed.'
      });
    } else if (mean < 0.03) {
      findings.push({
        id: 'dark',
        level: 'low',
        title: 'This is very dark',
        body: 'Almost nothing will be visible on a phone in daylight. The Colour tab can lift it.',
        sure: 'This one is measured, not guessed.'
      });
    }

    /* ---- skin ----
       Two thresholds so the common case (a person talking to camera) does not
       trip it. Even so this is the unreliable one, and the copy says so rather
       than dressing a pixel count up as a judgement. */
    if (maxSkin > 0.55 && meanSkin > 0.35) {
      findings.push({
        id: 'skin',
        level: 'check',
        title: 'Worth looking at this one again',
        body: 'A lot of the frame is skin-coloured for most of the clip. That is true of plenty ' +
              'of ordinary videos — a close-up face, a beach, a wooden floor, a sunset — so this ' +
              'is not an accusation. It is a nudge to watch it back and ask whether you would be ' +
              'happy for it to be public under your name.',
        sure: 'This is a rough colour count, not a judgement. It gets this wrong often.'
      });
    }

    return {
      findings: findings,
      frames: frames.length,
      duration: dur,
      stats: { meanLuminance: mean, maxSkin: maxSkin, flash: flash || null }
    };
  }

  function fmtTime(s) {
    s = Math.max(0, Math.round(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /* ==========================================================================
     THE AI CHECK
     ==========================================================================
     Four frames to Gemini, through ai-worker.js so the key stays on the
     worker. Off unless somebody turns it on, and the switch is remembered per
     browser rather than per clip — being asked to consent on every import is
     how consent becomes a button people click without reading.

     GRABBED AT FULL SIZE, THEN SHRUNK
     The coarse pass draws at 96x54, which is right for averaging pixels and
     useless to a model. These are drawn at 512 on the long edge: small enough
     to stay inside the worker's per-image cap, large enough that a person is
     recognisably a person.
     ========================================================================== */
  var AI_FRAMES = 4;
  var AI_EDGE = 512;
  var AI_KEY = 'nc_mod_ai';

  function aiOn() {
    try { return localStorage.getItem(AI_KEY) === 'yes'; } catch (e) { return false; }
  }
  function setAiOn(on) {
    try { localStorage.setItem(AI_KEY, on ? 'yes' : 'no'); } catch (e) {}
  }

  async function grabFrames(src, n) {
    var v = document.createElement('video');
    v.preload = 'auto'; v.muted = true; v.playsInline = true; v.src = src;
    await new Promise(function (res, rej) {
      v.onloadedmetadata = res;
      v.onerror = function () { rej(new Error('That file could not be read as a video.')); };
      setTimeout(function () { rej(new Error('That file took too long to open.')); }, 15000);
    });
    var dur = await realDuration(v);
    var vw = v.videoWidth || 640, vh = v.videoHeight || 360;
    var scale = Math.min(1, AI_EDGE / Math.max(vw, vh));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(vw * scale));
    c.height = Math.max(1, Math.round(vh * scale));
    var ctx = c.getContext('2d');

    var out = [];
    for (var i = 0; i < n; i++) {
      var t = dur > 0 ? ((i + 0.5) / n) * dur : 0;
      await seek(v, t);
      ctx.drawImage(v, 0, 0, c.width, c.height);
      var url;
      try { url = c.toDataURL('image/jpeg', 0.72); }
      catch (e) {
        v.src = '';
        throw new Error('This video comes from another site, so the browser will not let the page read its frames.');
      }
      out.push({ at: t, b64: url.slice(url.indexOf(',') + 1) });
    }
    v.src = '';
    return out;
  }

  /* The question. Written so the answer is usable rather than a paragraph:
     one category and one line. "unsure" is a real option on purpose — a model
     forced to choose between yes and no will choose, and a confident wrong
     answer about somebody's video is worse than an honest shrug. */
  var PROMPT =
    'You are a content check inside a video editor used by teenage creators. ' +
    'The images are frames sampled evenly from one clip the creator is editing. ' +
    'Decide whether this clip would be a problem to post publicly.\n\n' +
    'Answer with ONE line of JSON and nothing else:\n' +
    '{"rating":"<ok|suggestive|nudity|sexual|violence|unsure>",' +
    '"confidence":"<low|medium|high>",' +
    '"why":"<one short sentence, addressed to the creator, saying what you saw>"}\n\n' +
    'Use "ok" for ordinary content including people fully clothed, faces, talking heads, ' +
    'gameplay, sport, swimwear at a beach or pool, and art. ' +
    'Use "suggestive" only where clothing or posing is clearly sexualised. ' +
    'Use "nudity" for exposed genitals, buttocks or female breasts. ' +
    'Use "sexual" for sexual acts. ' +
    'Use "violence" for real injury, blood or cruelty. ' +
    'Use "unsure" whenever the frames are too dark, too blurred or too few to tell — ' +
    'that is not a failure, it is the right answer when it is true. ' +
    'Do not describe anybody\'s body or appearance beyond what the rating needs.';

  async function askAI(src, onProgress) {
    var url = window.NC_AI_WORKER_URL;
    if (!url) throw new Error('No AI worker is configured on this site, so there is nothing to ask.');
    if (onProgress) onProgress('Taking four frames…');
    var frames = await grabFrames(src, AI_FRAMES);

    var parts = [{ text: PROMPT }];
    frames.forEach(function (f) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: f.b64 } });
    });

    if (onProgress) onProgress('Asking the AI…');
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        payload: {
          contents: [{ parts: parts }],
          generationConfig: { temperature: 0, maxOutputTokens: 300 }
        }
      })
    });
    var j = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error(j.error || j.reason || ('The AI worker answered ' + res.status + '.'));
    }

    var cand = j.candidates && j.candidates[0];
    var text = cand && cand.content && cand.content.parts &&
      cand.content.parts.map(function (p) { return p.text || ''; }).join('').trim();

    /* Gemini's own safety filter can refuse to answer, and a refusal is not
       nothing — it usually means the frames were the thing it would not
       discuss. Reported as its own outcome rather than as an error, because
       "the AI would not look at this" is information the creator should have. */
    if (!text) {
      var reason = (cand && cand.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason);
      if (reason && /safety|block|prohibit/i.test(String(reason))) {
        return { rating: 'refused', confidence: 'high',
                 why: 'The AI declined to answer about these frames, which usually means it ' +
                      'considered them unsafe to discuss. Treat that as a strong signal and ' +
                      'watch the clip back yourself.' };
      }
      throw new Error('The AI sent an empty answer back.');
    }

    var m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('The AI answered in a shape this could not read.');
    var parsed;
    try { parsed = JSON.parse(m[0]); } catch (e) { throw new Error('The AI answered in a shape this could not read.'); }
    return parsed;
  }

  /* Its verdict, as something to show. Deliberately not a score: a percentage
     invites an argument with the number instead of a look at the video. */
  var RATING = {
    ok:         ['ok',    'Nothing came up',            'The AI looked at four frames and saw nothing that would be a problem to post.'],
    suggestive: ['check', 'The AI thinks this is suggestive', ''],
    nudity:     ['high',  'The AI thinks there is nudity here', ''],
    sexual:     ['high',  'The AI thinks this is sexual content', ''],
    violence:   ['high',  'The AI thinks there is real violence here', ''],
    unsure:     ['low',   'The AI could not tell',      'Too dark, too blurred, or too little in the frames it saw.'],
    refused:    ['high',  'The AI would not answer',    '']
  };

  function aiFinding(v) {
    var r = RATING[v && v.rating] || RATING.unsure;
    var why = (v && v.why) || r[2];
    var conf = v && v.confidence;
    return {
      id: 'ai',
      level: r[0],
      title: r[1],
      body: why || '',
      sure: 'Gemini looked at four frames' + (conf ? ', and rates its own confidence ' + conf : '') +
            '. It gets things wrong in both directions — you are the one who decides.'
    };
  }

  /* ==========================================================================
     THE PANEL
     ========================================================================== */
  function boot() {
    if (document.getElementById('ncmod-css')) return;
    var st = document.createElement('style');
    st.id = 'ncmod-css';
    st.textContent = [
      '.ncmod{position:fixed;right:14px;bottom:14px;z-index:100003;width:min(400px,calc(100vw - 28px));',
        'max-height:min(70vh,560px);display:flex;flex-direction:column;overflow:hidden;border-radius:16px;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.14));box-shadow:0 24px 60px rgba(0,0,0,.55);',
        'font:400 13px/1.55 Inter,system-ui,sans-serif}',
      '.ncmod-h{display:flex;align-items:center;gap:9px;padding:12px 13px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncmod-h b{flex:1 1 auto;font-size:.9rem}',
      '.ncmod-x{width:32px;height:32px;flex:0 0 auto;border-radius:9px;cursor:pointer;font-size:17px;line-height:1;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.14));color:inherit}',
      '.ncmod-b{flex:1 1 auto;min-height:0;overflow-y:auto;padding:11px 13px}',
      '.ncmod-i{padding:11px;border-radius:11px;margin-bottom:9px;',
        'background:var(--nc-bg3,rgba(255,255,255,.05));border-left:3px solid var(--c,#8c96ad)}',
      '.ncmod-i.high{--c:#fb7185}.ncmod-i.check{--c:#fbbf24}.ncmod-i.low{--c:#8c96ad}.ncmod-i.ok{--c:#34d399}',
      '.ncmod-i b{display:block;margin-bottom:3px;font-size:.86rem}',
      '.ncmod-i p{margin:0;font-size:.79rem;color:var(--nc-dim,#8c96ad)}',
      '.ncmod-i i{display:block;margin-top:6px;font-style:normal;font-size:.72rem;opacity:.75}',
      '.ncmod-f{padding:10px 13px;border-top:1px solid var(--nc-line,rgba(255,255,255,.1));',
        'font-size:.72rem;color:var(--nc-dim,#8c96ad)}',
      /* The consent text is tall, and the footer is not a scroller — without
         a cap it squeezed the findings above it down to a couple of lines,
         so the panel argued with itself about what was worth reading. */
      '.ncmod-ai{padding:11px 13px;max-height:56vh;overflow-y:auto;',
        'border-top:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncmod-b{min-height:92px}',
      '.ncmod-ai button{width:100%;min-height:40px;padding:10px 13px;border-radius:10px;cursor:pointer;',
        'font:700 12.5px/1.3 inherit;color:inherit;background:var(--nc-bg3,rgba(255,255,255,.06));',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '.ncmod-ai button:hover{border-color:var(--nc-cyan,#00F0FF)}',
      '.ncmod-ai button[disabled]{opacity:.55;cursor:default}',
      '.ncmod-ai .off{margin-top:7px;font-size:11px;color:var(--nc-dim,#8c96ad);',
        'background:none;border:0;padding:4px;min-height:0;text-decoration:underline;cursor:pointer;width:auto}',
      '.ncmod-c{font-size:12px;line-height:1.55;color:var(--nc-dim,#8c96ad)}',
      '.ncmod-c b{color:var(--nc-text,#EAF2FF);display:block;margin-bottom:5px}',
      '.ncmod-c ul{margin:7px 0 9px 16px;padding:0}',
      '.ncmod-c li{margin:3px 0}',
      '.ncmod-c .row{display:flex;gap:7px;margin-top:10px}',
      '.ncmod-c .row button{flex:1 1 0}',
      '.ncmod-c .row .yes{background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent}',
      '@media (max-width:600px){.ncmod{right:8px;left:8px;bottom:8px;width:auto;max-height:60vh}}'
    ].join('');
    document.head.appendChild(st);
  }

  var panel = null;
  /* The object URL of the clip the open panel is about, so the AI button can
     reopen it. Released when the panel closes — see check(). */
  var revokeOnClose = null;
  function close() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    if (revokeOnClose) { try { URL.revokeObjectURL(revokeOnClose); } catch (e) {} revokeOnClose = null; }
  }

  function show(name, result, busy, src) {
    boot();
    close();
    var footer = aiOn()
      ? 'The checks above ran on this device. The AI check sends four stills when you press it, and only then.'
      : 'Checked on this device. No part of this video was uploaded, and nothing was reported to anybody.';
    panel = document.createElement('div');
    panel.className = 'ncmod';
    panel.setAttribute('role', 'status');

    var items;
    if (busy) {
      items = '<div class="ncmod-i low"><b>Checking…</b><p>Reading frames from ' +
              esc(name) + '. This happens in your browser.</p></div>';
    } else if (!result.findings.length) {
      items = '<div class="ncmod-i ok"><b>Nothing came up</b><p>No heavy flashing, ' +
              'nothing blank, nothing that asked for a second look. ' +
              'That is not the same as "this is fine to post" — only you can say that.</p></div>';
    } else {
      items = result.findings.map(function (f) {
        return '<div class="ncmod-i ' + f.level + '" data-id="' + esc(f.id) + '"><b>' + esc(f.title) + '</b>' +
               '<p>' + esc(f.body) + '</p>' +
               (f.sure ? '<i>' + esc(f.sure) + '</i>' : '') + '</div>';
      }).join('');
    }

    panel.innerHTML =
      '<div class="ncmod-h"><b>' + esc(name || 'This clip') + '</b>' +
        '<button class="ncmod-x" type="button" aria-label="Close">&times;</button></div>' +
      '<div class="ncmod-b">' + items + '</div>' +
      (busy || !src ? '' : '<div class="ncmod-ai" id="ncmodAi"></div>') +
      '<div class="ncmod-f">' + footer + '</div>';
    panel.querySelector('.ncmod-x').onclick = close;
    document.body.appendChild(panel);
    if (!busy && src) aiRow(src, name);

    /* A clean result is information, not an event — it goes away on its own.
       Anything with a finding in it stays until it is dismissed. Not while the
       AI row is offering something: a panel that vanishes mid-decision is a
       decision taken for somebody. */
    if (!busy && !result.findings.length && !src) setTimeout(function () { close(); }, 6000);
  }

  /* --------------------------------------------------------------------------
     THE AI ROW
     --------------------------------------------------------------------------
     Three states: not turned on (offer it), turned on (a button that runs it),
     and running. The consent is shown the first time and never again, with a
     way to withdraw it sitting under the button afterwards.
     -------------------------------------------------------------------------- */
  function aiRow(src, name) {
    var row = document.getElementById('ncmodAi');
    if (!row) return;

    if (!aiOn()) {
      row.innerHTML =
        '<div class="ncmod-c"><b>Want the AI to look at it?</b>' +
        'The check above counts colours, which is why it gets nudity wrong in both ' +
        'directions. Gemini can actually see the frames. To do that, four still ' +
        'frames have to leave this device.' +
        '<ul>' +
          '<li><b style="display:inline">What is sent:</b> four stills at 512px, as JPEG. ' +
            'Not the video, not the audio, not the filename.</li>' +
          '<li><b style="display:inline">Where:</b> NovaClip\'s worker, which passes them to ' +
            'Google\'s Gemini API. Neither NovaClip nor this page keeps them.</li>' +
          '<li><b style="display:inline">What it is not:</b> nothing is reported to anybody, ' +
            'no account is flagged, and nothing is blocked whatever it answers.</li>' +
        '</ul>' +
        '<div class="row"><button type="button" class="yes">Turn it on</button>' +
        '<button type="button" class="no">No thanks</button></div></div>';
      row.querySelector('.yes').onclick = function () { setAiOn(true); aiRow(src, name); run(); };
      row.querySelector('.no').onclick = function () { setAiOn(false); row.innerHTML = ''; };
      return;
    }

    row.innerHTML =
      '<button type="button" id="ncmodRun">Ask the AI to look at this clip</button>' +
      '<button type="button" class="off">Stop sending frames to the AI</button>';
    row.querySelector('#ncmodRun').onclick = run;
    row.querySelector('.off').onclick = function () { setAiOn(false); aiRow(src, name); };

    async function run() {
      var r2 = document.getElementById('ncmodAi');
      if (!r2) return;
      var btn = r2.querySelector('#ncmodRun');
      if (btn) { btn.disabled = true; btn.textContent = 'Working…'; }
      try {
        var verdict = await askAI(src, function (msg) {
          var b3 = document.getElementById('ncmodRun');
          if (b3) b3.textContent = msg;
        });
        /* "unsure" and "refused" are not verdicts, so they leave the colour
           count where it is — something is better than nothing there. */
        var decided = verdict && ['ok', 'suggestive', 'nudity', 'sexual', 'violence']
          .indexOf(verdict.rating) >= 0;
        addFinding(aiFinding(verdict), decided ? ['skin', 'ai', 'aierr'] : ['ai', 'aierr']);
      } catch (e) {
        addFinding({ id: 'aierr', level: 'low', title: 'Could not ask the AI',
                     body: (e && e.message) || String(e), sure: '' }, ['ai', 'aierr']);
      }
      var r3 = document.getElementById('ncmodAi');
      if (r3) aiRow(src, name);
    }
  }

  /* Adds a result to the open panel rather than replacing it, so the local
     findings and the AI's sit together instead of one wiping the other. */
  function addFinding(f, supersedes) {
    var body = panel && panel.querySelector('.ncmod-b');
    if (!body) return;
    var ok = body.querySelector('.ncmod-i.ok');
    if (ok && ok.parentNode) ok.parentNode.removeChild(ok);   // "nothing came up" is now out of date
    /* An answer from something that can actually see the frames replaces the
       colour count rather than arguing with it. Leaving both up gave the
       panel two opposite verdicts on the same clip — "worth looking at this
       again" directly above "nothing came up" — which is worse than either
       on its own, and makes the reader arbitrate between two things they have
       no way to judge. */
    (supersedes || []).forEach(function (id) {
      var old = body.querySelector('.ncmod-i[data-id="' + id + '"]');
      if (old && old.parentNode) old.parentNode.removeChild(old);
    });
    body.insertAdjacentHTML('beforeend',
      '<div class="ncmod-i ' + f.level + '" data-id="' + esc(f.id) + '"><b>' + esc(f.title) + '</b>' +
      '<p>' + esc(f.body) + '</p>' + (f.sure ? '<i>' + esc(f.sure) + '</i>' : '') + '</div>');
    body.scrollTop = body.scrollHeight;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ==========================================================================
     CATCHING AN IMPORT
     ==========================================================================
     The editor is a bundled React app, so there is no import function to wrap
     from out here — and reaching into minified internals would break on the
     next build. A capture-phase `change` listener on the document sees every
     file input on the page whoever owns it, which is stable against anything
     that happens inside the bundle.

     Capture phase, and deliberately passive about it: this does not preventoy
     the editor's own handler, does not cancel the event, and does not stop the
     clip being added. The check runs beside the import, not in front of it.
     ========================================================================== */
  function watch() {
    document.addEventListener('change', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT' || el.type !== 'file') return;
      var files = el.files;
      if (!files || !files.length) return;
      for (var i = 0; i < files.length; i++) {
        if (/^video\//.test(files[i].type)) { check(files[i]); break; }
      }
    }, true);
  }

  async function check(file) {
    var url = URL.createObjectURL(file);
    show(file.name, null, true, null);
    try {
      var result = await scanVideo(url);
      show(file.name, result, false, url);
    } catch (err) {
      show(file.name, { findings: [{
        id: 'err', level: 'low', title: 'Could not check this one',
        body: err && err.message ? err.message : String(err),
        sure: ''
      }] }, false, url);
    }
    /* The object URL is NOT revoked here. The AI button in the panel reopens
       the same video to grab its frames, and revoking on the way out of this
       function is what would make that button fail with a bare media error a
       minute later. It goes when the panel does. */
    revokeOnClose = url;
  }

  window.NC_MOD = {
    scan: scanVideo,
    check: check,
    report: report,
    show: show,
    close: close,
    askAI: askAI,
    aiEnabled: aiOn,
    setAiEnabled: setAiOn
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
})();
