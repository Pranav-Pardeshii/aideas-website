/* InkBleed — vanilla JS port (Originkit "Inkbleed")
   Hover a heading and the glyphs near the cursor melt into a blurred ink blob. */

(function (global) {
  const MAIN_RADIUS = 0;
  const GOO_BLUR = 6;
  const THRESHOLD = 40;
  const CUTOFF = -15;
  const LEFT_CHOKER_OFFSET = -10;
  const RIGHT_CHOKER_OFFSET = 10;
  const FOLLOW = 0.3;
  const INTENSITY_FOLLOW = 0.25;
  const SETTLE_EPSILON = 0.4;

  let uidCounter = 0;

  /**
   * initInkBleed(hostId, opts)
   * opts: { text, color, intensity(0-100), secondaryRadius, blur }
   * The host element's content is replaced with the per-character ink-bleed
   * structure; hovering it reveals a cursor-follow blur/ink distortion.
   */
  function initInkBleed(hostId, opts) {
    const host = document.getElementById(hostId);
    if (!host) return null;

    const o = opts || {};
    const text = o.text != null ? o.text : host.textContent.trim();
    const color = o.color || "#ffffff";
    const secondaryRadius = o.secondaryRadius || 35;
    const blurAmount = o.blur || 10;
    const intensityFactor = Math.max(0, Math.min(100, o.intensity != null ? o.intensity : 50)) / 16.67;

    uidCounter++;
    const filterGooId = `ink-goo-${uidCounter}`;

    const chars = Array.from(text);
    const innerPct = (MAIN_RADIUS / secondaryRadius) * 100;
    const sharpMask = `radial-gradient(circle calc(${secondaryRadius}px * var(--spot-on, 0)) at var(--mx, -9999px) var(--my, -9999px), transparent 0%, transparent ${innerPct}%, rgba(0,0,0,1) 100%)`;
    const spotMask = `radial-gradient(circle calc(${secondaryRadius}px * var(--spot-on, 0)) at var(--mx, -9999px) var(--my, -9999px), rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${innerPct}%, transparent 100%)`;

    host.innerHTML = `
      <svg style="position:absolute;width:0;height:0;pointer-events:none" aria-hidden="true">
        <defs>
          <filter id="${filterGooId}">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${GOO_BLUR}" result="blur"></feGaussianBlur>
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${THRESHOLD} ${CUTOFF}" result="goo"></feColorMatrix>
            <feComposite in="SourceGraphic" in2="goo" operator="atop"></feComposite>
          </filter>
        </defs>
      </svg>
    `;

    const inkContainer = document.createElement("span");
    inkContainer.style.position = "relative";
    inkContainer.style.display = "inline-flex";
    inkContainer.style.filter = `url(#${filterGooId})`;
    inkContainer.style.color = color;
    host.appendChild(inkContainer);

    const wrapEls = [], leftEls = [], rightEls = [];

    chars.forEach((ch) => {
      const display = ch === " " ? "\u00A0" : ch;

      const wrap = document.createElement("span");
      Object.assign(wrap.style, { position: "relative", display: "inline-block", whiteSpace: "pre", overflow: "visible" });

      const sharp = document.createElement("span");
      Object.assign(sharp.style, { display: "inline-block", whiteSpace: "pre", maskImage: sharpMask, WebkitMaskImage: sharpMask });
      sharp.textContent = display;
      wrap.appendChild(sharp);

      const blur = document.createElement("span");
      blur.setAttribute("aria-hidden", "true");
      Object.assign(blur.style, {
        position: "absolute", top: "0", left: "0", display: "inline-block", whiteSpace: "pre",
        pointerEvents: "none", filter: `blur(${blurAmount}px)`, maskImage: spotMask, WebkitMaskImage: spotMask,
      });
      blur.textContent = display;
      wrap.appendChild(blur);

      const left = document.createElement("span");
      left.setAttribute("aria-hidden", "true");
      Object.assign(left.style, {
        position: "absolute", top: "0", left: LEFT_CHOKER_OFFSET + "px", display: "inline-block", whiteSpace: "pre",
        pointerEvents: "none", maskImage: spotMask, WebkitMaskImage: spotMask,
      });
      left.textContent = display;
      wrap.appendChild(left);

      const right = document.createElement("span");
      right.setAttribute("aria-hidden", "true");
      Object.assign(right.style, {
        position: "absolute", top: "0", left: RIGHT_CHOKER_OFFSET + "px", display: "inline-block", whiteSpace: "pre",
        pointerEvents: "none", maskImage: spotMask, WebkitMaskImage: spotMask,
      });
      right.textContent = display;
      wrap.appendChild(right);

      inkContainer.appendChild(wrap);
      wrapEls.push(wrap);
      leftEls.push(left);
      rightEls.push(right);
    });

    let metrics = [];
    function measure() {
      metrics = wrapEls.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, w: r.width, h: r.height };
      });
    }
    measure();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(host);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const target = { x: -9999, y: -9999, on: 0 };
    const smooth = { x: -9999, y: -9999, on: 0 };
    let rafId = null;

    function render() {
      inkContainer.style.setProperty("--spot-on", (smooth.on * intensityFactor).toFixed(3));
      for (let i = 0; i < metrics.length; i++) {
        const m = metrics[i];
        if (!m || m.w === 0) continue;
        const mxBase = smooth.x - m.left;
        const myActual = smooth.y - m.top;
        wrapEls[i].style.setProperty("--mx", mxBase.toFixed(1) + "px");
        wrapEls[i].style.setProperty("--my", myActual.toFixed(1) + "px");
        leftEls[i].style.setProperty("--mx", (mxBase - LEFT_CHOKER_OFFSET).toFixed(1) + "px");
        leftEls[i].style.setProperty("--my", myActual.toFixed(1) + "px");
        rightEls[i].style.setProperty("--mx", (mxBase - RIGHT_CHOKER_OFFSET).toFixed(1) + "px");
        rightEls[i].style.setProperty("--my", myActual.toFixed(1) + "px");
      }
    }

    function tick() {
      smooth.x += (target.x - smooth.x) * FOLLOW;
      smooth.y += (target.y - smooth.y) * FOLLOW;
      smooth.on += (target.on - smooth.on) * INTENSITY_FOLLOW;
      render();
      const settled =
        Math.abs(target.x - smooth.x) < SETTLE_EPSILON &&
        Math.abs(target.y - smooth.y) < SETTLE_EPSILON &&
        Math.abs(target.on - smooth.on) < 0.005;
      if (settled && target.on === 0) {
        smooth.on = 0;
        render();
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    function startLoop() {
      if (rafId == null) rafId = requestAnimationFrame(tick);
    }

    function handleMove(e) {
      if (target.on === 0) {
        smooth.x = e.clientX;
        smooth.y = e.clientY;
      }
      target.x = e.clientX;
      target.y = e.clientY;
      target.on = 1;
      startLoop();
    }
    function handleLeave() {
      target.on = 0;
      startLoop();
    }

    host.addEventListener("mousemove", handleMove);
    host.addEventListener("mouseleave", handleLeave);
    host.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) handleMove({ clientX: t.clientX, clientY: t.clientY }); }, { passive: true });
    host.addEventListener("touchend", handleLeave);

    return {
      dispose() {
        if (ro) ro.disconnect();
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
        if (rafId) cancelAnimationFrame(rafId);
      },
    };
  }

  global.initInkBleed = initInkBleed;
})(window);
