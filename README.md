# Zetta Tech website

Next.js 14 (App Router) + TypeScript + Tailwind + GSAP. Static, SEO-first B2B catalog.

## Run
```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Catalog import

The authorized Microtech catalog is stored locally in `lib/catalog.json` with product media in `public/catalog/images/`.

To refresh it from the source WordPress site:
```bash
npm run import:microtech
```

Catalog routes are available at `/catalog`, `/catalog/[product]`, `/catalog/category/[category]` and `/brands`.

## Before launch
- `.env.local`: site URL, WhatsApp number (digits only, with country code), phone, email
- Use official brand logos only with permission; the brand ticker uses text names
- Add `app/icon.png` / favicon and an Open Graph image from the original logo files

## Structure
- `lib/site.ts` contact and address config; `lib/data.ts` all catalog content
- `components/` Hero, BrandTicker (GSAP horizontal scroll), Stats (count-up), BentoGrid, sections
- `app/` home, `/products/[category]`, `/brands/[brand]`, `/locations/[city]`, `/about`, `/contact`, sitemap, robots

## Palette (sampled from the logo)
Navy `#05224C` (dark `#021F47`), Cyan `#36CDFF`, Ice `#EAF7FF`.
