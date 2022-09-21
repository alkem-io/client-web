import React, { FC } from 'react';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { ChallengeIcon } from '../../../../common/icons/ChallengeIcon';
import { SearchBaseJourneyCard } from './base/SearchBaseJourneyCard';
import { SearchJourneyWithParentCardProps } from './SearchJourneyWithParentCardProps';

export interface SearchOpportunityCardProps extends SearchJourneyWithParentCardProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ ...rest }) => {
  return (
    <SearchBaseJourneyCard
      icon={StarBorderOutlinedIcon}
      parentIcon={ChallengeIcon}
      { ...rest }
    />
  );
};
