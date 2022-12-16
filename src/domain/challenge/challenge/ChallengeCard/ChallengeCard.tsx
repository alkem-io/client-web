import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';

interface ChallengeCardProps extends Omit<HubChildJourneyCardProps, 'iconComponent'> {
  displayName: string;
  innovationFlowState?: string;
}

const ChallengeCard = (props: ChallengeCardProps) => {
  return <HubChildJourneyCard iconComponent={ChallengeIcon} {...props} />;
};

export default ChallengeCard;
