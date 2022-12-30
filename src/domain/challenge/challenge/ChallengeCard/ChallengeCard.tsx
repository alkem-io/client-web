import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';
import JourneyCardParentSegment from '../../common/HubChildJourneyCard/JourneyCardParentSegment';
import { HubIcon } from '../../hub/icon/HubIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import JourneyCardJoinButton from '../../common/JourneyCard/JourneyCardJoinButton';

interface ChallengeCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  challengeId?: string;
  challengeNameId?: string;
  hubUri?: string;
  hubDisplayName?: string;
  innovationFlowState?: string;
  private?: boolean;
  privateParent?: boolean;
  hiddenJoin?: boolean;
}

const ChallengeCard = ({
  challengeId,
  challengeNameId,
  hubDisplayName,
  hubUri,
  hiddenJoin = false,
  ...props
}: ChallengeCardProps) => {
  const { user } = useUserContext();

  const isMember = challengeId ? user?.ofChallenge(challengeId) : undefined;

  return (
    <HubChildJourneyCard
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
          {!hiddenJoin && challengeId && challengeNameId && (
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
