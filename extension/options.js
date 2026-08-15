/* NovaClip Family Shield — options page
   ============================================================================
   Manifest V3 forbids inline scripts: a <script> block inside options.html is
   refused by the extension CSP and the page renders empty with only a console
   warning to say why. That is exactly what happened, so this lives in its own
   file.
   ---------------------------------------------------------------------------- */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  chrome.storage.local.get(['nc_family_settings', 'nc_family_log'], function (v) {
    var s = v.nc_family_settings, paired = !!s;
    if (!s) s = NCFilter.defaults('tween');

    var plats = [['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['twitch', 'Twitch']];
    var rows = [
      row('Filtering', s.enabled !== false ? 'on' : 'off', s.enabled !== false),
      row('Age profile', (NCFilter.PROFILES[s.profile] || {}).label || s.profile, true),
      row('Categories blocked', (s.categories || []).length + ' of ' + NCFilter.CATEGORIES.length, true),
      row('Settings', paired ? 'from the dashboard' : 'defaults — not paired yet', paired)
    ].concat(plats.map(function (p) {
      var enabled = !(s.platforms && s.platforms[p[0]] === false);
      return row(p[1], enabled ? 'filtered' : 'not filtered', enabled);
    }));
    $('status').innerHTML = rows.join('');

    var log = Array.isArray(v.nc_family_log) ? v.nc_family_log : [];
    if (!log.length) {
      $('log').innerHTML = '<p class="empty">Nothing blocked yet.</p>';
    } else {
      $('log').innerHTML = '<table>' + log.slice(0, 12).map(function (e) {
        return '<tr><td>' + esc(e.label || e.category) + '<br><span style="color:#6F8098;font-size:.8rem">' +
          esc(e.platform) + ' · ' + esc(e.where) + ' · ' + when(e.last) + '</span></td>' +
          '<td>' + e.count + '</td></tr>';
      }).join('') + '</table>';
      $('logNote').hidden = false;
    }
  });

  function row(label, value, good) {
    return '<div class="row"><span>' + esc(label) + '</span>' +
      '<span class="pill ' + (good ? 'on' : 'off') + '">' + esc(value) + '</span></div>';
  }
  function when(t) {
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60);
    return h < 24 ? h + 'h ago' : Math.round(h / 24) + 'd ago';
  }
})();
