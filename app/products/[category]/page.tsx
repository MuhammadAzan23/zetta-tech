import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";
import { brands, categories } from "@/lib/data";
import { waLink } from "@/lib/site";

type Props = { params: { category: string } };
export const dynamicParams = false;
export function generateStaticParams() { return categories.map((c) => ({ category: c.slug })); }

export function generateMetadata({ params }: Props): Metadata {
  const c = categories.find((x) => x.slug === params.category);
  if (!c) return {};
  return {
    title: `${c.name} in Karachi, Hyderabad, Sukkur & Islamabad`,
    description: c.description,
    alternates: { canonical: `/products/${c.slug}` },
  };
}

export default function CategoryPage({ params }: Props) {
  const c = categories.find((x) => x.slug === params.category);
  if (!c) notFound();
  const related = brands.filter((b) => c.brands.includes(b.slug));
  return (
    <>
      <PageHero title={c.name} intro={c.description} crumbs={[{ href: "/", label: "Home" }, { href: "/#products", label: "Products" }, { href: `/products/${c.slug}`, label: c.name }]} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy-900">What we supply and install</h2>
          <ul className="mt-5 grid gap-3">
            {c.items.map((i) => (<li key={i} className="border border-navy-900/15 bg-white px-4 py-3 font-medium text-navy-900">{i}</li>))}
          </ul>
          {/* TODO: add real product cards with specs and images for each item */}
          <a href={waLink(`Hello Zetta Tech, I need a quote for ${c.name}.`)} className="mt-6 inline-block rounded bg-navy-900 px-6 py-3.5 font-semibold text-white hover:bg-navy-800">Request a quote for {c.name}</a>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy-900">Brands</h2>
          {related.length ? (
            <ul className="mt-5 grid gap-3">
              {related.map((b) => (
                <li key={b.slug}><Link href={`/brands/${b.slug}`} className="block border border-navy-900/15 bg-white p-4 hover:border-cyan-deep"><span className="font-bold text-navy-900">{b.name}</span><span className="block text-sm text-navy-900/70">{b.blurb}</span></Link></li>
              ))}
            </ul>
          ) : (<p className="mt-5 text-navy-900/70">Racks and cabling are supplied and fitted to suit your equipment.</p>)}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
