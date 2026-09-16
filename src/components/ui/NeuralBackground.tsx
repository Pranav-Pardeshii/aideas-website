import { useEffect, useRef, useCallback } from 'react'

/* ── Config ────────────────────────────────────────────────────────────────── */
const DESKTOP_NODE_COUNT = 60
const MOBILE_NODE_COUNT = 20
const CONNECTION_DIST = 135
const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST
const MOUSE_RADIUS = 160
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS
const MOUSE_ATTRACT = 0.008
const FIRE_SPEED = 0.025
const FIRE_DECAY = 0.012
const NODE_BASE_RADIUS = 1.3
const NODE_GLOW_RADIUS = 3.2

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  baseVx: number
  baseVy: number
  radius: number
  fire: number
  fireCooldown: number
}

interface FiringSignal {
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
  alpha: number
}

function createGlowSprite(size: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return null
  const half = size / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.4)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return c
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const signalsRef = useRef<FiringSignal[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const dprRef = useRef(1)
  const isVisibleRef = useRef(true)

  // Reusable offscreen sprites for ultra-fast zero-allocation glow rendering
  const glowSpriteRef = useRef<HTMLCanvasElement | null>(null)
  const signalSpriteRef = useRef<HTMLCanvasElement | null>(null)

  // Pre-allocated coordinate buckets to batch line strokes with 0 GC overhead
  const bucket0 = useRef<number[]>([])
  const bucket1 = useRef<number[]>([])
  const bucket2 = useRef<number[]>([])
  const bucket3 = useRef<number[]>([])

  const initNodes = useCallback((w: number, h: number) => {
    const isMobile = w < 768
    const count = isMobile ? MOBILE_NODE_COUNT : DESKTOP_NODE_COUNT
    const nodes: Node[] = []
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 0.14
      const vy = (Math.random() - 0.5) * 0.14
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx,
        vy,
        baseVx: vx,
        baseVy: vy,
        radius: NODE_BASE_RADIUS + Math.random() * 0.8,
        fire: 0,
        fireCooldown: 0,
      })
    }
    nodesRef.current = nodes
    signalsRef.current = []
  }, [])

  useEffect(() => {
    glowSpriteRef.current = createGlowSprite(48)
    signalSpriteRef.current = createGlowSprite(24)
  }, [])

  const animate = useCallback(() => {
    if (!isVisibleRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = dprRef.current
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    const nodes = nodesRef.current
    const signals = signalsRef.current
    const mouse = mouseRef.current
    const glowSprite = glowSpriteRef.current
    const signalSprite = signalSpriteRef.current

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Clear bucket arrays without re-allocating
    const b0 = bucket0.current
    const b1 = bucket1.current
    const b2 = bucket2.current
    const b3 = bucket3.current
    b0.length = 0
    b1.length = 0
    b2.length = 0
    b3.length = 0

    // 1. Update node physics & mouse interaction
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const dx = mouse.x - node.x
      const dy = mouse.y - node.y
      const distSq = dx * dx + dy * dy

      if (distSq < MOUSE_RADIUS_SQ && distSq > 0) {
        const dist = Math.sqrt(distSq)
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_ATTRACT
        node.vx += dx * force
        node.vy += dy * force

        if (dist < MOUSE_RADIUS * 0.5 && node.fireCooldown <= 0) {
          node.fire = Math.min(1, node.fire + 0.08)
        }
      }

      node.vx += (node.baseVx - node.vx) * 0.02
      node.vy += (node.baseVy - node.vy) * 0.02

      node.x += node.vx
      node.y += node.vy

      if (node.x < -20) node.x = w + 20
      if (node.x > w + 20) node.x = -20
      if (node.y < -20) node.y = h + 20
      if (node.y > h + 20) node.y = -20

      node.fire = Math.max(0, node.fire - FIRE_DECAY)
      if (node.fireCooldown > 0) node.fireCooldown -= 1
    }

    // 2. Fast pairwise connection & signal triggering with squared distance rejection
    const nodeCount = nodes.length
    for (let i = 0; i < nodeCount; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodeCount; j++) {
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const distSq = dx * dx + dy * dy

        if (distSq > CONNECTION_DIST_SQ) continue

        const dist = Math.sqrt(distSq)
        const distRatio = 1 - dist / CONNECTION_DIST

        // Bucket by distance for batched draw
        if (distRatio < 0.25) {
          b0.push(a.x, a.y, b.x, b.y)
        } else if (distRatio < 0.5) {
          b1.push(a.x, a.y, b.x, b.y)
        } else if (distRatio < 0.75) {
          b2.push(a.x, a.y, b.x, b.y)
        } else {
          b3.push(a.x, a.y, b.x, b.y)
        }

        // Fire signals propagation (capped and reduced probability)
        if (signals.length < 5 && a.fire > 0.5 && b.fireCooldown <= 0 && Math.random() < 0.015) {
          b.fire = Math.min(1, b.fire + 0.3)
          b.fireCooldown = 45
          signals.push({
            fromX: a.x, fromY: a.y,
            toX: b.x, toY: b.y,
            progress: 0, alpha: 0.75,
          })
        } else if (signals.length < 5 && b.fire > 0.5 && a.fireCooldown <= 0 && Math.random() < 0.015) {
          a.fire = Math.min(1, a.fire + 0.3)
          a.fireCooldown = 45
          signals.push({
            fromX: b.x, fromY: b.y,
            toX: a.x, toY: a.y,
            progress: 0, alpha: 0.75,
          })
        }
      }
    }

    // 3. Batched line strokes (subtle ambient opacity)
    ctx.lineWidth = 0.5
    const buckets = [b0, b1, b2, b3]
    const alphas = ['rgba(255,255,255,0.018)', 'rgba(255,255,255,0.038)', 'rgba(255,255,255,0.065)', 'rgba(255,255,255,0.095)']
    for (let k = 0; k < 4; k++) {
      const arr = buckets[k]
      if (arr.length === 0) continue
      ctx.strokeStyle = alphas[k]
      ctx.beginPath()
      for (let m = 0; m < arr.length; m += 4) {
        ctx.moveTo(arr[m], arr[m + 1])
        ctx.lineTo(arr[m + 2], arr[m + 3])
      }
      ctx.stroke()
    }

    // 4. Update and render firing signals using cached sprite
    for (let s = signals.length - 1; s >= 0; s--) {
      const sig = signals[s]
      sig.progress += FIRE_SPEED
      sig.alpha = Math.max(0, sig.alpha - 0.015)

      if (sig.progress >= 1 || sig.alpha <= 0) {
        signals.splice(s, 1)
        continue
      }

      const sx = sig.fromX + (sig.toX - sig.fromX) * sig.progress
      const sy = sig.fromY + (sig.toY - sig.fromY) * sig.progress

      if (signalSprite) {
        ctx.globalAlpha = sig.alpha * 0.4
        ctx.drawImage(signalSprite, sx - 8, sy - 8, 16, 16)
        ctx.globalAlpha = 1
      }

      ctx.beginPath()
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${sig.alpha * 0.85})`
      ctx.fill()
    }

    // 5. Render nodes
    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i]
      const r = node.radius + node.fire * (NODE_GLOW_RADIUS - node.radius)
      const a = 0.22 + node.fire * 0.55

      // Glow halo using cached sprite (zero allocation)
      if (node.fire > 0.1 && glowSprite) {
        const glowDim = r * 7
        ctx.globalAlpha = node.fire * 0.25
        ctx.drawImage(glowSprite, node.x - glowDim / 2, node.y - glowDim / 2, glowDim, glowDim)
        ctx.globalAlpha = 1
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fill()
    }

    // 6. Occasional spontaneous neuron trigger (calm, infrequent)
    if (Math.random() < 0.005 && nodeCount > 0) {
      const rand = nodes[Math.floor(Math.random() * nodeCount)]
      if (rand && rand.fireCooldown <= 0) {
        rand.fire = 0.8
        rand.fireCooldown = 90
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const isMobile = window.innerWidth < 768
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.35)
      dprRef.current = dpr
      const vw = window.innerWidth
      const vh = window.innerHeight
      canvas.width = Math.floor(vw * dpr)
      canvas.height = Math.floor(vh * dpr)
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
      initNodes(vw, vh)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    let isScrollingTimeout: number | null = null
    const onScroll = () => {
      // Temporarily throttle animations during active touch-scroll on mobile
      if (window.innerWidth < 768) {
        isVisibleRef.current = false
        if (isScrollingTimeout !== null) clearTimeout(isScrollingTimeout)
        isScrollingTimeout = window.setTimeout(() => {
          isVisibleRef.current = true
        }, 120)
      }
    }

    const tick = () => {
      if (isVisibleRef.current) {
        animate()
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false
        cancelAnimationFrame(rafRef.current)
      } else {
        isVisibleRef.current = true
        cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    resize()

    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (isScrollingTimeout !== null) clearTimeout(isScrollingTimeout)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [animate, initNodes])

  return (
    <canvas
      ref={canvasRef}
      id="neural-bg"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#000',
        transform: 'translateZ(0)',
      }}
    />
  )
}
