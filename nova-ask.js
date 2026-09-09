/* NOVA ASK — one question, once, and it takes you where you said.
 * ===============================================================
 * This replaces two things that were both removed: the n8n chat widget that
 * floated on every page, and the Nova voice pill pinned to the top of every
 * page. Between them a reader arrived at NovaClip and was offered two
 * assistants they had not asked for, neither of which knew where anything was.
 *
 * WHAT THIS DOES INSTEAD
 *
 * Three seconds after somebody arrives, once per visit, a card appears in the
 * top right and asks what they want to do today. They TYPE it. It reads the
 * answer and goes there.
 *
 * AND THERE IS A BUTTON FOR IT
 *
 * "Ask Nova", at the right-hand end of the top bar, built by nova.js and
 * calling open() here. The three-second card is one moment, and somebody who
 * was reading something else when it arrived had no way back to it — which
 * made the one assistant on the site available only by luck. The button is
 * the way back, on every page, at any time.
 *
 * ONCE PER VISIT MEANS ONCE PER ARRIVAL, NOT ONCE PER PAGE
 *
 * sessionStorage is exactly that lifetime: a new tab, or coming back after
 * closing the site, asks again; walking from Home to the Editor does not. A
 * card that reopened on every navigation would be the n8n widget with extra
 * steps, and the button covers every case in between.
 *
 * WHY TYPED AND NOT SPOKEN
 *
 * Asked for directly, and right: a microphone permission prompt three seconds
 * into a first visit is the fastest way to make somebody leave, half this
 * audience is using a shared or school machine where speaking to it is not an
 * option, and a typed box works with no permission, in silence, on a bus.
 *
 * HOW IT DECIDES WHERE TO GO
 *
 * Local first. "i wanna edit" is matched against a table of destinations in
 * this file — no network, no key, no wait, and the same answer every time.
 * Only if nothing matches does it ask the AI to choose from the SAME list, and
 * the AI is given the list rather than being asked to invent a URL, because a
 * model inventing a page name sends somebody to a 404.
 *
 * AND IF IT CANNOT, IT SAYS SO
 *
 * The one rule that matters. If nothing matches and the AI is unreachable or
 * unsure, it says it does not know how to do that and leaves the person where
 * they are. It never guesses a page to look useful, and it never silently does
 * nothing.
 */
