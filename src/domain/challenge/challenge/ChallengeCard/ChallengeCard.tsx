import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';
import JourneyCardParentSegment from '../../common/HubChildJourneyCard/JourneyCardParentSegment';
import { HubIcon } from '../../hub/icon/HubIcon';
import { useUserContext } from '../../../community/contributor/user';

interface ChallengeCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  challengeId?: string;
  hubUri?: string;
  hubDisplayName?: string;
  innovationFlowState?: string;
}

const ChallengeCard = ({ challengeId, hubDisplayName, hubUri, ...props }: ChallengeCardProps) => {
  const { user } = useUserContext();

  const isMember = challengeId ? user?.ofChallenge(challengeId) : undefined;

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
      member={isMember}
      {...props}
    />
  );
};

export default ChallengeCard;
