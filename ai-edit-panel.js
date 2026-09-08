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
      /* The clip travels with the plan now, so an empty timeline usually means
         it has not been put on yet rather than that there is nothing to put.
         Fetch it and try again, once. Only if there is genuinely no clip does
         this become a question for the reader. */
      card('<h4>Bringing your clip in… <button class="x">&times;</button></h4>' +
           '<p>Putting the video on the timeline, then applying the plan.</p>');
      window.NC_AI_EDIT.getClip().then(function (file) {
        if (!file) {
          card('<h4>No clip came across <button class="x">&times;</button></h4>' +
            '<p>The timeline is empty and no video was handed over with the plan. Import your ' +
            'video here, then press this again — the plan is kept for an hour.</p>' +
            '<div class="row"><button id="ncaeGo">Try again</button>' +
            '<button class="alt" id="ncaeNo">Close</button></div>');
          document.getElementById('ncaeGo').onclick = run;
          document.getElementById('ncaeNo').onclick = close;
          return;
        }
        window.NC_AI_EDIT.importClip(file).then(function (ok) {
          if (!ok) {
            card('<h4>The clip would not load <button class="x">&times;</button></h4>' +
              '<p>The video came across but the editor could not open it. Import it by hand and ' +
              'press this again.</p><div class="row"><button id="ncaeGo">Try again</button></div>');
            document.getElementById('ncaeGo').onclick = run;
            return;
          }
          window.NC_AI_EDIT.dropClip();
          setTimeout(run, 250);
        });
      });
      return;
    }
    if (out.err) {
      card('<h4>Could not apply it <button class="x">&times;</button></h4><p>' + esc(out.err) + '</p>');
      return;
    }
    snapshot = out.before;
    /* SHOW THE RESULT. Applying an edit and leaving the playhead wherever it
       was means the reader has to go and find what changed. Rewind and play:
       the answer to "did it work" should be the video, not a list. */
    try {
      var st0 = window.__ncStore.getState();
      st0.setPlayhead(0);
      setTimeout(function () { try { window.__ncStore.getState().setPlaying(true); } catch (e) {} }, 150);
    } catch (e) {}
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
      (did ? '<button id="ncaePost">Finish and post it</button>' : '') +
      (did ? '<button class="alt" id="ncaeUndo">Undo all of it</button>' : '') +
      '<button class="alt" id="ncaeDone">Done</button></div>'
    );
    var pb = document.getElementById('ncaePost');
    if (pb) pb.onclick = postStep;
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

  /* ---- FINISH AND POST --------------------------------------------------
     What was missing at the end: the edit was applied and then the reader was
     on their own. This is the hand-off, and it is deliberately a hand-off
     rather than a claim to publish. NovaClip does not upload for anybody — the
     AI Editor page says so and means it — so what this does is the three
     things it honestly can: export the finished video, put the title,
     description and tags one press from the clipboard, and open the upload
     page of whichever platform they are posting to.

     Anything more would need the person's YouTube or TikTok account
     credentials, which is a very different product and a much worse promise. */
  var TARGETS = [
    { name: 'YouTube',   url: 'https://www.youtube.com/upload',
      note: 'Shorts and normal videos both go through here.' },
    { name: 'TikTok',    url: 'https://www.tiktok.com/upload',
      note: 'Desktop upload; the caption is the title plus tags.' },
    { name: 'Instagram', url: 'https://www.instagram.com/',
      note: 'Reels are posted from the + button.' }
  ];

  function copyBtn(id, text) {
    var b = document.getElementById(id);
    if (!b) return;
    b.onclick = function () {
      var done = function () {
        var was = b.textContent; b.textContent = 'Copied';
        setTimeout(function () { b.textContent = was; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    };
  }

  function postStep() {
    var m = (plan && plan.meta) || {};
    var tags = (m.tags || []).join(', ');
    var caption = [m.title || '', tags ? tags.split(', ').map(function (t) { return '#' + t.replace(/\s+/g, ''); }).join(' ') : '']
      .filter(Boolean).join('\n\n');

    card(
      '<h4>Ready to post <button class="x">&times;</button></h4>' +
      '<p>The edit is on the timeline. Export it, then open wherever it is going — the words are ' +
      'a press away. <b style="color:#EAF2FF">NovaClip does not upload for you</b>, and it is not ' +
      'going to start by asking for your account.</p>' +
      '<div class="row"><button id="ncaeExport">Export the video</button></div>' +
      (m.title ? '<ul>' +
        '<li><span><i>TITLE</i>' + esc(m.title) + '</span></li>' +
        (m.description ? '<li><span><i>DESCRIPTION</i>' + esc(String(m.description).slice(0, 180)) +
          (String(m.description).length > 180 ? '…' : '') + '</span></li>' : '') +
        (tags ? '<li><span><i>TAGS</i>' + esc(tags) + '</span></li>' : '') +
      '</ul>' +
      '<div class="row">' +
        '<button class="alt" id="ncaeCopyT">Copy title</button>' +
        (m.description ? '<button class="alt" id="ncaeCopyD">Copy description</button>' : '') +
        (tags ? '<button class="alt" id="ncaeCopyC">Copy caption + tags</button>' : '') +
      '</div>'
        : '<p>No title or tags came across — write them on the AI Editor page and they will arrive here.</p>') +
      '<ul>' + TARGETS.map(function (t) {
        return '<li><span><a href="' + t.url + '" target="_blank" rel="noopener" ' +
          'style="color:#00F0FF;font-weight:700;text-decoration:none">' + t.name + ' &#8599;</a>' +
          '<i>' + t.note + '</i></span></li>';
      }).join('') + '</ul>' +
      '<div class="row"><button class="alt" id="ncaeBack">Back</button>' +
      '<button class="alt" id="ncaeDone">Done</button></div>'
    );

    copyBtn('ncaeCopyT', m.title || '');
    copyBtn('ncaeCopyD', m.description || '');
    copyBtn('ncaeCopyC', caption);

    /* The editor's own Export button, pressed for them. Driving the app's real
       control rather than reimplementing an exporter means the export settings,
       the progress UI and the file it produces are all exactly the ones the
       editor already makes. */
    var ex = document.getElementById('ncaeExport');
    if (ex) ex.onclick = function () {
      var btn = null;
      document.querySelectorAll('button').forEach(function (b) {
        if (!btn && (b.textContent || '').trim() === 'Export') btn = b;
      });
      if (btn) { close(); btn.click(); }
      else {
        ex.textContent = 'Export is in the top bar';
        ex.disabled = true;
      }
    };
    var back = document.getElementById('ncaeBack');
    if (back) back.onclick = run;
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
