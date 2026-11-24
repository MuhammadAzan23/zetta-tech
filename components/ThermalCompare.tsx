/**
 * Before / after reveal for two thermal frames.
 *
 * Implemented as a native range input laid over the images: arrow keys, Home/End
 * and dragging all work out of the box, and screen readers announce it as a slider.
 * The visible track is hidden; only the handle is drawn.
 */
"use client";

import Image from "next/image";
import { useId, useState } from "react";

export default function ThermalCompare({
  before,
  after,
  beforeAlt,
  afterAlt,
  className = "",
  width,
  height,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  className?: string;
  width: number;
  height: number;
}) {
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <div className={`thermal-compare ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <Image
        src={before}
        alt={beforeAlt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, 640px"
        className="thermal-compare-img"
      />
      {/* The thermal frame is clipped to the handle position. */}
      <span className="thermal-compare-clip" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} aria-hidden="true">
        <Image src={after} alt="" width={width} height={height} sizes="(max-width: 768px) 100vw, 640px" className="thermal-compare-img" />
      </span>
      <span className="thermal-compare-handle" style={{ left: `${position}%` }} aria-hidden="true" />
      <label htmlFor={`${id}-range`} className="sr-only">
        Reveal the thermal camera image
      </label>
      <input
        id={`${id}-range`}
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-valuetext={`${position}% thermal image visible`}
        className="thermal-compare-range"
      />
      <span className="thermal-compare-tags" aria-hidden="true">
        <span>Camera</span>
        <span>Thermal</span>
      </span>
    </div>
  );
}
