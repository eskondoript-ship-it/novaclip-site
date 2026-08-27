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
  var BY_CODEC = {
    'h.264': ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E', 'video/mp4',
              'video/webm;codecs=h264'],
    'h.265': ['video/mp4;codecs=hvc1.1.6.L93.B0,mp4a.40.2', 'video/mp4;codecs=hev1', 'video/mp4'],
    'vp9':   ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm'],
    'vp8':   ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'],
    'av1':   ['video/webm;codecs=av01,opus', 'video/webm;codecs=av01', 'video/mp4;codecs=av01']
  };
  var MP4_FAMILY = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm'];
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

  window.__ncPickRecorder = function (stream, format, codec, bps) {
    var list = candidates(format, codec);
    var rate = Math.max(1, Number(bps) || 8e6);

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

  window.NC_EXPORT = { candidates: candidates, extFor: extFor };
})();
