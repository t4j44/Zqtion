"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { safePath, safeReferrer } from "@/lib/request-validation";

export type AnalyticsEvent =
  | "page_view"
  | "hero_primary_cta"
  | "hero_secondary_cta"
  | "work_view"
  | "work_contact_click"
  | "service_contact_click"
  | "ai_audit_click"
  | "whatsapp_click"
  | "email_click"
  | "form_start"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "web_vital";

export type Attribution = {
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
};

const ATTRIBUTION_KEY = "zqtion_attribution_v2";
const SESSION_KEY = "zqtion_session_v1";

function clean(value: string | null, limit = 500) {
  return (value || "").trim().slice(0, limit);
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") {
    return { landingPath: "", referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "" };
  }

  try {
    const existing = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (existing) return JSON.parse(existing) as Attribution;
  } catch {
    // Storage can be disabled. The request still gets current-page attribution.
  }

  const query = new URLSearchParams(window.location.search);
  const attribution: Attribution = {
    landingPath: safePath(window.location.pathname),
    referrer: safeReferrer(document.referrer),
    utmSource: clean(query.get("utm_source"), 120),
    utmMedium: clean(query.get("utm_medium"), 120),
    utmCampaign: clean(query.get("utm_campaign"), 160),
    utmContent: clean(query.get("utm_content"), 160),
  };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Best-effort attribution only.
  }
  return attribution;
}

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = window.crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return "";
  }
}

export function trackEvent(event: AnalyticsEvent, metadata: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1"
    || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;

  const payload = JSON.stringify({
    event,
    path: safePath(window.location.pathname),
    sessionId: getSessionId(),
    attribution: getAttribution(),
    metadata,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export default function Analytics() {
  const pathname = usePathname();
  useReportWebVitals((metric) => {
    trackEvent("web_vital", {
      name: metric.name,
      value: Math.round(metric.value * 1000) / 1000,
      rating: metric.rating,
    });
  });

  useEffect(() => {
    getAttribution();
    trackEvent("page_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-analytics]");
      const eventName = target?.dataset.analytics as AnalyticsEvent | undefined;
      if (!target || !eventName) return;

      const metadata = Object.fromEntries(
        Object.entries(target.dataset)
          .filter(([key, value]) => key !== "analytics" && key.startsWith("analytics") && value)
          .map(([key, value]) => [key.replace(/^analytics/, "").replace(/^./, (letter) => letter.toLowerCase()), value as string]),
      );
      trackEvent(eventName, metadata);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
