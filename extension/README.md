# NovaClip Family Shield

The part of the Family Dashboard that actually blocks. A web page cannot filter
youtube.com — only something running inside the browser can, which is what this
is.

## Install (unpacked, until it is on the Web Store)

1. `chrome://extensions` → turn on **Developer mode**
2. **Load unpacked** → choose this folder
3. Copy the extension ID it shows
4. Open the Family Dashboard, unlock with the parent PIN, and run this in the
   browser console on that page:
   `localStorage.setItem('nc_shield_id','PASTE_THE_ID')`
5. Press **Save and send to the shield**

Until step 5, the shield runs the default 10-to-13 settings.

## What it does

| | |
|---|---|
| Feeds and search results | matching cards are hidden before they are read |
| A blocked page opened directly | covered, media paused, reason shown |
| A blocked search term | results page covered |
| Sites | youtube.com, tiktok.com, instagram.com, twitch.tv |

## What it does not do

It reads the text a platform puts on screen — titles, channel names,
descriptions, search terms. **It does not watch the video.** A clean title on a
bad video gets through, and nothing that reads text can fix that.

That covers the three ways a child actually reaches bad content — searching for
it, being recommended it, clicking it — and it is worth having. It is not total
protection, and any product claiming otherwise is selling something that does
not exist.

## Privacy

Settings live in `chrome.storage.local`. The blocked-attempt log records the
**category and a count**, never the title or URL — a log of exactly what a child
tried to watch is itself a privacy problem. Nothing is sent to any server; the
extension makes no network requests at all.

## The rules

`family-filter.js` is a byte-for-byte copy of the file the dashboard runs, so
what a parent previews is what the shield does. There is no build step in this
project, so the copy is manual and a test enforces it:

```bash
cp family-filter.js extension/family-filter.js
node --test tests/family-filter.test.mjs
```

The test fails if the two ever differ. They already drifted once, within an hour
of being written.

## Notes for packaging

- `manifest.json` → `externally_connectable.matches` must list the real
  dashboard origin, or pairing silently fails.
- Manifest V3 forbids inline `<script>`. The options page had one and rendered
  empty with only a console warning; that is why `options.js` exists.
- Site selectors in `block.js` are how these four sites lay out cards *today*.
  When one redesigns, that surface stops being hidden — the page-level check is
  the backstop, and the selectors need revisiting.
