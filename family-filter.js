/* NovaClip — Family content filter
   ============================================================================
   ONE ENGINE, TWO PLACES THAT RUN IT

     parent.html          a parent picks the settings and previews what they do
     extension/           actually blocks on youtube.com, tiktok.com,
                          instagram.com and twitch.tv

   They must never disagree, so neither owns the rules. This file does, and
   both load it verbatim. No build step, no imports — it attaches to
   window.NCFilter and to globalThis, so a page, a content script and a
   service worker all get the same object.

   ============================================================================
   WHAT THIS CAN AND CANNOT DO — read before selling it

   It reads the text a platform puts on screen: video titles, channel names,
   descriptions, search results, stream categories. That is genuinely most of
   what a child encounters while browsing, and blocking on it works.

   It does NOT watch the video. A clean title on a bad video gets through, and
   nothing that reads text can fix that. Anyone claiming a keyword filter is
   total protection is selling something that does not exist.

   So the honest pitch is: this removes the obvious, the searched-for, and the
   recommended — the three ways a child actually arrives at bad content — and
   it tells a parent what it blocked so they can see it working.

   ============================================================================
   THE FALSE POSITIVE PROBLEM

   A filter that blocks a suicide-prevention video has done harm, not good.
   The child who needed it is the one who does not get it. So every severe
   category carries exemptions, and a match inside an exemption context is
   dropped rather than blocked. That behaviour is tested.
   ---------------------------------------------------------------------------- */
