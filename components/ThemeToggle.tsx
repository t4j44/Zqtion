"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { DESKTOP_THEME_QUERY, THEME_KEY, type Theme } from "@/lib/theme";

let visitChoice: Theme | null = null;

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#050608" : "#f7f8fa";
}

function subscribe(onChange: () => void) {
  const desktop = matchMedia(DESKTOP_THEME_QUERY);
  const sync = () => {
    let choice: string | null = visitChoice;
    try { choice = localStorage.getItem(THEME_KEY); } catch { /* Private/storage-disabled mode. */ }
    visitChoice = choice === "light" || choice === "dark" ? choice : null;
    applyTheme(visitChoice ?? (desktop.matches ? "dark" : "light"));
    onChange();
  };
  const storage = (event: StorageEvent) => { if (event.key === THEME_KEY || event.key === null) sync(); };
  desktop.addEventListener("change", sync);
  window.addEventListener("storage", storage);
  window.addEventListener("zqtion-theme-change", onChange);
  return () => {
    desktop.removeEventListener("change", sync);
    window.removeEventListener("storage", storage);
    window.removeEventListener("zqtion-theme-change", onChange);
  };
}
const snapshot = () => document.documentElement.dataset.theme;
const serverSnapshot = () => undefined;

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const label = theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Switch color theme";
  return <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={() => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    visitChoice = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* Selection still works for this visit. */ }
    window.dispatchEvent(new Event("zqtion-theme-change"));
  }}><Sun className="theme-icon theme-icon-sun" aria-hidden="true" /><Moon className="theme-icon theme-icon-moon" aria-hidden="true" /></button>;
}
