/* NOVA, drawn.
 *
 * The guide's scanning animation used to fly the assistant PILL — the grey bar
 * that says NOVA · SAY "HEY NOVA" — into the middle of the screen and sweep a
 * band across it. It worked, but what was being looked at was a piece of
 * furniture: a toolbar with a light on it. There was no character anywhere in
 * NovaClip, on a site whose whole voice is a character.
 *
 * So this is Nova as something to look at. One SVG, no images, no font, no
 * request — it draws in the site's own four colours and inherits the page's
 * palette, so it is correct in light mode and in both cyber skins without a
 * second copy.
 *
 * WHY A SEPARATE FILE
 *
 * The guide is the first thing to use her, and it will not be the last: an
 * empty timeline, a game with no high score yet, a page that is thinking. A
 * mascot living inside one feature's animation code is a mascot that gets
 * copy-pasted the second time it is wanted.
 *
 *   NC_MASCOT.el(size)   -> a <div> containing her, ready to position
 *   NC_MASCOT.scan(el,on)-> scanning face on/off
 *
 * SHE IS BUILT OUT OF FIVE THINGS
 *
 *   the halo    a soft radial glow, so she reads on any background
 *   the ring    an orbit, tilted — this is a nova, and it is the one piece
 *               that moves on its own even when she is idle
 *   the body    a rounded shape with the brand gradient across it
 *   the visor   a dark band with two eyes, which is the entire face. Two eyes
 *               and a mouth would be a toy; a visor is a machine that is
 *               friendly, which is the actual promise being made
 *   the antenna a stalk with a spark, so there is something above the circle
 *               and she does not read as a ball
 *
 * The scanning state is not a different drawing. The eyes narrow to a reading
 * squint, a beam opens below the visor, and a line sweeps down it — the same
 * character doing something, rather than a second asset.
 */
