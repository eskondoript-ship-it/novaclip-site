/* ncJSON — reading JSON out of a model answer.
   ==========================================================================
   The case that brought this file into existence is `truncated mid-object`:
   Publish asked gemini-2.5-flash for an edit plan, the model spent its token
   budget thinking, and the JSON arrived unfinished. The old
   /\{[\s\S]*\}/ matched from the first brace to the last one in the string —
   which in a truncated answer is the brace closing an inner step — so the
   match was unbalanced and the page said "unreadable".
   ========================================================================== */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

/* nova.js is a browser script, not a module. Pull just the function out and
   evaluate it, so the test runs against the shipped source rather than a copy
   that can drift away from it. */
const src = readFileSync(new URL('../nova.js', import.meta.url), 'utf8');
const start = src.indexOf('function ncJSON(text) {');
assert.ok(start > 0, 'ncJSON not found in nova.js');
const end = src.indexOf('\nwindow.ncJSON = ncJSON;', start);
assert.ok(end > start, 'end of ncJSON not found');
const ncJSON = new Function(src.slice(start, end) + '\nreturn ncJSON;')();

test('plain object', () => {
  assert.deepEqual(ncJSON('{"ok":true}'), { ok: true });
});

test('fenced as ```json', () => {
  assert.deepEqual(ncJSON('```json\n{"ok":true,"n":2}\n```'), { ok: true, n: 2 });
});

test('prose before and after', () => {
  assert.deepEqual(ncJSON('Sure! {"a":1} — hope that helps.'), { a: 1 });
});

test('truncated mid-object returns null, not a mangled parse', () => {
  /* Exactly the shape publish.html received: the object never closes, but an
     inner step does, so a greedy match looks plausible and is not. */
  const cut = '{"ok":true,"steps":[{"at":"0:00","do":"Trim the dead air","why":"nobody wait' +
              's","tool":"Trim"},{"at":"0:12","do":"Add a caption","why":"sound off","tool":"Ca';
  assert.equal(ncJSON(cut), null);
  /* and the bug this replaces: the old regex produced something that parsed
     into the wrong thing or threw — either way, never the real object. */
  const greedy = (cut.match(/\{[\s\S]*\}/) || [''])[0];
  assert.throws(() => JSON.parse(greedy));
});

test('a complete object followed by a truncated one takes the complete one', () => {
  assert.deepEqual(ncJSON('{"first":1} then {"second":'), { first: 1 });
});

test('braces inside strings do not end the object', () => {
  assert.deepEqual(ncJSON('{"do":"type a } and a { in chat","n":1}'),
    { do: 'type a } and a { in chat', n: 1 });
});

test('escaped quote inside a string', () => {
  assert.deepEqual(ncJSON('{"say":"he said \\"hi\\" }","n":2}'), { say: 'he said "hi" }', n: 2 });
});

test('top-level array', () => {
  assert.deepEqual(ncJSON('here you go: [1,2,3]'), [1, 2, 3]);
});

test('nested objects', () => {
  assert.deepEqual(ncJSON('{"a":{"b":{"c":1}},"d":2}'), { a: { b: { c: 1 } }, d: 2 });
});

test('no JSON at all', () => {
  assert.equal(ncJSON('I cannot do that.'), null);
});

test('empty and nullish input', () => {
  assert.equal(ncJSON(''), null);
  assert.equal(ncJSON(null), null);
  assert.equal(ncJSON(undefined), null);
});

test('a false start before the real object', () => {
  /* An unbalanced brace early on must not stop the scan finding the good one. */
  assert.deepEqual(ncJSON('note: use { curly braces\nanswer: {"ok":true}'), { ok: true });
});

/* --------------------------------------------------------------------------
   The other half of the fix: thinking is off for the 2.5 text models, because
   thinking tokens are charged against maxOutputTokens and that is what
   truncated the answer in the first place.
   -------------------------------------------------------------------------- */
test('nova.js turns thinking off for gemini-2.5 text models only', () => {
  const m = src.match(/if \(provider === 'gemini' && (\/[^/]+\/)\.test\(model\)\) \{\s*body\.generationConfig\.thinkingConfig/);
  assert.ok(m, 'the thinkingConfig guard is not where the test expects it');
  const re = new RegExp(m[1].slice(1, -1));
  assert.ok(re.test('gemini-2.5-flash'), '2.5-flash must get thinkingConfig');
  assert.ok(re.test('gemini-2.5-flash-lite'), '2.5-flash-lite must get thinkingConfig');
  /* Sending thinkingConfig to these is a 400 from Google. */
  assert.ok(!re.test('gemini-2.0-flash'), '2.0-flash must not get thinkingConfig');
  assert.ok(!re.test('gemini-2.5-flash-image'), 'the image model must not get thinkingConfig');
});

test('an empty object is a valid start', () => {
  assert.deepEqual(ncJSON('answer: {}'), {});
});

test('prose braces never win over the real object', () => {
  assert.deepEqual(ncJSON('Put it in { braces } like {"ok":true}'), { ok: true });
});
