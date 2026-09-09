/* WHAT KIND OF THING ARE YOU MAKING?
 * ==================================
 * One question, asked once, on the first visit — and answerable again at any
 * time from Categories in the rail.
 *
 * WHY THIS FILE EXISTS AT ALL RATHER THAN A LIST IN TWO PLACES
 *
 * The same categories are needed by the first-run dialog and by the page that
 * lets somebody change their mind. Two copies of a list like that drift: one
 * gains an option, the other does not, and the page that lets you change your
 * answer stops offering the answer you were given. So the list, the storage
 * key and the read/write are here, and both callers use them.
 *
 * WHAT IT IS FOR
 *
 * The Trend Spotter, the idea generator and the AI tutors all answer better
 * when they know what the channel is about. Until now every one of them asked
 * separately or guessed. This is asked once and shared.
 *
 * THE WRITE-YOUR-OWN BOX IS NOT A COURTESY
 *
 * A fixed list of nine cannot describe what a teenager is making. "Warhammer
 * painting", "Moroccan cooking", "speedcubing" are all real answers and none
 * of them is on any list anybody would write. So the box takes anything, and
 * what is typed is stored exactly as typed rather than mapped onto the nearest
 * preset — the whole point is that the nearest preset was wrong.
 *
 * NOTHING IS SENT ANYWHERE. It is one string in localStorage on this device.
 */
