/** Shared fallback initials for chat avatars: first letter of the first two words, uppercased. */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    // Spread to iterate code points, not UTF-16 units — word[0] on an astral-plane
    // character (emoji, 𝕏, CJK extensions) would yield a broken half-surrogate.
    .map(word => [...word][0]?.toUpperCase() ?? '')
    .join('') || '?';
