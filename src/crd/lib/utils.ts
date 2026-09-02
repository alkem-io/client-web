import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * CRD semantic typography tokens (see `src/crd/styles/typography.css`).
 *
 * These bundle `font-size`, `line-height`, and `font-weight` into a single
 * Tailwind utility. By default `tailwind-merge` treats every `text-*` class
 * as ambiguous — it can't tell whether `text-control` is a font-size token
 * or a text-color, so it conflicts with `text-primary-foreground` /
 * `text-foreground` / etc. and drops one of them. When the dropped class
 * happens to be the color, the text becomes invisible.
 *
 * Register the tokens here as the `font-size` group so they stop being
 * confused with colors. Add new tokens to this list as `typography.css`
 * grows.
 */
const CRD_TYPOGRAPHY_TOKENS = [
  'page-title',
  'section-title',
  'subsection-title',
  'card-title',
  'body',
  'body-emphasis',
  'control',
  'caption',
  'label',
  'badge',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: CRD_TYPOGRAPHY_TOKENS }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
