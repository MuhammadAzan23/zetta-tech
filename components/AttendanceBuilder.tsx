"use client";

import { useMemo, useState } from "react";
import Stepper, { type StepperStep } from "./Stepper";
import { site, waLink } from "@/lib/site";

/**
 * Attendance requirement builder.
 *
 * Six questions, then a summary with an estimate of how many biometric terminals
 * the site needs. The ratio lives in `lib/site.ts` and is marked TODO: ZKTeco sizes
 * terminals by entrance throughput, so headcount is only a starting assumption.
 * This is deliberately a planning figure, labelled as such, not a quote.
 */

const EMPLOYEES = [["1-20", 20], ["21-50", 50], ["51-100", 100], ["101-250", 250], ["251-500", 500], ["500+", 750]] as const;
const BRANCHES = ["1", "2-3", "4-6", "7+"] as const;
const TERMINALS = ["Fingerprint", "Face + fingerprint", "Card / RFID", "Not sure yet"] as const;
const DOOR = ["Entrance only", "Entrance and server room", "Several internal doors", "Not needed"] as const;
const PAYROLL = ["Yes, payroll software", "No, Excel is fine", "Not sure yet"] as const;
const CITIES = ["Karachi", "Hyderabad", "Lahore", "Islamabad", "Other"] as const;

type Form = {
  employees: string;
  branches: string;
  terminal: string;
  door: string;
  payroll: string;
  city: string;
};

const EMPTY: Form = { employees: "", branches: "", terminal: "", door: "", payroll: "", city: "" };

export default function AttendanceBuilder({ className = "" }: { className?: string }) {
  const [form, setForm] = useState<Form>(EMPTY);

  const estimate = useMemo(() => {
    const employees = EMPLOYEES.find(([label]) => label === form.employees)?.[1] ?? 0;
    if (!employees) return null;
    const branchCount = form.branches === "1" ? 1 : form.branches === "2-3" ? 3 : form.branches === "4-6" ? 6 : form.branches === "7+" ? 8 : 1;
    // Size each location on its own: staff are spread across branches, and an entrance
    // needs at least one terminal whatever the headcount.
    const perBranch = site.attendance.employeesPerTerminal;
    const staffPerBranch = Math.ceil(employees / branchCount);
    const terminalsPerBranch = Math.max(site.attendance.minTerminals, Math.ceil(staffPerBranch / perBranch));
    const terminalCount = terminalsPerBranch * branchCount;
    return { employees, branchCount, staffPerBranch, terminalsPerBranch, terminalCount };
  }, [form.employees, form.branches]);

  function choose<K extends keyof Form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const options = (key: keyof Form, values: readonly string[]) =>
    values.map((value) => (
      <label key={value} className={`stepper-choice ${form[key] === value ? "is-picked" : ""}`}>
        <input
          type="radio"
          name={key}
          value={value}
          checked={form[key] === value}
          onChange={() => choose(key, value)}
        />
        <span>{value}</span>
      </label>
    ));

  function message() {
    return [
      "Hello Zetta Tech, I would like a quote for an attendance system.",
      "",
      `Staff: ${form.employees || "—"}`,
      `Branches: ${form.branches || "—"}`,
      `Terminal type: ${form.terminal || "—"}`,
      `Door access: ${form.door || "—"}`,
      `Payroll software: ${form.payroll || "—"}`,
      `City: ${form.city || "—"}`,
      `Estimated terminals: ${estimate ? `around ${estimate.terminalCount}` : "to be confirmed"}`,
      "",
      "Please confirm the setup and share pricing.",
    ].join("\n");
  }

  const missing = (key: keyof Form, text: string) => () => (form[key] ? null : text);

  const steps: StepperStep[] = [
    {
      id: "employees",
      label: "Staff",
      title: "How many people need to clock in?",
      validate: missing("employees", "Choose a staff range so we can size the system."),
      render: () => <div className="stepper-choices">{options("employees", EMPLOYEES.map(([label]) => label))}</div>,
    },
    {
      id: "branches",
      label: "Branches",
      title: "How many branches or offices?",
      validate: missing("branches", "Choose how many locations you have."),
      render: () => <div className="stepper-choices">{options("branches", BRANCHES)}</div>,
    },
    {
      id: "terminal",
      label: "Terminal",
      title: "Which terminal type suits your staff?",
      validate: missing("terminal", "Pick a terminal type, or choose “Not sure yet”."),
      render: () => <div className="stepper-choices">{options("terminal", TERMINALS)}</div>,
    },
    {
      id: "door",
      label: "Door access",
      title: "Do you also need the terminals to open doors?",
      validate: missing("door", "Choose how door access should work."),
      render: () => <div className="stepper-choices">{options("door", DOOR)}</div>,
    },
    {
      id: "payroll",
      label: "Payroll",
      title: "Do you want payroll software with it?",
      validate: missing("payroll", "Choose a payroll option."),
      render: () => <div className="stepper-choices">{options("payroll", PAYROLL)}</div>,
    },
    {
      id: "city",
      label: "City",
      title: "Where is the site?",
      validate: missing("city", "Choose the city so we can plan a visit."),
      nextLabel: "See my estimate",
      render: () => <div className="stepper-choices">{options("city", CITIES)}</div>,
    },
    {
      id: "summary",
      label: "Summary",
      title: "Here is what we would propose",
      completeLabel: "Send this to WhatsApp",
      render: () => (
        <div className="stepper-plan">
          <p className="stepper-plan-lead">
            <strong>{estimate?.terminalCount ?? "—"} biometric terminal{estimate?.terminalCount === 1 ? "" : "s"}</strong>
            {estimate
              ? estimate.branchCount === 1
                ? ` for your entrance, covering ${form.employees} staff.`
                : `: ${estimate.terminalsPerBranch} per site across ${estimate.branchCount} locations, covering ${form.employees} staff in total.`
              : " for your site."}
          </p>
          <dl className="stepper-plan-list">
            <div><dt>Terminal type</dt><dd>{form.terminal}</dd></div>
            <div><dt>Door access</dt><dd>{form.door}</dd></div>
            <div><dt>Payroll</dt><dd>{form.payroll}</dd></div>
            <div><dt>City</dt><dd>{form.city}</dd></div>
          </dl>
          <p className="stepper-plan-note">
            Illustrative estimate. We confirm terminal count after a short site survey — entrances and peak flow matter more than headcount.
          </p>
        </div>
      ),
    },
  ];

  function send() {
    window.open(waLink(message()), "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`attendance-builder ${className}`}>
      <Stepper steps={steps} label="Attendance builder" onComplete={send} completeLabel="Send this to WhatsApp" />
    </div>
  );
}
