import React, { FC } from 'react';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

export type SearchChallengeCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName'>;
export interface SearchChallengeCardProps extends SearchChallengeCardImplProps {}

export const SearchChallengeCard: FC<SearchChallengeCardProps> = ({ children, ...rest }) => {
  return <SearchBaseJourneyCard journeyTypeName="challenge" {...rest} />;
};
