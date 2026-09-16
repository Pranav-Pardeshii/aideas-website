export function Footer() {
  return (
    <footer>
      <div className="footer-watermark" aria-hidden="true">aiDEAS</div>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand-name">
              <span className="ai">aI</span><span className="deas">DEAS</span>
            </span>
            <p>The Council of AI &amp; Data Science Architects at PVGCOET, Pune — forged by the guild, across the atlas.</p>
          </div>
          <div className="footer-col">
            <h5>The Atlas</h5>
            <a href="/">Overview</a>
            <a href="/about">The Codex</a>
            <a href="/events">Confluences</a>
          </div>
          <div className="footer-col">
            <h5>The Guild</h5>
            <a href="/members">Members</a>
            <a href="/achievements">Hall of Triumphs</a>
            <a href="/resources">Archives</a>
          </div>
          <div className="footer-col">
            <h5>Communications</h5>
            <a href="/contact">Initiate Contact</a>
            <a href="mailto:aideas@pvgcoet.ac.in">Direct Dispatch</a>
            <a href="https://www.instagram.com/aideas_pvg/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.linkedin.com/company/aideas-pvg/" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 aiDEAS — The Sovereign Guild of AI &amp; Data Science</div>
          <div className="footer-social">
            <a href="https://www.linkedin.com/company/aideas-pvg/" target="_blank" rel="noopener" aria-label="aiDEAS on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.93 6 2.5 6S0 4.88 0 3.5 1.05 1 2.48 1s2.5 1.12 2.5 2.5zM.5 8.75h4V23h-4V8.75zM8.5 8.75h3.83v1.95h.06c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.14V23h-4v-6.62c0-1.58-.03-3.62-2.2-3.62-2.2 0-2.54 1.72-2.54 3.5V23h-4V8.75z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/aideas_pvg/" target="_blank" rel="noopener" aria-label="aiDEAS on Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="mailto:aideas@pvgcoet.ac.in" aria-label="Email aiDEAS">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
