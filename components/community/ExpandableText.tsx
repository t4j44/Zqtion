"use client";
import { useEffect, useId, useRef, useState } from "react";
export default function ExpandableText({ text, lines = 4 }: { text: string; lines?: number }) {
  const [expanded, setExpanded] = useState(false); const [overflow, setOverflow] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null); const id = useId();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => { if (!expanded) setOverflow(el.scrollHeight > el.clientHeight + 2); };
    const observer = new ResizeObserver(measure); observer.observe(el); measure(); return () => observer.disconnect();
  }, [text, expanded]);
  return <div className="cq-expandable"><p ref={ref} id={id} className={`cq-body ${expanded ? "" : "cq-clamped"}`} style={{ WebkitLineClamp: expanded ? undefined : lines }}>{text}</p>{(overflow || expanded) && <button type="button" className="cq-text-button" aria-expanded={expanded} aria-controls={id} onClick={() => {
    if (expanded && ref.current && ref.current.getBoundingClientRect().top < 90) ref.current.scrollIntoView({ block: "start", behavior: "instant" });
    setExpanded(!expanded);
  }}>{expanded ? "Show less" : "See more"}</button>}</div>;
}
