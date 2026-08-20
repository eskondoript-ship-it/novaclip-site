/* What comes back when you re-open a project.
   ---------------------------------------------------------------------------
   Everything a person does to a CLIP — the cut, the fades, the speed, the
   filters, the chroma key, the caption, the keyframes — already survived,
   because clips are saved whole and those things live on the clip. Measuring
   it was how we found what did NOT: the timeline zoom, which of the two
   layouts was open, where the playhead sat, which clip was selected, and the
   export settings. Five things that live on the editor rather than on any
   clip, and so were never in the snapshot.

   They are now, and putting them back is not a straight copy — a number read
   off disk has not been through the setter that would have clamped it, and the
   project it belongs to may have come back smaller than it went away, because
   restore() drops any clip whose media is missing. These are those rules,
   mirrored from editor.html. If they change there they have to change here,
   and this is what notices.
   --------------------------------------------------------------------------- */
import { test } from 'node:test';
import assert from 'node:assert';

/* Copies of zoomOf() and the view half of restore() in editor.html. */
function zoomOf(v, fallback) {
  v = Number(v);
  if (!isFinite(v) || v <= 0) return fallback;
  return Math.max(8, Math.min(400, v));
}

function restoreView(view, clips, cur) {
  view = view || {};
  let sel = null;
  for (const c of clips) if (c.id === view.selectedClipId) { sel = c.id; break; }
  const end = clips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
  let at = Number(view.playhead);
  if (!isFinite(at) || at < 0) at = 0;
  return {
    pixelsPerSecond: zoomOf(view.pixelsPerSecond, cur.pixelsPerSecond),
    mode: view.mode === 'simple' || view.mode === 'complex' ? view.mode : cur.mode,
    playhead: Math.min(at, end),
    selectedClipId: sel,
    isPlaying: false,
    exportSettings: Object.assign({}, cur.exportSettings, view.exportSettings || {})
  };
}

/* The editor's own defaults, so "fell back" is distinguishable from "kept". */
const CUR = {
  pixelsPerSecond: 80, mode: 'complex',
  exportSettings: { resolution: '1080p', fps: 30, bitrate: 8, codec: 'H.264', format: 'MP4' }
};
const CLIPS = [
  { id: 'clip-a', start: 0, duration: 4 },
  { id: 'clip-b', start: 4, duration: 2.5 }
];

test('the five editor-level things come back as they were left', () => {
  const out = restoreView({
    pixelsPerSecond: 137, mode: 'simple', playhead: 1.9, selectedClipId: 'clip-b',
    exportSettings: { resolution: '720p', format: 'WebM' }
  }, CLIPS, CUR);
  assert.equal(out.pixelsPerSecond, 137);
  assert.equal(out.mode, 'simple');
  assert.equal(out.playhead, 1.9);
  assert.equal(out.selectedClipId, 'clip-b');
  assert.equal(out.exportSettings.resolution, '720p');
  assert.equal(out.exportSettings.format, 'WebM');
  /* Merged, not replaced: an older snapshot that predates a setting must not
     erase today's default for it. */
  assert.equal(out.exportSettings.codec, 'H.264');
});

test('a project saved before any of this existed opens on the defaults', () => {
  const out = restoreView(undefined, CLIPS, CUR);
  assert.equal(out.pixelsPerSecond, 80);
  assert.equal(out.mode, 'complex');
  assert.equal(out.playhead, 0);
  assert.equal(out.selectedClipId, null);
  assert.deepEqual(out.exportSettings, CUR.exportSettings);
});

test('the zoom is held inside the range the editor itself allows', () => {
  /* Hand-edited storage, or a bug that wrote a silly number: either way a
     timeline at 40000 pixels a second is one clip filling the screen with no
     way to tell what happened. */
  assert.equal(zoomOf(40000, 80), 400);
  assert.equal(zoomOf(0.001, 80), 8);
  assert.equal(zoomOf(137, 80), 137);
});

test('a zoom that is not a number falls back rather than breaking the timeline', () => {
  for (const bad of [undefined, null, 'lots', NaN, Infinity, -20, 0])
    assert.equal(zoomOf(bad, 80), 80, String(bad));
});

test('an unknown layout name is ignored', () => {
  assert.equal(restoreView({ mode: 'wireframe' }, CLIPS, CUR).mode, 'complex');
  assert.equal(restoreView({ mode: null }, CLIPS, CUR).mode, 'complex');
});

test('the playhead cannot land past the end of what actually came back', () => {
  /* restore() drops clips whose media is gone, so a project can come back
     shorter than it was saved. A playhead left out in that empty space opens
     the project on black with nothing to say anything is there. */
  const survived = [CLIPS[0]];                    // clip-b's media went missing
  assert.equal(restoreView({ playhead: 5.5 }, survived, CUR).playhead, 4);
  assert.equal(restoreView({ playhead: 2 }, survived, CUR).playhead, 2);
});

test('a playhead of nonsense is frame zero, not NaN', () => {
  for (const bad of [undefined, null, 'start', NaN, -3])
    assert.equal(restoreView({ playhead: bad }, CLIPS, CUR).playhead, 0, String(bad));
});

test('a selection whose clip did not survive is dropped', () => {
  /* Otherwise the properties panel opens on a clip that is not there. */
  const survived = [CLIPS[0]];
  assert.equal(restoreView({ selectedClipId: 'clip-b' }, survived, CUR).selectedClipId, null);
  assert.equal(restoreView({ selectedClipId: 'clip-a' }, survived, CUR).selectedClipId, 'clip-a');
});

test('opening a project never starts it playing', () => {
  /* Arriving, not resuming. It was playing when the tab was closed; nobody
     wants it playing at them the moment the page loads. */
  assert.equal(restoreView({ isPlaying: true, playhead: 2 }, CLIPS, CUR).isPlaying, false);
});

test('an empty project puts the playhead at zero rather than somewhere', () => {
  assert.equal(restoreView({ playhead: 9 }, [], CUR).playhead, 0);
});
