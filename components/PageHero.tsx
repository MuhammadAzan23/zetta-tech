import Link from "next/link";
import Reveal from "./motion/Reveal";

export default function PageHero({
  title,
  intro,
  crumbs,
  compact = false,
}: {
  title: string;
  intro: string;
  crumbs: { href: string; label: string }[];
  /** Tighter top and bottom spacing, for pages that put their main tool straight below. */
  compact?: boolean;
}) {
  return (
    <section className="border-b border-navy-900/15">
      <div className={`mx-auto max-w-7xl px-5 sm:px-6 ${compact ? "pb-8 pt-7 sm:pb-10 sm:pt-9" : "py-14 sm:py-16"}`}>
        <nav aria-label="Breadcrumb" className="eyebrow text-navy-900/70">
          <ol className="flex flex-wrap gap-2">
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex gap-2">
                <Link href={c.href} className="hover:text-navy-900 hover:underline">{c.label}</Link>
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </li>
            ))}
          </ol>
        </nav>
        <Reveal stagger y={12} eager className={compact ? "mt-3" : "mt-5"}>
          <h1 className={`h-display max-w-4xl text-navy-900 ${compact ? "text-[clamp(1.9rem,4.2vw,3rem)]" : "text-[clamp(2.2rem,5.2vw,4rem)]"}`}>{title}</h1>
          <p className={`max-w-2xl text-navy-900/75 ${compact ? "mt-3 text-base" : "mt-5 text-lg"}`}>{intro}</p>
        </Reveal>
      </div>
    </section>
  );
}
