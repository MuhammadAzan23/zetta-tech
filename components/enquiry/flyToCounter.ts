/**
 * Fly a small product thumbnail (or a plain icon chip) from the trigger to the
 * enquiry anchor, then let the counter bump once.
 *
 * Uses the Web Animations API: transform/opacity only, no animation library, and the
 * original button never moves. Honours reduced motion by doing nothing.
 */
function visible(selector: string) {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return nodes.find((node) => node.offsetParent !== null) ?? nodes[0] ?? null;
}

export function flyToCounter(source: HTMLElement, image?: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const anchor = visible("[data-enquiry-anchor]");
  if (!anchor) return;

  const from = source.getBoundingClientRect();
  const to = anchor.getBoundingClientRect();
  const chip = document.createElement("span");
  chip.setAttribute("aria-hidden", "true");
  chip.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "z-index:80",
    "pointer-events:none",
    "width:44px",
    "height:44px",
    "border-radius:4px",
    "overflow:hidden",
    "display:grid",
    "place-items:center",
    "background:#fff",
    "border:1px solid rgba(5,34,76,.2)",
    "box-shadow:0 6px 18px rgba(5,34,76,.22)",
  ].join(";");

  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = "";
    img.style.cssText = "max-width:100%;max-height:100%;object-fit:contain";
    chip.appendChild(img);
  } else {
    chip.style.background = "#05224C";
    chip.style.color = "#36CDFF";
    chip.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>';
  }

  document.body.appendChild(chip);

  const startX = from.left + from.width / 2 - 22;
  const startY = from.top + from.height / 2 - 22;
  const endX = to.left + to.width / 2 - 22;
  const endY = to.top + to.height / 2 - 22;

  chip.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(.9)`;
  chip.style.opacity = "0";

  const flight = chip.animate(
    [
      { transform: `translate3d(${startX}px, ${startY}px, 0) scale(.9)`, opacity: 0 },
      { transform: `translate3d(${startX}px, ${startY}px, 0) scale(1)`, opacity: 1, offset: 0.25 },
      { transform: `translate3d(${endX}px, ${endY}px, 0) scale(.35)`, opacity: 0.15 },
    ],
    { duration: 800, easing: "cubic-bezier(.22,.7,.3,1)", fill: "forwards" }
  );

  flight.finished
    .catch(() => {})
    .finally(() => {
      chip.remove();
      bumpCounter();
    });
}

function bumpCounter() {
  const counter = visible("[data-enquiry-count]");
  if (!counter) return;
  counter.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.28)" }, { transform: "scale(1)" }],
    { duration: 320, easing: "cubic-bezier(.22,.7,.3,1)" }
  );
}
