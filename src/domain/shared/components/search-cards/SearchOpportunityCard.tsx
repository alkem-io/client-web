import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

export type SearchOpportunityCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName'>;
export interface SearchOpportunityCardProps extends SearchOpportunityCardImplProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ children, ...rest }) => {
  return <SearchBaseJourneyCard journeyTypeName="opportunity" {...rest} />;
};
