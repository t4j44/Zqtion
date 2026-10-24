import CommunityShell from "@/components/community/CommunityShell";

/**
 * Route-level fallback must include the Community shell. Unlike the feed routes,
 * /u/[username] has no parent Community layout, so a bare skeleton would render
 * edge-to-edge behind the fixed site navigation during server data loading.
 */
export default function PortfolioLoading() {
  return (
    <CommunityShell>
      <div className="cq-portfolio-loading" role="status" aria-busy="true" aria-label="Loading public Community profile">
        <div className="cq-loading-portfolio-hero" aria-hidden="true">
          <div className="cq-loading-bar cq-loading-eyebrow" />
          <div className="cq-loading-identity">
            <div className="cq-loading-avatar" />
            <div className="cq-loading-person">
              <div className="cq-loading-bar cq-loading-name" />
              <div className="cq-loading-bar cq-loading-handle" />
            </div>
          </div>
          <div className="cq-loading-bar cq-loading-bio" />
          <div className="cq-loading-bar cq-loading-bio cq-loading-bio-short" />
          <div className="cq-loading-actions">
            <div className="cq-loading-bar cq-loading-action" />
            <div className="cq-loading-bar cq-loading-action" />
          </div>
        </div>
        <div className="cq-loading-stats" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="cq-loading-stat" key={i}>
              <div className="cq-loading-bar cq-loading-stat-value" />
              <div className="cq-loading-bar cq-loading-stat-label" />
            </div>
          ))}
        </div>
        <section className="cq-loading-work" aria-hidden="true">
          <div className="cq-loading-bar cq-loading-section-heading" />
          <div className="cq-loading-tab-row">
            <div className="cq-loading-bar cq-loading-tab" />
            <div className="cq-loading-bar cq-loading-tab" />
            <div className="cq-loading-bar cq-loading-tab" />
          </div>
          <div className="cq-loading-work-card">
            <div className="cq-loading-bar cq-loading-work-title" />
            <div className="cq-loading-bar cq-loading-work-line" />
            <div className="cq-loading-bar cq-loading-work-line cq-loading-work-line-short" />
          </div>
        </section>
        <span className="sr-only">Loading public profile and contributions…</span>
      </div>
    </CommunityShell>
  );
}
