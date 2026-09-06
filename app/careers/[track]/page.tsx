import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import Footer from "@/components/Footer";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { careerTracks, launchpad } from "@/data/careers";
import { siteConfig } from "@/data/site";

export function generateStaticParams() { return careerTracks.map(({ slug }) => ({ track: slug })); }
export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params;
  const item = careerTracks.find(({ slug }) => slug === track);
  if (!item) return { title: "Track not found", robots: { index: false } };
  const title = `${item.title} — Launchpad`;
  const description = `${item.summary} Explore this 12-week unpaid apprenticeship: responsibilities, learning, requirements and possible next steps.`;
  return { title, description, alternates: { canonical: `/careers/${item.slug}` }, openGraph: { title, description, url: `/careers/${item.slug}`, images: ["/og-image.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] } };
}

function RoleList({ title, items }: { title: string; items: string[] }) {
  return <section className="launchpad-role-section"><h2>{title}</h2><ul className="launchpad-checklist">{items.map((item) => <li key={item}><Check className="h-4 w-4" />{item}</li>)}</ul></section>;
}

export default async function CareerTrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  const item = careerTracks.find(({ slug }) => slug === track);
  if (!item) notFound();
  const applyUrl = `/careers/apply?track=${item.slug}`;
  return <main id="main-content" className="launchpad-page">
    <JsonLd schema={getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Launchpad", url: `${siteConfig.url}/careers` }, { name: item.title, url: `${siteConfig.url}/careers/${item.slug}` }])} />
    <header className="section-shell launchpad-role-hero"><Link className="launchpad-text-link" href="/careers#tracks"><ArrowLeft className="h-4 w-4" />All Launchpad tracks</Link><p className="eyebrow mt-10">{item.pod} pod / Zqtion Launchpad</p><h1>{item.title}</h1><p className="launchpad-lead">{item.summary}</p><div className="launchpad-role-terms"><span>Up to 3 places</span><span>12 weeks</span><span>Remote-first</span><span>8–12 hours/week</span><strong>Unpaid</strong></div><Link className="button-primary mt-8" href={applyUrl}>Application for this track <ArrowUpRight className="h-4 w-4" /></Link><p className="mt-5 text-sm leading-6 text-white/65">Learning-first · Initial intake 18+ · Places depend on mentor capacity · No employment guarantee</p></header>
    <div className="section-shell launchpad-role-layout">
      <div><RoleList title="What you'll work on" items={item.responsibilities} /><RoleList title="What you'll learn" items={item.learning} /><RoleList title="What we're looking for" items={item.requirements} /><RoleList title="Helpful, not required" items={item.optional} /><RoleList title="Useful tools" items={item.tools} /><section className="launchpad-role-section"><h2>A question to think about</h2><p className="mt-5 text-lg leading-8 text-white/75">{item.question}</p><p className="mt-4 text-sm text-white/60">You will see this in the application. We want your thinking, not a polished professional answer.</p></section></div>
      <aside><div className="launchpad-role-summary"><p className="eyebrow">What you’ll leave with</p><h2>A piece of work<br /><span className="font-editorial">you can explain.</span></h2><p>{item.artifact}</p><p>Structured training, supervised practice, weekly feedback, a final review and CV/LinkedIn guidance. Public portfolio use requires permission.</p><hr /><h3>Certificate of Completion</h3><p>Earned through meaningful participation, required assignments, a final project, professional conduct and mentor approval. It records your track, cohort, duration and completion date.</p><hr /><h3>Path after Launchpad</h3><p>{launchpad.opportunity}</p><p>References are reserved for exceptional performance. No paid work or employment is guaranteed.</p><Link className="button-primary mt-7" href={applyUrl}>Explore the application <ArrowUpRight className="h-4 w-4" /></Link></div></aside>
    </div>
    <section className="section-shell py-16"><p className="launchpad-notice">Practice is supervised. Apprentices must not independently control client contracts, payments, confidential production systems, credentials, commercial commitments or final publication. Program availability and jurisdiction eligibility are confirmed before enrollment.</p><Link className="launchpad-text-link mt-6" href="/careers#tracks">Compare other tracks <ArrowUpRight className="h-4 w-4" /></Link></section><Footer />
  </main>;
}
