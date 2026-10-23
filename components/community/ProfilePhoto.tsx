"use client";
import { useState } from "react";
export default function ProfilePhoto({ id }: { id: string }) {
  const [failed, setFailed] = useState(false);
  // A pending or removed photo falls back to the Zqtion avatar; it never leaks a storage URL.
  // eslint-disable-next-line @next/next/no-img-element
  return failed ? <>Z</> : <img src={`/api/community/media/${id}`} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}
