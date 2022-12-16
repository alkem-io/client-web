import React, { cloneElement, PropsWithChildren, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';

interface ViewProps {
  visual?: ReactElement<{ flexShrink: number }>;
}

const ItemView = ({ visual, children, ...containerProps }: PropsWithChildren<ViewProps> & BoxProps) => {
  return (
    <Box display="flex" alignItems="center" gap={gutters()} height={gutters(2)} {...containerProps}>
      {visual && cloneElement(visual, { flexShrink: 0 })}
      <Box overflow="hidden">{children}</Box>
    </Box>
  );
};

export default ItemView;
