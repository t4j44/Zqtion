import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import LaunchpadApplicationForm from "@/components/LaunchpadApplicationForm";
import { careerTracks, launchpad } from "@/data/careers";

export const metadata: Metadata = { title: "Apply to Zqtion Launchpad", description: "Prepare an application for Zqtion's 12-week, unpaid, learning-first apprenticeship. Read eligibility and program terms before applying.", alternates: { canonical: "/careers/apply" }, robots: { index: false, follow: true } };

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const { track } = await searchParams;
  const defaultTrack = careerTracks.some(({ slug }) => slug === track) ? track! : "";
  const accepting = process.env.LAUNCHPAD_APPLICATIONS_ENABLED === "true";
  return (
    <main id="main-content" className="launchpad-page">
      <header className="section-shell launchpad-apply-hero">
        <Link className="launchpad-text-link" href="/careers"><ArrowLeft className="h-4 w-4" />Back to Launchpad</Link>
        <p className="eyebrow mt-10">Your starting point</p>
        <h1>Bring your curiosity.<br /><span className="font-editorial">Tell us your direction.</span></h1>
        <p className="launchpad-lead">12 weeks. 8–12 hours a week. Remote-first. Unpaid and learning-first. No employment guarantee.</p>
        <p className="launchpad-notice mt-8"><strong>{accepting ? "Read the terms before applying." : "Application preview. Intake is not open yet."}</strong> Initial cohort: 18+ only. Locations, mentor capacity, program terms and dates are confirmed before enrollment. {accepting ? "Submitting confirms an application, not a place." : "You can explore and check the form; no answers will be sent or saved."}</p>
      </header>
      <section className="section-shell pb-24">
        <div className="launchpad-application-shell">
          <LaunchpadApplicationForm tracks={careerTracks.map(({ slug, title, question }) => ({ slug, title, question }))} defaultTrack={defaultTrack} accepting={accepting} acknowledgement={launchpad.acknowledgement} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
