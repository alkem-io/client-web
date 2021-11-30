import { Grid } from '@mui/material';
import React, { FC } from 'react';
import CircleTag from '../../../core/CircleTag';
import Typography from '../../../core/Typography';

export interface ActivityItem {
  name: string;
  digit: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}
export const Activities: FC<{ items: ActivityItem[] }> = ({ items, children }) => {
  return (
    <Grid container spacing={1}>
      {items.map(({ name, digit, color }, i) => (
        <Grid item container key={i} xs={12} justifyContent={'space-between'} alignItems={'center'}>
          <Grid item>
            <Typography>{name}</Typography>
          </Grid>
          <Grid item>
            <CircleTag text={`${digit}`} color={color || 'neutral'} />
          </Grid>
        </Grid>
      ))}
      {children}
    </Grid>
  );
};
