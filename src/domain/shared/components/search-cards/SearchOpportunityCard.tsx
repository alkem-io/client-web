import React, { FC } from 'react';
import BatchPredictionOutlinedIcon from '@mui/icons-material/BatchPredictionOutlined';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import SearchJourneyWithParentCard, { SearchJourneyWithParentImplProps } from './SearchJourneyWithParentCard';

export interface SearchOpportunityCardProps extends SearchJourneyWithParentImplProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ children, ...rest }) => {
  return (
    <SearchJourneyWithParentCard icon={BatchPredictionOutlinedIcon} parentIcon={ChallengeIcon} {...rest}>
      {children}
    </SearchJourneyWithParentCard>
  );
};
