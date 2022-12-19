import React from 'react';
import { BlockTitle } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import JourneyCard, { JourneyCardProps } from '../JourneyCard/JourneyCard';
import InnovationFlowCardSegment from '../JourneyCard/InnovationFlowCardSegment';
import JourneyCardTagline from '../JourneyCard/JourneyCardTagline';
import JourneyCardVision from '../JourneyCard/JourneyCardVision';
import { Collapse } from '@mui/material';

export interface HubChildJourneyCardProps extends Omit<JourneyCardProps, 'header'> {
  displayName: string;
  vision: string;
  innovationFlowState?: string;
}

const HubChildJourneyCard = ({
  displayName,
  tagline,
  vision,
  innovationFlowState,
  ...props
}: HubChildJourneyCardProps) => {
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
      <Collapse>
        <JourneyCardVision>{vision}</JourneyCardVision>
      </Collapse>
    </JourneyCard>
  );
};

export default HubChildJourneyCard;
