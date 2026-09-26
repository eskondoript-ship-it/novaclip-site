/* ============================================================================
   EDITOR HELP — "what is this panel, and how do I do the thing?"
   ============================================================================
   The rail on the left of the editor has thirteen buttons, the inspector on
   the right has five tabs, and four of the rail buttons open a window of their
   own. That is twenty-two places to be standing, and until now the only help
   anywhere near them was the site-wide "?" in the top bar, which answers "how
   do I use the editor" — one paragraph for the whole application. Somebody
   looking at the Keyframes tab wondering what a keyframe is got a sentence
   about dropping a clip on the timeline.

   So: the same idea, per panel. A small "How?" button sits at the bottom of
   whichever column you are in, it knows which panel is open, and it answers
   about that one.

   WHY THE STEPS ARE WRITTEN DOWN AND NOT ASKED OF THE MODEL

   Same reason nova-guide.js writes its own: "how do I add a transition" has
   one correct answer, it does not change between visits, and a help button
   that needs the network is missing at exactly the moment somebody is stuck on
   a train. Every step below was read off the running editor rather than
   remembered — the numbers (26 transitions, 36 effects, 69 sound effects, 24
   AI tools) are the ones the panels themselves print, and if the editor
   changes they should be re-read, not guessed at.

   THE AI IS FOR THE QUESTION THAT IS NOT ON THE CARD

   "How do I make the music quieter under the talking" is not a step, it is a
   question, and it is the kind of thing a fourteen-year-old actually asks. The
   ask box sends it with the panel's own steps and the state of their project
   attached, so the answer is about what is in front of them rather than about
   video editing in general. It is one call, it is capped short, and when the
   AI cannot be reached the card is still a card — the written steps are above
   the box, not behind it.

   IN A LANGUAGE THAT IS NOT ENGLISH

   The site speaks twenty languages; this file's steps are written in one. The
   twenty-two topics here would be four hundred strings to hand-translate and
   they would rot on the first editor change. So they are translated once, on
   demand, by the model, and kept in localStorage per language — English shows
   immediately and is replaced in place when the translation lands. A machine
   translation of a known-correct sentence is worth much more than an empty
   card, and if it never arrives nothing is lost.

   NOTHING HERE TOUCHES REACT

   The button and the card are built in document.body and positioned over the
   columns by measurement. Injecting into the bundle's own DOM means fighting
   its next render; measuring means the layout can move and this follows it.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__ncHelp) return;

  /* ------------------------------------------------------------------------
     THE TOPICS

     id     matched from what is actually on screen (see topicNow)
     title  what the panel calls itself
     what   one line: what this panel is for
     steps  the order to do things in
     tip    the thing people miss, or get wrong
     ---------------------------------------------------------------------- */
  var TOPICS = {

    /* ---- the rail, top to bottom ---- */
    media: {
      title: 'Media Library',
      what: 'Everything you have brought into this project: video, pictures and sound.',
      steps: [
        'Press <b>Upload</b>, or drag files straight onto the panel. It takes MP4, MOV, WebM, GIF, PNG, JPG, SVG, MP3, WAV and OGG.',
        'Drag a tile from here down onto a lane in the timeline to use it.',
        'Drop it on a <b>V</b> lane for picture, an <b>A</b> lane for sound. A clip that does not belong on a lane will not land there.',
        'The same library is shared by every timeline in the project, so a file only has to be brought in once.'
      ],
      tip: 'Nothing you drop in is uploaded anywhere. The whole editor runs in this tab, which is why it still works with the wifi off.'
    },
    text: {
      title: 'Text',
      what: 'Titles, captions and lower thirds, as clips on their own lane.',
      steps: [
        'Press <b>Add Text</b> to put a text clip at the playhead, or pick one of the presets — Title, Subtitle, Caption, Lower Third, Neon Glow, Gradient Pop, Outlined, Shadow, 3D.',
        'Click the text clip on the timeline to select it, then type in the panel to change the words.',
        'Use the <b>Transform</b> tab on the right to move, scale and rotate it; <b>Color</b> for its colour.',
        'Drag the ends of the clip to decide how long it stays on screen.'
      ],
      tip: '<b>Match Cut</b> makes the text start and end exactly with the clip under it, which is almost always what you meant by "put a caption on this bit".'
    },
    transitions: {
      title: 'Transitions',
      what: '26 ways for one clip to become the next one.',
      steps: [
        'Click a clip on the timeline first. The list stays greyed out until something is selected, because a transition belongs to a clip.',
        'Each transition has an <b>In</b> and an <b>Out</b> — In is how the clip arrives, Out is how it leaves.',
        'The little picture on each tile is the real transition running, not an icon. Watch it before you choose.',
        'Put the Out of one clip and the In of the next at the point where they meet.'
      ],
      tip: 'A transition is not a cut. If two clips sit end to end with no gap, a 0.5s fade will eat half a second of each — leave yourself the room.'
    },
    effects: {
      title: 'Effects',
      what: '36 looks you can put on a clip, from a gentle blur to ASCII.',
      steps: [
        'Select a clip on the timeline — the panel needs to know what it is changing.',
        'Drag an effect\'s slider up from 0. Every tile previews itself, so you can see what it does before you commit.',
        'Effects stack: blur and grain and a vignette all at once is fine.',
        'What you see in the preview is what is exported — these run in the same draw as the final video.'
      ],
      tip: 'The <b>Effects</b> tab on the right has the same list with proper sliders and section headings, which is easier once you know which effect you want.'
    },
    emojis: {
      title: 'Emojis',
      what: 'Hundreds of emoji, each one droppable onto the timeline as its own clip.',
      steps: [
        'Click an emoji to add it at the playhead.',
        'It arrives as a clip like any other — drag it along the timeline, or to another lane.',
        'Scale and place it with the <b>Transform</b> tab on the right.',
        'Trim its ends to control how long it is on screen.'
      ],
      tip: 'An emoji is a font glyph, so it stays sharp at any size. Scale it to fill the frame and it will not go blurry.'
    },
    stickers: {
      title: 'Stickers',
      what: 'Drawn art in eight sets — vehicles, animals, food, nature, space, sport, tech and shapes.',
      steps: [
        'Pick a set along the top, then click a sticker to drop it into the project.',
        'It lands as a clip, so it can be moved, trimmed and put on any lane.',
        'Place and size it in the <b>Transform</b> tab.',
        'Close the window with × when you are done — it is a window, not a panel.'
      ],
      tip: 'These are drawn in code rather than downloaded, so they cost nothing to load and work with no connection at all.'
    },
    photos: {
      title: 'Photos',
      what: 'Real photographs, from Wikipedia, free to use.',
      steps: [
        'Choose a category, or search for what you want.',
        'Click a photo to bring it into the project as a clip.',
        'The article it came from is saved with it, so you can credit it later.',
        'If nothing comes back, try one of the category buttons — the search is looking at real article images, not a stock library.'
      ],
      tip: 'This one fetches real photos, so it needs a connection. The stickers are drawn here and never do.'
    },
    audio: {
      title: 'Audio',
      what: 'Music, voiceover and the five audio effects.',
      steps: [
        '<b>Import Audio</b> for a file you have; <b>Record Voiceover</b> to speak into it now.',
        'Drag what you imported onto an <b>A</b> lane.',
        'Select the audio clip, then use <b>Volume</b>, <b>Fade In</b> and <b>Fade Out</b> in the Audio tab on the right.',
        'Noise Reduction, EQ, Reverb, Bass Boost and Compressor each open their own controls.'
      ],
      tip: 'Music under talking wants the music at about 0.2 — not 0.5. Fade it in over the first second and it stops sounding like it was switched on.'
    },
    memes: {
      title: 'Meme Search',
      what: 'Real meme templates and GIFs, by category or by search.',
      steps: [
        'Switch between <b>Meme Templates</b> and <b>GIF Search</b> at the top.',
        'Narrow it with a category — Reaction, Animals, Movies & TV, Music, Classic, Gaming, Sports.',
        'Click one to add it to the project.',
        'Put your own words on it with the <b>Text</b> panel rather than looking for a version that already has them.'
      ],
      tip: 'A GIF is a video clip once it is in here: it can be trimmed, slowed down and have effects on it like anything else.'
    },
    sfx: {
      title: 'Sound Effects',
      what: '69 real sound effects — recorded clips, nothing synthesised.',
      steps: [
        'Filter by set: Meme, Gaming, UI, Songs, Impact, Silly, Football, Phones, Drama, Hype.',
        'Click one to hear it, and again to place it at the playhead.',
        'It lands on an audio lane and can be dragged to the exact frame.',
        'Its length is printed on every row, so you can see whether it fits before you use it.'
      ],
      tip: 'Move the playhead to the frame you want it on <i>before</i> you click. That is the difference between a sound effect and a sound effect that lands.'
    },
    ai: {
      title: 'AI Tools',
      what: '24 tools that do a job on the timeline for you, grouped by what they touch.',
      steps: [
        'Pick the clip you want it to work on first — nearly all of these act on the selection.',
        '<b>Analysis</b>: Time the Captions lays empty caption cards on every phrase; Cut the Silence splits either side of each silent gap; Find the Scenes splits where the picture changes.',
        '<b>Audio</b>: Read It Aloud speaks a text clip; Change a Voice runs on this device.',
        '<b>Color</b> and <b>Video</b>: Auto Color Grade, Auto Brightness, Contrast Boost, Punch In and the rest each make one change you can undo.'
      ],
      tip: 'Every one of these is a normal edit once it has run, so Ctrl+Z undoes it. Try one, look, undo — that is cheaper than reading about it.'
    },
    voice: {
      title: 'Voice changer',
      what: 'Chipmunk, monster, robot, radio and more, on a clip that already has sound or on a line you record now.',
      steps: [
        'Pick a clip that has sound, or press <b>Record a line</b> and say it.',
        'Choose a voice and listen to the preview.',
        'Apply it — the changed sound goes back onto the timeline as a clip.',
        'The original is still in the media library, so nothing is lost.'
      ],
      tip: 'This runs on your own device. Nothing is uploaded, and your voice never leaves the browser.'
    },
    record: {
      title: 'Record yourself',
      what: 'Your camera, straight into the project.',
      steps: [
        'Allow the camera when the browser asks. Nothing records before that.',
        'Set <b>Light</b> and <b>Warmth</b> first — the screen itself is the lamp, and it comes up over the countdown so you are not squinting on the first frame.',
        '<b>Mirror</b> flips the preview for you only; it does not flip the recording.',
        'Press Record, and it arrives on the timeline when you stop.'
      ],
      tip: 'Face a window if there is one. No amount of screen light beats daylight, and the warmth slider is there to match it.'
    },

    /* ---- the inspector, on the right ---- */
    'insp-transform': {
      title: 'Transform',
      what: 'Where the selected clip sits in the frame, and what shape it is.',
      steps: [
        'Position, Scale, Width, Rotation and Opacity move and size the clip.',
        '<b>Anchor</b> is the point it rotates and scales around — move that before you fight with Position.',
        '<b>Crop & Shape</b> trims the edges and rounds the corners; <b>Skew & Perspective</b> tilts it.',
        '<b>Speed</b> holds Rate, Reverse and Freeze. <b>Chroma Key</b> is the green screen.'
      ],
      tip: 'Blend Mode is at the bottom and is the most underused control here: Screen puts a fire or smoke clip over your video with the black already gone.'
    },
    'insp-color': {
      title: 'Color',
      what: 'The look of the selected clip, from a quick fix to a full grade.',
      steps: [
        'Start with <b>Basic</b>: Brightness, Contrast, Saturation, Hue.',
        '<b>Exposure & Gamma</b> and <b>Tonal Range</b> are the finer controls — Highlights and Shadows before Whites and Blacks.',
        '<b>White Balance</b> fixes footage that is too blue or too orange. Temperature first, Tint second.',
        '<b>Color Curves</b>, <b>Color Wheels</b> and <b>Color LUT</b> open properly on their own.'
      ],
      tip: 'Fix the exposure before you touch saturation. Colour that looks flat is usually a brightness problem wearing a disguise.'
    },
    'insp-effects': {
      title: 'Effects tab',
      what: 'The same 36 effects as the rail panel, with sliders and section headings.',
      steps: [
        'Every effect starts at 0.00 and does nothing until you move it.',
        'Groups, in the order they are usually wanted: Blur & Focus, Light & Glow, Distortion, Glitch, Stylize, Special, Camera FX, Color FX.',
        'Several at once is fine and is how a look gets built — a little grain, a little vignette.',
        'Set it back to 0 to remove it; there is nothing else to undo.'
      ],
      tip: 'Shake and Zoom Punch are under Distortion, and they are timing effects rather than looks — they are what makes a cut land on the beat.'
    },
    'insp-audio': {
      title: 'Audio tab',
      what: 'Volume and effects for the selected clip\'s sound.',
      steps: [
        '<b>Volume</b> is a multiplier: 1.00 is untouched, 0.2 is background music under talking.',
        '<b>Fade In</b> and <b>Fade Out</b> are in seconds. Half a second removes almost every click at a cut.',
        'Noise Reduction, EQ, Reverb, Bass Boost and Compressor each open their own controls.',
        'It applies to this clip only, so two pieces of music can be balanced against each other.'
      ],
      tip: 'Noise Reduction here is a filter pair, not a denoise model — it cuts rumble and hiss, and it will not rescue a recording made next to a motorway.'
    },
    'insp-keyframes': {
      title: 'Keyframes',
      what: 'Anything that changes over the clip rather than staying still.',
      steps: [
        'Pick what to animate: Position X, Position Y, Scale, Rotation or Opacity.',
        'Move the playhead to where you want a value, set it, then press <b>Add Keyframe at Playhead</b>.',
        'Do that again further along. Two keyframes is a movement; one is just a value.',
        'Click on the graph to add one, and drag the points to change the timing.'
      ],
      tip: 'The presets — Linear, Ease In, Ease Out, Ease In Out, Bounce, Elastic — are the difference between a move that looks animated and one that looks like a slideshow. Ease In Out is almost always the right one.'
    },

    /* ---- the editor as a whole ---- */
    editor: {
      title: 'The editor',
      what: 'Cut, grade, mix and export a video in this tab, with nothing installed and nothing uploaded.',
      steps: [
        'Bring footage in from <b>Media</b> on the left, then drag it onto a lane.',
        'Cut and arrange on the timeline at the bottom; style the selected clip with the tabs on the right.',
        'The rail on the left is where things come from — text, transitions, effects, stickers, sound.',
        'Press <b>Export</b> when it is done. It is checked for heavy flashing and blank footage first, on your own machine.'
      ],
      tip: 'Ctrl+Z undoes, Ctrl+Shift+Z redoes, and the arrow keys nudge the selected clip along the timeline — Shift for a whole second.'
    },
    timeline: {
      title: 'The timeline',
      what: 'The lanes, the order of things, and more than one cut per project.',
      steps: [
        'Lanes stack: <b>V</b> lanes are picture (V2 draws over V1), <b>A</b> is sound, <b>T</b> is text.',
        'Drag a clip up or down to move it between lanes. A lane that cannot take it says so rather than swallowing it.',
        '<b>+ Video / + Audio / + Text</b> add another lane. <b>Snap</b> makes clip edges click to each other.',
        '<b>+ Timeline</b> starts a second cut of the same project — same media library, separate arrangement — and the tabs switch between them.'
      ],
      tip: 'The arrow keys move the selected clip in time, one frame at a time, or a whole second with Shift held. Up and down move it a lane.'
    },
    exportv: {
      title: 'Export',
      what: 'Turning the timeline into a file you can post.',
      steps: [
        'Press <b>Export</b> in the top bar.',
        'It checks the video for heavy flashing and for blank footage first — on your machine, nothing is sent anywhere.',
        'Pick the format, then let it run. It renders in this tab, so leave it open.',
        'The file is saved to your downloads like any other download.'
      ],
      tip: 'Everything you can see in the preview is in the export, effects and transitions included — they run in the same draw.'
    }
  };

  /* Which topic, from what is actually on screen. Read in this order because
     that is the order they cover each other up in. */
  /* Two of these are classes and two are ids, because four different files
     built them — so they are written as selectors rather than as ids, which
     is the mistake that made this detect nothing at all the first time. */
  var MODALS = [
    ['.nckit-veil', 'stickers'],
    ['.ncph-veil', 'photos'],
    ['#ncvc', 'voice'],
    ['#ncss', 'record']
  ];
  /* The heading each rail panel prints at its top. Matching on that rather
     than on the rail button's own highlight, because four of the rail buttons
     open a window and leave the highlight on whatever was open before. */
  var HEADINGS = [
    ['media library', 'media'], ['meme search', 'memes'], ['sound effects', 'sfx'],
    ['ai tools', 'ai'], ['transitions', 'transitions'], ['effects', 'effects'],
    ['emojis', 'emojis'], ['audio', 'audio'], ['text', 'text']
  ];

  function vis(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && getComputedStyle(el).visibility !== 'hidden';
  }

  /* The bundle's own column, found by where it is rather than by a class name
     the next build might rename. */
  /* Both columns are found by walking every div on the page, and this file is
     woken by a MutationObserver on an editor that mutates on every frame of
     playback. So the answer is kept for a second, and thrown away the moment
     the element it names has left the page or been collapsed to nothing. A
     scan per frame is how an add-on makes a video editor stutter. */
  var colCache = { l: null, r: null, at: 0 };
  function stillGood(el) {
    if (!el || !el.isConnected) return null;
    var r = el.getBoundingClientRect();
    return (r.width > 60 && r.height > 60) ? el : null;
  }

  function leftCol() {
    var now = Date.now();
    if (now - colCache.at < 1000) {
      var keep = stillGood(colCache.l);
      if (keep) return keep;
    }
    colCache.at = now;
    colCache.l = findLeftCol();
    return colCache.l;
  }

  function findLeftCol() {
    var all = document.querySelectorAll('div');
    for (var i = 0; i < all.length; i++) {
      /* An exact class match, and no upper bound on the width. On a narrow
         screen the editor gives this column everything the rail does not
         use — 754px on a tablet — and a "must be under 470 wide" rule left
         the help button off that layout entirely, which is the layout where
         somebody is most likely to need it. */
      if ((all[i].className || '').trim() !== 'flex h-full flex-col') continue;
      var r = all[i].getBoundingClientRect();
      if (r.left > 55 && r.left < 140 && r.width > 170 && r.height > 240) return all[i];
    }
    return null;
  }
  function rightCol() {
    var now = Date.now();
    if (now - colCache.at < 1000) {
      var keep = stillGood(colCache.r);
      if (keep) return keep;
    }
    colCache.r = findRightCol();
    return colCache.r;
  }

  function findRightCol() {
    var tab = null, btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || '').trim() === 'Transform' &&
          btns[i].getBoundingClientRect().left > innerWidth - 470) { tab = btns[i]; break; }
    }
    if (!tab) return null;
    var n = tab.parentElement;
    while (n && n !== document.body) {
      var r = n.getBoundingClientRect();
      if (r.width > 190 && r.height > 280) return n;
      n = n.parentElement;
    }
    return null;
  }

  function modalEl() {
    for (var i = 0; i < MODALS.length; i++) {
      var el = document.querySelector(MODALS[i][0]);
      if (el && vis(el)) return { el: el, id: MODALS[i][1] };
    }
    return null;
  }
  function openModal() { var m = modalEl(); return m ? m.id : ''; }

  function panelTopic() {
    var col = leftCol();
    if (!col) return 'editor';
    var head = (col.innerText || '').split('\n')[0].trim().toLowerCase();
    for (var i = 0; i < HEADINGS.length; i++) if (head.indexOf(HEADINGS[i][0]) === 0) return HEADINGS[i][1];
    return 'editor';
  }

  function inspTopic() {
    var names = ['Transform', 'Color', 'Effects', 'Audio', 'Keyframes'];
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim();
      if (names.indexOf(t) < 0) continue;
      if (btns[i].getBoundingClientRect().left < innerWidth - 470) continue;
      /* The open tab carries bg-brand-500/15. Every closed tab carries
         hover:bg-ink-700/60, so a plain search for "bg-" matches all five and
         the answer is always whichever came first — which is exactly what it
         did until this line insisted on the start of a class name. */
      if (/(^|\s)bg-brand-/.test(btns[i].className || '')) return 'insp-' + t.toLowerCase();
    }
    return 'insp-transform';
  }

  /* --------------------------------------------------------------------- */
  var CSS =
    '.nchlp-btn{position:fixed;z-index:100002;display:flex;align-items:center;gap:6px;' +
      'padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.16);' +
      'background:rgba(124,92,255,.92);color:#fff;font:600 12px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
      'cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.35);transition:transform .15s,background .15s}' +
    '.nchlp-btn:hover{transform:translateY(-1px);background:rgba(139,110,255,1)}' +
    '.nchlp-btn b{font-size:13px}' +
    '.nchlp-card{position:fixed;z-index:100003;width:min(370px,94vw);max-height:min(74vh,620px);' +
      'display:flex;flex-direction:column;border-radius:16px;overflow:hidden;' +
      'background:#11162a;color:#e8edf8;border:1px solid rgba(255,255,255,.14);' +
      'box-shadow:0 26px 60px rgba(0,0,0,.55);font:400 13px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
      'unicode-bidi:plaintext}' +
    '.nchlp-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1);' +
      'background:linear-gradient(120deg,rgba(167,139,250,.22),rgba(56,189,248,.14))}' +
    '.nchlp-head h4{margin:0;font:700 14px/1.3 inherit;flex:1}' +
    '.nchlp-x{border:0;background:transparent;color:#9aa8c3;font-size:19px;line-height:1;cursor:pointer;padding:2px 4px}' +
    '.nchlp-x:hover{color:#fff}' +
    '.nchlp-body{padding:12px 14px;overflow:auto;flex:1}' +
    '.nchlp-what{margin:0 0 10px;color:#c6d0e6}' +
    '.nchlp-steps{margin:0;padding-left:18px}' +
    '.nchlp-steps li{margin:0 0 7px}' +
    '.nchlp-steps b{color:#fff}' +
    '.nchlp-tip{margin:11px 0 0;padding:9px 11px;border-radius:10px;background:rgba(56,189,248,.1);' +
      'border:1px solid rgba(56,189,248,.22);color:#cfe6f7}' +
    '.nchlp-tip s{display:block;text-decoration:none;font-weight:700;color:#7dd3fc;font-size:11px;' +
      'letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}' +
    '.nchlp-ask{padding:10px 14px 12px;border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.18)}' +
    '.nchlp-explain{width:100%;margin-bottom:8px;padding:10px 12px;border-radius:11px;cursor:pointer;' +
      'border:1px solid rgba(56,189,248,.4);background:rgba(56,189,248,.14);color:#dff1ff;' +
      'font:700 12.5px/1.3 inherit;text-align:left}' +
    '.nchlp-explain:hover{background:rgba(56,189,248,.26);color:#fff}' +
    '.nchlp-explain:before{content:"\\1F50D  "}' +
    '.nchlp-explain[disabled]{opacity:.6;cursor:default}' +
    '.nchlp-row{display:flex;gap:7px}' +
    '.nchlp-row input{flex:1;min-width:0;padding:8px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.16);' +
      'background:rgba(255,255,255,.06);color:#e8edf8;font:inherit}' +
    '.nchlp-row input::placeholder{color:#7f8db0}' +
    '.nchlp-row button{padding:8px 13px;border-radius:9px;border:0;background:#7c5cff;color:#fff;' +
      'font:600 13px/1 inherit;cursor:pointer}' +
    '.nchlp-row button[disabled]{opacity:.55;cursor:default}' +
    '.nchlp-ans{margin-top:9px;white-space:pre-wrap;color:#dbe4f7;unicode-bidi:plaintext}' +
    '.nchlp-ans.bad{color:#fca5a5}' +
    '.nchlp-more{margin-top:9px;display:flex;flex-wrap:wrap;gap:5px}' +
    '.nchlp-more button{padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.14);' +
      'background:rgba(255,255,255,.05);color:#b9c6e0;font:500 11px/1.4 inherit;cursor:pointer}' +
    '.nchlp-more button:hover{color:#fff;border-color:rgba(255,255,255,.3)}' +
    '@media (max-width:700px){.nchlp-card{left:3vw!important;right:3vw;width:94vw;bottom:74px!important;top:auto!important}}' +
    /* Once, ever, on a first visit: the button says hello rather than the card
       opening itself. The editor already greets a newcomer with a tour and the
       Ask Nova box, and a third thing to close is not help. */
    '@keyframes nchlp-pulse{0%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 0 rgba(124,92,255,.55)}' +
      '70%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 14px rgba(124,92,255,0)}' +
      '100%{box-shadow:0 8px 22px rgba(0,0,0,.35),0 0 0 0 rgba(124,92,255,0)}}' +
    '.nchlp-btn.nchlp-new{animation:nchlp-pulse 1.9s ease-out 4}' +
    '@media (prefers-reduced-motion:reduce){.nchlp-btn.nchlp-new{animation:none}}';

  function css() {
    if (document.getElementById('nchlp-css')) return;
    var s = document.createElement('style');
    s.id = 'nchlp-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------------
     TRANSLATION, ONCE, AND ONLY IF IT IS NEEDED

     Kept per language and per topic. The model is asked for JSON with the same
     shape it was given, and anything that comes back the wrong shape is
     dropped rather than half-applied — a card in two languages at once is
     worse than a card in one.
     ---------------------------------------------------------------------- */
  function langNow() { try { return (typeof lang === 'function' ? lang() : 'en') || 'en'; } catch (e) { return 'en'; } }
  function langName(code) {
    try { if (typeof LANGS === 'object' && LANGS[code]) return LANGS[code]; } catch (e) {}
    return 'English';
  }
  function txKey() { return 'nc_help_tx_' + langNow(); }
  function txRead() {
    try { return JSON.parse(localStorage.getItem(txKey()) || '{}') || {}; } catch (e) { return {}; }
  }
  function txWrite(map) { try { localStorage.setItem(txKey(), JSON.stringify(map)); } catch (e) {} }

  /* One at a time, and only the card that is actually open.

     The first version of this translated every topic the moment a card was
     drawn, because the chips at the bottom asked for their own titles — one
     tap, twenty-one requests, on a site whose shared AI runs out of quota by
     four in the afternoon. The chips read the cache and nothing else now
     (see label), and a second translation never starts while one is running. */
  var txBusy = {}, txNow = false;
  function translate(id, then) {
    var code = langNow();
    if (code === 'en' || txNow || txBusy[code + id] || typeof window.ncAsk !== 'function') return;
    txBusy[code + id] = true;
    txNow = true;
    var done = function () { txNow = false; };
    var t = TOPICS[id];
    var payload = { title: t.title, what: t.what, steps: t.steps, tip: t.tip };
    window.ncAsk(
      'Translate this help card for a video editor into ' + langName(code) + '.\n' +
      'Keep the HTML tags exactly where they are. Keep it plain and short, the way it is written here.\n' +
      'Do not translate the names of buttons that appear in the editor in English — leave those in English ' +
      'inside <b> tags so they can still be found on screen.\n' +
      'Answer with JSON in exactly this shape and nothing else:\n' +
      '{"title":"","what":"","steps":["",""],"tip":""}\n\n' + JSON.stringify(payload),
      { maxTokens: 900, temperature: 0.2 }
    ).then(function (r) {
      txBusy[code + id] = false; done();
      if (!r || r.err) return;
      var j = (typeof window.ncJSON === 'function') ? window.ncJSON(r.text) : null;
      if (!j || !j.steps || !j.steps.length || j.steps.length !== t.steps.length) return;
      var all = txRead();
      all[id] = { title: j.title || t.title, what: j.what || t.what, steps: j.steps, tip: j.tip || t.tip };
      txWrite(all);
      if (then) then();
    }, function () { txBusy[code + id] = false; done(); });
  }

  /* A topic's title for a chip: whatever has already been translated, and the
     English one otherwise. It never asks for a translation — a label is not
     worth a request. */
  function label(id) {
    var have = langNow() === 'en' ? null : txRead()[id];
    return (have && have.title) || TOPICS[id].title;
  }

  /* The topic as it should be shown: translated if we have it, English if not,
     and a translation started in the background when it is missing. */
  function shown(id, redraw) {
    var t = TOPICS[id];
    if (langNow() === 'en') return t;
    var have = txRead()[id];
    if (have) return have;
    translate(id, redraw);
    return t;
  }

  /* --------------------------------------------------------------------- */
  var card = null, btnL = null, btnR = null, openId = '', openSide = 'left';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* The steps are ours and contain <b> and <i> on purpose, so they are not
     escaped — but an AI answer is not ours and always is. */
  function html(s) { return String(s == null ? '' : s); }

  /* What the project looks like right now, in one line, so an answer can be
     about this edit rather than about editing. */
  function state() {
    try {
      var st = window.__ncStore && window.__ncStore.getState();
      if (!st) return '';
      var sel = null;
      for (var i = 0; i < st.clips.length; i++) if (st.clips[i].id === st.selectedClipId) sel = st.clips[i];
      return 'Their project right now: ' + st.clips.length + ' clip(s) on ' + st.tracks.length + ' lane(s) (' +
        st.tracks.map(function (t) { return t.name; }).join(', ') + '). ' +
        (sel ? 'Selected: "' + sel.name + '", ' + (sel.duration || 0).toFixed(1) + 's long.' : 'Nothing is selected.');
    } catch (e) { return ''; }
  }

  /* What the panel actually says right now, read off the screen. nova-help.js
     owns the reader — it skips the site's chrome and refuses to read a
     password or key box — and it is loaded on this page too, so there is no
     second copy of that logic here. Without it an answer can only describe the
     panel in general; with it, it can name the slider that is already at 0.40
     and the clip that is already selected. */
  function screenText(n) {
    try { return (window.NC_HELP && window.NC_HELP.read) ? window.NC_HELP.read(n || 2000) : ''; }
    catch (e) { return ''; }
  }

  function ask(id, q, out, btn, mode) {
    var t = TOPICS[id];
    out.className = 'nchlp-ans';
    out.textContent = mode === 'explain' ? 'Reading the panel…' : 'Thinking…';
    btn.disabled = true;
    var seen = screenText(mode === 'explain' ? 2600 : 1900);
    var prompt =
      'You are the help assistant inside NovaClip, a video editor that runs in a browser tab. ' +
      'A teenager is using it and is on the "' + t.title + '" panel.\n' +
      'What that panel is: ' + t.what + '\n' +
      'What it can do:\n- ' + t.steps.map(function (s) { return s.replace(/<[^>]+>/g, ''); }).join('\n- ') + '\n' +
      state() + '\n' +
      (seen ? '\nTHIS IS WHAT IS ON THEIR SCREEN RIGHT NOW, read off the page. ## is a heading, ' +
              '[button] is a button, [field] is a box with its current value:\n<<<\n' + seen + '\n>>>\n' : '') +
      (mode === 'explain'
        ? '\nExplain this panel to them in at most 90 words, in ' + langName(langNow()) + '. Say what it is for, ' +
          'then name the two or three things worth doing first, using the exact names above. If something is ' +
          'already set or selected, say what that means. Talk to them directly. No greeting, no headings, no markdown.'
        : '\nThey asked: "' + q + '"\n\n' +
          'Answer in at most 70 words, in ' + langName(langNow()) + '. Tell them which buttons to press, in order, ' +
          'using the names above. If this editor cannot do what they asked, say so in one sentence and say what it ' +
          'can do instead. No greeting, no headings, no markdown.');
    window.ncAsk(prompt, { maxTokens: mode === 'explain' ? 500 : 400, temperature: 0.4 }).then(function (r) {
      btn.disabled = false;
      if (!r || r.err) {
        out.className = 'nchlp-ans bad';
        out.textContent = (r && r.err) || 'The AI could not be reached. The steps above still work.';
        return;
      }
      out.className = 'nchlp-ans';
      out.textContent = (r.text || '').trim() || 'Nothing came back that time. Try asking it differently.';
    }, function () {
      btn.disabled = false;
      out.className = 'nchlp-ans bad';
      out.textContent = 'The AI could not be reached. The steps above still work.';
    });
  }

  /* Every other topic, as chips, so no panel's help is more than one tap away
     even when the wrong one was guessed. */
  var ORDER = ['editor', 'timeline', 'media', 'text', 'transitions', 'effects', 'emojis', 'stickers',
               'photos', 'audio', 'memes', 'sfx', 'ai', 'voice', 'record',
               'insp-transform', 'insp-color', 'insp-effects', 'insp-audio', 'insp-keyframes', 'exportv'];

  function draw(id) {
    if (!card) return;
    var t = shown(id, function () { if (openId === id) draw(id); });
    card.innerHTML =
      '<div class="nchlp-head"><h4></h4><button class="nchlp-x" aria-label="Close">×</button></div>' +
      '<div class="nchlp-body">' +
        '<p class="nchlp-what"></p>' +
        '<ol class="nchlp-steps"></ol>' +
        '<p class="nchlp-tip"><s>The bit people miss</s><span></span></p>' +
        '<div class="nchlp-more"></div>' +
      '</div>' +
      '<div class="nchlp-ask">' +
        '<button type="button" class="nchlp-explain">Explain what is on this panel</button>' +
        '<div class="nchlp-row"><input type="text"><button>Ask</button></div>' +
        '<div class="nchlp-ans"></div>' +
      '</div>';
    card.querySelector('h4').textContent = t.title;
    card.querySelector('.nchlp-what').textContent = t.what;
    var ol = card.querySelector('.nchlp-steps');
    (t.steps || []).forEach(function (s) {
      var li = document.createElement('li');
      li.innerHTML = html(s);
      ol.appendChild(li);
    });
    card.querySelector('.nchlp-tip span').innerHTML = html(t.tip || '');
    var more = card.querySelector('.nchlp-more');
    ORDER.forEach(function (o) {
      if (o === id || !TOPICS[o]) return;
      var b = document.createElement('button');
      b.textContent = label(o);
      b.onclick = function () { openId = o; draw(o); };
      more.appendChild(b);
    });
    card.querySelector('.nchlp-x').onclick = close;
    var input = card.querySelector('input'), go = card.querySelector('.nchlp-row button'),
        out = card.querySelector('.nchlp-ans'), exp = card.querySelector('.nchlp-explain');
    exp.onclick = function () { input.value = ''; ask(id, '', out, exp, 'explain'); };
    input.placeholder = 'Ask about this panel…';
    go.onclick = function () {
      var q = input.value.trim();
      if (!q) { input.focus(); return; }
      ask(id, q, out, go);
    };
    input.onkeydown = function (e) { if (e.key === 'Enter') go.onclick(); };
    place();
  }

  function open(side) {
    css();
    openSide = side;
    var id = side === 'right' ? inspTopic() : (openModal() || panelTopic());
    openId = id;
    if (!card) {
      card = document.createElement('div');
      card.className = 'nchlp-card';
      document.body.appendChild(card);
    }
    card.style.display = 'flex';
    draw(id);
  }
  function close() { if (card) card.style.display = 'none'; openId = ''; }

  /* Measured, not injected. Both buttons sit at the bottom of their column;
     when one of the rail's windows is open the left button moves onto it,
     because that window is the panel you are standing in. */
  function place() {
    /* No pills any more, so there is nothing to glue to a column — but the
       card still has to land somewhere sensible when __ncHelp.open() puts it
       up. Bottom right, where every other floating thing on this site lives. */
    if (!btnL) {
      if (card && card.style.display !== 'none') {
        card.style.left = '';
        card.style.right = '15px';
        card.style.top = '';
        card.style.bottom = '66px';
      }
      return;
    }
    var m = modalEl(), modal = m ? m.id : '', col = null, r = null;

    if (modal) {
      /* the card inside the veil, if it has one, so the button lands on the
         window rather than in a corner of the screen */
      var inner = m.el.firstElementChild && m.el.firstElementChild.getBoundingClientRect();
      r = (inner && inner.width > 200) ? inner : m.el.getBoundingClientRect();
    } else {
      col = leftCol();
      r = col && col.getBoundingClientRect();
    }
    if (r && r.width > 60) {
      btnL.style.display = 'flex';
      btnL.style.left = Math.round(r.left + 10) + 'px';
      btnL.style.top = Math.round(Math.min(r.bottom - 42, innerHeight - 48)) + 'px';
    } else {
      btnL.style.display = 'none';
    }

    var rc = rightCol(), rr = rc && rc.getBoundingClientRect();
    if (btnR) {
      if (rr && rr.width > 60 && !modal) {
        btnR.style.display = 'flex';
        /* Bottom LEFT of the inspector, not bottom right: the right-hand edge
           of that column is where every Open button and every value sits, and
           a floating button that covers a control is worse than no button. */
        btnR.style.left = Math.round(rr.left + 10) + 'px';
        btnR.style.top = Math.round(Math.min(rr.bottom - 42, innerHeight - 48)) + 'px';
      } else {
        btnR.style.display = 'none';
      }
    }

    if (card && card.style.display !== 'none') {
      var anchor = (openSide === 'right' && rr) ? rr : r;
      if (anchor) {
        var w = Math.min(370, innerWidth * 0.94);
        var left = openSide === 'right' ? Math.min(anchor.right - w, innerWidth - w - 8)
                                        : Math.max(8, anchor.left);
        card.style.left = Math.round(Math.max(8, left)) + 'px';
        card.style.top = '';
        card.style.bottom = Math.round(Math.max(56, innerHeight - Math.min(anchor.bottom, innerHeight) + 52)) + 'px';
      }
    }
  }

  function button(label, side) {
    var b = document.createElement('button');
    b.className = 'nchlp-btn';
    b.innerHTML = '<b>?</b><span></span>';
    b.querySelector('span').textContent = label;
    b.title = 'How do I use this?';
    b.onclick = function (e) {
      e.preventDefault(); e.stopPropagation();
      var want = side === 'right' ? inspTopic() : (openModal() || panelTopic());
      /* Pressing it again closes it — but only when it is already showing the
         panel you are standing in. Reading about the Color tab and then
         pressing the button on the Keyframes tab means "tell me about
         Keyframes", not "go away". */
      var live = card && card.style.display !== 'none';
      if (live && openSide === side && openId === want) { close(); return; }
      open(side);
    };
    document.body.appendChild(b);
    return b;
  }

  /* THE TWO "How?" PILLS ARE GONE, AND THIS FILE STILL MATTERS.

     They sat at the bottom of the two columns, and with the Help pill and the
     bar's "?" both answering per panel as well, the editor had three help
     buttons in one screen — one of them twice. Three buttons for one job is
     not three times the help; it is a screen nobody can read.

     What this file knows did not stop being true, so none of it is deleted.
     TOPICS is still the twenty-two panel walkthroughs, now() still works out
     which panel, window and inspector tab is open, and state() still reports
     the timeline. nova-help.js reads all three: that is where "Emojis, in the
     video editor" comes from, and the walkthrough Nova lands for it.

     The card below is still built and still correct — __ncHelp.open() opens it
     — it simply has no button of its own any more.

     What boot() is still for: the panel-switch watcher, so a card that is open
     follows the panel, and Escape to close. Nothing is measured or positioned
     now, so the resize, scroll and mutation work that used to keep two
     floating pills glued to two moving columns is gone with them. */
  function boot() {
    css();
    setInterval(function () {
      if (!openId || openSide === 'right' || !card || card.style.display === 'none') return;
      var now = openModal() || panelTopic();
      if (now !== openId && TOPICS[now]) { openId = now; draw(now); }
    }, 900);
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && card && card.style.display !== 'none') close();
    });
  }

  /* The bundle has to have drawn its columns before any of this can be
     measured. Same wait the other editor add-ons use. */
  (function wait(n) {
    if (document.body && leftCol()) { boot(); return; }
    if ((n || 0) < 80) setTimeout(function () { wait((n || 0) + 1); }, 150);
    else if (document.body) boot();   /* still useful: the chips reach every topic */
  })(0);

  window.__ncHelp = {
    open: function (id) {
      css();
      if (!card) { card = document.createElement('div'); card.className = 'nchlp-card'; document.body.appendChild(card); }
      card.style.display = 'flex';
      openId = TOPICS[id] ? id : panelTopic();
      draw(openId);
    },
    close: close,
    topics: TOPICS,
    now: function () { return openModal() || panelTopic(); },
    /* The timeline as one sentence. nova-help.js puts it in the prompt, so an
       answer can say "the clip you have selected" rather than "a clip". */
    state: state
  };
})();
