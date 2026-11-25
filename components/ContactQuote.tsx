"use client";

import { useMemo, useState } from "react";
import Stepper, { type StepperStep } from "./Stepper";
import { site, waLink } from "@/lib/site";

/**
 * Three-step quote request on the contact page.
 *
 * Step 1: who you are. Step 2: the site and what you need. Step 3: review, then the
 * full summary is handed to WhatsApp. Validation mirrors ContactForm's rules, so the
 * same messages appear whichever route a visitor takes.
 */

type Form = {
  name: string;
  email: string;
  site: string;
  needs: string[];
  message: string;
};

const EMPTY: Form = { name: "", email: "", site: "Office", needs: [], message: "" };

const SITES = ["Office", "Factory", "Warehouse", "Retail", "Other"] as const;
const NEEDS = ["Access control", "Attendance", "CCTV", "Thermal mapping", "Networking", "Racks & cabling"] as const;

/** WhatsApp opens with the whole request, so nothing gets lost between steps. */
function whatsappMessage(form: Form) {
  return [
    "Hello Zetta Tech, I would like a quote.",
    "",
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    `Site type: ${form.site}`,
    `Needs: ${form.needs.length ? form.needs.join(", ") : "Not specified"}`,
    "",
    `Details: ${form.message.trim()}`,
  ].join("\n");
}

export default function ContactQuote({ className = "" }: { className?: string }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [sent, setSent] = useState(false);

  const summary = useMemo(
    () => (
      <dl className="stepper-plan-list">
        <div><dt>Name</dt><dd>{form.name.trim() || "—"}</dd></div>
        <div><dt>Email</dt><dd>{form.email.trim() || "—"}</dd></div>
        <div><dt>Site</dt><dd>{form.site}</dd></div>
        <div><dt>Needs</dt><dd>{form.needs.length ? form.needs.join(", ") : "Not specified"}</dd></div>
        <div><dt>Message</dt><dd>{form.message.trim() || "—"}</dd></div>
      </dl>
    ),
    [form],
  );

  const steps: StepperStep[] = [
    {
      id: "you",
      label: "You",
      title: "Who should we reply to?",
      validate: () => {
        if (form.name.trim().length < 2) return "Please enter your name.";
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
        return null;
      },
      render: () => (
        <div className="grid gap-4">
          <div>
            <label htmlFor="quote-name" className="eyebrow block text-navy-900/70">Your name</label>
            <input
              id="quote-name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-2 h-11 w-full rounded border border-navy-900/20 bg-white px-3.5 text-navy-900 focus:border-cyan-deep"
            />
          </div>
          <div>
            <label htmlFor="quote-email" className="eyebrow block text-navy-900/70">Email</label>
            <input
              id="quote-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-2 h-11 w-full rounded border border-navy-900/20 bg-white px-3.5 text-navy-900 focus:border-cyan-deep"
            />
          </div>
        </div>
      ),
    },
    {
      id: "site",
      label: "Site",
      title: "What kind of site is it, and what do you need?",
      render: () => (
        <div className="grid gap-4">
          <div>
            <label htmlFor="quote-site" className="eyebrow block text-navy-900/70">Site type</label>
            <select
              id="quote-site"
              name="site"
              value={form.site}
              onChange={(event) => setForm({ ...form, site: event.target.value })}
              className="mt-2 h-11 w-full rounded border border-navy-900/20 bg-white px-3.5 text-navy-900 focus:border-cyan-deep"
            >
              {SITES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="eyebrow text-navy-900/70">What do you need?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {NEEDS.map((need) => {
                const picked = form.needs.includes(need);
                return (
                  <label key={need} className={`stepper-chip ${picked ? "is-picked" : ""}`}>
                    <input
                      type="checkbox"
                      name="needs"
                      value={need}
                      checked={picked}
                      onChange={() =>
                        setForm({
                          ...form,
                          needs: picked ? form.needs.filter((item) => item !== need) : [...form.needs, need],
                        })
                      }
                    />
                    <span>{need}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label htmlFor="quote-message" className="eyebrow block text-navy-900/70">What do you need it to do?</label>
            <textarea
              id="quote-message"
              name="message"
              rows={4}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="mt-2 w-full rounded border border-navy-900/20 bg-white px-3.5 py-3 text-navy-900 focus:border-cyan-deep"
            />
          </div>
        </div>
      ),
    },
    {
      id: "review",
      label: "Review",
      title: "Check the details, then send",
      completeLabel: "Send on WhatsApp",
      validate: () =>
        form.message.trim().length < 10 ? "Add a little more detail (at least 10 characters)." : null,
      render: () => (
        <div className="stepper-plan">
          <p className="stepper-plan-note">
            {form.message.trim().length < 10
              ? "Add a little more detail if you can — at least 10 characters — so we can answer properly."
              : "Everything looks complete. Sending opens WhatsApp with this summary already written."}
          </p>
        </div>
      ),
    },
  ];

  function send() {
    window.open(waLink(whatsappMessage(form)), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <div className={`contact-quote ${className}`}>
      <h2 className="font-display text-2xl font-semibold text-navy-900">Request a quote</h2>
      <p className="mt-1 text-sm text-navy-900/70">Three short steps, then the whole request opens in WhatsApp.</p>
      <div className="mt-6">
        <Stepper steps={steps} label="Quote request" onComplete={send} summary={summary} />
      </div>
      {sent ? (
        <p role="status" className="mt-4 border border-cyan-deep/40 bg-cyan-soft/50 px-4 py-3 text-sm text-navy-900">
          WhatsApp should be open with your details filled in. If it did not open, message us at {site.phone}.
        </p>
      ) : null}
    </div>
  );
}
