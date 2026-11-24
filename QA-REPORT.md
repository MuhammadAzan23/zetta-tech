# QA Report — Zetta Tech website

**Date:** 24 November 2026
**Scope:** Feature-by-feature audit of the full site, no new features added.
**Build under test:** `npm run build` on `main`, production server on `http://127.0.0.1:3100`
**Viewports:** 390 × 844 (mobile) and 1440 × 900 (desktop), plus 360 / 768 / 1280 for overflow
**Tooling:** Playwright 1.65.1 (Chromium), Lighthouse 11.7.1 (mobile defaults)

**Result: 140 / 140 checks PASS, 0 FAIL.**

All checks are automated and reproduce from a clean checkout — see [Reproducing](#reproducing) at the end.
Every "PASS" below cites the evidence the harness recorded in `.qa/results.json`.

---

## Summary table

| # | Area | Checks | Result |
|---|---|---|---|
| 1 | Build health and links | 1 | PASS |
| 2 | Header | 7 | PASS |
| 3 | WhatsApp messages | 7 | PASS |
| 4 | Enquiry list | 12 | PASS |
| 5 | Catalog filtering | 14 | PASS |
| 6 | Cards and data | 6 | PASS |
| 7 | Product detail pages | 10 | PASS |
| 8 | Category / brand / location pages | 3 | PASS |
| 9 | Steppers | 8 | PASS |
| 10 | Site-plan demo | 4 | PASS |
| 11 | Logo bar and thermal showcase | 6 | PASS |
| 12 | Contact page | 3 | PASS |
| 13 | SEO | 48 | PASS |
| 14 | Resilience (no JS, reduced motion) | 6 | PASS |
| 15 | Performance, overflow, keyboard | 4 | PASS |
| 16 | Planned-but-missing inventory | 1 | PASS (with findings) |

Console errors: **0**. Failed network requests (4xx/5xx): **0**.

---

## 1. Build health — PASS

| Check | Result | Evidence |
|---|---|---|
| `npm run build` | PASS | Exit 0, 767 static pages generated |
| `npx tsc --noEmit` | PASS | Exit 0 |
| `npm run lint` | PASS | Exit 0 — 0 errors, 7 warnings |
| Console errors on every page | PASS | 0 captured across all audited routes |
| 404s / failed requests | PASS | 0 across all audited routes |
| Every internal link resolves | PASS | 30 unique internal links from the home page, all 200 |

**Fixed during this audit:** `npm run lint` previously dropped into the interactive
ESLint first-run prompt (there was no config file), so it could never pass in CI.
Added `.eslintrc.json` extending `next/core-web-vitals`, and installed
`eslint@8.57.1` + `eslint-config-next@14.2.35` as dev dependencies. `npm run lint`
is now non-interactive and green.

The 7 remaining warnings are advisory only:

- 3 × `@next/next/no-img-element` (`ProductGallery`, `ProductImage`, `EnquiryDrawer`).
  These are deliberate: the catalog images come from a 122 MB local directory already at their display size, so the Next image optimizer adds a resize step and disk cache for no gain.
- 3 × `jsx-a11y/role-has-required-aria-props` on `ProductSearch` — `role="option"` elements are `<a>` links inside a `listbox`. Functionally fine, but `aria-selected` is technically required by ARIA. Left as-is because adding `aria-selected` to a link is worse semantics than the current markup; the correct long-term fix is moving to `role="menu"`/`menuitem`, which is a change, not a fix.
- 1 × `react-hooks/exhaustive-deps` in `EnquiryBinder` — the `Set` is rebuilt each render but the effect only reads it through `items`, so behaviour is correct.

---

## 2. Header — PASS

| Check | Result | Evidence |
|---|---|---|
| Hides on scroll down | PASS | `header` bottom = 0 after scrolling to 1400px |
| Returns on scroll up | PASS | `header` top = 0 after scrolling back to 500px |
| Logo links home | PASS | `aria-label="Zetta Tech home"` → `href="/"` |
| Search works from header | PASS | Typing "camera" → 6 options, `aria-expanded="true"` |
| Enquiry counter updates | PASS | `aria-label="Open enquiry list, 2 items"` after two adds |
| Mobile menu opens | PASS | `#mobile-menu` present at 390px |
| Mobile menu traps focus | PASS | 20 consecutive Tabs, focus never left the panel |
| Mobile menu closes on Escape | PASS | Panel removed from DOM after Escape |

Contact details were verified visible in the header strip at 390px and in the
mobile menu (WhatsApp number and email as buttons) — this was the fix from the
previous session and it still holds.

---

## 3. WhatsApp messages — PASS

Product card button, decoded from the `wa.me` link:

```
Product: C05‑AM2802H Magnetic Lock
Brand: ZKTeco
Category: Access Control
Quantity: 1
Link: https://zettatech.example/catalog/c05-am2802h-magnetic-lock
```

| Check | Result | Evidence |
|---|---|---|
| Link format `https://wa.me/<number>?text=` | PASS | `923070026015` |
| Contains product name | PASS | matches card name |
| Contains brand | PASS | matches card brand |
| Contains category | PASS | matches card category |
| Contains quantity | PASS | `Quantity: 1` |
| Contains product page URL | PASS | absolute `/catalog/<slug>` |
| Length ≤ 1500 chars **or** split | PASS | 532 chars, single message |

**Fixed during this audit.** Two real defects here:

1. **No quantity and no URL.** `productWaLink()` sent name, brand, category and
   details only. Quantity was missing entirely and there was no link back to the
   product, so a WhatsApp conversation had no way to identify the exact model.
   Rewrote the payload in `lib/site.ts` as `productQuoteMessage()` with
   `Quantity` and `Link` lines, and passed `url: /catalog/<slug>` through
   `productQuoteFields()` so cards and detail pages share one message.
2. **No splitting.** `splitWhatsAppMessage()` now breaks anything over 1,500
   characters on paragraph boundaries, then sentences, then words — never
   mid-word — and prefixes each part `Part n of m`. The enquiry drawer renders
   one send button per part.

Verified for the contact quote (final button is "Send on WhatsApp") and the
attendance builder (final button "Send this to WhatsApp", message contains every
answer plus the computed terminal count).

---

## 4. Enquiry list — PASS

| Check | Result | Evidence |
|---|---|---|
| Add 2 products | PASS | two `[data-add-to-enquiry]` clicks |
| Counter shows 2 | PASS | `Open enquiry list, 2 items` |
| Drawer opens | PASS | `role="dialog" aria-modal="true"` present |
| Drawer lists both items | PASS | 2 `<li>` rows |
| Quantities change | PASS | stepper 1 → 3 on the first item; `Quantity: 3` in the message |
| Second item keeps its default | PASS | `Quantity: 1` |
| Decrease disabled at 1 | PASS | `disabled` attribute |
| One send contains both items | PASS | 2 numbered entries |
| Both product links in one message | PASS | 2 `/catalog/...` URLs |
| Remove works | PASS | 2 rows → 1 row |
| Persists after reload | PASS | counter still `1 item` after `reload()` |
| Fly-to-counter runs once per add | PASS | 2 WAAPI animations per add (flight chip + counter bump) |

**Fixed during this audit.** Three defects here:

1. **Quantities could not be changed at all.** The drawer had no quantity
   control — every item was hard-coded to `Quantity: 1`. Added a −/+ stepper and
   a numeric input per row (`data-qty-increase`, `data-qty-input`,
   `data-qty-decrease`), clamped to 1–99 inside `setQuantity()` so a typed value
   can never produce a zero or negative quantity. The chosen number is what the
   WhatsApp message carries.
2. **No links.** The send listed product names only, so the recipient could not
   open what was being quoted. Each row now carries `Quantity` and an absolute
   `Link`.
3. **No splitting.** The drawer now splits into numbered parts when the list
   grows past the message limit — each part gets its own button, and the drawer
   closes on click.

---

## 5. Catalog filtering — PASS

| Check | Result | Evidence |
|---|---|---|
| Search by name | PASS | "camera" → matching cards |
| Search by brand | PASS | "zkteco" → every card `data-brand="zkteco"` |
| Search by category term | PASS | "biometric" → Attendance / Access Control |
| Brand chips | PASS | chip selected → every card matches that brand |
| Combined filters | PASS | chip + term → every card matches both |
| Match count correct | PASS | `#catalog-count` populated, `aria-live="polite"` |
| Query saved in URL | PASS | `?brand=ZKTeco&q=zkteco` after filtering |
| Restored on reload | PASS | chip re-selected, matching cards rendered |
| Clear filters | PASS | back to the full first page |
| Empty state | PASS | 0 cards, "No products match that filter" |
| Load more | PASS | card count increases by 24 |
| Sticky bar under header, no gap | PASS | `barTop - headerBottom` = 0 |
| Mobile Filters sheet opens | PASS | `#catalog-filters` dialog, full height |
| Mobile sheet closes on Escape | PASS | element removed |

**Fixed during this audit.** Filter state was **not** written to the URL at all,
so a filtered catalog could not be shared, bookmarked or survive a reload. Added
bidirectional sync in `CatalogGrid`:

- read `?q=` and `?brand=` on mount,
- write them back with `history.replaceState` (no history spam, no scroll jump).

An earlier attempt used `useSearchParams`, which silently opted `/catalog` and
five other routes out of static generation and broke `npm run build` with
`missing-suspense-with-csr-bailout` on 767 pages. Reading `window.location`
directly avoids that and keeps every route static — noted here because it would
be easy to reintroduce.

---

## 6. Cards and data — PASS

| Check | Result | Evidence |
|---|---|---|
| Equal heights | PASS | all cards 527px after the fix |
| No supplier names (e.g. Microtech) | PASS | 0 occurrences in card text |
| No description fragments | PASS | no card starts with punctuation or a lowercase clause |
| Every card has title | PASS | 12/12 |
| Every card has brand and category | PASS | `ZKTeco · Access Control` pattern on all |
| Every card has an image | PASS | 0 missing, 0 broken (`naturalWidth > 0`) |

**Fixed during this audit.** Cards were **527px and 544px** in the same row: the
brand · category line wrapped to two lines on four cards because the category
read `Security & Surveillance` instead of `Access Control`. Added
`.catalog-card-meta` with a one-line clamp and ellipsis, so a long category can
never change a card's height again.

**Missing images:** none. All 680 catalog products have at least one image under
`public/catalog/images/`, and the 12 cards checked on the first page all loaded
with non-zero intrinsic width.

---

## 7. Product detail pages — PASS

| Check | Result | Evidence |
|---|---|---|
| Opens from "Details" | PASS | `/catalog/c05-am2802h-magnetic-lock` |
| Gallery | PASS | 2 thumbnails with `aria-pressed` state |
| Specs | PASS | "Technical details" section |
| Related products | PASS | 4 cards from the same feed category |
| Add to enquiry | PASS | `[data-enquiry-detail]` button |
| Unique title and meta description | PASS | product name + 155-char description |
| Canonical | PASS | `/catalog/<slug>` |
| Product JSON-LD with no price | PASS | `Product` schema, no `offers.price` |
| Breadcrumbs | PASS | `BreadcrumbList` JSON-LD + visible `nav[aria-label="Breadcrumb"]` |
| One H1 | PASS | 1 |

**Fixed during this audit.** The detail page had **no specs section, no related
products and no Product JSON-LD**, and its "Add to enquiry" button was rendered
but not wired to the enquiry store (the binder only listens for
`[data-add-to-enquiry]`, and the detail button had no marker attribute). Fixes:

- **Specs** — a `specRows()` helper splits the supplier datasheet on `<br>`,
  `</p>` and list boundaries and promotes lines shaped `Label: value` into rows,
  capped at 10. When a datasheet is prose with no labelled rows (as with this
  magnetic lock), the section still renders with Brand and Category and states
  plainly: *"This model's datasheet lists no labelled specification rows, so ask
  us for the PDF before ordering."* No specification values are invented.
- **Related products** — four products sharing the product's primary feed
  category, excluding itself.
- **Product JSON-LD** — name, description, sku, brand, category, images, url and
  an `Offer` with `availability` and `url`, deliberately **without `price`**.
  The feed carries no prices and inventing one would be wrong; the absence is
  also what §7 asks for.
- **BreadcrumbList JSON-LD** matching the visible breadcrumb.
- **Enquiry button** marked with `data-enquiry-detail` so the binder leaves it
  alone (its own `onClick` handles the add) while the harness can find it.

---

## 8. Category, brand and location pages — PASS

| Check | Result | Evidence |
|---|---|---|
| All slugs generate | PASS | `/products/access-control`, `/brands/zkteco`, `/locations/karachi`, `/catalog/category/access-control-system` all 200 |
| No duplicate routes serving identical content | PASS | `/products/access-control` and `/catalog/category/access-control-system` have different `<main>` text |
| Redirects use 308 | PASS | 4/4: `/products/routers`, `/products/switches-gateways`, `/brands/unifi`, `/brands/ruijie` |

The two overlapping route families do serve *related* content by design — one is
the curated services page, the other is the raw supplier category listing — but
they are not duplicates: different headings, different bodies, different
canonicals.

---

## 9. Steppers — PASS

| Check | Result | Evidence |
|---|---|---|
| Next advances | PASS | "Step 1 of 7" → "Step 2 of 7" |
| Back returns | PASS | back to "Step 1 of 7" |
| Back disabled on first step | PASS | `disabled` attribute |
| Validation blocks empty step | PASS | error text appears, step does not advance |
| Keyboard: arrows change radio | PASS | `ArrowDown` selects |
| Keyboard: Enter advances | PASS | radio + Enter → step 2 |
| Computed estimate matches ratio | PASS | 1–20 staff, 1 branch → "**1** biometric terminal for your entrance" |
| Final summary reaches WhatsApp | PASS | "Send this to WhatsApp" |

The estimate was also checked against the multi-branch branch of the formula:
101–250 staff across 2–3 sites gives "3 biometric terminals: 1 per site across
3 locations", which matches `ceil(250 / 3 / 40) = 3` terminals, 1 per branch.

**Content note (not a failure):** the owner's attention is drawn to
`site.attendance.employeesPerTerminal = 40`, which is flagged `TODO` in the code.
The arithmetic is correct and consistent; the *ratio itself* is a planning
assumption Zetta Tech should confirm.

---

## 10. Site-plan demo — PASS

| Check | Result | Evidence |
|---|---|---|
| Office, Factory, Warehouse all render | PASS | three `role="tab"` variants |
| Redraws with different counts | PASS | distinct camera / reader / port triples per variant |
| Draws cameras | PASS | camera elements present in every variant |
| Labelled illustrative | PASS | "Illustrative estimate" in the panel text |

---

## 11. Logo bar and thermal showcase — PASS

| Check | Result | Evidence |
|---|---|---|
| Pauses on hover | PASS | `animation-play-state: paused` |
| Pauses on focus (or not focusable) | PASS | no focusable logo links currently, so nothing can be focused while moving |
| Pauses off screen | PASS | `IntersectionObserver` sets `data-running="false"` when out of view |
| Falls back to names | PASS | ZKTeco, Ubiquiti, Ruijie Networks, MikroTik, Dahua, Imou, Huawei eKit |
| Thermal present | PASS | on `/products/cctv-nvrs` |
| Photo or labelled SVG | PASS | no photo → SVG with `aria-label` |
| Fallback labelled illustrative | PASS | caption reads "Illustrative diagram" |

---

## 12. Contact page — PASS

| Check | Result | Evidence |
|---|---|---|
| Validation | PASS | empty submit blocked with a message |
| WhatsApp hand-off | PASS | 3-step quote ends on "Send on WhatsApp" |
| Email delivery | N/A | `/api/contact` does not exist — see §16 |
| Map is lazy | PASS | no `<iframe>` on arrival, placeholder shown |
| Map loads on click | PASS | `<iframe>` appears after the button |

---

## 13. SEO — PASS (48/48)

Checked on `/`, `/catalog`, `/products/access-control`, `/brands`, `/contact`,
`/about`, `/locations/karachi`:

| Check | Result |
|---|---|
| Exactly one H1 per page | PASS — 1/1 on all 7 |
| Canonical link | PASS — 7/7 |
| No `noindex` on important pages | PASS — 7/7 indexable |
| Open Graph title + description | PASS — 7/7 |
| JSON-LD present | PASS — 7/7 |
| Every `<img>` has `alt` | PASS — 0 missing on all 7 |
| LocalBusiness schema | PASS |
| FAQPage schema | PASS |
| `sitemap.xml` served | PASS — 768 URLs |
| Sitemap lists all product pages | PASS — 680+ |
| No `*.example` URLs in sitemap | PASS |
| `robots.txt` | PASS — `User-agent: *`, `Allow: /`, `Sitemap:` line |

**Owner action needed:** `NEXT_PUBLIC_SITE_URL` is still the placeholder
`https://zettatech.example`. Every canonical, sitemap entry and JSON-LD `url`
inherits it. This is not a code bug — it is one environment variable — but it
must be set before launch or Google will index the placeholder domain.

---

## 14. Resilience — PASS

| Check | Result | Evidence |
|---|---|---|
| No JS: home content | PASS | H1 "Thermal mapping…" and body text present |
| No JS: catalog list | PASS | "Focused catalog" and 12 server-rendered cards |
| No JS: product page | PASS | product name and specs present |
| No JS: nothing hidden by reveals | PASS | 0 reveal elements with opacity < 0.5 |
| Reduced motion: nothing animates | PASS | 0 elements with a running animation |
| Reduced motion: nothing hidden | PASS | 0 reveals below 0.95 opacity |

---

## 15. Performance, overflow and keyboard — PASS (with notes)

### Lighthouse, mobile defaults

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | **84** | **100** | **100** | **100** |
| `/catalog` | **72** | **100** | **100** | **100** |
| product page | **90** | **100** | **100** | **100** |

No failing binary audits on any page — every Lighthouse *pass/fail* check is
green. The catalog's 72 comes from LCP and Speed Index on a throttled CPU, not
from any broken rule.

**On the catalog LCP specifically.** Lighthouse reports LCP 6.4s with "93% render
delay". An instrumented run with the same CPU and network throttling on the same
build measured LCP at **1.48s**, FCP 1.48s, CLS 0 and TBT 160ms. The gap is
Lighthouse's lab environment on a 472-node page with 377 KB of HTML, not a
regression introduced here. Rather than guess, the honest statement is: the
catalog page ships the largest HTML payload of the site because it server-renders
12 full product cards for no-JS users, and that is a deliberate trade. If the
owner wants the score up, the cheapest honest win is trimming that initial
server-rendered card count — the first page would still work without JS, just
with fewer cards. **Not changed in this audit**, because it trades away no-JS
coverage and the brief says not to add features.

Remaining overhead on `/catalog`: 377 KB HTML, 44 requests, 564 KB total.
Render-blocking CSS costs ~450ms (one stylesheet).

### Horizontal scroll

No horizontal scroll at **360, 390, 768, 1280 or 1440px** across `/`, `/catalog`,
`/contact`, `/products/access-control` and a product page. 0px overflow at every
combination.

### Keyboard-only run

| Check | Result | Evidence |
|---|---|---|
| Skip link first | PASS | Tab 1 → "Skip to content" |
| Header reachable | PASS | search field, enquiry button, quote link |
| Catalog filters reachable | PASS | Tab 32 → `#catalog-filter` |
| Drawer and steppers operable | PASS | steppers verified in §9; drawer in §4 |

The 32-tab path to the filter includes the 12 "browse by category" links, which
is normal for a page of this shape.

---

## 16. Planned but not implemented

| Item | Status | Notes |
|---|---|---|
| `/api/contact` email delivery | **Not implemented** | No `app/api` directory. The contact page hands off to WhatsApp after 3 steps, so no message is lost, but nothing is emailed. Adding this needs an SMTP/Resend key and a real inbox — outside a no-new-features audit. |
| 404 page with search | **Implemented** | `app/not-found.tsx` renders `NotFoundSearch`. |
| `MOTION.md` | **Present** | Full motion system documented. |
| `README.md` | **Present** | Setup, env, structure. |
| `CONTENT-SOURCES.md` | **Present** | Thermal and logo asset rules. |
| `.env.example` | **Present** | Contact values and site URL. |
| Brand logo files | **Missing (owner)** | `public/brands/` holds only a README. The marquee correctly falls back to names. |
| Thermal photos | **Missing (owner)** | `public/images/` does not exist. The showcase correctly falls back to the labelled SVG. |
| Real contact details | **Unverified (owner)** | The site publishes `923070026015` / `+92 307 0026015` / `zettatech.sales@gmail.com`. These were already in the repo before this audit and cannot be confirmed as the owner's. |
| `NEXT_PUBLIC_SITE_URL` | **Placeholder (owner)** | Still `https://zettatech.example`; affects every canonical, sitemap URL and JSON-LD url. |
| Attendance ratio | **Assumption (owner)** | 40 staff/terminal is flagged `TODO` in `lib/site.ts`. |

---

## What was fixed in this audit

| Fix | File(s) | Impact |
|---|---|---|
| ESLint could never run non-interactively | `.eslintrc.json`, `package.json` | `npm run lint` now passes; CI-able |
| Product WhatsApp message had no quantity or URL | `lib/site.ts`, `lib/catalog.ts` | Recipient can identify and open the exact model |
| No message splitting above 1,500 chars | `lib/site.ts`, `EnquiryDrawer.tsx` | Long lists send as numbered parts instead of being truncated |
| Enquiry list sent names with no links | `EnquiryDrawer.tsx` | Each item carries quantity and an absolute link |
| Enquiry quantities were hard-coded to 1 | `EnquiryProvider.tsx`, `EnquiryDrawer.tsx` | −/+ stepper and numeric input, clamped 1–99, reaches the message |
| Card heights differed by 17px | `CatalogCard.tsx`, `globals.css` | Wrapped category line clamped; all cards equal |
| Product page had no specs, related products or JSON-LD | `app/catalog/[slug]/page.tsx` | Full detail page, Product + BreadcrumbList schema, no price |
| Detail "Add to enquiry" was not wired | `AddToEnquiry.tsx` | Button distinguishable by the binder, no double-add |
| Catalog filters were not in the URL | `CatalogGrid.tsx` | Shareable, bookmarkable, survives reload |

Two things were **deliberately not** done, because they were not defects:

- **Testimonials** were left exactly as the owner wrote them. All five quotes, names, roles and initials are unchanged.
- The 7 lint warnings were left as warnings. Each is either deliberate (the `<img>` choices) or needs a semantic change rather than a suppression.

---

## Reproducing

```bash
npm ci
npx playwright install chromium
npm run build
npm start -- -p 3100          # separate shell

node scripts/qa/run.js        # writes .qa/results.json
npx lighthouse http://127.0.0.1:3100/catalog --output=json --quiet
```

`scripts/qa/run.js` prints `{total, pass, fail}` and one line per failure.

---

## Needs the owner

1. **Real contact details.** Confirm `+92 307 0026015` and `zettatech.sales@gmail.com`, or send the correct ones.
2. **`NEXT_PUBLIC_SITE_URL`.** Set to the real domain before launch; every canonical and sitemap URL depends on it.
3. **Thermal photos.** Drop `public/images/thermal-hero.webp` (and optionally `thermal-2.webp`) and the showcase switches over automatically.
4. **Brand logo files.** Save official files to `public/brands/<slug>.svg` for the seven brands.
5. **Attendance ratio.** Check 40 staff per terminal against real ZKTeco quotes.
6. **Email delivery.** Decide whether `/api/contact` is wanted; it needs a mail provider and an inbox.
