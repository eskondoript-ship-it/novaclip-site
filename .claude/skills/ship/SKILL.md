---
name: ship
description: The pre-commit checklist for NovaClip. Use before every commit and push. Covers the repo's standing rules — check origin/main first, no keys in browser files, the two Workers are not interchangeable, policy pages change in the same commit as the behaviour they describe, and the service worker cache is bumped when the shell changes.
---

# Before you push

CLAUDE.md holds the rules. This is the order to apply them in, and the traps
that have actually caught people.

## 1. Find out what is really deployed

```bash
git fetch origin main && git diff --stat origin/main -- <files you touched>
```

The live site is edited by hand between sessions, so what is on disk here is
not automatically what is deployed. Diff before changing, not after.

## 2. Did behaviour change? Then the policy pages change too

This is the rule the repo is strictest about, and it is not optional.

- Anything new that **leaves the device** goes in `privacy.html`'s
  "What is sent somewhere else" table, in the same commit.
- Anything that changes what an **account** is, what is **stored**, or what
  the site **promises** goes in `privacy.html` and `terms.html` both.
- Bump the "Last updated" date on any page you edited.

Recent examples of the drift this prevents: privacy.html said there was no
analytics after gtag went in; it said an account never has a password after
usernames shipped; its own meta description still claimed "no analytics" three
commits later.

## 3. Never a key in a file that ships to a browser

Anything in this repo is public. API keys belong on the Cloudflare Worker,
read from an environment secret. Check your diff for anything key-shaped.

## 4. The two Workers are not interchangeable

- `ai-worker.js` — Gemini. Needs the `GEMINI_API_KEY` secret.
- `leaderboard-worker.js` — accounts, saves, boards. Needs the `DB` KV
  binding, and `PEPPER` for username privacy.

Deploying the second at the first's address is what made every AI feature
answer 500. Each answers `/health` saying which one it is — that is the first
thing to check when something is unreachable.

## 5. Did you add a file the shell needs?

If a page now depends on a new `.js` or `.css`, add it to `SHELL` in `sw.js`
**and bump `CACHE`**. Otherwise a returning visitor gets the new HTML from the
network and the old cache with no entry for the new file — markup with none of
its behaviour. Add a one-line note saying what the bump is for; the file keeps
that history and it is genuinely useful.

## 6. Run the sweep

Use the `sweep` skill. Anything touching `nova.js`, a shared stylesheet, or
more than one page must pass before it is pushed.

## 7. Write the commit for the person who reads it in a year

Say what was wrong, not only what changed. The commits in this repo name the
bug, the measurement that found it, and the reasoning — "measured, the content
is 643px in a 625px box" is worth more than "fix scrolling".

End the message with:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L9cVrGgE27EDx8oxvGoSR9
```

## 8. Push, then verify the push

```bash
git push -u origin <branch>
git push origin <branch>:main          # only when asked for main
git ls-remote origin refs/heads/main refs/heads/<branch>
```

`git push` has reported "failed to push some refs" here while both refs
actually landed. Check `ls-remote` against your local `HEAD` rather than
trusting the push output in either direction.

## 9. End the reply with the files

Every reply that touches code ends with the actual paths and one line each on
why. Say plainly when a file is **new**, and when two files have to go
together — `account.js` and `profile.html` do; `trends-nav.js` and
`trends.html` do; `nova.js` and `editor.html` did once, and pasting one
without the other broke the editor's buttons.
