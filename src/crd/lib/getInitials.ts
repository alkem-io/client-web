/**
 * Extracts up to 2 initials from a display name (first letter of the first two words).
 * Returns an empty string for blank input.
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}
