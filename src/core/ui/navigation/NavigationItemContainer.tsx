import { Box, BoxProps, Paper } from '@mui/material';
import { gutters } from '../grid/utils';
import { forwardRef } from 'react';
import { useElevationContext } from '../utils/ElevationContext';

const NavigationItemContainer = forwardRef<HTMLDivElement, BoxProps>(({ sx, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      component={Paper}
      elevation={useElevationContext()}
      height={gutters(2)}
      sx={{ ...sx, overflow: 'visible' }}
      {...props}
    />
  );
});

export default NavigationItemContainer;
