/* NOVACLIP — ONE SMALL WATERMARK ON FREE EXPORTS
 * ===========================================================================
 * pricing.html has sold "No watermark on your exports" as a paid perk since
 * the plans went up (nova.js, key f9). Free exports did not carry one either,
 * so the perk was empty — somebody paying got nothing they were promised.
 * This makes the promise true in the only honest direction: the free export
 * gets a mark, the paid export stays exactly as it was.
 *
 * ONE MARK, AND SMALL
 * ---------------------------------------------------------------------------
 * Bottom right, one line, about 2.6% of the frame's height, 80% opaque, with
 * a soft shadow so it survives both a white sky and a black hoodie. It is
 * meant to be noticed and ignored, not to ruin the shot — nobody has ever
 * been persuaded to pay by a mark that wrecks the video, they just go and use
 * something else.
 *
 * WHY IT COMPOSITES INSTEAD OF DRAWING ON THE EDITOR'S CANVAS
 * ---------------------------------------------------------------------------
 * The export records the preview canvas with captureStream(). Stamping the
 * mark onto that canvas would mean racing the bundle's own draw loop every
 * frame: whoever painted last would win, so the mark would flicker in and out
 * of the recording, which is worse than no mark at all.
 *
 * So captureStream is wrapped. The recorder is handed a stream from a second
 * canvas that this file owns, and each frame it draws the editor's canvas and
 * then the mark on top. The mark cannot be lost to a race because nothing
 * else ever paints on that canvas, and the preview the person is watching is
 * untouched — the mark exists only in the file that comes out.
 *
 * It restores itself if anything throws: a failure here must cost the mark,
 * never the export.
 */
(function () {
  'use strict';
  if (window.NC_WATERMARK) return;

  var TEXT       = 'novaclip.org';
  var HEIGHT_PC  = 0.026;   /* cap height as a share of frame height */
  var PAD_PC     = 0.022;   /* inset from the bottom-right corner */
  var ALPHA      = 0.80;
  var MIN_PX     = 11;      /* below this it is unreadable, so stop shrinking */

  /* THE TRIAL IS WHY YOU MAY NOT SEE THIS AT ALL AT FIRST.
     nova.js hands every new visitor a fortnight of the bundle, four times
     over, and that record carries tools:true — so for the first eight weeks
     ncProHas('tools') is true and the export comes out clean. That is the
     existing design (the trial is "everything"), so it is left alone: the
     mark starts appearing when the trial finally lapses.
     Set this to true if you would rather the mark ran through the trial and
     came off only when somebody actually pays. It makes the perk visible on
     day one, at the cost of a trial that is no longer quite everything. */
  var MARK_DURING_TRIAL = false;

  function paid() {
    try {
      if (!window.ncPro) return false;
      var p = window.ncPro();
      if (!p || !p.tools) return false;
      if (MARK_DURING_TRIAL && p.trial) return false;
      return true;
    }
    catch (e) { return false; }   /* unknown means free, never the other way */
  }

  function stamp(ctx, w, h) {
    var size = Math.max(MIN_PX, Math.round(h * HEIGHT_PC));
    var pad  = Math.round(h * PAD_PC);
    ctx.save();
    ctx.globalAlpha = ALPHA;
    ctx.font = '600 ' + size + 'px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    /* A shadow rather than a plate behind the text: a box in the corner reads
       as a broken overlay, a shadow reads as a caption and stays legible on
       white. */
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = Math.max(2, Math.round(size * 0.35));
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(TEXT, w - pad, h - pad);
    ctx.restore();
  }

  var native = HTMLCanvasElement.prototype.captureStream;
  if (typeof native !== 'function') return;

  HTMLCanvasElement.prototype.captureStream = function (fps) {
    var src = this;
    if (paid()) return native.apply(src, arguments);

    var mirror, mctx, stream, raf = 0, stopped = false;
    try {
      mirror = document.createElement('canvas');
      mirror.width  = src.width  || 1280;
      mirror.height = src.height || 720;
      mctx = mirror.getContext('2d');
      if (!mctx) return native.apply(src, arguments);
      stream = native.apply(mirror, arguments);
    } catch (e) {
      return native.apply(src, arguments);   /* never cost them the export */
    }

    function frame() {
      if (stopped) return;
      try {
        /* The editor can change project size mid-session; follow it rather
           than letting the export come out stretched. */
        if (src.width && src.height &&
            (mirror.width !== src.width || mirror.height !== src.height)) {
          mirror.width = src.width;
          mirror.height = src.height;
        }
        mctx.clearRect(0, 0, mirror.width, mirror.height);
        mctx.drawImage(src, 0, 0, mirror.width, mirror.height);
        stamp(mctx, mirror.width, mirror.height);
      } catch (e) { /* one bad frame must not end the recording */ }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    /* Stop painting when the recorder lets go, or the loop runs for the rest
       of the session behind every later export. */
    try {
      stream.getTracks().forEach(function (t) {
        var end = t.stop;
        t.stop = function () { stopped = true; cancelAnimationFrame(raf); return end.apply(t, arguments); };
        t.addEventListener('ended', function () { stopped = true; cancelAnimationFrame(raf); });
      });
    } catch (e) {}

    return stream;
  };

  window.NC_WATERMARK = {
    text: TEXT,
    /* For the test harness: render one onto a canvas without an export. */
    preview: function (canvas) {
      var c = canvas.getContext('2d');
      stamp(c, canvas.width, canvas.height);
      return { size: Math.max(MIN_PX, Math.round(canvas.height * HEIGHT_PC)) };
    },
    wouldMark: function () { return !paid(); }
  };
})();
