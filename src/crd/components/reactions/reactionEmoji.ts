// Slug-to-glyph map for the platform's predefined positive reaction set.
// The server is the source of truth for which slugs are allowed; clients own
// glyph rendering and skip any slug they don't recognise. Unknown slugs must
// return undefined — callers are responsible for not rendering them.

// A Map (not a plain object) so lookups are prototype-safe: a slug that
// collides with an inherited property name — `__proto__`, `constructor`,
// `toString` — resolves to `undefined` rather than an inherited member.
// (A plain-object lookup would return the inherited function for those keys.)
const SLUG_TO_GLYPH = new Map<string, string>([
  ['heart', '❤️'],
  ['hugging-face', '🤗'],
  ['clapping-hands', '👏'],
  ['light-bulb', '💡'],
  ['bullseye', '🎯'],
  ['check-mark', '✅'],
  ['rocket', '🚀'],
]);

/**
 * Returns the Unicode glyph for a known reaction slug, or `undefined` for
 * any slug the client does not recognise. Callers must skip unknown slugs
 * rather than rendering them as raw text.
 */
export function glyphForSlug(slug: string): string | undefined {
  return SLUG_TO_GLYPH.get(slug);
}

/**
 * Returns true when the given slug has a known glyph. Useful for filtering
 * server-provided lists before passing them to presentational components.
 */
export function isKnownSlug(slug: string): boolean {
  return SLUG_TO_GLYPH.has(slug);
}
