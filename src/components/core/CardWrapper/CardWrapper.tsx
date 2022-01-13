import React, { FC } from 'react';
import { Grid } from '@mui/material';

export const CardWrapper: FC = ({ children }) => {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {children}
    </Grid>
  );
};

interface CardWrapperItemProps {
  flexBasis?: '25%' | '33%' | '50%';
}

export const CardWrapperItem: FC<CardWrapperItemProps> = ({ children, flexBasis = '25%' }) => {
  return (
    <Grid
      item
      flexGrow={1}
      flexBasis={flexBasis}
      maxWidth={{ xs: 'auto', sm: 'auto', md: '50%', lg: '33%', xl: '25%' }}
    >
      {children}
    </Grid>
  );
};
