## Goal
Bring the current build closer to evolvedigitaltrade.netlify.app in motion, polish, and responsiveness — while keeping the same navy/gold identity and all existing content/pages.

## What changes

### 1. Motion system (framer-motion)
- Add `framer-motion` dependency.
- Create small reusable wrappers: `<Reveal>` (fade+rise on scroll into view), `<Stagger>` (children cascade), `<Parallax>` (subtle Y translate on scroll for hero images).
- Apply across Home, Services, Investment, Company, Insights, Contact:
  - Hero: headline word-by-word fade-up, subheadline fade, CTA scale-in, background image slow zoom (Ken Burns) + parallax.
  - Section headings + paragraphs: fade-up on view.
  - Feature/award/plan cards: staggered fade-up, hover lift (translateY + shadow + gold border glow).
  - Numbers ($200, stats): count-up on view.
  - Images: subtle zoom-in on scroll.

### 2. Header
- Shrink on scroll (reduced padding + stronger blur + subtle shadow).
- Nav links: animated gold underline sweep on hover (already have `story-link` pattern — apply consistently).
- CTA button: gold glow pulse on hover.
- Mobile menu: slide-down with staggered link fade, backdrop overlay, body scroll lock, close on route change.

### 3. Hero
- Layered background: image + navy gradient + subtle animated grain/gold radial glow.
- Ken Burns zoom loop on the bitcoin image.
- Gold eyebrow with animated divider lines on either side.
- Scroll-down indicator (bouncing chevron).

### 4. Crypto ticker
- Pause on hover, gradient fade masks on both edges, smoother infinite loop, gold up / red down chips with small arrow icons.

### 5. Cards & buttons
- Global card hover: translateY(-4px), shadow-elegant, border transitions to gold.
- Buttons: gold gradient variant with shine sweep on hover; navy button with subtle inner highlight.
- Add `--shadow-elegant` and `--gradient-gold` tokens to `src/styles.css`.

### 6. Section transitions
- Alternating section backgrounds already exist; add soft diagonal / wave divider SVGs between navy and light sections for the layered feel of the original.
- Consistent vertical rhythm (`py-24 md:py-32` on marquee sections).

### 7. Responsive pass
- Header: verify tap targets, mobile logo sizing, safe-area padding.
- Hero: clamp font sizes (`text-4xl sm:text-5xl md:text-7xl`), reduce min-height on mobile, ensure CTAs stack cleanly.
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` audit across pages; add `min-w-0` + `truncate` where text sits next to icons (per responsive rules).
- Investment plans / pricing: horizontal scroll snap on mobile if cards overflow.
- Footer: collapse to single column on mobile with proper spacing.
- Images: `loading="lazy"`, explicit `aspect-ratio`, `object-cover` everywhere.

### 8. Micro-polish
- Smooth scroll (`html { scroll-behavior: smooth }`).
- Focus-visible rings in gold for a11y.
- Respect `prefers-reduced-motion` — disable transforms/parallax, keep opacity fades only.
- Page transition: fade+slide on route change via framer-motion `AnimatePresence` in `__root.tsx` around `<Outlet />`.

## Technical notes
- All motion via `framer-motion` (already recommended in stack); no GSAP.
- New files: `src/components/site/motion/Reveal.tsx`, `Stagger.tsx`, `Parallax.tsx`, `CountUp.tsx`, `SectionDivider.tsx`.
- Update: `Header.tsx`, `CryptoTicker.tsx`, `PageLayout.tsx` (PageHero animations), `routes/index.tsx` + other route files, `styles.css` (tokens, shine keyframe, reduced-motion guard, scroll-behavior), `__root.tsx` (AnimatePresence wrapper).
- No backend/business-logic changes.

## Out of scope
- No new pages or content rewrites.
- No auth/database changes.
