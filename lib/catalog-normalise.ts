/**
 * Public-facing cleanup for imported catalog data.
 *
 * The catalog is imported from a distributor feed, so product names and category
 * labels arrive in inconsistent casing, some descriptions begin mid-sentence, and
 * a few access-control families are filed under the wrong category. This module
 * normalises all of that at read time, so no page can leak the raw values.
 *
 * It intentionally has no side effects and no I/O: `scripts/audit-catalog.js` uses
 * the same functions to produce data-audit.csv, so the report describes exactly what
 * the site renders.
 */

/** Canonical brand casing. Keyed by lowercase match. */
const BRAND_NAMES: Record<string, string> = {
  zkteco: "ZKTeco",
  ngteco: "ZKTeco",
  unifi: "UniFi",
  "ubiquiti unifi": "UniFi",
  ubiquiti: "Ubiquiti",
  mikrotik: "MikroTik",
  "huawei ekit": "Huawei eKit",
  "huawei-ekit": "Huawei eKit",
  huawei: "Huawei",
  dahua: "Dahua",
  imou: "IMOU",
  ruijie: "Ruijie",
  "ruijie networks": "Ruijie",
  cisco: "Cisco",
  vsol: "VSOL",
  "ai-tek": "Ai-Tek",
  "ruijie reyee": "Reyee",
  reyee: "Reyee",
};

/** Distributor / supplier names that must never appear on a public page. */
const SUPPLIER_NAMES = ["Microtech", "Microlink", "Cdata", "Dinstar", "Corning", "Schneider", "Linksys", "DigiMax", "DGMax"];

/**
 * Single-word brand tokens that need capitalisation inside a title.
 * Ordered longest-first so "HUAWEI" is replaced before "HUAWEI EKIT" could split.
 */
const TITLE_TOKENS: [RegExp, string][] = [
  [/\bZKTeco\b/gi, "ZKTeco"],
  [/\bNGTeco\b/gi, "ZKTeco"],
  [/\bUniFi\b/gi, "UniFi"],
  [/\bUBIQUITI\b/gi, "Ubiquiti"],
  [/\bUbiquiti\b/g, "Ubiquiti"],
  [/\bMIKROTIK\b/gi, "MikroTik"],
  [/\bMikrotik\b/g, "MikroTik"],
  [/\bHUAWEI\b/g, "Huawei"],
  [/\bHuawei\b/g, "Huawei"],
  [/\bekit\b/gi, "eKit"],
  [/\bDAHUA\b/gi, "Dahua"],
  [/\bIMOU\b/gi, "IMOU"],
  [/\bHIKVISION\b/gi, "Hikvision"],
  // "Ruijie Networks" is the company; the brand people search for is "Ruijie".
  [/\bRuijie\s+Networks\b/gi, "Ruijie"],
  [/\bRUIJIE\b/gi, "Ruijie"],
  [/\bREYEE\b/gi, "Reyee"],
  [/\bPOE\b/g, "PoE"],
  [/\bNVR\b/g, "NVR"],
  [/\bDVR\b/g, "DVR"],
  [/\bIP65\b/g, "IP65"],
  [/\bIP66\b/g, "IP66"],
  [/\bIP67\b/g, "IP67"],
  [/\bWi[‑-]Fi\b/g, "Wi-Fi"],
  [/\bGB\b/g, "GB"],
];

/** Lowercase tokens that must not be title-cased (units, model fragments). */
const KEEP_LOWER = new Set(["mm", "kg", "mp", "mpa", "ch", "km", "mhz", "ghz", "poe", "a", "v", "w", "x"]);

/**
 * Ordinary English words that should be title-cased when the feed shouts them.
 * A whitelist rather than "anything upper-case", because most all-cap tokens in
 * this feed are model numbers (USW, RG-EST310, IPC-K6C) that must stay as they are.
 */
