# Motion

The site has one motion system. It is CSS-first, ships no animation library in the
critical path, and never hides content from visitors without JavaScript.

## Principles

1. **Content first.** Text and images are visible in the HTML. Animation only ever
   *reveals* something that is already there.
2. **No JavaScript required.** Every entrance is a CSS animation. The only script
   involved is a 1-line flag plus one shared observer.
3. **Reduced motion means still.** With `prefers-reduced-motion: reduce`, all
   animation is disabled and everything renders in its final state.
4. **Transform and opacity only.** No animating `width`, `height`, `top`, `left` or
   `box-shadow` in a loop. This keeps work on the compositor and avoids layout shift.
5. **Calm timing.** 0.3–0.8s, `cubic-bezier(.22,.7,.3,1)` for entrances,
   `cubic-bezier(.16,.8,.3,1)` for drawn lines. No bounce on anything large.

## How it works

```
layout.tsx        inline script → <html class="js">
Reveal / RuleDraw marks elements with data-* attributes (server components)
RevealObserver    one IntersectionObserver adds .is-in once per element
globals.css       owns every keyframe and the reduced-motion overrides
```

### The `js` flag

`app/layout.tsx` renders one inline script before anything else:

```js
document.documentElement.classList.add("js");
```

Every "hide until animated" rule is scoped to `html.js`. Without JS the class never
appears, so no element is ever left invisible.

### Reveal

```tsx
import Reveal from "@/components/motion/Reveal";

<Reveal>              {/* fades and rises 16px on first view */}
<Reveal stagger>      {/* direct children stagger at 80ms intervals */}
<Reveal as="ol" stagger>
```

`Reveal` renders the chosen element with `data-reveal` (or `data-reveal-group` when
`stagger` is set). It is a **server component** — no client JS per instance.

`delay` and `y` props are accepted for API compatibility but ignored: the CSS reveal
uses one fixed distance and the group rules own the stagger timing.

### RuleDraw

A hairline rule that draws left → right when scrolled into view.

```tsx
import RuleDraw from "@/components/motion/RuleDraw";

<RuleDraw className="mb-5" />
```

It renders a 1px div with `data-rule` and `transform-origin: left`; a CSS transition
on `transform: scaleX()` does the drawing.

### RevealObserver

`components/motion/RevealObserver.tsx` mounts once in the root layout. On every route
change it:

- finds `[data-reveal]`, `[data-reveal-group]`, `[data-rule]` and `.rack`
- immediately marks anything already in the viewport as `.is-in` (no waiting for scroll)
- observes the rest and unobserves each element after its first reveal
- if reduced motion is set, marks everything `.is-in` and does nothing else

### Naming conventions in CSS

| Selector | Meaning |
| --- | --- |
| `html.js [data-reveal]` | starts hidden (opacity 0, translated 16px) |
| `.is-in` | reveals; CSS keyframes `reveal-rise` own the transition |
| `[data-reveal-group] > *` | children stagger via `:nth-child` delays |
| `[data-rule]` | scaleX(0) → 1 transition |

### Inline animations

Components that do not need scroll triggering use their own classes:

- `.line-mask` / `[data-hero-fade]` - hero entrance, pure CSS, runs at first paint
- `.site-plan .sp-*` - the hero site plan self-draws
- `.rack` / `.rack-row` / `.led-blink` — rack rows slide in, LEDs pulse softly
- `.process-steps` — step numbers pop, connecting rules draw
- `.page-enter` — 8px rise + fade on client-side navigation (`app/template.tsx`)
- `.drawer-panel` / `.drawer-backdrop` — enquiry drawer
- `.faq-body` — accordion via animated `grid-template-rows`
- `.mobile-menu li` — staggered menu links
- `.link-underline`, `.btn`, `.menu-icon` — hover/focus/press states
- `.attention-pulse` — the floating buttons pulse exactly once, 4s after load

## Hero and LCP

The hero is a **server component**. Its headline mask reveal and text rise are CSS
keyframes, so they start at first paint rather than after hydration. The supporting
paragraph, which is the LCP element on mobile, is deliberately not animated at all.

