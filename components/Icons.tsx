export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 0c.8 6.2 5.8 11.2 12 12-6.2.8-11.2 5.8-12 12-.8-6.2-5.8-11.2-12-12C6.2 11.2 11.2 6.2 12 0z" />
    </svg>
  );
}
export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <path d="M2 12c8-12 16-12 24 0s16 12 24 0 16-12 28 0" />
    </svg>
  );
}
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function WhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.4z" />
    </svg>
  );
}
export function CategoryIcon({ slug, className = "" }: { slug: string; className?: string }) {
  const p = { className, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (slug) {
    case "access-control":
      return (<svg {...p}><rect x="12" y="22" width="24" height="18" rx="3" /><path d="M17 22v-6a7 7 0 0 1 14 0v6" /><circle cx="24" cy="31" r="2" /></svg>);
    case "attendance-management":
      return (<svg {...p}><circle cx="24" cy="24" r="16" /><path d="M24 14v10l7 4" /></svg>);
    case "cctv-nvrs":
      return (<svg {...p}><path d="M6 16l26-6 4 12-26 6z" /><path d="M32 22l10 4v6l-8-3" /><path d="M14 30l-2 10h8" /></svg>);
    case "routers":
      return (<svg {...p}><rect x="6" y="26" width="36" height="12" rx="3" /><path d="M14 32h.01M20 32h.01M16 22a12 12 0 0 1 16 0M12 17a19 19 0 0 1 24 0" /></svg>);
    case "switches-gateways":
      return (<svg {...p}><rect x="5" y="18" width="38" height="12" rx="2" /><path d="M11 24h.01M17 24h.01M23 24h.01M29 24h.01M35 24h.01M11 12v6M37 12v6M11 30v6M37 30v6" /></svg>);
    default:
      return (<svg {...p}><rect x="12" y="6" width="24" height="36" rx="2" /><path d="M16 14h16M16 22h16M16 30h16" /></svg>);
  }
}
