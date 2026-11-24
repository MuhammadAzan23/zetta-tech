"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-linked connecting line for "How we work".
 * Same behaviour as before (calm, no scroll-jacking), now using rAF-throttled updates.
 */
export default function JourneyLine() {
  const section = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = section.current;
    const line = path.current;
    if (!svg || !line) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduceMotion.matches) {
        line.style.strokeDashoffset = "0";
        return;
      }
      const bounds = svg.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewport - bounds.top) / (viewport + bounds.height)));
      line.style.strokeDashoffset = String(1 - progress);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduceMotion.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduceMotion.removeEventListener("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={section} aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-16 hidden h-[calc(100%-5rem)] w-full md:block">
      <path d="M12 0 C12 16 88 16 88 33 S12 50 12 66 S88 83 88 100" pathLength="1" fill="none" stroke="#36CDFF" strokeOpacity="0.8" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeDasharray="1" strokeDashoffset="1" ref={path} />
    </svg>
  );
}
