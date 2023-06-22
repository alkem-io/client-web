import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

export type SearchSpaceCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName' | 'parentIcon'>;
export interface SearchSpaceCardProps extends SearchSpaceCardImplProps {}

export const SearchSpaceCard: FC<SearchSpaceCardProps> = props => {
  return <SearchBaseJourneyCard journeyTypeName="space" {...props} />;
};
