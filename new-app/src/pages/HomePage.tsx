import { useEffect, useRef } from 'react'
import { Hero } from '@/components/Hero'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.12 }
    )
    targets.forEach((t) => obs.observe(t))
    return () => obs.disconnect()
  }, [])
  return ref
}

export function HomePage() {
  const pageRef = useReveal()

  return (
    <div ref={pageRef}>
      <Navbar />

      <Hero />

      {/* ── Feature zigzag ── */}
      <section className="zigzag-section section-pad ambient-panel">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="eyebrow">Why join</div>
            <h2>Everything you need to <span className="grad-text">start building.</span></h2>
            <p>A community, a curriculum, and a reason to ship something real before you graduate.</p>
          </div>

          <div className="zigzag-block" data-reveal>
            <div className="zigzag-copy">
              <h3>Learn by building</h3>
              <p>Workshops and reading groups are just the start — every track ends with a real project, reviewed by peers and mentors, not a quiz.</p>
              <a href="/about" className="zigzag-link">Read our story →</a>
            </div>
            <div className="zigzag-visual">
              <div className="mockup-frame">
                <div className="mockup-dots"><span /><span /><span /></div>
                <div className="mockup-body mockup-video-single">
                  <video className="mockup-video" autoPlay muted loop playsInline>
                    <source src="/assets/video/Book_Loader.webm" type="video/webm" />
                  </video>
                </div>
              </div>
            </div>
          </div>

          <div className="zigzag-block reverse" data-reveal>
            <div className="zigzag-copy">
              <h3>Workshops &amp; hackathons</h3>
              <p>From weekend build nights to a full 24-hour hack day — hands-on sessions run through the semester, open to every year and branch.</p>
              <a href="/events" className="zigzag-link">See events →</a>
            </div>
            <div className="zigzag-visual">
              <div className="mockup-frame">
                <div className="mockup-dots"><span /><span /><span /></div>
                <div className="mockup-body mockup-events">
                  <div className="mockup-event-card cyan">
                    <video className="mockup-video" autoPlay muted loop playsInline>
                      <source src="/assets/video/Successful_target.webm" type="video/webm" />
                    </video>
                  </div>
                  <div className="mockup-event-card purple">
                    <video className="mockup-video" autoPlay muted loop playsInline>
                      <source src="/assets/video/Employee_content.webm" type="video/webm" />
                    </video>
                  </div>
                  <div className="mockup-event-card cyan">
                    <video className="mockup-video" autoPlay muted loop playsInline>
                      <source src="/assets/video/Business_plan.webm" type="video/webm" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="zigzag-block" data-reveal>
            <div className="zigzag-copy">
              <h3>A growing community</h3>
              <p>A cross-year network of students who share resources, opportunities, and momentum — meet the core team running it.</p>
              <a href="/members" className="zigzag-link">Meet the team →</a>
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
              <div className="stat-num">50+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">12+</div>
              <div className="stat-label">Workshops a Year</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">3</div>
              <div className="stat-label">Flagship Events</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">100%</div>
              <div className="stat-label">Student Run</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad ambient-panel">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="eyebrow">What members say</div>
            <h2>Straight from the <span className="grad-text">community.</span></h2>
          </div>
          <div className="testimonial-grid">
            {[
              { text: '"aiDEAS is where I wrote my first real ML model. The workshops actually get hands-on, fast."', avatar: 'linear-gradient(135deg,#38d1ff,#22b8f0)', role: '2nd Year, AI & DS' },
              { text: '"I joined for the hackathons and stayed for the people. Best decision of my college life."', avatar: 'linear-gradient(135deg,#b06bff,#9b5cff)', role: '3rd Year, AI & DS' },
              { text: '"Nowhere else on campus will you find seniors this willing to actually teach you something."', avatar: 'linear-gradient(135deg,#38d1ff,#b06bff)', role: '1st Year, AI & DS' },
            ].map((t, i) => (
              <div className="testimonial-card" data-reveal key={i}>
                <p>{t.text}</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar" style={{ background: t.avatar }} />
                  <div>
                    <div className="name">[Member Name]</div>
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
            <div className="eyebrow">A closer look</div>
            <h2>What is <span className="grad-text">aiDEAS?</span></h2>
          </div>
          <div className="about-cards">
            {[
              { title: 'Who We Are', color: 'purple', text: "aiDEAS is a passionate student-led association at PVG's College of Engineering, Technology and Management (PVGCOET), Pune, bringing together enthusiasts of Artificial Intelligence and Data Science." },
              { title: 'What We Do', color: 'cyan', text: 'We organize technical workshops, guest lectures, hackathons, and project showcases to nurture real-world skills and collaborative innovation in AI and DS.' },
              { title: 'Vision & Mission', color: 'purple', text: 'Our mission is to create an ecosystem where students not only learn but build. We envision a future where every student is AI-aware, AI-capable, and AI-empowered.' },
              { title: 'Our Values', color: 'cyan', text: 'We believe in innovation, inclusivity, curiosity, and teamwork. At aiDEAS, every idea matters — and every mind can help shape the future.' },
            ].map((card, i) => (
              <div className={`info-card ${card.color}`} data-reveal key={i}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
          <div className="value-strip" data-reveal>
            {['Curiosity-driven', 'Peer-taught', 'Project-first', 'Open to all years', 'Cross-branch'].map((v) => (
              <span className="value-chip" key={v}>{v}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
