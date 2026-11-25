import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CatalogGrid from "@/components/CatalogGrid";
import CatalogCard from "@/components/CatalogCard";
import { CtaBand } from "@/components/Extras";
import Reveal from "@/components/motion/Reveal";
import RuleDraw from "@/components/motion/RuleDraw";
import { brands, categories } from "@/lib/data";
import {
  catalogBrands,
  catalogCardData,
  catalogGridItems,
  getCatalogBrand,
  productCategoryLabel,
  productDisplayName,
  productsForBrand,
} from "@/lib/catalog";

type Props = { params: { brand: string } };
export const dynamicParams = false;
export function generateStaticParams() {
  return [...new Set([...brands.map((brand) => brand.slug), ...catalogBrands.map((brand) => brand.slug)])].map((brand) => ({ brand }));
}

/** Order the category groups by size, so the biggest family appears first. */
const GROUP_ORDER = ["Time Attendance", "Access Control", "Security Inspection", "CCTV Cameras"];

function groupByCategory(products: ReturnType<typeof productsForBrand>) {
  const groups = new Map<string, typeof products>();
  for (const product of products) {
    const label = productCategoryLabel(product);
    const bucket = groups.get(label);
    if (bucket) bucket.push(product);
    else groups.set(label, [product]);
  }
  return [...groups.entries()].sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a[0]);
    const bi = GROUP_ORDER.indexOf(b[0]);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return b[1].length - a[1].length;
  });
}

export function generateMetadata({ params }: Props): Metadata {
  const sourceBrand = getCatalogBrand(params.brand);
  if (sourceBrand?.slug === "zkteco") {
    const count = productsForBrand(sourceBrand).length;
    return {
      // Targets "ZKTeco dealer Karachi" without claiming an official or authorised
      // dealership, which is not recorded in CONTENT-SOURCES.md.
      title: "ZKTeco dealer in Karachi: attendance and access control",
      description: `ZKTeco main supplier in Karachi. Browse ${count} ZKTeco attendance machines, access control terminals, turnstiles and locks, or send the model on WhatsApp for a price.`,
      alternates: { canonical: "/brands/zkteco" },
    };  }
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

/** ZKTeco: the models first, then the same catalog grouped by system type. */
function ZktecoPage({ brandSlug }: { brandSlug: string }) {
  const brand = getCatalogBrand(brandSlug)!;
  const products = productsForBrand(brand);
  const groups = groupByCategory(products);

  return (
    <>
      <PageHero
        title="ZKTeco dealer in Karachi"
        intro={`ZKTeco is our main supplier. We supply, install and configure ${products.length} ZKTeco models for offices, factories and shops across Karachi.`}
        crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }, { href: "/brands/zkteco", label: "ZKTeco" }]}
        compact
      />

      {/* Every model, before anything else, so someone who already knows the model
          number can find it without reading a page of categories. */}
      <section className="border-b border-navy-900/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="font-display text-2xl font-semibold text-navy-900">All ZKTeco models</h2>
            <p className="eyebrow text-navy-900/70">{products.length} {products.length === 1 ? "model" : "models"} · click a model for specs and a quote</p>
          </div>
          <RuleDraw className="mt-4" />
          <Reveal as="ul" stagger className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.slug} className="border-b border-navy-900/10">
                <Link
                  href={`/catalog/${product.slug}`}
                  className="flex items-baseline justify-between gap-4 py-2 text-navy-900 hover:text-cyan-ink"
                >
                  <span className="min-w-0 leading-snug">{productDisplayName(product)}</span>
                  <span className="hidden shrink-0 text-xs text-navy-900/60 sm:inline">{productCategoryLabel(product)}</span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
        <h2 className="h-display text-3xl text-navy-900 sm:text-4xl">ZKTeco by category</h2>
        <p className="mt-3 max-w-xl text-navy-900/75">
          The same models, grouped by what they do. Prices, stock and installation are quoted on WhatsApp.
        </p>
        {groups.map(([label, items]) => (
          <div key={label} className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="font-display text-xl font-semibold text-navy-900">{label}</h3>
              <p className="eyebrow text-navy-900/70">{items.length} {items.length === 1 ? "model" : "models"}</p>
            </div>
            <RuleDraw className="mt-3" />
            <Reveal stagger className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <CatalogCard key={product.id} product={catalogCardData(product)} />
              ))}
            </Reveal>
          </div>
        ))}
      </section>
      <CtaBand />
    </>
  );
}

export default function BrandPage({ params }: Props) {
  const sourceBrand = getCatalogBrand(params.brand);

  if (sourceBrand?.slug === "zkteco") return <ZktecoPage brandSlug={sourceBrand.slug} />;

  if (sourceBrand) {
    const products = productsForBrand(sourceBrand);
    return (
      <>
        <PageHero title={`${sourceBrand.name} products`} intro={`${sourceBrand.name} is one of the brands we also supply alongside ZKTeco. Browse ${products.length.toLocaleString()} products with descriptions and images.`} crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }, { href: `/brands/${sourceBrand.slug}`, label: sourceBrand.name }]} />
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-cyan-ink">Also supplied</p>
              <h2 className="h-display mt-2 text-4xl text-navy-900">{sourceBrand.name}</h2>
            </div>
            <p className="eyebrow text-navy-900/70">{products.length.toLocaleString()} items</p>
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
      <PageHero
        title={`${brand.name} products in Karachi`}
        intro={`${brand.blurb} Zetta Tech supplies, installs and configures ${brand.name} products for businesses, offices and factories.`}
        crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }, { href: `/brands/${brand.slug}`, label: brand.name }]}
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <Reveal stagger>
          <p className="tag inline-block bg-cyan-brand px-3 py-1.5 text-navy-950">Also supplied</p>
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
