import Link from "next/link";
import PageHero from "@/components/PageHero";
import CatalogCard from "@/components/CatalogCard";
import { catalogBrands, catalogCategories, catalogProducts } from "@/lib/catalog";

export const metadata = {
  title: "Product catalog",
  description: "Browse the complete Microtech product catalog supplied by Zetta Tech.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogPage() {
  const topCategories = catalogCategories.filter((category) => category.parent === 0 && category.count > 0);
  return (
    <>
      <PageHero title="Product catalog" intro={`Browse ${catalogProducts.length.toLocaleString()} products with descriptions and product images.`} crumbs={[{ href: "/", label: "Home" }, { href: "/catalog", label: "Catalog" }]} />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
        <div className="grid gap-8 border-b border-navy-900/15 pb-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="label text-cyan-deep">Browse by brand</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {catalogBrands.map((brand) => <Link key={brand.slug} href={`/brands/${brand.slug}`} className="rounded border border-navy-900/20 px-3 py-2 text-sm font-medium hover:border-cyan-deep">{brand.name}</Link>)}
            </div>
          </div>
          <div>
            <p className="label text-cyan-deep">Browse by category</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topCategories.map((category) => <Link key={category.slug} href={`/catalog/category/${category.slug}`} className="rounded border border-navy-900/20 px-3 py-2 text-sm font-medium hover:border-cyan-deep">{category.name} <span className="text-navy-900/50">({category.count})</span></Link>)}
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 py-10">
          <div><p className="label text-cyan-deep">All products</p><h2 className="h-display mt-2 text-4xl text-navy-900">Complete catalog</h2></div>
          <p className="label text-navy-900/55">{catalogProducts.length.toLocaleString()} items</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalogProducts.map((product) => <CatalogCard key={product.id} product={product} />)}
        </div>
      </section>
    </>
  );
}
