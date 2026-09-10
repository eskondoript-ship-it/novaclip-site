/* HOW THIS PAGE WORKS — READ IT, THEN GO.
 * ======================================
 * A short walkthrough that opens the first time somebody lands on one of the
 * big tools, and any time afterwards from the "?" in the top bar.
 *
 * THE PART THAT WAS ASKED FOR, AND WHY IT IS FAIR
 *
 * "Next" does nothing for the first two seconds of every step. Press it inside
 * that window and the walkthrough says so and starts again from step one — and
 * it keeps doing that until the steps are actually read.
 *
 * That is a deliberately blunt rule, so it is worth being honest about what it
 * is and is not. It cannot tell whether anybody READ anything; nobody can. All
 * it measures is whether the screen was up long enough that reading was
 * possible. Two seconds is short enough that a fast reader is never punished
 * for being fast, and long enough that mashing Next four times in a second
 * cannot get through.
 *
 * THREE THINGS KEEP IT FROM BECOMING A CAGE
 *
 *   - Escape closes it. Always, on any step. Somebody who has read this before,
 *     or who opened it by accident, is not a hostage.
 *   - It opens ONCE per tool, ever. After that it is the "?" button, which is
 *     a thing you press on purpose.
 *   - The countdown is visible. The button says "Next in 2…", then "Next". A
 *     disabled control with no explanation is a broken control; a control that
 *     tells you when it will work is a wait.
 *
 * WHY A COUNTDOWN AND NOT A DISABLED BUTTON
 *
 * A greyed-out Next teaches nothing — it looks broken, and the reader's
 * attention goes to the button instead of the words. A button that stays
 * pressable and answers "not yet, and here is why" puts the attention back on
 * the step, which is the only reason any of this exists.
 */
