import React from 'react';
import HubChildJourneyCard, { HubChildJourneyCardProps } from '../../common/HubChildJourneyCard/HubChildJourneyCard';
import { OpportunityIcon } from '../icon/OpportunityIcon';

interface OpportunityCardProps extends Omit<HubChildJourneyCardProps, 'iconComponent'> {
  displayName: string;
  innovationFlowState?: string;
}

const OpportunityCard = (props: OpportunityCardProps) => {
  return <HubChildJourneyCard iconComponent={OpportunityIcon} {...props} />;
};

export default OpportunityCard;
