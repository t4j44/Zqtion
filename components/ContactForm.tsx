"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";
import { getAttribution, trackEvent } from "@/components/Analytics";
import { siteConfig } from "@/data/site";
import { normalizeWebsiteLink } from "@/lib/url-input";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "mt-2 min-w-0 w-full rounded-2xl border border-[var(--border-control)] bg-[var(--surface-input)] px-4 py-3.5 text-base text-foreground outline-none transition placeholder:text-muted focus:border-[var(--focus)] focus:bg-raised focus:ring-4 focus:ring-cyan-300/10";

export default function ContactForm({ defaultService = "" }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const startedRef = useRef(false);
  const inFlightRef = useRef(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  // Production-only fallback while transactional email, Storage and Turnstile
  // are not configured. Keep the full form in local/Preview QA.
  if (process.env.NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED === "true") {
    return (
      <div className="grid gap-5" aria-label="Contact Zqtion">
        <h2 className="text-2xl font-semibold text-foreground">Send your brief directly.</h2>
        <p className="text-secondary">Project briefs are being accepted directly by email or WhatsApp while secure online form delivery is configured.</p>
        <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent("New project brief for Zqtion")}`} className="button-primary inline-flex w-fit items-center gap-3">
          Email your project brief <ArrowRight className="h-4 w-4" />
        </a>
        <a href={siteConfig.whatsapp} target="_blank" rel="noreferrer" className="button-secondary inline-flex w-fit items-center gap-3">
          Discuss on WhatsApp <ArrowRight className="h-4 w-4" />
        </a>
        <p className="text-xs leading-5 text-muted">Include your goal, expected outcome, relevant links, timeline and contact details. No payment is requested here.</p>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlightRef.current) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const timeline = String(formData.get("timeline") || "").trim();
    const details = String(formData.get("details") || "").trim();
    const combinedDetails = timeline ? `${details}\n\nTimeline / desired launch: ${timeline}` : details;
    if (combinedDetails.length > 4000) {
      setStatus("error");
      setMessage("Please shorten the project description and timeline to 4,000 characters in total. Your brief has not been sent.");
      return;
    }
    formData.delete("timeline");
    formData.set("details", combinedDetails);
    const projectUrl = String(formData.get("projectUrl") || "");
    if (projectUrl) formData.set("projectUrl", normalizeWebsiteLink(projectUrl));
    inFlightRef.current = true;
    setStatus("sending");
    setMessage("");

    const submittedEmail = String(formData.get("email") || "the email you provided").trim();
    const payload = { ...Object.fromEntries(formData.entries()), ...getAttribution() };
    trackEvent("form_submit");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();

      if (!response.ok || result.ok !== true) {
        const safeErrors: Record<number, string> = {
          400: "Please check the required fields, project URL and human verification, then try again. Your entries are still here.",
          413: "The brief is too large. Please shorten it before submitting again.",
          429: `Too many attempts. Please wait before trying again, or contact ${siteConfig.email}.`,
        };
        throw new Error(safeErrors[response.status] || `Online brief delivery is temporarily unavailable. Please email ${siteConfig.email} or use WhatsApp.`);
      }

      form.reset();
      turnstileRef.current?.reset();
      setStatus("success");
      trackEvent("form_success");
      const confirmation = result.confirmation === "accepted"
        ? `Our email provider accepted the confirmation request for ${submittedEmail}. Please check your inbox; receipt has not been confirmed.`
        : "Your brief is saved, but we couldn't confirm the confirmation email was sent. You don't need to submit again.";
      setMessage(`Brief received and saved. ${confirmation} We'll review your brief before recommending the next step.`);
    } catch (error) {
      turnstileRef.current?.reset();
      setStatus("error");
      trackEvent("form_error");
      setMessage(
        error instanceof Error && !["TimeoutError", "TypeError", "SyntaxError", "AbortError"].includes(error.name)
          ? error.message
          : `We couldn't confirm whether your brief was received. Please email ${siteConfig.email} or use WhatsApp before submitting again.`,
      );
    } finally { inFlightRef.current = false; }
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
        className="contact-form grid gap-5"
        aria-describedby="form-status"
        aria-label="Project inquiry"
        aria-busy={status === "sending"}
      >
        <div><h2 className="text-xl font-semibold text-foreground">Project brief</h2><p className="mt-2 text-sm text-secondary">Fields marked * are required. Everything else is optional.</p></div>
        <fieldset disabled={status === "sending"} className="grid min-w-0 gap-5">
        <legend className="sr-only">Your project details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-secondary">
            Name <span className="text-accent">*</span>
            <input className={inputClass} name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
          <label className="text-sm font-medium text-secondary">
            Email address <span className="text-accent">*</span>
            <input className={inputClass} name="email" required type="email" maxLength={160} autoComplete="email" />
          </label>
        </div>
        <label className="text-sm font-medium text-secondary">
          Website or project URL (optional)
          <input className={inputClass} name="projectUrl" type="text" maxLength={500} inputMode="url" autoComplete="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="example.com or linkedin.com/in/name" onBlur={event => { event.currentTarget.value = normalizeWebsiteLink(event.currentTarget.value); }} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-secondary">
            Company / project name (optional)
            <input className={inputClass} name="company" maxLength={120} autoComplete="organization" />
          </label>
          <label className="text-sm font-medium text-secondary">
            Service type <span className="text-accent">*</span>
            <select className={inputClass} name="service" required defaultValue={defaultService}>
              <option value="" disabled className="bg-[var(--background)]">Select an area</option>
              <option className="bg-[var(--background)]">AI creative production</option>
              <option className="bg-[var(--background)]">Web product or MVP</option>
              <option className="bg-[var(--background)]">AI automation or system</option>
              <option className="bg-[var(--background)]">AI consultancy or prototype</option>
              <option className="bg-[var(--background)]">Not sure yet</option>
            </select>
          </label>
        </div>
        <label className="text-sm font-medium text-secondary">
          Project description <span className="text-accent">*</span>
          <textarea
            className={`${inputClass} min-h-40 resize-y`}
            name="details"
            required
            minLength={30}
            maxLength={4000}
            placeholder="What needs to change, who is it for, what already exists, and when does it matter?"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-secondary">
          Budget range (optional)
          <select className={inputClass} name="budget" defaultValue="">
            <option value="" className="bg-[var(--background)]">Prefer to discuss</option>
            <option className="bg-[var(--background)]">Under $1,000</option>
            <option className="bg-[var(--background)]">$1,000–$3,000</option>
            <option className="bg-[var(--background)]">$3,000–$8,000</option>
            <option className="bg-[var(--background)]">$8,000+</option>
          </select>
        </label>
        <label className="text-sm font-medium text-secondary">Timeline / desired launch date (optional)
          <input className={inputClass} name="timeline" maxLength={120} placeholder="A date, timeframe, or still exploring" />
        </label>
        </div>

        <div className="sr-only" aria-hidden="true">
          <label>
            Leave this field empty
            <input name="fax_number" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        </fieldset>

        <TurnstileWidget ref={turnstileRef} action="inquiry" />

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-5 text-muted">
            Submitting this form sends the information to Zqtion for project evaluation. No payment is requested here.
          </p>
          <button className="button-primary contact-submit shrink-0 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={status === "sending"}>
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send project brief
            {status !== "sending" ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </div>

        <div id="form-status" role="status" aria-live="polite" aria-atomic="true" className="min-h-6">
          {message ? (
            <p className={`flex min-w-0 items-start gap-2 text-sm [overflow-wrap:anywhere] ${status === "success" ? "text-success" : "text-error"}`}>
              {status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              {message}
            </p>
          ) : null}
          {status === "error" ? <p className="mt-3 text-sm text-secondary">Contact us: <a className="inline-flex min-h-11 items-center text-accent underline underline-offset-4" href={`mailto:${siteConfig.email}`} data-analytics="email_click" data-analytics-location="contact_form_error">{siteConfig.email}</a> or <a className="inline-flex min-h-11 items-center text-accent underline underline-offset-4" href={siteConfig.whatsapp} target="_blank" rel="noreferrer" data-analytics="whatsapp_click" data-analytics-location="contact_form_error">WhatsApp</a>.</p> : null}
        </div>
      </form>
    </>
  );
}
