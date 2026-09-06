/* ============================================================================
   MEDIA PROBE — how long is this file, actually
   ============================================================================
   The editor asks one question of every file dropped into it: how long is it.
   The answer decides how long the clip on the timeline is, so getting it wrong
   is not a cosmetic problem — it is the difference between a minute of footage
   and five seconds of it.

   WHAT WENT WRONG BEFORE

   The editor's own probe was four lines and had three ways to be wrong, all of
   them silent:

     no duration in the header    A file written by MediaRecorder — which is
                                  every clip this site exports, every screen
                                  recording, and a lot of what comes off a
                                  phone — has no duration written at the front.
                                  The browser reports Infinity until it has
                                  seen the end of the file, and `duration || 0`
                                  turns Infinity into Infinity, which then
                                  becomes an Infinity-long clip.

     the browser cannot decode    An iPhone records HEVC by default and most
                                  browsers cannot play it. The old probe fired
                                  onerror, resolved with duration 0, and the
                                  editor turned 0 into a FIVE SECOND clip with
                                  no thumbnail and no message. A minute of
                                  video became five seconds and nothing on
                                  screen said why. This is the bug this file
                                  exists for.

     the seek never completes     The probe only resolved from onseeked. If the
                                  seek never landed there was no timeout and no
                                  fallback, so the promise never settled, the
                                  await above it never returned, and the file
                                  simply never appeared in the library.

   WHAT IT DOES NOW

   Asks in order, and stops at the first answer that is a real number:

     1. the duration in the header, if it is finite and above zero
     2. seekable.end() — present for a streamed file even when the header
        duration is not
     3. seek to 1e101. A browser clamps that to the true end of the media and,
        having now seen the end, starts reporting the real duration. It is a
        trick, it is the documented way to do this, and it is why a clip
        exported from NovaClip can be imported back into NovaClip.

   And it always settles: every path has a timeout, so a file can fail to load
   but it can no longer hang the import.

   WHEN IT STILL CANNOT TELL

   It says so, out loud, naming the likely reason — and the caller is told the
   duration is a guess rather than being handed a number that looks measured.
   A wrong answer delivered confidently is what made the old bug so hard to
   see.

   Nothing here uploads anything. It is one <video> element and a seek.
   ========================================================================== */
