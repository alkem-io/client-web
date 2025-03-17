import CircleTag from '@/core/ui/tags/CircleTag';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

export const MetricViewItem = ({ text, count }: { text: ReactNode; count: number }) => (
  <Box display="flex" gap={1}>
    <CircleTag count={count} />
    <Typography>{text}</Typography>
  </Box>
);
