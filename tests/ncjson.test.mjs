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
   The other half of the fix: thinking is turned off, because thinking tokens
   are charged against maxOutputTokens and that is what truncated the answer.

   Which models accept the field is deliberately NOT a list. It was one, keyed
   to gemini-2.5-flash, and then the site's default model became
   gemini-3.6-flash and the rule quietly stopped matching — so these guard the
   learn-at-runtime behaviour that replaced it, not a set of names.
   -------------------------------------------------------------------------- */
test('thinking is asked for by provider, not by a list of model names', () => {
  assert.ok(/const wantThinking = provider === 'gemini' && !NC_NO_THINKING\.has\(model\)/.test(src),
    'thinkingConfig should be gated on the provider and the learned set');
  assert.ok(!/gemini-2\.5-flash\(-lite\)\?|\/\^gemini-[\d.]+-flash/.test(src),
    'no model-name regex should decide who gets thinkingConfig');
});

test('any 400 is retried once without thinkingConfig, and remembered', () => {
  /* This used to require the refusal to NAME the field:

       ... && /thinking|thought/i.test(out.raw)

     which assumed Google says which argument it disliked. It usually does not
     — publish.html's "Plan the edit" came back with the bare "Request contains
     an invalid argument.", the branch never ran, and the whole self-healing
     path was dead in exactly the case it was written for.

     The condition is now the presence of the field itself, which is also what
     stops it looping: the branch deletes it before asking again. */
  const m = src.match(
    /if \(out\.res\.status === 400 && wantThinking && body\.generationConfig\.thinkingConfig\) \{([\s\S]{0,220})/);
  assert.ok(m, 'the retry-without-thinking branch is missing or no longer gated on the field');
  const body = m[1];
  assert.ok(/NC_NO_THINKING\.add\(model\)/.test(body), 'the model must be remembered');
  assert.ok(/delete body\.generationConfig\.thinkingConfig/.test(body), 'the field must be dropped');
  assert.ok(/out = await send\(\)/.test(body), 'it must ask again');
});

test('a retried request still reports the second failure, not a swallowed one', () => {
  /* The old narrow rule existed so an unrelated 400 — a bad key, say — was not
     retried pointlessly. Widening it costs one wasted call on those, which is
     accepted; what must NOT happen is the real reason going missing. The error
     is read from `out` after the retry block, so whatever the second attempt
     said is what the reader gets. */
  const after = src.slice(src.indexOf('delete body.generationConfig.thinkingConfig'));
  const assign = after.indexOf('r = out.res; raw = out.raw;');
  assert.ok(assign > 0, 'the response must be re-read after the retry');
  assert.ok(assign < after.indexOf('if (!err && !r.ok)'),
    'the error must be built from the retried response, not the first one');
});

test('an empty object is a valid start', () => {
  assert.deepEqual(ncJSON('answer: {}'), {});
});

test('prose braces never win over the real object', () => {
  assert.deepEqual(ncJSON('Put it in { braces } like {"ok":true}'), { ok: true });
});
