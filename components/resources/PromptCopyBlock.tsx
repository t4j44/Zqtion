"use client";

import { useState } from "react";
import { copyText } from "@/lib/prompts/browser";

interface PromptCopyBlockProps {
  code: string;
  label?: string;
  language?: string;
}

export function PromptCopyBlock({ code, label = "Prompt / Specification", language = "text" }: PromptCopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    const success = await copyText(code);
    setCopied(success);
    setCopyError(!success);
    if (success) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-xl border border-[var(--line)] bg-surface">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="text-xs font-mono font-medium text-secondary">{label}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-xs font-medium text-secondary transition-colors hover:bg-white/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
          aria-label="Copy prompt content"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <p role="status" className="sr-only">{copied ? "Prompt copied to clipboard." : ""}</p>
      {copyError ? <p role="alert" className="px-4 py-2 text-sm text-error">Copy unavailable. Select and copy the text below.</p> : null}
      <pre role="region" tabIndex={0} aria-label={label} className="max-h-[480px] overflow-x-auto p-4 font-mono text-xs leading-relaxed text-secondary">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
