import React, { cloneElement, PropsWithChildren, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/material/Box/Box';
import { gutters } from '../grid/utils';

interface ViewProps {
  visual?: ReactElement<{ sx: { flexShrink: number } }>;
  visualRight?: ReactElement<{ sx: { flexShrink: number } }>;
}

const cloneVisual = <Sx extends { flexShrink: number }>(element: ReactElement<{ sx: Partial<Sx> }> | undefined) => {
  if (!element) {
    return undefined;
  }

  const { sx } = element.props;

  return cloneElement(element, {
    sx: {
      flexShrink: 0,
      ...sx,
    },
  });
};

const ItemView = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  visual,
  visualRight,
  children,
  ...containerProps
}: PropsWithChildren<ViewProps> & BoxProps<D, P>) => {
  return (
    <Box display="flex" alignItems="center" gap={gutters()} {...containerProps}>
      {cloneVisual(visual)}
      <Box overflow="hidden" flexGrow={1} minWidth={0}>
        {children}
      </Box>
      {cloneVisual(visualRight)}
    </Box>
  );
};

export default ItemView;
