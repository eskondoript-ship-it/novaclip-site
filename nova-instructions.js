/* HOW NOVACLIP WORKS — ONE TOUR, FOR THE WHOLE SITE.
 * =================================================
 * Four screens, once, on somebody's first visit. Not a walkthrough per page.
 *
 * IT USED TO BE FIVE SEPARATE ONES, AND THAT WAS WRONG
 *
 * There was a walkthrough each for the Editor, the AI Editor, Studio, the
 * photo editor and the tools shelf — five steps apiece, twenty-two steps in
 * total, each one describing the controls on one screen. Somebody moving
 * around the site met a new modal every time they arrived somewhere, which is
 * not orientation, it is an obstacle course. And none of it answered the only
 * question a newcomer actually has, which is what this site is for.
 *
 * So: four screens, about the site, and then never again. What each button
 * does is a job for the page it is on — nova-guide.js has the written
 * per-page detail behind the "?" — not for a dialog over the top of it.
 *
 * THE PART THAT WAS ASKED FOR, AND WHY IT IS FAIR
 *
 * "Next" does nothing for the first two seconds of every screen. Press it
 * inside that window and the tour says so and starts again from the top — and
 * it keeps doing that until the screens are actually read.
 *
 * Worth being honest about that rule: it cannot tell whether anybody READ
 * anything, and nothing can. All it measures is whether the screen was up long
 * enough that reading was possible. Two seconds is short enough that a fast
 * reader is never punished for being fast, and long enough that mashing Next
 * four times in a second cannot get through. There are four screens now rather
 * than five sets of five, so the whole thing is eight seconds at the floor.
 *
 * THREE THINGS KEEP IT FROM BECOMING A CAGE
 *
 *   - Escape closes it. Always, on any screen.
 *   - It opens ONCE, ever, for the whole site.
 *   - The countdown is visible. The button says "Next in 2…", then "Next", and
 *     stays pressable throughout — a control that cannot be pressed can never
 *     explain why it cannot be pressed.
 */
