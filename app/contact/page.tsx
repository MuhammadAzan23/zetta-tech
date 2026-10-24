import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
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
        <div className="grid content-start gap-4 text-lg">
          <a href={waLink()} className="rounded bg-navy-900 px-6 py-4 font-semibold text-white hover:bg-navy-800">WhatsApp us</a>
          <a href={`mailto:${site.email}`} className="rounded border border-navy-900 px-6 py-4 font-semibold text-navy-900 hover:bg-white">{site.email}</a>
          <address className="mt-4 not-italic text-navy-900/80">
            <strong className="block text-navy-900">Head office</strong>
            {site.address.full}
          </address>
        </div>
        <iframe title="Zetta Tech head office in Saddar, Karachi" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-80 w-full border border-navy-900/20 md:h-full" />
      </section>
    </>
  );
}
