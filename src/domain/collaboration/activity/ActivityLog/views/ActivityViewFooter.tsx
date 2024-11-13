import { Box } from '@mui/material';
import { Caption } from '@core/ui/typography';
import { ReactNode } from 'react';

interface ActivityViewFooterProps {
  contextDisplayName: ReactNode;
}

const ActivityViewFooter = ({ contextDisplayName }: ActivityViewFooterProps) => {
  return (
    <Box display="flex" sx={{ '& > *': { flexShrink: 0 }, color: 'neutral.light' }}>
      <Caption noWrap flexShrink={1}>
        {contextDisplayName}
      </Caption>
    </Box>
  );
};

export default ActivityViewFooter;