const TITLE_WORDS = new Set([
  "switch", "switches", "server", "rack", "cable", "cables", "cabinet", "port", "ports",
  "media", "single", "double", "channel", "battery", "magnet", "sensor", "barrier", "gate",
  "reader", "card", "signal", "light", "new", "value", "free", "standing", "data", "pro",
  "series", "outdoor", "indoor", "wireless", "gateway", "router", "camera", "power", "supply",
  "adapter", "injector", "mount", "kit", "licence", "license", "bridge", "extender", "box",
]);

function isModelToken(token: string) {
  // Model numbers: has a digit and mixed letters/digits (BG1030, F22P-D, IPC-K6C).
  return /\d/.test(token) && /[A-Za-z]/.test(token);
}

/** Capitalise a single word while leaving model numbers and units alone. */
function titleWord(word: string, forceLowerTail = false) {
  if (!word) return word;
  if (KEEP_LOWER.has(word.toLowerCase())) return word.toLowerCase();
  if (isModelToken(word)) return word.toUpperCase() === word && word.length <= 4 ? word : word;
  // Words already in SHOUTING case get normalised; mixed case is respected.
  const isShout = word === word.toUpperCase() && /[A-Z]/.test(word);
  if (!isShout && !forceLowerTail) return word;
  const lower = word.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Normalise brand casing in free text (titles, category labels). */
export function normaliseBrands(text: string) {
  let output = text;
  for (const [pattern, replacement] of TITLE_TOKENS) output = output.replace(pattern, replacement);
  return output;
}

/**
 * Normalise a product title: brand casing, PoE/acronym casing, collapsed spaces,
 * no trailing separators. Also removes a leading supplier name if present.
 */
export function normaliseTitle(raw: string) {
  let title = normaliseBrands((raw ?? "").replace(/\s+/g, " ").trim());
  for (const supplier of SUPPLIER_NAMES) {
    title = title.replace(new RegExp(`^${supplier}\\s*[-|·:]?\\s*`, "i"), "");
  }
  // Fix shouted ordinary words ("SWITCH" → "Switch"); leave model numbers alone.
  title = title
    .split(" ")
    .map((word) => {
      if (!/^[A-Z][A-Z]+$/.test(word)) return word;
      if (isModelToken(word)) return word;
      if (!TITLE_WORDS.has(word.toLowerCase())) return word;
      return titleWord(word, true);
    })
    .join(" ");
  return title.replace(/\s*[|·]\s*$/, "").trim();
}

/** Normalise a category label for display. */
export function normaliseCategoryName(raw: string) {
  const name = normaliseBrands((raw ?? "").trim());
  if (/^unifi\b/i.test(name)) return name.replace(/^unifi\b/i, "UniFi");
  if (/^digital signage$/i.test(name)) return "Digital Signage";
  return name;
}

/**
 * Category corrections: products that belong to Access Control but were filed
 * under another category in the source feed. Matched on the product name.
 *
 * Metal detectors stay in Security Inspection Devices — that is what they are.
 */
const ACCESS_CONTROL_MOVES: { pattern: RegExp; category: string }[] = [
  { pattern: /magnetic\s*lock|electro\s*magnetic\s*lock|electromagnetic|\blm[-\s]?(?:2805|series)\b|\bcm[-\s]?280s\b|\bac0\d[-\s]?am\d+/i, category: "Access Control" },
  { pattern: /\bbarrier\b|\bboom\b|\bturnstile\b|\bflap\b|swing\s*barrier|parking\s*barrier|\bbg\d{3,4}\b/i, category: "Access Control" },
  { pattern: /\bexit\s*button\b|door\s*sensor|door\s*lock|smart\s*lock|hotel\s*lock|glass\s*door|magnet\s*sensor/i, category: "Access Control" },
  { pattern: /\breader\b|proximity\s*card|rfid\s*(?:card|tag|reader)/i, category: "Access Control" },
];

/** True when a product should be re-filed under Access Control. */
export function accessControlOverride(productName: string) {
  return ACCESS_CONTROL_MOVES.find((rule) => rule.pattern.test(productName))?.category ?? null;
}

/**
 * Category inference from the product title.
 *
 * About one in ten products carries only a brand as its category in the feed, so a
 * card would otherwise read "Ubiquiti · Ubiquiti". These rules give those a real
 * product type. Ordered so the more specific pattern wins.
 */
const CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
  { pattern: /x-?ray|baggage\s*scanner|metal\s*detector/i, category: "Security Inspection" },
  { pattern: /\btime\s*attendance\b|fingerprint\s*scanner/i, category: "Time Attendance" },
  { pattern: /access\s*control\s*panel|\binbio\b|\bc3[-\s]?\d{3}\b|\bc3[-\s]\d{2}\b|uhf\s*reader|card\s*reader|rfid\s*reader|access\s*control|turnstile|barrier/i, category: "Access Control" },
  { pattern: /\bptz\b|\bcamera\b|\bcctv\b/i, category: "CCTV Cameras" },
  { pattern: /\bnvr\b|\bdvr\b|\bxvr\b|video\s*recorder/i, category: "Video Recorders" },
  { pattern: /\bfirewall\b|security\s*gateway|\bug\b|\brouter\b|\brouterboard\b|\bedgepoint\b|\bdream\s*machine\b/i, category: "Routers & Gateways" },
  { pattern: /\bswitch\b|\bswitches\b/i, category: "Switches" },
  { pattern: /\baccess\s*point\b|\bwifi\s*extender\b|\boutdoor\s*ap\b|\bwireless\s*bridge\b|\bairmax\b|\bunifi\s*(?:6|lite|u6|u7)\b/i, category: "Wireless & Access Points" },
  { pattern: /\bpoe\s*(?:adapter|injector)\b|\bpower\s*(?:supply|adapter)\b/i, category: "Power & PoE" },
  { pattern: /\bsfp\b|\bcable\b|\bpatch\b/i, category: "Cabling & Fiber" },
  { pattern: /\bbattery\b|\btag\b/i, category: "Accessories" },
];

