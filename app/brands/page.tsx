import Link from "next/link";
import PageHero from "@/components/PageHero";
import { brands } from "@/lib/data";
import { catalogBrands } from "@/lib/catalog";

export const metadata = { title: "Brands", description: "Browse the brands and products supplied by Zetta Tech.", alternates: { canonical: "/brands" } };

export default function BrandsPage() {
  return (
    <>
      <PageHero title="Brands we supply" intro="Browse the complete source catalog by manufacturer." crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }]} />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalogBrands.map((brand) => <Link key={brand.slug} href={`/brands/${brand.slug}`} className="border border-navy-900/15 bg-white p-6 hover:border-cyan-deep"><p className="label text-cyan-deep">{brand.productCount} products</p><h2 className="mt-2 font-display text-2xl font-semibold text-navy-900">{brand.name}</h2></Link>)}
          {brands.filter((brand) => !catalogBrands.some((sourceBrand) => sourceBrand.slug === brand.slug)).map((brand) => <Link key={brand.slug} href={`/brands/${brand.slug}`} className="border border-navy-900/15 bg-white p-6 hover:border-cyan-deep"><h2 className="font-display text-2xl font-semibold text-navy-900">{brand.name}</h2><p className="mt-2 text-navy-900/70">{brand.blurb}</p></Link>)}
        </div>
      </section>
    </>
  );
}
