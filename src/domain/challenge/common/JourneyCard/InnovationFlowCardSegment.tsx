import { ReactNode } from 'react';
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';

interface InnovationFlowCardSegmentProps {
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const InnovationFlowCardSegment = ({ children }: InnovationFlowCardSegmentProps) => {
  return (
    <CardSegmentCaption icon={<InnovationFlowIcon />} align="right">
      {children}
    </CardSegmentCaption>
  );
};

export default InnovationFlowCardSegment;
