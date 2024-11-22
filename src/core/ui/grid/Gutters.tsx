import React, { forwardRef, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/system';
import { gutters } from './utils';
import { useTheme } from '@mui/styles';

export interface GuttersProps extends BoxProps {
  row?: boolean;
  disablePadding?: boolean;
  disableHorizontalPadding?: boolean;
  disableGap?: boolean;
}

const Gutters = forwardRef(
  (
    {
      row = false,
      disablePadding = false,
      disableHorizontalPadding = false,
      disableGap = false,
      ...props
    }: GuttersProps,
    ref
  ) => {
    const theme = useTheme();
    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection={row ? 'row' : 'column'}
        padding={disablePadding ? 0 : disableHorizontalPadding ? `${gutters()(theme)} 0` : gutters()}
        gap={disableGap ? undefined : gutters()}
        {...props}
      />
    );
  }
);

export default Gutters as <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>(
  props: GuttersProps & BoxProps<D, P>
) => ReactElement;
