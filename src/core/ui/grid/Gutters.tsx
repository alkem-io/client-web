import React, { forwardRef, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/system';
import { gutters } from './utils';

export interface GuttersProps extends BoxProps {
  row?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
  fullHeight?: boolean;
}

const Gutters = forwardRef(
  ({ row = false, disablePadding = false, disableGap = false, fullHeight = false, ...props }: GuttersProps, ref) => {
    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection={row ? 'row' : 'column'}
        padding={disablePadding ? 0 : gutters()}
        gap={disableGap ? undefined : gutters()}
        {...(fullHeight
          ? {
              height: '100%',
              justifyContent: 'space-between',
            }
          : undefined)}
        {...props}
      />
    );
  }
);

export default Gutters as <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>(
  props: GuttersProps & BoxProps<D, P>
) => ReactElement;
