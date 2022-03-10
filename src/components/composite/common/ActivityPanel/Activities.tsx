import { Grid, Skeleton, Theme, useMediaQuery } from '@mui/material';
import React, { FC } from 'react';
import CircleTag from '../../../core/CircleTag';
import Typography from '../../../core/Typography';
import { ActivityType } from '../../../../models/constants';

export interface ActivityItem {
  name: string;
  type?: ActivityType;
  isLoading?: boolean;
  count: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}

export const Activities: FC<{ items: ActivityItem[]; asList?: boolean }> = ({ items, asList = true, children }) => {
  const mediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  const maxHeightSteps = mediumScreen || asList ? items.length : items.length / 2 + 1;
  return (
    <Grid container spacing={1} direction="column" maxHeight={t => t.spacing(6 * maxHeightSteps)}>
      {items.map(({ name, isLoading, count, color }, i) => (
        <Grid key={i} item xs={12} md={asList ? 12 : 6}>
          <Grid container justifyContent={'space-between'} alignItems={'center'}>
            <Grid item>
              {!isLoading && <Typography variant="caption">{name}</Typography>}
              {isLoading && <Skeleton variant="text" sx={{ minWidth: 150 }} />}
            </Grid>
            <Grid item>
              {!isLoading && <CircleTag text={`${count}`} color={color || 'neutral'} />}
              {isLoading && <Skeleton variant="circular" sx={{ height: 36, width: 36 }} />}
            </Grid>
          </Grid>
        </Grid>
      ))}
      {children}
    </Grid>
  );
};
