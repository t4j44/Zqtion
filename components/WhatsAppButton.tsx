import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";

export default function WhatsAppButton() {
  const url = `${siteConfig.whatsapp}?text=${encodeURIComponent("I want to discuss a project with Zqtion.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Message Zqtion on WhatsApp"
      data-analytics="whatsapp_click"
      data-analytics-location="floating_button"
      className="whatsapp-float fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#101319]/90 text-white shadow-2xl backdrop-blur-xl hover:bg-[#25D366] sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
