# Working on NovaClip and NovaTools

Standing instructions for this repo. They came from the person who owns it, so
follow them rather than a general default.

## Always list the files you changed

Every reply that touches code ends with the files that changed and one line on
why each one changed. Not a summary of the work — the actual paths, so they can
be copied into the repo without hunting through prose for them.

Say plainly when a file is **new** (it will not exist on the server yet) and
when two files have to go together (`nova.js` and `editor.html` did once, and
pasting one without the other broke the editor's buttons).

## Check what is already in the repo before changing it

`git fetch origin main` and diff first. The live site is edited by hand between
sessions, so what is on disk here is not automatically what is deployed.

## Delivery

Pushing is refused — the GitHub App has Contents: Read only, on git and the REST
API alike. Everything ships through the artifact, which is rebuilt with
`scratchpad/build.js`. Binary files cannot go in it; they get their own page of
download links.

## Never put a key in a file that ships to a browser

Anything in this repo is public. API keys belong on the Cloudflare Worker
(`ai-worker.js`), read from an environment secret. This has come up twice.

## Two workers, and they are not interchangeable

- `ai-worker.js` — talks to Gemini, needs the `GEMINI_API_KEY` secret
- `leaderboard-worker.js` — accounts and scores, needs the `DB` KV binding

Deploying the second one at the first one's address is what made every AI
feature answer 500.
