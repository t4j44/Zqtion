"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";

export default function WhatsAppButton() {
  const pathname = usePathname(); const [footerVisible, setFooterVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => setFooterVisible(entries.some(e => e.isIntersecting)), { rootMargin: "90px 0px 0px" });
    document.querySelectorAll("footer").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
  // Community and form pages already provide inline contact links; keep the work area clear.
  if (footerVisible || /^\/(ai-experiences|community|prompts|share|u|contact|launchpad)(\/|$)/.test(pathname)) return null;
  const url = `${siteConfig.whatsapp}?text=${encodeURIComponent("I want to discuss a project with Zqtion.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Message Zqtion on WhatsApp"
      data-analytics="whatsapp_click"
      data-analytics-location="floating_button"
      className="whatsapp-float fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#101319]/90 text-white shadow-2xl backdrop-blur-xl hover:bg-[#25D366] sm:right-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
