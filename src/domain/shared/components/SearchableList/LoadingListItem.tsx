import React from 'react';
import { Box, Skeleton } from '@mui/material';

const LoadingListItem = ({ ref }: { ref?: React.Ref<HTMLDivElement> }) => (
  <Box ref={ref} height="50px" display="flex" justifyContent="space-between">
    <Skeleton width="50%" />
    <Skeleton width="5%" />
  </Box>
);

export default LoadingListItem;
