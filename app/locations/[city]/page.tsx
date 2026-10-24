import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";
import { categories, cities } from "@/lib/data";

type Props = { params: { city: string } };
export const dynamicParams = false;
export function generateStaticParams() { return cities.map((c) => ({ city: c.slug })); }

export function generateMetadata({ params }: Props): Metadata {
  const c = cities.find((x) => x.slug === params.city);
  if (!c) return {};
  return {
    title: `CCTV, Access Control & Networking in ${c.name}`,
    description: `Zetta Tech supplies, installs and configures CCTV, access control, attendance systems and networking for businesses in ${c.name}.`,
    alternates: { canonical: `/locations/${c.slug}` },
  };
}

export default function CityPage({ params }: Props) {
  const c = cities.find((x) => x.slug === params.city);
  if (!c) notFound();
  return (
    <>
      <PageHero title={`Security and networking in ${c.name}`} intro={`${c.note} Official dealer of ZKTeco, UniFi, Ruijie, MikroTik, Dahua, Tiandy, D-Link and Cloud.`} crumbs={[{ href: "/", label: "Home" }, { href: `/locations/${c.slug}`, label: c.name }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        {/* TODO: write unique copy for each city (local sites, industries, case studies). Avoid copying text between cities. */}
        <h2 className="font-display text-2xl font-semibold text-navy-900">What we install in {c.name}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((x) => (
            <li key={x.slug}><Link href={`/products/${x.slug}`} className="block border border-navy-900/15 bg-white p-5 font-semibold text-navy-900 hover:border-cyan-deep">{x.name}</Link></li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
