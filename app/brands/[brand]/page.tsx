import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CatalogCard from "@/components/CatalogCard";
import { CtaBand } from "@/components/Extras";
import { brands, categories } from "@/lib/data";
import { catalogBrands, getCatalogBrand, productsForBrand } from "@/lib/catalog";

type Props = { params: { brand: string } };
export const dynamicParams = false;
export function generateStaticParams() {
  return [...new Set([...brands.map((b) => b.slug), ...catalogBrands.map((b) => b.slug)])].map((brand) => ({ brand }));
}

export function generateMetadata({ params }: Props): Metadata {
  const sourceBrand = getCatalogBrand(params.brand);
  if (sourceBrand) {
    return {
      title: `${sourceBrand.name} products`,
      description: `Browse ${sourceBrand.productCount} ${sourceBrand.name} products supplied by Zetta Tech.`,
      alternates: { canonical: `/brands/${sourceBrand.slug}` },
    };
  }
  const b = brands.find((x) => x.slug === params.brand);
  if (!b) return {};
  return {
    title: `${b.name} products in Karachi`,
    description: `Zetta Tech supplies ${b.name} products in Karachi. ${b.blurb} Supply, installation and configuration available.`,
    alternates: { canonical: `/brands/${b.slug}` },
  };
}

export default function BrandPage({ params }: Props) {
  const sourceBrand = getCatalogBrand(params.brand);
  if (sourceBrand) {
    const products = productsForBrand(sourceBrand);
    return (
      <>
        <PageHero title={`${sourceBrand.name} products`} intro={`Browse ${products.length.toLocaleString()} ${sourceBrand.name} products with descriptions and images.`} crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }, { href: `/brands/${sourceBrand.slug}`, label: sourceBrand.name }]} />
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="label text-cyan-deep">Authorized catalog</p><h2 className="h-display mt-2 text-4xl text-navy-900">{sourceBrand.name}</h2></div><p className="label text-navy-900/55">{products.length.toLocaleString()} items</p></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => <CatalogCard key={product.id} product={product} />)}
          </div>
        </section>
      </>
    );
  }
  const b = brands.find((x) => x.slug === params.brand);
  if (!b) notFound();
  const cats = categories.filter((c) => c.brands.includes(b.slug));
  return (
    <>
      <PageHero title={`${b.name} official dealer`} intro={`${b.blurb} Zetta Tech supplies, installs and configures ${b.name} products for businesses, offices and factories.`} crumbs={[{ href: "/", label: "Home" }, { href: "/brands/zkteco", label: "Brands" }, { href: `/brands/${b.slug}`, label: b.name }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <p className="label inline-block bg-cyan-brand px-3 py-1.5 text-navy-950">Authorized dealer</p>
         <h2 className="mt-8 font-display text-2xl font-semibold text-navy-900">{b.name} products we supply</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <li key={c.slug}><Link href={`/products/${c.slug}`} className="block border border-navy-900/15 bg-white p-5 font-semibold text-navy-900 hover:border-cyan-deep">{c.name}</Link></li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
