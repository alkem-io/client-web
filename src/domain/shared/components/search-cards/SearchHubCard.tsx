import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

export type SearchHubCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName' | 'parentIcon'>;
export interface SearchHubCardProps extends SearchHubCardImplProps {}

export const SearchHubCard: FC<SearchHubCardProps> = props => {
  return <SearchBaseJourneyCard journeyTypeName="hub" {...props} />;
};
