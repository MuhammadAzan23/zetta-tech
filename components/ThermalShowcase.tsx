import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import ThermalCompare from "./ThermalCompare";
import ThermalMap from "./ThermalMap";

/**
 * Thermal showcase.
 *
 * The real thermal frame is optional: drop `public/images/thermal-hero.webp` in and
 * it renders here. A second frame (`thermal-2.webp`) turns the panel into a
 * before/after slider. Until a frame exists the illustration ships instead, clearly
 * marked "Illustrative" so nobody mistakes a diagram for a real capture.
 *
 * The file check runs on the server at build time, so there is no layout shift and
 * no broken image request either way.
 */

const IMAGES = path.join(process.cwd(), "public", "images");
const HERO = path.join(IMAGES, "thermal-hero.webp");
const SECOND = path.join(IMAGES, "thermal-2.webp");

function exists(file: string) {
  try {
    return fs.statSync(file).size > 0;
  } catch {
    return false;
  }
}

/** Width/height are only used for the intrinsic ratio; the file itself is the truth. */
const FRAME = { width: 1600, height: 1000 };

export default function ThermalShowcase({ className = "" }: { className?: string }) {
  const hasHero = exists(HERO);
  const hasSecond = exists(SECOND);

  return (
    <figure className={`thermal-showcase ${className}`}>
      <div className="thermal-showcase-frame">
        {hasHero ? (
          hasSecond ? (
            <ThermalCompare
              before="/images/thermal-hero.webp"
              after="/images/thermal-2.webp"
              beforeAlt="Colour CCTV view of an office corridor from a ceiling camera"
              afterAlt="Thermal view of the same office corridor, with people and warm equipment shown in orange"
              {...FRAME}
            />
          ) : (
            <Image
              src="/images/thermal-hero.webp"
              alt="Thermal camera view of an office floor, with people and warm equipment picked out in orange against cooler blue surroundings"
              width={FRAME.width}
              height={FRAME.height}
              sizes="(max-width: 768px) 100vw, 640px"
              className="thermal-showcase-image"
            />
          )
        ) : (
          <ThermalMap className="thermal-showcase-image" />
        )}
      </div>

      <figcaption className="thermal-showcase-caption">
        <span className="thermal-showcase-label">{hasHero ? "Sample thermal image" : "Illustrative diagram"}</span>
        <span className="thermal-showcase-scale" aria-hidden="true">
          <span className="thermal-showcase-scale-track" />
          <span className="thermal-showcase-scale-ends">
            <span>Cool</span>
            <span>Warm</span>
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
