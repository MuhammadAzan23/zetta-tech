import Link from "next/link";
import { brands, categories } from "@/lib/data";

export default function ProductIndex() {
  const name = (slug: string) => brands.find((b) => b.slug === slug)?.name;
  return (
    <section id="products" className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <p className="label text-cyan-deep">What we do</p>
          <h2 className="h-display mt-3 text-4xl text-navy-900 sm:text-5xl">Six systems, one supplier</h2>
          <p className="mt-4 max-w-xs text-navy-900/75">Pick a system to see what we supply and which brands we use.</p>
        </div>
        <ol className="border-t border-navy-900/25">
          {categories.map((c, i) => (
            <li key={c.slug} className="border-b border-navy-900/15">
              <Link href={`/products/${c.slug}`} className="group grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline">
                <span className="label text-navy-900/50">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="font-display text-2xl font-semibold text-navy-900 underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-cyan-brand sm:text-3xl">{c.name}</span>
                  <span className="mt-1 block max-w-xl text-navy-900/70">{c.short}</span>
                </span>
                <span className="label mt-2 text-navy-900/55 sm:mt-0 sm:text-right">{c.brands.length ? c.brands.map(name).join(" · ") : "Racks and cabling"}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
