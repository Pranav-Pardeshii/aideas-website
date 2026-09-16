import { useEffect, useRef, useState } from 'react'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'

const WORDS = ['Future Leaders', 'Builders', 'Innovators', 'Researchers', 'Creators']

function useTypewriter(words: string[]) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx % words.length]
    let timeout: ReturnType<typeof setTimeout>
    if (!deleting) {
      if (displayed.length < word.length) {
        timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 55)
      } else {
        timeout = setTimeout(() => setDeleting(true), 1400)
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30)
      } else {
        setDeleting(false)
        setWordIdx((i) => i + 1)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIdx, words])

  return displayed
}

function useReveal() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('in') }),
      { threshold: 0.12 }
    )
    targets.forEach((t) => obs.observe(t))
    return () => obs.disconnect()
  }, [])
  return ref
}

export function Hero() {
  const word = useTypewriter(WORDS)
  const sectionRef = useReveal() as React.RefObject<HTMLElement>
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
    const canvas = document.querySelector('.robot-container canvas') as HTMLCanvasElement;
    if (canvas && !canvas.contains(e.target as Node)) {
      const ptrDown = new PointerEvent('pointerdown', { clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, bubbles: true, cancelable: true, view: window });
      const mouseDown = new MouseEvent('mousedown', { clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true, view: window });
      canvas.dispatchEvent(ptrDown);
      canvas.dispatchEvent(mouseDown);
      
      setTimeout(() => {
        const ptrUp = new PointerEvent('pointerup', { clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, bubbles: true, cancelable: true, view: window });
        const mouseUp = new MouseEvent('mouseup', { clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true, view: window });
        canvas.dispatchEvent(ptrUp);
        canvas.dispatchEvent(mouseUp);
      }, 50);
    }
  }

  return (
    <section id="home" ref={sectionRef as React.RefObject<HTMLElement>} onPointerDown={handlePointerDown}>
      <div className="wrap hero-inner">
        {/* ── Left copy ── */}
        <div className="hero-copy">
          <h1 data-reveal="zoom" className="hero-title" style={{ transitionDelay: '.15s' }}>
            <span className="hero-brand">
              <span className="brand-ai">ai</span>
              <span className="brand-deas">DEAS</span>
            </span>
          </h1>

          <p className="empower-line" style={{ transitionDelay: '.25s', fontSize: '1.25rem', fontFamily: 'serif', fontStyle: 'italic', color: '#ccc' }}>
            The Fellowship of Scholars, forging the intellect of machines.
          </p>

          <div className="hero-actions" data-reveal style={{ transitionDelay: '.35s' }}>
            <a href="#about" className="btn btn-primary btn-pulse" onClick={handleScrollDown}>
              Embark on the Quest →
            </a>
            <a href="/events" className="btn btn-ghost">
              View Gatherings
            </a>
          </div>

          {/* ── Stats badge row under CTAs ── */}
          <div className="hero-stats-badge" data-reveal style={{ transitionDelay: '.45s' }}>
            <span className="stats-indicator" aria-hidden="true" />
            <span className="stats-segment">
              <strong className="stats-highlight">500+</strong> Sworn Brethren
            </span>
            <span className="stats-sep" aria-hidden="true">·</span>
            <span className="stats-segment">
              <strong className="stats-highlight">20+</strong> Grand Councils
            </span>
            <span className="stats-sep" aria-hidden="true">·</span>
            <span className="stats-segment">
              <strong className="stats-highlight">Forged in 2023</strong>
            </span>
          </div>
        </div>

        {/* ── Right visual: Robot with subtle radial glow + dark gradient edge overlay ── */}
        <div className="hero-visual" data-reveal style={{ transitionDelay: '.2s' }}>
          {/* Frameless container without hard border - removed overflow-hidden so robot isn't in a rectangle */}
          <div className="robot-container relative w-full h-[480px] sm:h-[500px] md:h-[540px]">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" size={300} />
            
            {/* R2D2 text near legs (fades out) */}
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
              textAlign: 'center'
            }}>
              R2D2
            </div>

            {/* 3D Spline Scene */}
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full relative z-10"
            />
          </div>
        </div>
      </div>

      {/* ── Scroll indicator at bottom ── */}
      <a href="#about" className="scroll-indicator" aria-label="Scroll down" onClick={handleScrollDown}>
        <div className="mouse-shell">
          <div className="mouse-wheel" />
        </div>
      </a>
    </section>
  )
}
