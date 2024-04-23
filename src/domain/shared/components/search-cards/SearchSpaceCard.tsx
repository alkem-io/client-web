import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

type SearchSpaceCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName' | 'parentIcon'>;

interface SearchSpaceCardProps extends SearchSpaceCardImplProps {}

export const SearchSpaceCard: FC<SearchSpaceCardProps> = props => {
  return <SearchBaseJourneyCard journeyTypeName="space" {...props} />;
};
