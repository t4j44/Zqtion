import { siteConfig } from "@/data/site";

type Schema = Record<string, unknown>;

export default function JsonLd({ schema }: { schema: Schema | Schema[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}

export function getOrganizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    email: siteConfig.email,
    description: siteConfig.description,
    sameAs: [siteConfig.linkedin, siteConfig.youtube],
    contactPoint: { "@type": "ContactPoint", contactType: "sales", email: siteConfig.email, url: `${siteConfig.url}/contact` },
  };
}

export function getWebSiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function getProfessionalServiceSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#service`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    areaServed: "Worldwide",
  };
}

export function getFAQSchema(items: ReadonlyArray<{ question: string; answer: string }>): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function getServicesSchema(items: ReadonlyArray<{ title: string; summary: string; slug: string }>): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Zqtion services",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: item.title,
        description: item.summary,
        url: `${siteConfig.url}/services#${item.slug}`,
        provider: { "@id": `${siteConfig.url}/#organization` },
        areaServed: "Worldwide",
      },
    })),
  };
}

export function getBreadcrumbSchema(items: ReadonlyArray<{ name: string; url: string }>): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}

export function getArticleSchema(article: { title: string; description: string; slug: string; published: string }): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.published,
    mainEntityOfPage: `${siteConfig.url}/insights/${article.slug}`,
    author: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    image: `${siteConfig.url}/og-image.png`,
  };
}
