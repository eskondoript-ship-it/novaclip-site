/* Tells novaclip.org that the shield is here, and what its ID is.
 *
 * WHY THIS FILE EXISTS
 *
 * Pairing used to be: install the extension, find the 32-character ID Chrome
 * prints under its name, select it without catching the surrounding text, come
 * back to the site, paste it, press a button. That is a developer's chore
 * handed to a parent, and it is the step people gave up on.
 *
 * The extension already knows its own ID. It runs on novaclip.org anyway now,
 * so it simply says so, and the site pairs itself. Nobody copies anything.
 *
 * WHAT IT CAN AND CANNOT SEE
 *
 * A content script runs in an isolated world: it shares the DOM with the page
 * and nothing else — not the page's variables, not its functions. Talking to
 * the page therefore goes through the two channels both sides can reach, and
 * this file uses both because they fail in different situations:
 *
 *   - an attribute on <html>, set at document_start, so a page that is already
 *     rendered can read the ID synchronously without waiting for a message
 *   - window.postMessage, for the page that was listening before the extension
 *     was installed and wants to be told the moment it appears
 *
 * It announces and answers. It never reads the page, and it sends nothing but
 * its own ID and version — both of which the parent could read off the Chrome
 * extensions screen themselves.
 */
(function () {
  var id, version;
  try {
    id = chrome.runtime.id;
    version = (chrome.runtime.getManifest() || {}).version || '';
  } catch (e) { return; }        /* no extension context: nothing to announce */
  if (!id) return;

  /* document_start, so documentElement exists but <body> may not. */
  try {
    document.documentElement.setAttribute('data-nc-shield', id);
    document.documentElement.setAttribute('data-nc-shield-version', version);
  } catch (e) {}

  function announce() {
    try {
      window.postMessage({ source: 'novaclip-family-shield', id: id, version: version }, location.origin);
    } catch (e) {}
  }

  /* The page asks when it loads; answering an explicit probe means the site
     does not have to guess how long to wait for us. */
  window.addEventListener('message', function (e) {
    if (e.source !== window) return;
    var d = e.data;
    if (d && d.source === 'novaclip-shield-probe') announce();
  }, false);

  announce();
  document.addEventListener('DOMContentLoaded', announce, { once: true });
  window.addEventListener('load', announce, { once: true });
})();
