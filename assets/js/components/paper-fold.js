/* Paper Fold — vanilla JS port (Originkit "Paper Ridge")
   Requires THREE (r128+) loaded globally before this file. */

(function (global) {
  const DEFAULTS = {
    paper: "#12151c",
    shade: "#05070a",
    sheenColor: "#38d1ff",
    crease: 8,
    scale: 9,
    depth: 5,
    detail: 12,
    tilt: 10,
    sheen: 4,
    contrast: 7,
    speed: 2.5,
  };

  const SEGMENTS = 200; // slightly lower than the reference for a full-page bg
  const SHEET = 8;

  function clamp(v, lo, hi, fallback) {
    const n = typeof v === "number" && isFinite(v) ? v : fallback;
    return Math.max(lo, Math.min(hi, n));
  }

  function settingsFor(cfg) {
    return {
      crease: clamp(cfg.crease, 0, 20, DEFAULTS.crease) / 20,
      scale: 0.5 + clamp(cfg.scale, 1, 20, DEFAULTS.scale) * 0.22,
      depth: clamp(cfg.depth, 1, 20, DEFAULTS.depth) * 0.06,
      detail: 1.0 + clamp(cfg.detail, 1, 20, DEFAULTS.detail) * 0.2,
      sheen: clamp(cfg.sheen, 0, 20, DEFAULTS.sheen) * 0.09,
      tilt: (clamp(cfg.tilt, 0, 20, DEFAULTS.tilt) / 20) * 0.9,
      contrast: 0.4 + clamp(cfg.contrast, 1, 20, DEFAULTS.contrast) * 0.09,
      speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.05,
    };
  }

  const FOLD_VERTEX = `
    uniform float uTime;
    uniform float uScale;
    uniform float uDepth;
    uniform float uDetail;
    uniform float uCrease;

    varying vec3 vWorld;
    varying float vHeight;

    float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.56);
        return fract(p.x * p.y * 95.43);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
        );
    }

    float sheet(vec2 p) {
        float sum = 0.0;
        float amp = 0.5;
        float norm = 0.0;
        for (int i = 0; i < 5; i++) {
            float w = clamp(uDetail - float(i), 0.0, 1.0);
            float n = noise(p) * 2.0 - 1.0;
            n = mix(n, 1.0 - abs(n) * 2.0, uCrease);
            sum += n * amp * w;
            norm += amp * w;
            p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.07;
            amp *= 0.5;
        }
        return sum / max(0.0001, norm);
    }

    void main() {
        vec3 pos = position;
        vec2 q = pos.xy * uScale + vec2(uTime * 0.35, uTime * 0.22);
        float h = sheet(q);
        pos.z += h * uDepth * 3.0;

        vec4 world = modelMatrix * vec4(pos, 1.0);
        vWorld = world.xyz;
        vHeight = h;
        gl_Position = projectionMatrix * viewMatrix * world;
    }
  `;

  const FOLD_FRAGMENT = `
    precision highp float;

    uniform vec3 uPaper;
    uniform vec3 uShade;
    uniform vec3 uSheenColor;
    uniform float uSheen;
    uniform float uContrast;

    varying vec3 vWorld;
    varying float vHeight;

    void main() {
        vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        if (n.z < 0.0) n = -n;

        vec3 lightDir = normalize(vec3(-0.45, 0.6, 0.66));
        float key = clamp(dot(n, lightDir), 0.0, 1.0);
        float fill = clamp(dot(n, normalize(vec3(0.5, -0.3, 0.5))), 0.0, 1.0) * 0.25;

        float lit = clamp((key + fill - 0.5) * uContrast * 2.0 + 0.5, 0.0, 1.0);
        vec3 col = mix(uShade, uPaper, lit);

        vec3 view = normalize(cameraPosition - vWorld);
        float grazing = 1.0 - clamp(dot(n, view), 0.0, 1.0);
        float sheen = pow(grazing, 3.0) * uSheen * 2.2;
        col += uSheenColor * sheen;

        gl_FragColor = vec4(max(col, 0.0), 1.0);
    }
  `;

  class FoldScene {
    constructor(container, cfg) {
      this.container = container;
      this.cfg = cfg;
      this.time = 0;
      this.width = 0;
      this.height = 0;
      this.frameId = 0;
      this.lastT = 0;
      this.disposed = false;

      const S = settingsFor(cfg);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
      container.appendChild(el);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
      this.geometry = new THREE.PlaneGeometry(SHEET, SHEET, SEGMENTS, SEGMENTS);
      this.material = new THREE.ShaderMaterial({
        vertexShader: FOLD_VERTEX,
        fragmentShader: FOLD_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: S.scale },
          uDepth: { value: S.depth },
          uDetail: { value: S.detail },
          uCrease: { value: S.crease },
          uSheen: { value: S.sheen },
          uContrast: { value: S.contrast },
          uPaper: { value: new THREE.Color(cfg.paper) },
          uShade: { value: new THREE.Color(cfg.shade) },
          uSheenColor: { value: new THREE.Color(cfg.sheenColor) },
        },
        side: THREE.DoubleSide,
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.frustumCulled = false;
      this.scene.add(this.mesh);
      this.applyTilt(S.tilt);
    }

    applyTilt(tilt) {
      this.mesh.rotation.set(-tilt, tilt * 0.35, 0);
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
      this.updateCamera();
    }

    updateCamera() {
      const aspect = Math.max(1, this.width) / Math.max(1, this.height);
      this.camera.aspect = aspect;
      const halfV = Math.tan((this.camera.fov * Math.PI) / 360);
      const needed = 2.0 / Math.min(halfV * aspect, halfV);
      this.camera.position.set(0, 0, needed * 1.02);
      this.camera.lookAt(0, 0, 0);
      this.camera.updateProjectionMatrix();
    }

    updateConfig(cfg) {
      if (this.disposed) return;
      this.cfg = cfg;
      const S = settingsFor(cfg);
      const u = this.material.uniforms;
      u.uScale.value = S.scale;
      u.uDepth.value = S.depth;
      u.uDetail.value = S.detail;
      u.uCrease.value = S.crease;
      u.uSheen.value = S.sheen;
      u.uContrast.value = S.contrast;
      u.uPaper.value.set(cfg.paper || "#ffffff");
      u.uShade.value.set(cfg.shade || "#000000");
      u.uSheenColor.value.set(cfg.sheenColor || "#ffffff");
      this.applyTilt(S.tilt);
    }

    step() {
      if (this.disposed) return;
      const now = performance.now();
      let dt = (now - this.lastT) / 1000;
      this.lastT = now;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > 0.05) dt = 0.05;

      this.time += dt * settingsFor(this.cfg).speed;
      this.material.uniforms.uTime.value = this.time;
      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.disposed = true;
      cancelAnimationFrame(this.frameId);
      this.geometry.dispose();
      this.material.dispose();
      this.renderer.dispose();
      const el = this.renderer.domElement;
      if (el.parentNode === this.container) this.container.removeChild(el);
    }
  }

  /**
   * initPaperFold(containerId, overrides?)
   * Mounts an animated Paper Fold background inside the element with the
   * given id. The element should be position:fixed (or absolute) and sized
   * to cover the area it should fill — see .fold-bg in style.css.
   */
  function initPaperFold(containerId, overrides) {
    try {
      const container = document.getElementById(containerId);
      if (!container || typeof THREE === "undefined") return null;

      const cfg = Object.assign({}, DEFAULTS, overrides || {});
      const scene = new FoldScene(container, cfg);
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

  global.initPaperFold = initPaperFold;
})(window);
