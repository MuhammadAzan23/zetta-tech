/**
 * Layout data for the illustrative site plans.
 *
 * One shape, three sites: the home hero uses "office", the demo on the products
 * page can switch between all three. Everything is on a 560 x 450 grid, so the
 * renderer never needs to know which plan it is drawing.
 *
 * These are diagrams, not survey drawings. They exist to show how cameras, readers
 * and cabling relate to a floor, and the counts they produce are labelled as
 * estimates wherever they appear.
 */

export type PlanPoint = { x: number; y: number };

export type PlanCamera = PlanPoint & {
  /** Coverage triangle, in grid coordinates, from the camera outward. */
  cone: [PlanPoint, PlanPoint];
  label: string;
  /** Where the label sits, relative to the camera. */
  labelAt: PlanPoint;
  labelAnchor?: "start" | "end";
};

export type PlanReader = PlanPoint & { label: string; labelAt: PlanPoint; labelAnchor?: "start" | "end" };

export type PlanVariant = {
  id: "office" | "factory" | "warehouse";
  name: string;
  blurb: string;
  /** Accessible description of the drawing. */
  alt: string;
  walls: string[];
  partitions: string[];
  /** Door swing arcs. */
  doors: string[];
  /** Solid blocks: racks, plant, machinery. */
  blocks: { x: number; y: number; width: number; height: number }[];
  /** LED strips on the blocks. */
  leds: string[];
  cables: string[];
  cameras: PlanCamera[];
  readers: PlanReader[];
  zones: { x: number; y: number; text: string }[];
  /** Server / control room caption. */
  server: { x: number; y: number; text: string };
};

const OFFICE: PlanVariant = {
  id: "office",
  name: "Office",
  blurb: "Reception, open floor and a server room. Cameras cover the entrance and the desks.",
  alt: "Illustrative office plan with three cameras covering the entrance, lobby and open floor, two door readers, and cabling back to a server room",
  walls: ["M300 380H520V40H40V380H240"],
  partitions: ["M40 240H150M200 240H380M430 240H520M300 40V120M300 160V240M130 40V110H40"],
  doors: ["M300 380V320M240 380A60 60 0 0 1 300 320"],
  blocks: [
    { x: 50, y: 48, width: 28, height: 52 },
    { x: 86, y: 48, width: 28, height: 52 },
  ],
  leds: ["M54 58H74M54 66H74M54 74H74M90 58H110M90 66H110M90 74H110"],
  cables: ["M130 84H292V56", "M130 94H508V58", "M64 110V366", "M130 100H175V232"],
  cameras: [
    { x: 508, y: 52, cone: [{ x: 332, y: 62 }, { x: 382, y: 236 }], label: "CAM 01", labelAt: { x: -6, y: -16 }, labelAnchor: "end" },
    { x: 52, y: 366, cone: [{ x: 252, y: 268 }, { x: 252, y: 372 }], label: "CAM 02", labelAt: { x: 8, y: 26 } },
    { x: 292, y: 50, cone: [{ x: 146, y: 238 }, { x: 290, y: 238 }], label: "CAM 03", labelAt: { x: -6, y: -16 }, labelAnchor: "end" },
  ],
  readers: [
    { x: 168, y: 232, label: "READER 01", labelAt: { x: 20, y: 26 } },
    { x: 306, y: 366, label: "READER 02", labelAt: { x: 20, y: -10 } },
  ],
  zones: [
    { x: 48, y: 212, text: "OFFICE" },
    { x: 316, y: 212, text: "OPEN AREA" },
    { x: 48, y: 290, text: "LOBBY" },
    { x: 48, y: 128, text: "SERVER ROOM" },
  ],
  server: { x: 48, y: 146, text: "SW-01" },
};

