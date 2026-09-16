import { useEffect, useRef } from 'react'
import { Hero } from '@/components/Hero'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const targets = container.querySelectorAll<HTMLElement>('[data-reveal]')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        })
      },
      { threshold: 0.12 }
    )
    targets.forEach((t) => obs.observe(t))
    return () => obs.disconnect()
  }, [])
  return ref
}

function useVideoAutoPause() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const videos = Array.from(container.querySelectorAll<HTMLVideoElement>('video'))
    if (videos.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { rootMargin: '80px', threshold: 0.15 }
    )

    videos.forEach((v) => {
      v.preload = 'metadata'
      obs.observe(v)
    })

    const onVisibility = () => {
      if (document.hidden) {
        videos.forEach((v) => v.pause())
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      obs.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  return ref
}

export function HomePage() {
  const pageRef = useReveal()
  const videoHostRef = useVideoAutoPause()

  return (
    <div ref={pageRef}>
      <Navbar />

      <Hero />

      {/* ── Feature zigzag ── */}
      <section className="zigzag-section section-pad ambient-panel" ref={videoHostRef}>
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="eyebrow">The Guild Foundation</div>
            <h2>Every tool and insight you need to <span className="grad-text">engineer your path.</span></h2>
            <p>A sovereign guild, an advanced curriculum, and an uncompromising mission to ship real-world intelligence before graduation.</p>
          </div>

          <div className="zigzag-block" data-reveal>
            <div className="zigzag-copy">
              <h3>Mastery through Architecture</h3>
              <p>Our confluences and codices are only the beginning — every track culminates in production-grade systems, vetted by mentors, alumni, and industry architects.</p>
              <a href="/about" className="zigzag-link">Explore The Codex →</a>
            </div>
            <div className="zigzag-visual">
              <div className="mockup-frame">
                <div className="mockup-dots"><span /><span /><span /></div>
                <div className="mockup-body mockup-video-single">
                  <video className="mockup-video" muted loop playsInline preload="metadata">
                    <source src="/assets/video/Book_Loader.webm" type="video/webm" />
                  </video>
                </div>
              </div>
            </div>
          </div>

          <div className="zigzag-block reverse" data-reveal>
            <div className="zigzag-copy">
              <h3>Confluences &amp; Hackathons</h3>
              <p>From hands-on deep learning workshops to high-intensity 36-hour build sprints — our confluences run year-round, open across the atlas.</p>
              <a href="/events" className="zigzag-link">Explore Confluences →</a>
            </div>
            <div className="zigzag-visual">
              <div className="mockup-frame">
                <div className="mockup-dots"><span /><span /><span /></div>
                <div className="mockup-body mockup-events">
                  <div className="mockup-event-card cyan">
                    <video className="mockup-video" muted loop playsInline preload="metadata">
                      <source src="/assets/video/Successful_target.webm" type="video/webm" />
                    </video>
                  </div>
                  <div className="mockup-event-card purple">
                    <video className="mockup-video" muted loop playsInline preload="metadata">
                      <source src="/assets/video/Employee_content.webm" type="video/webm" />
                    </video>
                  </div>
                  <div className="mockup-event-card cyan">
                    <video className="mockup-video" muted loop playsInline preload="metadata">
                      <source src="/assets/video/Business_plan.webm" type="video/webm" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="zigzag-block" data-reveal>
            <div className="zigzag-copy">
              <h3>A Guild Ever-Expanding</h3>
              <p>A powerhouse community of engineers and researchers sharing open repositories, technical breakthroughs, and relentless momentum.</p>
              <a href="/members" className="zigzag-link">Meet The Guild Leads →</a>
            </div>
            <div className="zigzag-visual">
              <div className="mockup-frame">
                <div className="mockup-dots"><span /><span /><span /></div>
                <div className="mockup-body mockup-avatars">
                  <span className="mockup-avatar" style={{ background: 'linear-gradient(135deg,#38d1ff,#22b8f0)' }} />
                  <span className="mockup-avatar" style={{ background: 'linear-gradient(135deg,#b06bff,#9b5cff)' }} />
                  <span className="mockup-avatar" style={{ background: 'linear-gradient(135deg,#38d1ff,#b06bff)' }} />
                  <span className="mockup-avatar" style={{ background: 'linear-gradient(135deg,#9b5cff,#38d1ff)' }} />
                  <span className="mockup-avatar more">+6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="section-pad ambient-panel soft stats-section">
        <div className="wrap">
          <div className="stats-row" data-reveal>
            <div className="stat-block">
              <div className="stat-num">500+</div>
              <div className="stat-label">Guild Members</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">20+</div>
              <div className="stat-label">Annual Confluences</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">3</div>
              <div className="stat-label">Flagship Hackathons</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">100%</div>
              <div className="stat-label">Student-Led &amp; Built</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad ambient-panel">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="eyebrow">Voices of The Guild</div>
            <h2>Echoes across the <span className="grad-text">atlas.</span></h2>
          </div>
          <div className="testimonial-grid">
            {[
              { text: '"aiDEAS is where I built my first deep learning pipeline and deployed real intelligence. The confluences are fast-paced and hands-on."', avatar: 'linear-gradient(135deg,#38d1ff,#22b8f0)', role: '2nd Year, AI & DS' },
              { text: '"I joined for the hackathons and stayed for the guild. The most transformative technical community on campus."', avatar: 'linear-gradient(135deg,#b06bff,#9b5cff)', role: '3rd Year, AI & DS' },
              { text: '"Nowhere else on campus will you find seniors and mentors so eager to demystify complex architectures."', avatar: 'linear-gradient(135deg,#38d1ff,#b06bff)', role: '1st Year, AI & DS' },
            ].map((t, i) => (
              <div className="testimonial-card" data-reveal key={i}>
                <p>{t.text}</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar" style={{ background: t.avatar }} />
                  <div>
                    <div className="name">Pioneer Scholar</div>
                    <div className="role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About cards ── */}
      <section className="section-pad ambient-panel soft">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="eyebrow">Guild Codex</div>
            <h2>What is <span className="grad-text">The Guild of aiDEAS?</span></h2>
          </div>
          <div className="about-cards">
            {[
              { title: 'Who We Are', color: 'purple', text: "aiDEAS is the premier Artificial Intelligence & Data Science guild at PVG's College of Engineering and Technology, uniting ambitious builders, researchers, and innovators." },
              { title: 'What We Do', color: 'cyan', text: 'We organize technical confluences, hands-on masterclasses, research sprints, and flagship hackathons to cultivate world-class engineering craftsmanship.' },
              { title: 'Vision & Mission', color: 'purple', text: 'To build an ecosystem where students do not merely study algorithms, but engineer the future. We envision an environment where every ambitious mind is empowered by machine intelligence.' },
              { title: 'Industry & Partners', color: 'cyan', text: 'We collaborate with innovative enterprises, tech founders, and sponsors to power our hackathons, provide cutting-edge compute, and connect talent directly to the frontier.' },
            ].map((card, i) => (
              <div className={`info-card ${card.color}`} data-reveal key={i}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
          <div className="value-strip" data-reveal>
            {['Driven by Curiosity', 'Peer-to-Peer Mastery', 'Code & Artifacts First', 'Open Across the Atlas', 'A United Guild'].map((v) => (
              <span className="value-chip" key={v}>{v}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
