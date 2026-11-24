"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CatalogBrand } from "@/lib/catalog";

// One continuous sentence that slides sideways as the page scrolls (no pinning, no scroll-jacking).
// Brand names are real links; the logo mark is the punctuation.
// Scroll-linked with a single rAF-throttled transform write, so no animation library ships.
export default function BrandTicker({ brands }: { brands: Pick<CatalogBrand, "slug" | "name">[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = section.current;
    const el = track.current;
    if (!root || !el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reduce.matches) {
        el.style.transform = "";
        return;
      }
      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 0 when the band first enters, 1 when it has left the top.
      const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
      const travel = Math.max(0, el.scrollWidth - window.innerWidth * 0.85);
      el.style.transform = `translate3d(${-travel * progress}px, 0, 0)`;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduce.addEventListener("change", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduce.removeEventListener("change", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const mark = <Image src="/logo-mark.png" alt="" width={36} height={36} className="shrink-0 opacity-90" />;
  const text = "font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-semibold tracking-tight";
  return (
    <section ref={section} aria-labelledby="brands-heading" className="overflow-hidden border-b border-navy-900/15 bg-white py-10 md:py-14">
      <h2 id="brands-heading" className="sr-only">Official brands we supply and install</h2>
      <div ref={track} className="flex w-max items-center gap-6 whitespace-nowrap px-6 will-change-transform md:gap-9 md:px-10">
        <span className={`${text} text-navy-900/70`}>Official dealer of</span>
        {mark}
        {brands.map((b) => (
          <span key={b.slug} className="flex items-center gap-6 md:gap-9">
            <Link href={`/brands/${b.slug}`} className={`${text} text-navy-900 underline decoration-transparent decoration-2 underline-offset-8 transition-colors hover:decoration-cyan-brand`}>{b.name}</Link>
            {mark}
          </span>
        ))}
        <span className={`${text} text-navy-900/70`}>genuine products, warranty and support, installed by our own team.</span>
      </div>
    </section>
  );
}
