/* ============================================================================
   NOVACLIP VIDEO RANKING  —  one number out of ten, and where it came from
   ============================================================================
   Two places needed the same judgement and were going to end up disagreeing:

     Studio   the videos already on the channel, ranked against each other
     Publish  the one about to go out, before there is anything to measure

   So the scale lives here once. A 7.2 means the same thing on both pages, and
   the four things it is made of are the same four.

   WHY 1-10 AND NOT 0-100

   0-100 invites false precision — nobody can tell 63 from 67, and both look
   like a mark out of a hundred that somebody stands behind. One decimal out
   of ten reads as a rating rather than a percentage, which is what it is.
   The floor is 1.0 rather than 0: a video that exists is not a zero, and a
   scale that can print 0.0 for something somebody made is a scale that gets
   ignored the first time it does.

   WHAT IS AND IS NOT MEASURED

   Every part is computed from something real. Reach and engagement come from
   the channel's own numbers, compared against that channel's own median —
   never against other channels, because a good week for a 200-subscriber
   channel and for a 200,000-subscriber one are different numbers and pitting
   them against each other teaches nothing.

   There is deliberately no "virality" score and no prediction of views. That
   would need a model this does not have, and a confident number with nothing
   behind it is worse than no number. What a draft gets scored on is how well
   it is set up — the title, the length, whether it has a thumbnail, when it
   is going out — which is knowable before posting and is the part that is
   still in your hands.

   THE RANKING IS AGAINST YOURSELF

   The list is sorted best-first and numbered, so it answers "which of these
   worked" rather than "is this good", which is the question somebody with
   ten videos actually has.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_RANK) return;

  function num(v, d) { var n = Number(v); return isFinite(n) ? n : (d || 0); }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function median(nums) {
    var a = nums.filter(function (n) { return isFinite(n); }).sort(function (x, y) { return x - y; });
    if (!a.length) return 0;
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  /* 0-100 from a ratio against a median, where exactly typical is 60. The
     0.6 exponent is what stops a video with ten times the usual views from
     scoring ten times as well — past a point, more views is the same news. */
  function ratioScore(value, mid) {
    if (!mid) return 50;
    var r = value / mid;
    return clamp(Math.round(60 * Math.pow(r, 0.6)), 0, 100);
  }

  /* The only part that judges the video rather than its numbers, and the only
     one that works before posting — which is why the draft path leans on it. */
  function titleScore(t) {
    var s = String(t || ''), score = 40, len = s.length;
    if (len >= 30 && len <= 70) score += 22;          // survives mobile truncation
    else if (len >= 20 && len <= 85) score += 10;
    if (/\d/.test(s)) score += 12;                    // a number is a promise
    if (/\?/.test(s)) score += 8;                     // a question is a hook
    if (/^(how|why|what|i |we |this|the day|stop|never|do not|don't)/i.test(s)) score += 10;
    var caps = s.replace(/[^A-Z]/g, '').length;
    if (len > 8 && caps / len > 0.6) score -= 20;     // ALL CAPS reads as spam
    if (len < 15) score -= 15;
    return clamp(score, 0, 100);
  }

  /* 0-100 in, 1.0-10.0 out, one decimal. Clamped at the bottom rather than
     allowed to reach zero — see the header. */
  function outOfTen(hundred) {
    return Math.round(clamp(hundred / 10, 1, 10) * 10) / 10;
  }

  var LABELS = {
    reach:      'Reach',
    engagement: 'Engagement',
    title:      'Title',
    timing:     'Timing',
    length:     'Length',
    thumbnail:  'Thumbnail',
    setup:      'Description'
  };

  /* ==========================================================================
     ALREADY POSTED
     ==========================================================================
     Needs at least two videos, because every part is a comparison against the
     channel's own median and one video is its own median — it would score
     exactly average by construction and say nothing.
     ========================================================================== */
  function posted(list) {
    if (!list || list.length < 2) return [];
    var byDate = list.slice().sort(function (a, b) { return b.date - a.date; });
    var midViews = median(byDate.map(function (v) { return num(v.views); }));
    var midEng = median(byDate.map(function (v) {
      return num(v.views) > 0 ? (num(v.likes) + num(v.comments)) / v.views : 0;
    }));
    var gaps = [];
    for (var i = 0; i < byDate.length - 1; i++) gaps.push((byDate[i].date - byDate[i + 1].date) / 86400000);
    var midGap = median(gaps) || 7;

    var rated = byDate.map(function (v, i) {
      var eng = num(v.views) > 0 ? (num(v.likes) + num(v.comments)) / v.views : 0;
      var gap = i < byDate.length - 1 ? (v.date - byDate[i + 1].date) / 86400000 : midGap;
      var parts = {
        reach: ratioScore(num(v.views), midViews),
        engagement: ratioScore(eng, midEng),
        title: titleScore(v.title),
        /* Posting sooner than your usual scores well; a long silence does
           not. Normalised against your own cadence, not a rule about how
           often anybody should post. */
        timing: clamp(Math.round(100 - (gap / Math.max(1, midGap) - 1) * 40), 0, 100)
      };
      var overall = parts.reach * 0.35 + parts.engagement * 0.30 + parts.title * 0.25 + parts.timing * 0.10;
      var worst = Object.keys(parts).sort(function (a, b) { return parts[a] - parts[b]; })[0];
      /* The lowest of four is not the same as a problem. The best video in
         the test set scored 74 on its title — its weakest part — and was
         being told "the title is doing no work", which is both wrong and the
         fastest way to teach somebody to ignore this panel. Below 60 is
         where a part is actually holding the video back; above it, say so
         instead of inventing a complaint. */
      var weak = parts[worst] < 60;
      return {
        v: v,
        parts: parts,
        score: outOfTen(overall),
        weakest: weak ? worst : null,
        tip: weak ? postedTip(worst, gap, midGap)
                  : 'Nothing here is holding it back — this one worked. Look at what you did and do it again.'
      };
    });

    /* Best first — the whole point of a rank. Ties break on the newer video,
       so a repeat of something that worked reads as the current one. */
    rated.sort(function (a, b) { return b.score - a.score || b.v.date - a.v.date; });
    rated.forEach(function (r, i) { r.rank = i + 1; });
    return rated;
  }

  function postedTip(worst, gap, midGap) {
    if (worst === 'reach')
      return 'Fewest views of your recent run. Look at what the thumbnail promises — if nobody clicked, the video never got a chance to be good.';
    if (worst === 'engagement')
      return 'People watched and did not react. Ask one direct question in the first twenty seconds and pin it as a comment.';
    if (worst === 'title')
      return 'The title is doing no work. Thirty to seventy characters with a number or a question in it — "3 things" beats "my new video".';
    return 'This came ' + Math.round(gap) + ' days after the one before, against your usual ' +
           Math.round(midGap) + '. The gap costs more reach than the video did.';
  }

  /* ==========================================================================
     ABOUT TO BE POSTED
     ==========================================================================
     No views, no likes, nothing to compare against — so this scores the only
     things that are knowable in advance, and says so. It is not a prediction
     of how the video will do. It is whether it is going out set up properly.

     `history` is the channel's posted videos when Studio has them, which
     turns Timing from a guess into a comparison against your own cadence. It
     is optional; without it that part is left out rather than invented.
     ========================================================================== */
  function draft(d, history) {
    d = d || {};
    var parts = { title: titleScore(d.title) };

    /* Length. The sweet spot depends on shape: a vertical clip lives or dies
       in under a minute, a landscape upload has room. Both are wide bands,
       because "the right length" is mostly a myth and only the extremes
       actually cost you. */
    var secs = num(d.duration, 0);
    if (secs > 0) {
      var vertical = d.vertical === true || (num(d.width) > 0 && num(d.height) > num(d.width));
      var lo = vertical ? 7 : 60, hi = vertical ? 60 : 900;
      if (secs >= lo && secs <= hi) parts.length = 85;
      else if (secs < lo) parts.length = clamp(Math.round(30 + (secs / lo) * 45), 0, 100);
      else parts.length = clamp(Math.round(85 - (secs / hi - 1) * 35), 25, 85);
    }

    if (typeof d.hasThumbnail === 'boolean') parts.thumbnail = d.hasThumbnail ? 90 : 25;

    /* A description and some tags are the cheapest thing on this list and the
       one most often skipped. */
    var desc = String(d.description || '').trim();
    var tags = Array.isArray(d.tags) ? d.tags.length : num(d.tags, 0);
    if (d.description !== undefined || d.tags !== undefined) {
      var setup = 30;
      if (desc.length >= 40) setup += 35;
      else if (desc.length > 0) setup += 15;
      if (tags >= 3) setup += 25;
      else if (tags > 0) setup += 12;
      parts.setup = clamp(setup, 0, 100);
    }

    if (history && history.length >= 2) {
      var byDate = history.slice().sort(function (a, b) { return b.date - a.date; });
      var gaps = [];
      for (var i = 0; i < byDate.length - 1; i++) gaps.push((byDate[i].date - byDate[i + 1].date) / 86400000);
      var midGap = median(gaps) || 7;
      var since = (Date.now() - byDate[0].date) / 86400000;
      parts.timing = clamp(Math.round(100 - Math.abs(since / Math.max(1, midGap) - 1) * 40), 0, 100);
    }

    /* Weighted by how much each actually moves the needle, then renormalised
       over whatever was available — a draft with no thumbnail info is scored
       out of what it does have rather than penalised for what was not asked. */
    var W = { title: 0.40, length: 0.20, thumbnail: 0.25, setup: 0.10, timing: 0.05 };
    var sum = 0, weight = 0;
    Object.keys(parts).forEach(function (k) { sum += parts[k] * (W[k] || 0.1); weight += (W[k] || 0.1); });
    var overall = weight ? sum / weight : 50;
    var worst = Object.keys(parts).sort(function (a, b) { return parts[a] - parts[b]; })[0];
    var weak = parts[worst] < 60;    /* same threshold, same reason, as above */

    return {
      parts: parts,
      score: outOfTen(overall),
      weakest: weak ? worst : null,
      tip: weak ? draftTip(worst, parts, secs, d)
                : 'Nothing obvious to fix — this is set up about as well as it can be before it goes out.',
      predicted: false
    };
  }

  function draftTip(worst, parts, secs, d) {
    if (worst === 'title')
      return 'The title is the whole of the first impression. Thirty to seventy characters, with a number or a question in it.';
    /* Worded for what the caller actually passes: publish.html always has a
       frame on the canvas, so `false` here means nobody has chosen one —
       which is a different sentence from "there is no image". */
    if (worst === 'thumbnail')
      return 'The thumbnail is still whatever frame happened to be a quarter of the way in. Pick the moment and put three or four words on it — it is the only thing most people will ever see of this video.';
    if (worst === 'length') {
      /* Which side of the band it fell off, not which shape it is. Branching
         on shape alone told a three-second vertical clip it was "long for a
         vertical clip", which is the opposite of true and the opposite of
         useful. Same bands as the score above, so the words and the number
         cannot disagree. */
      var vertical = d.vertical === true || (num(d.width) > 0 && num(d.height) > num(d.width));
      var lo = vertical ? 7 : 60, hi = vertical ? 60 : 900;
      var len = secs < 60 ? Math.round(secs) + 's' : Math.round(secs / 60) + ' minutes';
      if (secs < lo)
        return 'At ' + len + ' there is not enough here to hold anyone. ' +
               (vertical ? 'Even a Short needs about ten seconds to land.'
                         : 'A landscape upload this short is a Short — post it vertical instead.');
      return 'At ' + len + ' this is long for ' + (vertical ? 'a vertical clip' : 'one upload') +
             '. ' + (vertical ? 'Under a minute holds attention'
                              : 'Under fifteen minutes holds attention') +
             ', and the cut usually improves it too.';
    }
    if (worst === 'setup')
      return 'Add a couple of lines of description and three tags. It takes a minute and it is how anybody finds this later.';
    if (worst === 'timing')
      return 'This is going out well off your usual rhythm. Posting when people expect you is worth more than most edits.';
    return 'Nothing obvious to fix — this is set up about as well as it can be before it goes out.';
  }

  /* ==========================================================================
     THE LIST
     ==========================================================================
     One renderer, so the ranked channel list and the single draft card cannot
     drift apart. Styling is injected once and scoped to .ncrk.
     ========================================================================== */
  function boot() {
    if (document.getElementById('ncrk-css')) return;
    var st = document.createElement('style');
    st.id = 'ncrk-css';
    st.textContent = [
      '.ncrk{display:flex;flex-direction:column;gap:10px}',
      '.ncrk-row{display:flex;gap:13px;align-items:flex-start;padding:13px;border-radius:14px;',
        'background:var(--nc-bg2,rgba(255,255,255,.04));border:1px solid var(--nc-line,rgba(255,255,255,.09))}',
      '.ncrk-pos{flex:0 0 26px;text-align:center;font:800 13px/1.1 inherit;color:var(--nc-dim,#8c96ad);padding-top:8px}',
      '.ncrk-score{flex:0 0 62px;text-align:center;border-radius:12px;padding:8px 4px;',
        'background:var(--nc-bg3,rgba(255,255,255,.05));border:1px solid var(--nc-line2,rgba(255,255,255,.12))}',
      '.ncrk-score b{display:block;font:800 1.32rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:-.02em}',
      '.ncrk-score i{display:block;font-style:normal;font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;',
        'color:var(--nc-dim,#8c96ad);margin-top:3px}',
      '.ncrk-s9 b{color:#34d399}.ncrk-s7 b{color:#7DFF00}.ncrk-s5 b{color:#fbbf24}.ncrk-s3 b{color:#fb7185}',
      '.ncrk-main{flex:1 1 auto;min-width:0}',
      '.ncrk-title{font-weight:700;font-size:.95rem;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.ncrk-meta{font-size:11.5px;color:var(--nc-dim,#8c96ad);margin:3px 0 9px}',
      '.ncrk-parts{display:flex;flex-direction:column;gap:5px;margin-bottom:9px}',
      '.ncrk-part{display:flex;align-items:center;gap:9px;font-size:11.5px}',
      '.ncrk-part span{flex:0 0 82px;color:var(--nc-dim,#8c96ad)}',
      '.ncrk-part .t{flex:1 1 auto;height:6px;border-radius:4px;overflow:hidden;',
        'background:var(--nc-bg3,rgba(255,255,255,.07))}',
      '.ncrk-part .t i{display:block;height:100%;border-radius:4px;background:var(--nc-cyan,#00F0FF)}',
      '.ncrk-part .t.low i{background:#fb7185}.ncrk-part .t.mid i{background:#fbbf24}',
      '.ncrk-part b{flex:0 0 26px;text-align:right;font:700 11px/1 ui-monospace,monospace;color:var(--nc-dim,#8c96ad)}',
      '.ncrk-tip{font-size:12px;line-height:1.5;color:var(--nc-dim,#8c96ad)}',
      '.ncrk-tip b{color:var(--nc-text,#EAF2FF)}',
      '@media (max-width:600px){.ncrk-row{gap:9px;padding:11px}',
        '.ncrk-pos{flex-basis:18px}.ncrk-score{flex-basis:54px}.ncrk-part span{flex-basis:66px}}'
    ].join('');
    document.head.appendChild(st);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function band(score) {
    return score >= 8.5 ? 'ncrk-s9' : score >= 7 ? 'ncrk-s7' : score >= 5 ? 'ncrk-s5' : 'ncrk-s3';
  }

  function partsHtml(parts) {
    return '<div class="ncrk-parts">' + Object.keys(parts).map(function (k) {
      var v = Math.round(parts[k]);
      var cls = v < 40 ? ' low' : (v < 65 ? ' mid' : '');
      return '<div class="ncrk-part"><span>' + esc(LABELS[k] || k) + '</span>' +
             '<span class="t' + cls + '" style="flex:1 1 auto"><i style="width:' + v + '%"></i></span>' +
             '<b>' + Math.round(v / 10) + '</b></div>';
    }).join('') + '</div>';
  }

  function rowHtml(r, opts) {
    var meta = opts && opts.meta ? opts.meta(r) : '';
    return '<div class="ncrk-row">' +
      (r.rank ? '<div class="ncrk-pos">' + r.rank + '</div>' : '') +
      '<div class="ncrk-score ' + band(r.score) + '"><b>' + r.score.toFixed(1) + '</b><i>out of 10</i></div>' +
      '<div class="ncrk-main">' +
        '<div class="ncrk-title">' + esc((r.v && r.v.title) || (opts && opts.title) || 'This video') + '</div>' +
        (meta ? '<div class="ncrk-meta">' + meta + '</div>' : '') +
        partsHtml(r.parts) +
        '<div class="ncrk-tip"><b>Do this next:</b> ' + esc(r.tip) + '</div>' +
      '</div>' +
    '</div>';
  }

  function render(el, rated, opts) {
    boot();
    if (!el) return;
    var list = Array.isArray(rated) ? rated : [rated];
    el.className = 'ncrk';
    el.innerHTML = list.map(function (r) { return rowHtml(r, opts); }).join('');
  }

  window.NC_RANK = {
    posted: posted,
    draft: draft,
    render: render,
    outOfTen: outOfTen,
    titleScore: titleScore,
    labels: LABELS
  };
})();
