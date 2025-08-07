import React, { cloneElement, PropsWithChildren, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/system';
import { gutters } from '../grid/utils';
import { RouterLinkProps } from '../link/RouterLink';

interface BadgeCardViewProps extends Partial<RouterLinkProps> {
  visual?: ReactElement<{ sx: { flexShrink: number } }>;
  actions?: ReactElement<{ sx: { flexShrink: number } }>;
  visualRight?: ReactElement<{ sx: { flexShrink: number } }>;
  contentProps?: BoxProps;
  outlined?: boolean;
  square?: boolean;
  padding?: boolean;
  variant?: string;
  target?: string;
}

const cloneVisual = <Sx extends { flexShrink: number }>(element: ReactElement<{ sx: Partial<Sx> }> | undefined) => {
  if (!element) {
    return undefined;
  }

  const { sx } = element.props;

  return cloneElement(element, { sx: { flexShrink: 0, ...sx } });
};

const BadgeCardView = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  ref,
  visual,
  visualRight,
  children,
  contentProps,
  outlined = false,
  square = false,
  padding = outlined,
  actions = undefined,
  ...containerProps
}: PropsWithChildren<BadgeCardViewProps> & Omit<BoxProps<D, P>, 'padding'>) => {
  return (
    <Box
      ref={ref}
      display="flex"
      alignItems="center"
      gap={gutters()}
      border={outlined ? theme => `1px solid ${theme.palette.divider}` : undefined}
      borderRadius={square ? undefined : theme => `${theme.shape.borderRadius}px`}
      padding={padding ? gutters(0.5) : undefined}
      {...containerProps}
    >
      {cloneVisual(visual)}
      {children && (
        <Box overflow="hidden" flexGrow={1} minWidth={0} {...contentProps}>
          {children}
        </Box>
      )}
      {cloneVisual(visualRight)}
      {actions && cloneVisual(actions)}
    </Box>
  );
};
BadgeCardView.displayName = 'BadgeCardView';

export default BadgeCardView;
