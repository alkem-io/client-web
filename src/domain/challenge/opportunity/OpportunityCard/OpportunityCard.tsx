import React from 'react';
import SpaceChildJourneyCard, {
  SpaceChildJourneyCardProps,
} from '../../common/SpaceChildJourneyCard/SpaceChildJourneyCard';
import { OpportunityIcon } from '../icon/OpportunityIcon';
import CardParentJourneySegment from '../../common/SpaceChildJourneyCard/CardParentJourneySegment';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface OpportunityCardProps
  extends Omit<SpaceChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  opportunityId?: string;
  challengeUri?: string;
  challengeDisplayName?: string;
  spaceVisibility?: SpaceVisibility;
  innovationFlowState?: string;
}

const OpportunityCard = ({
  opportunityId,
  challengeDisplayName,
  challengeUri,
  spaceVisibility,
  ...props
}: OpportunityCardProps) => {
  const { user } = useUserContext();
  const { t } = useTranslation();

  const isMember = opportunityId ? user?.ofOpportunity(opportunityId) : undefined;
  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <SpaceChildJourneyCard
      iconComponent={OpportunityIcon}
      parentSegment={
        challengeUri &&
        challengeDisplayName && (
          <CardParentJourneySegment iconComponent={ChallengeIcon} parentJourneyUri={challengeUri}>
            {challengeDisplayName}
          </CardParentJourneySegment>
        )
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName="opportunity" />
        </CardActions>
      }
      member={isMember}
      ribbon={ribbon}
      {...props}
    />
  );
};

export default OpportunityCard;
