/* The card the Editor shows when a plan is waiting.
 *
 * Kept apart from ai-edit.js on purpose: that file is the mapping from a plan
 * to the store's actions and has no opinion about what anything looks like,
 * which is what makes it testable without a browser. This one is only the
 * panel, and it is only loaded by editor.html.
 *
 * The editor is a bundled React app, so this draws plain DOM over it rather
 * than trying to add a component to a build that does not exist here.
 */
(function () {
  'use strict';
  if (!window.NC_AI_EDIT) return;

  var plan = null, snapshot = null, el = null;

  function css() {
    if (document.getElementById('ncae-css')) return;
    var s = document.createElement('style');
    s.id = 'ncae-css';
    s.textContent = [
      '.ncae{position:fixed;right:18px;bottom:18px;width:360px;max-width:calc(100vw - 36px);',
      'max-height:min(70vh,620px);overflow:auto;z-index:99980;border-radius:16px;padding:16px 18px;',
      'background:#0F1220;color:#EAF2FF;border:1px solid rgba(124,92,255,.5);',
      'box-shadow:0 18px 60px rgba(0,0,0,.55);font:14px/1.5 "Segoe UI",system-ui,sans-serif}',
      '.ncae h4{margin:0 0 4px;font-size:15px;display:flex;align-items:center;gap:8px}',
      '.ncae p{margin:0 0 12px;color:#8b93a7;font-size:12.5px;line-height:1.55}',
      '.ncae ul{list-style:none;margin:0 0 12px;padding:0}',
      '.ncae li{padding:8px 0;border-top:1px solid rgba(255,255,255,.08);font-size:12.5px;display:flex;gap:9px}',
      '.ncae li b{color:#00F0FF;font-variant-numeric:tabular-nums;flex:none;min-width:34px}',
      '.ncae li i{display:block;font-style:normal;color:#8b93a7;margin-top:2px}',
      '.ncae .mk{flex:none;width:16px}',
      '.ncae .yes{color:#6EE7A8}.ncae .you{color:#FFB443}.ncae .nope{color:#FF6B8A}',
      '.ncae .row{display:flex;gap:8px;flex-wrap:wrap}',
      '.ncae button{flex:1;min-width:110px;padding:10px 14px;border-radius:10px;border:0;cursor:pointer;',
      'font:inherit;font-size:13px;font-weight:700;color:#04121a;',
      'background:linear-gradient(110deg,#7C5CFF,#00F0FF 55%,#FF2E97)}',
      '.ncae button.alt{background:rgba(255,255,255,.07);color:#EAF2FF;border:1px solid rgba(255,255,255,.16)}',
      '.ncae .x{margin-left:auto;background:none;border:0;color:#8b93a7;cursor:pointer;font-size:18px;',
      'flex:0;min-width:0;padding:0 4px}'
    ].join('');
    document.head.appendChild(s);
  }

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function close() { if (el) { el.remove(); el = null; } }

  function card(html) {
    css();
    close();
    el = document.createElement('div');
    el.className = 'ncae';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'AI edit plan');
    el.innerHTML = html;
    document.body.appendChild(el);
    var x = el.querySelector('.x');
    if (x) x.onclick = function () { close(); };
    return el;
  }

  function offer() {
    var n = plan.steps.length;
    var auto = plan.steps.filter(function (s) {
      return window.NC_AI_EDIT.tools.indexOf(String(s.tool || '').toLowerCase().trim()) >= 0;
    }).length;
    card(
      '<h4>An edit is waiting <button class="x" title="Dismiss">&times;</button></h4>' +
      '<p>' + esc(plan.about || 'A plan from the AI Editor page') + '</p>' +
      '<p>' + n + ' step' + (n === 1 ? '' : 's') + '. ' +
      (auto ? '<b style="color:#EAF2FF">' + auto + '</b> can be applied to your timeline now; the rest need a ' +
              'choice only you can make, and it will say which.'
            : 'All of them need a choice only you can make — it will say which, and open the right tab.') +
      '</p>' +
      '<div class="row"><button id="ncaeGo">Apply to my timeline</button>' +
      '<button class="alt" id="ncaeNo">Not now</button></div>'
    );
    document.getElementById('ncaeGo').onclick = run;
    document.getElementById('ncaeNo').onclick = function () { close(); };
  }

  function run() {
    var out = window.NC_AI_EDIT.apply(plan.steps);
    if (out.err === 'empty') {
      card('<h4>Import your clip first <button class="x">&times;</button></h4>' +
        '<p>The timeline is empty, so there is nothing to edit yet. Bring your video in, then press ' +
        'this again — the plan is kept for an hour.</p>' +
        '<div class="row"><button id="ncaeGo">Try again</button>' +
        '<button class="alt" id="ncaeNo">Close</button></div>');
      document.getElementById('ncaeGo').onclick = run;
      document.getElementById('ncaeNo').onclick = close;
      return;
    }
    if (out.err) {
      card('<h4>Could not apply it <button class="x">&times;</button></h4><p>' + esc(out.err) + '</p>');
      return;
    }
    snapshot = out.before;
    var did = out.results.filter(function (r) { return r.done; }).length;
    var yours = out.results.filter(function (r) { return r.yours; }).length;
    var failed = out.results.length - did - yours;

    card(
      '<h4>' + did + ' of ' + out.results.length + ' done <button class="x">&times;</button></h4>' +
      '<p>' + (did ? 'Applied to the timeline — press play. ' : '') +
      (yours ? yours + ' need' + (yours === 1 ? 's' : '') + ' you. ' : '') +
      (failed ? failed + ' could not be carried out. ' : '') + '</p>' +
      '<ul>' + out.results.map(function (r) {
        var mark = r.done ? '<span class="mk yes">&#10003;</span>'
          : r.yours ? '<span class="mk you">&#9998;</span>' : '<span class="mk nope">&#10007;</span>';
        return '<li>' + mark + '<b>' + esc(r.step.at || '') + '</b><span>' + esc(r.step.do || '') +
          '<i>' + esc(r.msg) + '</i></span></li>';
      }).join('') + '</ul>' +
      '<div class="row">' +
      (did ? '<button class="alt" id="ncaeUndo">Undo all of it</button>' : '') +
      '<button id="ncaeDone">Done</button></div>'
    );
    var u = document.getElementById('ncaeUndo');
    /* One button that puts the timeline back exactly as it was. The store's own
       undo would take one press per step, which is a poor answer to "I do not
       like what it did". */
    if (u) u.onclick = function () {
      if (window.NC_AI_EDIT.restore(snapshot)) {
        card('<h4>Put back <button class="x">&times;</button></h4>' +
          '<p>The timeline is exactly as it was before the plan ran.</p>' +
          '<div class="row"><button id="ncaeDone">Close</button></div>');
        document.getElementById('ncaeDone').onclick = function () { window.NC_AI_EDIT.clear(); close(); };
      }
    };
    document.getElementById('ncaeDone').onclick = function () { window.NC_AI_EDIT.clear(); close(); };
  }

  /* The store is created by the app's own bundle, so wait for it rather than
     assuming a load order. Gives up quietly after ten seconds. */
  function start() {
    plan = window.NC_AI_EDIT.pending();
    if (!plan) return;
    var tries = 0;
    var t = setInterval(function () {
      if (window.__ncStore) { clearInterval(t); offer(); return; }
      if (++tries > 40) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
