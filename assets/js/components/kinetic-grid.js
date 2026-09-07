/* Kinetic Grid cursor-reactive canvas background — home page hero only. */
function initKineticGrid(hostId, canvasId) {
  const host = document.getElementById(hostId);
  const canvas = document.getElementById(canvasId);
  if (!host || !canvas) return;
  const ctx = canvas.getContext('2d');

  const dotColor = '#3a4250';
  const lineColor = '#2f6fb0';
  const trailColor = '#8a5cff';
  const GAP = 46;
  const R = 220;
  const PULL = (4 / 10) * 4;

  let W = 1, H = 1, cols = [], dots = [];
  const mouse = { x: -9999, y: -9999, active: false };
  let trail = [];

  function build() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width));
    H = Math.max(1, Math.floor(r.height));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = []; dots = [];
    const nCols = Math.floor(W / GAP) + 2;
    const nRows = Math.floor(H / GAP) + 2;
    for (let c = 0; c < nCols; c++) {
      const col = [];
      for (let rIdx = 0; rIdx < nRows; rIdx++) {
        const hx = c * GAP, hy = rIdx * GAP;
        const d = { hx, hy, x: hx, y: hy, vx: 0, vy: 0 };
        col.push(d); dots.push(d);
      }
      cols.push(col);
    }
  }
  build();
  window.addEventListener('resize', build);

  function setMouse(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    mouse.x = clientX - r.left;
    mouse.y = clientY - r.top;
    mouse.active = true;
    const now = performance.now();
    trail.push({ x: mouse.x, y: mouse.y, t: now });
    if (trail.length > 80) trail.shift();
  }
  host.addEventListener('mousemove', e => setMouse(e.clientX, e.clientY));
  host.addEventListener('mouseleave', () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; });
  host.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) setMouse(t.clientX, t.clientY); }, { passive: true });
  host.addEventListener('touchend', () => { mouse.active = false; });

  function frame() {
    const m = mouse;
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      let ax = (d.hx - d.x) * 0.08, ay = (d.hy - d.y) * 0.08;
      if (m.active) {
        const dx = m.x - d.x, dy = m.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < R && dist > 0.001) {
          const f = (1 - dist / R) * PULL;
          ax += (dx / dist) * f; ay += (dy / dist) * f;
        }
      }
      d.vx = (d.vx + ax) * 0.82; d.vy = (d.vy + ay) * 0.82;
      d.x += d.vx; d.y += d.vy;
    }
    for (let c = 0; c < cols.length; c++) {
      for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
        const d = cols[c][rIdx];
        const right = cols[c + 1] ? cols[c + 1][rIdx] : null;
        const down = cols[c][rIdx + 1] || null;
        const prox = m.active ? Math.max(0, 1 - Math.sqrt((m.x - d.x) ** 2 + (m.y - d.y) ** 2) / R) : 0;
        if (right) {
          ctx.globalAlpha = 0.05 + prox * 0.6;
          ctx.strokeStyle = lineColor; ctx.lineWidth = 0.5 + prox * 1.5;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(right.x, right.y); ctx.stroke();
        }
        if (down) {
          ctx.globalAlpha = 0.05 + prox * 0.6;
          ctx.strokeStyle = lineColor; ctx.lineWidth = 0.5 + prox * 1.5;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(down.x, down.y); ctx.stroke();
        }
      }
    }
    for (const d of dots) {
      const prox = m.active ? Math.max(0, 1 - Math.sqrt((m.x - d.x) ** 2 + (m.y - d.y) ** 2) / R) : 0;
      ctx.globalAlpha = 0.18 + prox * 0.7;
      ctx.fillStyle = dotColor;
      ctx.beginPath(); ctx.arc(d.x, d.y, 0.8 + prox * 2.2, 0, 2 * Math.PI); ctx.fill();
    }
    const now = performance.now();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i];
      const age = now - b.t;
      if (age > 260) continue;
      ctx.globalAlpha = Math.max(0, 1 - age / 260) * 0.8;
      ctx.strokeStyle = trailColor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