/** Best-guess category for a product that has no usable category of its own. */
export function inferCategory(productName: string) {
  return CATEGORY_RULES.find((rule) => rule.pattern.test(productName))?.category ?? null;
}

/**
 * The feed has 57 overlapping category names for what is really a dozen product
 * types ("Camera", "Network Cameras", "HDCVI Cameras", "Imou Security"). Cards show
 * one of these canonical labels so a grid reads consistently. The catalog's own
 * category pages keep their individual names.
 */
const CANONICAL_CATEGORIES: { pattern: RegExp; label: string }[] = [
  { pattern: /inspection|metal\s*detector/i, label: "Security Inspection" },
  { pattern: /time\s*attendance/i, label: "Time Attendance" },
  { pattern: /access\s*control|walk\s*through/i, label: "Access Control" },
  { pattern: /camera|surveillance|hdcvi|imou\s*security/i, label: "CCTV Cameras" },
  { pattern: /rack|cabinet|enclosure|wall\s*box/i, label: "Racks & Enclosures" },
  { pattern: /cable|patch|fiber|optical|sfp|odf|splitter|connector/i, label: "Cabling & Fiber" },
  { pattern: /power|poe\s*adapter|adapter|pdu/i, label: "Power & PoE" },
  { pattern: /router|routerboard|firewall|gateway|reyeegateway/i, label: "Routers & Gateways" },
  { pattern: /switch|ethernet|gigabit/i, label: "Switches" },
  { pattern: /access\s*point|wireless|antenna|unifi\b|uisp|60\s*ghz|ekitengine|wireless\s*system/i, label: "Wireless & Access Points" },
  { pattern: /accessor|tool/i, label: "Accessories" },
];

