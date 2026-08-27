import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import WorkCard from "@/components/WorkCard";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { workItems } from "@/data/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected Zqtion work across AI film, product visuals, microfilms, and creative experiments—with project relationships disclosed.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <main id="main-content">
      <JsonLd schema={getBreadcrumbSchema([{ name: "Home", url: "https://zqtion.com" }, { name: "Work", url: "https://zqtion.com/work" }])} />
      <PageHero eyebrow="Selected work" title="Capability proof without borrowed credibility." description="This collection includes a competition entry, independent concepts, short films, and creative experiments. Each relationship is stated on the project—not hidden in fine print." primary={{ href: "/contact", label: "Start a project" }} />
      <section className="section-shell pb-24 sm:pb-32">
        <div className="mb-10 grid gap-6 border-y border-white/10 py-6 text-sm leading-6 text-white/48 md:grid-cols-3">
          <p><span className="font-semibold text-white">Competition entry</span><br />Created for a disclosed public competition.</p>
          <p><span className="font-semibold text-white">Independent concept</span><br />Self-initiated and uncommissioned.</p>
          <p><span className="font-semibold text-white">Creative lab</span><br />Experiments used to develop transferable methods.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">{workItems.map((item, index) => <Reveal key={item.slug} delay={(index % 2) * 0.05}><WorkCard item={item} priority={index < 2} /></Reveal>)}</div>
      </section>
      <Footer />
    </main>
  );
}
