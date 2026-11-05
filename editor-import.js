/* NOVACLIP — IMPORTING MORE THAN ONE FILE SHOULD NOT TAKE N TIMES AS LONG
 * ===========================================================================
 * Reported as "when i put more than one media the editor starts lagging and
 * the media doesnt appear on the time line". Both halves of that are one bug,
 * and it is in the editor's import loop:
 *
 *     for (const o of i) {
 *       const u = URL.createObjectURL(o);
 *       if (a === "video") { const v = await Wm(u, o.name); ... }   // waits
 *       s.push(c);
 *     }
 *     s.length && e(s);                                             // once
 *
 * Every file is probed for its duration, size and thumbnail BEFORE the next
 * one starts, and nothing is handed to the timeline until the whole loop has
 * finished. media-probe.js caps a single probe at four seconds, so four clips
 * off a phone can be sixteen seconds of an editor that looks hung — and for
 * all of that time the timeline is empty, because addAssets is called once, at
 * the end.
 *
 * WHAT THIS DOES
 *
 * The probes do not actually need to be sequential. Nothing in the loop
 * depends on the file before it; the await is just how the code was written.
 *
 * So the work is started earlier instead. URL.createObjectURL is where every
 * imported file passes through, and it is called for file two long before
 * file one has finished probing. Wrapping it means the probe for every file
 * begins the moment its URL exists, all of them at once, and the loop's await
 * then collects a promise that has been running the whole time rather than
 * starting one.
 *
 * Nothing about the editor's own flow changes: same probes, same results, same
 * order, same shape. They simply overlap. Importing eight files costs about
 * what the slowest one costs, not the sum of all eight.
 *
 * WHAT THIS DOES NOT FIX
 *
 * addAssets is still called once at the end, so the timeline still fills in
 * one go rather than file by file. That line is inside the compiled bundle and
 * cannot be reached from out here. It matters much less once the wait is the
 * slowest file rather than the total: the four-second worst case is now four
 * seconds for any number of files instead of four times however many there are.
 *
 * Images are not probed through a window hook, so their measurement cannot be
 * pre-empted the same way. Decoding is started early anyway, which is the
 * expensive part, so the editor's own probe then resolves off a warm cache.
 */
(function () {
  'use strict';
  if (window.NC_IMPORT) return;

  var MAX_CACHE = 64;        /* a long session should not grow without bound */
  var cache = new Map();     /* blob url -> in-flight probe promise */
  var warmed = new Map();    /* blob url -> Image, kept alive until collected */

  function kindOf(f) {
    var t = (f && f.type) || '';
    if (/^video\//.test(t)) return 'video';
    if (/^audio\//.test(t)) return 'audio';
    if (/^image\//.test(t)) return 'image';
    /* A file dragged in from some phones and some archives arrives with an
       empty type, so fall back to what it is called. */
    var n = ((f && f.name) || '').toLowerCase();
    if (/\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/.test(n)) return 'video';
    if (/\.(mp3|wav|m4a|aac|ogg|oga|flac)$/.test(n)) return 'audio';
    if (/\.(png|jpe?g|gif|webp|bmp|avif)$/.test(n)) return 'image';
    return '';
  }

  function remember(url, p) {
    cache.set(url, p);
    if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
  }

  /* The real probes, captured before anything is wrapped. media-probe.js is
     loaded from a plain script tag near the top of editor.html and this file
     is deferred to the end, so they are already defined by now; if that ever
     stops being true the guards below simply skip the pre-warm. */
  var realVideo = window.NC_PROBE_VIDEO;
  var realAudio = window.NC_PROBE_AUDIO;

  if (typeof realVideo === 'function') {
    window.NC_PROBE_VIDEO = function (url) {
      var hit = cache.get(url);
      if (hit) { cache.delete(url); return hit; }
      return realVideo.apply(null, arguments);
    };
  }
  if (typeof realAudio === 'function') {
    window.NC_PROBE_AUDIO = function (url) {
      var hit = cache.get(url);
      if (hit) { cache.delete(url); return hit; }
      return realAudio.apply(null, arguments);
    };
  }

  var nativeCreate = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function (obj) {
    var url = nativeCreate(obj);
    try {
      var k = kindOf(obj);
      if (k === 'video' && typeof realVideo === 'function') {
        /* .catch so a rejected probe cannot surface as an unhandled rejection
           before the editor gets round to awaiting it. The editor's own try
           /catch still sees the rejection when it does. */
        var pv = realVideo(url, obj && obj.name);
        if (pv && pv.catch) pv.catch(function () {});
        remember(url, pv);
      } else if (k === 'audio' && typeof realAudio === 'function') {
        var pa = realAudio(url, obj && obj.name);
        if (pa && pa.catch) pa.catch(function () {});
        remember(url, pa);
      } else if (k === 'image') {
        /* No hook to pre-empt, so warm the decode instead — that is the slow
           part, and the editor's probe then returns off the warm cache. */
        var im = new Image();
        im.decoding = 'async';
        im.src = url;
        warmed.set(url, im);
        if (warmed.size > MAX_CACHE) warmed.delete(warmed.keys().next().value);
      }
    } catch (e) { /* a failed pre-warm must never break the import */ }
    return url;
  };

  /* Let go of a file's pre-warm when the editor revokes its URL. */
  var nativeRevoke = URL.revokeObjectURL.bind(URL);
  URL.revokeObjectURL = function (url) {
    cache.delete(url);
    warmed.delete(url);
    return nativeRevoke(url);
  };

  window.NC_IMPORT = {
    pending: function () { return cache.size; },
    warmed: function () { return warmed.size; }
  };
})();
