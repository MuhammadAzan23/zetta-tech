export const site = {
  name: "Zetta Tech",
  tagline: "Complete Security & Networking Solutions",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zettatech.example",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "923070026015",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+92 307 0026015",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "zettatech.sales@gmail.com",
  address: {
    line: "V26H+75V, Saddar",
    city: "Karachi",
    region: "Sindh",
    country: "PK",
    full: "V26H+75V, Saddar, Karachi, Pakistan",
  },
  description:
    "Zetta Tech supplies, installs and configures ZKTeco access control, attendance, CCTV, thermal mapping and networking for businesses, offices and factories in Karachi.",
  /**
   * Attendance estimate.
   *
   * TODO: confirm against real quotes. ZKTeco terminals are sized by peak flow at an
   * entrance rather than headcount, so this is a planning figure, not a published rate.
   */
  attendance: {
    /** Staff per terminal at one entrance. */
    employeesPerTerminal: 40,
    /** Every site needs at least this many terminals for the main entrance. */
    minTerminals: 1,
  },
};

export function waLink(message = "Hello Zetta Tech, I would like a quote.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productWaLink(input: { name: string; brand?: string; category?: string; details?: string }) {
  const details = (input.details ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
  return waLink(
    `Hello Zetta Tech, I want a quote for this product:\n\nProduct: ${input.name}\nBrand: ${input.brand ?? "—"}\nCategory: ${input.category ?? "—"}\nDetails: ${details || "—"}\n\nPlease share price and availability.`
  );
}
