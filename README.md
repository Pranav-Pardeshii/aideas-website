# aiDEAS Club Website

A multi-page website for aiDEAS — the AI & Data Science Association of Students
at PVG's College of Engineering, Technology and Management (PVGCOET), Pune.
Plain HTML/CSS/JS, no build step required.

## Folder structure

```
aideas-website/
├── index.html         Home — hero, Kinetic Grid background, typewriter, "What is aiDEAS?" section
├── about.html          Faculty Guidance, About aiDEAS, Our Vision, Our Mission
├── events.html          Past events — Magnetic Carousel (hover to magnify, click to open)
├── members.html          Core team — grid of member cards with bio + social links
├── resources.html         Free courses/tutorials handpicked by the club
├── achievements.html       Student project showcase + "Show Yours" submission link
├── contact.html          Contact form + club details, Stardust particle background
├── 404.html
├── robots.txt, sitemap.xml, package.json, .gitignore
└── assets/
    ├── css/
    │   ├── style.css           Entry point — just @imports the files below
    │   ├── base/reset.css       Variables, resets, shared keyframes
    │   ├── layout/layout.css     Header/nav, footer, page-banner, section spacing
    │   ├── components/components.css  Buttons, cards, member grid, carousels, forms, fold-bg overlay
    │   └── pages/home.css        Home-hero-only layout
    ├── js/components/
    │   ├── nav.js, reveal.js        Every page
    │   ├── typewriter.js, kinetic-grid.js  Home only
    │   ├── paper-fold.js             About / Events / Members (animated background)
    │   ├── stardust.js                Contact (animated background)
    │   ├── magnetic-carousel.js        Events (hover-magnify photo carousel)
    │   └── inkbleed.js                 Not currently used on any page — a cursor-follow
    │                                     text-melt effect, available if you want it somewhere
    └── img/
        ├── logo-full.jpg, logo-icon.png, favicon*.png
        ├── faculty/            Placeholder faculty photos (faculty1.jpg, faculty2.jpg)
        ├── members/             Placeholder member photos (member1.jpg – member9.jpg)
        └── events/               Placeholder event photo tiles + one cover collage per event
```

Each page only loads the JS it actually needs — check the `<script>` tags at
the bottom of a page to see what it depends on.

## Running it

**No install:** double-click `index.html`. No backend needed.

**With a dev server:** `npm install && npm run dev` (needs Node.js) — opens at
`http://localhost:5500` and reloads on save. The VS Code "Live Server"
extension does the same thing if you'd rather use that.

## Where to edit things — the parts you'll actually touch

### Member cards (`members.html`)
Near the bottom, a `membersData` array:
```js
{ name: 'Aarav Sharma', role: 'President', roleColor: 'cyan',
  bio: 'Leads the association and coordinates all activities.',
  img: 'assets/img/members/member1.jpg',
  instagram: '#', linkedin: '#', email: 'aideas@pvgcoet.ac.in' }
```
Replace `name`, `role`, `bio`, and the social links per person. Drop their
real photo into `assets/img/members/`, either reusing the existing filename
or updating `img` to point at the new one. `roleColor` just alternates the
role-label color between `cyan` and `purple` — purely cosmetic.

### Event cards (`events.html`)
An `eventsData` array near the bottom — same idea:
```js
{ src: 'assets/img/events/avinya-cover.jpg', alt: 'Avinya',
  date: '5th May 2025', title: 'Avinya', description: '...' }
```
For a real event, drop one landscape photo into `assets/img/events/`
(roughly 4:3 or wider works best) and fill in the fields. Add more objects to
the array for more events — the carousel handles any number automatically.

### Resources (`resources.html`)
A `resourcesData` array near the bottom — one object per card:
```js
{ icon: '🤖', color: 'cyan', tag: 'Free Course', title: 'Artificial Intelligence (AI)',
  description: '...', url: 'https://www.coursera.org/learn/ai-for-everyone' }
```
Add, remove, or reorder entries freely — the grid re-flows automatically.
`color` just alternates the accent between `cyan` and `purple`, purely cosmetic.

