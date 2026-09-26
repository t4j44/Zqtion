"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main-content" className="section-shell pt-40 pb-20"><h1 className="text-3xl">This profile could not be loaded.</h1><p className="my-6">Please try again in a moment.</p><button className="button-primary" onClick={reset}>Try again</button></main>; }
