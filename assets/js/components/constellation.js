/* Constellation — vanilla JS port (Originkit "Constellation")
   A drifting cloud of nodes that links any two that come close, and links
   to the cursor as if it were another node. Requires THREE (r128+) global. */

(function (global) {
  const BOX = { x: 2.4, y: 1.15, z: 0.8 };
  const VIEW = 1.1;

  const DEFAULTS = {
    dot: "#38d1ff",
    line: "#33465c",
    dotHover: "#b06bff",
    lineHover: "#b06bff",
    nodes: 14,
    reach: 14,
    lineWidth: 1.4,
    lineGlow: 14,
    dotSize: 16,
    drift: 10,
    parallax: 10,
    cursor: 14,
  };

  function clamp(v, lo, hi, fallback) {
    const n = typeof v === "number" && isFinite(v) ? v : fallback;
    return Math.max(lo, Math.min(hi, n));
  }

  function settingsFor(cfg) {
    const nodes = clamp(cfg.nodes, 1, 20, DEFAULTS.nodes);
    return {
      count: Math.round(30 + nodes * nodes),
      reach: 0.1 + clamp(cfg.reach, 1, 20, DEFAULTS.reach) * 0.026,
      lineWidth: clamp(cfg.lineWidth, 1, 20, DEFAULTS.lineWidth),
      lineGlow: clamp(cfg.lineGlow, 0, 20, DEFAULTS.lineGlow) * 0.05,
      dotSize: 0.002 + clamp(cfg.dotSize, 1, 50, DEFAULTS.dotSize) * 0.0018,
      drift: clamp(cfg.drift, 0, 20, DEFAULTS.drift) * 0.012,
      parallax: clamp(cfg.parallax, 0, 20, DEFAULTS.parallax) * 0.012,
      cursorReach: clamp(cfg.cursor, 0, 20, DEFAULTS.cursor) * 0.045,
    };
  }

  const DOT_VERTEX = `
    attribute float aSeed;
    attribute float aHover;
    uniform float uDotSize;
    uniform float uViewHeight;
    varying float vSeed;
    varying float vHover;
    void main() {
        vSeed = aSeed;
        vHover = aHover;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(
            uDotSize * (0.6 + aSeed * 0.9)
                * (uViewHeight * projectionMatrix[1][1]) / (-2.0 * mv.z),
            0.0
        );
        gl_Position = projectionMatrix * mv;
    }
  `;

  const DOT_FRAGMENT = `
    precision highp float;
    uniform vec3 uDot;
    uniform vec3 uDotHover;
    varying float vSeed;
    varying float vHover;
    void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float core = 1.0 - smoothstep(0.0, 0.5, d);
        float halo = exp(-d * d * 3.0);
        float a = (core * 0.85 + halo * 0.3) * (0.45 + vSeed * 0.55);
        if (a < 0.002) discard;
        vec3 color = mix(uDot, uDotHover, vHover);
        gl_FragColor = vec4(color * a, a);
    }
  `;

  const LINE_VERTEX = `
    attribute vec3 aOther;
    attribute float aSide;
    attribute float aAlpha;
    attribute float aHover;
    uniform vec2 uResolution;
    uniform float uHalfWidth;
    varying float vAlpha;
    varying float vAcross;
    varying float vHover;
    void main() {
        vAlpha = aAlpha;
        vAcross = aSide;
        vHover = aHover;
        vec4 clipA = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 clipB = projectionMatrix * modelViewMatrix * vec4(aOther, 1.0);
        vec2 hres = uResolution * 0.5;
        vec2 pxA = (clipA.xy / max(clipA.w, 1e-4)) * hres;
        vec2 pxB = (clipB.xy / max(clipB.w, 1e-4)) * hres;
        vec2 delta = pxB - pxA;
        float len = length(delta);
        vec2 dir = len > 1e-4 ? delta / len : vec2(1.0, 0.0);
        vec2 nrm = vec2(-dir.y, dir.x);
        vec2 offPx = nrm * aSide * uHalfWidth;
        gl_Position = vec4(
            clipA.xy + (offPx / hres) * clipA.w,
            clipA.z,
            clipA.w
        );
    }
  `;

  const LINE_FRAGMENT = `
    precision highp float;
    uniform vec3 uLine;
    uniform vec3 uLineHover;
    uniform float uGlow;
    uniform float uFeather;
    varying float vAlpha;
    varying float vAcross;
    varying float vHover;
    void main() {
        float cov = clamp((1.0 - abs(vAcross)) / uFeather + 0.5, 0.0, 1.0);
        float a = vAlpha * uGlow * cov;
        if (a < 0.002) discard;
        vec3 color = mix(uLine, uLineHover, vHover);
        gl_FragColor = vec4(color * a, a);
    }
  `;

  function featherFor(halfWidth) {
    return Math.min(4, 1 / Math.max(halfWidth, 0.25));
  }

  class ConstellationScene {
    constructor(container, cfg) {
      this.container = container;
      this.cfg = cfg;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      this.group = new THREE.Group();
      this.dotGeo = new THREE.BufferGeometry();
      this.lineGeo = new THREE.BufferGeometry();
      this.dotHoverArr = new Float32Array(0);
      this.lineHoverArr = new Float32Array(0);
      this.pos = new Float32Array(0);
      this.vel = new Float32Array(0);
      this.count = 0;
      this.maxLinks = 0;
      this.linePos = new Float32Array(0);
      this.lineOther = new Float32Array(0);
      this.lineAlpha = new Float32Array(0);
      this.aimX = 0;
      this.aimY = 0;
      this.grip = 0;
      this.targetGrip = 0;
      this.tiltX = 0;
      this.tiltY = 0;
      this.width = 0;
      this.height = 0;
      this.frameId = 0;
      this.lastT = 0;
      this.disposed = false;
      this.unbind = () => {};

      const S = settingsFor(cfg);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.renderer.setPixelRatio(this.dpr);
      if ("outputColorSpace" in this.renderer && THREE.SRGBColorSpace) {
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      } else if ("outputEncoding" in this.renderer && THREE.sRGBEncoding) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }
      this.renderer.setClearColor(0x000000, 0);
      const el = this.renderer.domElement;
      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.pointerEvents = "none";
      container.appendChild(el);

      this.dotMat = new THREE.ShaderMaterial({
        vertexShader: DOT_VERTEX,
        fragmentShader: DOT_FRAGMENT,
        uniforms: {
          uDot: { value: new THREE.Color(cfg.dot) },
          uDotHover: { value: new THREE.Color(cfg.dotHover) },
          uDotSize: { value: S.dotSize },
          uViewHeight: { value: 600 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      });

      const halfWidth = (S.lineWidth * this.dpr) / 2;
      this.lineMat = new THREE.ShaderMaterial({
        vertexShader: LINE_VERTEX,
        fragmentShader: LINE_FRAGMENT,
        uniforms: {
          uLine: { value: new THREE.Color(cfg.line) },
          uLineHover: { value: new THREE.Color(cfg.lineHover) },
          uGlow: { value: S.lineGlow },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uHalfWidth: { value: halfWidth },
          uFeather: { value: featherFor(halfWidth) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      });

      this.dots = new THREE.Points(this.dotGeo, this.dotMat);
      this.dots.frustumCulled = false;
      this.lines = new THREE.Mesh(this.lineGeo, this.lineMat);
      this.lines.frustumCulled = false;
      this.group.add(this.lines);
      this.group.add(this.dots);
      this.scene.add(this.group);

      this.build(S.count);
      this.bindEvents();
    }

    build(count) {
      this.count = count;
      this.pos = new Float32Array(count * 3);
      this.vel = new Float32Array(count * 3);
      const seed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        this.pos[i * 3] = (Math.random() * 2 - 1) * BOX.x;
        this.pos[i * 3 + 1] = (Math.random() * 2 - 1) * BOX.y;
        this.pos[i * 3 + 2] = (Math.random() * 2 - 1) * BOX.z;
        this.vel[i * 3] = Math.random() * 2 - 1;
        this.vel[i * 3 + 1] = Math.random() * 2 - 1;
        this.vel[i * 3 + 2] = (Math.random() * 2 - 1) * 0.5;
        seed[i] = Math.random();
      }
      this.dotGeo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      this.dotGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      this.dotHoverArr = new Float32Array(count);
      this.dotGeo.setAttribute("aHover", new THREE.BufferAttribute(this.dotHoverArr, 1));

      this.maxLinks = count * 10;
      const verts = this.maxLinks * 4;
      this.linePos = new Float32Array(verts * 3);
      this.lineOther = new Float32Array(verts * 3);
      this.lineAlpha = new Float32Array(verts);
      this.lineHoverArr = new Float32Array(verts);

      const side = new Float32Array(verts);
      const IndexArray = verts > 65535 ? Uint32Array : Uint16Array;
      const index = new IndexArray(this.maxLinks * 6);
      for (let i = 0; i < this.maxLinks; i++) {
        const v = i * 4;
        side[v] = -1;
        side[v + 1] = 1;
        side[v + 2] = 1;
        side[v + 3] = -1;
        const k = i * 6;
        index[k] = v;
        index[k + 1] = v + 2;
        index[k + 2] = v + 3;
        index[k + 3] = v;
        index[k + 4] = v + 3;
        index[k + 5] = v + 1;
      }

      this.lineGeo.setAttribute("position", new THREE.BufferAttribute(this.linePos, 3));
      this.lineGeo.setAttribute("aOther", new THREE.BufferAttribute(this.lineOther, 3));
      this.lineGeo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
      this.lineGeo.setAttribute("aAlpha", new THREE.BufferAttribute(this.lineAlpha, 1));
      this.lineGeo.setAttribute("aHover", new THREE.BufferAttribute(this.lineHoverArr, 1));
      this.lineGeo.setIndex(new THREE.BufferAttribute(index, 1));
      this.lineGeo.setDrawRange(0, 0);
    }

    bindEvents() {
      const move = (e) => {
        const r = this.container.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
        this.targetGrip = inside ? 1 : 0;
        if (!inside) return;
        this.aimX = x * 2 - 1;
        this.aimY = -(y * 2 - 1);
      };
      const leave = () => { this.targetGrip = 0; };
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerleave", leave);
      this.unbind = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerleave", leave);
      };
    }

    start() {
      this.lastT = performance.now();
      const loop = () => {
        this.frameId = requestAnimationFrame(loop);
        this.step();
      };
      loop();
    }

    setSize(width, height) {
      if (this.disposed || width <= 0 || height <= 0) return;
      this.width = width;
      this.height = height;
      this.renderer.setSize(width, height, false);
      this.dotMat.uniforms.uViewHeight.value = height * this.dpr;
      this.lineMat.uniforms.uResolution.value.set(width * this.dpr, height * this.dpr);
      const aspect = width / height;
      const dist = VIEW / Math.tan((40 / 2) * (Math.PI / 180));
      this.camera.aspect = aspect;
      this.camera.position.set(0, 0, dist);
      this.camera.lookAt(0, 0, 0);
      this.camera.updateProjectionMatrix();
    }

    emit(n, ax, ay, az, bx, by, bz, alpha, hover) {
      const lp = this.linePos, lo = this.lineOther, la = this.lineAlpha, lh = this.lineHoverArr;
      const k = n * 12;
      lp[k] = ax; lp[k + 1] = ay; lp[k + 2] = az;
      lp[k + 3] = ax; lp[k + 4] = ay; lp[k + 5] = az;
      lp[k + 6] = bx; lp[k + 7] = by; lp[k + 8] = bz;
      lp[k + 9] = bx; lp[k + 10] = by; lp[k + 11] = bz;
      lo[k] = bx; lo[k + 1] = by; lo[k + 2] = bz;
      lo[k + 3] = bx; lo[k + 4] = by; lo[k + 5] = bz;
      lo[k + 6] = ax; lo[k + 7] = ay; lo[k + 8] = az;
      lo[k + 9] = ax; lo[k + 10] = ay; lo[k + 11] = az;
      const a = n * 4;
      la[a] = alpha; la[a + 1] = alpha; la[a + 2] = alpha; la[a + 3] = alpha;
      lh[a] = hover; lh[a + 1] = hover; lh[a + 2] = hover; lh[a + 3] = hover;
    }

    link(reach, cursorReach) {
      const p = this.pos;
      const r2 = reach * reach;
      let n = 0;
      this.dotHoverArr.fill(0);

      for (let i = 0; i < this.count && n < this.maxLinks; i++) {
        const ax = p[i * 3], ay = p[i * 3 + 1], az = p[i * 3 + 2];
        for (let j = i + 1; j < this.count && n < this.maxLinks; j++) {
          const dx = ax - p[j * 3], dy = ay - p[j * 3 + 1], dz = az - p[j * 3 + 2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > r2) continue;
          const t = 1 - d2 / r2;
          this.emit(n, ax, ay, az, p[j * 3], p[j * 3 + 1], p[j * 3 + 2], t * t, 0);
          n++;
        }
      }

      if (this.grip > 0.01 && cursorReach > 0) {
        const halfW = VIEW * (Math.max(1, this.width) / Math.max(1, this.height));
        const cx = this.aimX * halfW;
        const cy = this.aimY * VIEW;
        const cr2 = cursorReach * cursorReach;
        for (let i = 0; i < this.count && n < this.maxLinks; i++) {
          const dx = cx - p[i * 3], dy = cy - p[i * 3 + 1], dz = p[i * 3 + 2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > cr2) continue;
          const t = (1 - d2 / cr2) * this.grip;
          this.dotHoverArr[i] = t;
          this.emit(n, cx, cy, 0, p[i * 3], p[i * 3 + 1], p[i * 3 + 2], t * 2.2, t);
          n++;
        }
      }

      this.lineGeo.attributes.position.needsUpdate = true;
      this.lineGeo.attributes.aOther.needsUpdate = true;
      this.lineGeo.attributes.aAlpha.needsUpdate = true;
      this.lineGeo.attributes.aHover.needsUpdate = true;
      this.dotGeo.attributes.aHover.needsUpdate = true;
      return n * 6;
    }

    step() {
      if (this.disposed) return;
      const now = performance.now();
      let dt = (now - this.lastT) / 1000;
      this.lastT = now;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > 0.05) dt = 0.05;

      const S = settingsFor(this.cfg);
      const p = this.pos, v = this.vel;

      for (let i = 0; i < this.count; i++) {
        const k = i * 3;
        p[k] += v[k] * S.drift * dt;
        p[k + 1] += v[k + 1] * S.drift * dt;
        p[k + 2] += v[k + 2] * S.drift * dt;
        if (p[k] < -BOX.x || p[k] > BOX.x) v[k] = -v[k];
        if (p[k + 1] < -BOX.y || p[k + 1] > BOX.y) v[k + 1] = -v[k + 1];
        if (p[k + 2] < -BOX.z || p[k + 2] > BOX.z) v[k + 2] = -v[k + 2];
      }
      this.dotGeo.attributes.position.needsUpdate = true;

      this.grip += (this.targetGrip - this.grip) * (1 - Math.exp(-dt * 4));
      this.lineGeo.setDrawRange(0, this.link(S.reach, S.cursorReach));

      const tx = -this.aimY * S.parallax * this.grip;
      const ty = this.aimX * S.parallax * this.grip;
      const ease = 1 - Math.exp(-dt * 3);
      this.tiltX += (tx - this.tiltX) * ease;
      this.tiltY += (ty - this.tiltY) * ease;
      this.group.rotation.x = this.tiltX;
      this.group.rotation.y = this.tiltY;

      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.disposed = true;
      cancelAnimationFrame(this.frameId);
      this.unbind();
      this.dotGeo.dispose();
      this.lineGeo.dispose();
      this.dotMat.dispose();
      this.lineMat.dispose();
      this.renderer.dispose();
      const el = this.renderer.domElement;
      if (el.parentNode === this.container) this.container.removeChild(el);
    }
  }

  function initConstellation(containerId, overrides) {
    try {
      const container = document.getElementById(containerId);
      if (!container || typeof THREE === "undefined") return null;

      const cfg = Object.assign({}, DEFAULTS, overrides || {});
      const scene = new ConstellationScene(container, cfg);
      scene.setSize(container.clientWidth, container.clientHeight);
      scene.start();

      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => {
          scene.setSize(container.clientWidth, container.clientHeight);
        });
        ro.observe(container);
      }

      return scene;
    } catch (e) {
      // Any WebGL/Three.js failure here is decorative-background-only — it
      // must never block the rest of the page's script from running.
      return null;
    }
  }

  global.initConstellation = initConstellation;
})(window);
