import Link from "next/link";
import { categories, cities, faqs } from "@/lib/data";
import { site, waLink } from "@/lib/site";
import Reveal from "./motion/Reveal";
import RuleDraw from "./motion/RuleDraw";

export function Projects() {
  const solutions = categories.slice(0, 4);
  return (
    <section className="defer-paint mx-auto max-w-7xl px-5 py-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr]">
        <Reveal>
          <p className="label text-cyan-ink">Karachi solutions</p>
          <h2 className="h-display mt-3 text-4xl text-navy-900 sm:text-5xl">Systems we plan and install</h2>
        </Reveal>
        <div>
          <RuleDraw />
          <Reveal as="ul" stagger>
            {solutions.map((solution) => (
              <li key={solution.slug} className="grid gap-1 border-b border-navy-900/15 py-5 sm:grid-cols-[1fr_1.4fr_auto] sm:items-baseline sm:gap-6">
                <Link href={`/products/${solution.slug}`} className="link-underline w-fit font-display text-xl font-semibold text-navy-900 decoration-cyan-brand decoration-2 underline-offset-4 hover:decoration-cyan-brand">{solution.name}</Link>
                <span className="text-navy-900/70">{solution.short}</span>
                <span className="label text-navy-900/70">Karachi</span>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Cities() {
  return (
    <section className="defer-paint border-y border-navy-900/15 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <p className="label text-cyan-ink">Where we install</p>
        <Reveal as="ul" stagger className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`/locations/${c.slug}`} className="font-display text-3xl font-semibold text-navy-900 underline decoration-cyan-brand decoration-2 underline-offset-8 transition-colors hover:text-navy-700 sm:text-5xl">{c.name}</Link>
            </li>
          ))}
          <li className="self-end text-navy-900/70">Supply, installation and support across Karachi</li>
        </Reveal>
      </div>
    </section>
  );
}

export function FAQ() {
  // Native <details> keeps it keyboard and screen-reader friendly and keeps answers in the
  // HTML for no-JS and SEO. The open state animates height + opacity via CSS grid rows.
  return (
    <section className="defer-paint mx-auto max-w-4xl px-5 py-20 sm:px-6">
      <Reveal>
        <h2 className="h-display text-4xl text-navy-900 sm:text-5xl">Common questions</h2>
      </Reveal>
      <div className="mt-8">
        <RuleDraw />
        {faqs.map((f) => (
          <details key={f.q} className="faq-item group border-b border-navy-900/15">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold text-navy-900 marker:hidden">
              {f.q}
              <span aria-hidden="true" className="font-mono text-cyan-ink group-open:hidden">+</span>
              <span aria-hidden="true" className="hidden font-mono text-cyan-ink group-open:inline">−</span>
            </summary>
            <div className="faq-body">
              <div><p className="max-w-prose pb-5 text-navy-900/75">{f.a}</p></div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FaqSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export function CtaBand() {
  return (
    <section id="contact" className="defer-paint bg-navy-900 text-white">
      <Reveal stagger className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-6 md:flex-row md:items-center">
        <h2 className="h-display max-w-xl text-3xl sm:text-4xl">Need a quote? WhatsApp us the model — we prefill the product details for you.</h2>
        <div className="flex flex-wrap gap-3">
          <a href={waLink()} className="btn-whatsapp px-6 py-3.5">WhatsApp {site.phone}</a>
          <a href={`mailto:${site.email}`} className="btn-ghost-light">{site.email}</a>
        </div>
      </Reveal>
    </section>
  );
}
