/* NovaClip Family Shield — service worker
   ============================================================================
   Two jobs, both small:

     1. Keep the blocked-attempt log the dashboard shows a parent.
     2. Accept settings from the Family Dashboard page when it pairs.

   No network calls. Settings live in chrome.storage.local and never leave the
   device, because a filter that ships a child's browsing to a server is a
   worse privacy problem than the one it solves.
   ---------------------------------------------------------------------------- */
const LOG_KEY = 'nc_family_log';
const LOG_MAX = 300;

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || msg.type !== 'ncfs-blocked') return;
  chrome.storage.local.get([LOG_KEY], (v) => {
    const log = Array.isArray(v[LOG_KEY]) ? v[LOG_KEY] : [];
    const item = msg.item || {};

    /* One entry per category per hour per platform. Without this an infinite
       feed writes hundreds of identical rows and the log stops being
       readable — which is the only thing it is for. */
    const bucket = Math.floor((item.at || Date.now()) / 3600000);
    const key = [item.platform, item.category, item.where, bucket].join('|');
    const existing = log.find(e => e.key === key);
    if (existing) {
      existing.count++;
      existing.last = item.at;
    } else {
      log.unshift({ key, platform: item.platform, category: item.category,
        label: item.label, where: item.where, first: item.at, last: item.at, count: 1 });
    }
    chrome.storage.local.set({ [LOG_KEY]: log.slice(0, LOG_MAX) });
  });
  return false;
});

/* Pairing: the dashboard sends settings, the shield stores them. Only pages on
   the NovaClip origins may do this — externally_connectable is not used
   because it cannot be narrowed per-message, so the check is explicit. */
const ALLOWED = [/^https:\/\/novaclip\.[a-z.]+$/, /^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/127\.0\.0\.1(:\d+)?$/];

chrome.runtime.onMessageExternal.addListener((msg, sender, reply) => {
  const origin = sender.origin || '';
  if (!ALLOWED.some(r => r.test(origin))) { reply({ ok: false, error: 'origin not allowed' }); return; }
  if (!msg || msg.type !== 'ncfs-settings') { reply({ ok: false, error: 'unknown message' }); return; }
  chrome.storage.local.set({ nc_family_settings: msg.settings }, () => reply({ ok: true, version: '1.0.0' }));
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['nc_family_settings'], (v) => {
    if (!v.nc_family_settings) chrome.runtime.openOptionsPage();
  });
});
