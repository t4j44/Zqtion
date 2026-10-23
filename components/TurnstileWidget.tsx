"use client";

import Script from "next/script";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widget?: string | HTMLElement) => void;
  remove: (widget: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }
export type TurnstileHandle = { reset: () => void };

const TurnstileWidget = forwardRef<TurnstileHandle, { action: "inquiry" | "launchpad" }>(function TurnstileWidget({ action }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const configurationRef = useRef("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const reset = useCallback(() => {
    setToken("");
    setMessage("");
    if (widgetRef.current !== null) window.turnstile?.reset(widgetRef.current);
  }, []);
  useImperativeHandle(ref, () => ({ reset }), [reset]);

  const mount = useCallback(() => {
    if (!siteKey || !hostRef.current || !window.turnstile || widgetRef.current !== null) return;
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const size = hostRef.current.clientWidth < 300 ? "compact" : "flexible";
    configurationRef.current = `${theme}:${size}`;
    widgetRef.current = window.turnstile.render(hostRef.current, {
      sitekey: siteKey, theme, size, action, "response-field": false,
      callback: (value: string) => { setToken(value); setMessage(""); },
      "expired-callback": () => { setToken(""); setMessage("Verification expired. Please verify again before submitting."); },
      "error-callback": () => { setToken(""); setMessage("Verification could not load. Check your connection and try again."); },
    });
  }, [action, siteKey]);

  useEffect(() => {
    mount();
    const host = hostRef.current;
    if (!host) return;
    const adapt = () => {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const size = host.clientWidth < 300 ? "compact" : "flexible";
      if (widgetRef.current !== null && configurationRef.current !== `${theme}:${size}`) {
        window.turnstile?.remove(widgetRef.current);
        widgetRef.current = null;
        setToken("");
      }
      mount();
    };
    const resize = new ResizeObserver(adapt);
    resize.observe(host);
    const theme = new MutationObserver(adapt);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      resize.disconnect();
      theme.disconnect();
      if (widgetRef.current !== null) window.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [mount]);

  if (!siteKey) return null;
  return <div className="min-w-0">
    <Script id="zqtion-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={mount} onError={() => setMessage("Verification is unavailable. Your form has not been sent; please try again later.")} />
    <div ref={hostRef} className="min-w-0" />
    <input type="hidden" name="cf-turnstile-response" value={token} />
    <div aria-live="polite">{message ? <p className="mt-3 text-sm leading-6 text-error">{message} {window.turnstile ? <button className="min-h-11 underline underline-offset-4" type="button" onClick={reset}>Retry verification</button> : null}</p> : null}</div>
  </div>;
});
export default TurnstileWidget;
