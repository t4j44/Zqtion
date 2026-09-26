"use client";
import { useRouter } from "next/navigation";
export default function CardSurface({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  return <article className={`cq-card cq-card-surface ${className}`} onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.getSelection()?.toString()) return;
    if ((event.target as Element).closest("a,button,input,textarea,select,summary,details,label,form")) return;
    router.push(href);
  }}>{children}</article>;
}