## Motion with JS outside the reveal system

| Effect | Implementation |
| --- | --- |
| Statistics count-up | one short `requestAnimationFrame` loop per number, `IntersectionObserver` trigger, runs once |
| Brand ticker | rAF-throttled scroll-linked `translate3d`, no pinning |
| Own-brand marquee | CSS `@keyframes` on a track of four identical copies, paused by `IntersectionObserver` when off-screen |
| Journey line | rAF-throttled `stroke-dashoffset` |
| Enquiry thumbnail flight | Web Animations API `element.animate()`, cleaned up on finish |
| Catalog FLIP reflow | `import("gsap")` + `gsap/Flip`, loaded **only** when the visitor clicks "Load more" |
| Stepper panels | CSS slide-in keyed off `data-dir`; React owns the step, never the tween |
| Site-plan redraw | the SVG is re-keyed on the variant id, so its CSS draw keyframes restart |
| Light-beam CTA | `@property --beam-angle` + conic gradient masked to a 2px ring |

GSAP is not imported anywhere else. It is not part of the initial bundle.

Two of these deserve a note:

- **Seamless marquee.** `LogoMarquee` renders four copies of the row and travels
  `-25%`, exactly one copy's width. The track is therefore always wider than the
  viewport plus one copy, so the loop never shows a gap on a wide screen. The extra
  copies are `aria-hidden` and `tabindex="-1"`, so screen readers and the Tab key see
  the brands once.
- **The beam owns no layout.** `.beam-button::before` is a masked ring drawn inside the
  button's own box. The button's fill, hover and press states are untouched, and the
  ring is `pointer-events: none`.

## Performance guardrails

Motion must never slow the first paint.

- **No animation library in the bundle.** GSAP is loaded on demand for the catalog
  FLIP reflow only.
- **Fonts.** Self-hosted in `app/fonts.css` with metric-matched fallbacks, so the swap
  causes no layout shift. The two faces above the fold (H1 and body) are preloaded in
  `app/layout.tsx`; body and mono faces are not.
- **Deferred paint.** Sections below the fold carry `.defer-paint`
  (`content-visibility: auto` + `contain-intrinsic-size`). They are still in the DOM,
  in the accessibility tree and in the HTML for search engines — the browser just skips
  their layout and paint until they approach the viewport. The footer is deliberately
  not deferred, because automated contrast checks cannot read colours inside a skipped
  subtree.
- **Offscreen animation is paused.** Testimonial marquees and rack LEDs run only while
  their section is visible. The site-plan cable dashes march four passes and stop.
  The header's `backdrop-filter` is applied only after scrolling.
- **Transform and opacity only**, so animation stays off the layout path.

## Reduced motion

`app/globals.css` ends the motion section with:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { animation: none !important; transition: none !important; }
  html.js [data-reveal], html.js [data-reveal-group] > * { opacity: 1 !important; transform: none !important; }
  html.js [data-rule] { transform: none !important; }
  html.js .line-mask > span, html.js [data-hero-fade] { animation: none !important; transform: none !important; }
  .faq-body { grid-template-rows: 1fr; opacity: 1; }
}
```

The site plan, thermal map, testimonials, the logo marquee, the stepper panels, the
plan-demo redraw and the beam CTA each have their own reduced-motion block where their
layout differs from the animated state.

JavaScript-driven effects check the same media query before doing anything:
`flyToCounter`, `Stats`, `BrandTicker`, `JourneyLine`, the catalog reflow. `LogoMarquee`
does not need to: its animation is CSS-only, so the media query in `globals.css` is
enough, and its observer only pauses it when the band is off screen.

## Adding a new animation

1. Prefer CSS. Add a keyframe or transition in `app/globals.css` next to the related
   block, and comment what it does and why.
2. If it should trigger on scroll, mark the element with `data-reveal` (or wrap in
   `Reveal`) instead of writing a new observer.
3. Animate `transform` and `opacity` only. If you must animate height (like the FAQ),
   use `grid-template-rows` or a transform-based trick — never a measured pixel height.
4. Add the "final state" to the reduced-motion block.
5. Check that the content is still visible with JavaScript disabled.
