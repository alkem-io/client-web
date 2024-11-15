import React, { forwardRef } from 'react';
import { Paper } from '@mui/material';
import { PLATFORM_NAVIGATION_MENU_ELEVATION } from '@/main/ui/platformNavigation/constants';

const GlobalMenuSurface = forwardRef<HTMLDivElement>(({ children }, ref) => {
  return (
    // TODO width
    <Paper ref={ref} sx={{ width: 320, maxWidth: '100%' }} elevation={PLATFORM_NAVIGATION_MENU_ELEVATION}>
      {children}
    </Paper>
  );
});

export default GlobalMenuSurface;
