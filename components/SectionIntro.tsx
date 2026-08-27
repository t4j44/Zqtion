import type { ReactNode } from "react";

export default function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-5 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
