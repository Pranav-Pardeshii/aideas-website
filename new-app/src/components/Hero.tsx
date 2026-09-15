import { useEffect, useRef, useState } from 'react'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'
import { Card } from '@/components/ui/card'
import FlowRibbons from '@/components/ui/FlowRibbons'

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

  return (
    <section id="home" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.8, pointerEvents: 'none' }}>
        <FlowRibbons />
      </div>
      <div className="wrap hero-inner">
        {/* ── Left copy ── */}
        <div className="hero-copy">
          <h1 data-reveal="zoom" className="hero-title" style={{ transitionDelay: '.15s', fontFamily: '"Orbitron", sans-serif', lineHeight: '1.2', fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800 }}>
            <span style={{ color: '#ffffff' }}>Welcome to </span>
            <span style={{ color: '#a855f7' }}>ai</span>
            <span style={{ color: '#38bdf8' }}>DEAS</span>
          </h1>
          <p className="empower-line" data-reveal style={{ transitionDelay: '.25s' }}>
            Empowering&nbsp;
            <span className="type-target">{word}</span>
            <span className="cursor" aria-hidden="true">|</span>
          </p>
          <div className="hero-actions" data-reveal style={{ transitionDelay: '.35s' }}>
            <a href="about.html" className="btn btn-primary btn-pulse">Explore Now →</a>
            <a href="events.html" className="btn btn-ghost">See Events</a>
          </div>
        </div>

        {/* ── Right Spline 3D scene ── */}
        <div className="hero-visual" data-reveal style={{ transitionDelay: '.2s' }}>
          <Card className="w-full h-[460px] sm:h-[480px] md:h-[500px] bg-black/[0.96] relative overflow-hidden border-white/10">
            {/* Aura Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-60">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/30 rounded-full blur-[90px]" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-[90px]" />
            </div>
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
            <div className="w-full h-full relative">
              {/* Permanent text above the head */}
              <div style={{
                position: 'absolute',
                top: '8%',
                left: '50%',
                transform: 'translate(-50%, 0)',
                zIndex: 0,
                opacity: 0.4,
                fontFamily: '"Orbitron", sans-serif',
                fontSize: 'clamp(1rem, 3.5vw, 2.2rem)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.12em',
                pointerEvents: 'none',
                textAlign: 'center',
                width: '100%',
                textTransform: 'uppercase',
                padding: '0 12px'
              }}>
                MAKING MACHINES INTELLIGENT
              </div>
              
              {/* R2D2 text near legs (fades out) */}
              <div style={{
                position: 'absolute',
                bottom: '12%',
                left: '50%',
                transform: 'translate(-50%, 0)',
                zIndex: 0,
                opacity: showR2D2 ? 0.3 : 0,
                transition: 'opacity 1s ease-in-out',
                fontFamily: '"Orbitron", sans-serif',
                fontSize: '5rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.1em',
                pointerEvents: 'none',
                textAlign: 'center'
              }}>
                R2D2
              </div>
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full relative z-10"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Scroll cue */}
      <a href="#" className="scroll-cue" aria-label="Scroll down" onClick={handleScrollDown}>
        <span />
      </a>
    </section>
  )
}
