export type Theme = "light" | "dark";
export const THEME_KEY = "zqtion-theme";
export const DESKTOP_THEME_QUERY = "(min-width: 1024px)";

// Runs in <head>, before the body can paint. Keep self-contained and storage-safe.
export const themeInitScript = `(()=>{let t;try{t=localStorage.getItem('zqtion-theme')}catch{}if(t!=='light'&&t!=='dark')t=matchMedia('${DESKTOP_THEME_QUERY}').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='dark'?'#050608':'#f7f8fa'})()`;
