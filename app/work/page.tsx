import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import WorkCard from "@/components/WorkCard";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { workGroups, workItems } from "@/data/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Zqtion work across delivered websites, open-source products, motion design and AI films, with each project relationship clearly disclosed.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const sections = [{ title: "Websites & open-source products", groups: workGroups.slice(0,2) }, ...workGroups.slice(2).map(group=>({title:group,groups:[group]}))];
  return (
    <main id="main-content">
      <JsonLd schema={getBreadcrumbSchema([{ name: "Home", url: "https://zqtion.com" }, { name: "Work", url: "https://zqtion.com/work" }])} />
      <PageHero eyebrow="Selected work" title="From a working product to a moving story." description="Websites, open-source tools, motion design and creative experiments. Explore the work, the contribution and the relationship behind it." primary={{ href: "/contact", label: "Start a project" }} />
      <nav className="section-shell work-category-links" aria-label="Work categories">{sections.map((section,index)=><a key={section.title} href={`#work-group-${index}`}>{section.title}</a>)}</nav>
      {sections.map((section,index)=><section key={section.title} id={`work-group-${index}`} className="section-shell work-category-section" aria-labelledby={`work-heading-${index}`}><div className="work-category-heading"><span className="eyebrow" aria-hidden="true">0{index+1}</span><h2 id={`work-heading-${index}`}>{section.title}</h2></div><div className="work-project-grid">{workItems.filter(item=>section.groups.some(group=>item.group===group)).map(item=><WorkCard key={item.slug} item={item} />)}</div></section>)}
      <Footer />
    </main>
  );
}
