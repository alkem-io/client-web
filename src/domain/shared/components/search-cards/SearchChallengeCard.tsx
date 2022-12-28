import React, { FC } from 'react';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SearchBaseJourneyCard, { SearchBaseJourneyCardProps } from './base/SearchBaseJourneyCard';

export type SearchChallengeCardImplProps = Omit<SearchBaseJourneyCardProps, 'journeyTypeName' | 'parentIcon'>;
export interface SearchChallengeCardProps extends SearchChallengeCardImplProps {}

export const SearchChallengeCard: FC<SearchChallengeCardProps> = ({ children, ...rest }) => {
  return <SearchBaseJourneyCard journeyTypeName="challenge" parentIcon={HubOutlinedIcon} {...rest} />;
};
