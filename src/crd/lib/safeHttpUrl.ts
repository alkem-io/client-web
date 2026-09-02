/**
 * Returns the URL only if it has a safe http(s) protocol; otherwise undefined.
 * Defense-in-depth against `javascript:` / `data:` injection when binding
 * untrusted strings to anchor `href` attributes.
 */
export function safeHttpUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : undefined;
  } catch {
    return undefined;
  }
}
