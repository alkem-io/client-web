import React from 'react';
import { Box } from '@mui/material';
import ContributorCardSquare, { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import GridItem from '../../../../core/ui/grid/GridItem';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';

export enum ContributorType {
  People,
  Organizations,
}

interface CommunityContributorsBlockWideContentProps {
  users: ContributorCardSquareProps[] | undefined;
  organizations: ContributorCardSquareProps[] | undefined;
  nested?: boolean;
  contributorType: ContributorType;
  filter: string[];
}
const filterFn = (filter: string[]) => (element: ContributorCardSquareProps) => {
  return filter.length === 0 || filter.some(term => element.displayName.toLowerCase().includes(term.toLowerCase()));
};

const CommunityContributorsBlockWideContent = ({
  nested = false,
  users,
  organizations,
  contributorType,
  filter,
}: CommunityContributorsBlockWideContentProps) => {
  return (
    // TODO disablePadding={nested} after pull
    <Gutters row padding={nested ? 0 : gutters()}>
      {contributorType === ContributorType.People &&
        users?.filter(filterFn(filter)).map(user => (
          <GridItem key={user.id} columns={1}>
            <Box>
              <ContributorCardSquare {...user} />
            </Box>
          </GridItem>
        ))}
      {contributorType === ContributorType.Organizations &&
        organizations?.filter(filterFn(filter)).map(organization => (
          <GridItem key={organization.id} columns={1}>
            <Box>
              <ContributorCardSquare {...organization} />
            </Box>
          </GridItem>
        ))}
    </Gutters>
  );
};

export default CommunityContributorsBlockWideContent;
