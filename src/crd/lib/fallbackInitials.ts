/**
 * Returns the first 1–2 uppercase initials of a display name, suitable for
 * `<AvatarFallback>` content when no avatar image is available.
 *
 * Trims whitespace, splits on any whitespace run, takes up to two parts, and
 * uppercases the first character of each. Returns `'?'` when the input is empty
 * or contains no alphanumeric characters — never an empty string.
 */
export const fallbackInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