(function () {
  'use strict';
  if (window.NC_ASK) return;
  if (location.search.indexOf('embed=1') !== -1) return;   /* iframes: the host asks */

  /* Once per visit, not once per page: navigating inside the site is not
     arriving at it. sessionStorage is exactly the right lifetime. */
  var SEEN = 'nc_ask_seen';
  var DELAY = 3000;

  /* Pages a first-time visitor should not be interrupted on: the parent's own
     pages, the policies, and the ones that are already a conversation. */
  var SKIP = /(^|\/)(parent|shield|report|privacy|terms|offline|pay-return)\.html$/i;

  /* ---------------------------------------------------------------------
     WHERE IT CAN TAKE YOU
     Every destination is a real page in this repo. `when` is matched against
     what was typed, lowercased. Order matters: the first match wins, so the
     specific patterns come before the general ones. */
  var GO = [
    /* Before the plain Editor, not after it. First match wins, and "edit" on
       its own belongs to the Editor — so "ai edit this" was opening the manual
       timeline, which is the one thing the person had just said they did not
       want to do. Nothing here matches a bare "edit". */
    { id: 'aiedit',   page: 'publish.html',   say: 'Opening the AI Editor — it plans the edit and applies it.',
      when: /\b(ai edit|plan (my |the )?edit|edit for me|do it for me|auto edit|publish|post( it)?|upload|tiktok|youtube|shorts|reels|thumbnail|title|tags|description)\b/ },
    { id: 'editor',   page: 'editor.html',    say: 'Opening the Editor.',
      when: /\b(edit|editor|cut|trim|timeline|video edit|make a video|montage)\b/ },
    { id: 'photo',    page: 'photo.html',     say: 'Opening the Photo editor.',
      when: /\b(photo|image|picture|crop|filter a photo)\b/ },
    { id: 'trends',   page: 'trends.html',    say: 'Opening Trend Spotter.',
      when: /\b(trend|trending|what.s hot|research|niche|ideas?)\b/ },
    { id: 'hype',     page: 'hype.html',      say: 'Opening Hype Lab.',
      when: /\b(hype|boring bit|attention|retention|flat seconds)\b/ },
    { id: 'studio',   page: 'analytics.html', say: 'Opening Studio.',
      when: /\b(studio|analytics|stats|how did.*do|views|score my)\b/ },
    { id: 'games',    page: 'game.html',      say: 'Opening Games.',
      when: /\b(game|games|play|bored|fun|reaction|typing|flap|target|aim)\b/ },
    { id: 'socials',  page: 'socials.html',   say: 'Opening Socials.',
      when: /\b(social|socials|friends|community|feed|club|teenverse)\b/ },
    { id: 'history',  page: 'history.html',   say: 'Opening your History.',
      when: /\b(history|what did i ask|my questions|past chats)\b/ },
    { id: 'category', page: 'categories.html',say: 'Opening Categories.',
      when: /\b(categor|change my category|what i make|my niche)\b/ },
    { id: 'pricing',  page: 'pricing.html',   say: 'Opening Pricing.',
      when: /\b(pric|cost|pay|plan|subscri|certificate|upgrade|pro\b)\b/ },
    { id: 'profile',  page: 'profile.html',   say: 'Opening your Profile.',
      when: /\b(profile|account|my name|avatar|sign in|log in)\b/ },
    { id: 'family',   page: 'parent.html',    say: 'Opening the Family Dashboard.',
      when: /\b(parents?|parental|family|shield|block(ing)?|safe(ty)?|controls?|screen time)\b/ },
    /* Last but one, because it is the broadest rule here and first-match wins.
       Higher up, its bare "ask" swallowed "what did i ask before" — a question
       about your own history, answered by opening a tutor instead. "ask" alone
       is also the wrong signal in a box whose entire purpose is being asked
       something, so it only counts when it is the tutor being asked. */
    { id: 'ai',       page: 'ai.html',        say: 'Opening NovaClip AI.',
      when: /\b(ai|tutor|coach|homework|help me write|script|seo|ask (nova|the ai|a question))\b/ },
    { id: 'home',     page: 'index.html',     say: 'Back to the start.',
      when: /\b(home|start|beginning|main page)\b/ }
  ];

  function match(text) {
    var t = String(text || '').toLowerCase();
    for (var i = 0; i < GO.length; i++) if (GO[i].when.test(t)) return GO[i];
    return null;
  }

  /* --------------------------------------------------------------------- */
  var el = null, input = null, said = null, busy = false;

  function css() {
    if (document.getElementById('nca-css')) return;
    var s = document.createElement('style');
    s.id = 'nca-css';
    s.textContent = [
      /* Top right, under the theme bar — the spot the old assistants fought
         over, now used by the one thing that asks a question. */
      '.nca{position:fixed;right:18px;top:74px;z-index:99950;width:340px;',
        'max-width:calc(100vw - 28px);border-radius:18px;padding:16px 17px 15px;',
        /* --nc-bg2, not --nc-card2. Both themes define --nc-card2 as a 6%
           overlay — it is meant to lift a panel off the page behind it, not to
           BE a surface. This card floats over whatever the page happens to be
           showing, so at 6% the hero heading read straight through it and the
           text sat on top of the text underneath. --nc-bg2 is the one opaque
           surface token the palette has in both themes (#FFFFFF and #0C1220).
           Measured on a phone, which is where it was worst. */
        'background:var(--nc-bg2,#0C1220);color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line2,rgba(124,92,255,.45));',
        'box-shadow:0 20px 60px -18px rgba(0,0,0,.65);',
        'font:14px/1.5 "Segoe UI",system-ui,sans-serif;',
        'opacity:0;transform:translateY(-8px) scale(.98);',
        'transition:opacity .28s ease,transform .32s cubic-bezier(.2,.9,.3,1.1)}',
      '.nca.on{opacity:1;transform:none}',
      '@media (max-width:760px){.nca{right:10px;left:10px;width:auto;top:66px}}',
      '.nca-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.nca-top .ncm{flex:0 0 auto}',
      '.nca-h{font-size:14.5px;font-weight:700;line-height:1.3}',
      '.nca-h small{display:block;font-weight:400;font-size:12px;',
        'color:var(--nc-dim,#8b93a7);margin-top:2px}',
      '.nca-x{margin-left:auto;background:none;border:0;cursor:pointer;font-size:19px;',
        'line-height:1;color:var(--nc-dim,#8b93a7);padding:0 2px;flex:0 0 auto}',
      '.nca-x:hover{color:var(--nc-text,#EAF2FF)}',
      '.nca-row{display:flex;gap:8px}',
      '.nca input{flex:1;min-width:0;padding:11px 13px;border-radius:12px;font:inherit;font-size:13.5px;',
        /* A black wash is a dark-theme assumption. On the light theme it put
           near-black text on a dark grey box. --nc-card is the palette's own
           inset, and it inverts with the theme the way this needs to. */
        'background:var(--nc-card,rgba(0,0,0,.30));color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line,rgba(255,255,255,.16))}',
      '.nca input:focus{outline:none;border-color:var(--nc-cyan,#00E5FF)}',
      '.nca button.go{flex:0 0 auto;padding:11px 15px;border-radius:12px;border:0;cursor:pointer;',
        'font:inherit;font-size:13px;font-weight:700;color:#04121a;',
        'background:linear-gradient(110deg,var(--nc-violet,#7C5CFF),var(--nc-cyan,#00E5FF) 55%,var(--nc-pink,#FF2E97))}',
      '.nca button.go[disabled]{opacity:.55;cursor:default}',
      '.nca-said{margin-top:9px;font-size:12.5px;line-height:1.5;color:var(--nc-dim,#8b93a7);min-height:17px}',
      /* #FFB0C0 was picked against a dark card and vanished on a light one.
         A red that carries on both, stated once. */
      '.nca-said.no{color:#D93052}',
      '@media (prefers-color-scheme:dark){.nca-said.no{color:#FFB0C0}}',
      'html[data-theme=dark] .nca-said.no{color:#FFB0C0}',
      'html[data-theme=light] .nca-said.no{color:#D93052}',
      '.nca-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}',
      '.nca-chips button{padding:6px 11px;border-radius:99px;cursor:pointer;font:inherit;font-size:12px;',
        /* Same reason as the box above: a white wash is invisible on a white
           page, so the chips had no edge at all in the light theme. */
        'background:var(--nc-card,rgba(255,255,255,.06));color:var(--nc-text,#EAF2FF);',
        'border:1px solid var(--nc-line,rgba(255,255,255,.14))}',
      '.nca-chips button:hover{border-color:var(--nc-cyan,#00E5FF)}',
      '@media (prefers-reduced-motion:reduce){.nca{transition:opacity .2s}}'
    ].join('');
    document.head.appendChild(s);
  }

  function close() {
    if (!el) return;
    el.classList.remove('on');
    var g = el;
    setTimeout(function () { if (g && g.parentNode) g.remove(); }, 320);
    el = null;
  }

  function say(msg, bad) {
    if (!said) return;
    said.textContent = msg;
    said.className = 'nca-said' + (bad ? ' no' : '');
  }

  function go(dest) {
    say(dest.say);
    setTimeout(function () { location.href = dest.page; }, 420);
  }

  /* The AI is only reached when the local table has already failed, and it is
     asked to CHOOSE from that table rather than to answer freely — the reply is
     one id or the word "no". A model that cannot be wrong about the URL cannot
     send anybody to a page that does not exist. */
  function askAI(text) {
    if (typeof window.ncAsk !== 'function') {
      say('I do not know how to do that one, and the AI is not loaded to ask. Try the rail on the left.', true);
      return;
    }
    say('Thinking…');
    var ids = GO.map(function (g) { return g.id; }).join(', ');
    var note = (typeof window.ncCategoryNote === 'function') ? window.ncCategoryNote() : '';
    var prompt =
      'A teenager on the NovaClip site typed: "' + String(text).slice(0, 200) + '"\n' +
      (note ? note.trim() + '\n' : '') +
      'Which ONE of these pages should they be taken to?\n' + ids + '\n' +
      'Answer with the single id and nothing else. If none of them genuinely fits ' +
      'what they asked for, answer exactly: no';
    window.ncAsk(prompt, { maxTokens: 12, temperature: 0 }).then(function (r) {
      busy = false;
      var go2 = document.getElementById('ncaGo'); if (go2) go2.disabled = false;
      if (!r || r.err) {
        say('I could not reach the AI to work that one out. The rail on the left has everything.', true);
        return;
      }
      var id = String(r.text || '').toLowerCase().replace(/[^a-z]/g, '');
      var hit = null;
      for (var i = 0; i < GO.length; i++) if (GO[i].id === id) hit = GO[i];
      if (!hit) {
        say('I cannot do that one. I can open a page for you — try "edit", "trends", "games" or "pricing".', true);
        return;
      }
      go(hit);
    });
  }

  function submit() {
    if (busy || !input) return;
    var text = input.value.trim();
    if (!text) { say('Type what you want to do — "I want to edit a video", say.'); return; }
    var hit = match(text);
    if (hit) { go(hit); return; }
    busy = true;
    var b = document.getElementById('ncaGo'); if (b) b.disabled = true;
    askAI(text);
  }

  /* THE THREE SHORTCUTS, FROM WHAT THEY SAID THEY MAKE.
     They were fixed at "Edit a video / Find an idea / Play something", which
     is the right general answer and the wrong one for anybody who has
     actually told us what they do — somebody who makes cooking videos was
     being offered a gameplay shortcut on every visit. categories.js owns the
     table; this only draws it, and falls back to the same three as before
     when nothing is set or the answer was written in.

     Escaped, because a written-in category can reach these labels and any
     string a person typed is a string that can contain a bracket. */
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function chipHTML() {
    var rows = (window.NC_CATEGORY && window.NC_CATEGORY.chips)
      ? window.NC_CATEGORY.chips()
      : [['editor', 'Edit a video'], ['trends', 'Find an idea'], ['games', 'Play something']];
    var out = '';
    for (var i = 0; i < rows.length; i++) {
      /* Only ids this file can actually reach get drawn. A chip that goes
         nowhere is worse than one chip fewer. */
      for (var j = 0; j < GO.length; j++) {
        if (GO[j].id === rows[i][0]) {
          out += '<button data-go="' + esc(rows[i][0]) + '">' + esc(rows[i][1]) + '</button>';
          break;
        }
      }
    }
    return out;
  }

  function open() {
    if (el) return;
    markSeen();          /* claimed by the document that actually shows it */
    css();
    el = document.createElement('div');
    el.className = 'nca';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'What would you like to do?');
    el.innerHTML =
      '<div class="nca-top">' +
        '<div id="ncaFace"></div>' +
        '<div class="nca-h">What would you like to do today?' +
          '<small>Type it and I will take you there.</small></div>' +
        '<button class="nca-x" id="ncaX" title="Not now" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="nca-row">' +
        '<input type="text" id="ncaIn" autocomplete="off" spellcheck="false" ' +
               'placeholder="I want to edit a video…">' +
        '<button class="go" id="ncaGo">Go</button>' +
      '</div>' +
      '<div class="nca-said" id="ncaSaid"></div>' +
      '<div class="nca-chips">' + chipHTML() + '</div>';
    document.body.appendChild(el);

    /* The same Nova the guide used. She is the only piece of the old assistant
       worth keeping — a face on the question rather than a chat bubble. */
    if (window.NC_MASCOT) {
      try { document.getElementById('ncaFace').appendChild(window.NC_MASCOT.el(38)); } catch (e) {}
    }

    input = document.getElementById('ncaIn');
    said = document.getElementById('ncaSaid');
    document.getElementById('ncaX').onclick = close;
    document.getElementById('ncaGo').onclick = submit;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') close();
    });
    el.querySelectorAll('.nca-chips button').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-go');
        for (var i = 0; i < GO.length; i++) if (GO[i].id === id) return go(GO[i]);
      };
    });

    void el.offsetWidth;
    el.classList.add('on');
    /* Focused, because the whole card is one text box and asking somebody to
       click it first is a step for nothing. */
    try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
  }

  /* THE MARK GOES DOWN WHEN THE CARD OPENS, NOT WHEN THE TIMER IS SET.
     This is the whole reason a first-time visitor saw nothing at all, which is
     precisely the visitor the card exists for. On a first visit the service
     worker installs, activates, and nova.js reloads the page the moment it
     takes control — inside this three-second window, every time. Marking the
     visit "asked" up front meant the first document spent the token, the
     reload threw away the timer that would have spent it usefully, and the
     second document read the mark and stayed quiet. Every deploy did the same
     thing to returning readers, because a new worker taking over reloads too.

     Setting it in open() instead means only the document that actually puts
     the card on screen claims the visit. A reload before that simply tries
     again, and one after it is a card already seen. */
  function boot() {
    if (SKIP.test(location.pathname)) return;
    if (seen()) return;
    setTimeout(function () { if (!seen()) open(); }, DELAY);
  }

  function seen() {
    try { return !!sessionStorage.getItem(SEEN); }
    catch (e) { return false; }   /* no sessionStorage: ask, and accept a repeat */
  }
  function markSeen() {
    try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
  }

  window.NC_ASK = { open: open, close: close, match: match, GO: GO, boot: boot };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
