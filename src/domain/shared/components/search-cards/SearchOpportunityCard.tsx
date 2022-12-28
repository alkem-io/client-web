import React, { FC } from 'react';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

export type SearchOpportunityCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName' | 'parentIcon'>;
export interface SearchOpportunityCardProps extends SearchOpportunityCardImplProps {}

export const SearchOpportunityCard: FC<SearchOpportunityCardProps> = ({ children, ...rest }) => {
  return <SearchBaseJourneyCard journeyTypeName="opportunity" parentIcon={ChallengeIcon} {...rest} />;
};
