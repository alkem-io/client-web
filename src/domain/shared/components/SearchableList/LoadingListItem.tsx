import { Box, Skeleton } from '@mui/material';
import type React from 'react';

const LoadingListItem = ({ ref }: { ref?: React.Ref<HTMLDivElement> }) => (
  <Box ref={ref} height="50px" display="flex" justifyContent="space-between">
    <Skeleton width="50%" />
    <Skeleton width="5%" />
  </Box>
);

export default LoadingListItem;
