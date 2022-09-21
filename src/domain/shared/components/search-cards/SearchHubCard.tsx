import React, { FC } from 'react';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { SearchBaseJourneyCard } from './base/SearchBaseJourneyCard';
import { SearchJourneyCardProps } from './SearchJourneyCardProps';

export interface SearchHubCardProps extends SearchJourneyCardProps {}

export const SearchHubCard: FC<SearchHubCardProps> = (props) => {
  return (
    <SearchBaseJourneyCard
      icon={HubOutlinedIcon}
      { ...props }
    />
  );
};
