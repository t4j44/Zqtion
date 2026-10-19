import type { Metadata } from "next";
import { getCatalogue } from "@/lib/resources/service";
import { ResourceSearchFilter } from "@/components/resources/ResourceSearchFilter";
import { AskZqtionAssistant } from "@/components/resources/AskZqtionAssistant";

export const metadata: Metadata = {
  title: "AI Resources, Workflows & Building Blocks | Zqtion Resource Intelligence",
  description:
    "A searchable, AI-readable knowledge layer for AI tools, prompts, skills, open-source repositories, workflows, and MCP servers. Organized around practical execution.",
  alternates: {
    canonical: "https://zqtion.com/resources"
  },
  openGraph: {
    title: "AI Resources & Execution Building Blocks | Zqtion",
    description:
      "Search verified AI tools, open-source repositories, prompts, agent skills, and production MCP servers. Built on Create, Build, Automate.",
    url: "https://zqtion.com/resources",
    siteName: "Zqtion",
    type: "website"
  }
};

export default async function ResourcesPage() {
  const catalogue = await getCatalogue();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Zqtion Resource Intelligence",
    description:
      "A searchable knowledge layer of verified AI tools, open-source repositories, prompts, agent skills, and MCP connectors.",
    url: "https://zqtion.com/resources",
    publisher: {
      "@type": "Organization",
      name: "Zqtion",
      url: "https://zqtion.com"
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0E] text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative border-b border-[#1F2128] pt-32 pb-16 lg:pt-36 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 uppercase tracking-widest">
              <span>Knowledge &amp; Discovery Layer</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-sans">
              Find the right <span className="text-[#38BDF8]">AI building block</span>.
            </h1>
            <p className="mt-4 text-lg text-zinc-400 sm:text-xl leading-relaxed">
              Prompts, tools, agent skills, open-source repositories, workflows, and MCP integrations—organized around what you are actually trying to accomplish.
            </p>

            {/* Quick stats banner */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>100% Original Zqtion Implementations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>MCP API &amp; Agent-Readable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Zero Hallucinated Metrics</span>
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
          <ResourceSearchFilter initialItems={catalogue} />
        </section>
      </div>
    </main>
  );
}
