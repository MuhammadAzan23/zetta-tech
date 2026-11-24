import PlanSvg from "./PlanSvg";
import { planVariant } from "@/lib/site-plans";

/**
 * The home hero's site plan.
 *
 * Server component: the drawing is CSS-animated from first paint and adds no
 * JavaScript. The data lives in lib/site-plans.ts, shared with the variant demo.
 */
export default function SitePlan({ className = "", animate = true }: { className?: string; animate?: boolean }) {
  return <PlanSvg variant={planVariant("office")} className={className} animate={animate} label="hero-plan" />;
}
