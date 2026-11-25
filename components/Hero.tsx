import { brandLine, site, waLink } from "@/lib/site";
import SitePlan from "./SitePlan";

/**
 * The H1 is split into the phrases that must not break apart mid-thought, not into
 * fixed visual lines. `.line-mask` animates each phrase from below on load; letting
 * them wrap naturally means the headline still fits at every width instead of one
 * phrase pushing the column wider than its grid track.
 */
const headline = ["ZKTeco attendance,", "access control", "and CCTV", "in Karachi"];
const steps: [string, string][] = [
  ["Supply", "ZKTeco main supplier"],
  ["Install", "Cabling to commissioning"],
  ["Support", "After handover"],
];

/**
 * Hero. Deliberately a server component: the headline mask reveal and the text rise
 * are pure CSS (see globals.css), so the H1 and supporting copy paint at first byte
 * instead of waiting for hydration.
 *
 * The H1 leads with ZKTeco, which is the position the business actually holds, then
 * the systems. Phone and email live in the top bar and footer; the hero repeats only
 * a quiet email link.
 */
export default function Hero() {
  return (
    <section className="border-b border-navy-900/15">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p data-hero-fade className="eyebrow text-cyan-ink">{brandLine.eyebrow}</p>
          <h1 className="h-display mt-5 text-balance text-[clamp(2.1rem,4.4vw,3.6rem)] text-navy-900">
            {headline.map((phrase, index) => (
              <span key={phrase} className="line-mask">
                <span>{phrase}{index === headline.length - 1 ? "" : " "}</span>
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-900/80">
            {brandLine.heroSubtitle}
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
            <a
              href={waLink("Hello Zetta Tech, I need a quote for ZKTeco attendance or access control.")}
              className="beam-button btn-primary w-full px-6 py-3.5 text-center sm:w-auto"
            >
              Request a quote
            </a>
            <a href={waLink()} className="btn-whatsapp w-full text-center sm:w-auto">
              WhatsApp
            </a>
            <a
              href={`mailto:${site.email}?subject=Quote%20request`}
              className="w-full text-center text-sm text-navy-900/75 underline decoration-navy-900/30 underline-offset-4 transition-colors hover:text-navy-900 hover:decoration-navy-900 sm:w-auto"
            >
              {site.email}
            </a>
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
          <figcaption className="flex justify-between px-2 py-2 tag text-navy-900/70">
            <span>Illustrative site plan</span>
            <span>Not a live feed</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
