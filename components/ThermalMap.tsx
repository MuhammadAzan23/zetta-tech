// Illustrative thermal coverage map, used standalone (e.g. on category pages).
// Server component; the heat blooms in with CSS keyframes, so no JS is needed.
export default function ThermalMap({ className = "" }: { className?: string }) {
  return (
    <svg className={`${className} thermal-map`} viewBox="0 0 560 420" role="img" aria-label="Illustrative thermal coverage map of an office floor">
      <defs>
        <radialGradient id="thermal-h1" cx="78%" cy="18%" r="38%">
          <stop offset="0%" stopColor="#FF5A36" stopOpacity=".9" />
          <stop offset="45%" stopColor="#FFB020" stopOpacity=".55" />
          <stop offset="100%" stopColor="#36CDFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="thermal-h2" cx="22%" cy="72%" r="34%">
          <stop offset="0%" stopColor="#FF7A1A" stopOpacity=".85" />
          <stop offset="50%" stopColor="#36CDFF" stopOpacity=".35" />
          <stop offset="100%" stopColor="#05224C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="thermal-h3" cx="48%" cy="28%" r="30%">
          <stop offset="0%" stopColor="#FFE14A" stopOpacity=".7" />
          <stop offset="100%" stopColor="#36CDFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="thermal-scale" x1="0" x2="1">
          <stop offset="0" stopColor="#1B4DFF" />
          <stop offset=".35" stopColor="#36CDFF" />
          <stop offset=".65" stopColor="#FFB020" />
          <stop offset="1" stopColor="#FF5A36" />
        </linearGradient>
      </defs>
      <rect width="560" height="420" fill="#061325" />
      <g opacity=".25" stroke="#36CDFF" strokeWidth="1">
        <path d="M0 40H560M0 80H560M0 120H560M0 160H560M0 200H560M0 240H560M0 280H560M0 320H560M0 360H560" />
        <path d="M40 0V420M80 0V420M120 0V420M160 0V420M200 0V420M240 0V420M280 0V420M320 0V420M360 0V420M400 0V420M440 0V420M480 0V420M520 0V420" />
      </g>
      <g className="tm-heat">
        <ellipse cx="430" cy="78" rx="150" ry="110" fill="url(#thermal-h1)" />
        <ellipse cx="130" cy="300" rx="140" ry="100" fill="url(#thermal-h2)" />
        <ellipse cx="270" cy="120" rx="120" ry="90" fill="url(#thermal-h3)" />
      </g>
      <g className="tm-outline">
        <path d="M40 380H520V40H40V380" fill="none" stroke="#CFF1FF" strokeWidth="2" />
        <path d="M40 230H520M290 40V230M130 40V110H40" fill="none" stroke="#CFF1FF" strokeWidth="1.2" opacity=".7" />
      </g>
      <g className="tm-markers">
        <circle cx="508" cy="52" r="7" fill="#FF5A36" />
        <circle cx="52" cy="360" r="7" fill="#FFB020" />
        <circle cx="292" cy="50" r="7" fill="#36CDFF" />
      </g>
      <text x="48" y="32" fill="#CFF1FF" fontSize="11" fontFamily="IBM Plex Mono, monospace">THERMAL MAP · CAM COVERAGE</text>
      <text x="48" y="128" fill="#CFF1FF" fontSize="10" fontFamily="IBM Plex Mono, monospace">SERVER</text>
      <text x="48" y="214" fill="#CFF1FF" fontSize="10" fontFamily="IBM Plex Mono, monospace">OFFICE</text>
      <text x="316" y="214" fill="#CFF1FF" fontSize="10" fontFamily="IBM Plex Mono, monospace">OPEN AREA</text>
      <text x="48" y="292" fill="#CFF1FF" fontSize="10" fontFamily="IBM Plex Mono, monospace">LOBBY</text>
      <rect x="352" y="386" width="168" height="22" fill="#061325" />
      <rect x="360" y="392" width="152" height="8" fill="url(#thermal-scale)" />
      <text x="360" y="382" fill="#9BB4C9" fontSize="9" fontFamily="IBM Plex Mono, monospace">COOL → HEAT SIGNATURE</text>
    </svg>
  );
}
