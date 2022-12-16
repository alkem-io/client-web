import React from 'react';
import { BlockTitle } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import JourneyCard, { JourneyCardProps } from '../JourneyCard/JourneyCard';
import JourneyCardTagline from '../JourneyCard/JourneyCardTagline';
import InnovationFlowCardSegment from '../JourneyCard/InnovationFlowCardSegment';

export interface HubChildJourneyCardProps extends Omit<JourneyCardProps, 'header'> {
  displayName: string;
  innovationFlowState?: string;
}

const HubChildJourneyCard = ({ displayName, tagline, innovationFlowState, ...props }: HubChildJourneyCardProps) => {
  return (
    <JourneyCard
      tagline={tagline}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      {...props}
    >
      {innovationFlowState && <InnovationFlowCardSegment>{innovationFlowState}</InnovationFlowCardSegment>}
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default HubChildJourneyCard;
