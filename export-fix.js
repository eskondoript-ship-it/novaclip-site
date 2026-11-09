/* ============================================================================
   NOVACLIP EXPORT — PICKING AN ENCODER THAT ACTUALLY WORKS
   ============================================================================
   The export dialog offers a Codec (H.264, H.265, VP9, AV1) and a Format
   (MP4, WebM, MOV, MKV). Two things were wrong with that.

   THE CODEC BOX WAS NOT CONNECTED TO ANYTHING

   The export job was built as

       Ah({ width, height, fps, bitrateMbps, format, clips, tracks, ... })

   with no codec in it, and the mime type was chosen from the format alone.
   Picking VP9 and picking H.264 produced byte-identical files. Measured: both
   came out as the same 27,527-byte MP4.

   isTypeSupported LIES, AND THAT IS THE EXPENSIVE ONE

   Choosing WebM recorded to 78% and then failed with "The recorder produced
   an empty file. Try a shorter clip or a lower resolution." — advice that
   cannot help, because the length and the resolution were not the problem.
   MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') answers true,
   the recorder is created without complaint, and then it emits no data at
   all. Whether that is a missing hardware encoder or a headless quirk varies
   by machine, which is exactly why it cannot be decided in advance by asking.

   So this asks by doing: record the real stream for a third of a second and
   see whether any bytes come out. A candidate that produces nothing is
   skipped, and the next is tried. Three candidates cost about a second, once,
   against an export that would otherwise run its full length and fail.

   The list is built from both boxes — the codec first, because that is the
   more specific request, then the format's family, then everything else as a
   last resort. Something that records is always better than honouring a
   dropdown exactly and handing back nothing.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncPickRecorder) return;

  /* Written out rather than assembled, because the codec strings are exact
     and a template that builds them is a template that gets one wrong. */
  /* H.264 PROFILES, BEST FIRST, and the reason this list is not one entry.
     Every H.264 candidate used to be avc1.42E01E — Baseline profile, Level
     3.0 — and both halves of that are wrong for what this exports. Baseline
     has no CABAC and no B-frames, so at a fixed bitrate it is simply worse
     than High at the same number of bits; Level 3.0 tops out at 1620
     macroblocks, which is 720x576, so asking for it on a 1080p export is
     out of spec before the encoder starts. Reported as "the export video
     quality is very bad", and this is the part of that which is decided
     here.

     High and Main are offered first and Baseline stays at the end, so a
     browser that will not do better still gets exactly what it got before:
     isTypeSupported filters the list, and anything missing simply falls
     through. The levels go 4.2, 4.0, then 3.1, which covers 1080p60, 1080p30
     and 720p respectively — the browser picks the first it supports, so the
     level is never lower than the picture needs.

     HONEST LIMIT: this container's Chromium offers Baseline and nothing else,
     so the improvement is not measurable here — only the fallback is, and
     that is verified. On a desktop Chrome, which encodes H.264 through the
     platform, High is normally available. */
  var H264 = [
    'video/mp4;codecs=avc1.64002A,mp4a.40.2',   /* High  @ L4.2 */
    'video/mp4;codecs=avc1.640028,mp4a.40.2',   /* High  @ L4.0 */
    'video/mp4;codecs=avc1.64001F,mp4a.40.2',   /* High  @ L3.1 */
    'video/mp4;codecs=avc1.4D402A,mp4a.40.2',   /* Main  @ L4.2 */
    'video/mp4;codecs=avc1.4D4028,mp4a.40.2',   /* Main  @ L4.0 */
    'video/mp4;codecs=avc1.64002A', 'video/mp4;codecs=avc1.640028',
    'video/mp4;codecs=avc1.64001F', 'video/mp4;codecs=avc1.4D4028',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',   /* Baseline @ L3.0 — the old one */
    'video/mp4;codecs=avc1.42E01E', 'video/mp4',
    'video/webm;codecs=h264'
  ];

  var BY_CODEC = {
    'h.264': H264,
    'h.265': ['video/mp4;codecs=hvc1.1.6.L93.B0,mp4a.40.2', 'video/mp4;codecs=hev1', 'video/mp4'],
    'vp9':   ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm'],
    'vp8':   ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'],
    'av1':   ['video/webm;codecs=av01,opus', 'video/webm;codecs=av01', 'video/mp4;codecs=av01']
  };
  /* The MP4 family leads with the same best-first H.264 list, so choosing
     the container without touching the codec box does not quietly drop to
     Baseline. */
  var MP4_FAMILY = H264.concat(['video/webm;codecs=vp8,opus', 'video/webm']);
  var WEBM_FAMILY = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  /* The order things are actually likely to work in, when everything asked
     for has failed. vp8 before vp9 on purpose: it is the older, softer,
     more universally present encoder. */
  var LAST_RESORT = ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm',
                     'video/mp4', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2'];

  /* --------------------------------------------------------------------------
     THE CONTAINER OUTRANKS THE CODEC, AND THAT ORDER IS NOT ARBITRARY
     --------------------------------------------------------------------------
     Codec-first looks reasonable and is wrong. Asking for WebM with the codec
     box left on its H.264 default put video/mp4 at the head of the list, it
     recorded fine, and the file came out named .mp4 — the one box whose whole
     job is to decide what kind of file you get, overruled by the box next to
     it that was still on its default.

     The container is what the reader chose and what the filename says. The
     codec is a preference for how to fill it. So: candidates that satisfy
     both, then anything in the right container, then the codec somewhere
     else, then whatever records at all.
     -------------------------------------------------------------------------- */
  function candidates(format, codec) {
    var out = [];
    function add(list) {
      for (var i = 0; i < list.length; i++) if (out.indexOf(list[i]) < 0) out.push(list[i]);
    }
    var c = String(codec || '').toLowerCase().replace(/\s*\(.*\)\s*/, '').trim();
    var wantMp4 = /mp4|mov|mkv/i.test(String(format || ''));
    var inWanted = function (m) { return (m.indexOf('video/mp4') === 0) === wantMp4; };
    var byCodec = BY_CODEC[c] || [];

    add(byCodec.filter(inWanted));                       // both, ideally
    add(wantMp4 ? MP4_FAMILY : WEBM_FAMILY);             // the container, at least
    add(byCodec.filter(function (m) { return !inWanted(m); }));
    add(LAST_RESORT);
    return out.filter(function (m) {
      try { return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m); }
      catch (e) { return false; }
    });
  }

  function extFor(mime) { return String(mime || '').indexOf('video/mp4') === 0 ? 'mp4' : 'webm'; }

  /* Does this mime actually emit bytes on this stream, on this machine? */
  function trial(stream, mime, bps) {
    return new Promise(function (resolve) {
      var rec, got = 0, done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) {}
        resolve(ok);
      }
      try {
        rec = new MediaRecorder(stream, mime
          ? { mimeType: mime, videoBitsPerSecond: bps }
          : { videoBitsPerSecond: bps });
      } catch (e) { return resolve(false); }
      /* Resolve the moment anything arrives, and only wait out the ceiling
         when nothing has. VP8 and VP9 answer in about a tenth of a second, so
         the common case costs almost nothing.

         The ceiling is 1.2s and not the 340ms this first had, because that
         number was wrong in a way that mattered: fragmented MP4 buffers its
         first chunk noticeably longer than WebM does, and measured on this
         machine `video/mp4` produced nothing at all inside 340ms while
         producing a perfectly good file over a full export. A trial that
         rejects the format the browser is best at is worse than no trial. */
      rec.ondataavailable = function (e) {
        if (e.data && e.data.size) { got += e.data.size; finish(true); }
      };
      rec.onerror = function () { finish(false); };
      try { rec.start(100); } catch (e) { return resolve(false); }
      setTimeout(function () { finish(got > 0); }, 1200);
    });
  }

  /* WHAT MediaRecorder ACTUALLY DELIVERS, which is not what it is asked for.
     Reported as "the export video quality is very bad". Measured here, on a
     1080p canvas of moving colour and text recorded for three seconds, by
     reading the finished file back with ffprobe:

         asked  4 Mbps  ->  delivered 2.53 Mbps
         asked  8 Mbps  ->  delivered 2.87 Mbps
         asked 24 Mbps  ->  delivered 8.36 Mbps

     videoBitsPerSecond is advisory and this encoder lands near a third of
     it. The export dialog's default is 8, so a 1080p export was being
     written at roughly 2.9 Mbps — which is a fine number for 480p and a
     visibly bad one for 1920x1080. That is the whole complaint.

     THIS ONLY TOUCHES THE DEFAULT. 8 is the number the dialog starts on, and
     nobody who has thought about bitrate lands on exactly 8 by accident, so
     it is treated as "I did not choose" and replaced with something the
     resolution deserves. Any other value is passed through untouched —
     somebody who typed 4 because they want a small file still gets 4, and
     somebody who typed 30 still gets 30. The floor is a floor, never a cap.

     The numbers are the request, not the result: at roughly a third
     delivered, 1080p asking for 20 lands near 7 Mbps, which is a normal
     bitrate for 1080p30 H.264 and about what a phone writes. */
  var DEFAULT_BPS = 8e6;
  function autoRate(stream, bps) {
    if (Math.abs(bps - DEFAULT_BPS) > 1) return bps;      /* chosen on purpose */
    var h = 0;
    try {
      var t = stream.getVideoTracks && stream.getVideoTracks()[0];
      var g = t && t.getSettings && t.getSettings();
      if (g && g.height) h = g.height;
    } catch (e) {}
    if (!h) return bps;
    if (h >= 2000) return 60e6;        /* 4K  */
    if (h >= 1400) return 36e6;        /* 1440p */
    if (h >= 1000) return 20e6;        /* 1080p */
    if (h >= 700)  return 12e6;        /* 720p  */
    return bps;                        /* smaller than that, 8 is plenty */
  }

  window.__ncPickRecorder = function (stream, format, codec, bps) {
    var list = candidates(format, codec);
    var rate = autoRate(stream, Math.max(1, Number(bps) || 8e6));

    function attempt(i) {
      if (i >= list.length) {
        /* Nothing named worked. One last go with no mimeType at all, which
           lets the browser choose for itself — and if that fails there is
           genuinely no encoder here. */
        return trial(stream, '', rate).then(function (ok) {
          if (!ok) return null;
          try {
            return { recorder: new MediaRecorder(stream, { videoBitsPerSecond: rate }),
                     mime: '', ext: 'webm' };
          } catch (e) { return null; }
        });
      }
      var mime = list[i];
      return trial(stream, mime, rate).then(function (ok) {
        if (!ok) return attempt(i + 1);
        try {
          return { recorder: new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: rate }),
                   mime: mime, ext: extFor(mime) };
        } catch (e) { return attempt(i + 1); }
      });
    }
    return attempt(0);
  };

  /* ==========================================================================
     THE FROZEN STRETCHES IN AN EXPORTED CLIP
     ==========================================================================
     Reported as "when i export a clip a big part of the clip freezes after
     exported", and it is not a codec problem — it is the clock.

     The export loop runs on the wall clock:

         const F = (performance.now() - y) / 1e3;      // timeline position
         if (Math.abs(V.currentTime - b) > .25) V.currentTime = b;
         Wd(v, c.width, c.height, F, ...);             // draw at F

     F is real elapsed time, the seek is fired and not waited for, and the
     draw happens immediately. So while a source video is still seeking or
     has not buffered the moment it was sent to, the canvas is painted with
     the frame it is still showing — the previous one — and captureStream
     dutifully records that same picture again and again. Meanwhile F marches
     on. That is the freeze, and it is worst at the start of a clip, which is
     where the first real seek happens: the editor pre-loads each source to
     readyState 2 at time zero, but a clip whose sourceStart is forty seconds
     in has to go and fetch that part when its turn comes.

     THE FIX IS TO STOP TIME RATHER THAN TO DRAW HARDER

     While any source is seeking or starved, two things happen together:

       - the recorder is paused, so nothing is written;
       - performance.now() is held still, so the loop recomputes the same F,
         re-draws the same frame and asks for the same seek instead of
         skipping ahead.

     Both halves are needed. Pausing alone would drop the stalled section out
     of the video; freezing the clock alone would record the stall. Together
     the export simply takes a little longer than the timeline and the file
     that comes out is complete.

     performance.now is patched only between picking the encoder and the
     recorder stopping, and it is restored by the stop event, by a wrapped
     stop(), and by a long backstop timer, because leaving a patched clock
     behind would be a far worse bug than the one being fixed.

     STALL_CAP exists so a genuinely broken source cannot hang an export for
     ever: after that long the wait is abandoned, the clock resumes, and the
     export carries on with whatever is on screen — the old behaviour, which
     is the right thing to fall back to.
     ========================================================================== */

  var STALL_CAP = 8000;     /* ms to wait on one stall before giving up */
  var videos = [];          /* export sources, weakly kept */

  /* The export builds its sources with document.createElement('video') and
     never attaches them, so this is the only place they can be seen from. */
  var madeEl = document.createElement;
  document.createElement = function (tag) {
    var el = madeEl.apply(document, arguments);
    try {
      if (String(tag).toLowerCase() === 'video') {
        videos.push(el);
        if (videos.length > 400) videos = videos.slice(-200);
      }
    } catch (e) {}
    return el;
  };

  function stalled() {
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      if (!v || !v.src || v.isConnected) continue;   /* on-page video is preview, not export */
      if (v.seeking) return true;
      if (!v.paused && v.readyState < 2) return true;
    }
    return false;
  }

  function hold(recorder) {
    /* The function itself, not a bound copy. Restoring a bound copy leaves
       performance.now subtly different from how it was found, and the next
       export then binds that, so every export adds a layer. */
    var realNow = performance.now;
    var now = function () { return realNow.call(performance); };
    var lost = 0;             /* total ms the clock has been held */
    var since = 0;            /* when the current stall began, real ms */
    var done = false;
    var raf = 0;

    performance.now = function () { return now() - lost - (since ? now() - since : 0); };

    function release() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      performance.now = realNow;
    }

    function tick() {
      if (done) return;
      var t = now();
      if (since && t - since > STALL_CAP) {       /* give up on this one */
        lost += t - since; since = 0;
        try { if (recorder.state === 'paused') recorder.resume(); } catch (e) {}
      } else if (stalled()) {
        if (!since) {
          since = t;
          try { if (recorder.state === 'recording') recorder.pause(); } catch (e) {}
        }
      } else if (since) {
        lost += t - since; since = 0;
        try { if (recorder.state === 'paused') recorder.resume(); } catch (e) {}
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    /* addEventListener rather than onstop: the bundle assigns onstop itself
       and whichever of us wrote last would win. */
    try { recorder.addEventListener('stop', release); } catch (e) {}
    var stop = recorder.stop;
    try {
      recorder.stop = function () { release(); return stop.apply(recorder, arguments); };
    } catch (e) {}
    setTimeout(release, 2 * 60 * 60 * 1000);        /* backstop: two hours */

    return { release: release, held: function () { return lost; } };
  }

  var held = null;
  var pick = window.__ncPickRecorder;
  window.__ncPickRecorder = function () {
    return Promise.resolve(pick.apply(null, arguments)).then(function (picked) {
      if (picked && picked.recorder) {
        try { if (held) held.release(); } catch (e) {}
        held = hold(picked.recorder);
      }
      return picked;
    });
  };

  window.NC_EXPORT = {
    candidates: candidates,
    extFor: extFor,
    /* For the test harness: how long the clock was held on the last export. */
    heldMs: function () { return held ? held.held() : 0; },
    stalled: stalled
  };
})();
