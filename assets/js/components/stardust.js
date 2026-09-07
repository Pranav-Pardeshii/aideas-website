/* Stardust — vanilla JS port (Originkit "Stardust")
   Pure canvas 2D, no external library needed. */

(function (global) {
  const DEFAULTS = {
    background: "#000000",
    particleColor: "#FFFFFF",
    particleDensity: 4,
    minSize: 1.5,
    maxSize: 1,
    speed: 10,
    particleSpeed: 1,
    movement: 6,
    angle: 180,
  };

  function parseColorToRgba(input) {
    if (!input) return { r: 0, g: 0, b: 0, a: 1 };
    const str = input.trim();
    const rgbaMatch = str.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i
    );
    if (rgbaMatch) {
      const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255;
      const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255;
      const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255;
      const a = rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1;
      return { r, g, b, a };
    }
    const hex = str.replace(/^#/, "");
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: 1,
      };
    }
    if (hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16) / 255,
        g: parseInt(hex[1] + hex[1], 16) / 255,
        b: parseInt(hex[2] + hex[2], 16) / 255,
        a: parseInt(hex[3] + hex[3], 16) / 255,
      };
    }
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16) / 255,
        g: parseInt(hex[1] + hex[1], 16) / 255,
        b: parseInt(hex[2] + hex[2], 16) / 255,
        a: 1,
      };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  function rgbaToCanvasColor(rgba) {
    const r = Math.round(rgba.r * 255);
    const g = Math.round(rgba.g * 255);
    const b = Math.round(rgba.b * 255);
    if (rgba.a === 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${rgba.a})`;
  }

  // UI 1..10 -> internal 0.5..12 (flicker rate)
  function mapFlickerUiToInternal(ui) {
    const clamped = Math.max(1, Math.min(10, ui));
    const t = (clamped - 1) / 9;
    return 0.5 + t * 11.5;
  }

  // UI 1..10 -> internal 5..60 (density)
  function mapDensityUiToInternal(ui) {
    const clamped = Math.max(1, Math.min(10, ui));
    const t = (clamped - 1) / 9;
    return 5 + t * 55;
  }

  // Angle (deg) -> unit drift vector. 0deg = up, 90 = right, 180 = down, 270 = left.
  function angleToDrift(angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { vx: Math.cos(rad), vy: Math.sin(rad) };
  }

  /**
   * initStardust(containerId, overrides?)
   * Mounts an animated particle-sparkle background inside the element with
   * the given id. The element should be sized (e.g. via .fold-bg) already.
   */
  function initStardust(containerId, overrides) {
   try {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const cfg = Object.assign({}, DEFAULTS, overrides || {});
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let particles = [];
    let animationId = null;
    let disposed = false;

    function initParticles(width, height) {
      const list = [];
      const area = width * height;
      const mappedDensity = mapDensityUiToInternal(cfg.particleDensity);
      const count = Math.floor((area / 1e4) * mappedDensity);
      const velocityMultiplier = (cfg.particleSpeed / 10) * 0.5;
      for (let i = 0; i < count; i++) {
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * velocityMultiplier,
          vy: (Math.random() - 0.5) * velocityMultiplier,
          size: cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize),
          opacity: Math.random(),
          opacityVel: (Math.random() - 0.5) * 0.04,
        });
      }
      particles = list;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth || container.offsetWidth || 1;
      const height = container.clientHeight || container.offsetHeight || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(width, height);
    }
    resize();

    const mappedSpeed = mapFlickerUiToInternal(cfg.speed);
    const driftMag = cfg.movement * 0.1;
    const drift = angleToDrift(cfg.angle);
    const driftVx = drift.vx * driftMag;
    const driftVy = drift.vy * driftMag;

    const backgroundColor = rgbaToCanvasColor(parseColorToRgba(cfg.background));
    const particleColorRgba = parseColorToRgba(cfg.particleColor);
    const particleColorBase = rgbaToCanvasColor(Object.assign({}, particleColorRgba, { a: 1 }));

    function draw(width, height) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = particleColorBase;
      for (const p of particles) {
        ctx.globalAlpha = particleColorRgba.a * p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function animate() {
      if (disposed) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      for (const p of particles) {
        p.x += p.vx + driftVx;
        p.y += p.vy + driftVy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        p.opacity += p.opacityVel * mappedSpeed * 0.5;
        if (p.opacity <= 0.1 || p.opacity >= 1) p.opacityVel *= -1;
        p.opacity = Math.max(0.1, Math.min(1, p.opacity));
      }

      draw(width, height);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", resize);

    return {
      dispose() {
        disposed = true;
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resize);
        if (canvas.parentNode === container) container.removeChild(canvas);
      },
    };
   } catch (e) {
     // Any canvas failure here is decorative-background-only — it must
     // never block the rest of the page's script from running.
     return null;
   }
  }

  global.initStardust = initStardust;
})(window);
