import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProductGallery from "@/components/ProductGallery";
import Reveal from "@/components/motion/Reveal";
import {
  catalogProducts,
  getCatalogProduct,
  productDescription,
  productName,
  productQuoteFields,
} from "@/lib/catalog";
import { productWaLink } from "@/lib/site";

type Props = { params: { slug: string } };
export const dynamicParams = false;
export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getCatalogProduct(params.slug);
  if (!product) return {};
  return {
    title: productName(product),
    description: productDescription(product).slice(0, 155) || `Ask Zetta Tech about ${productName(product)} in Karachi.`,
    alternates: { canonical: `/catalog/${product.slug}` },
  };
}

export default function CatalogProductPage({ params }: Props) {
  const product = getCatalogProduct(params.slug);
  if (!product) notFound();
  const quote = productQuoteFields(product);
  const name = productName(product);
  const description = productDescription(product);

  return (
    <>
      <PageHero title={name} intro={`${quote.brand} ${quote.category.toLowerCase()} available from Zetta Tech in Karachi.`} crumbs={[{ href: "/", label: "Home" }, { href: "/catalog", label: "Catalog" }, { href: `/catalog/${product.slug}`, label: name }]} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Reveal>
          <ProductGallery
            images={product.images}
            name={name}
            enquiry={{ slug: product.slug, name, brand: quote.brand, category: quote.category, href: `/catalog/${product.slug}` }}
          />
        </Reveal>
        <Reveal delay={0.05}>
          <p className="label text-cyan-ink">
            <span>{quote.brand}</span>
            <span aria-hidden="true"> · </span>
            <span>{quote.category}</span>
          </p>
          <h2 className="h-display mt-3 text-3xl text-navy-900 sm:text-4xl">{name}</h2>
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-900/75">{description}</p>
          ) : (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-900/75">
              Message us for the full specification, current price and installation options for this model.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={productWaLink(quote)} className="btn-whatsapp px-6 py-3.5">Quote on WhatsApp</a>
            <Link href="/catalog" className="btn-outline px-6 py-3.5">Back to catalog</Link>
          </div>
          <p className="label mt-8 text-navy-900/70">Source: supplier catalog, reviewed for publication</p>
        </Reveal>
      </section>
    </>
  );
}