/** Canonical label for a feed category name, or null when it is only a brand. */
export function canonicalCategory(name: string) {
  const clean = normaliseCategoryName(scrubSuppliers(name));
  if (!clean) return null;
  const match = CANONICAL_CATEGORIES.find((rule) => rule.pattern.test(clean));
  return match ? match.label : null;
}

/**
 * When a product sits in several categories, the card shows the most specific one.
 * Time attendance beats "inspection" for a terminal; inspection beats camera for a
 * metal detector that happens to be filed under a camera category too.
 */
export const CATEGORY_PRIORITY = [
  "Time Attendance",
  "Security Inspection",
  "Access Control",
  "Video Recorders",
  "CCTV Cameras",
  "Racks & Enclosures",
  "Cabling & Fiber",
  "Power & PoE",
  "Routers & Gateways",
  "Switches",
  "Wireless & Access Points",
  "Accessories",
];

/**
 * Cut a description that begins mid-sentence.
 *
 * The feed sometimes starts an excerpt partway through ("he ZKTeco InBio460 Pro is…",
 * "incorporating Ubiquiti's…"). If the first character is lowercase, we drop the first
 * partial word/sentence and start at the first real sentence boundary. Returns "" when
 * nothing usable remains, so callers can omit the paragraph entirely.
 */
export function cleanDescription(raw: string) {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  // Drop parenthetical distributor notes like "(a brand of ZKTeco)": they repeat the
  // brand the card already shows, and after normalisation they read as
  // "ZKTeco (a brand of ZKTeco)".
  let working = text.replace(/\s*\((?:an?\s+)?(?:sub-?)?brand\s+of[^)]*\)/gi, "");
  // Strip a leading partial sentence when the text starts mid-word.
  if (/^[a-z]/.test(working)) {
    const boundary = working.search(/[.!?]\s+[A-Z]/);
    if (boundary === -1) return "";
    working = working.slice(boundary + 1).trim();
  }
  // A fragment with no sentence terminator and no closing mark reads as cut off.
  const endsCleanly = /[.!?)"\]]$/.test(working);
  if (!endsCleanly) {
    const lastStop = Math.max(working.lastIndexOf(". "), working.lastIndexOf("! "), working.lastIndexOf("? "));
    if (lastStop > 60) {
      working = working.slice(0, lastStop + 1);
    } else if (/[a-z,]$/.test(working) && /\s/.test(working)) {
      // Still unfinished: drop a short trailing partial word so it does not end mid-word.
      const lastSpace = working.lastIndexOf(" ");
      const tail = working.slice(lastSpace + 1);
      if (tail.length < 24) working = working.slice(0, lastSpace).replace(/[,:\s]+$/, "");
    }
  }
  return normaliseBrands(decodeEntities(working)).replace(/\s+/g, " ").trim();
}

/** Decode the handful of HTML entities the feed leaves behind. */
function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&hellip;/g, "…");
}

/**
 * True when the raw text is only the middle of a sentence — the feed started the
 * excerpt partway through ("he ZKTeco InBio460 Pro is…", "incorporating Ubiquiti's…").
 */
export function isDescriptionFragment(raw: string) {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return false;
  return /^[a-z]/.test(text);
}

/** A short teaser: first sentence of a clean description, capped. */
export function teaser(text: string, limit = 160) {
  const clean = cleanDescription(text);
  if (!clean) return "";
  const firstStop = clean.search(/[.!?]\s/);
  const sentence = firstStop === -1 ? clean : clean.slice(0, firstStop + 1);
  if (sentence.length <= limit) return sentence;
  const cut = sentence.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : limit).trim()}…`;
}

/** Remove supplier names from any public string. */
export function scrubSuppliers(text: string) {
  let output = text;
  for (const supplier of SUPPLIER_NAMES) {
    output = output.replace(new RegExp(`\\b${supplier}\\b\\s*[·|,/]?\\s*`, "gi"), "");
  }
  return output.replace(/\s{2,}/g, " ").trim();
}
