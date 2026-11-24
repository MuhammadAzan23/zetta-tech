import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";
import Reveal from "@/components/motion/Reveal";
import RuleDraw from "@/components/motion/RuleDraw";
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
      <PageHero title={`Security and networking in ${c.name}`} intro={`${c.note} Supply, installation and support for offices, factories, warehouses and commercial sites.`} crumbs={[{ href: "/", label: "Home" }, { href: `/locations/${c.slug}`, label: c.name }]} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-navy-900">What we install in {c.name}</h2>
            <p className="mt-3 max-w-sm text-navy-900/70">Each system is planned for the site, then installed and documented by our own team.</p>
          </Reveal>
          <div>
            <RuleDraw />
            <Reveal as="ul" stagger>
              {categories.map((x) => (
                <li key={x.slug} className="border-b border-navy-900/15">
                  <Link href={`/products/${x.slug}`} className="group flex items-baseline justify-between gap-4 py-5">
                    <span>
                      <span className="link-underline font-display text-xl font-semibold text-navy-900">{x.name}</span>
                      <span className="mt-1 block text-sm text-navy-900/65">{x.short}</span>
                    </span>
                    <span className="label shrink-0 text-navy-900/70">{c.name}</span>
                  </Link>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
