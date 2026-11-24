import Link from "next/link";
import NotFoundSearch from "@/components/NotFoundSearch";
import Reveal from "@/components/motion/Reveal";
import RuleDraw from "@/components/motion/RuleDraw";
import { categories } from "@/lib/data";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="border-b border-navy-900/15">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:py-28">
        <Reveal stagger className="max-w-3xl">
          <p className="label text-cyan-ink">404 · Not found</p>
          <h1 className="h-display mt-4 text-[clamp(2.4rem,6vw,4.5rem)] text-navy-900">That page is not on the plan.</h1>
          <p className="mt-5 max-w-xl text-lg text-navy-900/75">The link may be old, or the page may have moved. Search a system below, or start from the catalog.</p>
        </Reveal>
        <div className="mt-10">
          <NotFoundSearch />
        </div>
        <div className="mt-12 max-w-2xl">
          <p className="label text-cyan-ink">Popular categories</p>
          <RuleDraw className="mt-3" />
          <Reveal as="ul" stagger>
            {categories.map((category) => (
              <li key={category.slug} className="border-b border-navy-900/15">
                <Link href={`/products/${category.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                  <span className="link-underline font-display text-xl font-semibold text-navy-900">{category.name}</span>
                  <span className="label shrink-0 text-navy-900/70">View</span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary px-6 py-3.5">Back to home</Link>
          <Link href="/catalog" className="btn-outline px-6 py-3.5">Browse the catalog</Link>
        </div>
      </div>
    </section>
  );
}
