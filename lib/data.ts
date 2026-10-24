// All catalog content lives here. Update this file to update the site.
// Anything marked PLACEHOLDER must be replaced with real data before launch.

export type Brand = { slug: string; name: string; blurb: string };
export const brands: Brand[] = [
  { slug: "zkteco", name: "ZKTeco", blurb: "Biometric access control, time attendance and security hardware." },
  { slug: "unifi", name: "UniFi", blurb: "Ubiquiti UniFi networking, Wi-Fi, switching and Protect cameras." },
  { slug: "ruijie", name: "Ruijie", blurb: "Enterprise Wi-Fi, switches and gateways with cloud management." },
  { slug: "mikrotik", name: "MikroTik", blurb: "RouterOS routers and switches for flexible, high-value networks." },
  { slug: "dahua", name: "Dahua", blurb: "CCTV cameras, NVRs and video surveillance systems." },
  { slug: "tiandy", name: "Tiandy", blurb: "AI-enabled IP cameras and video surveillance." },
  { slug: "d-link", name: "D-Link", blurb: "Reliable switching, routing and wireless for offices." },
  { slug: "cloud", name: "Cloud", blurb: "Cloud-managed networking and security products." },
];

export type Category = {
  slug: string;
  name: string;
  short: string;
  description: string;
  brands: string[];
  items: string[];
};
export const categories: Category[] = [
  {
    slug: "access-control",
    name: "Access Control",
    short: "Biometric, card and face readers for doors, gates and server rooms.",
    description:
      "Control who enters your building with fingerprint, face and card readers, door controllers, locks and software, installed and configured by our team.",
    brands: ["zkteco"],
    items: ["Fingerprint and face readers", "Card and RFID readers", "Door controllers and electric locks", "Access control software setup"],
  },
  {
    slug: "attendance-management",
    name: "Attendance Management",
    short: "Time and attendance terminals with payroll-ready reports.",
    description:
      "Biometric attendance terminals and software that record staff hours accurately and export reports for payroll.",
    brands: ["zkteco"],
    items: ["Biometric attendance terminals", "Face recognition attendance", "Attendance software and reports", "Multi-branch setup"],
  },
  {
    slug: "cctv-nvrs",
    name: "CCTV & NVRs",
    short: "IP cameras, NVRs and storage for round-the-clock monitoring.",
    description:
      "IP cameras, network video recorders, storage and remote viewing for offices, warehouses and factories.",
    brands: ["dahua", "tiandy", "unifi"],
    items: ["IP and PTZ cameras", "NVRs and storage", "Remote mobile viewing", "Site survey and cabling"],
  },
  {
    slug: "routers",
    name: "Routers",
    short: "Business routers with load balancing and VPN.",
    description: "Business-grade routers with load balancing, failover and secure VPN for connected offices.",
    brands: ["mikrotik", "ruijie", "d-link"],
    items: ["Multi-WAN load balancing", "Site-to-site VPN", "Firewall configuration"],
  },
  {
    slug: "switches-gateways",
    name: "Switches & Gateways",
    short: "Managed and PoE switches, plus gateways for secure networks.",
    description: "Managed and PoE switches and security gateways that keep cameras, phones and workstations online.",
    brands: ["unifi", "ruijie", "mikrotik", "d-link", "cloud"],
    items: ["PoE and managed switches", "Security gateways", "VLAN and network design"],
  },
  {
    slug: "it-racks",
    name: "IT Racks",
    short: "Wall and floor racks, cabling and tidy server rooms.",
    description: "Wall-mount and floor-standing racks with structured cabling, patch panels and cable management.",
    brands: [],
    items: ["Wall and floor racks", "Structured cabling", "Patch panels and cable management"],
  },
];

export const cities = [
  { slug: "karachi", name: "Karachi", note: "Head office in Saddar." },
  { slug: "hyderabad", name: "Hyderabad", note: "Installation and support across Hyderabad." },
  { slug: "sukkur", name: "Sukkur", note: "Installation and support across Sukkur." },
  { slug: "islamabad", name: "Islamabad", note: "Installation and support across Islamabad." },
];

// PLACEHOLDER: replace with real installations.
export const projects = [
  { title: "Corporate office", city: "Karachi", scope: "CCTV and access control", placeholder: true },
  { title: "Manufacturing facility", city: "Hyderabad", scope: "Attendance terminals and network", placeholder: true },
  { title: "Warehouse", city: "Sukkur", scope: "CCTV, NVR and structured cabling", placeholder: true },
  { title: "Multi-floor office", city: "Islamabad", scope: "Wi-Fi, switching and IT rack", placeholder: true },
];

// Only facts that are already true. Add "Installations completed" and "Years in business"
// here once you have real numbers.
export const stats = [
  { value: 8, suffix: "", label: "Official brands" },
  { value: 6, suffix: "", label: "System types we install" },
  { value: 4, suffix: "", label: "Cities served" },
];

export const faqs = [
  {
    q: "Are you an official dealer of the brands you sell?",
    a: "Yes. Zetta Tech is an official dealer for ZKTeco, UniFi, Ruijie, MikroTik, Dahua, Tiandy, D-Link and Cloud products.",
  },
  {
    q: "Do you install the equipment as well as supply it?",
    a: "Yes. We supply, install and configure every system, including cabling, rack setup and user training.",
  },
  {
    q: "Which cities do you serve?",
    a: "We are based in Saddar, Karachi, and install across Hyderabad, Sukkur, Islamabad and other cities.",
  },
  {
    q: "How do I get a quote?",
    a: "Message us on WhatsApp or email with your site type and requirements. We will reply with a plan and price.",
  },
];
