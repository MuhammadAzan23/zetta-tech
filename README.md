# Zetta Tech website

Next.js 14 (App Router) + TypeScript + Tailwind + GSAP. Static, SEO-first B2B catalog.

## Run
```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Before launch (placeholders to replace)
- `.env.local`: site URL, WhatsApp number (digits only, with country code), phone, email
- `public/fonts/Satoshi-Variable.woff2`: download Satoshi from fontshare.com and add this file (falls back to Inter until then)
- `lib/data.ts`: `projects` (dummy), `stats` (items with `placeholder: true`), category items, brand details, city copy
- Add real product cards, images and specs to category pages (see TODO comments)
- Use official brand logos only with permission; the ticker currently uses text names
- Unique copy for each city page (avoid duplicate content)
- Add `app/icon.png` / favicon and an Open Graph image from the original logo files

## Structure
- `lib/site.ts` contact and address config; `lib/data.ts` all catalog content
- `components/` Hero, BrandTicker (GSAP horizontal scroll), Stats (count-up), BentoGrid, sections
- `app/` home, `/products/[category]`, `/brands/[brand]`, `/locations/[city]`, `/about`, `/contact`, sitemap, robots

## Palette (sampled from the logo)
Navy `#05224C` (dark `#021F47`), Cyan `#36CDFF`, Ice `#EAF7FF`.
