import React, { forwardRef } from 'react';
import { Skeleton } from '@mui/material';

const FullWidthSkeleton = forwardRef<HTMLSpanElement>((_props, ref) => <Skeleton ref={ref} width="100%" />);

export default FullWidthSkeleton;
