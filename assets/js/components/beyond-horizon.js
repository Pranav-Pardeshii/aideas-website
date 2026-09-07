/* Beyond Horizon — vanilla JS port (Originkit "Beyond Horizon")
   A sunrise-over-a-horizon glow, raw WebGL1, no external dependency.
   Recolored to the site's cyan/purple theme. */

(function (global) {
  const REF_ASPECT = 1314 / 2860;
  const MAX_DPR = 2;
  const RENDER_SCALE = 0.6;
  const PIXEL_BUDGET = 2200000;

  const DEFAULTS = {
    background: "rgba(0,0,0,0)",
    coreColor: "#FFFFFF",
    midColor: "#7fd8ff",
    deepColor: "#2a1f5c",
    brightness: 1.6,
    coreSize: 0.02,
    coreHover: 0.04,
    haze: 2.6,
    speed: 1,
    parallax: 2.5,
    fit: 50,
    horizonY: 0.98,
    horizonRadius: 1.867,
    rimSpread: 0.06,
  };

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uMouse;
    uniform float uHover;
    uniform float uBright;
    uniform float uHorizonY;
    uniform float uHorizonR;
    uniform float uHaze;
    uniform float uCoreSize;
    uniform float uCoreHover;
    uniform float uRimSpread;
    uniform float uParallax;
    uniform float uFit;
    uniform vec3  uBg;
    uniform vec3  uCore;
    uniform vec3  uMid;
    uniform vec3  uDeep;

    const int STEPS = 26;
    const float REF_ASPECT = ${REF_ASPECT.toFixed(6)};

    float hash31(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }

    float vnoise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      float n000 = hash31(i);
      float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
      return mix(
        mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
        mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
        f.z);
    }

    float fbm(vec3 p) {
      float s = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        s += a * vnoise(p);
        p = p * 2.02;
        p.xz = mat2(0.80, 0.60, -0.60, 0.80) * p.xz;
        a *= 0.5;
      }
      return s;
    }

    float hash21(vec2 p) {
      vec3 q = fract(vec3(p.xyx) * 0.1031);
      q += dot(q, q.yzx + 33.33);
      return fract((q.x + q.y) * q.z);
    }

    vec3 tonemapTanh(vec3 x) {
      x = clamp(x, -12.0, 12.0);
      vec3 e2 = exp(2.0 * x);
      return (e2 - 1.0) / (e2 + 1.0);
    }

    void main() {
      float aspect = uRes.y / uRes.x;
      vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

      float unit = clamp(pow(max(aspect, 0.0001) / REF_ASPECT, uFit), 0.45, 3.2);
      float inv = 1.0 / unit;

      vec2 P = vec2(uv.x - 0.5, (uv.y - uHorizonY) * aspect) * inv;
      float pxUnit = inv / max(uRes.x, 1.0);

      float hv = clamp(uHover, 0.0, 1.0);
      vec2 m = uMouse * hv * uParallax * inv;

      float coreSize  = mix(uCoreSize, uCoreHover, hv);
      float rimSpread = mix(uRimSpread, 0.220, hv);
      float rimGain   = mix(0.55, 1.9, hv);
      float hazeGain  = mix(1.15, 9.00, hv);
      float hazeK     = mix(20.0, 19.0, hv);
      float hazeCut0  = mix(0.21, 0.40, hv);
      float hazeCut1  = mix(0.13, 0.28, hv);

      vec3 col = uBg;

      vec2 corePos = vec2(m.x * 0.015, m.y * 0.007);
      float d = length(P - corePos);
      float g = coreSize / max(d, 0.0009);
      g = mix(g, g * g, 0.55);
      g *= mix(1.0, smoothstep(0.46, 0.28, d), hv);
      g *= uBright;

      vec3 glowCol = mix(uDeep, uMid, clamp(g * 2.4, 0.0, 1.0));
      glowCol = mix(glowCol, uCore, clamp((g - 0.30) * 1.7, 0.0, 1.0));
      col += glowCol * g;

      vec3 ro = vec3(0.0, 0.0, -1.6);
      vec3 rd = normalize(vec3(P - corePos, 1.2));
      float t = 0.28;
      float stepSize = 0.085;
      float trans = 1.0;
      vec3 haze = vec3(0.0);
      vec2 drift = m * 0.16;

      for (int i = 0; i < STEPS; i++) {
        if (trans < 0.02) break;
        vec3 pos = ro + rd * t;
        vec3 q = pos * vec3(3.2, 1.75, 3.2);
        q.y -= uTime * 0.10;
        q.z += uTime * 0.035;
        q.xy += drift;

        float dens = fbm(q);
        dens = smoothstep(0.47, 0.83, dens);

        float dl = length(pos.xy * vec2(1.0, 0.72));
        float li = 1.0 / (1.0 + dl * dl * 110.0);

        vec3 lc = mix(uDeep, uMid, clamp(li * 1.6, 0.0, 1.0));
        lc += vec3(0.16, 0.05, -0.04) * (1.0 - dens) * li * 0.5;

        haze += dens * li * lc * trans * stepSize;
        trans *= 1.0 - dens * 0.28;
        t += stepSize;
      }
      float hazeEnv = exp(-d * hazeK) * smoothstep(hazeCut0, hazeCut1, d);
      col += haze * uHaze * hazeEnv * hazeGain;

      float discD = length(P - vec2(corePos.x, uHorizonR)) - uHorizonR;
      float aa = 1.4 * pxUnit;
      float above = smoothstep(-aa, aa, discD);

      float rimDx = abs(P.x - corePos.x);
      float rimBase = exp(-rimDx / max(rimSpread, 0.001));
      rimBase *= mix(1.0, smoothstep(0.40, 0.26, rimDx), hv);
      float rimFall = rimBase * mix(1.0, mix(0.22, 1.0, smoothstep(0.0, 0.18, rimDx)), hv);

      float kMax = 0.7 / max(pxUnit, 1e-7);

      float shade = exp(min(discD, 0.0) * min(340.0, kMax));
      float bleed = exp(min(discD, 0.0) * min(95.0, kMax)) * rimBase * hv * 0.85;
      vec3 ground = uBg * (1.0 - 0.85 * clamp(shade, 0.0, 1.0)) + uMid * bleed;
      col = mix(ground, col, above);

      float rimThin  = exp(-abs(discD) * min(mix(620.0, 150.0, hv), kMax));
      float rimBroad = exp(-abs(discD) * min(mix(620.0, 22.0, hv), kMax));
      float rimBand  = rimThin + mix(0.0, 0.26, hv) * rimBroad;
      col += uMid * rimBand * rimFall * rimGain * above * uBright;

      col = tonemapTanh(col);
      col += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;

      gl_FragColor = vec4(col, above > 0.5 ? 1.0 : max(g, rimBand * rimFall * rimGain));
    }
  `;

  function hexToRgb(hex, fb) {
    if (typeof hex !== "string") return fb;
    const str = hex.trim();
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (m) return [parseFloat(m[1]) / 255, parseFloat(m[2]) / 255, parseFloat(m[3]) / 255];
    let body = str.replace(/^#/, "");
    if (body.length === 3) body = body.split("").map((c) => c + c).join("");
    if (body.length < 6) return fb;
    const n = parseInt(body.slice(0, 6), 16);
    if (Number.isNaN(n)) return fb;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function compile(gl, type, src) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function initBeyondHorizon(containerId, overrides) {
    try {
      const host = document.getElementById(containerId);
      if (!host) return null;

      const cfg = Object.assign({}, DEFAULTS, overrides || {});
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      host.appendChild(canvas);

      const gl =
        canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false }) ||
        canvas.getContext("experimental-webgl");
      if (!gl) return null;

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return null;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const U = (n) => gl.getUniformLocation(prog, n);
      const u = {
        res: U("uRes"), time: U("uTime"), mouse: U("uMouse"), hover: U("uHover"),
        bright: U("uBright"), horizonY: U("uHorizonY"), horizonR: U("uHorizonR"),
        haze: U("uHaze"), coreSize: U("uCoreSize"), coreHover: U("uCoreHover"),
        rimSpread: U("uRimSpread"), parallax: U("uParallax"), fit: U("uFit"),
        bg: U("uBg"), core: U("uCore"), mid: U("uMid"), deep: U("uDeep"),
      };

      const colors = {
        bg: hexToRgb(cfg.background, [0, 0, 0]),
        core: hexToRgb(cfg.coreColor, [1, 1, 1]),
        mid: hexToRgb(cfg.midColor, [0.5, 0.85, 1]),
        deep: hexToRgb(cfg.deepColor, [0.16, 0.12, 0.36]),
      };

      let w = 0, h = 0;
      const pointer = { tx: 0, ty: 0, x: 0, y: 0, thover: 0, hover: 0 };

      function resize() {
        const cssW = Math.max(1, Math.round(host.offsetWidth || 1));
        const cssH = Math.max(1, Math.round(host.offsetHeight || 1));
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const scale = Math.min(Math.max(RENDER_SCALE * dpr, 1), MAX_DPR);
        let nw = Math.max(2, Math.round(cssW * scale));
        let nh = Math.max(2, Math.round(cssH * scale));
        const over = (nw * nh) / PIXEL_BUDGET;
        if (over > 1) {
          const s = Math.sqrt(1 / over);
          nw = Math.max(2, Math.round(nw * s));
          nh = Math.max(2, Math.round(nh * s));
        }
        if (nw === w && nh === h) return false;
        w = nw; h = nh;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        return true;
      }

      function draw(tSec) {
        gl.uniform2f(u.res, w, h);
        gl.uniform1f(u.time, tSec * cfg.speed);
        gl.uniform2f(u.mouse, pointer.x, pointer.y);
        gl.uniform1f(u.hover, pointer.hover);
        gl.uniform1f(u.bright, cfg.brightness);
        gl.uniform1f(u.horizonY, cfg.horizonY);
        gl.uniform1f(u.horizonR, cfg.horizonRadius);
        gl.uniform1f(u.haze, cfg.haze);
        gl.uniform1f(u.coreSize, cfg.coreSize);
        gl.uniform1f(u.coreHover, cfg.coreHover);
        gl.uniform1f(u.rimSpread, cfg.rimSpread);
        gl.uniform1f(u.parallax, cfg.parallax);
        gl.uniform1f(u.fit, Math.min(Math.max(cfg.fit, 0), 100) / 100);
        gl.uniform3fv(u.bg, colors.bg);
        gl.uniform3fv(u.core, colors.core);
        gl.uniform3fv(u.mid, colors.mid);
        gl.uniform3fv(u.deep, colors.deep);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      let raf = 0, lastT = 0, start = 0, disposed = false;

      resize();
      draw(0);

      const onResize = () => { if (resize()) draw(lastT); };
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
      if (ro) ro.observe(host);
      window.addEventListener("resize", onResize);

      function loop(now) {
        if (disposed) return;
        if (!start) start = now;
        lastT = (now - start) / 1000;
        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        pointer.hover += (pointer.thover - pointer.hover) * 0.05;
        draw(lastT);
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        pointer.tx = (e.clientX - r.left) / r.width - 0.5;
        pointer.ty = (e.clientY - r.top) / r.height - 0.5;
        pointer.thover = 1;
      };
      const onLeave = () => {
        pointer.tx = 0; pointer.ty = 0; pointer.thover = 0;
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerenter", onMove);
      host.addEventListener("pointerleave", onLeave);

      return {
        dispose() {
          disposed = true;
          cancelAnimationFrame(raf);
          if (ro) ro.disconnect();
          window.removeEventListener("resize", onResize);
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerenter", onMove);
          host.removeEventListener("pointerleave", onLeave);
          if (canvas.parentNode === host) host.removeChild(canvas);
        },
      };
    } catch (e) {
      return null;
    }
  }

  global.initBeyondHorizon = initBeyondHorizon;
})(window);
