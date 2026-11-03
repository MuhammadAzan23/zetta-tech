import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { catalogProducts, getCatalogProduct } from "@/lib/catalog";
import { waLink } from "@/lib/site";

type Props = { params: { slug: string } };
export const dynamicParams = false;
export function generateStaticParams() { return catalogProducts.map((product) => ({ slug: product.slug })); }

export function generateMetadata({ params }: Props): Metadata {
  const product = getCatalogProduct(params.slug);
  if (!product) return {};
  return { title: product.name, description: product.excerpt.replace(/<[^>]+>/g, "").slice(0, 155), alternates: { canonical: `/catalog/${product.slug}` } };
}

export default function CatalogProductPage({ params }: Props) {
  const product = getCatalogProduct(params.slug);
  if (!product) notFound();
  const firstCategory = product.categories[0];
  return (
    <>
      <PageHero title={product.name} intro={product.excerpt.replace(/<[^>]+>/g, "")} crumbs={[{ href: "/", label: "Home" }, { href: "/catalog", label: "Catalog" }, { href: `/catalog/${product.slug}`, label: product.name }]} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {product.images.map((image, index) => <div key={image} className="flex min-h-64 items-center justify-center bg-ice p-8"><img src={image} alt={`${product.name} image ${index + 1}`} className="max-h-[28rem] max-w-full object-contain" /></div>)}
          </div>
          {!product.images.length && <div className="flex min-h-64 items-center justify-center bg-ice"><span className="label text-navy-900/40">Product image unavailable</span></div>}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => <Link key={category.id} href={`/catalog/category/${category.slug}`} className="label rounded bg-cyan-brand px-3 py-1.5 text-navy-950">{category.name}</Link>)}
          </div>
          <div className="prose prose-slate mt-8 max-w-none text-navy-900/80" dangerouslySetInnerHTML={{ __html: product.description }} />
          <a href={waLink(`Hello Zetta Tech, I need a quote for ${product.name}.`)} className="mt-8 inline-block rounded bg-navy-900 px-6 py-3.5 font-semibold text-white hover:bg-navy-800">Request a quote</a>
          {firstCategory && <p className="mt-5 text-sm text-navy-900/55">Catalog category: <Link href={`/catalog/category/${firstCategory.slug}`} className="underline">{firstCategory.name}</Link></p>}
        </div>
      </section>
    </>
  );
}
