import Link from "next/link";
export default function NotFound() {
  return <main id="main-content" className="section-shell min-h-[70vh] pt-36 pb-20"><p className="eyebrow">404</p><h1 className="text-4xl font-semibold">This page is unavailable.</h1><p className="mt-5 max-w-xl text-secondary">The address may be incorrect, or the contribution may no longer be public. Private and removed content is not available here.</p><div className="mt-8 flex flex-wrap gap-4"><Link href="/ai-experiences" className="button-primary">Explore Community</Link><Link href="/resources" className="button-secondary">Resource Library</Link></div></main>;
}
