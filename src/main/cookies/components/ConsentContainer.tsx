import React, { forwardRef, PropsWithChildren } from 'react';
import { Paper } from '@mui/material';
import SwapColors from '@/core/ui/palette/SwapColors';
import { gutters } from '@/core/ui/grid/utils';

const CookieConsent = forwardRef<HTMLDivElement, PropsWithChildren>(({ children }, ref) => {
  return (
    <SwapColors>
      <Paper
        ref={ref}
        square
        sx={{
          left: '0',
          bottom: '0',
          position: 'fixed',
          width: '100%',
          zIndex: '1500',
          display: 'flex',
          padding: gutters(),
          gap: gutters(),
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {children}
      </Paper>
    </SwapColors>
  );
});

export default CookieConsent;
