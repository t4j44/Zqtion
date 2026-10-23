/**
 * Normalize an ordinary pasted public website address without guessing hosts.
 * Missing protocol defaults to HTTPS; an explicit HTTP(S) scheme is preserved.
 * Invalid or potentially dangerous inputs remain unchanged so validation rejects them.
 */
export function normalizeWebsiteLink(input: string): string {
  const value = input.trim();
  if (!value || /[\\\s\u0000-\u001f\u007f]/u.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//")) return value;
  const host = value.split(/[/?#]/, 1)[0];
  const validHost = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  return validHost.test(host) && host.length <= 253 ? `https://${value}` : value;
}

/** Validates links that are displayed/stored, not server-fetched. */
export function isPublicWebsiteLink(value: string): boolean {
  try {
    if (!value || value.length > 500 || /[\\\s\u0000-\u001f\u007f]/u.test(value)) return false;
    const url = new URL(value);
    const validHost = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      && validHost.test(url.hostname) && url.hostname.length <= 253;
  } catch {
    return false;
  }
}
