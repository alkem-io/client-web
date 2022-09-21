import React, { FC } from 'react';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import SearchBaseContributorCard from './base/SearchBaseContributorCard';
import { SearchContributorCardProps } from './SearchContributorCardProps';

export interface SearchOrganizationCardProps extends SearchContributorCardProps {}

export const SearchOrganizationCard: FC<SearchOrganizationCardProps> = ({
  image, imgAlt, name,
  city, country,
  matchedTerms, url,
}) => {
  return (
    <SearchBaseContributorCard
      icon={WorkspacesOutlinedIcon}
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
