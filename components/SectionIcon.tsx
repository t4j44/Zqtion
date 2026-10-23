export type SectionIconName = "work" | "services" | "process" | "faq" | "engagements";

/** Rendered 3D icon tile (scripts/render-3d). Static AVIF/WebP with real alpha; the float is transform-only CSS. */
export default function SectionIcon({ name, className = "" }: { name: SectionIconName; className?: string }) {
  return (
    <span className={`section-icon ${className}`} aria-hidden="true">
      <picture>
        <source type="image/avif" srcSet={`/3d/icon-${name}.avif`} />
        <img src={`/3d/icon-${name}.webp`} width={384} height={384} alt="" loading="lazy" decoding="async" draggable={false} />
      </picture>
    </span>
  );
}
