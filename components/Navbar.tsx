"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { navigation } from "@/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${scrolled || open ? "border-b border-white/10 bg-[#050608]/82 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-[4.75rem] max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-16">
          <Link href="/" className="group flex items-center gap-3" aria-label="Zqtion home" onClick={() => setOpen(false)}>
            <span className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-black">
              <Image src="/logo.png" alt="" fill sizes="36px" priority className="object-cover" />
            </span>
            <span className="text-sm font-extrabold tracking-[0.18em] text-white">ZQTION</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={`text-sm transition ${active ? "text-white" : "text-white/52 hover:text-white"}`} aria-current={active ? "page" : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <Link href="/contact" className="button-primary">
              Start a project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex bg-[#050608] px-5 pb-10 pt-28 lg:hidden"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <nav className="flex w-full flex-col justify-between" aria-label="Mobile navigation">
              <div className="border-t border-white/10">
                {navigation.map((item, index) => (
                  <motion.div key={item.href} initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <Link href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-white/10 py-5 text-3xl font-semibold tracking-[-0.04em]">
                      {item.label}<span className="text-sm text-white/35">0{index + 1}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link href="/contact" onClick={() => setOpen(false)} className="button-primary w-full">Start a project <ArrowUpRight className="h-4 w-4" /></Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
