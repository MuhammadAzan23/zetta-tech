import type { PlanVariant } from "@/lib/site-plans";

/**
 * Draws one site plan.
 *
 * Pure presentational SVG so it can run on the server: the hero ships it with no
 * JavaScript, and the interactive demo re-renders it when the visitor picks another
 * variant. All animation is CSS keyframes keyed off `data-plan` (globals.css), and
 * every drawn path carries `pathLength="1"` so one dasharray works for all of them.
 */
export default function PlanSvg({
  variant,
  className = "",
  animate = true,
  label,
}: {
  variant: PlanVariant;
  className?: string;
  animate?: boolean;
  /** Prefix for element ids, so two plans on one page never clash. */
  label: string;
}) {
  const wall = { stroke: "#05224C", strokeWidth: 3, fill: "none", strokeLinecap: "square" as const };
  const thin = { stroke: "#05224C", strokeWidth: 1, fill: "none" };
  const cone = { fill: "#36CDFF", fillOpacity: 0.22, stroke: "#0A8DBD", strokeWidth: 1 };
  const draw = animate ? { className: "sp-draw", pathLength: 1 } : {};

  // A white halo behind the text keeps labels readable where a cable or a wall runs
  // underneath them, without moving anything off its anchor point.
  const tag = (x: number, y: number, t: string, anchor: "start" | "end" = "start") => (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize="10"
      letterSpacing="1"
      fill="#05224C"
      stroke="#FFFFFF"
      strokeWidth="2"
      paintOrder="stroke"
      className="font-mono sp-label"
    >
      {t}
    </text>
  );

  return (
    <svg
      viewBox="0 0 560 450"
      className={`${className} site-plan${animate ? "" : " site-plan--static"}`}
      role="img"
      aria-label={variant.alt}
    >
      <rect width="560" height="450" fill="#FFFFFF" />
      <defs>
        <pattern id={`${label}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#05224C" strokeOpacity="0.07" />
        </pattern>
        <radialGradient id={`${label}-heat-1`} cx="88%" cy="12%" r="34%">
          <stop offset="0%" stopColor="#FF5A36" stopOpacity=".85" />
          <stop offset="50%" stopColor="#FFB020" stopOpacity=".4" />
          <stop offset="100%" stopColor="#36CDFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${label}-heat-2`} cx="12%" cy="82%" r="32%">
          <stop offset="0%" stopColor="#FFB020" stopOpacity=".7" />
          <stop offset="60%" stopColor="#FF7A1A" stopOpacity=".22" />
          <stop offset="100%" stopColor="#36CDFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${label}-heat-scale`} x1="0" x2="1">
          <stop offset="0" stopColor="#1B4DFF" />
          <stop offset=".35" stopColor="#36CDFF" />
          <stop offset=".65" stopColor="#FFB020" />
          <stop offset="1" stopColor="#FF5A36" />
        </linearGradient>
      </defs>
      <rect width="560" height="450" fill={`url(#${label}-grid)`} />

      {/* Thermal signature: heat sits where equipment and people are. */}
      <g className="sp-thermal">
        <ellipse cx="486" cy="70" rx="120" ry="86" fill={`url(#${label}-heat-1)`} />
        <ellipse cx="78" cy="352" rx="118" ry="82" fill={`url(#${label}-heat-2)`} />
        <ellipse cx="262" cy="120" rx="96" ry="68" fill={`url(#${label}-heat-1)`} opacity=".55" />
      </g>

      {/* Coverage cones, drawn before the walls so the walls stay crisp. */}
      <g>
        {variant.cameras.map((camera, index) => (
          <polygon
            key={camera.label}
            className="sp-cone"
            style={{
              transformBox: "view-box",
              transformOrigin: `${camera.x}px ${camera.y}px`,
              animationDelay: `${index * 0.09}s`,
            }}
            points={`${camera.x},${camera.y} ${camera.cone[0].x},${camera.cone[0].y} ${camera.cone[1].x},${camera.cone[1].y}`}
            {...cone}
          />
        ))}
      </g>

      {/* Walls and partitions trace themselves in. */}
      {variant.walls.map((d) => <path key={d} {...draw} d={d} {...wall} />)}
      {variant.partitions.map((d) => <path key={d} {...draw} d={d} {...wall} />)}

      {/* Door swings. */}
      {variant.doors.map((d) => <path key={d} {...draw} d={d} {...thin} />)}

      {/* Racks, plant and machinery. */}
      {variant.blocks.map((block) => (
        <rect key={`${block.x}-${block.y}`} x={block.x} y={block.y} width={block.width} height={block.height} fill="#05224C" />
      ))}
      <path d={variant.leds.join("")} stroke="#36CDFF" strokeWidth="2" className="led-blink" />

      {/* Cabling back to the control point. */}
      <g stroke="#05224C" strokeWidth="1.5" strokeDasharray="5 4" fill="none" className="sp-cables">
        {variant.cables.map((d) => <path key={d} d={d} />)}
      </g>

      {/* Cameras and readers. */}
      <g className="sp-cam">
        {variant.cameras.map((camera) => (
          <circle key={camera.label} cx={camera.x} cy={camera.y} r="6" fill="#05224C" />
        ))}
      </g>
      <g className="sp-device">
        {variant.readers.map((reader) => (
          <rect key={reader.label} x={reader.x} y={reader.y} width="14" height="14" fill="#36CDFF" stroke="#05224C" strokeWidth="2" />
        ))}
      </g>

      {/* Labels. */}
      {variant.cameras.map((camera) =>
        tag(camera.x + camera.labelAt.x, camera.y + camera.labelAt.y, camera.label, camera.labelAnchor),
      )}
      {variant.readers.map((reader) => tag(reader.x + reader.labelAt.x, reader.y + reader.labelAt.y, reader.label, reader.labelAnchor))}
      {tag(variant.server.x, variant.server.y, variant.server.text)}
      {variant.zones.map((zone) => tag(zone.x, zone.y, zone.text))}

      {/* Legend. */}
      <g className="sp-label sp-label--legend">
        <rect x="340" y="392" width="180" height="46" fill="#fff" stroke="#05224C" />
        <text x="350" y="407" fontSize="10" letterSpacing="1" fill="#05224C" className="font-mono">SITE PLAN + THERMAL</text>
        <rect x="350" y="413" width="160" height="6" fill={`url(#${label}-heat-scale)`} />
        <text x="350" y="432" fontSize="7" letterSpacing=".5" fill="#05224C" fillOpacity="0.7" className="font-mono">COOL</text>
        <text x="510" y="432" fontSize="7" letterSpacing=".5" textAnchor="end" fill="#05224C" fillOpacity="0.7" className="font-mono">HEAT</text>
      </g>
    </svg>
  );
}
