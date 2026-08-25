# Putting NovaClip in the Microsoft Store

NovaClip is a PWA, so it goes into the Store as an MSIX package that wraps the
live site. You do not rewrite anything and you do not compile anything. The
Store app *is* novaclip.org, running in a window without browser chrome.

That also means **the Store version updates when you deploy.** Push to `main`,
GitHub Pages serves it, and the installed app has it on next launch. You only
resubmit a package when the icons, the name or the permissions change.

---

## Before you start: what it costs and how long it takes

| | |
|---|---|
| Developer account | **one-off**, about £12 / $19 for an individual, about £65 / $99 for a company |
| Your time | 1–2 hours the first time |
| Microsoft's review | usually 24–72 hours; a first submission from a new account is often at the slow end |
| Rejection | common on the first try, almost always for the age rating or the privacy policy — both covered below |

---

## Step 0 — check the site is actually installable

Do this first. Every later step assumes it passes, and it is thirty seconds.

Open <https://www.pwabuilder.com>, paste `https://novaclip.org`, press Start.

You want a green score on **Manifest** and **Service Worker**. This repo
already has what it checks for:

- `manifest.json` at the site root with `name`, `short_name`, `start_url`,
  `scope`, `display: standalone`, `description`, `background_color`,
  `theme_color`, `categories`, `lang`, `dir` and `id`
- four icons — 192 and 512, each in `any` and `maskable`
- seven screenshots — five `wide` at 1366×768, two `narrow` at 412×915
- `sw.js`, registered at the end of `nova.js`, with an offline fallback page

If PWABuilder complains that it cannot reach the site, it is almost always the
custom domain's HTTPS certificate still provisioning in GitHub Pages settings.
Wait and retry rather than changing anything.

---

## Step 1 — open a Partner Center account

1. Go to <https://partner.microsoft.com/dashboard>, sign in with a Microsoft
   account, choose **Windows & Xbox** as the program.
2. Register as **Individual** unless NovaClip is a registered company. Individual
   is cheaper and the verification is lighter; you can change it later, and the
   publisher name shown in the Store is your legal name if you pick Individual.
3. Pay the one-off fee.
4. Wait for verification. Individual is usually minutes to a day. Company
   verification involves a third party checking the business exists and can take
   a week or more — plan around that if you go that route.

---

## Step 2 — reserve the name

In Partner Center: **Apps and games → New product → MSIX or PWA app.**

Reserve **NovaClip**. If it is taken, `NovaClip — Creator Studio` or similar.
The reserved name becomes part of the package identity, so decide now: changing
it later means a new product listing, not an edit.

---

## Step 3 — copy the three identity values

Still in Partner Center, open your new product → **Product management → Product
identity.** Copy these three exactly:

| Partner Center calls it | PWABuilder calls it | Looks like |
|---|---|---|
| Package/Identity/Name | Package ID | `12345Publisher.NovaClip` |
| Package/Identity/Publisher | Publisher ID | `CN=ABCD1234-5678-...` |
| Package/Properties/PublisherDisplayName | Publisher display name | your name or company |

Get these wrong and the upload is rejected with a signature mismatch. It is the
single most common first-attempt failure and the error message is unhelpful.

---

## Step 4 — build the package

Back on PWABuilder, with novaclip.org loaded: **Package for stores → Windows.**

Fill in:

- **Publisher display name** — from Step 3
- **Publisher ID** — from Step 3, the whole `CN=...` string
- **Package ID** — from Step 3
- **App name** — NovaClip
- **Version** — `1.0.1` or higher. **Not `1.0.0`** — Microsoft reserves that
  and the upload fails.
- **Classic package version** — leave lower than the version above; PWABuilder
  handles this if you let it.

Download the zip. Inside are:

- `NovaClip.msixbundle` — the modern package, Windows 10 1809 and up
- `NovaClip.classic.appxbundle` — for older Windows 10 builds
- `installer.ps1` and a `.cer` — **for local testing only, do not upload these**

Do not sign the packages yourself. Partner Center signs them on upload; a
self-signed bundle is rejected.

### Test it before uploading

In an admin PowerShell, in the unzipped folder:

```powershell
Add-AppxPackage -Path .\NovaClip.msixbundle
```

Launch it from the Start menu. Check:

