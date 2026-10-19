"use client";

import { useState } from "react";

interface PromptCopyBlockProps {
  code: string;
  label?: string;
  language?: string;
}

export function PromptCopyBlock({ code, label = "Prompt / Specification", language = "text" }: PromptCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-xl border border-[#22242C] bg-[#0A0A0C]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#121316] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <span className="text-xs font-mono font-medium text-zinc-300">{label}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
          aria-label="Copy prompt content"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre className="max-h-[480px] overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
