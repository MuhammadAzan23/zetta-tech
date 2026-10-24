import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";
import { brands, categories } from "@/lib/data";

type Props = { params: { brand: string } };
export const dynamicParams = false;
export function generateStaticParams() { return brands.map((b) => ({ brand: b.slug })); }

export function generateMetadata({ params }: Props): Metadata {
  const b = brands.find((x) => x.slug === params.brand);
  if (!b) return {};
  return {
    title: `${b.name} Official Dealer in Karachi, Hyderabad, Sukkur & Islamabad`,
    description: `Zetta Tech is an official ${b.name} dealer. ${b.blurb} Supply, installation and configuration across Pakistan.`,
    alternates: { canonical: `/brands/${b.slug}` },
  };
}

export default function BrandPage({ params }: Props) {
  const b = brands.find((x) => x.slug === params.brand);
  if (!b) notFound();
  const cats = categories.filter((c) => c.brands.includes(b.slug));
  return (
    <>
      <PageHero title={`${b.name} official dealer`} intro={`${b.blurb} Zetta Tech supplies, installs and configures ${b.name} products for businesses, offices and factories.`} crumbs={[{ href: "/", label: "Home" }, { href: "/brands/zkteco", label: "Brands" }, { href: `/brands/${b.slug}`, label: b.name }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <p className="label inline-block bg-cyan-brand px-3 py-1.5 text-navy-950">Authorized dealer</p>
        {/* TODO: attach dealer certificate or letter from the brand */}
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
