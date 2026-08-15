/* Tests for the family content filter.

   The tests that matter most are the ones where the filter must NOT fire. A
   filter that blocks a suicide-prevention video has done harm: the child who
   needed it is the one who does not get it. A filter that blocks Minecraft
   teaches the child the shield is stupid and worth defeating. Both failures
   are silent, so they get tested.

   Run:  node --test tests/family-filter.test.mjs
   ---------------------------------------------------------------------------- */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const F = require('../family-filter.js');

const S = F.defaults('tween');
const check = (title, extra) => F.check(Object.assign({ platform: 'youtube', title }, extra || {}), S);
const blocked = (title, extra) => check(title, extra).blocked;

/* ----------------------------------------------------------------------------
   Must block
   ---------------------------------------------------------------------------- */

test('blocks the things it exists to block', () => {
  assert.ok(blocked('FREE ROBUX GENERATOR no human verification'));
  assert.ok(blocked('thinspo compilation'));
  assert.ok(blocked('cs2 gambling with my whole balance'));
  assert.ok(blocked('how to make a silencer at home'));
  assert.ok(blocked('the blackout challenge gone wrong'));
  assert.ok(blocked('onlyfans leaked'));
});

test('names the category, so a parent can see why', () => {
  const v = check('free v bucks generator working 2026');
  assert.equal(v.blocked, true);
  assert.equal(v.category, 'scams');
  assert.equal(v.label, 'Scams and generators');
  assert.ok(v.matched.length > 0);
});

test('leetspeak does not get past the severe categories', () => {
  assert.ok(blocked('FR33 R0BUX g3n3rator'));
  assert.ok(blocked('p0rn'));
});

test('separators do not get past it either', () => {
  assert.ok(blocked('free-robux-generator'));
  assert.ok(blocked('free_robux generator'));
});

/* ----------------------------------------------------------------------------
   Must NOT block — the failures nobody reports
   ---------------------------------------------------------------------------- */

test('a child looking for help gets help', () => {
  assert.equal(blocked('Suicide prevention: how to talk to a friend'), false);
  assert.equal(blocked('Eating disorder recovery — one year on'), false);
  assert.equal(blocked('If you are struggling, here is the crisis line'), false);
  assert.equal(blocked('mental health support for teens'), false);
});

test('warning videos are not the thing they warn about', () => {
  assert.equal(blocked('How the free robux scam works — do not fall for it'), false);
  assert.equal(blocked('Gambling addiction documentary'), false);
  assert.equal(blocked('The dangers of the blackout challenge, explained'), false);
});

test('school and history survive', () => {
  assert.equal(blocked('Holocaust education: survivor testimony'), false);
  assert.equal(blocked('History of the Second World War, part 3'), false);
  assert.equal(blocked('Sex education: puberty explained'), false);
});

test('gaming is not violence', () => {
  assert.equal(blocked('Minecraft hardcore let\'s play episode 40'), false);
  assert.equal(blocked('Call of Duty Warzone gameplay — 30 kills'), false);
  assert.equal(blocked('Best sniper loadout'), false);
  assert.equal(blocked('airsoft field battle'), false);
});

test('innocent words containing rude substrings are safe', () => {
  // the classic own goal: substring matching blocks Scunthorpe and "analysis"
  assert.equal(blocked('Classical analysis lecture 2'), false);
  assert.equal(blocked('Scunthorpe United highlights'), false);
  assert.equal(blocked('Assassin\'s Creed review'), false);
  assert.equal(blocked('grape harvest in Douro'), false);
  assert.equal(blocked('nudge theory explained'), false);
});

/* ----------------------------------------------------------------------------
   Parent control
   ---------------------------------------------------------------------------- */

test('a parent\'s block list wins over anything else', () => {
  const s = Object.assign({}, S, { block: ['SomeChannel'] });
  const v = F.check({ platform: 'youtube', title: 'a perfectly normal video', channel: 'SomeChannel' }, s);
  assert.equal(v.blocked, true);
  assert.equal(v.rule, 'block_list');
});

