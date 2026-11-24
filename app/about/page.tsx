import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";
import Reveal from "@/components/motion/Reveal";
import RuleDraw from "@/components/motion/RuleDraw";
import { site } from "@/lib/site";
import { categories } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Zetta Tech",
  description: "Zetta Tech is an official dealer and installer of security and networking systems, based in Saddar, Karachi.",
  alternates: { canonical: "/about" },
};

const facts = [
  ["Based in", site.address.full],
  ["Focus", "ZKTeco-first access control, attendance, CCTV, thermal mapping and networking"],
  ["Scope", "Survey, supply, cabling, installation, configuration and handover"],
  ["Who we serve", "Businesses, offices, factories, warehouses and commercial sites in Karachi"],
];

export default function About() {
  return (
    <>
      <PageHero title="About Zetta Tech" intro="We supply, install and configure security and networking systems for businesses, offices and factories." crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]} />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal stagger className="max-w-2xl text-lg leading-relaxed text-navy-900/85">
          <p>Zetta Tech is based in Saddar, Karachi. We are a ZKTeco-first dealer: access control, attendance, CCTV, thermal mapping and networking, installed on site.</p>
          <p>Our team handles the full job: site survey, equipment, cabling, installation, configuration and handover. Every recommendation is shaped around the building, users and operating needs of the site.</p>
          <p className="text-navy-900/70">We keep the catalog deliberately focused. If a product does not belong on a working security site, it is not in the list.</p>
        </Reveal>
        <div>
          <RuleDraw />
          <Reveal as="dl" stagger>
            {facts.map(([term, detail]) => (
              <div key={term} className="grid gap-1 border-b border-navy-900/15 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="label text-navy-900/70">{term}</dt>
                <dd className="text-navy-900/85">{detail}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="border-y border-navy-900/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
          <p className="label text-cyan-ink">What we install</p>
          <Reveal as="ul" stagger className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug} className="border border-navy-900/15 bg-paper px-4 py-3 font-medium text-navy-900">{category.name}</li>
            ))}
          </Reveal>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
