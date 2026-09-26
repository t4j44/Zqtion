export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* Try selection-based copying when clipboard access is unavailable. */ }
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text; area.setAttribute("aria-label", "Text to copy");
  area.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0";
  document.body.appendChild(area); area.select();
  try { return document.execCommand("copy"); } catch { return false; }
  finally { area.remove(); active?.focus(); }
}
const storageKey = "zqtion.saved-prompts.v1";
export function readSaved(): string[] {
  try { const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(parsed) ? [...new Set(parsed.filter((v): v is string => typeof v === "string" && /^zq-\d+$/.test(v)))].slice(0, 500) : []; } catch { return []; }
}
export function toggleSaved(id: string) {
  const existing = readSaved();
  const next = existing.includes(id) ? existing.filter((v) => v !== id) : [...existing, id].slice(0, 500);
  localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event("zqtion-saved"));
  return next.includes(id);
}
export function subscribeSaved(callback: () => void) {
  window.addEventListener("storage", callback); window.addEventListener("zqtion-saved", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("zqtion-saved", callback); };
}
