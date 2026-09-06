"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";
import { trackEvent } from "@/components/Analytics";
import { availabilityOptions, laptopOptions, studyOptions, validateApplication, type ApplicationErrors, type ApplicationFields } from "@/lib/launchpad-validation";

type TrackOption = { slug: string; title: string; question: string };
type FieldProps = { name: keyof ApplicationFields; label: string; required?: boolean; min?: number; max?: number; type?: string; autoComplete?: string; multiline?: boolean; hint?: string; errors: ApplicationErrors };
const inputClass = "launchpad-input";

function Field({ name, label, required = false, min, max = 500, type = "text", autoComplete, multiline = false, hint, errors }: FieldProps) {
  const props = { id: `application-${name}`, name, required, minLength: min, maxLength: max, autoComplete, className: inputClass, "aria-invalid": Boolean(errors[name]), "aria-describedby": `${name}-hint ${name}-error` };
  return <div className={multiline ? "sm:col-span-2" : ""}><label htmlFor={props.id}>{label}{required ? <span className="text-cyan-300"> *</span> : <span className="font-normal text-white/60"> (optional)</span>}</label>{multiline ? <textarea {...props} rows={4} /> : <input {...props} type={type} />}<p id={`${name}-hint`} className="launchpad-field-hint">{hint}</p><p id={`${name}-error`} className="launchpad-field-error">{errors[name]}</p></div>;
}

function SelectField({ name, label, options, errors, required = true }: { name: "studyLevel" | "weeklyAvailability" | "laptopAccess"; label: string; options: readonly string[]; errors: ApplicationErrors; required?: boolean }) {
  return <div><label htmlFor={`application-${name}`}>{label}{required ? <span className="text-cyan-300"> *</span> : null}</label><select id={`application-${name}`} className={inputClass} name={name} required={required} defaultValue="" aria-invalid={Boolean(errors[name])} aria-describedby={`${name}-error`}><option value="" disabled>Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select><p className="launchpad-field-error" id={`${name}-error`}>{errors[name]}</p></div>;
}