(function () {
  'use strict';
  if (window.NC_MASCOT) return;

  var CSS = [
    '.ncm{position:relative;display:block;line-height:0;',
      '--ncm-core:var(--nc-cyan,#00F0FF);--ncm-mid:var(--nc-violet,#7C5CFF);',
      '--ncm-edge:var(--nc-pink,#FF2E97);--ncm-hot:#F2FBFF}',
    '.ncm svg{display:block;width:100%;height:100%;overflow:visible}',

    /* Idle: she breathes. Slow enough not to pull the eye off the words. */
    '@keyframes ncm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '.ncm .ncm-all{animation:ncm-bob 3.4s ease-in-out infinite;transform-origin:50% 50%}',

    '@keyframes ncm-spin{to{transform:rotate(360deg)}}',
    '.ncm .ncm-ring{animation:ncm-spin 9s linear infinite;transform-origin:50px 52px}',

    /* A blink every few seconds is the difference between alive and asleep. */
    '@keyframes ncm-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.12)}}',
    '.ncm .ncm-eyes{animation:ncm-blink 5.2s ease-in-out infinite;transform-origin:50px 50px}',

    '@keyframes ncm-spark{0%,100%{opacity:.55;r:3}50%{opacity:1;r:4.2}}',
    '.ncm .ncm-spark{animation:ncm-spark 1.8s ease-in-out infinite}',

    /* Scanning. The beam and the sweep only exist in this state. */
    '.ncm .ncm-beam,.ncm .ncm-sweep{opacity:0;transition:opacity .18s}',
    '.ncm.scanning .ncm-beam{opacity:.5}',
    '.ncm.scanning .ncm-sweep{opacity:.95}',
    '@keyframes ncm-sweep{0%{transform:translateY(0)}100%{transform:translateY(46px)}}',
    '.ncm.scanning .ncm-sweep{animation:ncm-sweep 1.1s cubic-bezier(.5,0,.5,1) infinite alternate}',
    '@keyframes ncm-look{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}',
    '.ncm.scanning .ncm-eyes{animation:ncm-look 1.1s ease-in-out infinite;transform-origin:50px 50px}',
    '.ncm.scanning .ncm-pupil{ry:1.6}',
    '.ncm.scanning .ncm-ring{animation-duration:2.6s}',

    /* Somebody who has asked not to be moved gets a still mascot, not none. */
    '@media (prefers-reduced-motion:reduce){',
      '.ncm .ncm-all,.ncm .ncm-ring,.ncm .ncm-eyes,.ncm .ncm-spark,.ncm.scanning .ncm-sweep{animation:none!important}',
    '}'
  ].join('');

  function css() {
    if (document.getElementById('ncm-css')) return;
    var s = document.createElement('style');
    s.id = 'ncm-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Gradient ids have to be unique per instance: two mascots on one page with
     the same id means the second one silently borrows the first one's fill,
     and if the first is removed both go flat grey. */
  var seq = 0;

  function svg(uid) {
    var g = 'ncm-g' + uid, h = 'ncm-h' + uid, b = 'ncm-b' + uid, cl = 'ncm-c' + uid;
    return '' +
    '<svg viewBox="0 0 100 104" role="img" aria-label="Nova">' +
      '<defs>' +
        '<linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="var(--ncm-core)"/>' +
          '<stop offset="52%" stop-color="var(--ncm-mid)"/>' +
          '<stop offset="100%" stop-color="var(--ncm-edge)"/>' +
        '</linearGradient>' +
        '<radialGradient id="' + h + '">' +
          '<stop offset="0%" stop-color="var(--ncm-mid)" stop-opacity=".55"/>' +
          '<stop offset="100%" stop-color="var(--ncm-mid)" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<linearGradient id="' + b + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="var(--ncm-core)" stop-opacity="1"/>' +
          '<stop offset="100%" stop-color="var(--ncm-core)" stop-opacity="0"/>' +
        '</linearGradient>' +
        /* The beam is clipped to a cone so it reads as light leaving the visor
           rather than a rectangle sitting under her chin. */
        '<clipPath id="' + cl + '"><path d="M38 62 L62 62 L78 104 L22 104 Z"/></clipPath>' +
      '</defs>' +

      '<g class="ncm-all">' +
        '<circle cx="50" cy="52" r="46" fill="url(#' + h + ')"/>' +

        '<g class="ncm-ring">' +
          '<ellipse cx="50" cy="52" rx="43" ry="15" fill="none" ' +
            'stroke="url(#' + g + ')" stroke-width="2.4" opacity=".75" ' +
            'transform="rotate(-18 50 52)"/>' +
          '<circle cx="93" cy="52" r="2.8" fill="var(--ncm-core)" ' +
            'transform="rotate(-18 50 52)"/>' +
        '</g>' +

        /* antenna */
        '<path d="M50 18 L50 8" stroke="url(#' + g + ')" stroke-width="3" stroke-linecap="round"/>' +
        '<circle class="ncm-spark" cx="50" cy="6" r="3.4" fill="var(--ncm-hot)"/>' +

        /* body */
        '<circle cx="50" cy="52" r="32" fill="url(#' + g + ')"/>' +
        '<circle cx="50" cy="52" r="32" fill="none" stroke="var(--ncm-hot)" ' +
          'stroke-width="1.2" opacity=".35"/>' +
        /* a highlight, so she is a sphere rather than a disc */
        '<ellipse cx="39" cy="38" rx="12" ry="8" fill="var(--ncm-hot)" opacity=".22" ' +
          'transform="rotate(-28 39 38)"/>' +

        /* visor and eyes */
        '<rect x="26" y="42" width="48" height="20" rx="10" fill="#0A0D18" opacity=".92"/>' +
        '<g class="ncm-eyes">' +
          '<ellipse class="ncm-pupil" cx="41" cy="52" rx="4.6" ry="4.6" fill="var(--ncm-core)"/>' +
          '<ellipse class="ncm-pupil" cx="59" cy="52" rx="4.6" ry="4.6" fill="var(--ncm-core)"/>' +
        '</g>' +

        /* the scan, which only shows in .scanning */
        '<g clip-path="url(#' + cl + ')">' +
          '<rect class="ncm-beam" x="20" y="62" width="60" height="42" fill="url(#' + b + ')"/>' +
          '<rect class="ncm-sweep" x="20" y="62" width="60" height="3.2" fill="var(--ncm-hot)"/>' +
        '</g>' +

        /* hands, floating clear of the body */
        '<circle cx="12" cy="64" r="5.5" fill="url(#' + g + ')" opacity=".9"/>' +
        '<circle cx="88" cy="64" r="5.5" fill="url(#' + g + ')" opacity=".9"/>' +
      '</g>' +
    '</svg>';
  }

  window.NC_MASCOT = {
    /* size is the width in px; the drawing is 100x104 so height follows. */
    el: function (size) {
      css();
      var d = document.createElement('div');
      d.className = 'ncm';
      d.style.width = (size || 120) + 'px';
      d.style.height = ((size || 120) * 1.04) + 'px';
      d.innerHTML = svg(++seq);
      return d;
    },
    scan: function (node, on) {
      if (!node) return;
      node.classList[on ? 'add' : 'remove']('scanning');
    },
    markup: function () { css(); return svg(++seq); }
  };
})();
