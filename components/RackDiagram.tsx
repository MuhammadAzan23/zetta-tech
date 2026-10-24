// Illustrative 12U rack elevation.
const U = 28;
const top = 24;
type Item = { u: number; h: number; label: string; kind: "patch" | "switch" | "router" | "nvr" | "ups" | "brush" };
const items: Item[] = [
  { u: 0, h: 1, label: "Patch panel", kind: "patch" },
  { u: 1, h: 1, label: "Cable management", kind: "brush" },
  { u: 2, h: 1, label: "PoE switch", kind: "switch" },
  { u: 3, h: 1, label: "Patch panel", kind: "patch" },
  { u: 4, h: 1, label: "Cable management", kind: "brush" },
  { u: 5, h: 1, label: "Managed switch", kind: "switch" },
  { u: 6, h: 1, label: "Router / gateway", kind: "router" },
  { u: 7, h: 2, label: "NVR", kind: "nvr" },
  { u: 9, h: 3, label: "UPS", kind: "ups" },
];

export default function RackDiagram({ className = "" }: { className?: string }) {
  const x0 = 36, w = 200;
  const H = top * 2 + U * 12;
  return (
    <svg viewBox={`0 0 430 ${H}`} className={className} role="img" aria-label="Illustrative 12U equipment rack with patch panels, switches, router, NVR and UPS">
      <rect x={x0 - 10} y={top - 10} width={w + 20} height={U * 12 + 20} fill="none" stroke="#36CDFF" strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <text key={i} x={x0 - 14} y={top + i * U + 18} textAnchor="end" fontSize="9" fill="#fff" fillOpacity="0.45" className="font-mono">{i + 1}</text>
      ))}
      {items.map((it) => {
        const y = top + it.u * U + 2, h = it.h * U - 4;
        return (
          <g key={it.u}>
            <rect x={x0} y={y} width={w} height={h} fill="#0B3068" stroke="#fff" strokeOpacity="0.5" />
            {it.kind === "patch" && Array.from({ length: 24 }).map((_, i) => (<rect key={i} x={x0 + 10 + i * 7.5} y={y + 8} width="5" height="8" fill="#36CDFF" />))}
            {it.kind === "switch" && Array.from({ length: 24 }).map((_, i) => (<rect key={i} x={x0 + 10 + (i % 12) * 11 + (i >= 12 ? 0 : 0)} y={y + (i < 12 ? 6 : 14)} width="8" height="6" fill="#fff" fillOpacity="0.85" />))}
            {it.kind === "router" && (<><circle cx={x0 + 16} cy={y + h / 2} r="4" fill="#36CDFF" /><path d={`M${x0 + 40} ${y + h / 2}H${x0 + w - 12}`} stroke="#fff" strokeOpacity="0.6" strokeDasharray="3 3" /></>)}
            {it.kind === "nvr" && [0, 1, 2, 3].map((i) => (<rect key={i} x={x0 + 12 + i * 44} y={y + 10} width="38" height={h - 20} fill="none" stroke="#36CDFF" />))}
            {it.kind === "ups" && (<><rect x={x0 + 14} y={y + 14} width="60" height="10" fill="#36CDFF" /><circle cx={x0 + w - 24} cy={y + h / 2} r="8" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" /></>)}
            {it.kind === "brush" && <path d={`M${x0 + 8} ${y + h / 2}H${x0 + w - 8}`} stroke="#fff" strokeOpacity="0.5" strokeDasharray="1 3" strokeWidth="3" />}
            <line x1={x0 + w + 12} x2={x0 + w + 40} y1={y + h / 2} y2={y + h / 2} stroke="#fff" strokeOpacity="0.4" />
            <text x={x0 + w + 46} y={y + h / 2 + 4} fontSize="11" fill="#fff" className="font-mono">{it.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
