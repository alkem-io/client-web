import React, { ReactNode } from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';
import CardParentJourneySegment from '../../common/HubChildJourneyCard/CardParentJourneySegment';
import { HubIcon } from '../../hub/icon/HubIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import JourneyCardJoinButton from '../../common/JourneyCard/JourneyCardJoinButton';
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import { useTranslation } from 'react-i18next';

interface ChallengeCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  challengeId?: string;
  challengeNameId?: string;
  hubUri?: string;
  hubDisplayName?: ReactNode;
  hubVisibility?: HubVisibility;
  innovationFlowState?: string;
  private?: boolean;
  privateParent?: boolean;
  hideJoin?: boolean;
}

const ChallengeCard = ({
  challengeId,
  challengeNameId,
  hubDisplayName,
  hubUri,
  hubVisibility,
  hideJoin = false,
  ...props
}: ChallengeCardProps) => {
  const { user } = useUserContext();
  const { t } = useTranslation();

  const isMember = challengeId ? user?.ofChallenge(challengeId) : undefined;
  const ribbon =
    hubVisibility && hubVisibility !== HubVisibility.Active ? (
      <CardRibbon text={t(`common.enums.hub-visibility.${hubVisibility}` as const)} />
    ) : undefined;

  return (
    <HubChildJourneyCard
      iconComponent={ChallengeIcon}
      member={isMember}
      parentSegment={
        hubUri &&
        hubDisplayName && (
          <CardParentJourneySegment iconComponent={HubIcon} parentJourneyUri={hubUri}>
            {hubDisplayName}
          </CardParentJourneySegment>
        )
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName="challenge" />
          {!hideJoin && challengeId && challengeNameId && (
            <JourneyCardJoinButton
              challengeId={challengeId}
              challengeNameId={challengeNameId}
              challengeName={props.displayName}
            />
          )}
        </CardActions>
      }
      ribbon={ribbon}
      {...props}
    />
  );
};

export default ChallengeCard;
