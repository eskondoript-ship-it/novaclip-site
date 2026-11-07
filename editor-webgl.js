/* NOVACLIP — THE GPU TRANSITIONS, AND THE GATE THAT DECIDES WHO GETS THEM
 * ===========================================================================
 * 200 gl-transitions, vendored in vendor/gl-transitions/. They are GLSL, and
 * until this file the whole site had exactly zero WebGL contexts — 189
 * getContext calls, every one of them '2d'. So this is new machinery, not an
 * extension of something that was already here.
 *
 * ---------------------------------------------------------------------------
 * WHY THE GATE MATTERS MORE THAN THE RENDERER
 * ---------------------------------------------------------------------------
 * NovaClip runs on locked-down school laptops today, and it runs there
 * BECAUSE it has no GPU path: nothing to blacklist, no driver to fall back
 * from, no "WebGL not supported" dead end. That is an accident worth
 * protecting.
 *
 * The danger is not a machine that cannot do WebGL — that machine says no and
 * keeps the canvas transitions, which work. The danger is a machine that says
 * YES and lies. Chrome falls back to SwiftShader when a GPU driver is
 * blacklisted, which is routine on managed school fleets. SwiftShader is
 * WebGL rendered on the CPU. A naive `if (gl) use shaders` check passes
 * there, takes the GPU path, and runs it SLOWER than the 2D path it replaced
 * — degrading the exact machines the feature was supposed to leave alone.
 *
 * So the gate is three things, and the third is the one that matters:
 *
 *   1. is there a WebGL2 context at all
 *   2. does the renderer string name a known software rasteriser
 *   3. CAN IT ACTUALLY DO THE WORK — measured, by compiling a real transition
 *      and timing real frames at a real size
 *
 * Checks 1 and 2 are cheap and catch the obvious cases. Check 3 is the only
 * one that cannot be fooled, because it does not ask the device what it is,
 * it asks what it can do. A renderer string can be spoofed, hidden by a
 * privacy setting, or simply unfamiliar; a frame that takes 40ms is slow
 * whatever it calls itself.
 *
 * NOBODY WAS ASKED TO PREDICT THIS. The first version of this plan had me
 * asking whether school laptops support WebGL. That was the wrong question
 * put to the wrong party: it is a runtime fact about each individual device,
 * it differs between two laptops in the same room, and the code is what has
 * to answer it. Hence a benchmark rather than a guess.
 *
 * ---------------------------------------------------------------------------
 * AND NOTHING IS DOWNLOADED UNTIL THE GATE PASSES
 * ---------------------------------------------------------------------------
 * The shader bundle is 576KB. A device that fails the gate can never use one
 * byte of it, so it is loaded lazily, after the decision, and a school laptop
 * pays nothing for a feature it does not get.
 * ===========================================================================
 */