(function () {
  'use strict';
  if (window.NC_CATEGORY) return;

  var KEY = 'nc_category';

  /* Nine, chosen to cover most of what this audience actually posts, and
     deliberately broad — a category is a hint, not a filing system.

     WHAT THE EXTRA FIELDS ARE FOR

     `hint` is the line under the name in the picker. The other three are what
     make the answer worth asking for, rather than a preference stored and
     never read again:

       chips  three shortcuts on the Ask card, so the first thing offered to
              somebody who makes cooking videos is not "edit a gameplay clip"
       seed   the query Trend Spotter starts on, so an empty search box is not
              the first thing a creator meets on the page that is supposed to
              tell them what to make
       vibe   two colours the whole site is then lit with, so choosing is
              something you can SEE happen rather than a setting you have to
              take on trust

     A written-in category has no chips and no seed of its own, and that is
     deliberate: inventing shortcuts for "speedcubing" from a table would mean
     guessing, and a wrong shortcut is worse than a general one. It does get
     colours — see vibeOf() — because the one answer that no list could hold is
     the last one that should look like the site ignored it. */
  var PRESETS = [
    /* THE WAY OUT, AND IT IS FIRST BECAUSE IT IS AN ANSWER LIKE THE OTHERS.
       Everything below repaints the site — its background, its colours, the
       shortcuts on the Ask card. Some people will not want that, and until now
       the only way to refuse was to skip the question and be treated as
       somebody who never answered it. Classic is a real choice with a real
       consequence: the site stays exactly as it was designed, and the AI still
       gets told nothing about a channel it knows nothing about.

       `neutral` is what the rest of this file checks. It has no vibe, so
       vibeOf() returns null and the whole background layer stands down. */
    { id: 'classic',   label: 'Classic',             hint: 'The plain NovaClip look, no theme',
      neutral: true,
      chips: [['editor', 'Edit a video'], ['trends', 'Find an idea'], ['games', 'Play something']] },
    { id: 'gaming',    label: 'Gaming',              hint: 'Clips, reviews, let’s plays',
      seed: 'gaming',
      chips: [['editor', 'Edit a gameplay clip'], ['trends', 'What is trending'], ['hype', 'Find the boring bit']],
      vibe: ['#7C5CFF', '#00E5FF'],
      tools: ['sz-youtube-thumbnail', 'chapters', 'soundboard', 'img-compress'] },
    { id: 'music',     label: 'Music',               hint: 'Covers, production, performance',
      seed: 'music covers and production',
      chips: [['editor', 'Cut a music video'], ['trends', 'Trending sounds'], ['ai', 'Write my description']],
      vibe: ['#FF2E97', '#A855F7'],
      tools: ['soundboard', 'lim-youtube-description', 'tx-hashtag-extractor', 'sz-instagram-square-post'] },
    { id: 'sport',     label: 'Sport',               hint: 'Highlights, training, football',
      seed: 'sport highlights',
      chips: [['editor', 'Cut a highlight'], ['trends', 'Trending in sport'], ['hype', 'Find the flat seconds']],
      vibe: ['#22C55E', '#A3E635'],
      tools: ['chapters', 'sz-youtube-thumbnail', 'calc-engagement-rate-by-reach', 'img-resize'] },
    { id: 'irl',       label: 'Vlogs and everyday',  hint: 'Days, trips, life',
      seed: 'day in the life vlogs',
      chips: [['editor', 'Edit a vlog'], ['trends', 'Vlog ideas'], ['aiedit', 'Get it ready to post']],
      vibe: ['#FB923C', '#FB7185'],
      tools: ['sz-instagram-story', 'cleanup', 'chapters', 'lim-instagram-caption'] },
    { id: 'learning',  label: 'Learning and school', hint: 'Revision, explainers, study',
      seed: 'study and revision explainers',
      chips: [['ai', 'Ask a tutor'], ['trends', 'Explainer ideas'], ['editor', 'Edit a study video']],
      vibe: ['#3B82F6', '#22D3EE'],
      tools: ['word-counter', 'markdown', 'text-cleaner', 'chapters'] },
    { id: 'art',       label: 'Art and making',      hint: 'Drawing, crafts, builds',
      seed: 'art and craft process videos',
      chips: [['photo', 'Edit a photo of my work'], ['editor', 'Edit a process video'], ['trends', 'Art trends']],
      vibe: ['#F97316', '#EC4899'],
      tools: ['draw', 'animate-drawing', 'palette', 'cleanup'] },
    { id: 'food',      label: 'Food',                hint: 'Cooking, baking, eating',
      seed: 'cooking and baking',
      chips: [['editor', 'Edit a recipe video'], ['photo', 'Edit a food photo'], ['trends', 'Food trends']],
      vibe: ['#F59E0B', '#EF4444'],
      tools: ['sz-instagram-square-post', 'img-resize', 'lim-instagram-caption', 'palette'] },
    { id: 'comedy',    label: 'Comedy and sketches', hint: 'Bits, skits, edits',
      seed: 'comedy sketches and skits',
      chips: [['editor', 'Cut a sketch'], ['hype', 'Find the dead air'], ['trends', 'Comedy trends']],
      vibe: ['#FACC15', '#FF4D9D'],
      tools: ['tx-thread-splitter', 'soundboard', 'sz-tiktok-video-cover', 'chapters'] },
    { id: 'tech',      label: 'Tech',                hint: 'Phones, PCs, coding',
      seed: 'phones, PCs and coding',
      chips: [['editor', 'Edit a review'], ['trends', 'Tech trends'], ['ai', 'Write a spec rundown']],
      vibe: ['#06B6D4', '#6366F1'],
      tools: ['json-formatter', 'regex', 'base64', 'markdown'] }
  ];

  /* THE TOOLS EACH CATEGORY IS OFFERED FIRST.
     NovaTools has 54 hand-built tools and about ten thousand generated ones,
     and the same four sat at the top of that list for everybody. Somebody who
     draws was scrolling past a JSON formatter to find the drawing board.

     Four each, chosen for what that person actually opens rather than for what
     is nearest in the catalogue — Art gets the drawing board and the animator
     it feeds, Tech gets the developer set, Learning gets the writing ones.
     Classic has none on purpose: it is the answer that means "leave the site
     as it is", and reordering the tools page would be doing something with it.

     Every id here is a real tool in tools.html. tools.html drops any it cannot
     find rather than drawing a card that opens nothing, so a typo costs a
     shortcut rather than a broken page. */
  /* The three offered when there is no category, or when the answer was
     written in and there is nothing to look up. The general case, said
     generally. */
  var DEFAULT_CHIPS = [['editor', 'Edit a video'], ['trends', 'Find an idea'], ['games', 'Play something']];

  function get() {
    try {
      var v = localStorage.getItem(KEY);
      return v ? String(v) : '';
    } catch (e) { return ''; }
  }
  function set(v) {
    v = String(v || '').replace(/[\x00-\x1f]/g, '').trim().slice(0, 40);
    if (!v) return false;
    try { localStorage.setItem(KEY, v); } catch (e) { return false; }
    /* Anything already on screen that reads the category can redraw itself. */
    try { window.dispatchEvent(new CustomEvent('nc-category', { detail: v })); } catch (e) {}
    return true;
  }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* "Never chosen" is not the same as "chose nothing". Somebody who has been
     asked and skipped should not be asked again on every visit, so the skip is
     recorded separately from the answer. */
  function asked() {
    try { return !!localStorage.getItem(KEY) || localStorage.getItem(KEY + '_asked') === '1'; }
    catch (e) { return true; }          /* no storage: never nag */
  }
  function markAsked() { try { localStorage.setItem(KEY + '_asked', '1'); } catch (e) {} }

  /* The label to show for a stored value: a preset's proper name, or whatever
     they typed, back exactly as they typed it. */
  function labelOf(v) {
    v = v || get();
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === v) return PRESETS[i].label;
    return v;
  }

  /* The preset record behind a stored value, or null for a written-in one. */
  function presetOf(v) {
    v = v || get();
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === v) return PRESETS[i];
    return null;
  }

  /* =====================================================================
     WHAT THE ANSWER ACTUALLY CHANGES
     =====================================================================
     A category nobody reads is a question that wasted somebody's time. These
     three are every place it is read from.
     ===================================================================== */

  /* ONE SENTENCE FOR THE MODEL, and the reason this is worth storing at all.
     Every AI feature on this site was either asking separately what the
     channel is about or guessing — the tutors, the trend scan, the idea
     generator, the title and description writer. They all append this now,
     the same way they already append langInstruction().

     Deliberately short and deliberately a HINT rather than a rule. "Tailor" and
     not "only" matters: somebody whose category is Gaming still gets a real
     answer when they ask about a school project, and a prompt that said "only
     answer about gaming" would refuse them. It also has to survive being glued
     onto prompts that demand strict JSON, which is why it states a fact about
     the reader and issues no formatting instruction of its own.

     Empty when nothing is set, so a prompt is never padded with a sentence
     that says nothing. */
  function aiNote() {
    var v = get();
    if (!v) return '';
    /* Classic is "no category", said deliberately rather than by not
       answering. Telling a model the creator makes Classic content would be
       telling it something untrue. */
    var p = presetOf(v);
    if (p && p.neutral) return '';
    return ' The creator makes ' + labelOf(v) + ' content; tailor examples, ' +
           'topics and references to that where it fits. ';
  }

  /* The Ask card's three shortcuts. Always three, always real destinations —
     the ids are nova-ask.js's own, so a typo here is a chip that does nothing
     rather than a chip that goes somewhere wrong. */
  function chips() {
    var p = presetOf();
    return (p && p.chips) ? p.chips : DEFAULT_CHIPS;
  }

  /* The four tool ids to put at the top of NovaTools, or [] for a category
     with none — Classic, and anything written in. */
  function tools() {
    var p = presetOf();
    return (p && p.tools) ? p.tools : [];
  }

  /* THE COLOURS THE SITE WEARS FOR THIS CATEGORY.
     Two of them, used as a pair of soft washes behind everything — see
     ncCategoryVibe() in nova.js for how they are painted. Chosen so that each
     one reads as a different room without any of them stopping white text
     being readable on the dark base or dark text on the light one, which is
     why they are all mid-saturation rather than neon.

     A WRITTEN-IN CATEGORY GETS ITS OWN COLOURS TOO, and this is the part
     worth explaining. Falling back to the default violet would mean the nine
     presets change the site and everybody else's answer does nothing — the
     written-in box is the one that takes the answers no list could hold, so it
     is the last place to be treated as a lesser answer. The hue comes from a
     hash of the string, so "Warhammer painting" is the same green every time,
     on every device, with no table to maintain. Saturation and lightness are
     fixed at values that are known to work on both themes; only the hue moves,
     and the second colour sits 40 degrees around the wheel from the first so
     the pair always has a relationship rather than being two random colours. */
  function hueOf(str) {
    var h = 0, i;
    for (i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }
  function vibeOf(v) {
    v = v || get();
    if (!v) return null;
    var p = presetOf(v);
    /* Classic. No colours means no tint, no scene and no photograph — every
       one of those reads this and stands down when it comes back null. */
    if (p && p.neutral) return null;
    if (p && p.vibe) return p.vibe;
    var h = hueOf(String(v).toLowerCase());
    return ['hsl(' + h + ' 72% 58%)', 'hsl(' + ((h + 40) % 360) + ' 78% 62%)'];
  }

  /* What Trend Spotter should start on. A written-in category is used as
     typed: "Warhammer painting" is a better search than anything a nine-row
     table could have mapped it to. */
  function seed() {
    var v = get();
    if (!v) return '';
    var p = presetOf(v);
    if (p && p.neutral) return '';       /* nothing to seed a search with */
    return p ? p.seed : v;
  }

  window.NC_CATEGORY = {
    KEY: KEY, PRESETS: PRESETS,
    get: get, set: set, clear: clear,
    asked: asked, markAsked: markAsked, labelOf: labelOf,
    presetOf: presetOf, aiNote: aiNote, chips: chips, seed: seed, vibeOf: vibeOf,
    tools: tools
  };

  /* A bare global beside the object, for the same reason nova.js exports
     langInstruction(): the prompt-building code on ai.html, publish.html and
     trends-nav.js is a long string concatenation, and `+ ncCategoryNote() +`
     reads there where `+ (window.NC_CATEGORY ? window.NC_CATEGORY.aiNote() :
     '') +` does not. It answers '' rather than throwing if this file somehow
     did not load, so a prompt is never broken by its absence. */
  window.ncCategoryNote = aiNote;
})();
