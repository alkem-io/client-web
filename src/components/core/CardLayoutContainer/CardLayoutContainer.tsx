import React, { FC } from 'react';
import { Grid } from '@mui/material';

export const CardLayoutContainer: FC = ({ children }) => {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {children}
    </Grid>
  );
};

interface CardLayoutItemProps {
  flexBasis?: '25%' | '33%' | '50%';
}

export const CardLayoutItem: FC<CardLayoutItemProps> = ({ children, flexBasis = '25%' }) => {
  return (
    <Grid item flexBasis={flexBasis}>
      {children}
    </Grid>
  );
};
