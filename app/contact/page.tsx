import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactQuote from "@/components/ContactQuote";
import LazyMap from "@/components/LazyMap";
import Reveal from "@/components/motion/Reveal";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Zetta Tech",
  description: "Contact Zetta Tech on WhatsApp or email for a quote. Head office in Saddar, Karachi.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  const map = `https://www.google.com/maps?q=${encodeURIComponent("V26H+75V Saddar Karachi")}&output=embed`;
  return (
    <>
      <PageHero title="Contact" intro="Message us with your site type and requirements. We reply within one business day." crumbs={[{ href: "/", label: "Home" }, { href: "/contact", label: "Contact" }]} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-2">
        <Reveal stagger className="grid content-start gap-4 text-lg">
          <a href={waLink()} className="btn-whatsapp px-6 py-4">WhatsApp {site.phone}</a>
          <a href={`mailto:${site.email}`} className="btn-outline py-4">{site.email}</a>
          <address className="mt-4 not-italic text-navy-900/80">
            <strong className="block text-navy-900">Head office</strong>
            {site.address.full}
          </address>
          <p className="text-base text-navy-900/65">Prefer a form? Answer three short questions and we will open WhatsApp with everything pre-filled.</p>
        </Reveal>
        <Reveal>
          <div className="border border-navy-900/15 bg-white p-6 shadow-[8px_8px_0_0_#CFF1FF]">
            <ContactQuote />
          </div>
        </Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6">
        <Reveal>
          <LazyMap src={map} title="Zetta Tech head office in Saddar, Karachi" />
        </Reveal>
      </section>
    </>
  );
}
