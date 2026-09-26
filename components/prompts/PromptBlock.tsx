"use client";
import { useState } from "react";
import { CopyPrompt } from "./PromptActions";
import { customizePrompt } from "@/lib/prompts/core";
import type { PromptVariable } from "@/lib/prompts/types";
import { trackEvent } from "@/components/Analytics";

export default function PromptBlock({ slug, template, variables }: { slug: string; template: string; variables: PromptVariable[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const text = customizePrompt(template, variables, applied);
  return <section className="pl-prompt-workbench" aria-labelledby="prompt-heading">
    <div className="pl-section-heading"><div><p className="pl-kicker">Make it yours</p><h2 id="prompt-heading">The prompt</h2></div><CopyPrompt key={text} slug={slug} text={text} /></div>
    <form className="pl-customizer" onSubmit={(event) => { event.preventDefault(); setApplied(values); setMessage("Prompt updated. The copy button uses your customized version."); trackEvent("prompt_customize", { slug }); }}>
      <div className="pl-variable-grid">{variables.map((variable) => <label key={variable.key} htmlFor={`variable-${variable.key}`}>{variable.label}<input id={`variable-${variable.key}`} value={values[variable.key] ?? variable.defaultValue} maxLength={500} aria-describedby={`hint-${variable.key}`} onChange={(event) => setValues({ ...values, [variable.key]: event.target.value })} /><span id={`hint-${variable.key}`}>{variable.hint}</span></label>)}</div>
      <div className="pl-button-row"><button type="submit" className="pl-button">Customize prompt <span aria-hidden="true">↗</span></button><button type="button" className="pl-action" onClick={() => { setValues({}); setApplied({}); setMessage("Default values restored."); }}>Reset fields</button></div>
      <p className="pl-muted pl-small">Your entries stay in this page. No AI request is made.</p><p role="status" className="pl-small">{message}</p>
    </form>
    <pre className="pl-prompt-text" tabIndex={0} aria-label="Prompt text"><code>{text}</code></pre>
  </section>;
}
