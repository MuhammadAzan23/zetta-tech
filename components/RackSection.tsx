import RackDiagram from "./RackDiagram";
import Stats from "./Stats";

const points = [
  "Wall-mount or floor-standing rack sized for your equipment",
  "Every cable labeled at both ends, patched in a neat, documented layout",
  "PoE switching for cameras and access points, on a UPS",
  "A simple network diagram handed over with the system",
];

export default function RackSection() {
  return (
    <section className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="label text-cyan-brand">Racks and cabling</p>
          <h2 className="h-display mt-3 text-4xl sm:text-5xl">The part nobody sees should still be tidy</h2>
          <ul className="mt-8 grid gap-4">
            {points.map((p) => (
              <li key={p} className="flex gap-3 border-t border-white/15 pt-4 text-white/85">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-cyan-brand" />{p}
              </li>
            ))}
          </ul>
        </div>
        <RackDiagram className="mx-auto h-auto w-full max-w-lg" />
      </div>
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6"><Stats /></div>
    </section>
  );
}
