import { PLATFORM_NAVIGATION_MENU_ELEVATION } from '@/main/ui/platformNavigation/constants';
import { Paper } from '@mui/material';
import { PropsWithChildren, forwardRef } from 'react';

// TODO width
const GlobalMenuSurface = forwardRef<HTMLDivElement, PropsWithChildren>(({ children }, ref) => (
  <Paper ref={ref} sx={{ width: 320, maxWidth: '100%' }} elevation={PLATFORM_NAVIGATION_MENU_ELEVATION}>
    {children}
  </Paper>
));

export default GlobalMenuSurface;
