import React, { FC } from 'react';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { SearchBaseJourneyCard } from './base/SearchBaseJourneyCard';
import { SearchJourneyCardProps } from './SearchJourneyCardProps';
import { ChallengeIcon } from '../../../../common/icons/ChallengeIcon';
import { SearchJourneyWithParentCardProps } from './SearchJourneyWithParentCardProps';

export interface SearchChallengeCardProps extends SearchJourneyWithParentCardProps {}

export const SearchChallengeCard: FC<SearchChallengeCardProps> = ({ ...rest }) => {
  return (
    <SearchBaseJourneyCard
      icon={ChallengeIcon}
      parentIcon={HubOutlinedIcon}
      { ...rest }
    />
  );
};
