import { useEffect, useRef, useState } from 'react'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [showR2D2, setShowR2D2] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowR2D2(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleScrollDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const next = document.querySelector('#home')?.nextElementSibling as HTMLElement
    next?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = document.querySelector('.robot-container canvas') as HTMLCanvasElement
    if (canvas && !canvas.contains(e.target as Node)) {
      const ptrDown = new PointerEvent('pointerdown', {
        clientX: e.clientX,
        clientY: e.clientY,
        pointerId: e.pointerId,
        bubbles: true,
        cancelable: true,
        view: window,
      })
      const mouseDown = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        cancelable: true,
        view: window,
      })
      canvas.dispatchEvent(ptrDown)
      canvas.dispatchEvent(mouseDown)

      setTimeout(() => {
        const ptrUp = new PointerEvent('pointerup', {
          clientX: e.clientX,
          clientY: e.clientY,
          pointerId: e.pointerId,
          bubbles: true,
          cancelable: true,
          view: window,
        })
        const mouseUp = new MouseEvent('mouseup', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
          cancelable: true,
          view: window,
        })
        canvas.dispatchEvent(ptrUp)
        canvas.dispatchEvent(mouseUp)
      }, 50)
    }
  }

  return (
    <section id="home" ref={sectionRef} onPointerDown={handlePointerDown}>
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 data-reveal="zoom" className="hero-title" style={{ transitionDelay: '.15s' }}>
            <span className="wordmark hero-brand">
              aiDEAS
            </span>
          </h1>

          <p className="empower-line" data-reveal style={{ transitionDelay: '.25s' }}>
            The Guild of Architects, forging the intelligence of machines.
          </p>

          <div className="hero-actions" data-reveal style={{ transitionDelay: '.35s' }}>
            <a href="#about" className="btn btn-primary" onClick={handleScrollDown}>
              Explore The Codex →
            </a>
            <a href="/events" className="btn btn-ghost">
              Explore Confluences
            </a>
          </div>
        </div>

        <div className="hero-visual" data-reveal style={{ transitionDelay: '.2s' }}>
          <div className="robot-container relative w-full h-full min-h-[260px] md:h-[540px]">
            <div className="hidden md:block">
              <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" size={300} />
            </div>

            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translate(-50%, 0)',
              zIndex: 15,
              opacity: showR2D2 ? 0.25 : 0,
              transition: 'opacity 1s ease-in-out',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.1em',
              pointerEvents: 'none',
              textAlign: 'center',
            }}
            >
              R2D2
            </div>

            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full relative z-10"
            />
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-indicator" aria-label="Scroll down" onClick={handleScrollDown}>
        <div className="mouse-shell">
          <div className="mouse-wheel" />
        </div>
      </a>
    </section>
  )
}
