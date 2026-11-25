"use client";

import { useEffect, useRef } from "react";
import { stats } from "@/lib/data";

// Final values are in the HTML (SEO, no-JS, screen readers); JS counts up once when
// scrolled into view. No animation library: one short rAF loop per number.
export default function Stats() {
  const root = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
    const frames = new Map<HTMLElement, number>();
    const started = new Set<HTMLElement>();
    const DURATION = 800;

    const run = (node: HTMLElement) => {
      const end = Number(node.dataset.count);
      const suffix = node.dataset.suffix ?? "";
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        // Ease out cubic, matching the site's power2/power3 feel.
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = `${Math.round(end * eased)}${suffix}`;
        if (t < 1) frames.set(node, requestAnimationFrame(tick));
        else node.textContent = `${end}${suffix}`;
      };
      node.textContent = `0${suffix}`;
      frames.set(node, requestAnimationFrame(tick));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (!entry.isIntersecting || started.has(node)) continue;
          started.add(node);
          run(node);
          observer.unobserve(node);
        }
      },
      { threshold: 0.4 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      frames.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  return (
    <dl ref={root} className="grid grid-cols-3 border-y border-white/15">
      {stats.map((s) => (
        <div key={s.label} className="border-r border-white/15 px-3 py-6 last:border-r-0 sm:px-6">
          <dd className="font-display text-5xl font-semibold leading-none text-white sm:text-6xl">
            <span data-count={s.value} data-suffix={s.suffix}>{s.value}{s.suffix}</span>
          </dd>
          <dt className="eyebrow mt-3 text-cyan-brand">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
