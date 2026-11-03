"use client";

import { useEffect, useRef } from "react";

export default function JourneyLine() {
  const section = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = section.current;
    const line = path.current;
    if (!svg || !line) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (reduceMotion.matches) {
        line.style.strokeDashoffset = "0";
        return;
      }
      const bounds = svg.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewport - bounds.top) / (viewport + bounds.height)));
      line.style.strokeDashoffset = String(1 - progress);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reduceMotion.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reduceMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <svg ref={section} aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-16 hidden h-[calc(100%-5rem)] w-full md:block">
      <path d="M12 0 C12 16 88 16 88 33 S12 50 12 66 S88 83 88 100" pathLength="1" fill="none" stroke="#36CDFF" strokeOpacity="0.8" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeDasharray="1" strokeDashoffset="1" ref={path} />
    </svg>
  );
}
