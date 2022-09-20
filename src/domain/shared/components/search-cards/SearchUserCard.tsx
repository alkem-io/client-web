import React, { FC } from 'react';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchContributorCard, { SearchContributorCardProps } from './SearchContributorCard';

export interface SearchUserCardProps /* extends SearchContributorCardProps */ {}

export const SearchUserCard: FC<SearchUserCardProps> = ({}) => {
  return (
    <SearchContributorCard
      label={'Associate'}
      icon={PersonOutlinedIcon}
      name={'Long Long Long Long Long Long Long Long Display name'}
      image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
      country="BG"
      city="Sofia"
      matchedTerms={['term1', 'long-term-2']}
      url={''}
    />
  );
};