(function () {
  'use strict';
  if (window.NC_HOWTO) return;

  /* Not inside a frame. The Editor and the AI Editor are embedded in Studio,
     and a tour of the site drawn inside the tool it is describing is a tour of
     the wrong thing. The host page has already shown it. */
  if (window.NC_EMBED || location.search.indexOf('embed=1') !== -1) return;

  var GATE = 2000;                /* how long a screen must be up before Next works */
  var SEEN = 'nc_tour_done';      /* localStorage flag. Not the old per-page list. */

  /* ---------------------------------------------------------------------
     THE TOUR
     Four screens. One idea each, and short enough to read in the two seconds
     the gate asks for — a screen that cannot be read inside its own gate is
     the gate being unfair. */
  var STEPS = [
    ['Everything is in Studio',
     'Ideas, scripts, thumbnails and both editors. One page, start to finish.'],
    ['Nothing is uploaded',
     'Your video stays in this browser. It all works with the wifi off.'],
    ['Ten thousand small tools',
     'NovaTools does the one-job things. No account, nothing saved.'],
    ['It follows what you make',
     'Your category changes the site. Swap it any time in Categories.']
  ];

  function done() {
    try { return localStorage.getItem(SEEN) === '1'; } catch (e) { return false; }
  }
  function markDone() {
    try { localStorage.setItem(SEEN, '1'); } catch (e) {}
  }

  /* --------------------------------------------------------------------- */
  var el = null, at = 0, shownAt = 0, tick = 0, restarts = 0;

  function css() {
    if (document.getElementById('ncw-css')) return;
    var s = document.createElement('style');
    s.id = 'ncw-css';
    /* THE TYPE IS BIG ON PURPOSE.
       This was 14px body copy in a 520px card, which is document sizing — and
       this is not a document, it is four sentences somebody is being asked to
       stop and read. At that size the eye skims, and skimming is exactly what
       the two-second gate below is trying to prevent. Asking for attention in
       small print is asking twice. */
    s.textContent = [
      '.ncw-back{position:fixed;inset:0;z-index:99995;background:rgba(4,6,14,.74);',
        'backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:18px}',
      '.ncw{width:min(600px,100%);border-radius:26px;padding:34px 34px 28px;',
        'background:var(--nc-bg2,#0C1220);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(124,92,255,.4));',
        'box-shadow:0 40px 120px rgba(0,0,0,.7);font:17px/1.6 "Segoe UI",system-ui,sans-serif}',

      /* EVERY CLASS IN HERE IS PREFIXED, AND THIS RESET IS WHY.
         The skip button was called .skip, which is what a skip-to-content link
         is called on half the web — including this site, where the rule is
         `position:absolute;left:0;top:-100px`, the standard trick for hiding
         one until it is focused. So "I know my way around" was rendering at
         x=0, y=-103: off the top of the screen, in both themes, on every page.
         It read as a contrast bug in the screenshot and was a collision.

         Prefixes stop the next one. The reset stops the ones a prefix cannot:
         a page with a bare `button { position:absolute }` or `width:100%` — and
         report.html has exactly that width rule — can still reach in here,
         because a bare element selector matches anything. Margin is left alone;
         the skip button needs its own. */
      '.ncw button{position:static;float:none;width:auto;min-width:0;max-width:none;',
        'transform:none;box-sizing:border-box}',

      '.ncw .ncw-of{font-size:.82rem;letter-spacing:.15em;text-transform:uppercase;font-weight:800;',
        'color:var(--nc-cyan,#7FB4FF)}',
      '.ncw h2{margin:12px 0 12px;font-size:2rem;line-height:1.18;letter-spacing:-.02em}',
      '.ncw p{margin:0 0 24px;color:var(--nc-dim,#9FB0D4);font-size:1.22rem;line-height:1.5}',
      '.ncw p b{color:var(--nc-text,#EAF2FF)}',
      '.ncw .ncw-dots{display:flex;gap:7px;margin-bottom:22px}',
      '.ncw .ncw-dots i{height:5px;flex:1;border-radius:3px;background:var(--nc-line,rgba(255,255,255,.16))}',
      '.ncw .ncw-dots i.on{background:var(--nc-cyan,#7FB4FF)}',
      '.ncw .ncw-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
      '.ncw button{padding:14px 26px;border-radius:14px;cursor:pointer;font:inherit;',
        'font-size:1.05rem;font-weight:700;',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.16));background:none;color:inherit}',
      '.ncw button.ncw-go{border:0;color:#04121a;',
        'background:linear-gradient(110deg,var(--nc-violet,#7C5CFF),var(--nc-cyan,#00E5FF))}',
      /* Dimmed while the countdown runs, but not so far that it reads as
         disabled — it is still the button, and it is still pressable. */
      '.ncw button.ncw-go.waiting{filter:saturate(.55) brightness(.92)}',
      '.ncw button.ncw-skip{margin-left:auto;border:0;font-weight:400;font-size:.98rem;',
        'color:var(--nc-dim,#8296BE);text-decoration:underline;padding:8px 0}',
      '.ncw .ncw-told{margin:0 0 18px;padding:14px 16px;border-radius:14px;font-size:1.05rem;',
        'line-height:1.45;background:rgba(255,90,120,.12);',
        'border:1px solid rgba(255,90,120,.4);color:var(--nc-text,#EAF2FF)}',
      /* On a phone the card is the screen, so the headline comes down enough
         to keep four words on one line and the copy stays well above the
         14px it started at. */
      '@media (max-width:480px){.ncw{padding:26px 22px 22px;font-size:16px}',
        '.ncw h2{font-size:1.6rem}.ncw p{font-size:1.1rem}',
        '.ncw button{padding:13px 20px;font-size:1rem}',
        /* Two controls plus 10px of gap will not fit 354px, so the skip drops
           to its own line rather than pushing itself off the card. */
        '.ncw button.ncw-skip{margin-left:0}}',
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
    var step = STEPS[at];
    var last = at === STEPS.length - 1;

    el.innerHTML =
      '<div class="ncw" role="dialog" aria-modal="true" aria-label="How NovaClip works">' +
        (told ? '<p class="ncw-told">' + told + '</p>' : '') +
        '<span class="ncw-of">NovaClip &middot; ' + (at + 1) + ' of ' + STEPS.length + '</span>' +
        '<h2>' + step[0] + '</h2>' +
        '<p>' + step[1] + '</p>' +
        '<div class="ncw-dots">' +
          STEPS.map(function (_, i) { return '<i class="' + (i <= at ? 'on' : '') + '"></i>'; }).join('') +
        '</div>' +
        '<div class="ncw-row">' +
          '<button type="button" class="ncw-go" id="ncwNext">' + (last ? 'Start' : 'Next') + '</button>' +
          '<button type="button" class="ncw-skip" id="ncwSkip">I know my way around</button>' +
        '</div>' +
      '</div>';

    shownAt = Date.now();
    var btn = document.getElementById('ncwNext');
    var label = last ? 'Start' : 'Next';

    /* The countdown. The button stays PRESSABLE the whole time — pressing it
       early is how the rule gets explained, and a greyed-out control explains
       nothing, it just looks broken. */
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
      if (last) { markDone(); close(); return; }
      at++;
      render('');
    };
    document.getElementById('ncwSkip').onclick = function () { markDone(); close(); };
  }

  function open(force) {
    if (el) return false;
    if (!force && done()) return false;
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
    if (e.key === 'Escape' && el) { markDone(); close(); }
  });

  window.NC_HOWTO = { open: open, close: close, has: function () { return true; } };

  /* First visit to the site, once the other gates are out of the way. The
     delay is not decoration: the age gate, the sign-up sheet and the category
     dialog all take the screen before this, and stacking a fourth thing on top
     of them is nobody's first visit. */
  function boot() {
    if (done()) return;
    setTimeout(function () {
      if (document.getElementById('ncAgeGate') || document.getElementById('ncSignup') ||
          document.getElementById('ncCatGate')) return;      /* not on top of those */
      open(false);
    }, 1400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
