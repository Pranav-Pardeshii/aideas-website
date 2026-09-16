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
            <div className="eyebrow">Why Pledge Thyself</div>
            <h2>Every relic and lore thou needst to <span className="grad-text">forge thy path.</span></h2>
            <p>A fellowship, an ancient curriculum, and a noble quest to forge genuine artifacts ere thy graduation.</p>
          </div>

          <div className="zigzag-block" data-reveal>
            <div className="zigzag-copy">
              <h3>Mastery through Forging</h3>
              <p>Our gatherings and tomes of lore are but the beginning — every path ends with a mighty artifact, reviewed by wise peers and mentors, not a mere trial of words.</p>
              <a href="/about" className="zigzag-link">Read our chronicles →</a>
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
              <h3>Councils &amp; Grand Tournaments</h3>
              <p>From twilight forges to full sun-cycles of creation — our hands-on councils run throughout the age, open to every kin and realm.</p>
              <a href="/events" className="zigzag-link">View gatherings →</a>
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
              <h3>A Fellowship Ever-Growing</h3>
              <p>A vast alliance of scholars who share ancient texts, noble quests, and unyielding momentum — behold the High Council that guides it.</p>
              <a href="/members" className="zigzag-link">Meet the High Council →</a>
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
              <div className="stat-label">Sworn Brethren</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">12+</div>
              <div className="stat-label">Councils an Age</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">3</div>
              <div className="stat-label">Grand Tournaments</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">100%</div>
              <div className="stat-label">Guided by the Free Folk</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad ambient-panel">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="eyebrow">Tales of the Fellowship</div>
            <h2>Echoes from the <span className="grad-text">realm.</span></h2>
          </div>
          <div className="testimonial-grid">
            {[
              { text: '"aiDEAS is where I forged my first true relic of machine intellect. The councils are swift and hands-on."', avatar: 'linear-gradient(135deg,#38d1ff,#22b8f0)', role: '2nd Year, AI & DS' },
              { text: '"I journeyed for the tournaments and remained for the fellowship. The greatest quest of my scholarly years."', avatar: 'linear-gradient(135deg,#b06bff,#9b5cff)', role: '3rd Year, AI & DS' },
              { text: '"In no other realm wilt thou find elders so willing to impart the deep magics."', avatar: 'linear-gradient(135deg,#38d1ff,#b06bff)', role: '1st Year, AI & DS' },
            ].map((t, i) => (
              <div className="testimonial-card" data-reveal key={i}>
                <p>{t.text}</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar" style={{ background: t.avatar }} />
                  <div>
                    <div className="name">[Scholar Name]</div>
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
            <div className="eyebrow">Gaze into the Palantír</div>
            <h2>What is this <span className="grad-text">Fellowship of aiDEAS?</span></h2>
          </div>
          <div className="about-cards">
            {[
              { title: 'Who We Are', color: 'purple', text: "aiDEAS is a noble and fervent alliance at PVG's College of Engineering, Technology and Management, uniting the greatest seekers of Artificial Intelligence and Data Science." },
              { title: 'What We Do', color: 'cyan', text: 'We summon technical councils, wise emissaries, tournaments, and grand exhibitions to nurture worldly craftsmanship and united innovation.' },
              { title: 'Vision & Mission', color: 'purple', text: 'Our grand quest is to cultivate a realm where scholars do not merely read the lore, but forge the future. We foresee an age where every mind is awakened and empowered by the arcane arts of AI.' },
              { title: 'A Call for Patrons & Benefactors', color: 'cyan', text: 'To forge the future, our fellowship requires gold and provisions. We summon noble lords, patrons, and sovereign enterprises to sponsor our tournaments and fuel the grand quests of our scholars.' },
            ].map((card, i) => (
              <div className={`info-card ${card.color}`} data-reveal key={i}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
          <div className="value-strip" data-reveal>
            {['Driven by Curiosity', 'Taught by Kin', 'Artifacts Above All', 'Open to Every Realm', 'A United Fellowship'].map((v) => (
              <span className="value-chip" key={v}>{v}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
