/* ============================================================================
   NOVATOOLS — the hand-built additions
   ============================================================================
   tools-data.js generates the conversion families. This file is the opposite:
   every tool here is its own thing, with its own interface and its own logic,
   across the categories that were asked for — text, developer, images, audio,
   video, generators, maths, marketing and AI.

   THE RULE THIS FILE FOLLOWS

   Nothing that needs a key, a server or a model download. Everything runs in
   the tab, offline, on the visitor's own data. That is not a limitation being
   worked around, it is the whole promise of the page: "nothing uploads" is
   only true if it is true of every tool on it.

   Which is why the AI category here is small and does what it says. Tools that
   would need a model are not listed as "coming soon" — they are not listed.
   ========================================================================== */
(function () {
  'use strict';
  if (window.NC_TOOLS_EXTRA) return;

  var L = [];      // catalogue entries
  var M = {};      // implementations

  /* Shorthands matching tools.html's own helpers, so these look native. */
  function ta(id, ph) {
    return "<textarea id='" + id + "' placeholder='" + ph + "'></textarea>";
  }
  function inp(id, ph, val, type) {
    return "<input id='" + id + "'" + (type ? " type='" + type + "'" : '') +
           " placeholder='" + (ph || '') + "'" + (val != null ? " value='" + val + "'" : '') + '>';
  }
  function field(label, inner) {
    return "<div class='field'><label>" + label + '</label>' + inner + '</div>';
  }
  function sel(id, opts) {
    return "<select id='" + id + "'>" +
      opts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
  }
  var OUT = "<div class='out' id='o'></div>";
  var NOTE = "<p class='note' id='n'></p>";
  var $ = function (id) { return document.getElementById(id); };
  function say(v, note) {
    var o = $('o'); if (o) o.textContent = v;
    var n = $('n'); if (n && note != null) n.textContent = note;
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[<>&]/g, function (m) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m];
    });
  }
  /* Wire every input in the panel to one handler. Almost every tool here is
     "type and see", which is the right default for something this small. */
  function live(ids, fn) {
    ids.forEach(function (i) {
      var el = $(i);
      if (!el) return;
      el.oninput = fn;
      el.onchange = fn;
    });
    fn();
  }

  function add(id, cat, name, desc, html, wire) {
    /* Seven tools in the first draft of this file reused ids that already
       existed in tools.html. Nothing complained: the page's own IMPL is
       checked first, so the duplicates silently opened the OLD tool while
       still counting towards the catalogue total. Two of them had different
       interfaces from the ones they shadowed.

       Shouting about it in the console is the cheapest possible fix, and it
       is the check that would have caught all seven. */
    if (M[id]) {
      try { console.warn('NovaTools: duplicate id in tools-extra.js — ' + id); } catch (e) {}
      return;
    }
    L.push({ id: id, cat: cat, name: name, desc: desc });
    M[id] = { html: html, wire: wire };
  }

  /* ==========================================================================
     TEXT
     ======================================================================== */
  add('char-frequency', 'text', 'Letter frequency', 'Which letters and words a piece of text leans on.',
    ta('t', 'Paste some text…') + OUT + NOTE,
    function () {
      live(['t'], function () {
        var v = ($('t').value || '').toLowerCase();
        var f = {}, total = 0;
        for (var i = 0; i < v.length; i++) {
          var c = v.charAt(i);
          if (c >= 'a' && c <= 'z') { f[c] = (f[c] || 0) + 1; total++; }
        }
        if (!total) return say('—', '');
        var rows = Object.keys(f).sort(function (a, b) { return f[b] - f[a]; }).slice(0, 12);
        say(rows.map(function (c) {
          return c + '  ' + f[c] + '  ' + (f[c] / total * 100).toFixed(1) + '%';
        }).join('\n'), total + ' letters counted. Punctuation and spaces are ignored.');
      });
    });

  add('reading-level', 'text', 'Reading level', 'Flesch reading ease and the school year it maps to.',
    ta('t', 'Paste a paragraph…') + OUT + NOTE,
    function () {
      live(['t'], function () {
        var v = ($('t').value || '').trim();
        var words = (v.match(/[A-Za-z']+/g) || []);
        var sents = (v.match(/[^.!?]+[.!?]+/g) || []).length || (words.length ? 1 : 0);
        if (!words.length || !sents) return say('—', 'Needs at least one sentence.');
        /* Syllables by vowel groups. It is the standard approximation and it
           is wrong on words like "queue" — the score is a guide, not a grade. */
        var syl = 0;
        words.forEach(function (w) {
          w = w.toLowerCase().replace(/e$/, '');
          var g = w.match(/[aeiouy]+/g);
          syl += Math.max(1, g ? g.length : 1);
        });
        var wps = words.length / sents, spw = syl / words.length;
        var ease = 206.835 - 1.015 * wps - 84.6 * spw;
        var grade = 0.39 * wps + 11.8 * spw - 15.59;
        var band = ease >= 90 ? 'very easy' : ease >= 70 ? 'easy' : ease >= 60 ? 'plain'
                 : ease >= 50 ? 'fairly hard' : ease >= 30 ? 'hard' : 'very hard';
        say('Reading ease  ' + ease.toFixed(1) + '  (' + band + ')\n' +
            'School grade  ' + Math.max(1, grade).toFixed(1) + '\n' +
            'Words/sentence  ' + wps.toFixed(1) + '\n' +
            'Syllables/word  ' + spw.toFixed(2),
            'Flesch–Kincaid. Syllables are counted by vowel groups, which is the ' +
            'usual approximation and is wrong on words like "queue".');
      });
    });

  add('text-diff', 'text', 'Compare two texts', 'Line by line, what changed between two versions.',
    field('Original', ta('a', 'First version')) + field('Changed', ta('b', 'Second version')) + OUT,
    function () {
      live(['a', 'b'], function () {
        var A = ($('a').value || '').split('\n'), B = ($('b').value || '').split('\n');
        var out = [], n = Math.max(A.length, B.length);
        for (var i = 0; i < n; i++) {
          var x = A[i], y = B[i];
          if (x === y) out.push('  ' + (x == null ? '' : x));
          else {
            if (x != null) out.push('- ' + x);
            if (y != null) out.push('+ ' + y);
          }
        }
        say(out.join('\n'), '');
      });
    });

  add('remove-duplicates', 'text', 'Remove duplicate lines', 'Keeps the first of each, in order.',
    ta('t', 'One item per line') + field('', "<label><input type='checkbox' id='ci'> ignore case</label>") + OUT + NOTE,
    function () {
      live(['t', 'ci'], function () {
        var lines = ($('t').value || '').split('\n');
        var seen = {}, out = [], ci = $('ci').checked;
        lines.forEach(function (l) {
          var k = ci ? l.toLowerCase() : l;
          if (seen[k]) return;
          seen[k] = 1; out.push(l);
        });
        say(out.join('\n'), lines.length - out.length + ' duplicate lines removed.');
      });
    });

  add('text-stats-adv', 'text', 'Keyword density', 'The words a piece of writing actually repeats.',
    ta('t', 'Paste an article…') + OUT + NOTE,
    function () {
      var STOP = ('the a an and or but if then than that this these those of to in on at for with ' +
        'is are was were be been being it its as by from we you they he she i not no do does did ' +
        'have has had will would can could should our your their my me him her them what which who')
        .split(' ');
      live(['t'], function () {
        var words = (($('t').value || '').toLowerCase().match(/[a-z']{2,}/g) || []);
        var f = {}, total = 0;
        words.forEach(function (w) {
          if (STOP.indexOf(w) >= 0) return;
          f[w] = (f[w] || 0) + 1; total++;
        });
        if (!total) return say('—', '');
        var top = Object.keys(f).sort(function (a, b) { return f[b] - f[a]; }).slice(0, 20);
        say(top.map(function (w) {
          return f[w] + '  ' + (f[w] / total * 100).toFixed(1) + '%  ' + w;
        }).join('\n'), total + ' words counted, common filler words excluded.');
      });
    });

  add('reverse-text', 'text', 'Reverse text', 'By character, by word, or by line.',
    ta('t', 'Some text') + field('Reverse', sel('m', ['Characters', 'Words', 'Lines'])) + OUT,
    function () {
      live(['t', 'm'], function () {
        var v = $('t').value || '', m = $('m').value;
        /* Array.from, not split(''): split breaks surrogate pairs and turns an
           emoji into two broken halves. */
        say(m === 'Characters' ? Array.from(v).reverse().join('')
          : m === 'Words' ? v.split(/\s+/).reverse().join(' ')
          : v.split('\n').reverse().join('\n'), '');
      });
    });

  /* ==========================================================================
     DEVELOPER
     ======================================================================== */
  add('cron', 'developer', 'Cron expression reader', 'Says in English what a cron line means.',
    field('Expression', inp('t', '0 9 * * 1-5', '0 9 * * 1-5')) + OUT + NOTE,
    function () {
      var DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var MON = ['','January','February','March','April','May','June','July','August',
                 'September','October','November','December'];
      live(['t'], function () {
        var p = ($('t').value || '').trim().split(/\s+/);
        if (p.length !== 5) return say('—', 'A cron line has five fields: minute hour day month weekday.');
        function part(v, name, names) {
          if (v === '*') return 'every ' + name;
          if (/^\*\/(\d+)$/.test(v)) return 'every ' + RegExp.$1 + ' ' + name + 's';
          if (/^(\d+)-(\d+)$/.test(v)) {
            var a = RegExp.$1, b = RegExp.$2;
            return name + ' ' + (names ? names[+a] + ' to ' + names[+b] : a + ' to ' + b);
          }
          if (v.indexOf(',') >= 0) {
            return name + ' ' + v.split(',').map(function (x) {
              return names ? names[+x] : x;
            }).join(', ');
          }
          return name + ' ' + (names ? names[+v] : v);
        }
        say(['At ' + part(p[0], 'minute'), part(p[1], 'hour'),
             'on ' + part(p[2], 'day of the month'),
             'in ' + part(p[3], 'month', MON),
             'on ' + part(p[4], 'weekday', DOW)].join(', ') + '.',
            'Read literally. Cron treats day-of-month and day-of-week as OR when both are set, ' +
            'which is the classic surprise.');
      });
    });

  add('regex-test', 'developer', 'Regex tester', 'Try a pattern against text and see every match.',
    field('Pattern', inp('re', '\\d+', '\\d+')) +
    field('Flags', inp('fl', 'gi', 'g')) + ta('t', 'Text to search') + OUT + NOTE,
    function () {
      live(['re', 'fl', 't'], function () {
        var p = $('re').value, f = $('fl').value, v = $('t').value || '';
        if (!p) return say('—', '');
        var rx;
        try { rx = new RegExp(p, f.indexOf('g') < 0 ? f + 'g' : f); }
        catch (e) { return say('—', 'Not a valid pattern: ' + e.message); }
        var out = [], m, guard = 0;
        while ((m = rx.exec(v)) !== null) {
          out.push(m.index + ': ' + m[0] + (m.length > 1 ? '   groups: ' + m.slice(1).join(' | ') : ''));
          /* A pattern that can match empty stops the engine advancing. */
          if (m.index === rx.lastIndex) rx.lastIndex++;
          if (++guard > 5000) break;
        }
        say(out.length ? out.join('\n') : 'no matches', out.length + ' matches.');
      });
    });

  add('json-to-csv', 'developer', 'JSON to CSV', 'An array of objects becomes a spreadsheet.',
    ta('t', '[{"name":"Ari","score":9}]') + OUT + NOTE,
    function () {
      live(['t'], function () {
        var v = ($('t').value || '').trim();
        if (!v) return say('—', '');
        var data;
        try { data = JSON.parse(v); } catch (e) { return say('—', 'Not valid JSON: ' + e.message); }
        if (!Array.isArray(data)) return say('—', 'Needs an array of objects at the top level.');
        if (!data.length) return say('', 'Empty array.');
        var cols = [];
        data.forEach(function (r) {
          Object.keys(r || {}).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); });
        });
        function cell(x) {
          if (x == null) return '';
          var s = typeof x === 'object' ? JSON.stringify(x) : String(x);
          /* Quote if it contains a comma, a quote or a newline — and double
             any quote inside. This is the whole of RFC 4180 that matters. */
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        }
        say([cols.join(',')].concat(data.map(function (r) {
          return cols.map(function (c) { return cell((r || {})[c]); }).join(',');
        })).join('\n'), data.length + ' rows, ' + cols.length + ' columns.');
      });
    });

  add('csv-to-json', 'developer', 'CSV to JSON', 'A pasted spreadsheet becomes an array of objects.',
    ta('t', 'name,score\nAri,9') + OUT + NOTE,
    function () {
      live(['t'], function () {
        var v = ($('t').value || '').trim();
        if (!v) return say('—', '');
        /* A real parser, not split(','): a quoted field can contain commas and
           newlines, and splitting mangles every export from a spreadsheet. */
        var rows = [], row = [], cur = '', q = false;
        for (var i = 0; i < v.length; i++) {
          var c = v.charAt(i);
          if (q) {
            if (c === '"') { if (v.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; }
            else cur += c;
          } else if (c === '"') q = true;
          else if (c === ',') { row.push(cur); cur = ''; }
          else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
          else if (c !== '\r') cur += c;
        }
        row.push(cur); rows.push(row);
        var head = rows.shift() || [];
        say(JSON.stringify(rows.filter(function (r) {
          return r.length > 1 || r[0] !== '';
        }).map(function (r) {
          var o = {};
          head.forEach(function (h, j) { o[h] = r[j] == null ? '' : r[j]; });
          return o;
        }), null, 2), rows.length + ' rows.');
      });
    });

  add('escape-string', 'developer', 'String escaper', 'Escape text for JSON, JS, SQL or a shell.',
    ta('t', "it's a \"test\"") + field('For', sel('m', ['JSON', 'JavaScript', 'SQL', 'Shell'])) + OUT + NOTE,
    function () {
      live(['t', 'm'], function () {
        var v = $('t').value || '', m = $('m').value;
        if (m === 'JSON' || m === 'JavaScript') say(JSON.stringify(v), '');
        else if (m === 'SQL') say("'" + v.replace(/'/g, "''") + "'",
          'Escaping by hand is a last resort. Use a parameterised query and this problem ' +
          'stops existing.');
        else say("'" + v.replace(/'/g, "'\\''") + "'",
          'Single quotes, because inside them a shell expands nothing at all.');
      });
    });

  add('diff-timestamps', 'developer', 'Time between two dates', 'Days, hours and working days.',
    field('From', inp('a', '', '', 'datetime-local')) +
    field('To', inp('b', '', '', 'datetime-local')) + OUT + NOTE,
    function () {
      live(['a', 'b'], function () {
        var a = new Date($('a').value), b = new Date($('b').value);
        if (isNaN(a) || isNaN(b)) return say('—', 'Pick both dates.');
        var ms = Math.abs(b - a), s = Math.floor(ms / 1000);
        var days = Math.floor(s / 86400);
        var work = 0, d = new Date(Math.min(a, b));
        var end = new Date(Math.max(a, b));
        while (d < end && work < 100000) {
          var w = d.getDay();
          if (w !== 0 && w !== 6) work++;
          d.setDate(d.getDate() + 1);
        }
        say(days + ' days\n' + Math.floor(s / 3600) + ' hours\n' +
            Math.floor(s / 60) + ' minutes\n' + work + ' weekdays',
            'Weekdays count Monday to Friday and ignore public holidays.');
      });
    });

  /* ==========================================================================
     MATHS
     ======================================================================== */
  add('quadratic', 'math', 'Quadratic solver', 'Roots of ax² + bx + c, real or complex.',
    field('a', inp('a', '', '1', 'number')) + field('b', inp('b', '', '-3', 'number')) +
    field('c', inp('c', '', '2', 'number')) + OUT + NOTE,
    function () {
      live(['a', 'b', 'c'], function () {
        var a = parseFloat($('a').value), b = parseFloat($('b').value), c = parseFloat($('c').value);
        if (!isFinite(a) || !isFinite(b) || !isFinite(c)) return say('—', '');
        if (a === 0) {
          if (b === 0) return say('—', 'With a and b both zero this is not an equation in x.');
          return say('x = ' + (-c / b), 'a is zero, so this is linear, not quadratic.');
        }
        var d = b * b - 4 * a * c;
        if (d > 0) {
          say('x₁ = ' + ((-b + Math.sqrt(d)) / (2 * a)) + '\nx₂ = ' + ((-b - Math.sqrt(d)) / (2 * a)),
              'Discriminant ' + d + ' — two real roots.');
        } else if (d === 0) {
          say('x = ' + (-b / (2 * a)), 'Discriminant zero — one repeated root.');
        } else {
          var re = -b / (2 * a), im = Math.sqrt(-d) / (2 * a);
          say('x₁ = ' + re + ' + ' + im + 'i\nx₂ = ' + re + ' − ' + im + 'i',
              'Discriminant ' + d + ' — no real roots, so the pair is complex.');
        }
      });
    });

  add('prime-check', 'math', 'Prime checker & factors', 'Is it prime, and if not what divides it.',
    field('Number', inp('n', '', '360', 'number')) + OUT + NOTE,
    function () {
      live(['n'], function () {
        var n = parseInt($('n').value, 10);
        if (!isFinite(n) || n < 2) return say('—', 'Primes start at 2.');
        if (n > 1e12) return say('—', 'Too big to factor here without keeping the tab busy.');
        var f = [], m = n;
        for (var p = 2; p * p <= m; p++) {
          while (m % p === 0) { f.push(p); m /= p; }
        }
        if (m > 1) f.push(m);
        say(f.length === 1 ? n + ' is prime.' : n + ' = ' + f.join(' × '),
            f.length === 1 ? '' : f.length + ' prime factors.');
      });
    });

  add('compound-interest', 'math', 'Compound interest', 'What a sum grows to, and what you put in.',
    field('Starting amount', inp('p', '', '1000', 'number')) +
    field('Added each month', inp('m', '', '50', 'number')) +
    field('Annual rate %', inp('r', '', '5', 'number')) +
    field('Years', inp('y', '', '10', 'number')) + OUT + NOTE,
    function () {
      live(['p', 'm', 'r', 'y'], function () {
        var p = parseFloat($('p').value) || 0, m = parseFloat($('m').value) || 0;
        var r = (parseFloat($('r').value) || 0) / 100, y = parseFloat($('y').value) || 0;
        if (y < 0) return say('—', '');
        var months = Math.round(y * 12), i = r / 12, bal = p;
        for (var k = 0; k < months; k++) bal = bal * (1 + i) + m;
        var paid = p + m * months;
        say('Final balance   ' + bal.toFixed(2) + '\nYou put in      ' + paid.toFixed(2) +
            '\nInterest earned ' + (bal - paid).toFixed(2),
            'Compounded monthly, contributions at the end of each month. Ignores tax, fees and ' +
            'inflation — all three of which are real.');
      });
    });

  add('loan', 'math', 'Loan repayment', 'Monthly payment and what the borrowing costs.',
    field('Amount', inp('p', '', '10000', 'number')) +
    field('Annual rate %', inp('r', '', '6', 'number')) +
    field('Years', inp('y', '', '5', 'number')) + OUT + NOTE,
    function () {
      live(['p', 'r', 'y'], function () {
        var p = parseFloat($('p').value) || 0;
        var r = (parseFloat($('r').value) || 0) / 100 / 12;
        var n = Math.round((parseFloat($('y').value) || 0) * 12);
        if (!p || !n) return say('—', '');
        var pay = r === 0 ? p / n : p * r / (1 - Math.pow(1 + r, -n));
        say('Monthly payment  ' + pay.toFixed(2) + '\nTotal repaid     ' + (pay * n).toFixed(2) +
            '\nInterest         ' + (pay * n - p).toFixed(2),
            'Standard amortising loan. A real quote will differ — arrangement fees and the exact ' +
            'day count both move it.');
      });
    });

  add('triangle', 'math', 'Triangle solver', 'Area, perimeter and angles from three sides.',
    field('Side a', inp('a', '', '3', 'number')) + field('Side b', inp('b', '', '4', 'number')) +
    field('Side c', inp('c', '', '5', 'number')) + OUT + NOTE,
    function () {
      live(['a', 'b', 'c'], function () {
        var a = parseFloat($('a').value), b = parseFloat($('b').value), c = parseFloat($('c').value);
        if (![a, b, c].every(function (x) { return isFinite(x) && x > 0; })) return say('—', '');
        if (a + b <= c || a + c <= b || b + c <= a) {
          return say('—', 'No triangle has these sides — any two must add to more than the third.');
        }
        var s = (a + b + c) / 2;
        var area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        var deg = function (x) { return (x * 180 / Math.PI).toFixed(3); };
        var A = Math.acos((b * b + c * c - a * a) / (2 * b * c));
        var B = Math.acos((a * a + c * c - b * b) / (2 * a * c));
        say('Area       ' + area.toFixed(6) + '\nPerimeter  ' + (a + b + c) +
            '\nAngle A    ' + deg(A) + '°\nAngle B    ' + deg(B) +
            '°\nAngle C    ' + deg(Math.PI - A - B) + '°',
            "Heron's formula for the area, cosine rule for the angles.");
      });
    });

  add('fraction', 'math', 'Fraction simplifier', 'Lowest terms, decimal and percentage.',
    field('Numerator', inp('a', '', '84', 'number')) +
    field('Denominator', inp('b', '', '126', 'number')) + OUT,
    function () {
      live(['a', 'b'], function () {
        var a = parseInt($('a').value, 10), b = parseInt($('b').value, 10);
        if (!isFinite(a) || !isFinite(b) || b === 0) return say('—', 'A denominator of zero is not a fraction.');
        function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = y; y = x % y; x = t; } return x; }
        var g = gcd(a, b) || 1;
        say(a + '/' + b + '  =  ' + (a / g) + '/' + (b / g) + '\ndecimal  ' + (a / b) +
            '\npercent  ' + (a / b * 100).toFixed(4) + '%', 'Divided by a common factor of ' + g + '.');
      });
    });

  /* ==========================================================================
     MARKETING
     ======================================================================== */
  add('headline-score', 'marketing', 'Headline checker', 'Length, word balance and what gets cut off.',
    field('Headline', inp('t', 'How I edited this in ten minutes', 'How I edited this in ten minutes')) + OUT + NOTE,
    function () {
      var POWER = ('you your how why what free new best worst never always secret proven easy fast ' +
        'stop start finally actually really truth mistake').split(' ');
      var EMO = ('amazing incredible shocking unbelievable insane crazy epic ultimate perfect').split(' ');
      live(['t'], function () {
        var v = ($('t').value || '').trim();
        if (!v) return say('—', '');
        var words = v.split(/\s+/);
        var lower = v.toLowerCase();
        var power = POWER.filter(function (w) { return lower.indexOf(w) >= 0; });
        var emo = EMO.filter(function (w) { return lower.indexOf(w) >= 0; });
        say('Characters   ' + v.length + (v.length > 60 ? '  (long)' : '') +
            '\nWords        ' + words.length +
            '\nYouTube      ' + (v.length > 70 ? v.slice(0, 70) + '…  (cut)' : 'fits') +
            '\nGoogle       ' + (v.length > 60 ? v.slice(0, 60) + '…  (cut)' : 'fits') +
            '\nStrong words ' + (power.length ? power.join(', ') : 'none') +
            '\nHype words   ' + (emo.length ? emo.join(', ') : 'none'),
            'Hype words are flagged, not rewarded. They raise clicks and lower trust, and on a ' +
            'channel you want people to come back to that is the wrong trade.');
      });
    });

  add('hashtags', 'marketing', 'Hashtag builder', 'Turns a topic into tags, sized per platform.',
    field('Topic words', inp('t', 'video editing beginner', 'video editing beginner')) +
    field('Platform', sel('p', ['Instagram (30)', 'TikTok (5)', 'YouTube (15)', 'X (2)'])) + OUT + NOTE,
    function () {
      live(['t', 'p'], function () {
        var w = ($('t').value || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
        if (!w.length) return say('—', '');
        var caps = { 'Instagram (30)': 30, 'TikTok (5)': 5, 'YouTube (15)': 15, 'X (2)': 2 };
        var cap = caps[$('p').value];
        var out = [];
        w.forEach(function (x) { out.push('#' + x); });
        for (var i = 0; i < w.length; i++) {
          for (var j = i + 1; j < w.length; j++) out.push('#' + w[i] + w[j]);
        }
        out.push('#' + w.join(''));
        var seen = {}, list = out.filter(function (t) {
          if (seen[t] || t.length < 4) return false; seen[t] = 1; return true;
        }).slice(0, cap);
        say(list.join(' '), list.length + ' of a ' + cap + ' limit. Tags built from your own words — ' +
            'a generator that invents trending tags is guessing, and the wrong tag is worse than none.');
      });
    });

  add('ab-test', 'marketing', 'A/B test significance', 'Whether a difference in clicks is real or noise.',
    field('A: shown', inp('an', '', '1000', 'number')) + field('A: clicks', inp('ac', '', '100', 'number')) +
    field('B: shown', inp('bn', '', '1000', 'number')) + field('B: clicks', inp('bc', '', '130', 'number')) +
    OUT + NOTE,
    function () {
      live(['an', 'ac', 'bn', 'bc'], function () {
        var an = +$('an').value, ac = +$('ac').value, bn = +$('bn').value, bc = +$('bc').value;
        if (!an || !bn || ac > an || bc > bn) return say('—', 'Clicks cannot exceed the number shown.');
        var p1 = ac / an, p2 = bc / bn, p = (ac + bc) / (an + bn);
        var se = Math.sqrt(p * (1 - p) * (1 / an + 1 / bn));
        if (!se) return say('—', '');
        var z = (p2 - p1) / se;
        /* Normal CDF by the Abramowitz–Stegun erf approximation. */
        var t = 1 / (1 + 0.2316419 * Math.abs(z));
        var d = 0.3989423 * Math.exp(-z * z / 2);
        var pv = 2 * d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        say('A  ' + (p1 * 100).toFixed(2) + '%\nB  ' + (p2 * 100).toFixed(2) + '%\n' +
            'Lift  ' + ((p2 - p1) / (p1 || 1) * 100).toFixed(1) + '%\n' +
            'p-value  ' + pv.toFixed(4) + '\n' +
            (pv < 0.05 ? 'Significant at 95%.' : 'Not significant — this could be noise.'),
            pv < 0.05 ? 'Significant does not mean large. Look at the lift too.'
                      : 'Run it longer, or accept that the difference may not be there.');
      });
    });

  add('roi', 'marketing', 'Campaign ROI', 'What it cost, what it made, and whether that is good.',
    field('Spend', inp('s', '', '200', 'number')) +
    field('Revenue', inp('r', '', '650', 'number')) +
    field('Conversions', inp('c', '', '26', 'number')) + OUT + NOTE,
    function () {
      live(['s', 'r', 'c'], function () {
        var s = parseFloat($('s').value) || 0, r = parseFloat($('r').value) || 0;
        var c = parseFloat($('c').value) || 0;
        if (!s) return say('—', 'Spend cannot be zero.');
        say('Profit         ' + (r - s).toFixed(2) +
            '\nROI            ' + ((r - s) / s * 100).toFixed(1) + '%' +
            '\nROAS           ' + (r / s).toFixed(2) + 'x' +
            (c ? '\nCost per sale  ' + (s / c).toFixed(2) : '') +
            (c ? '\nValue per sale ' + (r / c).toFixed(2) : ''),
            'Revenue, not profit — if the thing you sold cost you money to make, the real ROI is lower.');
      });
    });

  /* ==========================================================================
     IMAGES / VIDEO / AUDIO / GENERATORS
     ======================================================================== */
  add('image-resize-calc', 'images', 'Resize calculator', 'Keep the aspect ratio when you change one side.',
    field('Original width', inp('w', '', '1920', 'number')) +
    field('Original height', inp('h', '', '1080', 'number')) +
    field('New width', inp('nw', 'leave blank to solve', '', 'number')) +
    field('New height', inp('nh', 'leave blank to solve', '', 'number')) + OUT + NOTE,
    function () {
      live(['w', 'h', 'nw', 'nh'], function () {
        var w = +$('w').value, h = +$('h').value;
        var nw = parseFloat($('nw').value), nh = parseFloat($('nh').value);
        if (!w || !h) return say('—', '');
        function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
        var g = gcd(w, h) || 1;
        var ratio = (w / g) + ':' + (h / g);
        if (isFinite(nw) && nw > 0) say(Math.round(nw) + ' × ' + Math.round(nw * h / w), 'Aspect ratio ' + ratio + '.');
        else if (isFinite(nh) && nh > 0) say(Math.round(nh * w / h) + ' × ' + Math.round(nh), 'Aspect ratio ' + ratio + '.');
        else say(w + ' × ' + h, 'Aspect ratio ' + ratio + '. Fill in one new side and the other follows.');
      });
    });

  add('color-contrast', 'images', 'Colour contrast checker', 'Whether text on a background is readable.',
    field('Text colour', inp('a', '#ffffff', '#ffffff')) +
    field('Background', inp('b', '#7DFF00', '#7DFF00')) + OUT + NOTE,
    function () {
      function lum(hex) {
        var m = String(hex).replace('#', '').trim();
        if (m.length === 3) m = m.split('').map(function (c) { return c + c; }).join('');
        if (!/^[0-9a-f]{6}$/i.test(m)) return null;
        var v = [0, 2, 4].map(function (i) {
          var c = parseInt(m.substr(i, 2), 16) / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
      }
      live(['a', 'b'], function () {
        var la = lum($('a').value), lb = lum($('b').value);
        if (la == null || lb == null) return say('—', 'Use a hex colour like #7DFF00.');
        var hi = Math.max(la, lb), lo = Math.min(la, lb);
        var r = (hi + 0.05) / (lo + 0.05);
        say('Contrast ' + r.toFixed(2) + ':1\n\n' +
            'Body text   ' + (r >= 4.5 ? 'passes AA' : 'fails AA') + '\n' +
            'Large text  ' + (r >= 3 ? 'passes AA' : 'fails AA') + '\n' +
            'AAA body    ' + (r >= 7 ? 'passes' : 'fails'),
            'WCAG 2.1. Large means 24px, or 19px bold.');
      });
    });

  add('bitrate', 'video', 'File size from bitrate', 'How big a video will be, or what bitrate fits.',
    field('Minutes', inp('m', '', '10', 'number')) +
    field('Video bitrate (Mbps)', inp('v', '', '8', 'number')) +
    field('Audio bitrate (kbps)', inp('a', '', '192', 'number')) + OUT + NOTE,
    function () {
      live(['m', 'v', 'a'], function () {
        var m = parseFloat($('m').value) || 0, v = parseFloat($('v').value) || 0;
        var a = parseFloat($('a').value) || 0;
        var secs = m * 60;
        var bits = secs * (v * 1e6 + a * 1000);
        var bytes = bits / 8;
        say((bytes / 1e9).toFixed(3) + ' GB\n' + (bytes / 1e6).toFixed(1) + ' MB\n' +
            (bytes / 1048576).toFixed(1) + ' MiB',
            'Megabits per second, decimal — the unit every encoder uses. MiB is what your ' +
            'operating system will call it, which is why the two never match.');
      });
    });

  add('frame-calc', 'video', 'Frames and timecode', 'Convert between frames, seconds and timecode.',
    field('Frame rate', sel('f', ['24', '25', '30', '50', '60', '23.976', '29.97'])) +
    field('Timecode or frames', inp('t', '00:01:30:00', '00:01:30:00')) + OUT + NOTE,
    function () {
      live(['f', 't'], function () {
        var fps = parseFloat($('f').value);
        var v = ($('t').value || '').trim();
        if (!v) return say('—', '');
        var frames;
        if (v.indexOf(':') >= 0) {
          var p = v.split(':').map(Number);
          while (p.length < 4) p.unshift(0);
          frames = ((p[0] * 3600 + p[1] * 60 + p[2]) * fps) + p[3];
        } else frames = parseFloat(v);
        if (!isFinite(frames)) return say('—', 'Use frames, or hh:mm:ss:ff.');
        var secs = frames / fps;
        var h = Math.floor(secs / 3600), mn = Math.floor(secs % 3600 / 60);
        var s = Math.floor(secs % 60), f = Math.round(frames % fps);
        say('Frames    ' + Math.round(frames) + '\nSeconds   ' + secs.toFixed(3) +
            '\nTimecode  ' + [h, mn, s].map(function (x) { return String(x).padStart(2, '0'); }).join(':') +
            ':' + String(f).padStart(2, '0'),
            fps === 29.97 || fps === 23.976
              ? 'Non-integer rate. This is non-drop-frame arithmetic; broadcast drop-frame timecode ' +
                'skips numbers to stay in step with the clock and will differ.'
              : '');
      });
    });

  add('bpm-delay', 'audio', 'BPM to delay & note lengths', 'Delay and reverb times that sit in the groove.',
    field('BPM', inp('b', '', '120', 'number')) + OUT + NOTE,
    function () {
      live(['b'], function () {
        var b = parseFloat($('b').value);
        if (!isFinite(b) || b <= 0) return say('—', '');
        var beat = 60000 / b;
        var rows = [['1/1', 4], ['1/2', 2], ['1/4', 1], ['1/8', 0.5], ['1/16', 0.25], ['1/32', 0.125]];
        say(rows.map(function (r) {
          var ms = beat * r[1];
          return r[0].padEnd(5) + ms.toFixed(1) + ' ms    dotted ' + (ms * 1.5).toFixed(1) +
                 '    triplet ' + (ms * 2 / 3).toFixed(1);
        }).join('\n'), 'One beat is ' + beat.toFixed(2) + ' ms at ' + b + ' BPM.');
      });
    });

  add('note-freq', 'audio', 'Note to frequency', 'The hertz of any note, at any tuning.',
    field('Note', inp('n', 'A4', 'A4')) + field('A4 tuning (Hz)', inp('a', '', '440', 'number')) + OUT + NOTE,
    function () {
      var NAMES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
      live(['n', 'a'], function () {
        var v = ($('n').value || '').trim().toLowerCase();
        var a4 = parseFloat($('a').value) || 440;
        var m = v.match(/^([a-g])([#b]?)(-?\d+)$/);
        if (!m) return say('—', 'Write it like A4, C#3 or Bb5.');
        var semi = NAMES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
        var midi = (parseInt(m[3], 10) + 1) * 12 + semi;
        var hz = a4 * Math.pow(2, (midi - 69) / 12);
        say(hz.toFixed(3) + ' Hz\nMIDI note ' + midi + '\nWavelength ' + (343 / hz).toFixed(3) + ' m',
            'Equal temperament. Wavelength assumes sound at 343 m/s, which is dry air at 20°C.');
      });
    });

  /* THERE IS NO QR GENERATOR HERE, AND THAT IS DELIBERATE.

     A correct QR encoder is a few hundred lines of Reed-Solomon and mask
     evaluation. The easy way is a CDN script or an image URL from a QR
     service — and both break the promise at the top of this file, because the
     second one posts whatever you typed to somebody else's server.

     A half-written encoder that produces a code no phone can read would be
     worse than either. So it is not here, rather than here and broken. */

  add('random-picker', 'generators', 'Random picker', 'Pick names, split into teams, or roll dice.',
    ta('t', 'One name per line') +
    field('Mode', sel('m', ['Pick one', 'Pick three', 'Shuffle all', 'Two teams', 'Three teams'])) + OUT + NOTE,
    function () {
      live(['t', 'm'], function () {
        var a = ($('t').value || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        if (!a.length) return say('—', '');
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        var m = $('m').value;
        if (m === 'Pick one') say(a[0], 'From ' + a.length + '.');
        else if (m === 'Pick three') say(a.slice(0, 3).join('\n'), '');
        else if (m === 'Shuffle all') say(a.join('\n'), '');
        else {
          var n = m === 'Two teams' ? 2 : 3, teams = [];
          for (var k = 0; k < n; k++) teams.push([]);
          a.forEach(function (x, i2) { teams[i2 % n].push(x); });
          say(teams.map(function (t2, i3) {
            return 'Team ' + (i3 + 1) + '\n' + t2.map(function (x) { return '  ' + x; }).join('\n');
          }).join('\n\n'), 'Dealt round-robin after shuffling, so the sizes differ by at most one.');
        }
      });
    });

  add('strong-password', 'generators', 'Passphrase generator', 'Words you can remember, entropy you can check.',
    field('Words', inp('n', '', '4', 'number')) +
    field('Separator', sel('s', ['-', '.', ' ', '_'])) + OUT + NOTE,
    function () {
      var W = ('anchor amber bison cactus canyon cedar cobalt copper coral cosmos crimson delta ' +
        'ember falcon fjord glacier granite harbor indigo ivory jasper kelp lantern lunar maple ' +
        'meadow nebula nickel oasis onyx orbit otter pepper pewter quartz quiver raven ripple ' +
        'saffron slate solar sparrow summit talon thistle tundra velvet walnut willow zenith ' +
        'zephyr basalt beacon bramble cinder driftwood ferry gable heather juniper kestrel').split(' ');
      live(['n', 's'], function () {
        var n = Math.min(12, Math.max(3, parseInt($('n').value, 10) || 4));
        var sep = $('s').value;
        var pick = new Uint32Array(n);
        crypto.getRandomValues(pick);
        var words = [];
        for (var i = 0; i < n; i++) words.push(W[pick[i] % W.length]);
        var bits = n * Math.log2(W.length);
        say(words.join(sep),
            'About ' + bits.toFixed(0) + ' bits of entropy from a ' + W.length + '-word list. ' +
            'Random from crypto.getRandomValues, never Math.random.');
      });
    });

  add('nato', 'generators', 'NATO spelling', 'Read a code out loud without being misheard.',
    field('Text', inp('t', 'NOVA-7K2P', 'NOVA-7K2P')) + OUT,
    function () {
      var A = { a:'Alfa',b:'Bravo',c:'Charlie',d:'Delta',e:'Echo',f:'Foxtrot',g:'Golf',h:'Hotel',
        i:'India',j:'Juliett',k:'Kilo',l:'Lima',m:'Mike',n:'November',o:'Oscar',p:'Papa',
        q:'Quebec',r:'Romeo',s:'Sierra',t:'Tango',u:'Uniform',v:'Victor',w:'Whiskey',x:'X-ray',
        y:'Yankee',z:'Zulu','0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five',
        '6':'Six','7':'Seven','8':'Eight','9':'Niner','-':'Dash',' ':'(space)' };
      live(['t'], function () {
        var v = ($('t').value || '');
        say(Array.from(v).map(function (c) { return A[c.toLowerCase()] || c; }).join(' '), '');
      });
    });

  add('srt-shift', 'video', 'Subtitle timing shifter', 'Move every subtitle earlier or later by a set amount.',
    ta('t', 'Paste an .srt file') +
    field('Shift by (seconds, may be negative)', inp('s', '', '-1.5', 'number')) + OUT + NOTE,
    function () {
      live(['t', 's'], function () {
        var v = $('t').value || '', off = parseFloat($('s').value) || 0;
        if (!v.trim()) return say('—', '');
        var n = 0;
        var out = v.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, function (_, h, m, sec, ms) {
          n++;
          var t = (+h) * 3600000 + (+m) * 60000 + (+sec) * 1000 + (+ms) + off * 1000;
          /* Clamp at zero: a negative timestamp is not a valid cue, and every
             player handles it differently — usually by refusing the file. */
          if (t < 0) t = 0;
          t = Math.round(t);
          var hh = Math.floor(t / 3600000), mm = Math.floor(t % 3600000 / 60000);
          var ss = Math.floor(t % 60000 / 1000), mss = t % 1000;
          return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' +
                 String(ss).padStart(2, '0') + ',' + String(mss).padStart(3, '0');
        });
        say(out, n + ' timestamps shifted by ' + off + 's' +
            (off < 0 ? '. Anything that would go before zero is clamped to 00:00:00,000.' : '.'));
      });
    });

  add('text-wrap', 'text', 'Hard wrap text', 'Break long lines at a set width without cutting words.',
    ta('t', 'A long paragraph…') + field('Width', inp('w', '', '72', 'number')) + OUT + NOTE,
    function () {
      live(['t', 'w'], function () {
        var w = Math.max(10, parseInt($('w').value, 10) || 72);
        var out = ($('t').value || '').split('\n').map(function (para) {
          var words = para.split(/\s+/), line = '', lines = [];
          words.forEach(function (x) {
            if (!line) { line = x; return; }
            if ((line + ' ' + x).length <= w) line += ' ' + x;
            else { lines.push(line); line = x; }
          });
          if (line) lines.push(line);
          return lines.join('\n');
        }).join('\n');
        say(out, 'Words are never split. A single word longer than the width will overrun it, ' +
            'which is better than breaking it in the middle.');
      });
    });

  add('colour-blend', 'images', 'Blend two colours', 'A step-by-step scale between any two hex colours.',
    field('From', inp('a', '#7DFF00', '#7DFF00')) + field('To', inp('b', '#00f2ff', '#00f2ff')) +
    field('Steps', inp('n', '', '7', 'number')) + OUT + NOTE,
    function () {
      function hex(h) {
        var m = String(h).replace('#', '').trim();
        if (m.length === 3) m = m.split('').map(function (c) { return c + c; }).join('');
        return /^[0-9a-f]{6}$/i.test(m) ? [0, 2, 4].map(function (i) { return parseInt(m.substr(i, 2), 16); }) : null;
      }
      live(['a', 'b', 'n'], function () {
        var A = hex($('a').value), B = hex($('b').value);
        var n = Math.min(30, Math.max(2, parseInt($('n').value, 10) || 7));
        if (!A || !B) return say('—', 'Use hex colours like #7DFF00.');
        var out = [];
        for (var i = 0; i < n; i++) {
          var t = i / (n - 1);
          /* Mixed through sRGB, which is what a CSS gradient does. Perceptual
             spaces give a smoother ramp but would not match the gradient you
             get if you paste these into CSS, which is the point of the list. */
          out.push('#' + A.map(function (c, j) {
            return Math.round(c + (B[j] - c) * t).toString(16).padStart(2, '0');
          }).join(''));
        }
        say(out.join('\n'), 'Mixed in sRGB, so these match what a CSS gradient between the two ends does.');
      });
    });

  add('dice', 'generators', 'Dice roller', 'Standard notation — 3d6+2, 1d20, 4d10.',
    field('Roll', inp('t', '3d6+2', '3d6+2')) +
    "<div class='btns'><button class='go' id='go'>Roll</button></div>" + OUT + NOTE,
    function () {
      function roll() {
        var m = String($('t').value || '').trim().toLowerCase()
          .match(/^(\d*)d(\d+)\s*([+-]\s*\d+)?$/);
        if (!m) return say('—', 'Write it like 3d6, 1d20 or 2d8+1.');
        var n = Math.min(100, parseInt(m[1] || '1', 10));
        var sides = Math.min(1000, parseInt(m[2], 10));
        var mod = m[3] ? parseInt(m[3].replace(/\s+/g, ''), 10) : 0;
        if (!n || !sides) return say('—', '');
        var buf = new Uint32Array(n);
        crypto.getRandomValues(buf);
        var rolls = [], total = 0;
        for (var i = 0; i < n; i++) { var r = buf[i] % sides + 1; rolls.push(r); total += r; }
        say(total + mod + '\n\n' + rolls.join(', ') + (mod ? '  (' + (mod > 0 ? '+' : '') + mod + ')' : ''),
            'Rolled with crypto.getRandomValues. Math.random is not uniform enough to be fair ' +
            'over a long game.');
      }
      $('go').onclick = roll;
      $('t').oninput = roll;
      roll();
    });

  add('time-until', 'math', 'Countdown to a date', 'How long until something, in every unit at once.',
    field('Date and time', inp('d', '', '', 'datetime-local')) + OUT + NOTE,
    function () {
      var timer = 0;
      live(['d'], function () {
        clearInterval(timer);
        var target = new Date($('d').value);
        if (isNaN(target)) return say('—', 'Pick a date.');
        function tick() {
          var ms = target - Date.now();
          var past = ms < 0;
          ms = Math.abs(ms);
          var s = Math.floor(ms / 1000);
          say(Math.floor(s / 86400) + ' days\n' + Math.floor(s / 3600) + ' hours\n' +
              Math.floor(s / 60) + ' minutes\n' + s + ' seconds',
              past ? 'That is in the past.' : 'Counting down, live.');
        }
        tick();
        timer = setInterval(tick, 1000);
        /* The panel is replaced when another tool opens, so the interval has
           to stop or it ticks forever against a dead element. */
        var sheet = document.getElementById('sheet');
        if (sheet) {
          var stop = new MutationObserver(function () {
            if (!document.getElementById('d')) { clearInterval(timer); stop.disconnect(); }
          });
          stop.observe(sheet, { childList: true, subtree: true });
        }
      });
    });

  add('vat', 'math', 'Add or remove tax', 'Gross from net, or net from gross, at any rate.',
    field('Amount', inp('a', '', '100', 'number')) +
    field('Rate %', inp('r', '', '20', 'number')) +
    field('The amount is', sel('m', ['Net (add tax)', 'Gross (remove tax)'])) + OUT + NOTE,
    function () {
      live(['a', 'r', 'm'], function () {
        var a = parseFloat($('a').value), r = parseFloat($('r').value);
        if (!isFinite(a) || !isFinite(r)) return say('—', '');
        var net, tax, gross;
        if ($('m').value.charAt(0) === 'N') { net = a; tax = a * r / 100; gross = net + tax; }
        else { gross = a; net = a / (1 + r / 100); tax = gross - net; }
        say('Net    ' + net.toFixed(2) + '\nTax    ' + tax.toFixed(2) + '\nGross  ' + gross.toFixed(2),
            'Removing tax divides by 1 + rate. Taking the percentage off the gross is the common ' +
            'mistake and gives the wrong answer every time.');
      });
    });

  add('char-limits', 'marketing', 'Platform length checker', 'One piece of text against every platform limit.',
    ta('t', 'Your caption or title…') + OUT + NOTE,
    function () {
      var P = [['X / Twitter', 280], ['Instagram caption', 2200], ['YouTube title', 100],
               ['YouTube description', 5000], ['TikTok caption', 2200], ['Meta title tag', 60],
               ['Meta description', 160], ['LinkedIn post', 3000], ['Email subject', 60],
               ['Bluesky', 300], ['Pinterest', 500], ['Discord message', 2000]];
      live(['t'], function () {
        var n = ($('t').value || '').length;
        if (!n) return say('—', '');
        say(P.map(function (p) {
          var left = p[1] - n;
          return (left >= 0 ? '  ok  ' : ' over ') + p[0].padEnd(22) +
                 n + '/' + p[1] + (left < 0 ? '   ' + (-left) + ' over' : '');
        }).join('\n'), n + ' characters. Counted as characters, not bytes — an emoji is one here ' +
           'and may be two or more to the platform.');
      });
    });

  add('easing', 'developer', 'Easing curve values', 'cubic-bezier values for the usual motion curves.',
    field('Curve', sel('c', ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
      'back-out', 'anticipate', 'sharp', 'gentle'])) +
    field('Duration (ms)', inp('d', '', '300', 'number')) + OUT + NOTE,
    function () {
      var C = {
        'ease': '0.25, 0.1, 0.25, 1', 'ease-in': '0.42, 0, 1, 1',
        'ease-out': '0, 0, 0.58, 1', 'ease-in-out': '0.42, 0, 0.58, 1',
        'linear': '0, 0, 1, 1', 'back-out': '0.34, 1.56, 0.64, 1',
        'anticipate': '0.68, -0.55, 0.27, 1.55', 'sharp': '0.4, 0, 0.6, 1',
        'gentle': '0.4, 0, 0.2, 1'
      };
      live(['c', 'd'], function () {
        var k = $('c').value, d = parseInt($('d').value, 10) || 300;
        say('transition: all ' + d + 'ms cubic-bezier(' + C[k] + ');\n\n' +
            'animation-timing-function: cubic-bezier(' + C[k] + ');',
            (k === 'back-out' || k === 'anticipate')
              ? 'This one overshoots — the second or fourth number is outside 0 to 1 on purpose. ' +
                'It cannot be used on a property that must not go past its end value.'
              : 'Paste straight into CSS.');
      });
    });

  /* ==========================================================================
     AI
     ==========================================================================
     Deliberately short. These are the things that can honestly be done in a
     tab with no model behind them. Anything that needs one is not here at all
     rather than here as a card that opens a apology.
     ======================================================================== */
  add('prompt-builder', 'ai', 'Prompt builder', 'Turns a rough idea into a prompt with the parts that matter.',
    field('What do you want?', ta('t', 'a thumbnail for a video about learning to edit')) +
    field('Role', sel('r', ['(none)', 'Video editor', 'Designer', 'Copywriter', 'Teacher', 'Developer'])) +
    field('Tone', sel('tn', ['(none)', 'Plain', 'Friendly', 'Formal', 'Blunt'])) +
    field('Length', sel('l', ['(none)', 'One line', 'A paragraph', 'A short list', 'Step by step'])) +
    OUT + NOTE,
    function () {
      live(['t', 'r', 'tn', 'l'], function () {
        var t = ($('t').value || '').trim();
        if (!t) return say('—', '');
        var p = [];
        if ($('r').value !== '(none)') p.push('You are a ' + $('r').value.toLowerCase() + '.');
        p.push(t.charAt(0).toUpperCase() + t.slice(1) + (/[.?!]$/.test(t) ? '' : '.'));
        if ($('tn').value !== '(none)') p.push('Write it in a ' + $('tn').value.toLowerCase() + ' tone.');
        if ($('l').value !== '(none)') p.push('Answer as ' + $('l').value.toLowerCase() + '.');
        p.push('If something important is missing, ask before answering.');
        say(p.join(' '),
            'This arranges what you typed. It does not talk to a model — nothing on this page does, ' +
            'which is why nothing on this page uploads.');
      });
    });

  add('token-estimate', 'ai', 'Token estimator', 'Roughly how much of a context window a text uses.',
    ta('t', 'Paste the text you would send…') + OUT + NOTE,
    function () {
      live(['t'], function () {
        var v = $('t').value || '';
        if (!v) return say('—', '');
        var words = (v.match(/\S+/g) || []).length;
        /* ~4 chars per token is the usual English rule of thumb; word count
           gives a second estimate and the truth is normally between them. */
        var byChar = Math.ceil(v.length / 4), byWord = Math.ceil(words * 1.33);
        var lo = Math.min(byChar, byWord), hi = Math.max(byChar, byWord);
        say('Roughly ' + lo + '–' + hi + ' tokens\n' +
            'Characters ' + v.length + '\nWords ' + words,
            'An estimate, not a count. Real tokenisers differ per model, and code, other ' +
            'languages and long words all push it up.');
      });
    });

  add('ai-disclosure', 'ai', 'AI disclosure line', 'A one-line credit for work a model helped with.',
    field('What did it help with?', sel('w', ['Ideas and outline', 'A first draft', 'Editing and tidying',
      'Images', 'Code', 'Subtitles or translation'])) +
    field('Tool name', inp('t', 'e.g. NovaClip AI', 'NovaClip AI')) + OUT + NOTE,
    function () {
      live(['w', 't'], function () {
        var w = $('w').value.toLowerCase(), t = ($('t').value || 'an AI tool').trim();
        say('Made with help from ' + t + ' (' + w + '). Everything here was checked by a person ' +
            'before it went out.',
            'Say it where people will see it, not in a footer nobody reads. Several platforms now ' +
            'require the label, and the ones that do not still notice.');
      });
    });

  window.NC_TOOLS_EXTRA = L;
  window.NC_TOOLS_EXTRA_IMPL = M;
})();
