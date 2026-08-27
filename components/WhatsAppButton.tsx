"use client";

import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/data/site";

export default function WhatsAppButton() {
  const reducedMotion = useReducedMotion();
  const url = `${siteConfig.whatsapp}?text=${encodeURIComponent("I want to discuss a project with Zqtion.")}`;
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Message Zqtion on WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#101319]/90 text-white shadow-2xl backdrop-blur-xl hover:bg-[#25D366] sm:bottom-6 sm:right-6"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : 0.8, duration: 0.35 }}
      whileHover={reducedMotion ? undefined : { y: -2 }}
    >
      <MessageCircle className="h-5 w-5" />
    </motion.a>
  );
}
