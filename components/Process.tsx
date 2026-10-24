const steps = [
  ["Site survey", "We visit, measure, check cable routes and note what each area needs."],
  ["Plan and quote", "You get a clear equipment list, layout and price before anything is ordered."],
  ["Install and configure", "Cabling, mounting, setup and testing, done by our own team."],
  ["Handover and support", "We train your staff, document the system and stay available after."],
];

export default function Process() {
  return (
    <section id="how-we-work" className="border-y border-navy-900/15 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
        <p className="label text-cyan-deep">How we work</p>
        <h2 className="h-display mt-3 max-w-2xl text-4xl text-navy-900 sm:text-5xl">From first visit to handover, one team</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-0">
          {steps.map(([t, d], i) => (
            <li key={t} className="relative md:pr-8">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center bg-navy-900 font-mono text-sm text-cyan-brand">{i + 1}</span>
                <span aria-hidden="true" className="hidden h-px flex-1 bg-navy-900/25 md:block" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-navy-900">{t}</h3>
              <p className="mt-2 text-navy-900/70">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
