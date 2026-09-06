export type HeroRenderMode = "mobile-poster" | "desktop-poster" | "desktop-webgl" | "static";

export type HeroCapabilityProfile = {
  viewportWidth: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  effectiveType?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  webglSupported: boolean;
};

export function isWebGLMode(mode: HeroRenderMode) {
  return mode === "desktop-webgl";
}

export function selectHeroRenderMode(profile: HeroCapabilityProfile): HeroRenderMode {
  const slowNetwork = profile.effectiveType === "slow-2g" || profile.effectiveType === "2g";

  if (profile.reducedMotion || profile.saveData || slowNetwork) return "static";

  // Phones and touch-first devices stay on the poster so the Three.js chunk is never requested.
  if (profile.viewportWidth <= 767 || profile.coarsePointer) return "mobile-poster";

  if (!profile.webglSupported) return "desktop-poster";

  return "desktop-webgl";
}