(function () {
  'use strict';

  /* Long enough for a large file to parse its header off disk, short enough
     that a file which will never load does not hold the import open. */
  var META_MS = 12000;
  var SEEK_MS = 6000;

  function ok(d) { return typeof d === 'number' && isFinite(d) && d > 0; }

  /* seekable/buffered are TimeRanges; end() throws if the range is empty, so
     every read of them is guarded. */
  function fromRanges(el) {
    try {
      if (el.seekable && el.seekable.length) {
        var s = el.seekable.end(el.seekable.length - 1);
        if (ok(s)) return s;
      }
    } catch (e) {}
    try {
      if (el.buffered && el.buffered.length) {
        var b = el.buffered.end(el.buffered.length - 1);
        if (ok(b)) return b;
      }
    } catch (e) {}
    return 0;
  }

  /* The 1e101 seek. The browser clamps it to the end of the media; once it has
     been to the end it knows how long the file is. Restores the element to the
     start afterwards so the caller can still grab a first frame. */
  function forceDuration(el) {
    return new Promise(function (resolve) {
      var settled = false;
      var finish = function (d) {
        if (settled) return;
        settled = true;
        el.ontimeupdate = null;
        el.onseeked = null;
        clearTimeout(timer);
        resolve(ok(d) ? d : 0);
      };
      var timer = setTimeout(function () { finish(fromRanges(el)); }, SEEK_MS);

      el.ontimeupdate = function () {
        if (!ok(el.duration)) return;
        finish(el.duration);
      };
      el.onseeked = function () {
        if (ok(el.duration)) finish(el.duration);
      };
      try { el.currentTime = 1e101; } catch (e) { finish(fromRanges(el)); }
    });
  }

  /* The whole question, for one media element that already has a src. */
  function measure(el) {
    return new Promise(function (resolve) {
      var settled = false;
      var finish = function (d, how) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ duration: ok(d) ? d : 0, how: how });
      };
      var timer = setTimeout(function () {
        finish(fromRanges(el), 'timed out waiting for metadata');
      }, META_MS);

      el.onerror = function () {
        var code = (el.error && el.error.code) || 0;
        finish(0, code === 4 ? 'the browser cannot decode this file' : 'the file failed to load');
      };

      el.onloadedmetadata = function () {
        if (ok(el.duration)) { finish(el.duration, 'header'); return; }
        var r = fromRanges(el);
        if (ok(r)) { finish(r, 'seekable range'); return; }
        /* No duration in the header — the MediaRecorder case. Go and find it. */
        forceDuration(el).then(function (d) {
          if (ok(d)) {
            try { el.currentTime = 0; } catch (e) {}
            finish(d, 'measured by seeking to the end');
          } else {
            finish(0, 'no duration anywhere in the file');
          }
        });
      };
    });
  }

  /* nova.js defines toast() at the top level, so it is on window wherever
     nova.js has loaded — which on the editor page it has. The console line
     goes out either way: the toast hides itself after three seconds and this
     is the kind of message somebody may want to read twice. */
  function say(msg) {
    try {
      if (typeof window.toast === 'function') window.toast(msg);
      else if (typeof window.ncToast === 'function') window.ncToast(msg);
    } catch (e) {}
    try { console.warn('[NovaClip] ' + msg); } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     The two entry points the editor calls. Their return shape is exactly what
     the editor already expected, plus `durationKnown` — so an older caller
     keeps working and a newer one can tell a measurement from a guess.
     ------------------------------------------------------------------------ */

  window.NC_PROBE_VIDEO = function (url, name) {
    var v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.playsInline = true;
    /* Deliberately NOT setting crossOrigin. It would let the thumbnail be drawn
       from a cross-origin file, but only for a server that sends CORS headers —
       and for one that does not it turns "loads, no thumbnail" into "does not
       load at all", which is the exact failure this file exists to remove.
       Everything the editor probes is a blob URL from a local file anyway. */
    v.src = url;

    return measure(v).then(function (m) {
      var out = {
        duration: m.duration,
        durationKnown: ok(m.duration),
        width: v.videoWidth || 1920,
        height: v.videoHeight || 1080,
        thumbnail: ''
      };

      if (!out.durationKnown) {
        /* Say which file and why, because "it imported short" with no message
           is exactly what made this worth fixing. */
        say((name ? '"' + name + '": ' : '') + 'could not read how long this video is — ' +
            m.how + '. It has been placed as a 5 second clip; drag its edge to the ' +
            'length you want. If it came off an iPhone, re-export it as H.264 and ' +
            'it will import properly.');
        return out;
      }

      /* A first frame for the library card. Failure here costs a thumbnail and
         nothing else, so it never blocks the answer. */
      return new Promise(function (resolve) {
        var done = false;
        var give = function () {
          if (done) return;
          done = true;
          clearTimeout(t);
          resolve(out);
        };
        var t = setTimeout(give, 4000);
        v.onseeked = function () {
          try {
            var c = document.createElement('canvas');
            c.width = 160; c.height = 90;
            var cx = c.getContext('2d');
            if (cx) {
              cx.drawImage(v, 0, 0, c.width, c.height);
              out.thumbnail = c.toDataURL('image/jpeg', 0.6);
            }
          } catch (e) { out.thumbnail = ''; }
          give();
        };
        v.onerror = give;
        /* A frame slightly in, because frame zero of a lot of footage is black
           — but never past the end of a very short clip. */
        try { v.currentTime = Math.min(0.1, out.duration / 2); } catch (e) { give(); }
      });
    });
  };

  window.NC_PROBE_AUDIO = function (url, name) {
    var a = document.createElement('audio');
    a.preload = 'metadata';
    a.src = url;
    return measure(a).then(function (m) {
      if (!ok(m.duration)) {
        say((name ? '"' + name + '": ' : '') + 'could not read how long this audio is — ' +
            m.how + '. It has been placed as a 5 second clip.');
      }
      return { duration: m.duration, durationKnown: ok(m.duration) };
    });
  };
})();
