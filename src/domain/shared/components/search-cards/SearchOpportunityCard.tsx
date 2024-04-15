import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

type SearchOpportunityCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName'>;

interface SearchOpportunityCardProps extends SearchOpportunityCardImplProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ children, ...rest }) => {
  return <SearchBaseJourneyCard journeyTypeName="subsubspace" {...rest} />;
};
