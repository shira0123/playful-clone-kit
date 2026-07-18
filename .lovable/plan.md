
## Goal
Recreate the Evolve Digital Trade website (evolvedigitaltrade.netlify.app) — a crypto/AI trading company marketing site — as a multi-page TanStack Start app matching the original's branding, structure, copy, and design feel.

## Pages / Routes
Mirroring the original nav (Home, Services, Investment, Our Company, Insights, Contact Us, Create Account, Account Login):

- `/` — Home: hero carousel, Dodge Coin Project section, live crypto ticker, "Trusted by millions" awards, copy-trading app section, features grid, investment CTA, advantage section, footer.
- `/services` — Services offered (AI trading, portfolio management, copy trading, etc.).
- `/investment` — Investment plans/tiers ($200 min, other tiers), FAQs.
- `/company` — About Us: mission, vision, team, regulation.
- `/insights` — Blog/news style page with market insights cards.
- `/contact` — Contact form + company details.
- External links preserved for "Create Account" (`app.e-directpro.com/register`) and "Account Login".

## Design
- Palette: deep navy/dark blue (`#0a1a2f`-ish) with gold accents (matching the gold Bitcoin hero) and white body.
- Typography: serif display (Playfair-style) for headings + clean sans (Inter/DM Sans) for body — mirrors original's "Evolve digital trade" serif wordmark.
- Layout: full-width hero with background image + centered headline + rounded CTA button, alternating light/dark content sections, feature icon grid, awards row.
- Motion: subtle fade-in on scroll, hero image parallax/zoom, ticker marquee.
- Reusable shared Header (sticky) + Footer across all routes.

## Assets
- Regenerate logo (blue "Evolve" wordmark with small chart icon).
- Generate hero images (gold Bitcoin closeup, Dodge Coin glow, phone mockup for copy-trading, awards/media placeholder SVGs).
- Use lucide-react icons for feature tiles.
- Live crypto prices via CoinGecko public API (no key) for the ticker strip.

## Technical
- TanStack Start file-based routes under `src/routes/` (`index.tsx`, `services.tsx`, `investment.tsx`, `company.tsx`, `insights.tsx`, `contact.tsx`).
- Shared `Header`/`Footer` components in `src/components/site/`.
- Per-route `head()` metadata (title, description, og tags).
- Design tokens (navy/gold) added to `src/styles.css` via oklch.
- Framer Motion for scroll/hero animations.
- Contact form is presentational (no backend) unless you want Lovable Cloud wired for submissions.

## Out of scope (confirm before build)
- Actual user auth / trading dashboard — "Create Account" and "Account Login" will link out to the original `app.e-directpro.com` URLs as on the source site.
- No payments/backend by default.

Reply "go" to build, or tell me anything to adjust (extra pages, keep external auth links vs. build our own login, add Lovable Cloud for the contact form, etc.).
