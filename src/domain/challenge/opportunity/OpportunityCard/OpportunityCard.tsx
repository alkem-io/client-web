import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { OpportunityIcon } from '../icon/OpportunityIcon';
import JourneyCardParentSegment from '../../common/HubChildJourneyCard/JourneyCardParentSegment';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';

interface OpportunityCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  displayName: string;
  challengeUri?: string;
  challengeDisplayName?: string;
  innovationFlowState?: string;
}

const OpportunityCard = ({ challengeDisplayName, challengeUri, ...props }: OpportunityCardProps) => {
  return (
    <HubChildJourneyCard
      iconComponent={OpportunityIcon}
      journeyTypeName="opportunity"
      parentSegment={
        challengeUri &&
        challengeDisplayName && (
          <JourneyCardParentSegment iconComponent={ChallengeIcon} parentJourneyUri={challengeUri}>
            {challengeDisplayName}
          </JourneyCardParentSegment>
        )
      }
      {...props}
    />
  );
};

export default OpportunityCard;
