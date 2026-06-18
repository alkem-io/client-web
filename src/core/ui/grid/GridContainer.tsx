import type { CSSProperties, ReactNode, Ref } from 'react';
import { extractSystemProps, resolveSx } from '../typography/sx';
import { GUTTER_PX } from './gutter.constants';

export interface GridContainerProps {
  disablePadding?: boolean;
  sameHeight?: boolean;
  noWrap?: boolean;
  disableGap?: boolean;
  // Accepts the MUI `BoxProps` surface importers still spread (sx, system
  // props, className, ref, DOM attributes) without pulling MUI into the bundle.
  ref?: Ref<HTMLDivElement>;
  sx?: any;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

// gutters() resolved against this theme's 10px spacing unit: GUTTER_MUI(2) * 10 = 20px.
const GUTTER = `${GUTTER_PX}px`;

const GridContainer = ({
  disablePadding = false,
  sameHeight = false,
  noWrap = false,
  disableGap = false,
  ref,
  sx,
  style,
  className,
  children,
  ...rest
}: GridContainerProps) => {
  const base: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: noWrap ? 'nowrap' : 'wrap',
    alignItems: sameHeight ? 'stretch' : 'start',
    gap: disableGap ? 0 : GUTTER,
    padding: disablePadding ? undefined : GUTTER,
  };

  const { style: systemStyle, rest: domProps } = extractSystemProps(rest);
  const merged = { ...base, ...systemStyle, ...resolveSx(sx), ...style };

  return (
    <div ref={ref} className={className} style={merged} {...domProps}>
      {children}
    </div>
  );
};

export default GridContainer;
