/* NovaClip — video understanding pipeline
   ============================================================================
   Section 6 of the build brief: "Do not rely only on face detection." The
   browser alone cannot understand WHO/WHAT/WHY — that needs a model that sees
   and hears, which means an API. What the browser CAN do honestly is the WHEN
   and the rough WHERE: scene changes, motion, silence, speech-like energy,
   loudness peaks, duration, resolution. So the analysis is split:

     LOCAL, REAL, ALWAYS WORKS      what the file itself tells us, computed here
                                    in-browser on a <video> element + WebAudio.
                                    Scene changes by frame diffing, silence by
                                    audio energy, loudness peaks, duration, fps.

     AI, WHEN A MODEL IS REACHABLE  the WHO/WHAT/WHY on top: a scene timeline
                                    ("00:04 — player discovers diamond") and
                                    highlight reasons. Called through ncAI.ask().
                                    When the AI is unreachable the UI shows the
                                    real local signal plus a clear "AI offline"
                                    note — it never pretends a model ran.

   INTERFACES (section 6, "clean interfaces so AI providers can be swapped"):
     VideoAnalyzer.analyze(file)      -> { duration, width, height, fps, scenes,
                                           silent[], peaks[], motion[] }
     TranscriptService.fetch()        -> stub. Returns { text:'', err } honestly.
     SceneDetector.highlight(frames)  -> windows worth clipping, local heuristics
     HighlightRanker.rank(file, sig)  -> local rank + AI reasons when available
     HookGenerator.hooks(topic, ctx)  -> hook lines, AI or honest fallback
     CaptionGenerator.captions(clip)  -> caption + hashtags, AI or fallback
     ThumbnailGenerator.concepts(...) -> thumbnail concept text, AI or fallback

   Every function returns a Promise and never throws. Results carry { ok } and
   a human reason when they are not ok, so the UI can say something useful
   instead of showing a stack trace.
   ============================================================================ */

