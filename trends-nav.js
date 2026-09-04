/* ============================================================================
   TREND SPOTTER — SENDING THE RAIL SOMEWHERE REAL
   ============================================================================
   trends.html is a bundled React app with its own sidebar and its own hash
   router, and four of the six things in that sidebar went nowhere. Scripts,
   Thumbnails, Editor and Publish each opened a placeholder: a title, one line
   of description, and a badge reading STAGED.

   NovaClip already has all four. The Editor is editor.html and has been for
   months; Publish is publish.html, which plans the edit, writes the metadata
   and makes a 1280x720 thumbnail; the AI page has the Video director and the
   Thumbnail lab on it. So the rail was advertising features as unbuilt while
   the reader was two clicks from every one of them.

   WHY THIS IS A SEPARATE FILE

   The router, the sidebar and those placeholder screens all live inside a
   minified bundle. Editing that is a change that survives exactly until the
   next time the bundle is rebuilt, and it is unreadable while it lasts. This
   sits outside and does three things the bundle cannot argue with:

     1. Points the four dead rail items at the pages that do the job.
     2. Adds Studio, which was missing entirely — the one page in this set
        that answers "did any of this work".
     3. Catches anybody arriving on a staged route from a bookmark or a link
        and sends them to the real page instead of the placeholder.

   It re-applies on every render, because React rebuilds the rail whenever the
   route changes and would otherwise put the dead links straight back.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_TRENDS_NAV) return;

  /* Route -> the page that actually does it. Video Ideas is deliberately
     absent: that one is not a placeholder, it is a real screen inside this
     app, and sending it elsewhere would break something that works. */
  var REAL = {
    '/scripts':    { href: 'ai.html',      why: 'Write it with the Video director on the AI page' },
    '/thumbnails': { href: 'publish.html', why: 'Make one from your clip — 1280x720, the size YouTube asks for' },
    /* Editor and Publish are still redirected but no longer listed — see
       DROP below. Somebody with #/editor bookmarked should still land on the
       editor rather than on a placeholder. */
    '/editor':     { href: 'editor.html',  why: 'Cut, grade, mix and export' },
    '/publish':    { href: 'publish.html', why: 'Plan the edit, write the words, pick a time' }
  };

  /* Taken out of this rail entirely. They are in the main site sidebar under
     Create, two rows from here, and listing them again made this rail look
     like a second navigation for the whole site rather than what it is: the
     Trend Spotter's own steps. The routes above still work for anyone
     arriving on one. */
  var DROP = ['/editor', '/publish'];

  /* Added rather than redirected: neither of these exists in this rail at all.
     Studio is the page that closes the loop — the trends you scanned here turn
     into videos, and Studio is where you find out whether they worked. Hype Lab
     sits before it, because it is the step between finishing a cut and posting
     it: it measures where the finished edit loses attention and puts something
     there.

     A bar chart and a bolt, both drawn in the app's own icon idiom — 24x24, no
     fill, 2px round stroke — because everything else in this rail is drawn that
     way and one odd icon is more noticeable than a missing one. */
  var ADD = [
    { key: 'hype', label: 'Hype Lab', href: 'hype.html',
      why: 'Find the seconds where your finished edit loses people, and fill them',
      icon: 'M13 2 4 14h7l-1 8 9-12h-7z' },
    { key: 'studio', label: 'Studio', href: 'analytics.html',
      why: 'How the videos you made from these trends are doing',
      icon: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-3' }
  ];

  function railFor(href) {
    var a = document.querySelector('.nc-sidebar a[href="#' + href + '"]');
    return a || null;
  }

  /* The row is cloned from a sibling so the layout, the classes and the
     hover behaviour are the app's rather than a guess at them. Only the icon
     path and the label are replaced. */
  function addItem(nav, spec) {
    if (!nav || nav.querySelector('[data-nc-add="' + spec.key + '"]')) return;
    /* The LAST item, not the first. The first is "Back to NovaClip", whose
       icon is a back arrow — cloning that gave Studio an arrow pointing off
       the page, which is the one thing it does not do. */
    var models = nav.querySelectorAll('.nc-nav-item');
    var model = models[models.length - 1];
    if (!model) return;
    var a = model.cloneNode(true);
    a.setAttribute('data-nc-add', spec.key);
    a.className = 'nc-nav-item ';
    a.href = spec.href;
    a.title = spec.why;
    a.removeAttribute('aria-current');
    var svg = a.querySelector('svg');
    if (svg) {
      /* One path replaces however many the cloned icon had. */
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', spec.icon);
      svg.appendChild(path);
    }
    /* Replace only the label, so the icon and the layout stay the app's. */
    var label = [].slice.call(a.childNodes).filter(function (n) {
      return n.nodeType === 1 && n.tagName !== 'svg' && !n.querySelector('svg');
    }).pop();
    if (label) label.textContent = spec.label;
    else a.textContent = spec.label;
    /* Appended in ADD order, after whatever is already last. This rail is a
       pipeline — trend, idea, script, thumbnail — and these two are what
       happens after it: make the finished cut hold, then find out whether it
       worked. Putting either at the top read as a second "Back to NovaClip"
       and broke the order the rest of the list is in. */
    var items = nav.querySelectorAll('.nc-nav-item');
    var last = items[items.length - 1];
    if (last && last.parentNode) last.parentNode.insertBefore(a, last.nextSibling);
    else nav.appendChild(a);
  }

  function fix() {
    var side = document.querySelector('.nc-sidebar');
    if (!side) return;

    Object.keys(REAL).forEach(function (route) {
      var a = railFor(route);
      if (!a) return;
      if (DROP.indexOf(route) >= 0) { a.remove(); return; }
      var to = REAL[route];
      a.href = to.href;
      a.title = to.why;
      /* The app's router listens for hashchange, not for clicks, so changing
         the href is enough — there is no handler to remove. The active-state
         class goes because none of these are this app's routes any more. */
      a.classList.remove('nc-nav-item-active');
    });

    var nav = side.querySelector('nav') || side;
    ADD.forEach(function (spec) { addItem(nav, spec); });
  }

  /* Somebody with #/publish bookmarked, or following an old link, still lands
     on the placeholder. Sent on to the real page rather than shown a badge
     saying the feature does not exist yet. */
  function catchStaged() {
    var h = (location.hash || '').replace(/^#/, '');
    var to = REAL[h];
    if (to) location.replace(to.href);
  }

  function boot() {
    catchStaged();
    fix();
    /* React rebuilds the rail on every route change and would put the dead
       hrefs back. Cheap to re-apply; the guard inside addItem keeps it from
       adding a second copy of anything in ADD. */
    try {
      new MutationObserver(fix).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    window.addEventListener('hashchange', catchStaged);
  }

  window.NC_TRENDS_NAV = { fix: fix, real: REAL };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