### Achievements (`achievements.html`)
An `achievementsData` array near the bottom — one object per project:
```js
{ icon: '🧠', title: 'Handwritten Digit Recognizer', by: 'Aarav Sharma & Isha Patel',
  description: '...', tags: ['Python', 'TensorFlow', 'Flask'], url: '#' }
```
Set `url` to a real link (GitHub repo, live demo, devpost, etc.) once one exists.

**Important — the "Show Yours" button currently points at a placeholder Google
Form URL** (`https://forms.gle/REPLACE-WITH-YOUR-FORM-ID`, in the `<a class="fab-btn">`
near the top of the file). Create a real Google Form (project name, student
name(s), description, tech used, a link to the project) and swap that URL for
your form's real share link before this goes live.

### Faculty Guidance (`about.html`)
Search for `faculty-grid` — two `.faculty-card` blocks with placeholder names
(`Dr. [HOD Name]`, `Prof. [Faculty Coordinator Name]`). Replace the names,
titles, and swap `assets/img/faculty/faculty1.jpg` / `faculty2.jpg` for real
photos.

### About / Vision / Mission text (`about.html`)
Plain paragraphs and a `<ul class="mission-list">` — edit directly in the
HTML, no data arrays involved.

### Home hero typewriter words (`index.html`)
The array passed to `initTypewriter(...)` at the bottom.

### Background animation tuning
- Paper Fold (About/Events/Members): options object passed to
  `initPaperFold('fold-bg', {...})` — colors, `crease`, `depth`, `sheen`,
  `speed`, each roughly 0–20.
- Stardust (Contact): options object passed to `initStardust('stardust-bg', {...})`
  — `particleColor`, `particleDensity`, `speed`, `movement`, `angle`.
- Both are intentionally dimmed via a scrim in `components.css` (`.fold-bg::after`)
  so they read as ambient texture, not a distraction — adjust that opacity if
  you want more or less of the effect showing through.

### Logo
Swap `assets/img/logo-full.jpg` and `assets/img/logo-icon.png` if you get a
sharper version later.

## Adding a new page

1. Copy `contact.html` as a starting template — header/footer and the two
   universal scripts (`nav.js`, `reveal.js`) are already wired up.
2. Rename it, update `<title>` and meta tags, mark the matching nav link
   `class="active"`.
3. Add a link to it in `<div class="navlinks">` on **every** page (and the
   footer, if wanted there too).
4. Only add the extra scripts (`kinetic-grid.js`, `paper-fold.js`,
   `magnetic-carousel.js`, `typewriter.js`, `stardust.js`, `inkbleed.js`) if
   the new page actually uses that feature.

## Dark / light theme

Every page has a ☀️/🌙 toggle button in the nav. It saves the choice to
`localStorage` (key `aideas-theme`) and a tiny inline script in each page's
`<head>` applies it before first paint, so there's no flash of the wrong
theme on load.

**The animated backgrounds (Kinetic Grid on Home, Paper Fold on About/Events/
Members/Resources/Achievements, Stardust on Contact) only run in dark theme.**
Clicking the toggle reloads the page, which is what starts/skips the right
one — light theme just shows the plain `--bg` color instead. This was a
deliberate scope call: recoloring three separate canvas/WebGL effects to look
good on a white background was a lot of extra work for a mostly-cosmetic
payoff, versus just keeping them as a dark-theme signature and giving light
theme a clean, fast, distraction-free look. If you want one of them
recolored for light mode instead of disabled, that's doable — ask.

All colors are CSS variables in `assets/css/base/reset.css` — the `:root`
block is dark (the default), and `html[data-theme="light"]` overrides them.
Add or adjust variables there if you want to retune either theme.

## Notes

- Paper Fold and the Magnetic Carousel's arrow-free hover interaction need a
  mouse — on touch devices the Magnetic Carousel still works via tap-to-open,
  it just won't magnify on hover since there's no cursor.
- Paper Fold needs internet access to load Three.js from a CDN (About, Events,
  Members only). For a fully offline-capable site, download `three.min.js`
  into `assets/js/vendor/` and point that `<script src="...">` at the local
  copy instead.
- All member, event, and faculty photos are placeholders — swap them for real
  ones using the same filenames, or update the paths in the data arrays.
