import React from 'react';
import { BlockTitle } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import JourneyCard, { JourneyCardProps } from '../../common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../common/JourneyCard/JourneyCardTagline';
import InnovationFlowCardSegment from '../../common/JourneyCard/InnovationFlowCardSegment';

interface ChallengeCardProps extends Omit<JourneyCardProps, 'header'> {
  displayName: string;
  innovationFlowState?: string;
}

const ChallengeCard = ({ displayName, tagline, innovationFlowState, ...props }: ChallengeCardProps) => {
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

export default ChallengeCard;
