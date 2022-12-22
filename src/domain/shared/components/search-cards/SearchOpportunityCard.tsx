import React, { FC } from 'react';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../../challenge/opportunity/icon/OpportunityIcon';
import SearchJourneyWithParentCard, { SearchJourneyWithParentImplProps } from './SearchJourneyWithParentCard';

export interface SearchOpportunityCardProps extends SearchJourneyWithParentImplProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ children, ...rest }) => {
  return (
    <SearchJourneyWithParentCard icon={OpportunityIcon} parentIcon={ChallengeIcon} {...rest}>
      {children}
    </SearchJourneyWithParentCard>
  );
};
