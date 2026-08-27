/* ============================================================================
   NOVACLIP AUDIO MIXER — THE PANEL
   ============================================================================
   mixer.js builds the Web Audio graph and reads clip.audio. This is the eight
   controls that write it, opened from the five rows in the Audio tab that used
   to say "Soon".

   All five rows open the same sheet, scrolled to the section they name. They
   are one rack — you set a compressor against the EQ you just dialled in, not
   in a separate window — and five sheets that each hold two sliders would be
   five ways to lose your place.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__ncOpenMixer) return;

  var GROUPS = [
    ['denoise', 'Clean up', [
      ['denoise', 'Noise reduction', 0, 100, 1, '', 'Cuts rumble below the voice and hiss above it.']
    ]],
    ['eq', 'EQ', [
      ['bass',   'Bass',   -12, 12, 0.5, ' dB', ''],
      ['mid',    'Mid',    -12, 12, 0.5, ' dB', ''],
      ['treble', 'Treble', -12, 12, 0.5, ' dB', '']
    ]],
    ['reverb', 'Reverb', [
      ['reverb', 'Amount', 0, 100, 1, '', ''],
      ['room',   'Room size', 0, 100, 1, '', 'Bigger rooms ring longer and darker.']
    ]],
    ['comp', 'Compressor', [
      ['comp',   'Amount', 0, 100, 1, '', 'Evens out the loud and quiet parts.'],
      ['makeup', 'Level',  -12, 12, 0.5, ' dB', '']
    ]]
  ];
  /* The Audio tab's five rows, mapped onto the four sections above. Bass Boost
     is the EQ's bass control rather than a separate thing, because that is
     what a bass boost is. */
  var FROM_ROW = {
    'Noise Reduction': 'denoise',
    'EQ': 'eq',
    'Bass Boost': 'eq',
    'Reverb': 'reverb',
    'Compressor': 'comp'
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function store() { return window.__ncStore || null; }
  function clipById(id) {
    var s = store(); if (!s) return null;
    var list = s.getState().clips || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0] || null;
  }
  function settings(id) {
    var c = clipById(id);
    var d = window.NC_MIX ? window.NC_MIX.defaults() : {};
    var a = (c && c.audio) || {};
    var out = {};
    for (var k in d) out[k] = (typeof a[k] === 'number' && isFinite(a[k])) ? a[k] : d[k];
    return out;
  }
  function write(id, key, val) {
    var s = store(); if (!s) return;
    var c = clipById(id); if (!c) return;
    var next = settings(id);
    next[key] = val;
    s.getState().updateClip(c.id, { audio: next });
    if (window.NC_MIX) window.NC_MIX.refresh();
  }

  var veil = null;

  function boot() {
    if (document.getElementById('ncmx-css')) return;
    var st = document.createElement('style');
    st.id = 'ncmx-css';
    st.textContent = [
      '.ncmx-veil{position:fixed;inset:0;z-index:100002;background:rgba(4,6,12,.72);',
        '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:grid;place-items:center;padding:18px}',
      '.ncmx{width:min(540px,100%);max-height:min(88vh,760px);display:flex;flex-direction:column;overflow:hidden;',
        'background:var(--nc-bg2,#0f1424);color:var(--nc-text,#EAF2FF);border-radius:18px;',
        'border:1px solid var(--nc-line2,rgba(255,255,255,.14));box-shadow:0 30px 80px rgba(0,0,0,.6);',
        'font:400 14px/1.5 Inter,system-ui,sans-serif}',
      '.ncmx-head{display:flex;align-items:center;gap:10px;padding:14px 16px;',
        'border-bottom:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncmx-head h2{margin:0;font-size:1.02rem;font-weight:800;flex:1 1 auto}',
      '.ncmx-x{width:40px;height:40px;flex:0 0 auto;border-radius:11px;cursor:pointer;font-size:20px;line-height:1;',
        'background:transparent;border:1px solid var(--nc-line2,rgba(255,255,255,.14));color:inherit}',
      '.ncmx-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:6px 16px 16px}',
      '.ncmx-sec{padding:14px 0;border-bottom:1px solid var(--nc-line,rgba(255,255,255,.08))}',
      '.ncmx-sec:last-child{border-bottom:0}',
      '.ncmx-sec h3{margin:0 0 4px;font:800 11px/1 inherit;letter-spacing:.09em;text-transform:uppercase;',
        'color:var(--nc-dim,#8c96ad)}',
      '.ncmx-sec .why{margin:0 0 10px;font-size:11.5px;color:var(--nc-dim,#8c96ad)}',
      '.ncmx-row{display:flex;align-items:center;gap:10px;margin:8px 0}',
      '.ncmx-row label{flex:0 0 108px;font-size:12.5px}',
      '.ncmx-row input[type=range]{flex:1 1 auto;min-width:0;min-height:32px}',
      '.ncmx-row .v{flex:0 0 58px;text-align:right;font:600 12px/1 ui-monospace,monospace;',
        'color:var(--nc-dim,#8c96ad)}',
      '.ncmx-foot{display:flex;gap:8px;align-items:center;padding:11px 16px;',
        'border-top:1px solid var(--nc-line,rgba(255,255,255,.1))}',
      '.ncmx-foot .note{flex:1 1 auto;font-size:11.5px;color:var(--nc-dim,#8c96ad)}',
      '.ncmx-foot button{min-height:40px;padding:9px 15px;border-radius:11px;cursor:pointer;font:700 13px/1 inherit;',
        'background:var(--nc-bg3,rgba(255,255,255,.06));color:inherit;border:1px solid var(--nc-line2,rgba(255,255,255,.14))}',
      '@media (max-width:760px){.ncmx-veil{padding:0}',
        '.ncmx{width:100%;height:100%;max-height:none;border-radius:0;border:0}',
        '.ncmx-row label{flex:0 0 92px}}'
    ].join('');
    document.head.appendChild(st);
  }

  function close() {
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null;
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }

  function open(section, clipId) {
    boot();
    close();
    var clip = clipById(clipId);
    if (!clip) return;
    var id = clip.id;

    veil = el('div', 'ncmx-veil');
    veil.addEventListener('mousedown', function (e) { if (e.target === veil) close(); });
    var sheet = el('div', 'ncmx');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Audio mixer');

    var head = el('div', 'ncmx-head', '<h2>Audio</h2>');
    var x = el('button', 'ncmx-x', '&times;');
    x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.onclick = close;
    head.appendChild(x);

    var body = el('div', 'ncmx-body');
    var inputs = [];
    var target = null;

    GROUPS.forEach(function (grp) {
      var sec = el('div', 'ncmx-sec');
      sec.appendChild(el('h3', null, grp[1]));
      var why = grp[2].filter(function (c) { return c[6]; }).map(function (c) { return c[6]; })[0];
      if (why) sec.appendChild(el('p', 'why', why));
      grp[2].forEach(function (ctrl) {
        var key = ctrl[0], label = ctrl[1], lo = ctrl[2], hi = ctrl[3], step = ctrl[4], unit = ctrl[5];
        var row = el('div', 'ncmx-row');
        var lab = el('label', null, label);
        var inp = el('input');
        inp.type = 'range'; inp.min = String(lo); inp.max = String(hi); inp.step = String(step);
        var cur = settings(id)[key];
        inp.value = String(cur);
        var out = el('span', 'v', cur + unit);
        inp.addEventListener('input', function () {
          var v = Number(inp.value);
          out.textContent = v + unit;
          write(id, key, v);
        });
        inputs.push({ key: key, inp: inp, out: out, unit: unit });
        row.appendChild(lab); row.appendChild(inp); row.appendChild(out);
        sec.appendChild(row);
      });
      body.appendChild(sec);
      if (grp[0] === section) target = sec;
    });

    var foot = el('div', 'ncmx-foot');
    var note = el('span', 'note', 'Applies to the selected clip. Play it to hear the change.');
    var reset = el('button', null, 'Reset');
    var done = el('button', null, 'Done');
    done.style.cssText += 'background:var(--nc-cyan,#00F0FF);color:#04121a;border-color:transparent';
    done.onclick = close;
    reset.onclick = function () {
      var d = window.NC_MIX.defaults();
      var s = store();
      if (s) {
        s.getState().updateClip(id, { audio: d });
        if (window.NC_MIX) window.NC_MIX.refresh();
      }
      inputs.forEach(function (i) {
        i.inp.value = String(d[i.key]);
        i.out.textContent = d[i.key] + i.unit;
      });
    };
    foot.appendChild(note); foot.appendChild(reset); foot.appendChild(done);

    sheet.appendChild(head); sheet.appendChild(body); sheet.appendChild(foot);
    veil.appendChild(sheet);
    document.body.appendChild(veil);
    document.addEventListener('keydown', onKey, true);

    /* The row you clicked is the one you came for, so say which one that was.

       Scrolling alone does not do it. On a desktop all four sections fit —
       measured, the content is 643px in a 625px box, so there are eighteen
       pixels of scroll range and "scroll Compressor to the top" is not a
       thing that can happen. A highlight works whether it needed scrolling or
       not, and the scroll is still there for the phone sheet where it does.

       scrollTop from offsetTop rather than scrollIntoView, because
       scrollIntoView also scrolls every scrollable ancestor — including the
       editor panel behind the sheet. */
    if (target) requestAnimationFrame(function () {
      try { body.scrollTop = Math.max(0, target.offsetTop - body.offsetTop); } catch (e) {}
      target.style.transition = 'background .25s';
      target.style.background = 'rgba(0,240,255,.09)';
      target.style.borderRadius = '10px';
      target.style.boxShadow = '0 0 0 1px rgba(0,240,255,.3)';
      setTimeout(function () {
        target.style.background = '';
        target.style.boxShadow = '';
      }, 1400);
    });

    /* A clip with no sound in it can still be mixed, and the result is
       silence either way — say so rather than letting somebody dial in a
       reverb on a photograph and wonder. */
    if (clip.kind !== 'audio' && clip.kind !== 'video') {
      note.textContent = 'This clip has no sound, so these will not do anything to it.';
    }
  }

  window.__ncOpenMixer = function (rowOrSection, clipId) {
    open(FROM_ROW[rowOrSection] || rowOrSection || 'eq', clipId);
  };
  window.NC_MIX_UI = { open: open, rows: FROM_ROW };
})();
