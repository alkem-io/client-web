import React, { ReactNode } from 'react';
import { BlockTitle } from '@/core/ui/typography';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import JourneyCard, { JourneyCardProps } from '../JourneyCard/JourneyCard';
import InnovationFlowCardSegment from '../JourneyCard/InnovationFlowCardSegment';
import JourneyCardTagline from '../JourneyCard/JourneyCardTagline';
import JourneyCardDescription from '../JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../JourneyCard/JourneyCardSpacing';

export interface SpaceChildJourneyCardProps extends Omit<JourneyCardProps, 'header' | 'expansion'> {
  displayName: string;
  tagline: string;
  vision: string;
  innovationFlowState?: string;
  parentSegment?: ReactNode;
}

const SpaceChildJourneyCard = ({
  displayName,
  tagline,
  vision,
  innovationFlowState,
  parentSegment,
  ...props
}: SpaceChildJourneyCardProps) => {
  return (
    <JourneyCard
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      expansion={
        <>
          <JourneyCardDescription>{vision}</JourneyCardDescription>
          {parentSegment ?? <JourneyCardSpacing />}
        </>
      }
      {...props}
    >
      {innovationFlowState && <InnovationFlowCardSegment>{innovationFlowState}</InnovationFlowCardSegment>}
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default SpaceChildJourneyCard;
