import { waLink, site } from "@/lib/site";
import SitePlan from "./SitePlan";

export default function Hero() {
  return (
    <section className="border-b border-navy-900/15">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p className="label text-cyan-deep">Security and networking · Karachi, Hyderabad, Sukkur, Islamabad</p>
          <h1 className="h-display mt-5 text-[clamp(2.4rem,5.6vw,4.6rem)] text-navy-900">
            CCTV, access control and networking for Pakistani businesses.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-900/80">
            We are an official dealer of eight brands. Our team supplies, installs and configures the cameras, door readers, attendance terminals, routers, switches and racks your offices and factories depend on.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={waLink()} className="rounded bg-navy-900 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-navy-800">Get a quote on WhatsApp</a>
            <a href={`mailto:${site.email}?subject=Quote%20request`} className="rounded border border-navy-900 px-6 py-3.5 font-semibold text-navy-900 transition-colors hover:bg-white">Email us</a>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 border-t border-navy-900/20">
            {[["Supply", "Genuine, warrantied"], ["Install", "Cabling to commissioning"], ["Support", "After handover"]].map(([t, d]) => (
              <div key={t} className="border-r border-navy-900/15 py-4 pr-4 last:border-r-0 [&:not(:first-child)]:pl-4">
                <dt className="font-display text-lg font-semibold text-navy-900">{t}</dt>
                <dd className="mt-0.5 text-sm text-navy-900/65">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="border border-navy-900/20 bg-white p-2 shadow-[8px_8px_0_0_#CFF1FF]">
          <SitePlan className="h-auto w-full" />
        </figure>
      </div>
    </section>
  );
}
