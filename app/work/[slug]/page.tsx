import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import Footer from "@/components/Footer";
import VideoFacade from "@/components/VideoFacade";
import WorkCard from "@/components/WorkCard";
import JsonLd, { getBreadcrumbSchema, getVideoSchema } from "@/components/seo/JsonLd";
import { getWorkBySlug, workItems } from "@/data/work";
import { siteConfig } from "@/data/site";

export function generateStaticParams() { return workItems.map((item) => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) return {};
  const image = item.socialImage ?? item.poster ?? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/work/${item.slug}` },
    openGraph: { title: item.title, description: item.summary, type: "website", url: `/work/${item.slug}`, images: [image] },
    twitter: { card: "summary_large_image", title: item.title, description: item.summary, images: [image] },
  };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);
  if (!item) notFound();
  const related = workItems.filter((candidate) => candidate.slug !== item.slug).sort((a,b)=>Number(b.group===item.group)-Number(a.group===item.group)).slice(0, 2);
  const pageUrl = `${siteConfig.url}/work/${item.slug}`;
  const videoSchemas = [
    ...(item.videoId && item.videoUrl ? [getVideoSchema({ title: item.sourceTitle ?? item.title, description: item.summary, videoId: item.videoId, videoUrl: item.videoUrl, pageUrl })] : [{"@context":"https://schema.org","@type":item.kind==="product"?"SoftwareSourceCode":"CreativeWork",name:item.title,description:item.summary,url:pageUrl,image:`${siteConfig.url}${item.poster}`,...(item.kind==="product"?{codeRepository:"https://github.com/Zqtion/Gruffet",license:"https://opensource.org/license/mit"}:{})}]),
    ...(item.additionalVideos || []).map((video) => getVideoSchema({ title: video.title, description: item.summary, videoId: video.videoId, videoUrl: video.videoUrl, pageUrl })),
  ];

  return (
    <main id="main-content">
      <JsonLd schema={[getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, { name: "Work", url: `${siteConfig.url}/work` }, { name: item.shortTitle, url: pageUrl }]), ...videoSchemas]} />
      <header className="section-shell pb-14 pt-32 sm:pb-20 sm:pt-40">
        <Link href="/work" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All work</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.34fr] lg:items-end">
          <div><p className="eyebrow">{item.relationship} · {item.year}</p><h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">{item.title}</h1></div>
          <p className="text-lg leading-8 text-muted">{item.summary}</p>
        </div>
        {item.links?.length ? <div className="mt-8 flex flex-wrap gap-3">{item.links.map((link,index)=><a key={link.url} href={link.url} target="_blank" rel="noreferrer" className={index===0?"button-primary":"button-secondary"}>{link.label} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>)}</div> : null}
      </header>
      <section className="section-shell" aria-label="Project media">{item.videoId && item.videoUrl ? <VideoFacade videoId={item.videoId} title={item.title} videoUrl={item.videoUrl} poster={item.poster} portrait={item.orientation === "portrait"} priority /> : item.kind==="product" ? <div className="work-product-detail"><Image src={item.poster} alt="Gruffet's authentic ferret mark" width={240} height={240} /><div><p className="eyebrow">Zqtion open source · Early v0.1</p><h2>Find businesses.<br />Keep the evidence.</h2><p>Local discovery. Public website research. Human review. Sourced export.</p></div></div> : <figure className="work-site-preview"><Image src={item.poster ?? "/og-image.png"} alt="Genuine desktop capture of G Force Tyres Mobile" width={1430} height={894} sizes="(max-width: 767px) 100vw, 90vw" /><figcaption>Live website capture, 21 October 2026.</figcaption></figure>}</section>
      {item.gallery?.length ? <section className="section-shell work-gallery" aria-label="Responsive website gallery">{item.gallery.map(image=><figure key={image.src}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 639px) 80vw, 390px" /><figcaption>{image.caption}</figcaption></figure>)}</section> : null}
      {item.additionalVideos?.length ? (
        <section className="section-shell pt-12 sm:pt-16">
          <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Also in this collection</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">More moving-image experiments</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-muted">Loaded only when you press play, keeping the page fast across mobile, tablet, and desktop.</p>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {item.additionalVideos.map((video) => (
              <article key={video.videoId} className="min-w-0">
                <VideoFacade videoId={video.videoId} title={video.title} videoUrl={video.videoUrl} portrait={video.orientation === "portrait"} />
                <h3 className="mx-auto mt-4 max-w-2xl text-xl font-semibold tracking-[-0.025em] text-foreground">{video.title}</h3>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section-shell section-pad">
        <div className="grid gap-12 lg:grid-cols-[0.32fr_0.68fr]">
          <aside><p className="text-xs font-bold uppercase tracking-[0.17em] text-muted">Project truth</p><div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.055] p-5"><p className="text-sm font-semibold text-accent">{item.relationship}</p><p className="mt-3 text-sm leading-6 text-muted">{item.disclosure}</p></div><p className="mt-7 text-xs font-bold uppercase tracking-[0.17em] text-muted">Discipline</p><p className="mt-3 text-sm leading-6 text-secondary">{item.discipline}</p></aside>
          <div className="grid gap-12">
            <div><p className="eyebrow">The challenge</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em]">What the work needed to solve</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{item.challenge}</p></div>
            <div><p className="eyebrow">Capability demonstrated</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em]">What the release shows</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-secondary">{item.whatThisProved}</p></div>
            <div><p className="eyebrow">The approach</p><ul className="mt-6 grid gap-4">{item.approach.map((step) => <li key={step} className="flex items-start gap-3 border-b border-white/10 pb-4 text-base leading-7 text-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-accent" />{step}</li>)}</ul></div>
            <div><p className="eyebrow">Deliverables</p><div className="mt-6 flex flex-wrap gap-2">{item.deliverables.map((deliverable) => <span key={deliverable} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted">{deliverable}</span>)}</div></div>
            {item.sourceTitle ? <p className="text-sm leading-6 text-muted">Published title: {item.sourceTitle}</p> : null}
            {item.videoUrl ? <a href={item.videoUrl} target="_blank" rel="noreferrer" className="button-secondary w-fit">Watch on YouTube <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a> : null}
          </div>
        </div>
      </section>
      <section className="section-shell section-pad border-t border-white/10"><h2 className="text-4xl font-semibold tracking-[-0.045em]">Continue exploring</h2><div className="mt-10 grid gap-6 md:grid-cols-2">{related.map((candidate) => <WorkCard key={candidate.slug} item={candidate} />)}</div></section>
      <section className="section-shell pb-12"><div className="panel flex flex-col gap-7 p-8 sm:p-12 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Build the next one</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Bring the problem. We’ll pressure-test the format.</h2></div><Link href="/contact" className="button-primary shrink-0" data-analytics="work_contact_click" data-analytics-work={item.slug}>Start a project <ArrowUpRight className="h-4 w-4" /></Link></div></section>
      <Footer />
    </main>
  );
}
