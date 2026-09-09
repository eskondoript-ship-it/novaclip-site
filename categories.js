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

     `hint` is the line under the name in the picker. The other two are what
     make the answer worth asking for, rather than a preference stored and
     never read again:

       chips  three shortcuts on the Ask card, so the first thing offered to
              somebody who makes cooking videos is not "edit a gameplay clip"
       seed   the query Trend Spotter starts on, so an empty search box is not
              the first thing a creator meets on the page that is supposed to
              tell them what to make

     A written-in category has neither, and that is fine and deliberate: it
     still reaches every AI prompt through aiNote() below, which is the part
     that does the most work. Inventing shortcuts for "speedcubing" from a
     table would mean guessing, and a wrong shortcut is worse than a general
     one. */
  var PRESETS = [
    { id: 'gaming',    label: 'Gaming',              hint: 'Clips, reviews, let’s plays',
      seed: 'gaming',
      chips: [['editor', 'Edit a gameplay clip'], ['trends', 'What is trending'], ['hype', 'Find the boring bit']] },
    { id: 'music',     label: 'Music',               hint: 'Covers, production, performance',
      seed: 'music covers and production',
      chips: [['editor', 'Cut a music video'], ['trends', 'Trending sounds'], ['ai', 'Write my description']] },
    { id: 'sport',     label: 'Sport',               hint: 'Highlights, training, football',
      seed: 'sport highlights',
      chips: [['editor', 'Cut a highlight'], ['trends', 'Trending in sport'], ['hype', 'Find the flat seconds']] },
    { id: 'irl',       label: 'Vlogs and everyday',  hint: 'Days, trips, life',
      seed: 'day in the life vlogs',
      chips: [['editor', 'Edit a vlog'], ['trends', 'Vlog ideas'], ['aiedit', 'Get it ready to post']] },
    { id: 'learning',  label: 'Learning and school', hint: 'Revision, explainers, study',
      seed: 'study and revision explainers',
      chips: [['ai', 'Ask a tutor'], ['trends', 'Explainer ideas'], ['editor', 'Edit a study video']] },
    { id: 'art',       label: 'Art and making',      hint: 'Drawing, crafts, builds',
      seed: 'art and craft process videos',
      chips: [['photo', 'Edit a photo of my work'], ['editor', 'Edit a process video'], ['trends', 'Art trends']] },
    { id: 'food',      label: 'Food',                hint: 'Cooking, baking, eating',
      seed: 'cooking and baking',
      chips: [['editor', 'Edit a recipe video'], ['photo', 'Edit a food photo'], ['trends', 'Food trends']] },
    { id: 'comedy',    label: 'Comedy and sketches', hint: 'Bits, skits, edits',
      seed: 'comedy sketches and skits',
      chips: [['editor', 'Cut a sketch'], ['hype', 'Find the dead air'], ['trends', 'Comedy trends']] },
    { id: 'tech',      label: 'Tech',                hint: 'Phones, PCs, coding',
      seed: 'phones, PCs and coding',
      chips: [['editor', 'Edit a review'], ['trends', 'Tech trends'], ['ai', 'Write a spec rundown']] }
  ];

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

  /* What Trend Spotter should start on. A written-in category is used as
     typed: "Warhammer painting" is a better search than anything a nine-row
     table could have mapped it to. */
  function seed() {
    var v = get();
    if (!v) return '';
    var p = presetOf(v);
    return p ? p.seed : v;
  }

  window.NC_CATEGORY = {
    KEY: KEY, PRESETS: PRESETS,
    get: get, set: set, clear: clear,
    asked: asked, markAsked: markAsked, labelOf: labelOf,
    presetOf: presetOf, aiNote: aiNote, chips: chips, seed: seed
  };

  /* A bare global beside the object, for the same reason nova.js exports
     langInstruction(): the prompt-building code on ai.html, publish.html and
     trends-nav.js is a long string concatenation, and `+ ncCategoryNote() +`
     reads there where `+ (window.NC_CATEGORY ? window.NC_CATEGORY.aiNote() :
     '') +` does not. It answers '' rather than throwing if this file somehow
     did not load, so a prompt is never broken by its absence. */
  window.ncCategoryNote = aiNote;
})();
