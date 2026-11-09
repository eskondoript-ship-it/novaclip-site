# mp4-muxer

- **Version:** 5.2.1
- **Licence:** MIT — see `LICENSE` in this folder
- **Author:** Vanilagy
- **Source:** https://github.com/Vanilagy/mp4-muxer
- **Fetched from:** https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js
- **Size:** 32 KB

## Why it is here

`editor-export-offline.js` encodes the export with WebCodecs `VideoEncoder`,
which hands back encoded chunks and nothing else — there is no browser API
that writes those chunks into an MP4 file. This library does that one job.

It is vendored rather than loaded from a CDN for the same reason everything
else in `vendor/` is: the editor has to work offline, and a third-party
script that can change underneath a page is a script that can break exporting
without anybody touching this repository.

## What it is used for

One muxer per export, fed `addVideoChunk` and `addAudioChunk`, finalised into
an `ArrayBufferTarget`. `fastStart: 'in-memory'` puts the moov atom at the
front so the file plays while it is still downloading.

## Updating it

Replace the file, update the version above, and re-run an export: the check
that matters is `ffprobe` reporting `avg_frame_rate=30/1` and an audio stream
whose packet count is not zero.
