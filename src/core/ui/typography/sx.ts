import type { CSSProperties } from 'react';

/**
 * Minimal MUI-free resolver for the `sx` prop, scoped to the patterns the
 * typography + content primitives' importers actually use. NOT a general MUI
 * `sx` engine — it covers: spacing shorthands (`m*`/`p*`/`gap`) against this
 * theme's 10px spacing unit, MUI palette color paths (`primary.main`,
 * `text.secondary`, …), and plain CSS passthrough. `sx` callbacks of the form
 * `theme => ({...})` are invoked with a tiny theme shim whose `breakpoints`
 * helpers collapse to the base (non-responsive) value — the importers here use
 * breakpoints only to show/center on small screens, so the base style is the
 * safe, faithful default for the bundled CRD path.
 */

const SPACING_UNIT = 10; // matches src/core/ui/themes/default/Theme.ts SPACING

const PALETTE: Record<string, string> = {
  'primary.main': '#1D384A',
  'primary.contrastText': '#FFFFFF',
  'secondary.main': '#2f3434ff',
  'text.primary': '#181828',
  'text.secondary': 'rgba(0, 0, 0, 0.6)',
  textPrimary: '#181828',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  'error.main': '#D32F2F',
  error: '#D32F2F',
  'warning.main': '#ED6C02',
  warning: '#ED6C02',
  'neutral.main': '#181828',
  'neutral.light': '#646464',
  'neutralMedium.main': '#9E9E9E',
  'neutralMedium.light': '#EEEEEE',
  'neutralMedium.dark': '#757575',
  'background.default': '#F1F4F5',
  'background.paper': '#FFFFFF',
  divider: '#D3D3D3',
  black: '#000000',
  white: '#FFFFFF',
};

export const resolveColor = (color: string): string => PALETTE[color] ?? color;

// MUI spacing shorthand → CSS longhand(s).
const SPACING_PROPS: Record<string, (keyof CSSProperties)[]> = {
  m: ['margin'],
  mt: ['marginTop'],
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  mr: ['marginRight'],
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  p: ['padding'],
  pt: ['paddingTop'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  pr: ['paddingRight'],
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
};

const spacingToPx = (value: unknown): string | undefined => {
  if (typeof value === 'number') {
    return `${value * SPACING_UNIT}px`;
  }
  if (typeof value === 'function') {
    // gutters()-style: (theme) => theme.spacing(n)
    const out = (value as (t: ThemeShim) => unknown)(themeShim);
    return typeof out === 'string' ? out : undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
};

type ThemeShim = {
  spacing: (n: number) => string;
  palette: { mode: 'light' } & Record<string, unknown>;
  breakpoints: {
    up: (k?: string) => string;
    down: (k?: string) => string;
    only: (k?: string) => string;
    between: (a?: string, b?: string) => string;
  };
};

// A breakpoint media-query key the importers' base styles never match, so
// `[theme.breakpoints.up('md')]: {...}` overrides collapse away and we keep the
// mobile-first base style. Using `@media (min-width:0)` would always match, so
// we deliberately use an unmatchable key.
const NEVER = '@media (max-width:0px)';
export const themeShim: ThemeShim = {
  spacing: (n: number) => `${n * SPACING_UNIT}px`,
  palette: new Proxy(
    { mode: 'light' as const },
    {
      get(target, prop: string) {
        if (prop in target) {
          return (target as Record<string, unknown>)[prop];
        }
        // theme.palette.error.main etc → resolve to hex via PALETTE keys
        return new Proxy(
          {},
          {
            get(_t, sub: string) {
              return resolveColor(`${prop}.${sub}`);
            },
          }
        );
      },
    }
  ) as ThemeShim['palette'],
  breakpoints: {
    up: () => NEVER,
    down: () => NEVER,
    only: () => NEVER,
    between: () => NEVER,
  },
};

type SxObject = Record<string, unknown>;
// Loose by design: importers pass MUI `SxProps` / `BoxProps['sx']`, whose
// callback receives the full MUI theme. We accept `any`-shaped objects/callbacks
// so those call sites keep type-checking without an MUI dependency.
export type Sx = SxObject | ((theme: any) => any) | undefined | false | null;

// MUI system colour props that take palette tokens / CSS colours.
const COLOR_PROPS = new Set(['color', 'bgcolor', 'backgroundColor', 'borderColor']);
// MUI system props whose numeric values are theme-spacing multiples.
const SPACING_LONGHAND = new Set([
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'gap',
  'borderRadius',
]);

const resolveValue = (key: string, value: unknown): unknown => {
  if (COLOR_PROPS.has(key) && typeof value === 'string') {
    return resolveColor(value);
  }
  if (typeof value === 'function') {
    // gutters()-style / theme callbacks → invoke with the theme shim.
    return (value as (t: typeof themeShim) => unknown)(themeShim);
  }
  if ((SPACING_LONGHAND.has(key) || SPACING_PROPS[key]) && typeof value === 'number') {
    return `${value * SPACING_UNIT}px`;
  }
  return value;
};

const NORMALIZE_KEY: Record<string, string> = {
  bgcolor: 'backgroundColor',
  marginX: 'marginInline',
  marginY: 'marginBlock',
  paddingX: 'paddingInline',
  paddingY: 'paddingBlock',
};

const assign = (style: Record<string, unknown>, key: string, value: unknown) => {
  if (value == null) {
    return;
  }
  // Drop unmatchable media-query / pseudo blocks (collapsed breakpoints).
  if (key.startsWith('@media') || key.startsWith('&')) {
    return;
  }
  const spacingTargets = SPACING_PROPS[key];
  if (spacingTargets) {
    const px = spacingToPx(value);
    if (px !== undefined) {
      for (const target of spacingTargets) {
        style[target] = px;
      }
    }
    return;
  }
  const normalized = NORMALIZE_KEY[key] ?? key;
  style[normalized] = resolveValue(key, value);
};

const resolveObject = (obj: SxObject): CSSProperties => {
  const style: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    assign(style, key, value);
  }
  return style as CSSProperties;
};

const resolveOne = (sx: Exclude<Sx, undefined | false | null>): CSSProperties => {
  const obj = typeof sx === 'function' ? sx(themeShim) : sx;
  return obj ? resolveObject(obj as SxObject) : {};
};

type ResolvableSx = Exclude<Sx, undefined | false | null>;

export const resolveSx = (sx: any, base?: CSSProperties): CSSProperties | undefined => {
  if (!sx) {
    return base;
  }
  // MUI `sx` array form: merge each entry left→right.
  const resolved: CSSProperties = Array.isArray(sx)
    ? sx.reduce<CSSProperties>((acc, entry) => (entry ? { ...acc, ...resolveOne(entry as ResolvableSx) } : acc), {})
    : resolveOne(sx as ResolvableSx);
  return base ? { ...base, ...resolved } : resolved;
};
