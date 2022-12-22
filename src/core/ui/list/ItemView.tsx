import React, { cloneElement, PropsWithChildren, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/material/Box/Box';
import { gutters } from '../grid/utils';

interface ViewProps {
  visual?: ReactElement<{ flexShrink: number }>;
}

const ItemView = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  visual,
  children,
  ...containerProps
}: PropsWithChildren<ViewProps> & BoxProps<D, P>) => {
  return (
    <Box display="flex" alignItems="center" gap={gutters()} {...containerProps}>
      {visual && cloneElement(visual, { flexShrink: 0 })}
      <Box overflow="hidden">{children}</Box>
    </Box>
  );
};

export default ItemView;
