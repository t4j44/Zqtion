export default function CommunityLoading() {
  return <div role="status" aria-label="Loading community content" aria-busy="true"><div className="cq-skeleton" aria-hidden="true"><span /><span /><span /></div><div className="cq-skeleton" aria-hidden="true"><span /><span /><span /></div><span className="sr-only">Loading…</span></div>;
}
