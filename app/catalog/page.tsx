import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogCard from "@/components/CatalogCard";
import Reveal from "@/components/motion/Reveal";
import { catalogBrands, catalogCardData, catalogCategories, catalogGridItems, catalogProducts, productCategoryLabel } from "@/lib/catalog";
import { canonicalCategory } from "@/lib/catalog-normalise";

export const metadata = {
  title: "Product catalog",
  description: "Browse ZKTeco-first security and networking products supplied by Zetta Tech in Karachi.",
  alternates: { canonical: "/catalog" },
};

/**
 * "Browse by category" lists real product types. Feed categories include brand names
 * and a dozen spellings of "camera", so labels are folded to the same canonical set
 * the cards use and each type links to its largest matching category page.
 */
function browseCategories() {
  const counts = new Map<string, number>();
  for (const product of catalogProducts) {
    const label = productCategoryLabel(product);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const seen = new Map<string, string>();
  for (const category of catalogCategories) {
    const label = canonicalCategory(category.name);
    if (!label || seen.has(label)) continue;
    seen.set(label, category.slug);
  }

  return [...counts.entries()]
    .filter(([label]) => seen.has(label))
    .map(([label, count]) => ({ label, count, slug: seen.get(label)! }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 14);
}

export default function CatalogPage() {
  const topCategories = browseCategories();
  return (
    <>
      <PageHero title="Product catalog" intro={`ZKTeco first. ${catalogProducts.length.toLocaleString()} products we actually install — no printer cartridges, VoIP or leftover dumps.`} crumbs={[{ href: "/", label: "Home" }, { href: "/catalog", label: "Catalog" }]} />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
        <Reveal stagger className="grid gap-8 border-b border-navy-900/15 pb-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow text-cyan-ink">Browse by brand</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {catalogBrands.map((brand) => (
                <Link key={brand.slug} href={`/brands/${brand.slug}`} className="rounded border border-navy-900/20 px-3 py-2 text-sm font-medium transition-colors hover:border-cyan-deep hover:bg-ice">
                  {brand.name}{brand.slug === "zkteco" ? " · Main" : ""}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow text-cyan-ink">Browse by category</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topCategories.map((category) => (
                <Link key={category.slug} href={`/catalog/category/${category.slug}`} className="rounded border border-navy-900/20 px-3 py-2 text-sm font-medium transition-colors hover:border-cyan-deep hover:bg-ice">
                  {category.label} <span className="text-navy-900/70">({category.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="flex items-end justify-between gap-4 py-10">
          <div>
            <p className="eyebrow text-cyan-ink">All products</p>
            <h2 className="h-display mt-2 text-4xl text-navy-900">Focused catalog</h2>
          </div>
          <p className="eyebrow text-navy-900/70">{catalogProducts.length.toLocaleString()} items</p>
        </div>
        <CatalogGrid
          items={catalogGridItems(catalogProducts)}
          brands={catalogBrands.map((b) => b.name)}
          initial={catalogProducts.slice(0, 12).map((product) => <CatalogCard key={product.id} product={catalogCardData(product)} />)}
          initialCount={12}
        />
      </section>
    </>
  );
}
