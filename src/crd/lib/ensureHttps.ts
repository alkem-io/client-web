/**
 * Returns the URL with an `https://` scheme if one is missing. Empty / blank
 * input is returned untouched (after trimming) so callers can distinguish
 * "user typed nothing" from "user typed something invalid".
 *
 * Used by URL inputs (callout link/CTA, references, pre-populate links, space
 * settings references) so users don't have to type the scheme by hand.
 */
export function ensureHttps(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Returns true when the given string parses as a valid absolute URL after
 * `ensureHttps` is applied. Empty input is treated as valid (no value).
 */
export function isValidHttpUrl(url: string): boolean {
  const candidate = ensureHttps(url);
  if (!candidate) return true;
  try {
    return Boolean(new URL(candidate));
  } catch {
    return false;
  }
}
