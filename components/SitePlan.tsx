// Illustrative floor plan: cameras with coverage, door reader, cabling to the server room.
export default function SitePlan({ className = "" }: { className?: string }) {
  const wall = { stroke: "#05224C", strokeWidth: 3, fill: "none", strokeLinecap: "square" as const };
  const thin = { stroke: "#05224C", strokeWidth: 1, fill: "none" };
  const cone = { fill: "#36CDFF", fillOpacity: 0.22, stroke: "#0A8DBD", strokeWidth: 1 };
  const cam = (x: number, y: number) => <circle cx={x} cy={y} r="6" fill="#05224C" />;
  const tag = (x: number, y: number, t: string, anchor: "start" | "end" = "start") => (
    <text x={x} y={y} textAnchor={anchor} fontSize="10" letterSpacing="1" fill="#05224C" className="font-mono">{t}</text>
  );
  return (
    <svg viewBox="0 0 560 450" className={className} role="img" aria-label="Illustrative site plan showing cameras, a door reader and network cabling to a server room">
      <rect width="560" height="450" fill="#FFFFFF" />
      <defs>
        <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#05224C" strokeOpacity="0.07" /></pattern>
      </defs>
      <rect width="560" height="450" fill="url(#g)" />
      {/* coverage cones */}
      <polygon points="508,52 332,62 382,236" {...cone} />
      <polygon points="52,366 252,268 252,372" {...cone} />
      <polygon points="292,50 146,238 290,238" {...cone} />
      {/* walls */}
      <path d="M300 380H520V40H40V380H240" {...wall} />
      <path d="M40 240H150M200 240H380M430 240H520M300 40V120M300 160V240M130 40V110H40" {...wall} />
      {/* entrance door */}
      <path d="M300 380V320M240 380A60 60 0 0 1 300 320" {...thin} />
      {/* server room racks */}
      <rect x="50" y="48" width="28" height="52" fill="#05224C" />
      <rect x="86" y="48" width="28" height="52" fill="#05224C" />
      <path d="M54 58H74M54 66H74M54 74H74M90 58H110M90 66H110M90 74H110" stroke="#36CDFF" strokeWidth="2" />
      {/* cabling */}
      <g stroke="#05224C" strokeWidth="1.5" strokeDasharray="5 4" fill="none">
        <path d="M130 84H292V56" /><path d="M130 94H508V58" /><path d="M64 110V366" />
        <path d="M130 100H175V232" />
      </g>
      {/* devices */}
      {cam(508, 52)}{cam(52, 366)}{cam(292, 50)}
      <rect x="168" y="232" width="14" height="14" fill="#36CDFF" stroke="#05224C" strokeWidth="2" />
      <rect x="306" y="366" width="14" height="14" fill="#36CDFF" stroke="#05224C" strokeWidth="2" />
      {/* labels */}
      {tag(500, 36, "CAM 01", "end")}{tag(60, 392, "CAM 02")}{tag(284, 36, "CAM 03", "end")}
      {tag(188, 258, "READER 01")}{tag(326, 356, "READER 02")}
      {tag(48, 130, "SERVER ROOM / SW-01")}
      {tag(48, 212, "OFFICE")}{tag(316, 212, "OPEN AREA")}{tag(48, 290, "LOBBY")}
      <rect x="360" y="396" width="160" height="40" fill="#fff" stroke="#05224C" />
      {tag(370, 412, "SITE PLAN")}
      <text x="370" y="427" fontSize="9" fill="#05224C" fillOpacity="0.7" className="font-mono">ILLUSTRATIVE ONLY</text>
    </svg>
  );
}