const FACTORY: PlanVariant = {
  id: "factory",
  name: "Factory",
  blurb: "Production hall, loading bay and a control room. Cameras watch the line and the gate.",
  alt: "Illustrative factory plan with four cameras covering the production line, loading bay and gate, two door readers, and cabling back to a control room",
  walls: ["M40 400H520V50H40V400"],
  partitions: ["M40 120H180M180 50V120M420 120H520M420 120V400M220 400V300H320V400"],
  doors: ["M420 400V330M420 400A70 70 0 0 0 350 400"],
  blocks: [
    { x: 70, y: 150, width: 120, height: 26 },
    { x: 70, y: 196, width: 120, height: 26 },
    { x: 70, y: 242, width: 60, height: 26 },
    { x: 152, y: 242, width: 38, height: 26 },
  ],
  leds: ["M78 163H182M78 209H182M78 255H122M160 255H182"],
  cables: ["M190 163H500V78", "M190 209H470V78", "M150 268V330H262", "M430 300V330"],
  cameras: [
    { x: 508, y: 62, cone: [{ x: 236, y: 90 }, { x: 300, y: 272 }], label: "CAM 01", labelAt: { x: -6, y: -16 }, labelAnchor: "end" },
    { x: 52, y: 62, cone: [{ x: 210, y: 128 }, { x: 190, y: 268 }], label: "CAM 02", labelAt: { x: 10, y: 22 } },
    { x: 508, y: 300, cone: [{ x: 330, y: 300 }, { x: 430, y: 390 }], label: "CAM 03", labelAt: { x: -6, y: -16 }, labelAnchor: "end" },
    { x: 262, y: 388, cone: [{ x: 336, y: 330 }, { x: 372, y: 396 }], label: "CAM 04", labelAt: { x: -10, y: -10 }, labelAnchor: "end" },
  ],
  readers: [
    { x: 180, y: 336, label: "READER 01", labelAt: { x: -10, y: 24 }, labelAnchor: "end" },
    { x: 420, y: 330, label: "READER 02", labelAt: { x: 22, y: -8 } },
  ],
  zones: [
    { x: 60, y: 300, text: "PRODUCTION" },
    { x: 236, y: 320, text: "DISPATCH" },
    { x: 430, y: 92, text: "CTRL ROOM" },
  ],
  server: { x: 430, y: 110, text: "SW-01" },
};

const WAREHOUSE: PlanVariant = {
  id: "warehouse",
  name: "Warehouse",
  blurb: "Racking rows, wide aisles and a loading dock. Cameras cover the dock and each aisle end.",
  alt: "Illustrative warehouse plan with four cameras covering the loading dock and aisle ends, two door readers, and cabling back to an office",
  walls: ["M40 400H520V50H40V400"],
  partitions: ["M40 120H520M400 120V400"],
  doors: ["M60 400V340M120 400A60 60 0 0 0 60 340", "M120 400V340"],
  blocks: [
    { x: 70, y: 160, width: 240, height: 34 },
    { x: 70, y: 220, width: 240, height: 34 },
    { x: 70, y: 280, width: 240, height: 34 },
    { x: 430, y: 180, width: 60, height: 120 },
  ],
  leds: ["M80 177H300M80 237H300M80 297H300M440 190H480M440 210H480M440 230H480"],
  cables: ["M330 177H470V150", "M330 237H450V150", "M330 297H440V330", "M150 314V336H330"],
  cameras: [
    { x: 508, y: 62, cone: [{ x: 250, y: 100 }, { x: 320, y: 330 }], label: "CAM 01", labelAt: { x: -6, y: -16 }, labelAnchor: "end" },
    { x: 52, y: 62, cone: [{ x: 210, y: 140 }, { x: 200, y: 300 }], label: "CAM 02", labelAt: { x: 10, y: 22 } },
    { x: 52, y: 330, cone: [{ x: 150, y: 350 }, { x: 150, y: 396 }], label: "CAM 03", labelAt: { x: 10, y: -8 } },
    { x: 330, y: 344, cone: [{ x: 66, y: 386 }, { x: 160, y: 396 }], label: "CAM 04", labelAt: { x: 12, y: 26 } },
  ],
  readers: [
    { x: 120, y: 340, label: "READER 01", labelAt: { x: 18, y: -10 } },
    { x: 400, y: 300, label: "READER 02", labelAt: { x: -10, y: -10 }, labelAnchor: "end" },
  ],
  zones: [
    { x: 60, y: 146, text: "RACKING A-C" },
    { x: 60, y: 384, text: "LOADING DOCK" },
    { x: 408, y: 332, text: "OFFICE" },
  ],
  server: { x: 408, y: 150, text: "SW-01" },
};

export const planVariants: PlanVariant[] = [OFFICE, FACTORY, WAREHOUSE];

export function planVariant(id: PlanVariant["id"]) {
  return planVariants.find((variant) => variant.id === id) ?? OFFICE;
}

/**
 * Counts for a variant. Switch ports round up to a real switch size, because a
 * camera plus a reader never lands on exactly eight ports.
 */
export function planCounts(variant: PlanVariant) {
  const cameras = variant.cameras.length;
  const readers = variant.readers.length;
  const devices = cameras + readers;
  const portSizes = [8, 16, 24];
  const ports = portSizes.find((size) => size >= devices + 2) ?? 48;
  return { cameras, readers, ports };
}


