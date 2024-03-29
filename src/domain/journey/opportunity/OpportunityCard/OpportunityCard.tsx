import React from 'react';
import SpaceChildJourneyCard, {
  SpaceChildJourneyCardProps,
} from '../../common/SpaceChildJourneyCard/SpaceChildJourneyCard';
import { OpportunityIcon } from '../icon/OpportunityIcon';
import CardParentJourneySegment from '../../common/SpaceChildJourneyCard/CardParentJourneySegment';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface OpportunityCardProps
  extends Omit<SpaceChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  tagline: string;
  opportunityId?: string;
  challengeUri?: string;
  challengeDisplayName?: string;
  spaceVisibility?: SpaceVisibility;
  innovationFlowState?: string;
  journeyUri: string;
}

const OpportunityCard = ({
  opportunityId,
  challengeDisplayName,
  challengeUri,
  spaceVisibility,
  ...props
}: OpportunityCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility === SpaceVisibility.Archived ? (
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
      bannerOverlay={ribbon}
      {...props}
    />
  );
};

export default OpportunityCard;
