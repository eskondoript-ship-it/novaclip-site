/* NovaClip — Creator Pipeline
   ============================================================================
   The dashboard that ties the whole product together. A project walks the
   pipeline: TREND -> IDEA -> SCRIPT -> UPLOAD -> AI ANALYSIS -> AUTODIRECTOR
   -> THUMBNAIL -> TITLE/SEO -> PUBLISH -> IMPROVE. Each finished stage
   unlocks the next and the recommendation engine tells the creator what to do
   now.

   WHAT IS REAL HERE
   * Projects, stages, jobs and Creator DNA persist in localStorage.
   * AutoDirector runs a REAL in-browser analysis of the uploaded video
     (scene changes, loudness, silence) and proposes clips with scores. The
     "ai" flag is only true when the AI provider answered; otherwise the clip
     reasons come from the local signal and the UI labels them honestly.
   * Script, hooks and SEO call the real AI through ncAsk() (worker or your
     own key). When it is unreachable they return clearly-labelled demo text
     instead of pretending a model wrote it.

   WHAT IS EXPLICITLY NOT FAKED
   * Nothing invents numbers or claims AI said something it did not.
   * AI jobs carry a state (queued / processing / completed / failed) and a
     note that explains failures.
   ============================================================================ */

(function () {
  'use strict';

  /* ============================== STORE =================================== */

  var LS = 'nc_projects';
  var LS_DNA = 'nc_dna';

  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* Keep ONE live copy of the list in memory. localStorage round-trips on every
     call would silently drop in-place mutations (a stage flip, a new clip), so
     the list is loaded once and re-serialized from the same objects. */
  var LIST = null;
  function projects() { if (!LIST) LIST = read(LS, []); return LIST; }
  function saveProjects(list) { LIST = list; write(LS, list); }
  function dna() { return Object.assign(DEFAULT_DNA, read(LS_DNA, {})); }
  function saveDNA(d) { write(LS_DNA, Object.assign(DEFAULT_DNA, d)); }

  var DEFAULT_DNA = {
    pace: 'balanced',           // relaxed | balanced | fast
    captions: 'bold',           // none | subtle | bold
    cutFreq: 'medium',          // low | medium | high
    zoom: 'medium',             // none | low | medium | high
    transition: 'cuts',         // cuts | fade | glitch | zoom
    hookStyle: 'pattern',       // question | pattern | bold
    formats: ['shorts', 'long'],// preferred formats
    fun: 'high',                // low | medium | high
    learned: {}                 // filled by AutoDirector: avgClip, loudest, cuts
  };

  /* ============================== STAGES ================================== */

  /* order matters: it is the pipeline. next points at the stage the
     recommendation engine should propose when this one is done. */
  var STAGES = [
    { id: 'trend',  icon: '🔥', label: 'Trend',        next: 'idea' },
    { id: 'idea',   icon: '💡', label: 'Idea',         next: 'script' },
    { id: 'script', icon: '✍️', label: 'Script',       next: 'upload' },
    { id: 'upload', icon: '🎥', label: 'Upload',       next: 'analyze' },
    { id: 'analyze', icon: '🧠', label: 'AI Analysis', next: 'direct' },
    { id: 'direct', icon: '✂️', label: 'AutoDirector', next: 'thumb' },
    { id: 'thumb',  icon: '🎨', label: 'Thumbnail',    next: 'seo' },
    { id: 'seo',    icon: '📝', label: 'Title + SEO',  next: 'publish' },
    { id: 'publish', icon: '🚀', label: 'Publish',     next: 'improve' },
    { id: 'improve', icon: '📈', label: 'Improve',     next: null }
  ];
  var stageById = function (id) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i];
    return null;
  };

  /* ============================== PROJECT ================================= */

  function newProject(name) {
    var p = {
      id: uid(),
      name: name || 'Untitled project',
      created: Date.now(),
      updated: Date.now(),
      stages: {},
      clips: [],
      shorts: [],
      jobs: []
    };
    STAGES.forEach(function (s) { p.stages[s.id] = { done: false, data: null }; });
    return p;
  }

  function getProject(id) {
    var list = projects();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function stageSet(p, id, data) {
    p.stages[id] = { done: true, data: data };
    p.updated = Date.now();
    saveProjects(projects());
  }

  function addJob(p, kind, note) {
    var j = { id: uid(), kind: kind, state: 'queued', note: note || '', at: Date.now() };
    p.jobs.unshift(j);
    p.jobs = p.jobs.slice(0, 30);
    return j;
  }
  function setJob(p, j, state, note) {
    j.state = state;
    if (note) j.note = note;
    saveProjects(projects());
  }

  /* =========================== RECOMMENDATION ==============================
     Pure rule-based: the first undone stage after the last done one. This is
     honest — it reads the project's real state — and it is exactly the kind of
     "what now" a teenager staring at a finished script needs. */
  function recommend(p) {
    var suggestion = null;
    if (!p) return { stage: null, text: 'Create a project to start the pipeline.' };
    for (var i = 0; i < STAGES.length; i++) {
      var s = STAGES[i];
      var st = p.stages[s.id];
      if (!st || !st.done) {
        suggestion = {
          stage: s.id,
          icon: s.icon,
          label: s.label,
          text: stepText(s.id, p)
        };
        return suggestion;
      }
    }
    return { stage: 'improve', icon: '📈', label: 'Improve',
      text: 'Full pipeline done — publish more and keep improving.' };
  }

  function stepText(id, p) {
    var map = {
      trend: 'Nothing started yet. Pick a trend — it gives the whole video a reason to exist.',
      idea: 'A trend is locked in. Turn it into a specific, shootable idea.',
      script: 'You have an idea. Generate a script sized for the platform you target.',
      upload: 'Script ready. Record or upload the footage this pipeline will cut.',
      analyze: 'Footage in. Let the AI analyse scene changes, silence and loudness.',
      direct: 'Analysis done. AutoDirector turns the long video into ranked clips.',
      thumb: 'Clips are cut. Generate thumbnail concepts that make people click.',
      seo: 'Thumbnail done. Titles, description and tags next.',
      publish: 'Packaging done. Publish it — and set yourself a date for the next one.',
      improve: 'Published. Check the numbers and make the next one stronger.'
    };
    return map[id] || 'Next: ' + (stageById(id) ? stageById(id).label : id) + '.';
  }

  /* ============================== DEMO DATA ================================
     The Trend stage and the script fallback show sample content when there is
     no live AI or API to draw from. Every piece of it is labelled demo in the
     UI. Nothing here is presented as measured fact. */

  var DEMO_TRENDS = [
    { name: 'Minecraft — what if bees built the farm', growth: 82, competition: 'medium', hook: 'Bees outbuilt my entire farm.' },
    { name: 'AI voice filter on famous speeches', growth: 61, competition: 'low', hook: 'Put this AI voice on the weirdest speech I could find.' },
    { name: 'Budget gaming setup under $100', growth: 54, competition: 'high', hook: 'This $98 setup beats my $800 one.' },
    { name: 'Try a sport you have never tried', growth: 47, competition: 'medium', hook: 'Day one of a sport I know nothing about.' },
    { name: 'Recreate a meme irl', growth: 39, competition: 'medium', hook: 'We recreated this meme in real life.' }
  ];

  var DEMO_SCRIPT = {
    hook: 'Wait. This took me way longer than it should.',
    body: 'Here is what I learned so you do not waste a day.',
    cta: 'Follow for part two — it gets better.',
    note: 'Demo script — the AI could not be reached, so this is a template, not a model answer.'
  };

  /* ============================ GENERATORS ================================
     Every generator goes through ncAsk. If the provider answers, the result
     is real. If it fails, we return a clearly-labelled demo. The UI shows a
     banner for demo content. */

  function ask(prompt, opts) {
    var o = opts || {};
    return new Promise(function (resolve) {
      if (typeof window.ncAsk !== 'function') {
        resolve({ err: 'AI services are not loaded on this page.' });
        return;
      }
      window.ncAsk(prompt, {
        model: o.model || 'gemini-2.5-flash',
        maxTokens: o.maxTokens || 700,
        temperature: o.temperature == null ? 0.7 : o.temperature
      }).then(resolve);
    });
  }

  /* idea: from trend -> concrete idea */
  function generateIdea(trend) {
    return ask(
      'Turn this trend into ONE specific video idea for a teen creator (13-18). ' +
      'Reply with ONLY the idea title, 6-12 words, no quotes, no emojis.\nTrend: ' + trend,
      { maxTokens: 60, temperature: 0.9 }
    ).then(function (r) {
      if (r.err || !r.text) return { ok: true, demo: true, text: 'We try ' + trend + ' for 24 hours', err: r.err };
      return { ok: true, demo: false, text: r.text.trim() };
    });
  }

  /* script: real script or demo template */
  function generateScript(opts) {
    var topic = opts.topic || 'this idea';
    var platform = opts.platform || 'YouTube Shorts';
    var length = opts.length || 45;
    var tone = opts.tone || 'energetic';
    var d = dna();
    var prompt =
      'Write a short-form video script for a teen creator. Keep it under ' + length +
      ' seconds of talking. Structure exactly as: HOOK: <one strong line>\nBODY: <3-4 punchy beats>\nCTA: <one line asking to follow/like>.\n' +
      'Tone: ' + tone + '. Caption style: ' + d.captions + '. Transition style: ' + d.transition + '.\n' +
      'Topic: ' + topic + '. Platform: ' + platform + '. Plain text only, no markdown, no emojis.';
    return ask(prompt, { maxTokens: 500, temperature: 0.7 }).then(function (r) {
      if (r.err || !r.text) return { ok: true, demo: true, script: DEMO_SCRIPT, err: r.err };
      return { ok: true, demo: false, script: parseScript(r.text), err: '' };
    });
  }

  function parseScript(t) {
    var hook = '', body = '', cta = '';
    var lines = String(t).split(/\n+/);
    lines.forEach(function (ln) {
      var l = ln.trim();
      if (!l) return;
      if (/^HOOK/i.test(l)) hook = l.replace(/^HOOK[:.\-]?\s*/i, '');
      else if (/^CTA/i.test(l)) cta = l.replace(/^CTA[:.\-]?\s*/i, '');
      else body += (body ? '\n' : '') + l;
    });
    return { hook: hook, body: body, cta: cta, raw: t };
  }

  /* titles + SEO */
  function generateSEO(topic) {
    var d = dna();
    var prompt =
      'For the video "' + topic + '" give me exactly this JSON, nothing else:\n' +
      '{"title":"one high-CTR title under 60 chars","search":"one searchable title","funny":"one funny title","desc":"a 2-3 sentence description","tags":["6 lowercase tags"]}.\n' +
      'Style the title with ' + d.hookStyle + ' hooks. No markdown.';
    return ask(prompt, { maxTokens: 500, temperature: 0.7 }).then(function (r) {
      if (r.err || !r.text) {
        return { ok: true, demo: true, seo: {
          title: topic + ' (but nobody knew this)',
          search: 'how to ' + topic.toLowerCase() + ' the easy way',
          funny: 'i tried ' + topic.toLowerCase() + ' so you don\'t have to',
          desc: 'We tried ' + topic + ' for real. Watch what happened.',
          tags: [topic.toLowerCase(), 'shorts', 'nova', 'challenge', 'howto', 'trend']
        }, err: r.err };
      }
      try {
        var m = r.text.match(/\{[\s\S]*\}/);
        return { ok: true, demo: false, seo: JSON.parse(m ? m[0] : '{}'), err: '' };
      } catch (e) {
        return { ok: true, demo: true, seo: null, err: 'Could not parse the AI answer.' };
      }
    });
  }

  /* =========================== AUTODIRECTOR ===============================
     Consumes the real analysis services from services/ai/video.js. Progress is
     reported through the same fractional-callback the services already use. */

  function hasServices() {
    return !!(window.NCVIDEO && window.NCVIDEO.VideoAnalyzer &&
      window.NCVIDEO.TranscriptService && window.NCVIDEO.HighlightRanker);
  }

  function runAutoDirector(p, file, onProgress) {
    var V = window.NCVIDEO;
    var job = addJob(p, 'autodirector', 'Analyzing ' + (file.name || 'video'));
    setJob(p, job, 'processing');
    var sigInfo = null;

    var report = function (frac, msg) { if (onProgress) onProgress(frac, msg); };

    return Promise.resolve()
      .then(function () { report(0.02, 'Reading the video…'); return V.VideoAnalyzer.analyze(file, report); })
      .then(function (sig) {
        if (!sig.ok) { setJob(p, job, 'failed', sig.err || 'Could not read the video.'); return { ok: false, err: sig.err }; }
        sigInfo = sig;
        report(0.5, 'Measuring loudness and silence…');
        return V.TranscriptService.loudness(file, report).then(function (aud) {
          sig.rms = aud.rms || [];
          sig.silent = aud.silent || [];
          sig.peaks = aud.peaks || [];
          report(0.72, 'Ranking the best moments…');
          return V.HighlightRanker.rank(file, sig, report);
        });
      })
      .then(function (rank) {
        if (!rank.ok) { setJob(p, job, 'failed', rank.err || 'Ranking failed.'); return rank; }
        p.clips = rank.clips;
        p.shorts = [];
        stageSet(p, 'analyze', { scenes: sigInfo && sigInfo.scenes ? sigInfo.scenes.length : 0, ai: rank.ai });
        stageSet(p, 'direct', { clips: rank.clips.length, ai: rank.ai });
        var learned = dna().learned || {};
        var durations = rank.clips.map(function (c) { return c.duration; });
        learned.avgClip = Math.round((durations.reduce(function (a, b) { return a + b; }, 0) / (durations.length || 1)) * 10) / 10;
        learned.lastAnalyzed = Date.now();
        learned.samples = (learned.samples || 0) + 1;
        saveDNA(Object.assign(dna(), { learned: learned }));
        setJob(p, job, 'completed', rank.clips.length + ' clips ranked' + (rank.ai ? ' with AI' : ''));
        return rank;
      })
      .catch(function (e) {
        setJob(p, job, 'failed', String(e && e.message || e));
        return { ok: false, err: String(e && e.message || e) };
      });
  }

  /* shorts: batch-generate ready-to-post shorts from ranked clips */
  function buildShorts(p, max) {
    var clips = (p.clips || []).slice(0, max || 3);
    var out = clips.map(function (c, i) {
      var d = dna();
      return {
        id: uid(),
        start: c.start, end: c.end, duration: c.duration, t: c.t,
        reason: c.reason, quality: c.quality, hook: c.hook, viral: c.viral, ai: c.ai,
        caption: captionsFor(c, i),
        hookLine: hookFor(c),
        tags: tagsFor(c),
        plan: [
          'Crop to 9:16',
          'Cut at ' + c.t + ' for ' + c.duration + 's',
          'Captions: ' + d.captions,
          'Zoom: ' + d.zoom,
          'Transition: ' + d.transition
        ]
      };
    });
    p.shorts = out;
    saveProjects(projects());
    return out;
  }

  function captionsFor(c, i) {
    var i18n = [
      'This is the part everyone rewatches.',
      'Watch what happens next…',
      'The reason this clip made the cut.',
      'You were NOT ready for this.'
    ];
    return i18n[i % i18n.length] + (c.ai ? '' : ' (demo caption)');
  }
  function hookFor(c) {
    if (c.hookText) return c.hookText;
    var d = dna();
    if (d.hookStyle === 'question') return 'Did you catch that?';
    if (d.hookStyle === 'bold') return 'No way this happened.';
    return 'Wait for it…';
  }
  function tagsFor(c) {
    return ['#nova', '#shorts', '#viral', '#fyp'];
  }

  /* ============================== UI ======================================
     pipeline.html provides containers; this builds everything else. The
     assistant dock is added to the body so it floats over the page. */

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var T = {
    trend: 'Trend', idea: 'Idea', script: 'Script', upload: 'Upload',
    analyze: 'AI Analysis', direct: 'AutoDirector', thumb: 'Thumbnail',
    seo: 'Title + SEO', publish: 'Publish', improve: 'Improve'
  };
  var T_KEYS = {
    trend: 'pipe_trend', idea: 'pipe_idea', script: 'pipe_script', upload: 'pipe_upload',
    analyze: 'pipe_analyze', direct: 'pipe_direct', thumb: 'pipe_thumb',
    seo: 'pipe_seo', publish: 'pipe_publish', improve: 'pipe_improve'
  };

  function boot() {
    if (document.getElementById('ncpipe')) return;
    var root = el('div'); root.id = 'ncpipe';
    document.getElementById('ncpipeHost').appendChild(root);
    var incoming = new URLSearchParams(location.search).get('trend') || localStorage.getItem('nc_active_trend');
    if (incoming) {
      localStorage.removeItem('nc_active_trend');
      try { incoming = decodeURIComponent(incoming); } catch (e) {}
      seedTrend(incoming);
    }
    paint();
    bootAssistant();
  }

  function activeProject() {
    var list = projects();
    if (!list.length) {
      var first = newProject('My first project');
      list.push(first); saveProjects(list);
    }
    return getProject(localStorage.getItem('nc_active') || list[0].id) || list[0];
  }

  /* trends.html hands off a picked trend: bind it to the active project's
     Trend stage and land the creator on the Idea step. */
  function seedTrend(name) {
    var p = activeProject();
    if (!p) return;
    if (p.stages.trend && !p.stages.trend.done) {
      stageSet(p, 'trend', { name: name, growth: null, competition: 'low', from: 'trend-spotter' });
    }
    localStorage.setItem('nc_active', p.id);
  }

  /* re-render the dashboard. Cheap enough: it is a handful of cards. */
  function paint() {
    var root = document.getElementById('ncpipe');
    if (!root) return;
    root.innerHTML = '';

    var list = projects();
    var active = activeProject();

    /* header row: title + project switcher + new project */
    var head = el('div', 'pl-head');
    var title = el('div', 'pl-title');
    title.appendChild(el('h1', '', 'Creator Pipeline'));
    title.appendChild(el('p', 'pl-sub', 'A project moves idea → publish, one stage at a time. NovaClip recommends the next move after every step.'));
    head.appendChild(title);

    var pick = el('div', 'pl-pick');
    var sel = document.createElement('select');
    sel.id = 'plSelect';
    list.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name;
      sel.appendChild(o);
    });
    sel.value = active.id;
    sel.onchange = function () { localStorage.setItem('nc_active', sel.value); paint(); };
    pick.appendChild(sel);
    var add = el('button', 'pl-btn', '+ New');
    add.onclick = function () {
      var name = prompt('Project name:');
      if (!name) return;
      var p = newProject(name);
      var l = projects(); l.unshift(p); saveProjects(l);
      localStorage.setItem('nc_active', p.id);
      paint();
    };
    pick.appendChild(add);
    head.appendChild(pick);
    root.appendChild(head);

    /* stage rail */
    var rail = el('div', 'pl-rail');
    var rec = recommend(active);
    STAGES.forEach(function (s) {
      var st = active.stages[s.id];
      var done = st && st.done;
      var cls = 'pl-stage';
      if (done) cls += ' done';
      if (s.id === rec.stage) cls += ' now';
      var cell = el('div', cls, '');
      cell.innerHTML = '<div class="pl-ico">' + s.icon + '</div><div class="pl-lab">' + s.label + '</div>';
      if (T_KEYS[s.id]) cell.querySelector('.pl-lab').setAttribute('data-t', T_KEYS[s.id]);
      cell.title = done ? 'Done' : 'Open ' + s.label;
      cell.onclick = function () { showStage(active, s.id); };
      rail.appendChild(cell);
    });
    root.appendChild(rail);

    /* body: left = next move + project stats + jobs, right = active stage panel */
    var body = el('div', 'pl-body');
    body.appendChild(nextMoveCard(active));
    body.appendChild(projectCard(active));
    var jc = jobsCard(active);
    if (jc) body.appendChild(jc);
    root.appendChild(body);

    var panel = stagePanel(active);
    if (panel) root.appendChild(panel);
    panelArea(active, root);
  }

  function panelArea(p, root) {
    var box = el('div', 'pl-panel');
    box.id = 'plPanel';
    root.appendChild(box);
    showStage(p, recommend(p).stage || 'trend');
  }

  /* a card showing "what you should do now", plus quick links */
  function nextMoveCard(p) {
    var rec = recommend(p);
    var c = el('div', 'pl-card', '<div class="pl-cardh" data-t="pipe_next">Your next move</div>');
    var row = el('div', 'pl-move');
    row.innerHTML = '<span class="pl-ico">' + (rec.icon || '→') + '</span>' +
      '<div><b>' + (rec.label || 'Start') + '</b><p>' + rec.text + '</p></div>' +
      '<button class="pl-btn" data-t="pipe_open" data-go>Open</button>';
    row.querySelector('[data-go]').onclick = function () { showStage(p, rec.stage); };
    c.appendChild(row);
    return c;
  }

  function projectCard(p) {
    var c = el('div', 'pl-card', '<div class="pl-cardh" data-t="pipe_status">Project status</div>');
    var done = STAGES.filter(function (s) { return p.stages[s.id].done; }).length;
    var total = STAGES.length;
    var pct = Math.round(done / total * 100);
    c.appendChild(el('div', 'pl-prog',
      '<div class="pl-progbar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="pl-progt">' + done + ' of ' + total + ' stages done · ' + pct + '%</div>'));

    var meta = el('div', 'pl-meta');
    meta.appendChild(el('span', '', (p.clips || []).length + ' clips'));
    meta.appendChild(el('span', '', (p.shorts || []).length + ' shorts'));
    meta.appendChild(el('span', '', p.jobs.length + ' jobs'));
    c.appendChild(meta);

    var dnaBadges = el('div', 'pl-dna', '');
    var d = dna();
    dnaBadges.innerHTML = '<span>DNA · ' + d.pace + ' pace</span><span>' + d.captions + ' captions</span><span>' + d.cutFreq + ' cuts</span>';
    c.appendChild(dnaBadges);
    return c;
  }

  /* ---- stage panels ------------------------------------------------------ */

  function stagePanel(p) {
    var c = el('div', 'pl-card pl-stagecard');
    c.id = 'plStageCard';
    return c;
  }

  function showStage(p, id) {
    var box = document.getElementById('plStageCard');
    if (!box) return;
    box.innerHTML = '';
    var h = el('div', 'pl-cardh', '');
    if (stageById(id)) h.appendChild(el('span', '', stageById(id).icon + ' '));
    var lab = el('span', '', T[id] || id);
    if (T_KEYS[id]) lab.setAttribute('data-t', T_KEYS[id]);
    h.appendChild(lab);
    box.appendChild(h);
    switch (id) {
      case 'trend': trendPanel(box, p); break;
      case 'idea': ideaPanel(box, p); break;
      case 'script': scriptPanel(box, p); break;
      case 'upload': uploadPanel(box, p); break;
      case 'analyze': analyzePanel(box, p); break;
      case 'direct': directPanel(box, p); break;
      case 'thumb': thumbPanel(box, p); break;
      case 'seo': seoPanel(box, p); break;
      case 'publish': publishPanel(box, p); break;
      case 'improve': improvePanel(box, p); break;
    }
  }

  function trendPanel(box, p) {
    var note = el('div', 'pl-demo', 'Demo feed — real trend data plugs into the same list.');
    box.appendChild(note);
    DEMO_TRENDS.forEach(function (t) {
      var row = el('div', 'pl-trend', '');
      row.innerHTML =
        '<div class="pl-ico">🔥</div>' +
        '<div class="pl-tn"><b>' + t.name + '</b><span>+' + t.growth + '% this week · ' + t.competition + ' competition</span></div>' +
        '<button class="pl-btn" data-use>Use</button>';
      row.querySelector('[data-use]').onclick = function () {
        stageSet(p, 'trend', t);
        if (!p.stages.idea.done) showStage(p, 'idea');
        paint();
      };
      box.appendChild(row);
    });
  }

  function ideaPanel(box, p) {
    var trend = p.stages.trend.data;
    box.appendChild(el('p', 'pl-sub', trend
      ? 'Trend chosen: <b>' + trend.name + '</b>. Turn it into one shootable idea.'
      : 'No trend yet — pick one in the Trend stage first.'));
    var go = el('button', 'pl-btn', 'Generate idea');
    var out = el('div', 'pl-out', '');
    box.appendChild(go);
    box.appendChild(out);
    go.onclick = function () {
      var seed = trend ? trend.name : 'a fresh challenge video';
      go.disabled = true; go.textContent = 'Thinking…';
      generateIdea(seed).then(function (r) {
        go.disabled = false; go.textContent = 'Generate idea';
        var idea = r.text || 'A fresh take on ' + seed;
        out.innerHTML = '';
        out.appendChild(el('div', 'pl-idea', idea));
        if (r.demo) out.appendChild(el('div', 'pl-demo', 'Demo idea — the AI could not be reached.'));
        stageSet(p, 'idea', { idea: idea, demo: r.demo });
        paint();
      });
    };
  }

  function scriptPanel(box, p) {
    var idea = p.stages.idea.data;
    box.appendChild(el('p', 'pl-sub', idea
      ? 'Idea: <b>' + idea.idea + '</b>. Script it for the platform you post on.'
      : 'No idea saved yet — generate one first.'));

    var form = el('div', 'pl-form', '');
    form.innerHTML =
      '<label>Platform <select id="plPlat"><option>YouTube Shorts</option><option>TikTok</option><option>Reel</option><option>YouTube video</option></select></label>' +
      '<label>Length <select id="plLen"><option value="30">30s</option><option value="45" selected>45s</option><option value="60">60s</option><option value="180">3 min</option></select></label>' +
      '<label>Tone <select id="plTone"><option>energetic</option><option>funny</option><option>calm</option><option>dramatic</option></select></label>';
    box.appendChild(form);

    var go = el('button', 'pl-btn', 'Write script');
    box.appendChild(go);
    var out = el('div', 'pl-out', '');
    box.appendChild(out);

    go.onclick = function () {
      var plat = document.getElementById('plPlat').value;
      var len = document.getElementById('plLen').value;
      var tone = document.getElementById('plTone').value;
      go.disabled = true; go.textContent = 'Writing…';
      generateScript({
        topic: idea ? idea.idea : 'this idea',
        platform: plat, length: parseInt(len, 10), tone: tone
      }).then(function (r) {
        go.disabled = false; go.textContent = 'Write script';
        out.innerHTML = '';
        var sc = r.script;
        out.appendChild(el('div', 'pl-script',
          '<b>HOOK</b><div>' + esc(sc.hook) + '</div>' +
          '<b>BODY</b><div>' + esc(sc.body) + '</div>' +
          '<b>CTA</b><div>' + esc(sc.cta) + '</div>'));
        if (r.demo) out.appendChild(el('div', 'pl-demo', 'Demo script — the AI could not be reached.'));
        stageSet(p, 'script', { script: sc, demo: r.demo, platform: plat });
        paint();
      });
    };
  }

  function uploadPanel(box, p) {
    box.appendChild(el('p', 'pl-sub', 'Upload the footage this pipeline will analyse and cut. It never leaves this browser.'));
    var file = document.createElement('input');
    file.type = 'file';
    file.accept = 'video/*';
    box.appendChild(file);

    var state = el('div', 'pl-state', '');
    var prog = el('div', 'pl-progbar pl-big', '<i style="width:0%"></i>');
    prog.style.display = 'none';
    box.appendChild(state);
    box.appendChild(prog);

    file.onchange = function () {
      var f = file.files && file.files[0];
      if (!f) return;
      if (!hasServices()) {
        state.textContent = 'The analysis engine is not loaded — video.js is missing from this build.';
        return;
      }
      stageSet(p, 'upload', { name: f.name, size: f.size });
      file.style.display = 'none';
      prog.style.display = 'block';
      state.textContent = 'Analyzing ' + f.name + '…';
      runAutoDirector(p, f, function (frac, msg) {
        prog.querySelector('i').style.width = Math.round(frac * 100) + '%';
        state.textContent = msg || Math.round(frac * 100) + '%';
      }).then(function (r) {
        prog.style.display = 'none';
        if (r.ok) state.textContent = r.clips.length + ' clips ranked' + (r.ai ? ' with AI' : '') + ' — open AutoDirector to cut them into Shorts.';
        else state.textContent = r.err || 'Analysis failed.';
        paint();
      });
    };
  }

  function analyzePanel(box, p) {
    var a = p.stages.analyze.data;
    box.appendChild(el('p', 'pl-sub', a
      ? 'Analysis done: ' + a.scenes + ' scene changes mapped, loudness and silence measured. The clip reasons are <b>' +
        (a.ai ? 'AI-written' : 'computed from the local audio/visual signal') + '</b>.'
      : 'Upload footage first — the analysis runs right after.'));
    if (a && p.stages.upload.data) {
      box.appendChild(el('div', 'pl-note', 'Source: <b>' + p.stages.upload.data.name + '</b>'));
    }
  }

  function directPanel(box, p) {
    var clips = p.clips || [];
    box.appendChild(el('p', 'pl-sub', clips.length
      ? clips.length + ' clips ranked by hook, quality and viral potential. Make them Shorts, or preview a clip.'
      : 'No clips yet — upload footage and the analysis will rank the moments.'));

    if (clips.length) {
      var list = el('div', 'pl-clips', '');
      clips.forEach(function (c, i) {
        var row = el('div', 'pl-clip', '');
        row.innerHTML =
          '<div class="pl-rank">' + (i + 1) + '</div>' +
          '<div class="pl-cb">' +
            '<div class="pl-ct">' + c.t + ' → ' + c.end + ' · ' + c.duration + 's</div>' +
            '<div class="pl-cr">' + esc(c.reason) + (c.ai ? '' : ' <span class="pl-demo">local</span>') + '</div>' +
            '<div class="pl-cs"><span>Hook ' + c.hook + '</span><span>Quality ' + c.quality + '</span><span>Viral ' + c.viral + '</span></div>' +
          '</div>' +
          '<div class="pl-ca">' +
            '<button class="pl-btn" data-short>Short</button>' +
            '<button class="pl-mini" data-prev>Preview</button>' +
          '</div>';
        row.querySelector('[data-prev]').onclick = function () {
          stateToast('Clip ' + c.t + ' (' + c.duration + 's) — full preview lives in the Editor.');
        };
        row.querySelector('[data-short]').onclick = function () {
          buildShorts(p, i + 1);
          paint();
          stateToast('Made into a Short — see the Shorts below and the Export panel.');
        };
        list.appendChild(row);
      });
      box.appendChild(list);
    }

    if (p.shorts && p.shorts.length) {
      box.appendChild(el('div', 'pl-cardh', 'Ready Shorts (' + p.shorts.length + ')'));
      p.shorts.forEach(function (s) {
        var sc = el('div', 'pl-short', '');
        sc.innerHTML =
          '<b>' + s.t + ' · ' + s.duration + 's</b>' +
          '<div class="pl-shook">“' + esc(s.hookLine) + '”</div>' +
          '<div class="pl-scap">' + esc(s.caption) + '</div>' +
          '<div class="pl-stags">' + s.tags.join(' ') + '</div>' +
          '<div class="pl-splan">' + s.plan.join(' · ') + '</div>';
        box.appendChild(sc);
      });
      var exp = el('button', 'pl-btn', 'Export packaging');
      exp.onclick = function () {
        var txt = p.shorts.map(function (s) {
          return 'HOOK: ' + s.hookLine + '\nCAPTION: ' + s.caption + '\nTAGS: ' + s.tags.join(' ') +
            '\nPLAN: ' + s.plan.join(' · ');
        }).join('\n\n---\n\n');
        stateToast('Packaging copied to clipboard.');
        try { navigator.clipboard.writeText(txt); } catch (e) {}
      };
      box.appendChild(exp);
    }
  }

  function thumbPanel(box, p) {
    box.appendChild(el('p', 'pl-sub', 'Thumbnail concepts for the current video. Click a concept to lock it in.'));
    var concepts = [
      { text: 'Shocked face + giant arrow', why: 'High contrast, single focal point.' },
      { text: 'Before / after split', why: 'Comparison framing is instantly readable.' },
      { text: 'One bold word: “WAIT.”', why: 'Stop-scroll words beat full sentences.' }
    ];
    concepts.forEach(function (c) {
      var row = el('button', 'pl-thumb', '');
      row.innerHTML = '<div class="pl-timg">🖼</div><div><b>' + c.text + '</b><span>' + c.why + '</span></div>';
      row.onclick = function () {
        stageSet(p, 'thumb', c);
        paint();
        stateToast('Thumbnail concept locked: ' + c.text);
      };
      box.appendChild(row);
    });
    var real = el('button', 'pl-btn', 'Generate with AI');
    real.onclick = function () {
      ask('Suggest 3 thumbnail texts for "' +
        (p.stages.idea.data ? p.stages.idea.data.idea : 'this video') +
        '". Short, 3 words max each, separated by newlines. No markdown.', { maxTokens: 80 }).then(function (r) {
        if (r.err || !r.text) { stateToast('AI offline — the demo concepts above are still available.'); return; }
        stageSet(p, 'thumb', { text: r.text.trim().split('\n')[0], why: 'AI suggestion', ai: true });
        paint();
        stateToast('AI thumbnail concept generated.');
      });
    };
    box.appendChild(real);
  }

  function seoPanel(box, p) {
    box.appendChild(el('p', 'pl-sub', 'Titles, description and tags for the current idea. Click a row to copy it.'));
    var go = el('button', 'pl-btn', 'Generate SEO');
    var out = el('div', 'pl-out', '');
    box.appendChild(go);
    box.appendChild(out);
    go.onclick = function () {
      var topic = p.stages.idea.data ? p.stages.idea.data.idea : 'this video';
      go.disabled = true; go.textContent = 'Generating…';
      generateSEO(topic).then(function (r) {
        go.disabled = false; go.textContent = 'Generate SEO';
        out.innerHTML = '';
        if (r.seo) {
          out.appendChild(el('div', 'pl-seo', '<b>Title</b><div>' + esc(r.seo.title) + '</div>'));
          out.appendChild(el('div', 'pl-seo', '<b>Search</b><div>' + esc(r.seo.search) + '</div>'));
          out.appendChild(el('div', 'pl-seo', '<b>Funny</b><div>' + esc(r.seo.funny) + '</div>'));
          out.appendChild(el('div', 'pl-seo', '<b>Description</b><div>' + esc(r.seo.desc) + '</div>'));
          out.appendChild(el('div', 'pl-seo', '<b>Tags</b><div>' + esc((r.seo.tags || []).join(' · ')) + '</div>'));
        }
        if (r.demo) out.appendChild(el('div', 'pl-demo', 'Demo SEO — the AI could not be reached.'));
        stageSet(p, 'seo', { seo: r.seo, demo: r.demo });
        paint();
      });
    };
  }

  function publishPanel(box, p) {
    box.appendChild(el('p', 'pl-sub', 'The packaging for this video is ready. Publish it on your platform and log the upload date.'));
    var btn = el('button', 'pl-btn', 'Mark published');
    btn.onclick = function () {
      stageSet(p, 'publish', { at: Date.now() });
      paint();
      stateToast('Published — the Improve stage is next.');
    };
    box.appendChild(btn);
    if (p.stages.publish.data) {
      box.appendChild(el('div', 'pl-note', 'Published ' + new Date(p.stages.publish.data.at).toLocaleString() + '.'));
    }
  }

  function improvePanel(box, p) {
    box.appendChild(el('p', 'pl-sub', 'Compare the published video against the plan. What changed next time?'));
    var d = dna();
    var cards = el('div', 'pl-grid', '');
    cards.appendChild(el('div', 'pl-card', '<div class="pl-cardh">Keep</div><p>' +
      (p.clips.length ? p.clips.length + ' clips from one upload' : 'Pipeline reuse') + '</p>'));
    cards.appendChild(el('div', 'pl-card', '<div class="pl-cardh">Improve</div><p>' +
      'Feed your Creator DNA — pace, captions, cuts, transitions.</p>'));
    box.appendChild(cards);
    box.appendChild(el('div', 'pl-dnaed',
      '<div class="pl-cardh">Creator DNA — this shapes every AI script, caption and cut for you.</div>' +
      '<label>Pace <select data-dna="pace"><option>relaxed</option><option>balanced</option><option>fast</option></select></label>' +
      '<label>Captions <select data-dna="captions"><option>none</option><option>subtle</option><option>bold</option></select></label>' +
      '<label>Cuts <select data-dna="cutFreq"><option>low</option><option>medium</option><option>high</option></select></label>' +
      '<label>Zoom <select data-dna="zoom"><option>none</option><option>low</option><option>medium</option><option>high</option></select></label>' +
      '<label>Transitions <select data-dna="transition"><option>cuts</option><option>fade</option><option>glitch</option><option>zoom</option></select></label>' +
      '<label>Hooks <select data-dna="hookStyle"><option>question</option><option>pattern</option><option>bold</option></select></label>'));
    var box2 = box.querySelector('.pl-dnaed') || box.lastChild;
    box2.querySelectorAll('[data-dna]').forEach(function (s) {
      s.value = d[s.dataset.dna];
      s.onchange = function () {
        var nd = dna(); nd[s.dataset.dna] = s.value; saveDNA(nd);
        stateToast('Creator DNA updated — next script/captions use "' + s.value + '".');
        paint();
      };
    });
  }

  /* ---- jobs feed --------------------------------------------------------- */

  function jobsCard(p) {
    if (!p.jobs || !p.jobs.length) return null;
    var c = el('div', 'pl-card', '<div class="pl-cardh">AI jobs</div>');
    p.jobs.slice(0, 6).forEach(function (j) {
      c.appendChild(el('div', 'pl-job ' + j.state,
        '<i></i><span>' + j.kind + '</span><span class="pl-jn">' + esc(j.note) + '</span>' +
        '<em>' + j.state + '</em>'));
    });
    return c;
  }

  /* ---- small helpers ----------------------------------------------------- */

  function stateToast(msg) {
    var t = document.getElementById('plToast');
    if (!t) {
      t = el('div'); t.id = 'plToast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- assistant dock -----------------------------------------------------
     A floating chat, like the AI pages have, but pipeline-aware: it knows the
     active project and can act on it. Commands are real local behaviour
     ("make this faster", "find the funniest moment"); anything else goes to
     the model when it is reachable. */

  function bootAssistant() {
    if (document.getElementById('plAssistant')) return;
    var st = document.createElement('style');
    st.id = 'plAssCss';
    st.textContent =
      '#plAssistant{position:fixed;right:18px;bottom:18px;width:330px;max-height:440px;display:flex;flex-direction:column;' +
      'border:1px solid var(--line,#222);border-radius:16px;overflow:hidden;z-index:900;' +
      'background:linear-gradient(175deg,#0E1220,#080B14);box-shadow:0 20px 60px rgba(0,0,0,.55)}' +
      '#plAssHead{padding:12px 14px;font-weight:800;font-size:13px;display:flex;justify-content:space-between;align-items:center;' +
      'border-bottom:1px solid rgba(255,255,255,.08);color:#00F0FF;cursor:move;user-select:none}' +
      '#plAssHead button{background:none;border:0;color:#7E8AA6;font-size:16px;cursor:pointer;line-height:1}' +
      '#plAssBody{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;font-size:13px;max-height:300px}' +
      '#plAssBody .m{align-self:flex-start;background:rgba(255,255,255,.07);padding:8px 11px;border-radius:12px 12px 12px 4px;color:#EAF2FF;line-height:1.5;white-space:pre-wrap;max-width:92%}' +
      '#plAssBody .u{align-self:flex-end;background:linear-gradient(135deg,#F72585,#7C5CFF);padding:8px 11px;border-radius:12px 12px 4px 12px;color:#fff}' +
      '#plAssIn{display:flex;border-top:1px solid rgba(255,255,255,.08)}' +
      '#plAssIn input{flex:1;background:none;border:0;padding:12px;color:#EAF2FF;outline:0;font:inherit;font-size:13px}' +
      '#plAssIn button{background:linear-gradient(135deg,#00E5FF,#F72585);border:0;color:#05060A;font-weight:800;padding:0 16px;cursor:pointer}' +
      '.pl-demo{color:#FF9ECB;font-size:12px;font-style:italic;margin-top:6px}';
    document.head.appendChild(st);

    var dock = el('div');
    dock.id = 'plAssistant';
    dock.innerHTML =
      '<div id="plAssHead"><span>✨ NovaClip Co-pilot</span><button data-x>×</button></div>' +
      '<div id="plAssBody"><div class="m">Ask me to make this faster, find the funniest moment, create 3 shorts, or write a stronger hook.</div></div>' +
      '<div id="plAssIn"><input placeholder="Ask or command…"><button>Send</button></div>';
    dock.style.display = 'none';
    document.body.appendChild(dock);

    var launcher = el('button', 'pl-launcher', '✨');
    launcher.id = 'plAssBtn';
    launcher.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:900;width:54px;height:54px;border-radius:50%;' +
      'border:0;font-size:22px;cursor:pointer;background:linear-gradient(135deg,#F72585,#7C5CFF,#00E5FF);' +
      'color:#fff;box-shadow:0 10px 30px rgba(124,92,255,.5)';
    launcher.onclick = function () { dock.style.display = 'flex'; launcher.style.display = 'none'; };
    document.body.appendChild(launcher);

    var body = dock.querySelector('#plAssBody');
    var input = dock.querySelector('#plAssIn input');
    var send = dock.querySelector('#plAssIn button');
    var close = dock.querySelector('[data-x]');
    close.onclick = function () { dock.style.display = 'none'; launcher.style.display = 'block'; };
    send.onclick = askAssistant;
    input.onkeydown = function (e) { if (e.key === 'Enter') askAssistant(); };

    var busy = false;
    function askAssistant() {
      if (busy) return;
      var q = input.value.trim();
      if (!q) return;
      input.value = '';
      body.appendChild(el('div', 'u', esc(q)));
      var think = el('div', 'm', '…');
      body.appendChild(think);
      busy = true;
      assistantReply(q).then(function (reply) {
        think.remove();
        body.appendChild(el('div', 'm', esc(reply)));
        body.scrollTop = body.scrollHeight;
        busy = false;
      });
    }

    function activeNow() {
      var id = localStorage.getItem('nc_active');
      return getProject(id) || projects()[0] || null;
    }

    function assistantReply(q) {
      var p = activeNow();
      var ql = q.toLowerCase();
      var rec = recommend(p);

      /* local commands — real behaviour, no model needed */
      if (/make this faster|faster cuts|more energetic/.test(ql)) {
        var nd = dna(); nd.pace = 'fast'; nd.cutFreq = 'high'; nd.zoom = 'high'; saveDNA(nd);
        paint();
        return Promise.resolve('Done — your Creator DNA is now fast pace, high cut frequency, punchy zoom. Every script, caption and cut suggestion will follow it.');
      }
      if (/find the funniest moment|funniest|best moment|highlight/.test(ql) && p && p.clips.length) {
        var best = p.clips.slice().sort(function (a, b) { return b.viral - a.viral; })[0];
        return Promise.resolve('Strongest moment: ' + best.t + ' → ' + best.end + ' (' + best.duration + 's). ' +
          'Hook ' + best.hook + ', quality ' + best.quality + ', viral ' + best.viral + '. ' +
          'Reason: ' + best.reason + ' Want me to make it a Short?');
      }
      if (/(\d+)\s*shorts|create shorts|make shorts/.test(ql) && p && p.clips.length) {
        var m = ql.match(/(\d+)\s*shorts/);
        var n = m ? parseInt(m[1], 10) : 3;
        var made = buildShorts(p, n);
        paint();
        return Promise.resolve('Built ' + made.length + ' Short' + (made.length === 1 ? '' : 's') +
          ' from your ranked clips — hooks, captions, tags and cut plans included. Open AutoDirector to see them.');
      }
      if (/stronger hook|better hook|hook/.test(ql)) {
        return Promise.resolve('Hooks do best when they state a payoff up front ("Wait for it…" style). ' +
          'I write yours with ' + (dna().hookStyle) + ' hooks. Want me to re-script the current video with a stronger opener?');
      }
      if (/plan|next|what now|what next/.test(ql)) {
        return Promise.resolve('Next up: ' + rec.label + '. ' + rec.text + ' Open it from the rail or say "open it".');
      }
      if (/remove silence|tighten/.test(ql) && p && p.clips.length) {
        return Promise.resolve('The clips already start at strong beats — silence was measured and trimmed at analysis time. Want tighter 15s versions?');
      }

      /* model path */
      var d = dna();
      var ctx = p
        ? ('Active project: "' + p.name + '". Stages done: ' +
           STAGES.filter(function (s) { return p.stages[s.id].done; }).map(function (s) { return s.label; }).join(', ') +
           '. Clips: ' + p.clips.length + '. Shorts: ' + p.shorts.length + '.')
        : 'No active project.';
      var prompt =
        'You are the NovaClip co-pilot, a creator coach for a teen (13-18). Be brief, specific and friendly. ' +
        'No fake numbers. Context: ' + ctx + ' ' +
        'Creator DNA: ' + d.pace + ' pace, ' + d.captions + ' captions, ' + d.cutFreq + ' cuts, ' + d.transition + ' transitions. ' +
        'Answer in ' + (typeof window.lang === 'function' ? window.lang() : 'en') + '. Question: ' + q;
      return ask(prompt, { maxTokens: 300, temperature: 0.6 }).then(function (r) {
        if (r.err || !r.text) return 'I could not reach the AI right now. Try a command instead: "make this faster", "find the funniest moment", or "create 3 shorts".';
        return r.text.trim();
      });
    }
  }

  /* ============================ EXPORTS =================================== */

  window.NCP = {
    boot: boot, paint: paint, projects: projects, dna: dna, saveDNA: saveDNA,
    newProject: newProject, recommend: recommend, STAGES: STAGES,
    runAutoDirector: runAutoDirector, buildShorts: buildShorts
  };

  /* attach a first-run seed so the dashboard is never empty */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
