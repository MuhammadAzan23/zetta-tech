"use client";

import { useId, useRef, useState } from "react";

/**
 * Multi-step form shell.
 *
 * Owns navigation, the progress indicator and focus, but none of the fields: the
 * caller supplies one renderer per step, so the same component serves the Attendance
 * builder and the contact quote request.
 *
 * Accessibility and keyboard behaviour:
 *   - each step is a <fieldset> with a <legend>, so the question is announced with
 *     every field inside it;
 *   - a polite live region reports "Step 2 of 5" and the step title;
 *   - focus moves to the step heading on every change, so a screen reader reads the
 *     new question instead of dropping back to the top of the page;
 *   - Enter inside a field advances (the step is a form), Shift+Enter is left alone;
 *   - Back is a normal button, and the progress list states `aria-current="step"`;
 *   - one panel is mounted at a time, so the form never leaves hidden fields in the
 *     tab order or a stretched container behind.
 */
export type StepperStep = {
  id: string;
  /** Short label for the progress list. */
  label: string;
  /** The question, used as the step's legend and focus target. */
  title: string;
  /** Fields for this step. */
  render: () => React.ReactNode;
  /** Return an error message to block advancing, or null. */
  validate?: () => string | null;
  /** Copy for the primary button on this step. */
  nextLabel?: string;
  /** Copy for the primary button when this is the last step. */
  completeLabel?: string;
};

export default function Stepper({
  steps,
  label,
  onComplete,
  completeLabel = "Send on WhatsApp",
  summary,
}: {
  steps: StepperStep[];
  label: string;
  onComplete: () => void;
  completeLabel?: string;
  /** Optional review block shown under the last step's fields. */
  summary?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [error, setError] = useState<string | null>(null);
  const heading = useRef<HTMLLegendElement>(null);
  const baseId = useId();

  const step = steps[index];
  const first = index === 0;
  const last = index === steps.length - 1;
  const progress = Math.round(((index + 1) / steps.length) * 100);

  function go(next: number, dir: "forward" | "back") {
    setDirection(dir);
    setError(null);
    setIndex(next);
    // The panel is keyed by step, so this focus lands on the newly mounted legend.
    window.requestAnimationFrame(() => heading.current?.focus());
  }

  function advance() {
    const problem = step.validate?.() ?? null;
    if (problem) {
      setError(problem);
      return;
    }
    if (last) {
      onComplete();
      return;
    }
    go(index + 1, "forward");
  }

  const primaryLabel = last ? step.completeLabel ?? completeLabel : step.nextLabel ?? "Continue";

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    advance();
  }

  return (
    <div className="stepper">
      <div className="stepper-head">
        <p className="stepper-count" id={`${baseId}-count`}>
          Step {index + 1} of {steps.length}
        </p>
        <div
          className="stepper-bar"
          role="progressbar"
          aria-labelledby={`${baseId}-count`}
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index + 1}
          aria-valuetext={`Step ${index + 1} of ${steps.length}: ${step.title}`}
        >
          <span className="stepper-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <ol className="stepper-steps" aria-label={`${label} progress`}>
          {steps.map((item, itemIndex) => (
            <li
              key={item.id}
              className={`stepper-step ${itemIndex < index ? "is-done" : ""} ${itemIndex === index ? "is-current" : ""}`}
              aria-current={itemIndex === index ? "step" : undefined}
            >
              <span className="stepper-dot" aria-hidden="true">
                {itemIndex < index ? "✓" : itemIndex + 1}
              </span>
              <span className="stepper-step-label">{item.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <form noValidate onSubmit={onSubmit} className="stepper-form">
        <div key={step.id} className="stepper-panel" data-dir={direction}>
          <fieldset className="stepper-fieldset">
            <legend ref={heading} tabIndex={-1} className="stepper-title">
              {step.title}
            </legend>
            <div className="stepper-fields">{step.render()}</div>
            {last && summary ? <div className="stepper-summary">{summary}</div> : null}
          </fieldset>
        </div>

        <p className="stepper-error" role="alert" aria-live="assertive">
          {error ?? ""}
        </p>

        <div className="stepper-actions">
          <button
            type="button"
            onClick={() => go(index - 1, "back")}
            disabled={first}
            className="btn border border-navy-900/25 px-5 py-3 text-sm text-navy-900 hover:border-cyan-deep disabled:invisible"
          >
            Back
          </button>
          <button type="submit" className={`${last ? "btn-whatsapp" : "btn-primary"} px-6 py-3 text-sm`}>
            {primaryLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
