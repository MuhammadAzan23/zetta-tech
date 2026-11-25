/** A configured origin, or null when it is missing or still a placeholder. */
function configuredOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  if (!raw) return null;
  // The template value in .env.example must never reach production: it would make
  // every canonical tag point at a domain nobody owns.
  if (/\.example$/i.test(new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname)) return null;
  return raw;
}

export const site = {
  name: "Zetta Tech",
  tagline: "Complete Security & Networking Solutions",
  /**
   * Canonical origin. Canonical tags, og:url, the sitemap and robots.txt all build
   * from this, so a wrong value here quietly tells search engines that the real
   * pages are copies of a domain nobody owns.
   *
   * Precedence: a real NEXT_PUBLIC_SITE_URL; otherwise Vercel's own production URL,
   * so a deploy whose variable is unset or still the .example placeholder is still
   * correct; the placeholder is the last resort for local builds only.
   */
  url:
    configuredOrigin() ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://zettatech.example"),
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
    "Zetta Tech supplies, installs and configures ZKTeco attendance and access control, plus CCTV, thermal mapping and networking, for businesses, offices and factories in Karachi. We also supply Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit.",
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

/**
 * The one brand message, used by the top bar, the hero, the brand section and the
 * brands page. Written once here so those places cannot drift apart, and so no page
 * can quietly upgrade "main supplier" into a dealership claim: no dealer certificate
 * is recorded in CONTENT-SOURCES.md, so "Official" and "Authorized" must not appear.
 */
export const brandLine = {
  /** Top bar. Names the position and the location. */
  topbar: "ZKTeco main supplier · Saddar, Karachi",
  /** Hero eyebrow: the two systems ZKTeco is actually known for here. */
  eyebrow: "ZKTeco attendance and access control · Karachi",
  /** Full brand list, as a sentence fragment. */
  full: "ZKTeco, Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit",
  /** Lead sentence for the brands page and brand sections. */
  lead: "ZKTeco is our main supplier. We also supply Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit in Karachi.",
  /** The one-line version of "and everything else we supply". */
  also: "We also supply Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit",
  /** Hero supporting sentence. */
  heroSubtitle:
    "We supply, install and configure ZKTeco systems, and also supply Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit.",
};

/** Absolute URL for a site path, so messages carry a link that opens anywhere. */
export function absoluteUrl(pathname: string) {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const base = site.url.replace(/\/$/, "");
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function waLink(message = "Hello Zetta Tech, I would like a quote.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * WhatsApp caps a wa.me `text` parameter. Around 1,500 characters is the safe
 * ceiling forevery client; longer messages are truncated by the app, so anything
 * above this is split into numbered parts instead of being silently cut off.
 */
const WA_TEXT_LIMIT = 1500;

/** Split a long message on paragraph boundaries, never mid-word. */
export function splitWhatsAppMessage(message: string, limit = WA_TEXT_LIMIT) {
  if (message.length <= limit) return [message];

  const paragraphs = message.split(/\n{2,}/);
  const parts: string[] = [];
  let current = "";

  const push = () => {
    if (current.trim()) parts.push(current.trim());
    current = "";
  };

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= limit) {
      current = candidate;
      continue;
    }
    push();
    if (paragraph.length <= limit) {
      current = paragraph;
      continue;
    }
    // A single paragraph longer than the limit: break on sentence, then on space.
    let rest = paragraph;
    while (rest.length > limit) {
      let cut = rest.lastIndexOf(". ", limit);
      if (cut < limit * 0.5) cut = rest.lastIndexOf(" ", limit);
      if (cut < limit * 0.5) cut = limit;
      parts.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    current = rest;
  }
  push();

  return parts.map((part, index) => `Part ${index + 1} of ${parts.length}\n\n${part}`);
}

export type QuoteInput = {
  name: string;
  brand?: string;
  category?: string;
  details?: string;
  quantity?: number;
  url?: string;
};

/** The message body shared by product cards and product pages. */
export function productQuoteMessage(input: QuoteInput) {
  const details = (input.details ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  return [
    "Hello Zetta Tech, I want a quote for this product:",
    "",
    `Product: ${input.name}`,
    `Brand: ${input.brand ?? "—"}`,
    `Category: ${input.category ?? "—"}`,
    `Quantity: ${quantity}`,
    `Link: ${input.url ? absoluteUrl(input.url) : "—"}`,
    "",
    `Details: ${details || "—"}`,
    "",
    "Please share price and availability.",
  ].join("\n");
}

export function productWaLink(input: QuoteInput) {
  return waLink(productQuoteMessage(input));
}

/** wa.me links for a product, one per part when the text is too long. */
export function productWaParts(input: QuoteInput) {
  return splitWhatsAppMessage(productQuoteMessage(input)).map((part) => waLink(part));
}
