import type { CSSProperties, ReactNode, Ref } from 'react';
import { resolveColor, resolveSx } from '../typography/sx';

/**
 * MUI-free replacement for MUI Material `SvgIcon`, scoped to the subset of
 * its API the legacy icon primitives in this tree rely on. Reproduces MUI's
 * defaults: a 24×24 viewBox, `fill: currentColor`, `1em` square sizing, and the
 * `fontSize` token scale (small/medium/large/inherit). `color` maps MUI palette
 * tokens to their hex via the typography `sx` resolver; `sx` is resolved the
 * same way the typography primitives do, so importers keep their MUI surface
 * without pulling MUI into the bundle.
 */

// MUI SvgIcon fontSize token → CSS font-size (controls the 1em square).
const FONT_SIZE: Record<string, string> = {
  small: '1.25rem',
  medium: '1.5rem',
  large: '2.1875rem',
  inherit: 'inherit',
};

// MUI SvgIcon `color` prop → palette token (default = currentColor / inherit).
const COLOR_TOKEN: Record<string, string> = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  error: 'error.main',
  warning: 'warning.main',
  action: 'text.secondary',
  disabled: 'text.secondary',
};

export type SvgIconProps = {
  ref?: Ref<SVGSVGElement>;
  children?: ReactNode;
  viewBox?: string;
  // `fontSize`/`color` are loose to stay assignable to/from the MUI
  // `SvgIconProps` unions at the icon-component slots that still type against
  // them (icons are passed as components between MUI and MUI-free call sites).
  fontSize?: any;
  color?: any;
  htmlColor?: string;
  titleAccess?: string;
  sx?: any;
  style?: CSSProperties;
  className?: string;
  [key: string]: any;
};

const SvgIcon = ({
  ref,
  children,
  viewBox = '0 0 24 24',
  fontSize = 'medium',
  color,
  htmlColor,
  titleAccess,
  sx,
  style,
  className,
  ...rest
}: SvgIconProps) => {
  const base: CSSProperties = {
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: htmlColor ?? 'currentColor',
    flexShrink: 0,
    fontSize: FONT_SIZE[fontSize] ?? fontSize,
  };
  if (color && color !== 'inherit') {
    base.color = resolveColor(COLOR_TOKEN[color] ?? color);
  }
  const merged = { ...base, ...resolveSx(sx), ...style };

  return (
    <svg
      ref={ref}
      className={className}
      style={merged}
      viewBox={viewBox}
      focusable="false"
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? 'img' : undefined}
      {...rest}
    >
      {titleAccess ? <title>{titleAccess}</title> : null}
      {children}
    </svg>
  );
};

export default SvgIcon;
