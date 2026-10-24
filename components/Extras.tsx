import Link from "next/link";
import { cities, faqs, projects } from "@/lib/data";
import { site, waLink } from "@/lib/site";

export function Projects() {
  const dev = process.env.NODE_ENV !== "production";
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <p className="label text-cyan-deep">Recent work</p>
          <h2 className="h-display mt-3 text-4xl text-navy-900 sm:text-5xl">Recent installations</h2>
        </div>
        {/* PLACEHOLDER content: replace with real projects in lib/data.ts */}
        <ul className="border-t border-navy-900/25">
          {projects.map((p) => (
            <li key={p.title + p.city} className="grid gap-1 border-b border-navy-900/15 py-5 sm:grid-cols-[1fr_1.4fr_auto] sm:items-baseline sm:gap-6">
              <span className="font-display text-xl font-semibold text-navy-900">{p.title}{dev && p.placeholder ? <em className="label ml-2 not-italic text-cyan-deep">sample</em> : null}</span>
              <span className="text-navy-900/70">{p.scope}</span>
              <span className="label text-navy-900/55">{p.city}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Cities() {
  return (
    <section className="border-y border-navy-900/15 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <p className="label text-cyan-deep">Where we install</p>
        <ul className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`/locations/${c.slug}`} className="font-display text-3xl font-semibold text-navy-900 underline decoration-cyan-brand decoration-2 underline-offset-8 hover:text-navy-700 sm:text-5xl">{c.name}</Link>
            </li>
          ))}
          <li className="self-end text-navy-900/60">and other cities on request</li>
        </ul>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20 sm:px-6">
      <h2 className="h-display text-4xl text-navy-900 sm:text-5xl">Common questions</h2>
      <div className="mt-8 border-t border-navy-900/25">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-navy-900/15 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-navy-900 marker:hidden">
              {f.q}<span aria-hidden="true" className="font-mono text-cyan-deep group-open:hidden">+</span><span aria-hidden="true" className="hidden font-mono text-cyan-deep group-open:inline">−</span>
            </summary>
            <p className="mt-3 max-w-prose text-navy-900/75">{f.a}</p>
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
    <section className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-6 md:flex-row md:items-center">
        <h2 className="h-display max-w-xl text-3xl sm:text-4xl">Tell us about your site and we will send a plan and a price.</h2>
        <div className="flex flex-wrap gap-3">
          <a href={waLink()} className="rounded bg-cyan-brand px-6 py-3.5 font-semibold text-navy-950 hover:bg-cyan-soft">WhatsApp</a>
          <a href={`mailto:${site.email}`} className="rounded border border-white/40 px-6 py-3.5 font-semibold hover:bg-white/10">Email</a>
        </div>
      </div>
    </section>
  );
}
