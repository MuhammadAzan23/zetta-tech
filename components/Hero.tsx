import { waLink, site } from "@/lib/site";
import SitePlan from "./SitePlan";

const headline = ["Thermal mapping", "and access control,", "installed on site."];
const steps: [string, string][] = [
  ["Supply", "ZKTeco-first catalog"],
  ["Install", "Cabling to commissioning"],
  ["Support", "After handover"],
];

/**
 * Hero. Deliberately a server component: the headline mask reveal and the text rise
 * are pure CSS (see globals.css), so the H1 and supporting copy paint at first byte
 * instead of waiting for hydration.
 */
export default function Hero() {
  return (
    <section className="border-b border-navy-900/15">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p data-hero-fade className="label text-cyan-ink">ZKTeco main supplier · Karachi</p>
          <h1 className="h-display mt-5 text-[clamp(2.4rem,5.6vw,4.6rem)] text-navy-900">
            {headline.map((line, index) => (
              <span key={line} className="line-mask">
                <span className="block">{line}{index === headline.length - 1 ? "" : " "}</span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-900/80">
            ZKTeco hardware. Quote any model on WhatsApp.
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
            {/* The one and only light-beam CTA on the site. The header's "Request a
                quote" link and every other primary button stay flat navy. */}
            <a href={waLink("Hello Zetta Tech, I need a quote for ZKTeco access control and thermal mapping.")} className="beam-button btn bg-navy-900 w-full px-6 py-3.5 text-center text-white hover:bg-navy-800 sm:w-auto">
              Request a quote
            </a>
            <a href={waLink()} className="btn-whatsapp w-full px-6 py-3.5 text-center sm:w-auto">WhatsApp {site.phone}</a>
            <a href={`mailto:${site.email}?subject=Quote%20request`} className="btn-outline w-full text-center sm:w-auto">{site.email}</a>
          </div>
          <dl data-hero-fade className="mt-12 grid max-w-xl grid-cols-1 border-t border-navy-900/20 sm:grid-cols-3">
            {steps.map(([title, detail]) => (
              <div key={title} className="border-b border-navy-900/15 py-4 sm:border-b-0 sm:border-r sm:pr-4 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-4">
                <dt className="font-display text-lg font-semibold text-navy-900">{title}</dt>
                <dd className="mt-0.5 text-sm text-navy-900/65">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="border border-navy-900/20 bg-white p-2 shadow-[8px_8px_0_0_#CFF1FF]">
          <SitePlan className="h-auto w-full" />
          <figcaption className="flex justify-between px-2 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-navy-900/70">
            <span>Illustrative site plan</span>
            <span>Not a live feed</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
