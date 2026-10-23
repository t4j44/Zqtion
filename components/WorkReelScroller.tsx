"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function WorkReelScroller({ children, count }: { children: ReactNode; count: number }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [progress,setProgress] = useState(0);
  useEffect(()=>{
    const node=viewport.current;if(!node)return;
    let frame=0;
    const update=()=>{frame=0;const range=node.scrollWidth-node.clientWidth;setProgress(range>0?Math.max(0,Math.min(1,node.scrollLeft/range)):0);};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const resize=new ResizeObserver(schedule);resize.observe(node);node.addEventListener("scroll",schedule,{passive:true});update();
    return ()=>{cancelAnimationFrame(frame);resize.disconnect();node.removeEventListener("scroll",schedule);};
  },[]);
  const move=(direction:number)=>{
    const node=viewport.current;if(!node)return;
    const card=node.querySelector<HTMLElement>(".work-reel-item");
    const track=node.querySelector<HTMLElement>(".work-reel-track");
    const step=(card?.getBoundingClientRect().width??node.clientWidth*.84)+(track?parseFloat(getComputedStyle(track).columnGap)||0:0);
    node.scrollBy({left:step*direction,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  };
  return <>
    <div ref={viewport} className="work-reel-viewport" role="region" aria-label="Selected projects" tabIndex={0} onKeyDown={event=>{
      if(event.target!==event.currentTarget)return;
      if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();move(event.key==="ArrowRight"?1:-1);}
    }}>{children}</div>
    <div className="section-shell work-reel-meta"><span className="work-reel-counter" aria-hidden="true">{String(Math.round(progress*(count-1))+1).padStart(2,"0")} / {String(count).padStart(2,"0")}</span><span className="work-reel-rail" aria-hidden="true"><span className="work-reel-bar" style={{transform:`scaleX(${Math.max(1/count,progress)})`}} /></span><span className="work-reel-hint">Swipe or use arrows</span><div className="work-reel-controls"><button type="button" onClick={()=>move(-1)} disabled={progress<.005} aria-label="Previous project"><ArrowLeft aria-hidden="true" className="h-4 w-4" /></button><button type="button" onClick={()=>move(1)} disabled={progress>.995} aria-label="Next project"><ArrowRight aria-hidden="true" className="h-4 w-4" /></button></div></div>
  </>;
}
