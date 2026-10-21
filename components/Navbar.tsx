"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/site";
import ThemeToggle from "@/components/ThemeToggle";

const groups = [
  { label: "Company", links: [{ href: "/", label: "Home" }, ...navigation.filter(i => ["/work", "/services", "/process", "/about"].includes(i.href)), { href: "/contact", label: "Contact" }] },
  { label: "Discover", links: navigation.filter(i => ["/prompts", "/resources", "/ai-experiences", "/insights"].includes(i.href)) },
  { label: "Opportunities", links: navigation.filter(i => i.href === "/careers") },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRootRef = useRef<HTMLDivElement>(null);
  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; navRootRef.current?.querySelector(".site-header")?.classList.toggle("site-header-active", window.scrollY > 24 || open || Boolean(dropdown)); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); };
  }, [open, dropdown]);

  useEffect(() => {
    if (!dropdown) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !navRootRef.current?.contains(event.target)) setDropdown(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { navRootRef.current?.querySelector<HTMLButtonElement>(`[data-nav-group="${dropdown}"]`)?.focus(); setDropdown(null); } };
    const focus = (event: FocusEvent) => { if (event.target instanceof Node && !navRootRef.current?.contains(event.target)) setDropdown(null); };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape); document.addEventListener("focusin", focus);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); document.removeEventListener("focusin", focus); };
  }, [dropdown]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const siblings = Array.from(document.body.children).filter((e): e is HTMLElement => e instanceof HTMLElement && e !== navRootRef.current && !["SCRIPT", "STYLE", "LINK"].includes(e.tagName));
    const previousInert = siblings.map(e => e.inert); siblings.forEach(e => { e.inert = true; });
    const trigger = menuButtonRef.current;
    const selector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>(selector)?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(navRootRef.current?.querySelectorAll<HTMLElement>(selector) || []).filter(e => e.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const desktop = matchMedia("(min-width: 1024px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", keydown); desktop.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(frame); document.removeEventListener("keydown", keydown); desktop.removeEventListener("change", resize);
      document.body.style.overflow = previousOverflow; siblings.forEach((e, i) => { e.inert = previousInert[i]; }); trigger?.focus();
    };
  }, [open]);

  const close = () => { setOpen(false); setDropdown(null); };
  return <div ref={navRootRef} role={open ? "dialog" : undefined} aria-modal={open ? true : undefined} aria-label={open ? "Navigation menu" : undefined}>
    <header className={`site-header fixed z-50 ${open || dropdown ? "site-header-active" : ""}`}>
      <div className="nav-bar">
        <Link href="/" className="nav-brand" aria-label="Zqtion home" onClick={close}>
          <span className="nav-logo"><Image src="/logo.png" alt="" fill sizes="36px" priority className="object-cover" /></span>
          <span>ZQTION</span>
        </Link>
        <nav className="desktop-navigation" aria-label="Primary navigation">
          <Link href="/work" className="nav-link" aria-current={active('/work') ? "page" : undefined} onClick={close}>Work</Link>
          <Link href="/services" className="nav-link" aria-current={active('/services') ? "page" : undefined} onClick={close}>Services</Link>
          {groups.map(group => <div className="nav-group" key={group.label}>
            <button className="nav-link" type="button" data-nav-group={group.label} aria-expanded={dropdown === group.label} aria-controls={`nav-${group.label}`} onClick={() => setDropdown(dropdown === group.label ? null : group.label)}>{group.label}<ChevronDown aria-hidden="true" className="h-3.5 w-3.5" /></button>
            {dropdown === group.label ? <div className="nav-dropdown" id={`nav-${group.label}`}><p className="nav-group-label">{group.label}</p>{group.links.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} onClick={close}>{item.label}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>)}</div> : null}
          </div>)}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/contact" className="button-primary nav-project" onClick={close} data-analytics="service_contact_click" data-analytics-location="navbar">Start a project <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          <button ref={menuButtonRef} type="button" className="nav-menu-toggle" onClick={() => { setDropdown(null); setOpen(value => !value); }} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}</button>
        </div>
      </div>
    </header>
    {open ? <div ref={menuRef} id="mobile-menu" className="mobile-menu-enter mobile-navigation">
      <nav aria-label="Mobile navigation">
        <div className="mobile-nav-groups">{groups.map(group => <section key={group.label} aria-label={group.label}><p className="nav-group-label">{group.label}</p>{group.links.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} onClick={close}>{item.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>)}</section>)}</div>
        <div className="mobile-nav-actions"><Link href="/contact" className="button-primary" onClick={close} data-analytics="service_contact_click" data-analytics-location="mobile_menu">Start a project <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link><Link href="/community/account?next=%2Fai-experiences" className="button-secondary" onClick={close}>Join the community</Link></div>
      </nav>
    </div> : null}
  </div>;
}
