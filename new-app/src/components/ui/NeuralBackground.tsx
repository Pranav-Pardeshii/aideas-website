import { useEffect, useRef, useCallback } from 'react'

/* ── Config ────────────────────────────────────────────────────────────────── */
const NODE_COUNT = 120
const CONNECTION_DIST = 160
const MOUSE_RADIUS = 200
const MOUSE_ATTRACT = 0.02
const FIRE_SPEED = 0.04
const FIRE_DECAY = 0.015
const NODE_BASE_RADIUS = 1.5
const NODE_GLOW_RADIUS = 4

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

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const signalsRef = useRef<FiringSignal[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const dprRef = useRef(1)

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: Node[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      const vx = (Math.random() - 0.5) * 0.35
      const vy = (Math.random() - 0.5) * 0.35
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx,
        vy,
        baseVx: vx,
        baseVy: vy,
        radius: NODE_BASE_RADIUS + Math.random() * 1,
        fire: 0,
        fireCooldown: 0,
      })
    }
    nodesRef.current = nodes
    signalsRef.current = []
  }, [])

  const animate = useCallback(() => {
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

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    for (const node of nodes) {
      const dx = mouse.x - node.x
      const dy = mouse.y - node.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MOUSE_RADIUS && dist > 0) {
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
      node.fireCooldown = Math.max(0, node.fireCooldown - 1)
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > CONNECTION_DIST) continue

        const alpha = (1 - dist / CONNECTION_DIST) * 0.15
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        if (a.fire > 0.5 && b.fireCooldown <= 0 && Math.random() < 0.06) {
          b.fire = Math.min(1, b.fire + 0.4)
          b.fireCooldown = 30
          signals.push({
            fromX: a.x, fromY: a.y,
            toX: b.x, toY: b.y,
            progress: 0, alpha: 0.9,
          })
        } else if (b.fire > 0.5 && a.fireCooldown <= 0 && Math.random() < 0.06) {
          a.fire = Math.min(1, a.fire + 0.4)
          a.fireCooldown = 30
          signals.push({
            fromX: b.x, fromY: b.y,
            toX: a.x, toY: a.y,
            progress: 0, alpha: 0.9,
          })
        }
      }
    }

    for (let s = signals.length - 1; s >= 0; s--) {
      const sig = signals[s]
      sig.progress += FIRE_SPEED
      sig.alpha = Math.max(0, sig.alpha - 0.02)

      if (sig.progress >= 1 || sig.alpha <= 0) {
        signals.splice(s, 1)
        continue
      }

      const sx = sig.fromX + (sig.toX - sig.fromX) * sig.progress
      const sy = sig.fromY + (sig.toY - sig.fromY) * sig.progress

      ctx.beginPath()
      ctx.arc(sx, sy, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${sig.alpha})`
      ctx.fill()

      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8)
      grad.addColorStop(0, `rgba(255,255,255,${sig.alpha * 0.5})`)
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.arc(sx, sy, 8, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }

    for (const node of nodes) {
      const r = node.radius + node.fire * (NODE_GLOW_RADIUS - node.radius)
      const a = 0.3 + node.fire * 0.7

      if (node.fire > 0.1) {
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4)
        grad.addColorStop(0, `rgba(255,255,255,${node.fire * 0.35})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fill()
    }

    if (Math.random() < 0.02) {
      const rand = nodes[Math.floor(Math.random() * nodes.length)]
      if (rand.fireCooldown <= 0) {
        rand.fire = 1
        rand.fireCooldown = 60
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    // Disable completely on mobile devices to save battery and stop lag
    if (typeof window !== 'undefined' && window.innerWidth < 768) return

    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      initNodes(window.innerWidth, window.innerHeight)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY + window.scrollY }
      }
    }
    const onTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    resize()

    const resizeObs = new ResizeObserver(() => {
      const dpr = dprRef.current
      const newH = window.innerHeight
      canvas.height = newH * dpr
      canvas.style.height = `${newH}px`
    })
    resizeObs.observe(document.body)

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      resizeObs.disconnect()
    }
  }, [animate, initNodes])

  return (
    <canvas
      ref={canvasRef}
      id="neural-bg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#000',
      }}
    />
  )
}
