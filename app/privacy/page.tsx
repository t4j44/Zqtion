import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = { title: "Privacy", description: "How Zqtion handles information submitted through its website.", alternates: { canonical: "/privacy" } };

const sections = [
  ["Information you provide", "When you send a project brief or contact Zqtion, you may provide your name, email, company or project name, service interest, budget range, project details, and any information you choose to include in follow-up communication."],
  ["Launchpad applications", "When application intake is open, the form collects contact details, an 18-or-older confirmation, location, optional institution, learning stage, track preferences, optional public work/profile links, experience and learning answers, availability, tool/device access, and explicit program/privacy acknowledgements. It does not request date of birth, identity documents, payment information or file uploads. Preview mode does not send or save application answers. Submitted applications are used for selection and related communication, not marketing or anonymous analytics. An internal notification contains only an application reference and track, not private answers. Cohort-specific eligibility and retention terms must be provided before intake opens."],
  ["Technical and measurement information", "The website and its hosting or security providers may process limited technical information such as browser type, user agent, an anonymous session identifier, page path, referral and campaign parameters, performance measurements, IP-derived security signals, request timing, and error logs. Zqtion's first-party analytics honors browser Do Not Track and does not include personal form fields. The inquiry and rate-limit tables do not intentionally store your raw IP address."],
  ["How information is used", "Information is used to evaluate and respond to project requests, understand which pages and channels lead to useful inquiries, improve website performance, prepare a proposed scope, protect the form from abuse, operate the website, and maintain records of business communication. Zqtion does not sell inquiry information to third-party marketers."],
  ["Service providers", "Depending on launch configuration, website information may be processed by Vercel for hosting, Supabase for inquiry storage, Resend for email delivery, and Cloudflare Turnstile for abuse prevention. Each provider handles data under its own terms and privacy practices."],
  ["Video and external links", "Portfolio videos load from YouTube only after you choose to play them. Links to YouTube, LinkedIn, WhatsApp, and other external services take you to services with their own privacy practices."],
  ["Retention and security", "Zqtion keeps inquiry and project information only for as long as reasonably needed for evaluation, communication, record keeping, or an active business relationship. Reasonable technical controls are used, but no internet transmission or storage system can be guaranteed completely secure."],
  ["Your choices", "You can ask Zqtion to correct or delete information you submitted, subject to information that must be kept for an active agreement, security, or legitimate record-keeping needs. You can also contact Zqtion without using the website form."],
] as const;

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <header className="section-shell pb-14 pt-32 sm:pb-20 sm:pt-40"><p className="eyebrow">Website policy</p><h1 className="mt-6 text-6xl font-semibold tracking-[-0.055em] sm:text-8xl">Privacy</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/54">This page explains the information Zqtion’s website is designed to process. Project-specific data handling may also be covered by a written service agreement.</p><p className="mt-6 text-xs uppercase tracking-[0.16em] text-white/30">Effective August 8, 2026</p></header>
      <div className="section-shell pb-24 sm:pb-32"><div className="mx-auto max-w-4xl border-t border-white/10">{sections.map(([title, text], index) => <section key={title} className="grid gap-4 border-b border-white/10 py-9 sm:grid-cols-[0.1fr_0.9fr]"><span className="text-xs font-bold text-cyan-300">0{index + 1}</span><div><h2 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h2><p className="mt-4 text-base leading-7 text-white/55">{text}</p></div></section>)}<section className="py-9"><h2 className="text-2xl font-semibold tracking-[-0.035em]">Contact</h2><p className="mt-4 text-base leading-7 text-white/55">For a privacy request or question, email <a className="text-cyan-300 hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p></section></div></div>
      <Footer />
    </main>
  );
}
