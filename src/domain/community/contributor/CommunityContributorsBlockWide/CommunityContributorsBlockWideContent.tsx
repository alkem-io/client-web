import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import ContributorCardSquare, { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import GridItem from '../../../../core/ui/grid/GridItem';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Theme } from '@mui/material/styles';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { useColumns } from '../../../../core/ui/grid/GridContext';

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
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  const columns = useColumns();

  return (
    <GridProvider columns={isSmallScreen ? columns / 2 : columns}>
      <Gutters row flexWrap="wrap" disablePadding={nested} sx={{ overflowY: 'auto' }}>
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
    </GridProvider>
  );
};

export default CommunityContributorsBlockWideContent;
