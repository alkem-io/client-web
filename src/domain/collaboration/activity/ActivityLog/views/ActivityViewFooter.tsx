import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { Caption } from '@/core/ui/typography';

const ActivityViewFooter = ({ contextDisplayName }: { contextDisplayName: ReactNode }) => (
  <Box display="flex" sx={{ '& > *': { flexShrink: 0 }, color: 'neutral.light' }}>
    <Caption noWrap={true} flexShrink={1}>
      {contextDisplayName}
    </Caption>
  </Box>
);

export default ActivityViewFooter;
