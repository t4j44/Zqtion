"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="cq-empty"><h1>This discussion could not be loaded.</h1><p>Your saved contributions have not been changed.</p><button className="cq-button" onClick={reset}>Try again</button></div>; }
