import { notFound } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { getResourceBySlug, getRelatedResources, getCatalogue } from "@/lib/resources/service";
import { PromptCopyBlock } from "@/components/resources/PromptCopyBlock";
import { ResourceCard } from "@/components/resources/ResourceCard";

interface ResourceDetailPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const catalogue = await getCatalogue();
  return catalogue.map((item) => ({
    type: item.resourceType,
    slug: item.slug
  }));
}

export async function generateMetadata({ params }: ResourceDetailPageProps): Promise<Metadata> {
  const { slug, type } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    return {
      title: "Resource Not Found | Zqtion",
      description: "The requested building block could not be located."
    };
  }

  const canonicalUrl = `https://zqtion.com/resources/${type}/${slug}`;

  return {
    title: `${resource.title} | Zqtion Resource Intelligence`,
    description: resource.summary,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `${resource.title} | Zqtion`,
      description: resource.summary,
      url: canonicalUrl,
      type: "article",
      siteName: "Zqtion"
    }
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { slug, type } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const related = await getRelatedResources(resource.slug, 3);

  const evidenceBadges: Record<string, { label: string; className: string }> = {
    verified: {
      label: "Verified Source",
      className: "bg-accent-soft text-success border-[var(--line)]"
    },
    zqtion_tested: {
      label: "Zqtion Tested",
      className: "bg-accent-soft text-accent border-[var(--line)]"
    },
    source_reported: {
      label: "Source Reported",
      className: "bg-accent-soft text-warning border-[var(--line)]"
    },
    community_reported: {
      label: "Community",
      className: "bg-accent-soft text-accent border-[var(--line)]"
    },
    unverified: {
      label: "Unverified Draft",
      className: "bg-raised text-muted border-[var(--line)]"
    }
  };

  const badge = evidenceBadges[resource.evidenceLevel] || evidenceBadges.unverified;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: resource.title,
    description: resource.summary,
    url: `https://zqtion.com/resources/${type}/${slug}`,
    inLanguage: "en",
    author: {
      "@type": "Organization",
      name: "Zqtion",
      url: "https://zqtion.com"
    },
    publisher: {
      "@type": "Organization",
      name: "Zqtion",
      url: "https://zqtion.com"
    }
  };

  return (
    <><main id="main-content" className="resource-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb Header */}
      <div className="border-b border-[var(--line)] pt-28 pb-8 lg:pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
            <span>/</span>
            <span className="capitalize text-secondary">{resource.category}</span>
            <span>/</span>
            <span className="text-muted truncate max-w-[200px]">{resource.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary border border-white/10">
              {resource.resourceType}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            <span className="ml-auto text-xs text-muted font-mono">
              Verified: {resource.verifiedAt ? new Date(resource.verifiedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "October 2026"}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-sans leading-tight">
            {resource.title}
          </h1>

          <p className="mt-4 text-base text-secondary leading-relaxed max-w-3xl">
            {resource.summary}
          </p>

          {/* Quick Facts Strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-[var(--line)] bg-surface p-4 text-xs">
            <div>
              <span className="text-muted block">Difficulty</span>
              <span className="font-semibold text-foreground capitalize">{resource.difficulty}</span>
            </div>
            <div>
              <span className="text-muted block">Target Audience</span>
              <span className="font-semibold text-foreground">{String(resource.metadata?.target_user || "Engineers & Teams")}</span>
            </div>
            <div>
              <span className="text-muted block">Primary Tools</span>
              <span className="font-semibold text-foreground truncate block">
                {resource.tools?.join(", ") || "Modern AI Stack"}
              </span>
            </div>
            <div>
              <span className="text-muted block">Estimated Cost</span>
              <span className="font-semibold text-success">Free to $20/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="prose prose-invert max-w-none prose-headings:font-sans prose-headings:text-foreground prose-p:text-secondary prose-p:leading-relaxed prose-a:text-accent prose-code:text-accent prose-pre:border prose-pre:border-[var(--line)] prose-pre:bg-surface">
          {/* Render markdown content sections */}
          <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-secondary">
            {resource.contentMarkdown}
          </div>
        </article>

        {/* Copyable MCP Tool Call Banner */}
        <div className="mt-12">
          <PromptCopyBlock
            label="MCP Query for Claude Code / Antigravity"
            code={`// Execute via Zqtion MCP Server\n{\n  "tool": "get_resource",\n  "args": {\n    "slug": "${resource.slug}"\n  }\n}`}
          />
        </div>

        {/* Related Graph Nodes */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[var(--line)] pt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Related Building Blocks</h2>
                <p className="text-xs text-muted mt-1">
                  Connected via shared tools, category taxonomy, and workflow graph.
                </p>
              </div>
              <Link href="/resources" className="text-xs font-semibold text-accent hover:underline">
                Explore All &rarr;
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((item) => (
                <ResourceCard key={item.id} resource={item} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Navigation */}
        <div className="mt-16 flex items-center justify-between border-t border-[var(--line)] pt-8">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-foreground transition-colors"
          >
            &larr; Back to all building blocks
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
          >
            Need help implementing this? Work with Zqtion &rarr;
          </Link>
        </div>
      </div>
    </main><Footer /></>
  );
}
