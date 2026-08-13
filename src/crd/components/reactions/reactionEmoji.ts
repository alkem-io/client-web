// Slug-to-glyph map for the platform's predefined positive reaction set.
// The server is the source of truth for which slugs are allowed; clients own
// glyph rendering and skip any slug they don't recognise. Unknown slugs must
// return undefined — callers are responsible for not rendering them.

const SLUG_TO_GLYPH: Record<string, string> = {
  heart: '❤️',
  'hugging-face': '🤗',
  'clapping-hands': '👏',
  'light-bulb': '💡',
  bullseye: '🎯',
  'check-mark': '✅',
  rocket: '🚀',
};

/**
 * Returns the Unicode glyph for a known reaction slug, or `undefined` for
 * any slug the client does not recognise. Callers must skip unknown slugs
 * rather than rendering them as raw text.
 */
export function glyphForSlug(slug: string): string | undefined {
  return SLUG_TO_GLYPH[slug];
}

/**
 * Returns true when the given slug has a known glyph. Useful for filtering
 * server-provided lists before passing them to presentational components.
 */
export function isKnownSlug(slug: string): boolean {
  return Object.hasOwn(SLUG_TO_GLYPH, slug);
}