(function () {
  'use strict';
  if (window.NC_WEBGL) return;

  var BUNDLE = 'vendor/gl-transitions/transitions.js';
  var KEY = 'nc_webgl_verdict';          /* remembered, with the reason */

  /* Known software rasterisers. Matching one is a hard no: these are all CPU
     renderers wearing a GPU's interface, and every one of them is slower than
     the canvas path for this work. */
  var SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|mesa offscreen|generic renderer/i;

  /* The budget. A transition runs for well under a second and only while a
     cut is on screen, so it shares the frame with the editor's own drawing.
     8ms of a 16.7ms frame leaves room for that; anything slower and the
     canvas version is the better answer even though it looks less good. */
  var BUDGET_MS = 8;
  var BENCH_W = 640, BENCH_H = 360, BENCH_FRAMES = 12;

  /* ---- the shader harness ------------------------------------------------
     gl-transitions declare `vec4 transition(vec2 uv)` and call getFromColor
     and getToColor. Everything around that is ours and is identical for all
     200, so it lives here once rather than being pasted into each file. */
  var VERT =
    '#version 300 es\n' +
    'in vec2 p; out vec2 uv;\n' +
    'void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }\n';

  function fragFor(glsl) {
    return '#version 300 es\n' +
      'precision highp float;\n' +
      'in vec2 uv; out vec4 fragColor;\n' +
      'uniform sampler2D from, to;\n' +
      'uniform float progress, ratio;\n' +
      /* The two accessors the transitions are written against. flipY because
         a texture uploaded from a canvas arrives upside down relative to the
         uv space these shaders assume. */
      'vec4 getFromColor(vec2 p){ return texture(from, vec2(p.x, 1.0 - p.y)); }\n' +
      'vec4 getToColor(vec2 p){ return texture(to, vec2(p.x, 1.0 - p.y)); }\n' +
      /* Some of the 200 are written against GLSL ES 1.00, where the sampler
         call is texture2D. Two of them (DisplacementMap, LumaWipe) failed to
         compile on that alone. Aliasing it is one line and costs nothing;
         rewriting somebody else's shader to suit our preamble would be a
         change to code we do not own and a merge conflict with every future
         update of theirs. */
      '#define texture2D texture\n' +
      '#define textureCube texture\n' +
      glsl + '\n' +
      'void main(){ fragColor = transition(uv); }\n';
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      return { err: log || 'compile failed' };
    }
    return { sh: sh };
  }

  function program(gl, glsl) {
    var v = compile(gl, gl.VERTEX_SHADER, VERT);
    if (v.err) return { err: 'vertex: ' + v.err };
    var f = compile(gl, gl.FRAGMENT_SHADER, fragFor(glsl));
    if (f.err) { gl.deleteShader(v.sh); return { err: f.err }; }
    var pr = gl.createProgram();
    gl.attachShader(pr, v.sh); gl.attachShader(pr, f.sh);
    gl.linkProgram(pr);
    gl.deleteShader(v.sh); gl.deleteShader(f.sh);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      var log = gl.getProgramInfoLog(pr);
      gl.deleteProgram(pr);
      return { err: 'link: ' + (log || 'failed') };
    }
    return { pr: pr };
  }

  /* ---- the renderer ------------------------------------------------------ */
  function Renderer() {
    this.cv = document.createElement('canvas');
    this.gl = null; this.progs = {}; this.texA = null; this.texB = null;
  }
  Renderer.prototype.init = function () {
    if (this.gl) return true;
    try {
      this.gl = this.cv.getContext('webgl2', {
        alpha: true, premultipliedAlpha: false, antialias: false,
        preserveDrawingBuffer: false, powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false   /* checked by measurement instead */
      });
    } catch (e) { this.gl = null; }
    if (!this.gl) return false;
    var gl = this.gl;
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    this.texA = this.tex(); this.texB = this.tex();
    return true;
  };
  Renderer.prototype.tex = function () {
    var gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };
  Renderer.prototype.get = function (name, glsl) {
    if (this.progs[name]) return this.progs[name];
    var r = program(this.gl, glsl);
    this.progs[name] = r;
    return r;
  };
  /* Draw one frame of `name` between two canvases at progress p. Returns
     false on any failure, so a caller can fall back rather than show nothing. */
  Renderer.prototype.draw = function (name, glsl, a, b, p, w, h, params) {
    if (!this.init()) return false;
    var gl = this.gl;
    if (this.cv.width !== w) this.cv.width = w;
    if (this.cv.height !== h) this.cv.height = h;
    var got = this.get(name, glsl);
    if (got.err) return false;
    var pr = got.pr;
    gl.viewport(0, 0, w, h);
    gl.useProgram(pr);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texA);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, b);
    gl.uniform1i(gl.getUniformLocation(pr, 'from'), 0);
    gl.uniform1i(gl.getUniformLocation(pr, 'to'), 1);
    gl.uniform1f(gl.getUniformLocation(pr, 'progress'), p);
    gl.uniform1f(gl.getUniformLocation(pr, 'ratio'), w / h);
    /* EVERY DECLARED UNIFORM, OF EVERY TYPE, GETS A VALUE.
       An uniform that is never set reads as 0 in GL — not as the default
       written beside it in the shader. The first version of this only set
       floats, which left 118 of the 200 rendering from zeroes: Prisms drew a
       literally empty frame because its `uniform int slats` was 0, so the
       prism count was zero. 571 uniforms are now carried with their types
       and defaults, and the user's own values go on top. */
    var def = window.GL_TRANSITIONS && window.GL_TRANSITIONS[name];
    var us = (def && def.uniforms) || [];
    for (var di = 0; di < us.length; di++) {
      var spec = us[di], u = gl.getUniformLocation(pr, spec.k);
      if (!u) continue;
      var val = spec.d;
      if (params && typeof params[spec.k] !== 'undefined') val = params[spec.k];
      switch (spec.t) {
        case 'float': gl.uniform1f(u, +val || 0); break;
        case 'int':   gl.uniform1i(u, Math.round(+val) || 0); break;
        case 'bool':  gl.uniform1i(u, (val === true || +val >= 0.5) ? 1 : 0); break;
        case 'vec2':  gl.uniform2fv(u, toVec(val, 2)); break;
        case 'vec3':  gl.uniform3fv(u, toVec(val, 3)); break;
        case 'vec4':  gl.uniform4fv(u, toVec(val, 4)); break;
        case 'ivec2': gl.uniform2iv(u, new Int32Array(toVec(val, 2))); break;
      }
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  };

  /* A vector default may arrive as an array from the bundle or as a single
     number from a slider the user has moved; both have to become a correctly
     sized Float32Array or the uniform call throws and the frame is lost. */
  function toVec(v, n) {
    var a = new Float32Array(n);
    if (Array.isArray(v)) { for (var i = 0; i < n; i++) a[i] = +v[i] || 0; }
    else { for (var j = 0; j < n; j++) a[j] = +v || 0; }
    return a;
  }

  var R = new Renderer();

  /* ---- the gate ---------------------------------------------------------- */
  function rendererString(gl) {
    try {
      var d = gl.getExtension('WEBGL_debug_renderer_info');
      if (d) return String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL) || '');
      return String(gl.getParameter(gl.RENDERER) || '');
    } catch (e) { return ''; }
  }

  /* Compile a real transition and time real frames. Not a synthetic loop: the
     thing being measured has to be the thing that will run, or the number
     means nothing. gl.finish() after each frame because WebGL commands are
     queued — timing without it measures how fast the browser accepts work,
     not how fast the GPU does it, which is the same trap that made a canvas
     benchmark lie earlier in this project. */
  function bench(glsl) {
    if (!R.init()) return { ok: false, why: 'no webgl2 context' };
    var rs = rendererString(R.gl);
    if (SOFTWARE.test(rs)) return { ok: false, why: 'software renderer: ' + rs, renderer: rs };

    var a = document.createElement('canvas'), b = document.createElement('canvas');
    a.width = b.width = BENCH_W; a.height = b.height = BENCH_H;
    var ag = a.getContext('2d'), bg = b.getContext('2d');
    ag.fillStyle = '#c23f7a'; ag.fillRect(0, 0, BENCH_W, BENCH_H);
    bg.fillStyle = '#1b2a6b'; bg.fillRect(0, 0, BENCH_W, BENCH_H);

    var t0, best = Infinity;
    for (var i = 0; i < BENCH_FRAMES; i++) {
      t0 = performance.now();
      if (!R.draw('__bench', glsl, a, b, (i + 1) / (BENCH_FRAMES + 1), BENCH_W, BENCH_H, null)) {
        return { ok: false, why: 'benchmark transition would not run', renderer: rs };
      }
      try { R.gl.finish(); } catch (e) {}
      var dt = performance.now() - t0;
      if (i >= 2) best = Math.min(best, dt);   /* first frames pay for upload */
    }
    /* Scaled to 1080p, which is what an export actually renders. The bench
       runs at 640x360 to keep it quick; 1920x1080 is 9x the pixels, and a
       fragment shader's cost is very close to linear in pixel count. */
    var at1080 = best * 9;
    return {
      ok: at1080 <= BUDGET_MS * 3,   /* 24ms at 1080p: slower than canvas is not worth it */
      why: at1080 <= BUDGET_MS * 3 ? 'ok' : 'too slow: ' + at1080.toFixed(1) + 'ms at 1080p',
      renderer: rs, ms640: +best.toFixed(2), ms1080: +at1080.toFixed(1)
    };
  }

  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = function () { res(true); };
      s.onerror = function () { rej(new Error('could not load ' + src)); };
      document.head.appendChild(s);
    });
  }

  var state = { decided: false, enabled: false, verdict: null, count: 0 };

  function decide() {
    if (state.decided) return Promise.resolve(state);
    state.decided = true;

    /* Cheapest possible no: a context that does not exist. */
    if (!R.init()) {
      state.verdict = { ok: false, why: 'this browser has no WebGL2' };
      return finish();
    }

    /* The bundle is 576KB and a device that fails must not pay for it — so
       the benchmark runs on one transition compiled from a string here,
       before anything is fetched. "fade" is the simplest transition there
       is, which makes it a floor: a device that cannot do this one cannot do
       any of them. */
    var FADE = 'vec4 transition(vec2 uv){ return mix(getFromColor(uv), getToColor(uv), progress); }';
    state.verdict = bench(FADE);
    if (!state.verdict.ok) return finish();

    return load(BUNDLE).then(function () {
      register();
      return finish();
    }, function (e) {
      state.verdict = { ok: false, why: String(e.message || e) };
      return finish();
    });
  }

  function finish() {
    state.enabled = !!(state.verdict && state.verdict.ok);
    try { localStorage.setItem(KEY, JSON.stringify(state.verdict)); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('nc-webgl', { detail: state }));
    } catch (e) {}
    return Promise.resolve(state);
  }

  /* ---- registering them as transitions ----------------------------------
     Into the same NC_FX.TPAINT the canvas transitions live in, so every piece
     of machinery already built picks them up for free: the FX library lists
     and previews them, the gear opens the parameter editor, the chip bar
     shows them, dragging applies them. A transition here is a TPAINT painter
     like any other — it just happens to render on the GPU and copy the result
     back onto the 2D canvas it was handed.

     PREFIXED `gl:`. 200 names from somebody else's library dropped into a
     namespace that already has 56 painters would collide — there is already
     a `cube`, a `fade`, a `wipe`. The prefix makes a collision impossible
     rather than unlikely. */
  function register() {
    var T = window.GL_TRANSITIONS, fx = window.NC_FX, ui = window.NC_TRANS_UI;
    if (!T || !fx) return 0;
    var n = 0, bad = [];
    Object.keys(T).forEach(function (name) {
      var def = T[name], id = 'gl:' + name;
      if (fx.TPAINT[id]) return;
      /* Two of the 200 take a second image as a sampler2D — a displacement
         map and a luma matte. There is nowhere in this editor to choose one,
         so registering them would put two tiles in the panel that cannot
         work. Left out, and counted, rather than shipped broken. */
      if (def.needsTexture) { bad.push(name); return; }
      fx.TPAINT[id] = function (g, w, h, p, dir) {
        /* The frame handed in is the shot being left; the other is already
           underneath on the compositor. So `from` is this frame and `to` is
           transparent — the shader blends toward nothing, and what shows
           through the transparency is the other shot. */
        var blank = document.createElement('canvas');
        blank.width = w; blank.height = h;
        var prog = dir === 'out' ? p : 1 - p;
        var ps = {};
        try {
          var c = window.NC_FX_EDIT && window.NC_FX_EDIT.cfg(id);
          if (c && c.params) ps = c.params;
        } catch (e) {}
        if (!R.draw(name, def.glsl, g.canvas, blank, prog, w, h, ps)) return;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, w, h);
        g.drawImage(R.cv, 0, 0, w, h);
        g.restore();
      };
      if (ui && ui.list && !ui.list[id]) {
        ui.list[id] = [name.replace(/([A-Z])/g, ' $1').trim(), 'GPU', 1,
                       (def.desc || 'A GPU transition.') +
                       (def.author ? ' — ' + def.author : '')];
      }
      /* The shader's own @range annotations become the editor's sliders, so
         150 of these arrive with real parameters and nobody hand-wrote one. */
      if (def.params && def.params.length && window.NC_FX_EDIT) {
        try { window.NC_FX_EDIT.PARAMS[id] = def.params.slice(); } catch (e) {}
      }
      n++;
    });
    state.count = n;
    state.skipped = bad;
    return n;
  }

  window.NC_WEBGL = {
    decide: decide, bench: bench, renderer: function () {
      return R.init() ? rendererString(R.gl) : '';
    },
    state: state, R: R, BUDGET_MS: BUDGET_MS
  };

  /* Decided once the editor's own registries exist, because registering into
     them is the point. Deferred to idle so the gate never competes with the
     editor's first paint. */
  function go() {
    var tries = 0;
    var t = setInterval(function () {
      if (window.NC_FX || ++tries > 80) { clearInterval(t); decide(); }
    }, 100);
  }
  if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 });
  else setTimeout(go, 1200);
})();
