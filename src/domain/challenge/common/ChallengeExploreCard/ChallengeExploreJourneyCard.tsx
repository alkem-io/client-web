import React, { ReactNode } from 'react';
import { BlockTitle } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import JourneyCard, { JourneyCardProps } from '../JourneyCard/JourneyCard';
import InnovationFlowCardSegment from '../JourneyCard/InnovationFlowCardSegment';
import JourneyCardTagline from '../JourneyCard/JourneyCardTagline';

export interface ChallengeExploreJourneyCardProps extends Omit<JourneyCardProps, 'header' | 'expansion'> {
  displayName: string;
  vision: string;
  innovationFlowState?: string;
  parentSegment?: ReactNode;
}

const ChallengeExploreJourneyCard = ({
  displayName,
  tagline,
  vision,
  innovationFlowState,
  parentSegment,
  ...props
}: ChallengeExploreJourneyCardProps) => {
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
      {parentSegment}
    </JourneyCard>
  );
};

export default ChallengeExploreJourneyCard;
