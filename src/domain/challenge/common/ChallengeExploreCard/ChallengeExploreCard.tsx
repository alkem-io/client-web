import React from 'react';

import JourneyCardParentSegment from '../../common/HubChildJourneyCard/JourneyCardParentSegment';
import { HubIcon } from '../../hub/icon/HubIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import JourneyCardJoinButton from '../../common/JourneyCard/JourneyCardJoinButton';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import ChallengeExploreJourneyCard, { ChallengeExploreJourneyCardProps } from './ChallengeExploreJourneyCard';

interface ChallengeCardProps
  extends Omit<ChallengeExploreJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  challengeId?: string;
  challengeNameId?: string;
  hubUri?: string;
  hubDisplayName?: string;
  innovationFlowState?: string;
}

const ChallengeCard = ({ challengeId, challengeNameId, hubDisplayName, hubUri, ...props }: ChallengeCardProps) => {
  const { user } = useUserContext();

  const isMember = challengeId ? user?.ofChallenge(challengeId) : undefined;

  return (
    <ChallengeExploreJourneyCard
      iconComponent={ChallengeIcon}
      member={isMember}
      parentSegment={
        hubUri &&
        hubDisplayName && (
          <JourneyCardParentSegment iconComponent={HubIcon} parentJourneyUri={hubUri}>
            {hubDisplayName}
          </JourneyCardParentSegment>
        )
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName="challenge" />
          {challengeId && challengeNameId && (
            <JourneyCardJoinButton
              challengeId={challengeId}
              challengeNameId={challengeNameId}
              challengeName={props.displayName}
            />
          )}
        </CardActions>
      }
      {...props}
    />
  );
};

export default ChallengeCard;
