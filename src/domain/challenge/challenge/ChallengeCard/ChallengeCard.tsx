import React, { ReactNode } from 'react';
import SpaceChildJourneyCard, {
  SpaceChildJourneyCardProps,
} from '../../common/SpaceChildJourneyCard/SpaceChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';
import CardParentJourneySegment from '../../common/SpaceChildJourneyCard/CardParentJourneySegment';
import { SpaceIcon } from '../../space/icon/SpaceIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import JourneyCardJoinButton from '../../common/JourneyCard/JourneyCardJoinButton';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import { useTranslation } from 'react-i18next';

interface ChallengeCardProps
  extends Omit<SpaceChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  challengeId?: string;
  challengeNameId?: string;
  spaceUri?: string;
  spaceDisplayName?: ReactNode;
  spaceVisibility?: SpaceVisibility;
  innovationFlowState?: string;
  private?: boolean;
  privateParent?: boolean;
  hideJoin?: boolean;
  journeyUri: string;
}

const ChallengeCard = ({
  challengeId,
  challengeNameId,
  spaceDisplayName,
  spaceUri,
  spaceVisibility,
  hideJoin = false,
  ...props
}: ChallengeCardProps) => {
  const { user } = useUserContext();
  const { t } = useTranslation();

  const isMember = challengeId ? user?.ofChallenge(challengeId) : undefined;
  const ribbon =
    spaceVisibility === SpaceVisibility.Archived ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <SpaceChildJourneyCard
      iconComponent={ChallengeIcon}
      member={isMember}
      parentSegment={
        spaceUri &&
        spaceDisplayName && (
          <CardParentJourneySegment iconComponent={SpaceIcon} parentJourneyUri={spaceUri}>
            {spaceDisplayName}
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
