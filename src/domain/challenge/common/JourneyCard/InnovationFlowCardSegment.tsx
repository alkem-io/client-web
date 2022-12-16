import { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { LifecycleStateIcon } from '../../../platform/admin/templates/InnovationTemplates/LifecycleState';

interface InnovationFlowCardSegmentProps {
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const InnovationFlowCardSegment = ({ children }: InnovationFlowCardSegmentProps) => {
  return (
    <Box display="flex" gap={1} justifyContent="end" paddingY={1}>
      <Caption>{children}</Caption>
      <LifecycleStateIcon />
    </Box>
  );
};

export default InnovationFlowCardSegment;
