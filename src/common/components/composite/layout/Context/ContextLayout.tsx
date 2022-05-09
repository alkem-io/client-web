import { Grid } from '@mui/material';
import React, { FC, ReactNode } from 'react';

export interface ContextLayoutProps {
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
}

const ContextLayout: FC<ContextLayoutProps> = ({ rightPanel, leftPanel, children }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={6}>
        {leftPanel ? leftPanel : children}
      </Grid>
      <Grid item xs={12} lg={6} zeroMinWidth>
        {rightPanel}
      </Grid>
    </Grid>
  );
};
export default ContextLayout;