export default function LaunchpadApplicationForm({ tracks, defaultTrack, accepting, acknowledgement }: { tracks: TrackOption[]; defaultTrack: string; accepting: boolean; acknowledgement: string }) {
  const [step, setStep] = useState(0);
  const [primaryTrack, setPrimaryTrack] = useState(defaultTrack);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "preview">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const submissionIdRef = useRef("");
  const startedRef = useRef(false);
  const selected = tracks.find(({ slug }) => slug === primaryTrack);

  function moveTo(next: number) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  function validateStep() {
    const fieldset = formRef.current?.querySelectorAll("fieldset")[step];
    const fields = fieldset?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea");
    if (!fields) return false;
    for (const field of fields) if (!field.reportValidity()) return false;
    return true;
  }
  function advance() { if (validateStep()) moveTo(Math.min(2, step + 1)); }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    if (step < 2) { advance(); return; }
    const form = event.currentTarget;
    if (!validateStep()) return;
    if (!submissionIdRef.current) submissionIdRef.current = crypto.randomUUID();
    const data = new FormData(form);
    const payload = { ...Object.fromEntries(data), submissionId: submissionIdRef.current, ageConfirmed: data.get("ageConfirmed") === "on", acknowledgement: data.get("acknowledgement") === "on", privacyConsent: data.get("privacyConsent") === "on" };
    const parsed = validateApplication(payload, tracks.map(({ slug }) => slug));
    setErrors(parsed.errors);
    if (!parsed.valid) {
      setStatus("error"); setMessage("Please review the highlighted fields. Your application has not been sent.");
      const first = Object.keys(parsed.errors)[0];
      const element = form.elements.namedItem(first) as HTMLElement | null;
      const fieldsets = Array.from(form.querySelectorAll("fieldset"));
      const target = fieldsets.findIndex((fieldset) => element && fieldset.contains(element));
      if (target >= 0) setStep(target);
      requestAnimationFrame(() => element?.focus());
      return;
    }
    if (!accepting) {
      setStatus("preview"); setMessage("Your application preview passes the form checks. Nothing was sent or saved. Applications are not open yet.");
      return;
    }
    setStatus("sending"); setMessage("");
    trackEvent("form_submit", { location: "launchpad" });
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(35000) });
      const result = await response.json();
      if (!response.ok) { if (result.fields) setErrors(result.fields); throw new Error(result.error || "Application delivery was not confirmed. Please try again."); }
      if (!result.reference) throw new Error("Application delivery was not confirmed. Please try again.");
      setReference(result.reference); setStatus("success");
      trackEvent("form_success", { location: "launchpad" });
      form.reset();
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Delivery was not confirmed. Your answers are still on this page; please try again.");
      trackEvent("form_error", { location: "launchpad" });
    } finally { turnstileRef.current?.reset(); }
  }

  if (status === "success") return <section className="launchpad-application-success" aria-live="polite"><CheckCircle2 className="h-10 w-10 text-cyan-300" /><h2 tabIndex={-1} ref={headingRef}>Application received.</h2><p>Your application is stored for review. This confirms receipt, not selection or enrollment.</p><p className="break-all text-sm text-white/70">Reference: {reference}</p><p>Keep this reference for questions. No response deadline or place is guaranteed.</p><Link className="button-secondary" href="/careers">Back to Launchpad</Link></section>;

  return <form ref={formRef} onSubmit={onSubmit} noValidate className="launchpad-application" onChange={() => { submissionIdRef.current = ""; if (status !== "sending") { setStatus("idle"); setMessage(""); } }} onFocusCapture={() => { if (accepting && !startedRef.current) { startedRef.current = true; trackEvent("form_start", { location: "launchpad" }); } }}>
    <ol className="launchpad-form-progress" aria-label="Application steps">{["About you", "Your direction", "Review & agree"].map((label, index) => <li key={label}><button type="button" onClick={() => moveTo(index)} disabled={index > step || status === "sending"} aria-current={step === index ? "step" : undefined}><span>0{index + 1}</span>{label}</button></li>)}</ol>
    <h2 ref={headingRef} tabIndex={-1} className="launchpad-form-heading">{["First, a little about you.", "Where do you want to grow?", "Know what you are joining."][step]}</h2>
    <p className="mb-8 text-sm leading-6 text-white/65">Fields marked * are required. Your answers are not automatically saved. Do not include passwords, ID documents, confidential client data or sensitive personal details.</p>
    <fieldset hidden={step !== 0} disabled={status === "sending"}><legend className="sr-only">About you</legend><div className="launchpad-form-grid">
      <Field name="fullName" label="Full name" required min={2} max={100} autoComplete="name" errors={errors} />
      <Field name="email" label="Email" required type="email" max={160} autoComplete="email" errors={errors} />
      <Field name="phone" label="Phone with country code" required type="tel" min={6} max={40} autoComplete="tel" errors={errors} />
      <Field name="location" label="City and country" required min={2} max={160} autoComplete="address-level2" errors={errors} />
      <Field name="institution" label="School, university or company" max={160} autoComplete="organization" errors={errors} />
      <SelectField name="studyLevel" label="Your current stage" options={studyOptions} errors={errors} />
      <label className="launchpad-consent sm:col-span-2"><input type="checkbox" name="ageConfirmed" required aria-describedby="ageConfirmed-error" /><span>I confirm I am 18 or older. I understand location and legal eligibility must be confirmed before enrollment.</span></label><p id="ageConfirmed-error" className="launchpad-field-error sm:col-span-2">{errors.ageConfirmed}</p>
    </div></fieldset>
    <fieldset hidden={step !== 1} disabled={status === "sending"}><legend className="sr-only">Your direction</legend><div className="launchpad-form-grid">
      <div><label htmlFor="application-primaryTrack">First-choice track <span className="text-cyan-300">*</span></label><select id="application-primaryTrack" className={inputClass} name="primaryTrack" required value={primaryTrack} aria-invalid={Boolean(errors.primaryTrack)} aria-describedby="primaryTrack-error" onChange={(event) => { setPrimaryTrack(event.target.value); const answer = formRef.current?.elements.namedItem("roleAnswer") as HTMLTextAreaElement | null; if (answer) answer.value = ""; }}><option value="" disabled>Choose your track</option>{tracks.map((track) => <option key={track.slug} value={track.slug}>{track.title}</option>)}</select><p id="primaryTrack-error" className="launchpad-field-error">{errors.primaryTrack}</p></div>
      <div><label htmlFor="application-secondaryTrack">Second-choice track <span className="font-normal text-white/60">(optional)</span></label><select id="application-secondaryTrack" className={inputClass} name="secondaryTrack" defaultValue="" aria-invalid={Boolean(errors.secondaryTrack)} aria-describedby="secondaryTrack-error"><option value="">No second choice</option>{tracks.map((track) => <option key={track.slug} value={track.slug} disabled={track.slug === primaryTrack}>{track.title}</option>)}</select><p id="secondaryTrack-error" className="launchpad-field-error">{errors.secondaryTrack}</p></div>
      <Field name="linkedin" label="LinkedIn profile" type="url" errors={errors} />
      <Field name="portfolio" label="Portfolio or work sample" type="url" errors={errors} hint="A learning experiment is enough. A polished portfolio is not required." />
      <Field name="github" label="GitHub profile, if relevant" type="url" errors={errors} />
      <Field name="otherLinks" label="Other project or social links" multiline max={1200} hint="Up to three complete http(s) links, one per line. Share only what you have permission to share." errors={errors} />
      <Field name="whyZqtion" label="Why Zqtion Launchpad?" required multiline min={20} max={1500} errors={errors} />
      <Field name="learningGoals" label="What do you want to learn?" required multiline min={20} max={1500} errors={errors} />
      <Field name="priorExperiment" label="Something you have made, built or tried" required multiline min={10} max={1500} hint="It can be small, unfinished or unsuccessful. Explain what you tried and learned." errors={errors} />
      <Field name="strongestSkill" label="Your strongest skill" required min={2} max={300} errors={errors} />
      <Field name="improveSkill" label="A skill you want to improve" required min={2} max={300} errors={errors} />
      <SelectField name="weeklyAvailability" label="Weekly availability" options={availabilityOptions} errors={errors} />
      <SelectField name="laptopAccess" label="Laptop / desktop access" options={laptopOptions} errors={errors} />
      <Field name="toolsUsed" label="Tools you have used" required min={2} max={500} hint="Basic tools count. Write 'None yet' if you are starting from scratch." errors={errors} />
      <Field name="startAvailability" label="When could you start?" required min={2} max={160} hint="Share your availability. A cohort start date has not been promised." errors={errors} />
      <Field name="roleAnswer" label={selected?.question || "Choose a first-choice track to see your role question"} required multiline min={20} max={1500} hint="Changing your first-choice track clears this answer because the question changes." errors={errors} />
    </div></fieldset>
    <fieldset hidden={step !== 2} disabled={status === "sending"}><legend className="sr-only">Review and agree</legend><div className="launchpad-review-terms"><h3>{selected?.title || "Your selected track"}</h3><p>12 weeks · Remote-first · 8–12 hours/week · Unpaid · Learning-first</p><p>Certificate requires participation, assignments, a final project, professional conduct and mentor approval. Portfolio publication requires permission. References and future paid work are conditional.</p></div>
      <label className="launchpad-consent mt-7"><input type="checkbox" name="acknowledgement" required aria-describedby="acknowledgement-error" /><span>{acknowledgement}</span></label><p id="acknowledgement-error" className="launchpad-field-error">{errors.acknowledgement}</p>
      <label className="launchpad-consent mt-5"><input type="checkbox" name="privacyConsent" required aria-describedby="privacyConsent-error" /><span>I agree that Zqtion may use the information I submit to evaluate my application and contact me about Launchpad, as described in the <Link className="underline underline-offset-4" href="/privacy" target="_blank" rel="noreferrer">Privacy policy (opens a new tab)</Link>. This is not marketing consent.</span></label><p id="privacyConsent-error" className="launchpad-field-error">{errors.privacyConsent}</p>
      {accepting ? (step === 2 ? <div className="mt-7"><TurnstileWidget ref={turnstileRef} action="launchpad" /></div> : null) : <p className="launchpad-notice mt-7">Preview only. Intake is closed. Checking this form does not submit, store or email your answers.</p>}
    </fieldset>
    <div className="sr-only" aria-hidden="true"><label>Leave this empty<input name="fax_number" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="launchpad-form-actions">{step > 0 ? <button type="button" className="button-secondary" onClick={() => moveTo(step - 1)} disabled={status === "sending"}><ArrowLeft className="h-4 w-4" />Back</button> : <span />} {step < 2 ? <button className="button-primary" type="button" onClick={advance}>Continue <ArrowRight className="h-4 w-4" /></button> : <button className="button-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{accepting ? "Submit application" : "Check application preview"}</button>}</div>
    <div aria-live="polite" aria-atomic="true" className={`launchpad-form-status ${status === "error" ? "text-rose-200" : "text-cyan-200"}`}>{message}</div>
    <noscript><p>This multi-step form needs JavaScript. Program details and role pages remain readable without it. Contact Zqtion if you need an accessible application alternative.</p></noscript>
  </form>;
}
