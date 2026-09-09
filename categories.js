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
     deliberately broad — a category is a hint, not a filing system. */
  var PRESETS = [
    { id: 'gaming',    label: 'Gaming',              hint: 'Clips, reviews, let’s plays' },
    { id: 'music',     label: 'Music',               hint: 'Covers, production, performance' },
    { id: 'sport',     label: 'Sport',               hint: 'Highlights, training, football' },
    { id: 'irl',       label: 'Vlogs and everyday',  hint: 'Days, trips, life' },
    { id: 'learning',  label: 'Learning and school', hint: 'Revision, explainers, study' },
    { id: 'art',       label: 'Art and making',      hint: 'Drawing, crafts, builds' },
    { id: 'food',      label: 'Food',                hint: 'Cooking, baking, eating' },
    { id: 'comedy',    label: 'Comedy and sketches', hint: 'Bits, skits, edits' },
    { id: 'tech',      label: 'Tech',                hint: 'Phones, PCs, coding' }
  ];

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

  window.NC_CATEGORY = {
    KEY: KEY, PRESETS: PRESETS,
    get: get, set: set, clear: clear,
    asked: asked, markAsked: markAsked, labelOf: labelOf
  };
})();