(function () {
  'use strict';
  if (window.NC_HOWTO) return;

  /* IT RUNS INSIDE THE FRAME TOO, AND IT HAS TO.
     This used to bail out on ?embed=1, on the reasoning that the host page
     explains what it is showing. That stopped being true the moment the
     Editor and the AI Editor left the site rail: nearly everybody now meets
     them inside Studio, in a frame, and the Studio walkthrough can say "the
     Editor is in this rail" but not what the scissors do. Bailing out there
     would mean the two most complicated tools on the site are the two with no
     instructions.

     The frame is the whole window for both of them, so a walkthrough drawn
     inside it looks exactly like one drawn on the page. And the "seen" list is
     keyed on the filename either way, so it still opens once per tool, not
     once per way in. */

  var GATE = 2000;               /* how long a step must be up before Next works */
  var SEEN = 'nc_howto_done';    /* localStorage: which tools have been walked */

  /* ---------------------------------------------------------------------
     THE WALKTHROUGHS
     Keyed on the filename. Each step is a heading and a line — deliberately
     one thing per step, because a step with three instructions on it is the
     thing people skip. */
  var STEPS = {
    'editor.html': {
      title: 'The Editor',
      steps: [
        ['Bring a clip in', 'Drag a video onto the timeline, or press <b>Upload</b> in the Media panel on the left. Nothing is uploaded anywhere — it stays in this browser.'],
        ['Cut it', 'Drag the ends of a clip to trim. The scissors in the top bar splits it wherever the playhead is.'],
        ['Change how it looks', 'Select a clip, then use the tabs on the right: <b>Transform</b>, <b>Color</b>, <b>Effects</b>, <b>Audio</b>, <b>Keyframes</b>.'],
        ['Add the extras', 'Text, transitions, stickers and sound are the icons down the far left.'],
        ['Get it out', 'Press <b>Export</b>. Pick a size — <b>Vertical 9:16</b> for Shorts, TikTok and Reels, <b>1080p</b> for YouTube. The clip is checked for heavy flashing first, on your machine.']
      ]
    },
    'publish.html': {
      title: 'The AI Editor',
      steps: [
        ['Drop a clip in', 'One video, from this device. It is never uploaded — the reading and the editing both happen here.'],
        ['Say what it is', 'One line about the video. That is what the plan, the title and the description are all built from.'],
        ['Let it plan', 'Press <b>Plan the edit</b>. It only ever suggests tools that exist here, and it says so plainly when something is beyond it.'],
        ['Watch it apply', 'Each step is carried out on the clip and played back. Anything you disagree with, change in the Editor afterwards.'],
        ['Post it', 'Title, description and tags are written for you. Copy them out and post to YouTube, TikTok or Shorts.']
      ]
    },
    'trends.html': {
      title: 'Studio',
      steps: [
        ['Find something to make', '<b>Trend Spotter</b> and <b>Video Ideas</b> are the research half. Ideas start from your category, so they are about your thing.'],
        ['Keep the good ones', 'Press <b>Save it</b> on an idea. Your shortlist is on this device and shows at the top of that panel next time.'],
        ['Turn it into words', '<b>Scripts</b> writes a hook, a middle and an end. Download it, or send it straight to the AI Editor.'],
        ['Make the picture', '<b>Thumbnails</b> draws a real 1280×720 PNG on this machine. No model, no upload — it works with the wifi off.'],
        ['Cut it here', '<b>Editor</b> and <b>AI Editor</b> live in this rail now — they have left the main sidebar, because this is the one door to them. Both open to the whole screen; the strip along the top brings you back.']
      ]
    },
    'photo.html': {
      title: 'The Photo editor',
      steps: [
        ['Open a picture', 'Drop one in, or use the picker. It stays on this device.'],
        ['Change it', 'Crop, colour and the effects are down the left. Everything is arithmetic on the image already in memory, so it works offline.'],
        ['Undo freely', 'Nothing is destructive until you export — go back as far as you like.'],
        ['Save it', 'Export writes a file straight to your downloads.']
      ]
    },
    'tools.html': {
      title: 'NovaTools',
      steps: [
        ['Start with your four', 'The top row is picked from your category. Change it any time from <b>Categories</b> in the rail.'],
        ['Or search', 'There are about ten thousand. The box finds them by name.'],
        ['They run here', 'Every one of them works in this tab, with no account and nothing uploaded.']
      ]
    }
  };

  function key() {
    var p = (location.pathname || '').split('/').pop() || '';
    return (!p || p === '/') ? 'index.html' : p;
  }
  function plan() { return STEPS[key()] || null; }

  function done(k) {
    try { return (JSON.parse(localStorage.getItem(SEEN) || '[]') || []).indexOf(k) !== -1; }
    catch (e) { return false; }
  }
  function markDone(k) {
    try {
      var all = JSON.parse(localStorage.getItem(SEEN) || '[]') || [];
      if (all.indexOf(k) === -1) all.push(k);
      localStorage.setItem(SEEN, JSON.stringify(all));
    } catch (e) {}
  }

  /* --------------------------------------------------------------------- */
  var el = null, at = 0, shownAt = 0, tick = 0, restarts = 0;

  function css() {
    if (document.getElementById('ncw-css')) return;
    var s = document.createElement('style');
    s.id = 'ncw-css';
    s.textContent = [
      '.ncw-back{position:fixed;inset:0;z-index:99995;background:rgba(4,6,14,.72);',
        'backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px}',
      '.ncw{width:min(520px,100%);border-radius:22px;padding:26px 26px 22px;',
        'background:var(--nc-bg2,#0C1220);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(124,92,255,.4));',
        'box-shadow:0 40px 120px rgba(0,0,0,.7);font:14px/1.65 "Segoe UI",system-ui,sans-serif}',
      '.ncw .of{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;font-weight:800;',
        'color:var(--nc-cyan,#7FB4FF)}',
      '.ncw h2{margin:8px 0 8px;font-size:1.3rem;line-height:1.25}',
      '.ncw p{margin:0 0 18px;color:var(--nc-dim,#9FB0D4);font-size:.95rem}',
      '.ncw p b{color:var(--nc-text,#EAF2FF)}',
      '.ncw .dots{display:flex;gap:6px;margin-bottom:18px}',
      '.ncw .dots i{height:4px;flex:1;border-radius:2px;background:var(--nc-line,rgba(255,255,255,.16))}',
      '.ncw .dots i.on{background:var(--nc-cyan,#7FB4FF)}',
      '.ncw .row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}',
      '.ncw button{padding:11px 20px;border-radius:12px;cursor:pointer;font:inherit;font-weight:700;',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.16));background:none;color:inherit}',
      '.ncw button.go{border:0;color:#04121a;',
        'background:linear-gradient(110deg,var(--nc-violet,#7C5CFF),var(--nc-cyan,#00E5FF))}',
      '.ncw button.go.waiting{filter:grayscale(.5) brightness(.85)}',
      '.ncw .skip{margin-left:auto;border:0;font-weight:400;font-size:.85rem;',
        'color:var(--nc-dim,#8296BE);text-decoration:underline;padding:6px 0}',
      '.ncw .told{margin:0 0 14px;padding:11px 13px;border-radius:12px;font-size:.9rem;',
        'background:rgba(255,90,120,.12);border:1px solid rgba(255,90,120,.4);',
        'color:var(--nc-text,#EAF2FF)}',
      '@media (prefers-reduced-motion:no-preference){.ncw{animation:ncwIn .26s ease}}',
      '@keyframes ncwIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  function close() {
    if (tick) { clearInterval(tick); tick = 0; }
    if (el && el.parentNode) el.remove();
    el = null;
  }

  function render(told) {
    var g = plan();
    if (!g) return;
    var step = g.steps[at];
    var last = at === g.steps.length - 1;

    el.innerHTML =
      '<div class="ncw" role="dialog" aria-modal="true" aria-label="' + g.title + ' — how it works">' +
        (told ? '<p class="told">' + told + '</p>' : '') +
        '<span class="of">' + g.title + ' &middot; step ' + (at + 1) + ' of ' + g.steps.length + '</span>' +
        '<h2>' + step[0] + '</h2>' +
        '<p>' + step[1] + '</p>' +
        '<div class="dots">' +
          g.steps.map(function (_, i) { return '<i class="' + (i <= at ? 'on' : '') + '"></i>'; }).join('') +
        '</div>' +
        '<div class="row">' +
          '<button class="go" id="ncwNext">' + (last ? 'Start using it' : 'Next') + '</button>' +
          '<button class="skip" id="ncwSkip">I have read this before</button>' +
        '</div>' +
      '</div>';

    shownAt = Date.now();
    var btn = document.getElementById('ncwNext');
    var label = last ? 'Start using it' : 'Next';

    /* The countdown. The button stays PRESSABLE the whole time — pressing it
       early is how the rule gets explained, and a control that cannot be
       pressed can never explain anything. */
    if (tick) clearInterval(tick);
    btn.classList.add('waiting');
    function paint() {
      var left = Math.ceil((GATE - (Date.now() - shownAt)) / 1000);
      if (left > 0) { btn.textContent = label + ' in ' + left + '…'; return; }
      btn.textContent = label;
      btn.classList.remove('waiting');
      clearInterval(tick); tick = 0;
    }
    paint();
    tick = setInterval(paint, 200);

    btn.onclick = function () {
      if (Date.now() - shownAt < GATE) {
        /* Too fast. Back to the beginning, and say why. */
        restarts++;
        at = 0;
        render('Sorry buddy — you have to read the instructions. Starting again.' +
               (restarts > 1 ? ' (' + restarts + ' times now.)' : ''));
        return;
      }
      if (last) { markDone(key()); close(); return; }
      at++;
      render('');
    };
    document.getElementById('ncwSkip').onclick = function () { markDone(key()); close(); };
  }

  function open(force) {
    var g = plan();
    if (!g || el) return false;
    if (!force && done(key())) return false;
    css();
    at = 0; restarts = 0;
    el = document.createElement('div');
    el.className = 'ncw-back';
    document.body.appendChild(el);
    render('');
    return true;
  }

  /* Escape always closes. Somebody who opened this by accident is not a
     hostage, and the rule above is about pace, not about trapping anybody. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el) { markDone(key()); close(); }
  });

  window.NC_HOWTO = { open: open, close: close, has: function () { return !!plan(); } };

  /* First visit to a tool, once the other gates are out of the way. The delay
     is not decoration: the age gate, the sign-up sheet and the category dialog
     all take the screen before this, and stacking a fifth thing on top of them
     is nobody's first visit. */
  function boot() {
    if (!plan() || done(key())) return;
    setTimeout(function () {
      if (document.getElementById('ncAgeGate') || document.getElementById('ncSignup') ||
          document.getElementById('ncCatGate')) return;      /* not on top of those */
      open(false);
    }, 1400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
