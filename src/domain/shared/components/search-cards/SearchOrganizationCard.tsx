import React, { FC } from 'react';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import SearchBaseContributorCard from './base/SearchBaseContributorCard';
import { SearchContributorCardProps } from './SearchContributorCardProps';

export interface SearchOrganizationCardProps extends SearchContributorCardProps {}

export const SearchOrganizationCard: FC<SearchOrganizationCardProps> = props => {
  return <SearchBaseContributorCard icon={WorkspacesOutlinedIcon} {...props} />;
};
