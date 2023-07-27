import React, { forwardRef, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/material/Box/Box';
import { gutters } from './utils';

interface GuttersProps {
  row?: boolean;
  disablePadding?: boolean;
}

const Gutters = forwardRef(({ row = false, disablePadding = false, ...props }: GuttersProps & BoxProps, ref) => {
  return (
    <Box
      ref={ref}
      display="flex"
      flexDirection={row ? 'row' : 'column'}
      padding={disablePadding ? 0 : gutters()}
      gap={gutters()}
      {...props}
    />
  );
});

export default Gutters as <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>(
  props: GuttersProps & BoxProps<D, P>
) => ReactElement;
