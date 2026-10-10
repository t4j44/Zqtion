import type { ReactNode } from "react";
import SectionIcon, { type SectionIconName } from "@/components/SectionIcon";

export default function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
  icon,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  icon?: SectionIconName;
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      {icon ? <SectionIcon name={icon} className={centered ? "mx-auto" : ""} /> : null}
      <p className={centered ? "eyebrow eyebrow-center" : "eyebrow"}>{eyebrow}</p>
      <h2 className="mt-5 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-6 text-pretty text-base leading-7 text-white/55 sm:text-lg sm:leading-8 ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
