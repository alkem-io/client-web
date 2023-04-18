import React from 'react';
import { Box } from '@mui/material';
import ContributorCardSquare, { ContributorCardProps } from '../ContributorCardSquare/ContributorCardSquare';
import GridItem from '../../../../core/ui/grid/GridItem';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';

export enum ContributorType {
  People,
  Organizations,
}

interface CommunityContributorsBlockWideContentProps {
  users: ContributorCardProps[] | undefined;
  organizations: ContributorCardProps[] | undefined;
  nested?: boolean;
  contributorType: ContributorType;
}

const CommunityContributorsBlockWideContent = ({
  nested = false,
  users,
  organizations,
  contributorType,
}: CommunityContributorsBlockWideContentProps) => {
  return (
    // TODO disablePadding={nested} after pull
    <Gutters row padding={nested ? 0 : gutters()}>
      {contributorType === ContributorType.People &&
        users?.map(user => (
          <GridItem key={user.id} columns={1}>
            <Box>
              <ContributorCardSquare {...user} />
            </Box>
          </GridItem>
        ))}
      {contributorType === ContributorType.Organizations &&
        organizations?.map(organization => (
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
