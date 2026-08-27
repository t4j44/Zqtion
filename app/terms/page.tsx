import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Website terms", description: "Terms governing use of the Zqtion public website and project inquiry form.", alternates: { canonical: "/terms" } };

const sections = [
  ["Website use", "You may use this public website to learn about Zqtion, view disclosed portfolio work, read original insights, and send a genuine project inquiry. Do not attempt to disrupt the site, misuse the inquiry form, or access non-public systems."],
  ["No service agreement from an inquiry", "Submitting a form, sending a message, or receiving an initial response does not create a client relationship or require either party to proceed. A project begins only after scope, deliverables, responsibilities, commercial terms, and approvals are confirmed in a separate written agreement."],
  ["Project agreements control", "Service-specific terms—including payment schedule, revisions, timeline, cancellation, ownership, licensing, confidentiality, third-party costs, and acceptance—are defined in the written proposal or agreement for that project. If that agreement conflicts with this website page, the project agreement controls for the project."],
  ["Client-provided materials", "A client is responsible for having permission to share and use the logos, images, data, references, access credentials, and other materials it supplies. Sensitive credentials should be shared only through an agreed secure method, not through the public inquiry form."],
  ["AI-assisted work", "Zqtion may use AI-assisted tools when agreed or appropriate to the scope. Generated material can have limitations involving consistency, originality, accuracy, and eligibility for exclusive rights. Required review, disclosure, licensing, and risk allocation must be addressed in the project scope."],
  ["Portfolio truth", "The public portfolio includes competition entries, independent concepts, founder-venture work, and creative-lab experiments. Relationship labels and disclosures on each case-study page are part of the work description. Brand- or fan-inspired studies do not imply endorsement, commission, or affiliation."],
  ["Site content and external services", "Zqtion owns or licenses the website’s original design, copy, and brand assets. Portfolio references and third-party marks remain subject to their respective rights. External links and embedded services operate under their own terms."],
  ["Availability and changes", "The website is provided for general information and may change, move, or become temporarily unavailable. Zqtion may update these website terms as the site, providers, and public offerings change. The effective date will be updated when material changes are published."],
] as const;

export default function TermsPage() {
  return (
    <main id="main-content">
      <header className="section-shell pb-14 pt-32 sm:pb-20 sm:pt-40"><p className="eyebrow">Website policy</p><h1 className="mt-6 text-6xl font-semibold tracking-[-0.055em] sm:text-8xl">Terms</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/54">These terms cover the public website and inquiry process. They are not a substitute for the written agreement used for a paid project.</p><p className="mt-6 text-xs uppercase tracking-[0.16em] text-white/30">Effective August 8, 2026</p></header>
      <div className="section-shell pb-24 sm:pb-32"><div className="mx-auto max-w-4xl border-t border-white/10">{sections.map(([title, text], index) => <section key={title} className="grid gap-4 border-b border-white/10 py-9 sm:grid-cols-[0.1fr_0.9fr]"><span className="text-xs font-bold text-cyan-300">0{index + 1}</span><div><h2 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h2><p className="mt-4 text-base leading-7 text-white/55">{text}</p></div></section>)}<section className="py-9"><h2 className="text-2xl font-semibold tracking-[-0.035em]">Contact</h2><p className="mt-4 text-base leading-7 text-white/55">Questions about these website terms can be sent to <a className="text-cyan-300 hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p></section></div></div>
      <Footer />
    </main>
  );
}
