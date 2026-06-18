import {
  type CSSProperties,
  createElement,
  type ElementType,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import { extractSystemProps, resolveColor, resolveSx } from './sx';

/**
 * MUI-free replacement for MUI Material `Typography`, scoped to the subset
 * of its API the legacy typography primitives in this directory rely on. Each
 * variant reproduces the font size / weight / line-height / family the MUI
 * theme produced (see `themeTypographyOptions.ts`) via inline styles so the
 * rendered text is visually identical without pulling MUI into the bundle.
 *
 * Public surface kept compatible with the old `Typography`-based primitives:
 * `variant`, `component`, `color`, `textAlign`/`align`, `noWrap`, `display`,
 * `fontWeight`, `fontStyle`, `textTransform`, `sx`, `className`, `onClick`,
 * `ref`, `children`, plus the MUI `Box`/`Typography` system props
 * (`bgcolor`, `m*`/`p*` spacing, `borderRadius`, `width`, …) that importers
 * still pass — these are translated to inline styles via `extractSystemProps`.
 */

const FONT_MONTSERRAT = '"Montserrat", sans-serif';
const FONT_SOURCE_SANS = '"Source Sans Pro", sans-serif';

const GUTTER_PX = 20;
const lineSingle = `${GUTTER_PX / 16}rem`;
const lineDouble = `${(GUTTER_PX * 2) / 16}rem`;
const rem = (px: number) => `${px / 16}rem`;

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline'
  | 'inherit';

const VARIANT_STYLE: Record<TypographyVariant, CSSProperties> = {
  h1: { fontFamily: FONT_MONTSERRAT, fontSize: rem(25), fontWeight: 700, lineHeight: lineDouble },
  h2: { fontFamily: FONT_MONTSERRAT, fontSize: rem(18), fontWeight: 700, lineHeight: lineSingle },
  h3: { fontFamily: FONT_MONTSERRAT, fontSize: rem(15), fontWeight: 400, lineHeight: lineSingle },
  h4: { fontFamily: FONT_MONTSERRAT, fontSize: rem(12), fontWeight: 400, lineHeight: lineSingle },
  h5: { fontFamily: FONT_SOURCE_SANS, fontSize: rem(14), fontWeight: 700, lineHeight: lineDouble },
  h6: { fontFamily: FONT_SOURCE_SANS, fontSize: rem(14), fontWeight: 400, lineHeight: lineDouble },
  subtitle1: {
    fontFamily: FONT_MONTSERRAT,
    fontSize: rem(16),
    fontWeight: 400,
    lineHeight: lineSingle,
    fontStyle: 'italic',
  },
  body1: { fontFamily: FONT_SOURCE_SANS, fontSize: rem(14), fontWeight: 400, lineHeight: lineSingle },
  body2: { fontFamily: FONT_SOURCE_SANS, fontSize: rem(12), fontWeight: 400, lineHeight: lineSingle },
  button: {
    fontFamily: FONT_MONTSERRAT,
    fontSize: rem(12),
    fontWeight: 500,
    lineHeight: lineSingle,
    textTransform: 'uppercase',
  },
  caption: { fontFamily: FONT_MONTSERRAT, fontSize: rem(12), fontWeight: 400, lineHeight: lineSingle },
  overline: {
    fontFamily: FONT_SOURCE_SANS,
    fontSize: rem(12),
    fontWeight: 400,
    lineHeight: 2.66,
    textTransform: 'uppercase',
  },
  inherit: {},
};

// MUI maps each variant to a default HTML element.
const VARIANT_ELEMENT: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h6',
  h6: 'h6',
  subtitle1: 'h6',
  body1: 'p',
  body2: 'p',
  button: 'span',
  caption: 'span',
  overline: 'span',
  inherit: 'p',
};

const NO_WRAP_STYLE: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export type TypographyProps = {
  // Loose to match whatever element a wrapped primitive renders (the second
  // generic of `provideStaticProps`) and importer refs (`HTMLAnchorElement`,
  // `HTMLSpanElement`, …).
  ref?: Ref<any>;
  // Loose to accept the full MUI `TypographyProps['variant']` union (incl.
  // `subtitle2` etc.) at importer call sites that still spread MUI props.
  // Unknown variants fall back to `body1` at runtime.
  variant?: any;
  component?: ElementType;
  color?: string;
  // The MUI `Box`/`Typography` system props below accept `ResponsiveStyleValue`
  // shapes (arrays / theme callbacks) at importer call sites, so we type them
  // loosely and normalize to a single CSS value at runtime.
  textAlign?: any;
  align?: any;
  noWrap?: boolean;
  display?: any;
  fontWeight?: any;
  fontStyle?: any;
  textTransform?: any;
  // Accepts MUI `SxProps` (object / callback / array) at call sites.
  sx?: any;
  style?: CSSProperties;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: ReactNode;
  // MUI `Box`/`Typography` system props + arbitrary DOM attributes flow through.
  [key: string]: any;
};

const Typography = ({
  ref,
  variant = 'body1',
  component,
  color,
  textAlign,
  align,
  noWrap,
  display,
  fontWeight,
  fontStyle,
  textTransform,
  sx,
  style,
  className,
  onClick,
  children,
  ...rest
}: TypographyProps) => {
  const variantStyle = VARIANT_STYLE[variant as TypographyVariant] ?? VARIANT_STYLE.body1;
  const element: ElementType = component ?? VARIANT_ELEMENT[variant as TypographyVariant] ?? 'p';

  const base: CSSProperties = { margin: 0, ...variantStyle };
  if (color !== undefined) {
    base.color = resolveColor(color);
  }
  const resolvedAlign = textAlign ?? align;
  if (resolvedAlign !== undefined) {
    base.textAlign = resolvedAlign;
  }
  if (display !== undefined) {
    base.display = display;
  }
  if (fontWeight !== undefined) {
    base.fontWeight = fontWeight === 'bold' ? 700 : fontWeight;
  }
  if (fontStyle !== undefined) {
    base.fontStyle = fontStyle;
  }
  if (textTransform !== undefined) {
    base.textTransform = textTransform;
  }
  if (noWrap) {
    Object.assign(base, NO_WRAP_STYLE);
  }

  const { style: systemStyle, rest: domProps } = extractSystemProps(rest);
  const merged = { ...base, ...systemStyle, ...resolveSx(sx), ...style };

  return createElement(element, { ref, className, style: merged, onClick, ...domProps }, children);
};

export default Typography;
