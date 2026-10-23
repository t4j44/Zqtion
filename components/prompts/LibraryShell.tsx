import Link from "next/link";
import JsonLd, { getBreadcrumbSchema } from "@/components/seo/JsonLd";
import { librarySchema } from "@/lib/prompts/seo";
import { siteConfig } from "@/data/site";
export function LibraryHeader({ title, description, eyebrow = "Zqtion Prompt Library", children }: { title: string; description: string; eyebrow?: string; children?: React.ReactNode }) {
  return <header className="pl-hero"><p className="pl-kicker"><span className="pl-dot" />{eyebrow}</p><h1>{title}</h1><p className="pl-intro">{description}</p>{children}</header>;
}
export function LibraryBreadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return <><nav aria-label="Breadcrumb" className="pl-breadcrumbs"><Link href="/">Home</Link>{items.map((item, i) => <span key={item.path}><span aria-hidden="true">/</span>{i === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</span>)}</nav><JsonLd schema={getBreadcrumbSchema([{ name: "Home", url: siteConfig.url }, ...items.map((i) => ({ name: i.name, url: `${siteConfig.url}${i.path}` }))])} /></>;
}
export function LibrarySeo({ title, description, path, article = false, updated }: { title: string; description: string; path: string; article?: boolean; updated?: string }) {
  return <JsonLd schema={librarySchema(title, description, path, article ? "Article" : "CollectionPage", updated)} />;
}
