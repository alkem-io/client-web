import React, { FC } from 'react';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import SearchJourneyWithParentCard, { SearchJourneyWithParentImplProps } from './SearchJourneyWithParentCard';

export interface SearchChallengeCardProps extends SearchJourneyWithParentImplProps {}

export const SearchChallengeCard: FC<SearchChallengeCardProps> = ({ children, ...rest }) => {
  return (
    <SearchJourneyWithParentCard icon={ChallengeIcon} parentIcon={HubOutlinedIcon} {...rest}>
      {children}
    </SearchJourneyWithParentCard>
  );
};
