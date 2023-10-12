import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { forwardRef } from 'react';

const NavigationItemContainer = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  return (
    <Box
      ref={ref}
      height={gutters(2)}
      borderRadius={theme => `${theme.shape.borderRadius}px`}
      sx={{ backgroundColor: theme => theme.palette.background.paper }}
      {...props}
    />
  );
});

export default NavigationItemContainer;
