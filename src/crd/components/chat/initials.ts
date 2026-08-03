/** Shared fallback initials for chat avatars: first letter of the first two words, uppercased. */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('') || '?';