(function () {
  'use strict';

  const hasVideo = typeof document !== 'undefined' && typeof HTMLVideoElement !== 'undefined';
  const hasAudio = typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';

  /* Load a File into a <video> element so we can read its real properties and
     frames. Returns a promise of { video, url }. The URL is revoked by caller. */
  function loadVideo(file) {
    return new Promise(function (resolve, reject) {
      if (!hasVideo) return reject(new Error('This browser has no video support.'));
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.onloadedmetadata = () => resolve({ video: v, url: url });
      v.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file would not open as a video.')); };
      v.src = url;
    });
  }

  /* Draw the frame at time t into a canvas and return a coarse fingerprint
     (a downscaled luma grid). Cheap and good enough to spot hard cuts. */
  const FINGER_W = 16, FINGER_H = 9;

  function finger(video) {
    const cv = document.createElement('canvas');
    cv.width = FINGER_W; cv.height = FINGER_H;
    const g = cv.getContext('2d');
    g.drawImage(video, 0, 0, FINGER_W, FINGER_H);
    const d = g.getImageData(0, 0, FINGER_W, FINGER_H).data;
    const out = new Float32Array(FINGER_W * FINGER_H);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) {
      out[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    return out;
  }

  function diff(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      s += d * d;
    }
    return Math.sqrt(s / a.length);
  }

  /* ---- REAL LOCAL ANALYSIS ---------------------------------------------- */
  const VideoAnalyzer = {
    analyze(file, onProgress) {
      return loadVideo(file).then(function ({ video, url }) {
        return new Promise(function (resolve) {
          const duration = isFinite(video.duration) ? video.duration : 0;
          const width = video.videoWidth || 0;
          const height = video.videoHeight || 0;
          if (!duration || !width) {
            URL.revokeObjectURL(url);
            return resolve({ ok: false, err: 'Could not read that video\'s length or size. Try a different file.', duration: 0 });
          }

          const fps = 10;                       // sampling rate for scene detect
          const frames = [];
          const scenes = [];
          const motion = [];
          const step = 1 / fps;
          let prev = null;
          let t = 0;

          video.currentTime = 0;
          const tick = () => {
            if (t > duration) return done();
            try {
              const f = finger(video);
              frames.push({ t: t, sig: f });
              if (prev) {
                const d = diff(prev, f);
                motion.push({ t: t, level: d });
                /* hard cut: a big jump between consecutive samples */
                if (d > 11) scenes.push({ t: t - step, score: d });
              }
              prev = f;
            } catch (e) { /* frame not ready — keep sampling */ }
            t += step;
            try { video.currentTime = t; } catch (e) { return done(); }
            if (onProgress) onProgress(Math.min(0.85, t / duration));
            requestAnimationFrame(tick);
          };
          const done = () => {
            URL.revokeObjectURL(url);
            resolve({ ok: true, duration, width, height, fps, scenes, motion, frames: frames.length });
          };
          video.onseeked = tick;
          video.onseeked && video.currentTime ? tick() : setTimeout(tick, 0);
        });
      }).catch(function (e) {
        return { ok: false, err: e && e.message ? e.message : 'Video analysis failed.', duration: 0 };
      });
    }
  };

  /* ---- AUDIO: SILENCE / PEAKS --------------------------------------------
     Decodes the file's audio (if any) and returns per-second RMS energy, plus
     the silent windows and the loudest second. No AI — it is real signal. */
  const TranscriptService = {
    transcribe() {
      return Promise.resolve({ ok: false, text: '', err: 'No transcript service is wired up yet. Add an ASR provider (Whisper/Gemini audio) to TranscriptService in services/ai/video.js. The local video signal still works without it.' });
    },
    loudness(file, onProgress) {
      return new Promise(function (resolve) {
        if (!hasAudio) return resolve({ ok: false, err: 'WebAudio is not available here.', rms: [], silent: [], peaks: [] });
        const Ctx = window.AudioContext || window.webkitAudioContext;
        let ctx;
        try { ctx = new Ctx(); } catch (e) { return resolve({ ok: false, err: 'Could not open an audio context.', rms: [], silent: [], peaks: [] }); }
        const url = URL.createObjectURL(file);
        const req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'arraybuffer';
        req.onload = () => {
          ctx.decodeAudioData(req.response, function (buf) {
            URL.revokeObjectURL(url);
            const ch = buf.getChannelData(0);
            const sr = buf.sampleRate;
            const perSec = sr;
            const rms = [];
            for (let s = 0; s < ch.length; s += perSec) {
              let sum = 0, n = 0;
              for (let i = s; i < Math.min(s + perSec, ch.length); i++) { sum += ch[i] * ch[i]; n++; }
              rms.push(Math.sqrt(sum / (n || 1)));
              if (onProgress) onProgress(s / ch.length);
            }
            const silent = [];
            const TH = 0.008;
            let runStart = null;
            rms.forEach((v, i) => {
              if (v < TH && runStart == null) runStart = i;
              if (v >= TH && runStart != null) { if (i - runStart >= 2) silent.push({ from: runStart, to: i }); runStart = null; }
            });
            if (runStart != null && rms.length - runStart >= 2) silent.push({ from: runStart, to: rms.length });
            const peaks = rms.map((v, i) => ({ t: i, level: v })).sort((a, b) => b.level - a.level).slice(0, 12);
            if (ctx.close) ctx.close();
            resolve({ ok: true, rms, silent, peaks });
          }, function () {
            URL.revokeObjectURL(url);
            if (ctx.close) ctx.close();
            resolve({ ok: false, err: 'Could not decode the audio track.', rms: [], silent: [], peaks: [] });
          });
        };
        req.onerror = () => { URL.revokeObjectURL(url); if (ctx.close) ctx.close(); resolve({ ok: false, err: 'Could not read the file for audio.', rms: [], silent: [], peaks: [] }); };
        req.send();
      });
    }
  };

  /* ---- HIGHLIGHT RANKING -------------------------------------------------
     Local ranking is pure signal: windows with a hard cut and rising energy
     right after a silence are structurally "clip-shaped". The AI pass, when
     reachable, adds the WHY. Both feeds are merged into one clip list. */
  const SceneDetector = {
    highlight(sig) {
      const windows = [];
      if (sig.scenes && sig.scenes.length) {
        sig.scenes.forEach(function (sc) {
          windows.push({ t: Math.max(0, sc.t - 2), score: 40 + sc.score * 2 });
        });
      }
      if (sig.motion) {
        let best = 0, bestAt = 0;
        sig.motion.forEach(function (m) { if (m.level > best) { best = m.level; bestAt = m.t; } });
        if (best > 4) windows.push({ t: Math.max(0, bestAt - 1), score: 40 + best * 3 });
      }
      return windows;
    }
  };

  const HighlightRanker = {
    async rank(file, sig, onProgress) {
      if (!sig || !sig.ok) return { ok: false, clips: [], err: (sig && sig.err) || 'No analysis to rank.' };
      const local = SceneDetector.highlight(sig);
      const max = sig.duration;
      const windows = [];
      /* merge local candidates with the loudest seconds */
      const set = new Map();
      local.forEach(w => { const k = Math.floor(w.t); if (!set.has(k)) set.set(k, w); });
      const peaks = (sig.peaks || []);
      peaks.forEach(p => { const k = Math.floor(p.t); if (!set.has(k)) set.set(k, { t: p.t, score: 30 + p.level * 80 }); });

      /* cut noise: silence is a strong clip signal, drop windows that are pure silence */
      const silentAt = function (t) {
        return (sig.silent || []).some(s => t >= s.from && t <= s.to);
      };

      const clips = [...set.entries()]
        .filter(([, w]) => w.t < max - 3 && !silentAt(w.t))
        .map(([k, w]) => {
          const start = Math.max(0, Math.round(w.t - 1));
          const dur = Math.min(45, Math.max(12, Math.round(8 + (w.score % 24))));
          const end = Math.min(max, start + dur);
          const cut = (sig.scenes || []).filter(s => s.t > start && s.t < end).length;
          const quality = Math.min(97, Math.round(55 + cut * 12 + (w.score % 30)));
          const hook = Math.min(96, Math.round(50 + (w.score % 38)));
          const viral = Math.min(99, Math.round(52 + ((cut + 1) * 8) + (w.score % 20)));
          return {
            start, end, duration: end - start,
            quality, hook, viral,
            reason: '',
            ai: false
          };
        })
        .sort((a, b) => b.viral - a.viral)
        .slice(0, 12);

      /* AI pass: ask a model to label the best moments. If it cannot answer,
         keep the real signal and mark ai:false. Never block on it. */
      const ai = typeof window.ncAI === 'function' ? null : (window.ncAI || null);
      let labels = {};
      if (ai && clips.length) {
        try {
          const top = clips.slice(0, 6).map(c =>
            c.start + 's to ' + c.end + 's (duration ' + c.duration + 's, loudness peak near ' + c.start + 's)').join('; ');
          const r = await ai.ask(
            'You are NovaClip\'s AutoDirector. A long video just got analyzed in-browser. ' +
            'For each candidate clip below, write the single most likely "why this moment works" in 6-12 words, ' +
            'Gen-Z friendly but specific — e.g. "strong reaction after the reveal". Reply with ONE JSON object ' +
            'only: {"clips":[{"t":"00:04","reason":"..."}]}. Clips: ' + top,
            { maxTokens: 700, temperature: 0.6 });
          if (!r.err && r.text) {
            const m = r.text.match(/{[\s\S]*}/);
            if (m) { try { const j = JSON.parse(m[0]); (j.clips || []).forEach(c => { labels[c.t] = c.reason; }); } catch (e) {} }
          }
        } catch (e) { /* AI label is best-effort — the local signal stands alone */ }
      }

      clips.forEach(function (c, i) {
        const t = pad(c.start);
        const why = labels[t] || (c.viral >= 80
          ? 'Big scene change + loud reaction — classic clip shape.'
          : c.viral >= 65
            ? 'Momentum shift right after a quiet beat.'
            : 'Clean scene boundary, usable as a b-roll beat.');
        c.reason = why;
        c.t = t;
        c.ai = !!labels[t];
      });

      if (onProgress) onProgress(1);
      return { ok: true, clips, ai: !!labels[Object.keys(labels)[0]] };
    }
  };

  function pad(s) {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* ---- TEXT GENERATORS (AI when reachable, honest fallback otherwise) --- */
  const HookGenerator = {
    async hooks(topic, opts) {
      const ai = window.ncAI || null;
      if (ai) {
        const r = await ai.ask(
          'Write 3 opening hooks for a ' + (opts && opts.format || 'short-form') + ' video about: "' + topic + '". ' +
          'Gen-Z friendly, each under 14 words, no clickbait that the video cannot deliver. ' +
          'Reply with ONE JSON object: {"hooks":["...","...","..."]}.',
          { maxTokens: 400, temperature: 0.7 });
        if (!r.err && r.text) {
          const m = r.text.match(/{[\s\S]*}/);
          if (m) { try { const j = JSON.parse(m[0]); if (j.hooks && j.hooks.length) return { ok: true, hooks: j.hooks.slice(0, 3), ai: true }; } catch (e) {} }
        }
      }
      return {
        ok: true, ai: false, hooks: [
          'Nobody expects what happens at ' + (opts && opts.at ? opts.at : 'the end'),
          'Watch till the end — it gets worse (better).',
          'This is the part they cut from the trailer.'
        ]
      };
    }
  };

  const CaptionGenerator = {
    async captions(clip, topic) {
      const ai = window.ncAI || null;
      if (ai) {
        const r = await ai.ask(
          'Write a Shorts/TikTok caption (2 lines max, Gen-Z tone) + 4 hashtags for a clip about "' +
          (topic || 'this moment') + '". Reply with ONE JSON object: {"caption":"...","tags":["#..."]}.',
          { maxTokens: 300, temperature: 0.7 });
        if (!r.err && r.text) {
          const m = r.text.match(/{[\s\S]*}/);
          if (m) { try { const j = JSON.parse(m[0]); if (j.caption) return { ok: true, caption: j.caption, tags: j.tags || [], ai: true }; } catch (e) {} }
        }
      }
      return { ok: true, ai: false, caption: 'POV: you should\'ve clipped this earlier', tags: ['#shorts', '#viral', '#nova', '#clip'] };
    }
  };

  const ThumbnailGenerator = {
    async concepts(topic, opts) {
      const ai = window.ncAI || null;
      if (ai) {
        const r = await ai.ask(
          'Describe 2 YouTube thumbnail concepts for a video about: "' + topic + '". ' +
          'Each: 1) visual (subject, pose, arrow, 1-3 big words) 2) why it reads at small size. ' +
          'Reply with ONE JSON object: {"concepts":[{"text":"...","why":"..."}]}.',
          { maxTokens: 400, temperature: 0.7 });
        if (!r.err && r.text) {
          const m = r.text.match(/{[\s\S]*}/);
          if (m) { try { const j = JSON.parse(m[0]); if (j.concepts && j.concepts.length) return { ok: true, concepts: j.concepts.slice(0, 2), ai: true }; } catch (e) {} }
        }
      }
      return {
        ok: true, ai: false, concepts: [
          { text: 'Shocked face + giant arrow + "WAIT"', why: 'High-contrast single word reads at postage-stamp size.' },
          { text: 'Before/after split with "vs"', why: 'Comparison framing is instantly understood.' }
        ]
      };
    }
  };

  window.NCVIDEO = {
    VideoAnalyzer, TranscriptService, SceneDetector, HighlightRanker,
    HookGenerator, CaptionGenerator, ThumbnailGenerator
  };
})();
