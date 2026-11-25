import Link from "next/link";
import { brands, categories } from "@/lib/data";
import Reveal from "./motion/Reveal";
import RuleDraw from "./motion/RuleDraw";
import { Arrow } from "./Icons";

export default function ProductIndex() {
  const name = (slug: string) => brands.find((brand) => brand.slug === slug)?.name;
  return (
    <section id="products" className="defer-paint mx-auto max-w-7xl px-5 py-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr]">
        <Reveal>
          <p className="eyebrow text-cyan-ink">What we install</p>
          <h2 className="h-display mt-3 text-4xl text-navy-900 sm:text-5xl">Five systems, ZKTeco at the core</h2>
          <p className="mt-4 max-w-xs text-navy-900/75">Pick a system to see what we supply and which brands we use.</p>
        </Reveal>
        <div>
          <RuleDraw />
          <Reveal as="ol" stagger>
            {categories.map((category, index) => (
              <li key={category.slug} className="border-b border-navy-900/15">
                <Link href={`/products/${category.slug}`} className="group grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline">
                  <span className="tag text-navy-900/70">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="inline-flex items-baseline gap-2">
                      <span className="font-display text-2xl font-semibold text-navy-900 underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors duration-300 group-hover:decoration-cyan-brand group-focus-visible:decoration-cyan-brand sm:text-3xl">{category.name}</span>
                      <Arrow className="h-5 w-5 -translate-x-1 opacity-0 text-cyan-ink transition-[transform,opacity] duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100" />
                    </span>
                    <span className="mt-1 block max-w-xl text-navy-900/70">{category.short}</span>
                  </span>
                  <span className="eyebrow mt-2 text-navy-900/70 sm:mt-0 sm:text-right">{category.brands.length ? category.brands.map(name).join(" · ") : "Site fit-out"}</span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
