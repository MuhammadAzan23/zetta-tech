"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { brands } from "@/lib/data";

// One continuous sentence that slides sideways as the page scrolls (no pinning, no scroll-jacking).
// Brand names are real links; the logo mark is the punctuation.
export default function BrandTicker() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const el = track.current!;
      const tween = gsap.fromTo(
        el,
        { x: () => Math.min(0, window.innerWidth * 0.1) },
        {
          x: () => -(el.scrollWidth - window.innerWidth * 0.85),
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        }
      );
      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });
    return () => mm.revert();
  }, []);

  const mark = <Image src="/logo-mark.png" alt="" width={36} height={36} className="shrink-0 opacity-90" />;
  const text = "font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-semibold tracking-tight";
  return (
    <section ref={section} aria-labelledby="brands-heading" className="overflow-hidden border-b border-navy-900/15 bg-white py-10 md:py-14">
      <h2 id="brands-heading" className="sr-only">Official brands we supply and install</h2>
      <div ref={track} className="flex w-max items-center gap-6 whitespace-nowrap px-6 md:gap-9 md:px-10">
        <span className={`${text} text-navy-900/45`}>Official dealer of</span>
        {mark}
        {brands.map((b) => (
          <span key={b.slug} className="flex items-center gap-6 md:gap-9">
            <Link href={`/brands/${b.slug}`} className={`${text} text-navy-900 underline decoration-transparent decoration-2 underline-offset-8 transition-colors hover:decoration-cyan-brand`}>{b.name}</Link>
            {mark}
          </span>
        ))}
        <span className={`${text} text-navy-900/45`}>genuine products, warranty and support, installed by our own team.</span>
      </div>
    </section>
  );
}
