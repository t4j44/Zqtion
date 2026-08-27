import Link from "next/link";
import { ArrowDownRight } from "lucide-react";

export default function PageHero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <header className="page-hero section-shell overflow-hidden">
      <div className="signal-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="orb orb-blue -left-40 top-20" aria-hidden="true" />
      <div className="relative z-10 max-w-6xl pt-28 sm:pt-36">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-7 max-w-6xl text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.055em] text-white sm:text-7xl lg:text-[7.8rem]">
          {title}
        </h1>
        <div className="mt-10 grid gap-8 border-t border-white/10 pt-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-2xl text-pretty text-lg leading-8 text-white/58 sm:text-xl">
            {description}
          </p>
          {primary || secondary ? (
            <div className="flex flex-wrap gap-3">
              {primary ? (
                <Link className="button-primary" href={primary.href}>
                  {primary.label}
                  <ArrowDownRight className="h-4 w-4" />
                </Link>
              ) : null}
              {secondary ? (
                <Link className="button-secondary" href={secondary.href}>
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
