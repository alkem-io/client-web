import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

type SearchChallengeCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName'>;

interface SearchChallengeCardProps extends SearchChallengeCardImplProps {}

export const SearchChallengeCard: FC<SearchChallengeCardProps> = ({ children, ...rest }) => {
  return <SearchBaseJourneyCard journeyTypeName="subspace" {...rest} />;
};
