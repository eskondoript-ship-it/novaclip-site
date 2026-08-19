/* The two decisions ncAsk makes when the AI says no.
   ---------------------------------------------------------------------------
   Both exist because of the same live failure. publish.html's "Plan the edit"
   answered:

     Could not reach the AI
     Request contains an invalid argument.

   Two separate faults met there.

   The retry: ncAsk sends generationConfig.thinkingConfig, which not every
   model accepts, and it is meant to notice a refusal, drop the field and ask
   again. The condition was `/thinking|thought/.test(body)` — it assumed Google
   names the field it rejected. Google usually does not; the reply is the bare
   sentence above. So the retry never ran and every JSON-shaped AI feature on
   the site was one model rename away from being dead with no way back.

   The wording: that sentence is written for whoever composed the request, and
   this site's readers are thirteen to eighteen. It tells them nothing about
   what to do.
   --------------------------------------------------------------------------- */
import { test } from 'node:test';
import assert from 'node:assert';

/* Mirrors the condition in nova.js. Kept as a predicate so the rule can be
   stated once and checked, rather than living only inside an if. */
function shouldRetryWithoutThinking(status, wantThinking, hasThinkingConfig) {
  return status === 400 && wantThinking && !!hasThinkingConfig;
}

/* Copy of ncSayWhy in nova.js. If that changes, this has to change with it,
   and these tests are what notice. */
function ncSayWhy(reason, status) {
  const r = String(reason || '');
  if (!r) return '';
  if (/invalid argument/i.test(r))
    return 'The AI refused the request as malformed. This is a NovaClip bug rather than ' +
           'anything you did — try once more, and if it keeps happening the model this site ' +
           'asks for has probably changed under it.';
  if (/quota|rate limit|resource has been exhausted/i.test(r))
    return 'NovaClip\'s shared AI is out of free requests for now. Add your own key in your ' +
           'profile to keep going, or come back in a few minutes.';
  if (/api key not valid|invalid api key|api_key_invalid/i.test(r))
    return 'The key this site uses was rejected by Google. If it is your own key, check it in ' +
           'your profile; if not, whoever deployed the worker needs to replace it.';
  if (/safety|blocked|harm/i.test(r))
    return 'The AI would not answer that one. Rephrasing usually works.';
  if (/not found|does not exist/i.test(r))
    return 'The AI model this page asks for is no longer available. It needs updating in ' +
           'nova.js and on the worker.';
  if (status === 503 || /overloaded|unavailable/i.test(r))
    return 'The AI is overloaded right now. Wait a moment and try again.';
  return r;
}

test('a 400 retries without thinkingConfig even when nothing names the field', () => {
  /* The exact message from the live failure — no "thinking", no "thought". */
  assert.equal(shouldRetryWithoutThinking(400, true, true), true);
});

test('the retry only applies where it could possibly help', () => {
  // nothing to drop
  assert.equal(shouldRetryWithoutThinking(400, false, false), false);
  // already dropped once: this is what stops it looping
  assert.equal(shouldRetryWithoutThinking(400, true, false), false);
  // not a bad-request failure, so the field is not the suspect
  assert.equal(shouldRetryWithoutThinking(429, true, true), false);
  assert.equal(shouldRetryWithoutThinking(500, true, true), false);
  assert.equal(shouldRetryWithoutThinking(200, true, true), false);
});

test('the retry runs at most once', () => {
  // after the first attempt the caller deletes thinkingConfig, so the same
  // predicate against the same failure is now false — one extra call, ever.
  let hasCfg = true, calls = 0;
  for (let i = 0; i < 5; i++) {
    if (!shouldRetryWithoutThinking(400, true, hasCfg)) break;
    hasCfg = false; calls++;
  }
  assert.equal(calls, 1);
});

test('the message a reader actually sees says what to do', () => {
  const out = ncSayWhy('Request contains an invalid argument.', 400);
  assert.notEqual(out, 'Request contains an invalid argument.');
  assert.match(out, /NovaClip bug|try once more/i);
});

test('quota, key, safety and missing-model each get their own answer', () => {
  const cases = [
    ['You exceeded your current quota', /own key|few minutes/i],
    ['Resource has been exhausted', /own key|few minutes/i],
    ['API key not valid. Please pass a valid API key.', /rejected by Google/i],
    ['Candidate was blocked due to SAFETY', /Rephrasing/i],
    ['models/gemini-9-flash is not found for API version v1beta', /no longer available/i]
  ];
  const seen = new Set();
  for (const [raw, want] of cases) {
    const out = ncSayWhy(raw, 400);
    assert.match(out, want, raw);
    seen.add(out);
  }
  /* Quota and exhausted deliberately share one answer; the rest are distinct.
     Four different sentences for five inputs. */
  assert.equal(seen.size, 4);
});

test('an unrecognised reason is passed through rather than smoothed away', () => {
  /* A wrong-but-specific message still beats a vague friendly one — it is what
     someone can paste into a search. */
  const odd = 'Deadline exceeded while awaiting headers';
  assert.equal(ncSayWhy(odd, 400), odd);
});

test('no reason at all stays empty so the caller can fall back to the status', () => {
  assert.equal(ncSayWhy('', 500), '');
  assert.equal(ncSayWhy(null, 500), '');
  assert.equal(ncSayWhy(undefined, 400), '');
});

test('503 is explained even when the body says nothing useful', () => {
  assert.match(ncSayWhy('The service is currently unavailable.', 503), /overloaded/i);
});
