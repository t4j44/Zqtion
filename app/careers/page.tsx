import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Plus } from "lucide-react";
import Footer from "@/components/Footer";
import LaunchpadArtwork from "@/components/LaunchpadArtwork";
import JsonLd, { getBreadcrumbSchema, getFAQSchema } from "@/components/seo/JsonLd";
import { applicantRequirements, careerTracks, coreTraining, launchpad, launchpadFaqs, memberBenefits, memberResponsibilities, pods, programTimeline } from "@/data/careers";
import { siteConfig } from "@/data/site";

export const dynamic = "force-dynamic";
const description = "Explore Zqtion Launchpad: a 12-week, unpaid, part-time AI-native apprenticeship. 14 beginner-friendly tracks, structured training, feedback and supervised practice.";
export const metadata: Metadata = {
  title: "Careers — Zqtion Launchpad", description, alternates: { canonical: "/careers" },
  openGraph: { title: "Your experience has to start somewhere. | Zqtion Launchpad", description, url: "/careers", images: ["/og-image.png"] },
  twitter: { card: "summary_large_image", title: "Zqtion Launchpad — 12-Week AI-Native Apprenticeship", description, images: ["/og-image.png"] },
};

export default function CareersPage() {
  const accepting = process.env.LAUNCHPAD_APPLICATIONS_ENABLED === "true";
  return (
    <main id="main-content" className="launchpad-page">
      <JsonLd schema={[getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Careers", url: `${siteConfig.url}/careers` }]), getFAQSchema(launchpadFaqs)]} />
      <section className="section-shell launchpad-hero">
        <div className="launchpad-hero-copy">
          <p className="eyebrow">Zqtion Launchpad</p>
          <p className="mt-5 text-sm text-white/60">{launchpad.subtitle}</p>
          <h1>Your experience<br />has to start <span className="font-editorial">somewhere.</span></h1>
          <p className="launchpad-lead">Learn inside an AI-native execution studio through a 12-week practical apprenticeship built around training, feedback and real execution.</p>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/65">No years-of-experience requirement. First-year university students and beginners are encouraged to apply.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a className="button-primary" href="#tracks">Explore the tracks <ArrowDown className="h-4 w-4" /></a><Link className="button-secondary" href="/careers/apply">{accepting ? "Apply to Launchpad" : "Preview application"} <ArrowUpRight className="h-4 w-4" /></Link></div>
        </div>
        <LaunchpadArtwork />
      </section>

      <section className="launchpad-facts" aria-label="Program facts">
        <div className="section-shell"><span><strong>12</strong> weeks</span><span><strong>14</strong> tracks</span><span><strong>Up to 3</strong> places / track</span><span><strong>8–12</strong> hours / week</span><span>Remote-first · <strong>Unpaid</strong></span></div>
      </section>
      <div className="section-shell pt-6">
        <p className="launchpad-notice"><strong>{accepting ? "Applications open." : "Cohort in preparation. Applications are not open yet."}</strong> Unpaid, learning-first and part-time. Initial intake: 18+ and legally eligible in an accepted jurisdiction. Start dates, session times and actual places are confirmed before enrollment. No employment guarantee.</p>
      </div>

      <section className="section-shell section-pad launchpad-editorial">
        <p className="eyebrow">Why Launchpad</p>
        <div><h2 className="launchpad-heading">Learn the work<br /><span className="font-editorial">by doing the work.</span></h2><p className="mt-7 max-w-3xl text-xl leading-8 text-white/75">We care more about how quickly you learn, how reliably you show up and what you can build than how impressive your CV already looks.</p><p className="mt-5 max-w-3xl leading-7 text-white/60">This is a structured learning program, not a shortcut to free employee capacity. Practice comes first. Responsibility grows with demonstrated readiness and stays supervised.</p><div className="launchpad-values"><span>Curiosity over credentials</span><span>Consistency over certificates</span><span>Quality over quantity</span></div></div>
      </section>

      <section className="launchpad-surface">
        <div className="section-shell section-pad">
          <p className="eyebrow">What you receive</p><h2 className="launchpad-heading mt-6">More than a line<br /><span className="font-editorial">on your CV.</span></h2>
          <div className="launchpad-benefits">{memberBenefits.map((benefit, index) => <article key={benefit.title}><span className="launchpad-index">{String(index + 1).padStart(2, "0")}</span><div><h3>{benefit.title}</h3><p>{benefit.text}</p></div></article>)}</div>
          <p className="mt-8 max-w-3xl text-sm leading-6 text-white/65">These are the planned program commitments. Cohorts open only when supervision and learning resources are ready. Recommendations and paid opportunities are conditional; neither is automatically earned by attending.</p>
        </div>
      </section>

      <section id="tracks" className="section-shell section-pad">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Find your starting point</p><h2 className="launchpad-heading mt-6">Different strengths.<br /><span className="font-editorial">One Launchpad.</span></h2></div><p className="max-w-sm text-sm leading-6 text-white/65">14 tracks across four pods. Up to 3 places per track, not a promise to fill every place. Explore what you will do, learn and need before choosing.</p></div>
        <nav className="launchpad-pod-links" aria-label="Jump to a track pod">{pods.map((pod) => <a key={pod} href={`#pod-${pod.toLowerCase()}`}>{pod} <ArrowDown className="h-3.5 w-3.5" /></a>)}</nav>
        {pods.map((pod, podIndex) => <div id={`pod-${pod.toLowerCase()}`} key={pod} className="launchpad-pod-group"><div className="launchpad-pod-heading"><h3><span>0{podIndex + 1}</span> {pod} pod</h3><p>One mentor per pod planned · Places depend on mentor capacity</p></div><div className="launchpad-track-grid">{careerTracks.filter((track) => track.pod === pod).map((track) => <article className="launchpad-track" key={track.slug}><div className="flex items-start justify-between gap-5"><span className="launchpad-index">{String(careerTracks.indexOf(track) + 1).padStart(2, "0")}</span><span className="launchpad-seat-label">Up to 3 places</span></div><h4><Link href={`/careers/${track.slug}`}>{track.title} <ArrowUpRight aria-hidden="true" /></Link></h4><p>{track.summary}</p><div className="launchpad-track-terms">12 weeks · Remote-first · Part-time · Unpaid</div><p className="text-sm">{track.requirements[track.requirements.length - 1]}</p><Link className="launchpad-text-link" href={`/careers/${track.slug}`}>Role, learning & requirements <ArrowUpRight className="h-4 w-4" /></Link></article>)}</div></div>)}
      </section>

      <section className="launchpad-surface"><div className="section-shell section-pad">
        <p className="eyebrow">The 12-week journey</p><h2 className="launchpad-heading mt-6">From first attempt<br /><span className="font-editorial">to finished work.</span></h2>
        <ol className="launchpad-timeline">{programTimeline.map((step) => <li key={step.weeks}><span>Weeks {step.weeks}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        <div className="launchpad-training"><div><p className="eyebrow">The learning loop</p><h3>Learn. Practice.<br />Execute. Review.<br /><span className="font-editorial">Document.</span></h3><p>No high-impact responsibility in weeks 1–4. Supervised contribution in weeks 5–8. Bounded ownership in weeks 9–12.</p></div><div><h3 className="text-xl font-semibold">A shared foundation for every track</h3><ul className="launchpad-core-list">{coreTraining.map((item) => <li key={item}><Check className="h-4 w-4" />{item}</li>)}</ul></div></div>
      </div></section>

      <section className="section-shell section-pad launchpad-editorial">
        <p className="eyebrow">A week at Launchpad</p><div><h2 className="launchpad-heading">A rhythm you can<br /><span className="font-editorial">build around.</span></h2><ol className="launchpad-week">{[ ["Monday", "Brief and agree on the week's goals."], ["During the week", "Learn, practice and execute your agreed scope."], ["Mid-week", "Share questions and blockers early."], ["End of week", "Submit work for mentor review."], ["After review", "Improve the work. Document what worked, what failed and what changes next."] ].map(([day, text]) => <li key={day}><strong>{day}</strong><p>{text}</p></li>)}</ol><p className="mt-6 text-sm leading-6 text-white/60">This is the proposed weekly rhythm; exact session times and availability are agreed before enrollment.</p></div>
      </section>

      <section className="section-shell section-pad border-t border-white/10"><p className="eyebrow">What you bring</p><div className="launchpad-two-column"><div><h2 className="launchpad-heading">You can be new.<br /><span className="font-editorial">You need to show up.</span></h2><ul className="launchpad-checklist">{applicantRequirements.map((item) => <li key={item}><Check className="h-4 w-4" />{item}</li>)}</ul><p className="mt-6 text-sm leading-6 text-white/65">You do not need a previous job, internship, prestigious university, professional certificate, expensive AI subscription, perfect portfolio or computer-science degree.</p></div><div className="launchpad-responsibilities"><h3 className="text-2xl font-semibold">The standard we share</h3><ul className="launchpad-checklist">{memberResponsibilities.map((item) => <li key={item}><Plus className="h-4 w-4" />{item}</li>)}</ul><p className="launchpad-notice mt-7">No independent control of contracts, payments, production credentials, confidential systems, commercial commitments, inappropriate unsupervised client communication or final publication.</p></div></div></section>

      <section className="launchpad-surface"><div className="section-shell section-pad"><p className="eyebrow">Beyond week twelve</p><h2 className="launchpad-heading mt-6">A pathway.<br /><span className="font-editorial">Not a promise.</span></h2><ol className="launchpad-pathway">{[["Learn", "Launchpad Apprentice"], ["Prove", "Complete projects. Demonstrate reliability."], ["Contribute", "Potential paid project / freelance work"], ["Grow", "Potential paid internship / part-time role"], ["Join", "Potential core-team role"]].map(([label, text], index) => <li key={label}><span>0{index + 1} / {label}</span><strong>{text}</strong></li>)}</ol><p className="mt-8 max-w-3xl leading-7 text-white/70">{launchpad.opportunity}</p><p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">Every transition depends on performance, business need, revenue, legal eligibility and availability. Completion does not guarantee a job. A successful participant should leave with practical ability, a finished artifact where permitted, written feedback, career clarity and relationships with the team.</p></div></section>

      <section className="section-shell section-pad launchpad-editorial"><p className="eyebrow">Selection</p><div><h2 className="launchpad-heading">Show us how<br /><span className="font-editorial">you think.</span></h2><ol className="launchpad-selection">{[["Apply", "Tell us what interests you and something you have tried."], ["Shortlist", "We look for curiosity, fit and realistic availability."], ["Practical challenge", "A bounded 30–60 minute exercise, not unpaid production work."], ["Conversation", "A 15–20 minute discussion about your work and expectations."], ["Selection", "Confirm track, support, dates and terms before enrolling."]].map(([title, text], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>

      <section className="section-shell section-pad border-t border-white/10"><p className="eyebrow">No fine-print surprises</p><h2 className="launchpad-heading mt-6">The questions<br /><span className="font-editorial">worth asking.</span></h2><div className="mt-12 border-t border-white/10">{launchpadFaqs.map((faq, index) => <details className="faq-item" key={faq.question}><summary><span className="text-cyan-300">{String(index + 1).padStart(2, "0")}</span><strong>{faq.question}</strong><span className="faq-toggle" aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>

      <section className="section-shell pb-20"><div className="launchpad-closing"><p className="eyebrow">Build with us</p><h2 className="launchpad-heading mt-6">Start before<br /><span className="font-editorial">you feel ready.</span></h2><p>12 weeks · 8–12 hours/week · Remote-first · Unpaid · Initial intake 18+</p><Link className="button-primary" href="/careers/apply">{accepting ? "Apply to Launchpad" : "Preview the application"} <ArrowUpRight className="h-4 w-4" /></Link><small>{accepting ? "Read the program terms before submitting. No employment guarantee." : "Intake is closed while the cohort is prepared. No application is sent from the preview."}</small></div></section>
      <Footer />
    </main>
  );
}
