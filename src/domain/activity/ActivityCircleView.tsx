import React, { PropsWithChildren } from 'react';
import CircleTag, { CircleTagProps, CircleTagSize, CircleTagSizeStyles } from '../../common/components/core/CircleTag';
import { Skeleton } from '@mui/material';

export interface ActivityCircleViewProps {
  color?: CircleTagProps['color'];
  loading?: boolean;
}

const ActivityCircleView = ({
  color = 'neutral',
  loading = false,
  children,
}: PropsWithChildren<ActivityCircleViewProps>) => {
  return loading ? (
    <Skeleton variant="circular" sx={CircleTagSizeStyles[CircleTagSize.Large]} />
  ) : (
    <CircleTag color={color}>{children}</CircleTag>
  );
};

export default ActivityCircleView;
