"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stats } from "@/lib/data";

// Final values are in the HTML (SEO, no-JS, screen readers); JS counts up when scrolled into view.
export default function Stats() {
  const root = useRef<HTMLDListElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      root.current?.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        const obj = { v: 0 };
        el.textContent = `0${suffix}`;
        gsap.to(obj, {
          v: end, duration: 1.6, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => { el.textContent = `${Math.round(obj.v)}${suffix}`; },
          onComplete: () => { el.textContent = `${end}${suffix}`; },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <dl ref={root} className="grid grid-cols-3 border-y border-white/15">
      {stats.map((s) => (
        <div key={s.label} className="border-r border-white/15 px-3 py-6 last:border-r-0 sm:px-6">
          <dd className="font-display text-5xl font-semibold leading-none text-white sm:text-6xl">
            <span data-count={s.value} data-suffix={s.suffix}>{s.value}{s.suffix}</span>
          </dd>
          <dt className="label mt-3 text-cyan-brand">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
