import Link from "next/link";
import type { Metadata } from "next";
import { getCatalogue } from "@/lib/resources/service";
import { ResourceSearchFilter } from "@/components/resources/ResourceSearchFilter";
import { AskZqtionAssistant } from "@/components/resources/AskZqtionAssistant";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Resources, Workflows & Building Blocks",
  description:
    "A searchable, AI-readable knowledge layer for AI tools, prompts, skills, open-source repositories, workflows, and MCP servers. Organized around practical execution.",
  alternates: {
    canonical: "https://zqtion.com/resources"
  },
  openGraph: {
    title: "AI Resources & Execution Building Blocks | Zqtion",
    description:
      "Search AI tools and implementation notes, open-source repositories, prompts, agent skills, and production MCP servers. Built on Create, Build, Automate.",
    url: "https://zqtion.com/resources",
    siteName: "Zqtion",
    type: "website"
  }
};

export default async function ResourcesPage() {
  const catalogue = (await getCatalogue()).filter(item => item.status === "published");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Zqtion Resource Intelligence",
    description:
      "A searchable knowledge layer of AI tools and implementation notes, open-source repositories, prompts, agent skills, and MCP connectors.",
    url: "https://zqtion.com/resources",
    publisher: {
      "@type": "Organization",
      name: "Zqtion",
      url: "https://zqtion.com"
    }
  };

  return (
    <><main id="main-content" className="resource-page min-h-screen">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative border-b border-[var(--line)] pt-32 pb-16 lg:pt-36 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-widest">
              <span>Knowledge &amp; Discovery Layer</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-sans">
              Find the right <span className="text-accent">AI building block</span>.
            </h1>
            <p className="mt-4 text-lg text-muted sm:text-xl leading-relaxed">
              Prompts, tools, agent skills, open-source repositories, workflows, and MCP integrations—organized around what you are actually trying to accomplish.
            </p>

            {/* Quick stats banner */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-muted">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Implementation notes with evidence status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>MCP API &amp; Agent-Readable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Review required before implementation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Natural Language Assistant Spotlight */}
        <section aria-label="Natural Language Assistant">
          <AskZqtionAssistant />
        </section>

        {/* Universal Search & Directory */}
        <section aria-label="Resource Directory">
          <h2 className="text-2xl font-semibold mb-4">Resource Library</h2>
          <ResourceSearchFilter initialItems={catalogue} />
        </section>
        <nav aria-label="Explore related knowledge" className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-[var(--line)] p-6"><h2 className="text-xl font-semibold">AI automation</h2><p className="mt-2 text-secondary">Start with the task and its failure cases before choosing tools.</p><ul className="mt-3 space-y-2"><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/insights/when-to-automate-a-workflow">Decide when to automate</Link></li><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/work/gruffet">Explore Gruffet’s original work and limits</Link></li></ul></section>
          <section className="rounded-xl border border-[var(--line)] p-6"><h2 className="text-xl font-semibold">Prompt engineering</h2><p className="mt-2 text-secondary">Choose a brief, define success and compare the outputs.</p><ul className="mt-3 space-y-2"><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/prompts/methods">Prompt structures and evaluation methods</Link></li><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/prompts">Original editable prompt library</Link></li></ul></section>
          <section className="rounded-xl border border-[var(--line)] p-6"><h2 className="text-xl font-semibold">Tools and open source</h2><p className="mt-2 text-secondary">Review source code, permissions and evidence before connecting systems.</p><ul className="mt-3 space-y-2"><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/resources/guide/mcp-production-connector-architecture">MCP connector planning notes</Link></li><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="https://github.com/Zqtion/Gruffet">Read Gruffet’s source and limitations</Link></li></ul></section>
          <section className="rounded-xl border border-[var(--line)] p-6"><h2 className="text-xl font-semibold">Community knowledge</h2><p className="mt-2 text-secondary">Read member experiences, ask a specific question and credit the source.</p><ul className="mt-3 space-y-2"><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/ai-experiences">Public AI experiences and discussions</Link></li><li><Link className="inline-flex min-h-[44px] items-center text-accent" href="/prompts/community">Member prompts and shared results</Link></li></ul></section>
        </nav>
      </div>
    </main><Footer /></>
  );
}
