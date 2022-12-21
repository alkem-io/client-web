import { ReactNode } from 'react';
import { LifecycleStateIcon } from '../../../platform/admin/templates/InnovationTemplates/LifecycleState';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';

interface InnovationFlowCardSegmentProps {
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const InnovationFlowCardSegment = ({ children }: InnovationFlowCardSegmentProps) => {
  return (
    <CardSegmentCaption icon={<LifecycleStateIcon />} align="right">
      {children}
    </CardSegmentCaption>
  );
};

export default InnovationFlowCardSegment;