(function (root) {
  'use strict';

  /* ==========================================================================
     1. THE RULES

     Ordinary words a child says every day are NOT in here. "kill" appears in
     every game on the platform; "gun" is in every shooter. Only phrases that
     mean the thing get listed, which is why the lists look narrower than
     people expect. A broad list blocks Minecraft and teaches the child that
     the filter is stupid and worth defeating.
     ========================================================================== */
  var CATEGORIES = [
    {
      id: 'adult', label: 'Sexual content', severity: 5, deleet: true,
      terms: ['porn', 'pornhub', 'xvideos', 'onlyfans', 'fansly', 'nsfw', 'xxx',
        'camgirl', 'cam girl', 'webcam model', 'hentai', 'rule 34', 'escort service',
        'sex tape', 'adult film', 'adult star', 'strip club', 'stripper',
        'lingerie haul', 'nudes', 'erotic', 'fetish', 'hookup app',
        'sugar daddy', 'sugar baby', 'thirst trap'],
      exemptions: ['sex education', 'sexual health', 'consent', 'puberty',
        'anti trafficking', 'safeguarding', 'body positivity', 'anatomy']
    },
    {
      id: 'self_harm', label: 'Self-harm and eating disorders', severity: 5, deleet: true,
      terms: ['pro ana', 'proana', 'pro mia', 'thinspo', 'thinspiration', 'bonespo',
        'self harm', 'selfharm', 'cutting myself', 'how to starve', 'starvation diet',
        'suicide method', 'how to kill myself', 'kys', 'unalive myself',
        'ana coach', 'meanspo'],
      /* The most important list in the file. A child searching these words is
         a child who needs the result, not a blocked page. */
      exemptions: ['suicide prevention', 'suicide hotline', 'crisis line', 'recovery',
        'eating disorder recovery', 'get help', 'mental health', 'therapy', 'therapist',
        '988', 'samaritans', 'warning signs', 'you are not alone', 'support']
    },
    {
      id: 'hate', label: 'Hate and extremism', severity: 5, deleet: true,
      terms: ['white power', 'white genocide', 'race war', 'racial superiority',
        'heil hitler', 'sieg heil', 'holocaust hoax', 'holocaust denial',
        'great replacement', 'master race', 'subhuman', 'untermensch',
        'ethnostate', 'blood and soil', '1488', 'groyper', 'kill all'],
      exemptions: ['against racism', 'anti racism', 'condemn', 'debunk', 'debunked',
        'holocaust education', 'holocaust memorial', 'survivor', 'testimony',
        'history of', 'documentary', 'civil rights', 'never again']
    },
    {
      id: 'graphic_violence', label: 'Graphic violence and shock', severity: 4, deleet: true,
      terms: ['gore', 'beheading', 'decapitation', 'execution video', 'real death',
        'died on camera', 'death compilation', 'snuff', 'liveleak', 'bestgore',
        'watchpeopledie', 'brutal killing', 'cartel video', 'torture video',
        'crime scene footage', 'shock video'],
      exemptions: ['documentary', 'news', 'forensic', 'first aid', 'special effects',
        'prosthetic', 'sfx makeup', 'movie review', 'horror movie', 'gameplay',
        'game review', 'trailer']
    },
    {
      id: 'weapons', label: 'Weapon making', severity: 4, deleet: false,
      /* Narrow on purpose. Every shooter on Twitch would trip a broad list. */
      terms: ['ghost gun', '3d printed gun', '3d printed firearm', 'auto sear',
        'glock switch', 'full auto conversion', 'how to make a gun',
        'how to make a silencer', 'homemade suppressor', 'untraceable firearm',
        'how to make a bomb', 'pipe bomb', 'improvised explosive', 'napalm recipe',
        'thermite recipe'],
      exemptions: ['airsoft', 'nerf', 'paintball', 'gameplay', 'warzone',
        'call of duty', 'counter strike', 'museum', 'reenactment', 'history of']
    },
    {
      id: 'drugs', label: 'Drugs and vaping', severity: 3, deleet: true,
      terms: ['how to make meth', 'cook meth', 'buy drugs online', 'drug plug',
        'dark web drugs', 'cocaine haul', 'lean recipe', 'how to get high',
        'vape haul', 'nic haul', 'buy weed online', 'steroid cycle', 'sarms cycle',
        'buy xanax', 'pill press', 'shrooms grow', 'plug walk'],
      exemptions: ['addiction', 'recovery', 'harm reduction', 'sober', 'rehab',
        'overdose prevention', 'drug policy', 'public health', 'documentary',
        'dangers of', 'quit vaping', 'quit smoking']
    },
    {
      id: 'gambling', label: 'Gambling and loot boxes', severity: 3, deleet: false,
      /* The category aimed most directly at this age group. */
      terms: ['csgo gambling', 'cs2 gambling', 'skin gambling', 'crypto casino',
        'online casino bonus', 'free spins code', 'deposit bonus code', 'betting tips',
        'sure bet', 'fixed matches', 'roulette strategy', 'slots big win',
        'stake code', 'aviator predictor', 'casino promo code'],
      exemptions: ['gambling addiction', 'problem gambling', 'expose', 'exposed',
        'scam warning', 'documentary', 'regulation', 'gamstop', 'dangers of']
    },
    {
      id: 'scams', label: 'Scams and generators', severity: 4, deleet: true,
      terms: ['free robux', 'robux generator', 'free v bucks', 'v bucks generator',
        'free nitro generator', 'gift card generator', 'roblox hack', 'account hack',
        'hack any account', 'password cracker', 'double your bitcoin', 'crypto doubler',
        'send 1 receive 2', 'guaranteed profit', 'risk free money', 'money glitch',
        'cash app glitch', 'bank glitch', 'get rich quick', 'mod menu download',
        'aimbot download', 'free followers generator', 'click the link to claim'],
      exemptions: ['scam', 'scams', 'scammer', 'exposed', 'expose', 'warning',
        'avoid', 'debunk', 'debunked', 'how they work', 'fraud awareness',
        'do not fall for', 'beware']
    },
    {
      id: 'dangerous_stunts', label: 'Dangerous challenges', severity: 4, deleet: false,
      terms: ['blackout challenge', 'choking challenge', 'tide pod', 'fire challenge',
        'car surfing', 'subway surfing', 'train surfing', 'rooftopping',
        'benadryl challenge', 'skull breaker challenge', 'fake kidnapping prank',
        'prank in the hood', 'scaring strangers'],
      exemptions: ['warning', 'dangers of', 'documentary', 'news', 'expose',
        'safety', 'trained stunt', 'closed course', 'do not try']
    }
  ];

  /* Age presets. The category set a parent gets by default — they can change
     any of it, and the dashboard shows exactly what each preset turns on. */
  var PROFILES = {
    young: {
      label: 'Under 10',
      categories: ['adult', 'self_harm', 'hate', 'graphic_violence', 'weapons',
        'drugs', 'gambling', 'scams', 'dangerous_stunts'],
      strictness: 'strict'
    },
    tween: {
      label: '10 to 13',
      categories: ['adult', 'self_harm', 'hate', 'graphic_violence', 'weapons',
        'drugs', 'gambling', 'scams', 'dangerous_stunts'],
      strictness: 'normal'
    },
    teen: {
      label: '14 to 17',
      categories: ['adult', 'self_harm', 'hate', 'graphic_violence', 'weapons',
        'drugs', 'gambling', 'scams'],
      strictness: 'normal'
    }
  };

  /* Strictness decides which categories a PRESET starts with. It does not gate
     anything at run time.

     The first version used it as a severity threshold inside check(), and the
     result was that a parent could tick "Gambling and loot boxes", see it
     ticked, and have nothing blocked — severity 3 sat under the normal
     threshold of 4. A control that shows as on while doing nothing is worse
     than no control, so the threshold now only shapes the preset a parent
     starts from. Once a category is ticked, it blocks. */
  var THRESHOLD = { strict: 3, normal: 3, relaxed: 4 };

  function presetFor(profile, strictness) {
    var p = PROFILES[profile || 'tween'];
    var limit = THRESHOLD[strictness || p.strictness] || 3;
    return CATEGORIES.filter(function (c) {
      return p.categories.indexOf(c.id) >= 0 && c.severity >= limit;
    }).map(function (c) { return c.id; });
  }

  /* ==========================================================================
     2. MATCHING
     ========================================================================== */

  function normalise(s) {
    return String(s == null ? '' : s)
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i' };
  function deleet(s) {
    return normalise(s).replace(/[0134578@$!]/g, function (c) { return LEET[c] || c; });
  }

  /* Word boundaries, never substrings. Substring matching is what blocks
     Scunthorpe, "analysis", "grape" and "assassin" — and a filter that blocks
     a child's homework is a filter the family turns off. */
  var RX = {};
  function rx(term) {
    if (RX[term]) return RX[term];
    var body = String(term).split(/\s+/).map(function (w) {
      return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('[\\s\\-_.]+');
    var r;
    try {
      r = new RegExp('(?<![\\p{L}\\p{N}])' + body + '(?![\\p{L}\\p{N}])', 'u');
    } catch (e) {
      /* Older engines without lookbehind: fall back to \b, which is ASCII-only
         but still beats substring matching. */
      r = new RegExp('\\b' + body + '\\b');
    }
    RX[term] = r;
    return r;
  }

  function hits(text, terms, folded) {
    var plain = normalise(text);
    var alt = folded ? deleet(text) : null;
    var out = [];
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (rx(normalise(t)).test(plain)) { out.push(t); continue; }
      if (alt && rx(deleet(t)).test(alt)) out.push(t);
    }
    return out;
  }

  /* ==========================================================================
     3. THE DECISION
     ==========================================================================
     `settings` is what the parent chose:
       { enabled, profile, categories[], strictness, allow[], block[], platforms{} }
     `item` is what is on screen:
       { platform, title, channel, description, tags[], category }
     ========================================================================== */
  function check(item, settings) {
    item = item || {};
    settings = settings || {};
    var text = [item.title, item.channel, item.description,
      (item.tags || []).join(' '), item.category].filter(Boolean).join(' — ');

    if (settings.enabled === false) return pass('filtering is off');
    if (item.platform && settings.platforms && settings.platforms[item.platform] === false) {
      return pass('this platform is not filtered');
    }

    /* A parent's own lists beat every rule below, in both directions. */
    var who = normalise(item.channel || '');
    var i;
    if (who) {
      var allow = settings.allow || [];
      for (i = 0; i < allow.length; i++) {
        if (normalise(allow[i]) && who.indexOf(normalise(allow[i])) >= 0) {
          return pass('on the always-allow list', 'allow_list');
        }
      }
      var block = settings.block || [];
      for (i = 0; i < block.length; i++) {
        if (normalise(block[i]) && who.indexOf(normalise(block[i])) >= 0) {
          return { blocked: true, reason: 'on the always-block list', rule: 'block_list',
            category: null, label: 'Blocked by a parent', matched: [] };
        }
      }
    }

    /* A ticked category blocks. No second gate — see THRESHOLD above for the
       bug that taught us not to add one. */
    var on = settings.categories || presetFor(settings.profile, settings.strictness);

    for (i = 0; i < CATEGORIES.length; i++) {
      var cat = CATEGORIES[i];
      if (on.indexOf(cat.id) < 0) continue;

      var matched = hits(text, cat.terms, cat.deleet);
      if (!matched.length) continue;

      /* An exemption anywhere in the same text clears it. "How the free robux
         scam works, do not fall for it" is a warning, not the thing. */
      var cleared = hits(text, cat.exemptions || [], false);
      if (cleared.length) continue;

      return {
        blocked: true, category: cat.id, label: cat.label,
        matched: matched, rule: 'category:' + cat.id,
        reason: cat.label.toLowerCase()
      };
    }
    return pass('nothing matched');
  }

  function pass(reason, rule) {
    return { blocked: false, reason: reason, rule: rule || null, category: null, matched: [] };
  }

  function defaults(profile, strictness) {
    var p = PROFILES[profile || 'tween'];
    return {
      enabled: true,
      profile: profile || 'tween',
      categories: presetFor(profile, strictness || p.strictness),
      strictness: strictness || p.strictness,
      allow: [],
      block: [],
      platforms: { youtube: true, tiktok: true, instagram: true, twitch: true },
      safeSearch: true,
      hideComments: false
    };
  }

  var api = {
    VERSION: '1.0.0',
    CATEGORIES: CATEGORIES,
    PROFILES: PROFILES,
    THRESHOLD: THRESHOLD,
    check: check,
    defaults: defaults,
    presetFor: presetFor,
    normalise: normalise,
    deleet: deleet,
    hits: hits
  };

  root.NCFilter = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
