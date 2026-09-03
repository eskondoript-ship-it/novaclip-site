---
name: check-upload
description: Vet an uploaded design zip or repo before building on it. Use whenever the user attaches a .zip, links a repo, or says "use this for the X page" with a design attached. Finds out whether the data behind it is real or mocked, and whether it carries credentials or a weaker security model, BEFORE any of it reaches the site.
---

# Checking an upload before you use it

Three designs have arrived in this repo as zips. All three looked finished and
all three were built on a fake backend. Every time, the right call was the
same: **keep the design, wire it to the thing that already works.** That
decision is recorded in the code — the comment above the performance panels in
`analytics.html` is the first instance, and `profile.html` and
`studio-nexus.css` carry the second and third.

Do this check before writing a line of integration code, and tell the user
what you found before you start building.

## The check

```bash
cd /tmp/.../scratchpad && rm -rf up && mkdir up && unzip -q "<the zip>" -d up
find up -type f | head -40 && du -sh up
```

Then four questions, in this order.

### 1. Does it talk to anything?

```bash
grep -rn "fetch(\|XMLHttpRequest\|axios\|WebSocket\|supabase\|firebase" up/src/ | wc -l
```

Read every hit. Expect to find that the matches are a font `<link>` and the
word "WebSockets" in a tag list — that has been the answer three times out of
three. A UI with no network code has no data, and every number in it is
invented.

### 2. Where does the data come from?

```bash
ls up/src/data/ up/src/mock* 2>/dev/null
grep -rn "Math.random\|INITIAL_\|MOCK_\|DEMO_" up/src/ | head -20
```

A `mockData.ts`, a `setInterval` that nudges a counter, or an
`INITIAL_DEMO_USERS` array is the whole data layer. Note the specific
fabricated numbers — "984,520 subscribers", "14,850 concurrent viewers",
"$284,500 revenue" — because naming them is what makes the problem concrete
for the user instead of an abstraction.

### 3. Does it carry anything dangerous?

```bash
grep -rniE "password|api[_-]?key|secret|token" up/src/ up/.env* 2>/dev/null | head -20
```

The account portal stored every user, **passwords in plain text**, in
`localStorage`. Adopting its backend would have been a straight downgrade from
PBKDF2-in-the-browser to "anyone who can open the browser reads every
password", on a site whose users are mostly teenagers. If the upload's
security model is weaker than what is already here, say so plainly and keep
what is here.

Anything matching an API key goes on the Worker, never in a file that ships to
a browser. See CLAUDE.md — this has come up twice.

### 4. What does it cost to adopt?

- **Fonts.** These uploads load three or four Google families. NovaClip
  already ships Plus Jakarta Sans and Space Grotesk in `/fonts/`, so those are
  free; anything else is a third-party request on every page and a line in
  `privacy.html`.
- **Build step.** They are Vite + React + Tailwind. NovaClip is static HTML
  with no build. Porting the *design* into plain CSS is usually a couple of
  hours; adopting the *toolchain* changes how the whole site ships.

## What to do with the answer

Say it in two or three sentences before building — what is real, what is
invented, and what you are going to do about it. Then build the design against
the data the site already has, and where a panel cannot be backed by anything
real, leave it out and say why rather than filling it with a plausible number.

The concrete precedent: the NexusStream dashboard's "Concurrent Active
Viewers" tile was dropped entirely, because YouTube publishes no public
realtime endpoint and there is no honest version of that number. The retention
curve was added in its place, because the Analytics API genuinely serves it.
