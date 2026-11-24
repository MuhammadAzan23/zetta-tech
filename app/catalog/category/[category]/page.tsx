import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogCard from "@/components/CatalogCard";
import { catalogBrands, catalogCardData, catalogGridItems, catalogCategories, getCatalogCategory, productsForCategory } from "@/lib/catalog";

type Props = { params: { category: string } };
export const dynamicParams = false;
export function generateStaticParams() { return catalogCategories.map((category) => ({ category: category.slug })); }

export function generateMetadata({ params }: Props): Metadata {
  const category = getCatalogCategory(params.category);
  if (!category) return {};
  return { title: `${category.name} products`, description: `Browse ${category.name} products in the Zetta Tech catalog.`, alternates: { canonical: `/catalog/category/${category.slug}` } };
}

export default function CatalogCategoryPage({ params }: Props) {
  const category = getCatalogCategory(params.category);
  if (!category) notFound();
  const products = productsForCategory(category);
  return (
    <>
      <PageHero title={category.name} intro={`${products.length.toLocaleString()} products in this catalog category.`} crumbs={[{ href: "/", label: "Home" }, { href: "/catalog", label: "Catalog" }, { href: `/catalog/category/${category.slug}`, label: category.name }]} />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <CatalogGrid
          items={catalogGridItems(products)}
          brands={catalogBrands.map((b) => b.name)}
          initial={products.slice(0, 12).map((product) => <CatalogCard key={product.id} product={catalogCardData(product)} />)}
          initialCount={12}
        />
      </section>
    </>
  );
}
