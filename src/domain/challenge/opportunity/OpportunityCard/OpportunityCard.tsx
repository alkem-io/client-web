import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { OpportunityIcon } from '../icon/OpportunityIcon';
import CardParentJourneySegment from '../../common/HubChildJourneyCard/CardParentJourneySegment';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface OpportunityCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  opportunityId?: string;
  challengeUri?: string;
  challengeDisplayName?: string;
  hubVisibility?: HubVisibility;
  innovationFlowState?: string;
}

const OpportunityCard = ({
  opportunityId,
  challengeDisplayName,
  challengeUri,
  hubVisibility,
  ...props
}: OpportunityCardProps) => {
  const { user } = useUserContext();
  const { t } = useTranslation();

  const isMember = opportunityId ? user?.ofOpportunity(opportunityId) : undefined;
  const ribbon =
    hubVisibility && hubVisibility !== HubVisibility.Active ? (
      <CardRibbon text={t(`common.enums.hub-visibility.${hubVisibility}` as const)} />
    ) : undefined;

  return (
    <HubChildJourneyCard
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
