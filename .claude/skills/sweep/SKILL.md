---
name: sweep
description: Run the responsive regression sweep over every page of NovaClip at seven widths, and read the result correctly. Use before committing any change to nova.js, to a shared stylesheet, or to more than one page — and any time a layout bug is reported. Catches horizontal bleed, controls off the side of the screen, pages with no way off them, headings covered by floating chrome, and page errors.
---

# The sweep

`scratchpad/width-sweep.mjs` opens all 26 pages at 7 widths and reports four
things per page: content bleeding sideways, a control whose box is entirely off
screen, a page with no visible link off it, and the first heading being covered
by something. It also collects page errors.

It is the check that has caught the most real bugs in this repo, and it takes
about four minutes. Run it before pushing anything that touches more than one
page.

## Running it

Two servers have to be up first, and getting either wrong wastes a full run.

```bash
# 1. The static server, FROM THE REPO ROOT. This is the mistake to avoid:
#    starting it from scratchpad/ serves the wrong directory and every page
#    404s, which looks like a catastrophic regression.
cd /home/user/novaclip-site
nohup python3 -m http.server 8099 > /tmp/http.log 2>&1 &
sleep 2 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8099/index.html   # expect 200

# 2. The sweep. Longer than the default tool timeout, so background it and poll.
(timeout 1200 node scratchpad/width-sweep.mjs > /tmp/sweep.txt 2>&1 &)
until grep -qE '^(all clean|[0-9]+ page/size)' /tmp/sweep.txt; do sleep 20; done
cat /tmp/sweep.txt
```

Do not run it in the foreground and do not chain `sleep` to wait for it — use
an `until` loop on the output file.

## Reading the result

`all clean` means all 26 pages at all 7 widths passed.

Two findings are known and are **not** regressions:

- **`index.html: COVERED heading ... covered by div#boot`** — `#boot` is the
  loading splash, and the sweep sometimes samples the page mid-fade. It has
  appeared at four different widths across different runs, which is what
  proves it is timing rather than layout. Ignore it unless it appears at
  *every* width in the same run.
- **`FATAL TimeoutError: page.goto`** — the machine is loaded, usually because
  stand-in workers or an earlier browser are still running. `pkill -f
  fakeworker; pkill -f fakeai` and run it again rather than investigating the
  page.

Everything else is real. `TRAPPED` in particular is worth taking seriously:
it means a reader can land on that page and have no visible way off it, which
is how trends.html shipped as a dead end.

## What the sweep is blind to

It measures the first `h1, h2` only, so an overlap further down the page —
like the "▼ SCROLL" cue printing through the home page's stat row — passes
clean. When a screenshot shows something wrong that the sweep says is fine,
believe the screenshot and check whether the bug predates your change:

```bash
# Re-run the same probe with your CSS stripped, to find out whose bug it is.
# A MutationObserver that removes the style element is enough.
```

## Keeping it honest

Two things in the sweep's own setup exist because leaving them out produced
false results, and they should stay:

- It seeds `nc_user_age`, `nc_consent` and `nc_username`. Without them the age
  gate, the cookie banner and the first-run sign-up sheet each cover the page
  and every heading reports as covered — by the thing deliberately covering it.
- It aborts `fonts.googleapis.com` and `fonts.gstatic.com`. The font host is
  unreachable from this sandbox, and left alone every navigation spends its
  timeout on a TLS handshake that cannot succeed. That measures the network,
  not the layout, and on a loaded machine it takes the whole run down.

When you add a page to the site, add it to `PAGES` in the sweep in the same
commit. A page that is not in the list is a page nothing checks.
