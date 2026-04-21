/**
 * Creates a CRD-compatible diagonal background gradient from a single base color.
 *
 * The first stop uses the provided `color`; the second stop is a darker variant
 * computed with `color-mix(...)` (`70%` base color + `30%` black), which keeps
 * gradient styling consistent with the design-system migration.
 *
 * See `migration-guide.md` for guidance on replacing legacy MUI background helpers
 * with CRD utility functions like this one.
 *
 * @param color - Any valid CSS color token (hex, rgb, hsl, CSS variable, etc.).
 * @returns Inline style object containing a `background` linear-gradient value.
 */
export const backgroundGradient = (color: string, darkerColor: string = `color-mix(in srgb, ${color} 70%, black)`) => ({
  background: `linear-gradient(135deg, ${color}, ${darkerColor})`,
});
