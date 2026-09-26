import type { PromptCardData } from "@/lib/prompts/types";

export default function PromptPreview({ prompt, large = false }: { prompt: PromptCardData; large?: boolean }) {
  const v = prompt.preview.variant;
  return <div className={`pl-preview pl-preview-${v} ${large ? "pl-preview-large" : ""}`} role="img" aria-label={`${prompt.title}: illustrative concept, not a model output`}>
    <div className="pl-preview-content" aria-hidden="true">
      {prompt.category === "ui" ? <div className={`pl-mini-ui pl-mini-${v}`}><div className="pl-mini-top"><span>●</span><span>{v === "dashboard" ? "FIELDWORK" : v === "landing" ? "SECOND LIFE" : v === "pricing" ? "CLEAR PLANS" : "FOUNDATIONS"}</span><i>•••</i></div>
        {v === "dashboard" ? <div className="pl-mini-dashboard"><aside><i /><i /><i /></aside><div><small>RESEARCH OVERVIEW</small><strong>Evidence before<br />assumptions.</strong><div className="pl-mini-tiles"><span>03<small>Active studies</small></span><span>08<small>Interviews</small></span></div><div className="pl-mini-lines"><i /><i /><i /></div></div></div>
        : v === "landing" ? <div className="pl-mini-landing"><small>REPAIR / REUSE / REPEAT</small><strong>A second life<br />starts here.</strong><span className="pl-mini-cta">Check my item ↗</span><div className="pl-mini-stages">01 Describe　02 Inspect　03 Decide</div></div>
        : v === "pricing" ? <div className="pl-mini-pricing"><strong>Room to grow.</strong><small>EXAMPLE PRICING</small><div>{["Solo", "Team", "Studio"].map((s, i) => <span key={s}><small>{s}</small><b>{["01", "05", "12"][i]}</b><small>workspaces</small><i /><i /></span>)}</div></div>
        : <div className="pl-mini-course"><aside>YOUR COURSE<span>01　Start here</span><span>02　Find the problem</span><span>03　Build a first draft</span></aside><div><small>LESSON 02</small><strong>Start with<br />a question.</strong><i /><i /><span>Continue lesson →</span></div></div>}
      </div> : prompt.category === "image" ? <div className={`pl-still-life pl-still-${v}`}><div className="pl-object-shadow" /><div className="pl-object"><i /><b /><span /></div><div className="pl-prop" /><span className="pl-composition-mark">{v === "paper" ? "02 : 03" : "MATERIAL / LIGHT / FORM"}</span></div>
      : <div className="pl-mini-editor"><div className="pl-mini-top"><span>● ● ●</span><span>{v === "debug" ? "investigation.md" : "project-brief.md"}</span></div><div className="pl-editor-body"><small>01 <em>DEFINE THE OUTCOME</em></small><strong>{v === "planner" ? "Focus on the\nnext three." : v === "catalog" ? "Find the right\nthing, faster." : v === "debug" ? "Reproduce.\nTrace. Verify." : "Preview first.\nImport safely."}</strong><div className="pl-code-lines"><i /><i /><i /></div><span className="pl-editor-check">✓ {v === "debug" ? "Evidence before edits" : v === "import" ? "Validate before writing" : "Small scope. Clear checks."}</span></div></div>}
    </div><span className="pl-preview-caption">ZQTION CONCEPT</span>
  </div>;
}
