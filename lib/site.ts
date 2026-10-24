// Central site config. TODO: replace placeholder contact details via .env.local
export const site = {
  name: "Zetta Tech",
  tagline: "Complete Security & Networking Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zettatech.example",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "923000000000",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+92 300 0000000",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "info@zettatech.example",
  address: {
    line: "V26H+75V, Saddar",
    city: "Karachi",
    region: "Sindh",
    country: "PK",
    full: "V26H+75V, Saddar, Karachi, Pakistan",
  },
  description:
    "Zetta Tech supplies, installs and configures access control, attendance management, CCTV and NVRs, routers, switches, gateways and IT racks for businesses, offices and factories in Karachi, Hyderabad, Sukkur and Islamabad.",
};

export function waLink(message = "Hello Zetta Tech, I would like a quote.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
