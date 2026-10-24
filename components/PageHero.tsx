import Link from "next/link";

export default function PageHero({ title, intro, crumbs }: { title: string; intro: string; crumbs: { href: string; label: string }[] }) {
  return (
    <section className="border-b border-navy-900/15">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="label text-navy-900/60">
          <ol className="flex flex-wrap gap-2">
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex gap-2">
                <Link href={c.href} className="hover:text-navy-900 hover:underline">{c.label}</Link>
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="h-display mt-5 max-w-4xl text-[clamp(2.2rem,5.2vw,4rem)] text-navy-900">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-navy-900/75">{intro}</p>
      </div>
    </section>
  );
}
