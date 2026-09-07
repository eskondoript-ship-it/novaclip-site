/* ============================================================================
   THEME BRIDGE — for a page that is somebody else's app
   ============================================================================
   Most of this site is hand-written pages that read the palette out of
   nova.js. Three pages are not: the editor, the Trend Spotter and TypeMaster
   are compiled apps with their own design systems, and one of them broke the
   site's theming by accident.

   WHAT WENT WRONG

   The site records light or dark in `data-theme` on <html>, and the whole
   palette is selected by `html[data-theme="light"]`. TypeMaster has nine
   themes of its own and wrote the chosen one's NAME into the same attribute —
   `data-theme="midnight"`. Nothing in its own stylesheet reads that attribute;
   it applies its themes as inline custom properties and the attribute was only
   ever a label. But `html[data-theme="light"]` cannot match "midnight", so on
   that one page the site's light mode silently stopped existing: the rail and
   the top bar went white and the page under them stayed black.

   It is not really TypeMaster's fault. `data-theme` is an obvious name and any
   app dropped into this site would reach for it. So the fix is a shared piece
   rather than a note in one file.

   HOW IT WORKS, IN BOTH DIRECTIONS

   seedOnce()  Before the app boots, the site's light/dark preference is
               written into the app's OWN settings, once, only if the visitor
               has never used that app. So a first visit matches the site, and
               anybody who has already chosen a theme keeps it.

   fromApp()   After the app applies a theme, it tells the bridge what colour
               the page actually is. The bridge sets `data-theme` to light or
               dark from that colour's luminance, so the shared rail matches
               the page the visitor is looking at.

   The result is one rule that is easy to say: the site decides on your first
   visit, and after that the app's own theme picker decides — and the rail
   follows it either way, which is the thing that was visibly wrong.

   No storage of its own, no network, nothing to configure.
   ========================================================================== */
(function () {
  'use strict';

  /* The site's preference, resolved. 'system' has to be turned into a real
     answer here because an app's settings file cannot hold "it depends". */
  function pref() {
    var p = 'system';
    try { p = localStorage.getItem('nc_theme') || 'system'; } catch (e) {}
    if (p === 'light' || p === 'dark') return p;
    try {
      return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) {}
    return 'dark';
  }

  /* Relative luminance, the same weights the rest of the site uses. Anything
     above the midpoint is a light page. Accepts #rgb, #rrggbb and rgb(). */
  function isLight(colour) {
    var s = String(colour || '').trim(), r, g, b, m;
    if (s.charAt(0) === '#') {
      var h = s.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      if (h.length < 6) return false;
      var n = parseInt(h.slice(0, 6), 16);
      if (isNaN(n)) return false;
      r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
    } else if ((m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i))) {
      r = +m[1]; g = +m[2]; b = +m[3];
    } else {
      return false;
    }
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 128;
  }

  window.NC_THEME_BRIDGE = {
    pref: pref,
    isLight: isLight,

    /* An app has just painted the page this colour. Point the site's palette
       the same way so the shared chrome stops disagreeing with it.
       data-theme-pref is deliberately NOT touched: that is the visitor's own
       setting for the rest of the site and this is not a change to it. */
    fromApp: function (backgroundColour) {
      try {
        document.documentElement.setAttribute(
          'data-theme', isLight(backgroundColour) ? 'light' : 'dark');
      } catch (e) {}
    },

    /* Write the site's preference into an app's settings the first time that
       app is ever used here, and never again.

       key    the app's own localStorage key, holding a JSON object
       field  the property inside it that names the theme
       names  { light: '<the app's light theme>', dark: '<its dark one>' }

       Absent key only. An existing settings object means the visitor has been
       here and may have chosen; overwriting that would be the site taking a
       decision back off them. */
    seedOnce: function (key, field, names) {
      try {
        if (localStorage.getItem(key) !== null) return false;
        var want = names[pref()];
        if (!want) return false;
        var seed = {};
        seed[field] = want;
        localStorage.setItem(key, JSON.stringify(seed));
        return true;
      } catch (e) { return false; }
    }
  };
})();
