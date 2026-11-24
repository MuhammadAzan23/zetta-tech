import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogCard from "@/components/CatalogCard";
import { CtaBand } from "@/components/Extras";
import Reveal from "@/components/motion/Reveal";
import { brands, categories } from "@/lib/data";
import { catalogBrands, catalogCardData, catalogGridItems, getCatalogBrand, productsForBrand } from "@/lib/catalog";

type Props = { params: { brand: string } };
export const dynamicParams = false;
export function generateStaticParams() {
  return [...new Set([...brands.map((brand) => brand.slug), ...catalogBrands.map((brand) => brand.slug)])].map((brand) => ({ brand }));
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
  const brand = brands.find((item) => item.slug === params.brand);
  if (!brand) return {};
  return {
    title: `${brand.name} products in Karachi`,
    description: `Zetta Tech supplies ${brand.name} products in Karachi. ${brand.blurb}`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default function BrandPage({ params }: Props) {
  const sourceBrand = getCatalogBrand(params.brand);
  if (sourceBrand) {
    const products = productsForBrand(sourceBrand);
    return (
      <>
        <PageHero title={`${sourceBrand.name} products`} intro={sourceBrand.slug === "zkteco" ? "ZKTeco is our main supplier. Quote any model on WhatsApp." : `Browse ${products.length.toLocaleString()} ${sourceBrand.name} products with descriptions and images.`} crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }, { href: `/brands/${sourceBrand.slug}`, label: sourceBrand.name }]} />
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="label text-cyan-ink">{sourceBrand.slug === "zkteco" ? "Main supplier" : "Authorized catalog"}</p>
              <h2 className="h-display mt-2 text-4xl text-navy-900">{sourceBrand.name}</h2>
            </div>
            <p className="label text-navy-900/70">{products.length.toLocaleString()} items</p>
          </div>
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
  const brand = brands.find((item) => item.slug === params.brand);
  if (!brand) notFound();
  const related = categories.filter((category) => category.brands.includes(brand.slug));
  return (
    <>
      <PageHero title={`${brand.name} official dealer`} intro={`${brand.blurb} Zetta Tech supplies, installs and configures ${brand.name} products for businesses, offices and factories.`} crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }, { href: `/brands/${brand.slug}`, label: brand.name }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <Reveal stagger>
          <p className="label inline-block bg-cyan-brand px-3 py-1.5 text-navy-950">Authorized dealer</p>
          <h2 className="mt-8 font-display text-2xl font-semibold text-navy-900">{brand.name} products we supply</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((category) => (
              <li key={category.slug}><Link href={`/products/${category.slug}`} className="group block border border-navy-900/15 bg-white p-5 font-semibold text-navy-900 transition-colors hover:border-cyan-deep"><span className="link-underline">{category.name}</span></Link></li>
            ))}
          </ul>
        </Reveal>
      </section>
      <CtaBand />
    </>
  );
}
