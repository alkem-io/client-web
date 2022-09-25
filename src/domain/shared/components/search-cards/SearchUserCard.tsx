import React, { FC } from 'react';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchBaseContributorCard from './base/SearchBaseContributorCard';
import { SearchContributorCardProps } from './SearchContributorCardProps';

export interface SearchUserCardProps extends SearchContributorCardProps {}

export const SearchUserCard: FC<SearchUserCardProps> = ({ image, imgAlt, name, city, country, matchedTerms, url }) => {
  return (
    <SearchBaseContributorCard
      icon={PersonOutlinedIcon}
      name={name}
      image={image}
      imgAlt={imgAlt}
      country={country}
      city={city}
      matchedTerms={matchedTerms}
      url={url}
    />
  );
};
