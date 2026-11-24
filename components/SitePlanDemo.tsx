"use client";

import { useState } from "react";
import PlanSvg from "./PlanSvg";
import { planCounts, planVariants, type PlanVariant } from "@/lib/site-plans";

/**
 * Interactive site-plan demo.
 *
 * Pick a site type and the plan redraws for it: walls trace, cones bloom from each
 * camera, cabling marches and the labels settle — all by CSS keyframes that restart
 * because the SVG is re-keyed on the variant id. Counts beside the plan are computed
 * from the same data that draws it, and labelled as an estimate.
 *
 * Tabs follow the standard pattern: arrow keys move between them, selection follows
 * focus. Under reduced motion the plan appears complete.
 */
export default function SitePlanDemo({ className = "" }: { className?: string }) {
  const [id, setId] = useState<PlanVariant["id"]>("office");
  const variant = planVariants.find((item) => item.id === id) ?? planVariants[0];
  const counts = planCounts(variant);

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !back) return;
    event.preventDefault();
    const next = (index + (forward ? 1 : -1) + planVariants.length) % planVariants.length;
    const button = document.getElementById(`plan-tab-${planVariants[next].id}`);
    button?.focus();
    setId(planVariants[next].id);
  }

  return (
    <div className={`plan-demo ${className}`}>
      <div className="plan-demo-picker" role="tablist" aria-label="Site type">
        {planVariants.map((item, index) => (
          <button
            key={item.id}
            id={`plan-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={item.id === id}
            aria-controls="plan-demo-panel"
            tabIndex={item.id === id ? 0 : -1}
            onClick={() => setId(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`plan-demo-tab ${item.id === id ? "is-picked" : ""}`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="plan-demo-body">
        <div
          id="plan-demo-panel"
          role="tabpanel"
          aria-labelledby={`plan-tab-${variant.id}`}
          className="plan-demo-frame"
        >
          <PlanSvg key={variant.id} variant={variant} label={`demo-${variant.id}`} />
        </div>

        <div className="plan-demo-side">
          <p className="plan-demo-blurb">{variant.blurb}</p>
          <dl className="plan-demo-counts">
            <div>
              <dt>Cameras</dt>
              <dd>{counts.cameras}</dd>
            </div>
            <div>
              <dt>Door readers</dt>
              <dd>{counts.readers}</dd>
            </div>
            <div>
              <dt>Switch ports</dt>
              <dd>{counts.ports}</dd>
            </div>
          </dl>
          <p className="plan-demo-note">
            Illustrative estimate. Real counts come from a site survey — entrances, aisle length and cable runs decide the layout.
          </p>
        </div>
      </div>
    </div>
  );
}
