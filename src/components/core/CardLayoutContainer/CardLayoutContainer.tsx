import React, { FC } from 'react';
import { Grid, GridProps } from '@mui/material';

export const CardLayoutContainer: FC = ({ children }) => {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {children}
    </Grid>
  );
};

interface CardLayoutItemProps extends Pick<GridProps, 'maxWidth' | 'flexGrow'> {
  flexBasis?: '25%' | '33%' | '50%';
}

export const CardLayoutItem: FC<CardLayoutItemProps> = ({ children, flexBasis = '25%', flexGrow, maxWidth }) => {
  return (
    <Grid item flexBasis={flexBasis} maxWidth={maxWidth} flexGrow={flexGrow}>
      {children}
    </Grid>
  );
};
