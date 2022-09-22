import React, { FC } from 'react';
import { ChallengeIcon } from '../../../../common/icons/ChallengeIcon';
import { SearchBaseJourneyCard } from './base/SearchBaseJourneyCard';
import { SearchJourneyWithParentImplProps } from './SearchJourneyWithParentCard';

export interface SearchChallengeCardProps extends SearchJourneyWithParentImplProps {}

export const SearchChallengeCard: FC<SearchChallengeCardProps> = ({ children, ...rest }) => {
  return (
    <SearchBaseJourneyCard
      icon={ChallengeIcon}
      { ...rest }
    >
      {children}
    </SearchBaseJourneyCard>
  );
};
