export function resolveAllowedOriginsAndHosts(requestUrl?: string) {
  const origins = ["https://zqtion.com", "https://www.zqtion.com"];
  const hosts = ["zqtion.com", "www.zqtion.com"];

  if (process.env.NODE_ENV !== "production" && requestUrl) {
    try {
      const url = new URL(requestUrl);
      if (["localhost", "127.0.0.1"].includes(url.hostname)) {
        if (!origins.includes(url.origin)) origins.push(url.origin);
        if (!hosts.includes(url.hostname)) hosts.push(url.hostname);
      }
    } catch {
      // ignore
    }
  }

  const previewHost = process.env.LAUNCHPAD_PREVIEW_HOSTNAME?.trim().toLowerCase();
  if (previewHost && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(previewHost) && !previewHost.includes("*")) {
    const previewOrigin = `https://${previewHost}`;
    if (!origins.includes(previewOrigin)) origins.push(previewOrigin);
    if (!hosts.includes(previewHost)) hosts.push(previewHost);
  }

  const stagingOriginsRaw = process.env.LAUNCHPAD_ALLOWED_STAGING_ORIGINS?.trim();
  if (stagingOriginsRaw) {
    for (const item of stagingOriginsRaw.split(/[,\s]+/)) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      try {
        const u = new URL(trimmed);
        if (u.protocol === "https:" && u.hostname && !u.port && (u.pathname === "/" || u.pathname === "") && !u.username && !u.password && !u.hostname.includes("*")) {
          const origin = u.origin;
          const host = u.hostname.toLowerCase();
          if (!origins.includes(origin)) origins.push(origin);
          if (!hosts.includes(host)) hosts.push(host);
        }
      } catch {
        // ignore invalid entries
      }
    }
  }

  return { origins, hosts };
}
