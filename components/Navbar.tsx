"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      navRootRef.current?.querySelector(".site-header")?.classList.toggle("site-header-active", window.scrollY > 24);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;

    const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const trigger = menuButtonRef.current;
    const focusFirst = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !navRootRef.current) return;
      const focusable = Array.from(navRootRef.current.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = "";
      (previouslyFocused || trigger)?.focus();
    };
  }, [open]);

  return (
    <div ref={navRootRef} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label={open ? "Navigation menu" : undefined}>
      <header className={`site-header fixed inset-x-0 top-0 z-50 transition duration-300 ${open ? "site-header-active" : "bg-transparent"}`}>
        <div className="mx-auto flex h-[4.75rem] max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-16">
          <Link href="/" className="group inline-flex min-h-11 shrink-0 items-center gap-3" aria-label="Zqtion home" onClick={() => setOpen(false)}>
            <span className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-black">
              <Image src="/logo.png" alt="" fill sizes="36px" priority className="object-cover" />
            </span>
            <span className="text-sm font-extrabold tracking-[0.18em] text-white">ZQTION</span>
          </Link>

          <nav className="hidden items-center gap-4 xl:gap-7 xl:flex" aria-label="Primary navigation">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={`text-sm transition ${active ? "text-white" : "text-white/52 hover:text-white"}`} aria-current={active ? "page" : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden xl:block">
            <Link href="/contact" className="button-primary" data-analytics="service_contact_click" data-analytics-location="navbar">
              Start a project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button ref={menuButtonRef} type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {open ? (
          <div
            ref={menuRef}
            id="mobile-menu"
            className="mobile-menu-enter fixed inset-0 z-40 flex overflow-y-auto bg-[#050608] px-5 pb-10 pt-28 xl:hidden"
          >
            <nav className="flex h-fit min-h-full w-full flex-col justify-between gap-8" aria-label="Mobile navigation">
              <div className="border-t border-white/10">
                {navigation.map((item, index) => (
                  <div className="mobile-menu-item" key={item.href} style={{ "--menu-index": index } as React.CSSProperties}>
                    <Link href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-white/10 py-5 text-3xl font-semibold tracking-[-0.04em]">
                      {item.label}<span className="text-sm text-white/35">0{index + 1}</span>
                    </Link>
                  </div>
                ))}
              </div>
              <Link href="/contact" onClick={() => setOpen(false)} className="button-primary w-full" data-analytics="service_contact_click" data-analytics-location="mobile_menu">Start a project <ArrowUpRight className="h-4 w-4" /></Link>
            </nav>
          </div>
      ) : null}
    </div>
  );
}
