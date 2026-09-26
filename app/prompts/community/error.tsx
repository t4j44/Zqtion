"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="cq-empty"><h1>This prompt could not be loaded.</h1><p>The community is temporarily unavailable.</p><button className="cq-button" onClick={reset}>Try again</button></div>; }
