"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const pathname = usePathname(); const [footerVisible, setFooterVisible] = useState(true);
  const [heroOnPhone, setHeroOnPhone] = useState(false);
  // On phones the floating button would sit on top of the hero buttons, so it appears after the hero scrolls away.
  useEffect(() => {
    const hero = document.querySelector(".hero-journey");
    const phone = window.matchMedia("(max-width: 767px)");
    if (!hero) return;
    let visible = true;
    const update = () => setHeroOnPhone(phone.matches && visible);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.intersectionRatio > 0.35; update(); }, { threshold: [0, 0.35, 0.7] });
    observer.observe(hero);
    phone.addEventListener("change", update);
    return () => { observer.disconnect(); phone.removeEventListener("change", update); setHeroOnPhone(false); };
  }, [pathname]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => setFooterVisible(entries.some(e => e.isIntersecting)), { rootMargin: "90px 0px 0px" });
    document.querySelectorAll("footer").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
  // Community and form pages already provide inline contact links; keep the work area clear.
  if (footerVisible || heroOnPhone || /^\/(ai-experiences|community|prompts|share|u|contact|launchpad)(\/|$)/.test(pathname)) return null;
  const url = `${siteConfig.whatsapp}?text=${encodeURIComponent("I want to discuss a project with Zqtion.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Message Zqtion on WhatsApp"
      data-analytics="whatsapp_click"
      data-analytics-location="floating_button"
      className="whatsapp-float fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-surface/90 text-foreground shadow-2xl backdrop-blur-xl hover:bg-[#25D366] sm:right-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <WhatsAppGlyph />
    </a>
  );
}
