import React, { cloneElement, PropsWithChildren, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/material/Box/Box';
import { gutters } from '../grid/utils';

interface ViewProps {
  visual?: ReactElement<{ sx: { flexShrink: number } }>;
  visualRight?: ReactElement<{ sx: { flexShrink: number } }>;
}

const ItemView = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  visual,
  visualRight,
  children,
  ...containerProps
}: PropsWithChildren<ViewProps> & BoxProps<D, P>) => {
  return (
    <Box display="flex" alignItems="center" gap={gutters()} {...containerProps}>
      {visual && cloneElement(visual, { sx: { flexShrink: 0 } })}
      <Box overflow="hidden" flexGrow={1} minWidth={0}>
        {children}
      </Box>
      {visualRight && cloneElement(visualRight, { sx: { flexShrink: 0 } })}
    </Box>
  );
};

export default ItemView;
