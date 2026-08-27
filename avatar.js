/* ============================================================================
   NOVACLIP — THE PROFILE AVATAR
   ============================================================================
   A colour and an emblem, picked once and shown wherever the account is.
   It came across from the uploaded Account Portal, which is the one part of
   that design that is a feature rather than a layout: it gives an account with
   no name, no photo and no email something that is recognisably yours.

   WHAT IS KEPT, AND WHERE

   Two short strings in localStorage — a palette id and an emblem character —
   and they ride along with everything else nova.js syncs, so the same profile
   looks the same on a phone. Nothing here is sent anywhere on its own, and
   there is no image: an emoji and a gradient cost nothing to store and cannot
   carry a photograph of somebody by accident.

   THE PALETTE

   The portal's warm neutral scale rather than NovaClip's cyan and magenta.
   That is deliberate — every one of these is legible with white text on it,
   which a bright cyan is not, and the point of an avatar is a letter you can
   read at 30 pixels.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_AVATAR) return;

  var COLORS = [
    ['midnight',  '#57534e', '#1c1917'],
    ['olive',     '#3f6212', '#1a2e05'],
    ['terracota', '#b45309', '#451a03'],
    ['bordeaux',  '#9f1239', '#4c0519'],
    ['azure',     '#334155', '#0f172a'],
    ['aubergine', '#6b21a8', '#2e1065'],
    ['teal',      '#0f766e', '#042f2e'],
    ['ink',       '#1f2937', '#030712']
  ];
  /* Emoji rather than an icon font, because an icon font is a download and
     these render everywhere. Kept to shapes that read at 30px and mean
     nothing in particular — an avatar should not accidentally say something
     about somebody. */
  var EMBLEMS = ['', '✦', '◆', '●', '▲', '✧', '❖', '◈', '✳'];

  var CK = 'nc_avatar_color', EK = 'nc_avatar_emblem';

  function get(k, d) {
    try { return localStorage.getItem(k) || d; } catch (e) { return d; }
  }
  function colorOf(id) {
    for (var i = 0; i < COLORS.length; i++) if (COLORS[i][0] === id) return COLORS[i];
    return COLORS[0];
  }

  /* The chosen pair, as it stands right now. Held in memory as well as
     storage so the picker can preview a choice on the create-account form
     before there is an account to save it against. */
  var current = { color: get(CK, COLORS[0][0]), emblem: get(EK, '') };

  function save() {
    try {
      localStorage.setItem(CK, current.color);
      localStorage.setItem(EK, current.emblem);
    } catch (e) {}
  }

  /* Paints one .av element: the gradient from the palette, and either the
     emblem or the initial. The initial is the fallback rather than the other
     way round — somebody who has not chosen anything still gets a letter. */
  function paint(el, initial) {
    if (!el) return;
    var c = colorOf(current.color);
    el.style.setProperty('--av1', c[1]);
    el.style.setProperty('--av2', c[2]);
    el.textContent = current.emblem || (initial || '?');
  }

  /* Builds the swatch row and the emblem row into `host`, previewing onto
     `target` and calling `onChange` after each pick. Nothing is written to
     storage here — profile.html saves on register, and on the signed-in side
     saves immediately, because those are different moments. */
  function picker(host, target, onChange, saveNow) {
    if (!host) return;
    host.innerHTML =
      '<span class="pl">Colour</span><div class="swatches"></div>' +
      '<span class="pl">Emblem</span><div class="emblems"></div>';
    var sw = host.querySelector('.swatches');
    var em = host.querySelector('.emblems');

    COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw';
      b.style.background = 'linear-gradient(150deg,' + c[1] + ',' + c[2] + ')';
      b.setAttribute('aria-label', c[0]);
      b.setAttribute('aria-pressed', String(current.color === c[0]));
      b.onclick = function () {
        current.color = c[0];
        if (saveNow !== false) save();
        refresh();
      };
      sw.appendChild(b);
    });

    EMBLEMS.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'em';
      b.textContent = e || 'A';
      b.title = e ? 'Emblem' : 'Use the first letter of your username';
      b.setAttribute('aria-pressed', String(current.emblem === e));
      b.onclick = function () {
        current.emblem = e;
        if (saveNow !== false) save();
        refresh();
      };
      em.appendChild(b);
    });

    function refresh() {
      [].forEach.call(sw.children, function (b, i) {
        b.setAttribute('aria-pressed', String(COLORS[i][0] === current.color));
      });
      [].forEach.call(em.children, function (b, i) {
        b.setAttribute('aria-pressed', String(EMBLEMS[i] === current.emblem));
      });
      if (onChange) onChange(current);
    }
    refresh();
  }

  window.NC_AVATAR = {
    paint: paint,
    picker: picker,
    save: save,
    colors: COLORS,
    emblems: EMBLEMS,
    get current() { return { color: current.color, emblem: current.emblem }; }
  };
})();
