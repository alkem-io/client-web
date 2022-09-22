import React, { FC } from 'react';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { SearchBaseJourneyCard } from './base/SearchBaseJourneyCard';
import { SearchJourneyWithParentImplProps } from './SearchJourneyWithParentCard';

export interface SearchOpportunityCardProps extends SearchJourneyWithParentImplProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ children, ...rest }) => {
  return (
    <SearchBaseJourneyCard
      icon={StarBorderOutlinedIcon}
      { ...rest }
    >
      {children}
    </SearchBaseJourneyCard>
  );
};
