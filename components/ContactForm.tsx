"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";
import { getAttribution, trackEvent } from "@/components/Analytics";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "mt-2 min-w-0 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-base text-white outline-none transition placeholder:text-white/50 focus:border-cyan-300/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-cyan-300/10";

export default function ContactForm({ defaultService = "" }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const startedRef = useRef(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const payload = { ...Object.fromEntries(new FormData(form).entries()), ...getAttribution() };
    trackEvent("form_submit");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(35000),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "The brief could not be delivered.");
      }

      form.reset();
      turnstileRef.current?.reset();
      setStatus("success");
      trackEvent("form_success");
      setMessage("Your brief was delivered. Zqtion will reply using the email you provided.");
    } catch (error) {
      turnstileRef.current?.reset();
      setStatus("error");
      trackEvent("form_error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The brief could not be delivered. Please use email or WhatsApp instead.",
      );
    }
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        onFocusCapture={() => {
          if (startedRef.current) return;
          startedRef.current = true;
          trackEvent("form_start");
        }}
        className="grid gap-5"
        aria-describedby="form-status"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-white/70">
            Name <span className="text-cyan-300">*</span>
            <input className={inputClass} name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
          <label className="text-sm font-medium text-white/70">
            Email <span className="text-cyan-300">*</span>
            <input className={inputClass} name="email" required type="email" maxLength={160} autoComplete="email" />
          </label>
        </div>
        <label className="text-sm font-medium text-white/70">
          Website or product link (optional)
          <input className={inputClass} name="projectUrl" type="url" maxLength={500} inputMode="url" autoComplete="url" placeholder="https://" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-white/70">
            Company or project
            <input className={inputClass} name="company" maxLength={120} autoComplete="organization" />
          </label>
          <label className="text-sm font-medium text-white/70">
            What do you need? <span className="text-cyan-300">*</span>
            <select className={inputClass} name="service" required defaultValue={defaultService}>
              <option value="" disabled className="bg-[#090b10]">Select an area</option>
              <option className="bg-[#090b10]">AI creative production</option>
              <option className="bg-[#090b10]">Web product or MVP</option>
              <option className="bg-[#090b10]">AI automation or system</option>
              <option className="bg-[#090b10]">AI consultancy or prototype</option>
              <option className="bg-[#090b10]">Not sure yet</option>
            </select>
          </label>
        </div>
        <label className="text-sm font-medium text-white/70">
          Outcome, context, and deadline <span className="text-cyan-300">*</span>
          <textarea
            className={`${inputClass} min-h-40 resize-y`}
            name="details"
            required
            minLength={30}
            maxLength={4000}
            placeholder="What needs to change, who is it for, what already exists, and when does it matter?"
          />
        </label>
        <label className="text-sm font-medium text-white/70">
          Budget range (optional)
          <select className={inputClass} name="budget" defaultValue="">
            <option value="" className="bg-[#090b10]">Prefer to discuss</option>
            <option className="bg-[#090b10]">Under $1,000</option>
            <option className="bg-[#090b10]">$1,000–$3,000</option>
            <option className="bg-[#090b10]">$3,000–$8,000</option>
            <option className="bg-[#090b10]">$8,000+</option>
          </select>
        </label>

        <div className="sr-only" aria-hidden="true">
          <label>
            Leave this field empty
            <input name="fax_number" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <TurnstileWidget ref={turnstileRef} action="inquiry" />

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-5 text-white/40">
            Submitting this form sends the information to Zqtion for project evaluation. No payment is requested here.
          </p>
          <button className="button-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={status === "sending"}>
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send project brief
            {status !== "sending" ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </div>

        <div id="form-status" aria-live="polite" className="min-h-6">
          {message ? (
            <p className={`flex items-start gap-2 text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>
              {status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </>
  );
}
