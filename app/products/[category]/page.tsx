import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";
import Reveal from "@/components/motion/Reveal";
import RuleDraw from "@/components/motion/RuleDraw";
import { brands, categories } from "@/lib/data";
import ThermalShowcase from "@/components/ThermalShowcase";
import AttendanceBuilder from "@/components/AttendanceBuilder";
import SitePlanDemo from "@/components/SitePlanDemo";
import { waLink } from "@/lib/site";

type Props = { params: { category: string } };
export const dynamicParams = false;
export function generateStaticParams() { return categories.map((c) => ({ category: c.slug })); }

/** Categories where a camera/reader/cabling plan is a useful planning aid. */
const PLAN_CATEGORIES = ["access-control", "cctv-nvrs", "networking"];

export function generateMetadata({ params }: Props): Metadata {
  const c = categories.find((x) => x.slug === params.category);
  if (!c) return {};
  return {
    title: `${c.name} in Karachi`,
    description: c.description,
    alternates: { canonical: `/products/${c.slug}` },
  };
}

export default function CategoryPage({ params }: Props) {
  const c = categories.find((x) => x.slug === params.category);
  if (!c) notFound();
  const related = brands.filter((b) => c.brands.includes(b.slug));
  const showPlan = PLAN_CATEGORIES.includes(c.slug);
  return (
    <>
      <PageHero title={c.name} intro={c.description} crumbs={[{ href: "/", label: "Home" }, { href: "/#products", label: "Products" }, { href: `/products/${c.slug}`, label: c.name }]} />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy-900">What we supply and install</h2>
          <RuleDraw className="mt-5" />
          <Reveal as="ul" stagger>
            {c.items.map((i) => (
              <li key={i} className="border-b border-navy-900/15 px-1 py-4 font-medium text-navy-900">{i}</li>
            ))}
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={waLink(`Hello Zetta Tech, I need a quote for ${c.name}.`)} className="btn-primary px-6 py-3.5">Request a quote for {c.name}</a>
            <Link href="/catalog" className="btn-outline px-6 py-3.5">Browse full catalog</Link>
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy-900">Brands</h2>
          <RuleDraw className="mt-5" />
          {related.length ? (
            <Reveal as="ul" stagger>
              {related.map((b) => (
                <li key={b.slug} className="border-b border-navy-900/15">
                  <Link href={`/brands/${b.slug}`} className="group block py-4">
                    <span className="link-underline font-bold text-navy-900">{b.name}</span>
                    <span className="mt-1 block text-sm text-navy-900/70">{b.blurb}</span>
                  </Link>
                </li>
              ))}
            </Reveal>
          ) : (
            <p className="mt-5 text-navy-900/70">Racks and cabling are supplied and fitted to suit your equipment.</p>
          )}
          {c.slug === "cctv-nvrs" ? <ThermalShowcase className="mt-8" /> : null}
        </div>
      </section>
      {showPlan ? (
        <section className="border-t border-navy-900/15 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <Reveal>
              <p className="label text-cyan-ink">Design the layout</p>
              <h2 className="h-display mt-3 max-w-2xl text-3xl text-navy-900 sm:text-4xl">See the plan before the survey.</h2>
              <p className="mt-4 max-w-xl text-navy-900/75">
                Pick your site type to see how we would place cameras, door readers and cabling. The counts update with the plan.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <SitePlanDemo className="mt-8" />
            </Reveal>
          </div>
        </section>
      ) : null}
      {c.slug === "attendance-management" ? (
        <section className="border-t border-navy-900/15 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <Reveal>
              <p className="label text-cyan-ink">Plan your setup</p>
              <h2 className="h-display mt-3 text-3xl text-navy-900 sm:text-4xl">How many terminals will you need?</h2>
              <p className="mt-4 max-w-md text-navy-900/75">
                Answer six quick questions. We work out a terminal count from your staff numbers and branches, then send the whole requirement to WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <AttendanceBuilder />
            </Reveal>
          </div>
        </section>
      ) : null}
      <CtaBand />
    </>
  );
}
