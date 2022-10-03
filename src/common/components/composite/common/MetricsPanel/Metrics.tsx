import { Grid, Skeleton, Theme, useMediaQuery } from '@mui/material';
import React, { FC } from 'react';
import WrapperTypography from '../../../core/WrapperTypography';
import { MetricType } from '../../../../../domain/platform/metrics/MetricType';
import MetricCircleView from '../../../../../domain/platform/metrics/MetricCircleView';

export interface MetricItem {
  name: string;
  type?: MetricType;
  isLoading?: boolean;
  count: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}

export const Metrics: FC<{ items: MetricItem[]; asList?: boolean }> = ({ items, asList = true, children }) => {
  const mediumScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  const maxHeightSteps = mediumScreen || asList ? items.length : items.length / 2 + 1;
  return (
    <Grid container spacing={1} direction="column" maxHeight={t => t.spacing(6 * maxHeightSteps)}>
      {items.map(({ name, isLoading, count, color }, i) => (
        <Grid key={i} item xs={12} md={asList ? 12 : 6}>
          <Grid container justifyContent="space-between" alignItems="center" gap={2}>
            <Grid item>
              {!isLoading && <WrapperTypography variant="caption">{name}</WrapperTypography>}
              {isLoading && <Skeleton variant="text" sx={{ minWidth: 150 }} />}
            </Grid>
            <Grid item>
              <MetricCircleView color={color} loading={isLoading}>
                {count}
              </MetricCircleView>
            </Grid>
          </Grid>
        </Grid>
      ))}
      {children}
    </Grid>
  );
};
