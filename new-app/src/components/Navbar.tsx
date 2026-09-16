import { useEffect, useState } from 'react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return (localStorage.getItem('aideas-theme') as 'dark' | 'light') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('aideas-theme', theme) } catch { /* ignore */ }
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav>
        <a href="/" className="brand">
          <img src="/assets/img/logo-icon.png" alt="aiDEAS logo" />
          <span className="brand-name">
            <span className="ai">aI</span><span className="deas">DEAS</span>
          </span>
        </a>
        <div className={`navlinks${open ? ' open' : ''}`} id="navlinks">
          <a href="/" onClick={() => setOpen(false)}>The Realm</a>
          <a href="/about" onClick={() => setOpen(false)}>Lore</a>
          <a href="/events" onClick={() => setOpen(false)}>Gatherings</a>
          <a href="/members" onClick={() => setOpen(false)}>The Fellowship</a>
        </div>
        <div className="nav-cta">
          <button
            className="theme-toggle"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a href="/achievements" className="btn btn-ghost desktop-only">Relics of Glory</a>
          <button className="burger" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>
    </header>
  )
}
