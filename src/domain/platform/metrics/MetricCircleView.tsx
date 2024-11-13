import React, { PropsWithChildren } from 'react';
import CircleTag, { CircleTagProps, CircleTagSize, CircleTagSizeStyles } from '@core/ui/tags/CircleTag';
import { Skeleton } from '@mui/material';

export interface MetricCircleViewProps {
  color?: CircleTagProps['color'];
  loading?: boolean;
}

const MetricCircleView = ({
  color = 'neutral',
  loading = false,
  children,
}: PropsWithChildren<MetricCircleViewProps>) => {
  return loading ? (
    <Skeleton variant="circular" sx={CircleTagSizeStyles[CircleTagSize.Large]} />
  ) : (
    <CircleTag color={color}>{children}</CircleTag>
  );
};

export default MetricCircleView;
