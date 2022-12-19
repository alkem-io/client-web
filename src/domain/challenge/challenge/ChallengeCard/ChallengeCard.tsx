import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';
import JourneyCardParentSegment from '../../common/HubChildJourneyCard/JourneyCardParentSegment';
import { HubIcon } from '../../hub/icon/HubIcon';

interface ChallengeCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  displayName: string;
  hubUri?: string;
  hubDisplayName?: string;
  innovationFlowState?: string;
}

const ChallengeCard = ({ hubDisplayName, hubUri, ...props }: ChallengeCardProps) => {
  return (
    <HubChildJourneyCard
      iconComponent={ChallengeIcon}
      journeyTypeName="challenge"
      parentSegment={
        hubUri &&
        hubDisplayName && (
          <JourneyCardParentSegment iconComponent={HubIcon} parentJourneyUri={hubUri}>
            {hubDisplayName}
          </JourneyCardParentSegment>
        )
      }
      {...props}
    />
  );
};

export default ChallengeCard;
