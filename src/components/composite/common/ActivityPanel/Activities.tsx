import { Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import CircleTag from '../../../core/CircleTag';
import Typography from '../../../core/Typography';

export interface ActivityItem {
  name: string;
  isLoading?: boolean;
  digit: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}
export const Activities: FC<{ items: ActivityItem[]; asList?: boolean }> = ({ items, asList = true, children }) => {
  return (
    <Grid container spacing={1}>
      {items.map(({ name, isLoading, digit, color }, i) => (
        <Grid
          item
          container
          key={i}
          xs={12}
          md={asList ? 12 : 6}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Grid item>
            {!isLoading && <Typography variant="caption">{name}</Typography>}
            {isLoading && <Skeleton variant="text" sx={{ minWidth: 150 }} />}
          </Grid>
          <Grid item>
            {!isLoading && <CircleTag text={`${digit}`} color={color || 'neutral'} />}
            {isLoading && <Skeleton variant="circular" sx={{ height: 36, width: 36 }} />}
          </Grid>
        </Grid>
      ))}
      {children}
    </Grid>
  );
};