- it opens in its own window with no address bar
- the sidebar and top bar are not clipped by the title bar — `display_override`
  requests `window-controls-overlay`, so the app draws under the caption buttons
- turn the wifi off and relaunch: you should get `offline.html`, not a dinosaur
- the editor loads and can export
- the identity gate appears if a lock is enrolled

Remove it again with `Remove-AppxPackage`.

---

## Step 5 — the Store listing

Partner Center → your product → **Start your submission.**

### Pricing and availability
- **Free**
- Markets: all, unless you have a reason
- Visibility: public

### Properties
- **Category:** Photo & video → Video editing. Second choice: Developer tools →
  none of these fit as well.
- **Privacy policy URL:** `https://novaclip.org/privacy.html` — **required**,
  and a submission without it is rejected automatically. That page is real and
  current; it lists analytics, the biometric templates and the Locker.
- **Website:** `https://novaclip.org`
- **Support contact:** the email in `privacy.html`

### Age ratings

This is the part that gets first submissions rejected, so read it twice.

You fill in the **IARC questionnaire**, honestly. For NovaClip the answers that
matter:

- **Does the app let users interact with each other?** — **Yes.** Community,
  comments and groups exist. Saying no here when the app has a comment feed is
  the kind of mismatch that gets an app pulled after it ships.
- **Does it share the user's location?** — No.
- **Does it allow purchases?** — **Yes**, once the pay worker is live. Say yes
  now rather than resubmitting.
- **Unmoderated user-generated content?** — No. Say so and point at the
  server-side rules: swearing and spam suspend the account for two days, checked
  on the server so clearing the browser does not undo it.
- **Violence:** the arena game is cartoon/fantasy. Answer accordingly — it is
  not "realistic violence" but it is not "none" either.
- **Simulated gambling:** No.

The rating comes out around PEGI 12 / ESRB Everyone 10+ / IARC equivalent.
NovaClip's stated audience is 13–18, which sits comfortably above it.

### Store listing text

- **Short description** (up to 100 chars): the `description` field from
  `manifest.json` is a good starting point.
- **Description:** the pitch. Mention: browser video editor, trend research,
  AI tutors, the parent dashboard, and that everything biometric stays on the
  device. Do not mention competitors by name — Store policy 10.1.
- **Screenshots:** upload at least four. The five 1366×768 files in
  `screenshots/` are already the right size and are real pages, not mockups.
  Store minimum is 1366×768, so they go in unedited.
- **Store logo:** 300×300 PNG. `icons/icon-512.png` scaled down works; do not
  upload the maskable one, it has padding baked in and will look small.

---

## Step 6 — upload and submit

**Packages** → drag in **both** `.msixbundle` and `.classic.appxbundle`.
Partner Center works out which Windows version gets which.

Then **Submit to the Store.**

---

## When it gets rejected

It happens. The three usual causes, in order:

1. **Identity mismatch** — the three values in Step 3 were retyped rather than
   pasted. Rebuild in PWABuilder with the correct ones. You do not need a new
   product listing.
2. **Age rating inconsistent with the app** — usually because the questionnaire
   said there is no user interaction and the reviewer found the community feed.
   Redo the questionnaire honestly; it does not delay much.
3. **Privacy policy unreachable** — check `https://novaclip.org/privacy.html`
   loads in a private window with no login.

Fix, resubmit, and it goes back in the queue at the front rather than the back.

---

## After it is live

- **Updating the app:** just deploy the site. The wrapper points at
  novaclip.org and picks up changes on next launch. `sw.js` has to bump its
  `CACHE` constant when what it caches changes shape, or returning users keep
  the old files — that has bitten this site before.
- **Resubmit a package only when** the icons change, the name changes, the
  `scope` changes, or you need a new capability.
- **Analytics:** Partner Center shows installs and uninstalls, separately from
  the Google Analytics on the site.

---

## The one thing to decide before you submit

The Store listing will say NovaClip is for creators aged 13–18. Microsoft's
review reads the listing and the app together, so the age rating, the
description and what the app actually does all have to agree. They currently
do. If the checkout goes live, or the community feed changes shape, the
questionnaire answers in Step 5 need revisiting — a rating that was true at
submission and is not true six months later is the version of this that causes
real trouble.
