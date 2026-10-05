/**
 * One hue per kind of content, shared by both callout chip strips.
 *
 * The point of the colour is recognition: a kind of content should be findable
 * by its hue before its label is read, and should look the same wherever it
 * appears — in the row, in the More menu, selected or not. That only holds if
 * the mapping lives in one place, which is why both strips import this rather
 * than each keeping its own list.
 *
 * Two rules decide the assignments:
 *
 * 1. **A concept keeps its hue across both strips.** A whiteboard is blue
 *    whether you attach one to the post or ask people to contribute one back.
 *    `whiteboard`, `memo` and `document` appear in both and share a hue.
 * 2. **Hues are unique within a strip.** Two chips the user can see at once
 *    never share a colour. Across strips they may — `poll` (framing) and `post`
 *    (responses) are both amber — because the two strips sit in separate
 *    sections and each holds one selection.
 *
 * Values are the Tailwind 100/600 pairs the design system already uses for
 * tinted icons (see `ICON_COLORS` in the settings sections), so this introduces
 * a vocabulary the product has rather than a new one.
 */

type Tint = {
  /** The icon colour, applied in every state — a hue only visible once chosen is one nobody learns. */
  icon: string;
  /** The chip's surface when it is the selected one. */
  surface: string;
};

const TINTS = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    surface: 'bg-blue-100 border-blue-300 dark:bg-blue-500/15 dark:border-blue-500/40',
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    surface: 'bg-purple-100 border-purple-300 dark:bg-purple-500/15 dark:border-purple-500/40',
  },
  teal: {
    icon: 'text-teal-600 dark:text-teal-400',
    surface: 'bg-teal-100 border-teal-300 dark:bg-teal-500/15 dark:border-teal-500/40',
  },
  rose: {
    icon: 'text-rose-600 dark:text-rose-400',
    surface: 'bg-rose-100 border-rose-300 dark:bg-rose-500/15 dark:border-rose-500/40',
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400',
    surface: 'bg-orange-100 border-orange-300 dark:bg-orange-500/15 dark:border-orange-500/40',
  },
  amber: {
    icon: 'text-amber-700 dark:text-amber-400',
    surface: 'bg-amber-100 border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/40',
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    surface: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/40',
  },
  indigo: {
    icon: 'text-indigo-600 dark:text-indigo-400',
    surface: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-500/15 dark:border-indigo-500/40',
  },
} as const satisfies Record<string, Tint>;

/**
 * Keyed by the kind of content, not by strip. `whiteboard`, `memo` and
 * `document` are deliberately shared: the framing chip ids and the response
 * chip ids agree for those three, and the shared key is what keeps their hue
 * identical in both places.
 *
 * `tasks` is keyed separately because the Tasks board is not a response type —
 * the strip renders it as a sibling chip driven by the consumer.
 */
const HUE_BY_KIND = {
  // Framing and responses both.
  whiteboard: 'blue',
  memo: 'purple',
  document: 'teal',
  // Framing only.
  image: 'rose',
  cta: 'orange',
  poll: 'amber',
  contributors: 'emerald',
  spaces: 'indigo',
  // Responses only.
  link: 'emerald',
  post: 'amber',
  tasks: 'indigo',
} as const satisfies Record<string, keyof typeof TINTS>;

export type TintedChipKind = keyof typeof HUE_BY_KIND;

/** The icon colour for a kind of content, in every state. */
export const chipIconTint = (kind: TintedChipKind): string => TINTS[HUE_BY_KIND[kind]].icon;

/** The chip surface for a kind of content, used only while it is selected. */
export const chipSurfaceTint = (kind: TintedChipKind): string => TINTS[HUE_BY_KIND[kind]].surface;
