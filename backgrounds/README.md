# Category backgrounds

Drop a photograph in here and the category it is named after gains a real
background across the whole site. Nothing else has to change — no code, no
list to update. The file is looked for once per visit and remembered.

## The quick way: fetch all nine

```
node backgrounds/fetch.mjs
```

Node 18+, no packages to install. It searches Openverse for CC0 photographs —
the licence that allows commercial use and needs no attribution — and saves one
per category. `--dry-run` shows what it would take without taking it,
`--force` replaces files already here, and naming categories
(`node backgrounds/fetch.mjs food gaming`) does just those.

It was written in a session behind a proxy that answers 403 to every image
host, so it could not be run end to end before being committed. Its failure
paths were exercised, which is why it checks that what came back is actually an
image and large enough to be a photograph, and writes nothing when it is not.
If a category comes back empty it says so and carries on with the rest — fill
that one in by hand from the table below.

## The nine filenames

Exactly these, lower case. `.jpg`, `.jpeg`, `.png` and `.webp` all work — the
site tries them in that order, so save whatever you have:

| File               | Category on the site |
| ------------------ | -------------------- |
| `gaming.jpg`       | Gaming |
| `music.jpg`        | Music |
| `sport.jpg`        | Sport |
| `irl.jpg`          | Vlogs and everyday |
| `learning.jpg`     | Learning and school |
| `art.jpg`          | Art and making |
| `food.jpg`         | Food |
| `comedy.jpg`       | Comedy and sketches |
| `tech.jpg`         | Tech |

A category with no file here keeps its colours, which is a complete look on its
own — the photographs are an addition, not a missing piece. A **written-in**
category (someone who typed "Warhammer painting") never gets one, because a
filename guessed from something a person typed is a guess, not a lookup.

## What makes a good one

- **Landscape, at least 1600px wide.** It is drawn full-bleed behind the page.
- **Busy in the middle is fine.** It is blurred to 6px and dropped to 42%
  opacity on the dark theme, 28% on light, with a scrim over it — the page has
  to stay readable, so what survives is the colour and the shape, not the
  detail. Judge a candidate squinting at it, not sharp.
- **Dark or mid-toned beats bright.** A white-heavy photo lifts the page under
  the text even through the scrim.
- **Under about 300KB.** It loads on every page. Export at quality 70–80 and
  resize before you upload; a 4MB camera JPEG is 4MB on every visit.

## Licensing is the reason none of these are in the repo

Every file here is published to novaclip.org. Use a photograph you took, or one
under a licence that allows commercial use with no attribution — Unsplash,
Pexels and Pixabay all qualify. Do not put a Google Images result in here.

## Turning one off

Delete the file. The category falls back to its colours on the next visit.
Nothing else needs changing.
