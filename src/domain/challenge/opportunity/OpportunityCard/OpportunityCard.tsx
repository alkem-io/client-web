import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { OpportunityIcon } from '../icon/OpportunityIcon';
import JourneyCardParentSegment from '../../common/HubChildJourneyCard/JourneyCardParentSegment';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';

interface OpportunityCardProps
  extends Omit<HubChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
  opportunityId?: string;
  challengeUri?: string;
  challengeDisplayName?: string;
  innovationFlowState?: string;
}

const OpportunityCard = ({ opportunityId, challengeDisplayName, challengeUri, ...props }: OpportunityCardProps) => {
  const { user } = useUserContext();

  const isMember = opportunityId ? user?.ofOpportunity(opportunityId) : undefined;

  return (
    <HubChildJourneyCard
      iconComponent={OpportunityIcon}
      parentSegment={
        challengeUri &&
        challengeDisplayName && (
          <JourneyCardParentSegment iconComponent={ChallengeIcon} parentJourneyUri={challengeUri}>
            {challengeDisplayName}
          </JourneyCardParentSegment>
        )
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName="opportunity" />
        </CardActions>
      }
      member={isMember}
      {...props}
    />
  );
};

export default OpportunityCard;
