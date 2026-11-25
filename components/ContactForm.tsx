"use client";

import { useId, useRef, useState } from "react";
import { site, waLink } from "@/lib/site";

type Field = "name" | "email" | "site" | "message";

const labels: Record<Field, string> = {
  name: "Your name",
  email: "Email",
  site: "Site type",
  message: "What do you need?",
};

/**
 * Quote request form. No backend is configured, so a valid submission hands the
 * message to WhatsApp where the team already works. Validation states are inline,
 * tied to the inputs with aria-describedby and aria-invalid.
 */
export default function ContactForm() {
  const ids = { name: useId(), email: useId(), site: useId(), message: useId(), error: useId() };
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", site: "Office", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  function validate() {
    const next: Partial<Record<Field, string>> = {};
    if (values.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (values.message.trim().length < 10) next.message = "Add a little more detail (at least 10 characters).";
    return next;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      window.requestAnimationFrame(() => {
        form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }
    const message = `Hello Zetta Tech, I would like a quote.\n\nName: ${values.name}\nEmail: ${values.email}\nSite type: ${values.site}\nDetails: ${values.message}`;
    window.open(waLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const descriptionFor = (field: Field) => (errors[field] ? ids.error : undefined);

  return (
    <form ref={form} noValidate onSubmit={submit} className="border border-navy-900/15 bg-white p-6 shadow-[8px_8px_0_0_#CFF1FF]">
      <h2 className="font-display text-2xl font-semibold text-navy-900">Request a quote</h2>
      <p className="mt-1 text-sm text-navy-900/65">Prefer email? Use {site.email} or WhatsApp {site.phone}.</p>

      <div className="mt-6 grid gap-4">
        <div>
          <label htmlFor={ids.name} className="eyebrow block text-navy-900/70">{labels.name}</label>
          <input
            id={ids.name}
            name="name"
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={descriptionFor("name")}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            className={`mt-2 h-11 w-full rounded border bg-white px-3.5 text-navy-900 transition-colors ${errors.name ? "border-red-600" : "border-navy-900/20 focus:border-cyan-deep"}`}
          />
        </div>
        <div>
          <label htmlFor={ids.email} className="eyebrow block text-navy-900/70">{labels.email}</label>
          <input
            id={ids.email}
            name="email"
            type="email"
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={descriptionFor("email")}
            onChange={(event) => setValues({ ...values, email: event.target.value })}
            className={`mt-2 h-11 w-full rounded border bg-white px-3.5 text-navy-900 transition-colors ${errors.email ? "border-red-600" : "border-navy-900/20 focus:border-cyan-deep"}`}
          />
        </div>
        <div>
          <label htmlFor={ids.site} className="eyebrow block text-navy-900/70">{labels.site}</label>
          <select
            id={ids.site}
            name="site"
            value={values.site}
            onChange={(event) => setValues({ ...values, site: event.target.value })}
            className="mt-2 h-11 w-full rounded border border-navy-900/20 bg-white px-3.5 text-navy-900 focus:border-cyan-deep"
          >
            {["Office", "Factory", "Warehouse", "Retail", "Other"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={ids.message} className="eyebrow block text-navy-900/70">{labels.message}</label>
          <textarea
            id={ids.message}
            name="message"
            rows={4}
            value={values.message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={descriptionFor("message")}
            onChange={(event) => setValues({ ...values, message: event.target.value })}
            className={`mt-2 w-full rounded border bg-white px-3.5 py-3 text-navy-900 transition-colors ${errors.message ? "border-red-600" : "border-navy-900/20 focus:border-cyan-deep"}`}
          />
        </div>
      </div>

      <p id={ids.error} aria-live="polite" className="mt-4 min-h-5 text-sm text-red-700">
        {Object.values(errors)[0] ?? ""}
      </p>

      <button type="submit" className="btn-primary w-full px-6 py-3.5">Send on WhatsApp</button>

      {sent ? (
        <p role="status" className="mt-4 border border-cyan-deep/40 bg-cyan-soft/50 px-4 py-3 text-sm text-navy-900">
          WhatsApp should be open with your details filled in. If it did not open, message us at {site.phone}.
        </p>
      ) : null}
    </form>
  );
}
