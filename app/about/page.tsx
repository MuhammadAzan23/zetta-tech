import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { CtaBand } from "@/components/Extras";

export const metadata: Metadata = {
  title: "About Zetta Tech",
  description: "Zetta Tech is an official dealer and installer of security and networking systems, based in Saddar, Karachi.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <PageHero title="About Zetta Tech" intro="We supply, install and configure security and networking systems for businesses, offices and factories." crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]} />
      <section className="mx-auto max-w-3xl px-5 py-16 text-lg leading-relaxed text-navy-900/85 sm:px-6">
        <p>Zetta Tech is based in Saddar, Karachi. We help businesses choose, source and deploy security and networking equipment from a broad product catalog.</p>
        <p className="mt-5">Our team handles the full job: site survey, equipment, cabling, installation, configuration and handover. Every recommendation is shaped around the building, users and operating needs of the site.</p>
      </section>
      <CtaBand />
    </>
  );
}