test('a parent\'s allow list wins over the rules', () => {
  const s = Object.assign({}, S, { allow: ['Dr Explains'] });
  const v = F.check({ platform: 'youtube', title: 'thinspo and what it does', channel: 'Dr Explains' }, s);
  assert.equal(v.blocked, false);
  assert.equal(v.rule, 'allow_list');
});

test('turning a platform off stops filtering only that platform', () => {
  const s = Object.assign({}, S, { platforms: { youtube: false, tiktok: true, instagram: true, twitch: true } });
  assert.equal(F.check({ platform: 'youtube', title: 'free robux generator' }, s).blocked, false);
  assert.equal(F.check({ platform: 'tiktok', title: 'free robux generator' }, s).blocked, true);
});

test('turning the filter off blocks nothing at all', () => {
  const s = Object.assign({}, S, { enabled: false });
  assert.equal(F.check({ platform: 'youtube', title: 'thinspo' }, s).blocked, false);
});

test('unticking a category stops that category and no other', () => {
  const s = Object.assign({}, S, { categories: ['adult', 'self_harm'] });
  assert.equal(F.check({ platform: 'youtube', title: 'cs2 gambling stream' }, s).blocked, false);
  assert.equal(F.check({ platform: 'youtube', title: 'thinspo' }, s).blocked, true);
});

test('a ticked category always blocks — strictness never silently disables one', () => {
  // The bug this replaces: strictness was a severity gate inside check(), so a
  // parent could tick "Gambling and loot boxes", see it ticked, and have
  // nothing blocked. A control that reads as on while doing nothing is worse
  // than no control at all.
  for (const strictness of ['strict', 'normal', 'relaxed']) {
    const s = Object.assign({}, S, { strictness, categories: ['gambling'] });
    assert.equal(F.check({ platform: 'youtube', title: 'cs2 gambling stream' }, s).blocked, true,
      'gambling ticked but not blocked at strictness=' + strictness);
  }
});

test('strictness shapes the preset instead, and says so honestly', () => {
  const strict = F.defaults('tween', 'strict');
  const relaxed = F.defaults('tween', 'relaxed');
  assert.ok(strict.categories.length > relaxed.categories.length,
    'relaxed should start with fewer categories ticked');
  assert.ok(strict.categories.includes('gambling'));
  assert.ok(!relaxed.categories.includes('gambling'));
  // whatever the preset, the severe ones are always in it
  for (const s of [strict, relaxed]) {
    assert.ok(s.categories.includes('self_harm'));
    assert.ok(s.categories.includes('adult'));
  }
});

test('every profile is a real set of categories', () => {
  for (const key of Object.keys(F.PROFILES)) {
    const d = F.defaults(key);
    assert.ok(d.categories.length > 0, key + ' has no categories');
    assert.ok(F.THRESHOLD[d.strictness], key + ' has an unknown strictness');
    for (const c of d.categories) {
      assert.ok(F.CATEGORIES.some(x => x.id === c), key + ' names an unknown category: ' + c);
    }
  }
});

test('an empty item is not blocked, and does not throw', () => {
  assert.equal(F.check({}, S).blocked, false);
  assert.equal(F.check({ platform: 'youtube' }, S).blocked, false);
  assert.equal(F.check(null, S).blocked, false);
});

test('every category has exemptions, because every list has false positives', () => {
  for (const c of F.CATEGORIES) {
    assert.ok(Array.isArray(c.exemptions) && c.exemptions.length > 0,
      c.id + ' has no exemptions — that is how a filter starts deleting homework');
  }
});

test('the extension copy of the engine is byte-identical to the page copy', () => {
  /* The extension needs the file inside its own directory — MV3 content
     scripts cannot load from elsewhere — and this project has no build step to
     copy it. So there are two copies, and they drifted apart within an hour of
     being created: the fix to the strictness bug landed in one and not the
     other, which would have meant the dashboard previewing one thing while the
     shield did another. That is the exact failure the shared-engine design
     exists to prevent, so it gets a test rather than a good intention. */
  const a = fs.readFileSync(new URL('../family-filter.js', import.meta.url), 'utf8');
  const b = fs.readFileSync(new URL('../extension/family-filter.js', import.meta.url), 'utf8');
  assert.equal(b, a,
    'extension/family-filter.js is stale — run: cp family-filter.js extension/family-filter.js');
});
