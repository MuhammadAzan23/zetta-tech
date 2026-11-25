export type Brand = { slug: string; name: string; blurb: string };
export const brands: Brand[] = [
  { slug: "zkteco", name: "ZKTeco", blurb: "Main supplier. Biometric access control, time attendance and security hardware." },
  { slug: "ubiquiti", name: "Ubiquiti", blurb: "UniFi networking, Wi-Fi, switching and Protect cameras." },
  { slug: "ruijie-networks", name: "Ruijie", blurb: "Enterprise Wi-Fi, switches and gateways with cloud management." },
  { slug: "mikrotik", name: "MikroTik", blurb: "RouterOS routers and switches for flexible, high-value networks." },
  { slug: "dahua", name: "Dahua", blurb: "CCTV cameras, NVRs and video surveillance systems." },
  { slug: "imou", name: "IMOU", blurb: "Wi-Fi and PoE cameras for offices and smaller sites." },
  { slug: "huawei-ekit", name: "Huawei eKit", blurb: "eKit access points, switches and security gateways." },
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
    short: "Face, fingerprint and RFID readers for doors, gates and server rooms.",
    description:
      "Control who enters your building with fingerprint, face and card readers, door controllers, locks and software, installed and configured by our team.",
    brands: ["zkteco"],
    items: ["Fingerprint and face readers", "Card and RFID readers", "Door controllers and electric locks", "Access control software setup"],
  },
  {
    slug: "attendance-management",
    name: "Attendance",
    short: "Visible-light terminals and payroll-ready reports.",
    description:
      "Biometric attendance terminals and software that record staff hours accurately and export reports for payroll.",
    brands: ["zkteco"],
    items: ["Biometric attendance terminals", "Face recognition attendance", "Attendance software and reports", "Multi-branch setup"],
  },
  {
    slug: "cctv-nvrs",
    name: "CCTV & thermal",
    short: "IP cameras, NVRs and heat mapping for round-the-clock monitoring.",
    description:
      "IP cameras, network video recorders, storage, remote viewing and illustrative thermal coverage maps for offices, warehouses and factories.",
    brands: ["dahua", "imou", "ubiquiti"],
    items: ["IP and PTZ cameras", "NVRs and storage", "Thermal coverage planning", "Site survey and cabling"],
  },
  {
    slug: "networking",
    name: "Networking",
    short: "Routers, PoE switches and Wi-Fi for cameras and offices.",
    description: "Business-grade routers, PoE switches and access points that keep cameras, readers and workstations online.",
    brands: ["ruijie-networks", "mikrotik", "ubiquiti", "huawei-ekit"],
    items: ["PoE and managed switches", "Business routers and VPN", "Wi-Fi access points", "VLAN and network design"],
  },
  {
    slug: "it-racks",
    name: "Racks",
    short: "Wall and floor racks, labelled cabling and tidy server rooms.",
    description: "Wall-mount and floor-standing racks with structured cabling, patch panels and cable management.",
    brands: [],
    items: ["Wall and floor racks", "Structured cabling", "Patch panels and cable management"],
  },
];

export const cities = [
  { slug: "karachi", name: "Karachi", note: "Head office in Saddar." },
];

export const stats = [
  { value: 7, suffix: "", label: "Catalog brands" },
  { value: 5, suffix: "", label: "System types we install" },
  { value: 1, suffix: "", label: "Karachi office" },
];

export const faqs = [
  {
    q: "Which products can I request a quote for?",
    a: "You can request a quote for any product in our focused catalog — ZKTeco first, plus Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit. Tap a product to open WhatsApp with the model details filled in.",
  },
  {
    q: "Do you install the equipment as well as supply it?",
    a: "Yes. We supply, install and configure every system, including cabling, rack setup and user training.",
  },
  {
    q: "Where do you install?",
    a: "We are based in Saddar, Karachi, and provide supply, installation and support for sites across Karachi.",
  },
  {
    q: "How do I get a quote?",
    a: "Message us on WhatsApp or email with the product name, or tap any catalog item. We prefill the product, brand, category and details for you.",
  },
];
