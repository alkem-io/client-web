/**
 * Extracts up to 2 initials from a display name (first letter of the first two words).
 * Returns an empty string for blank input.
 *
 * Uses `Array.from(word)` to iterate by Unicode code point so the first character
 * is preserved correctly for non-Latin scripts (Cyrillic, CJK) and supplementary-plane
 * code points (emoji, mathematical alphanumerics) — `String.charAt(0)` returns half a
 * surrogate pair for the latter, which renders as `?` in some fonts.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => Array.from(word)[0]?.toLocaleUpperCase() ?? '')
    .join('');
}
