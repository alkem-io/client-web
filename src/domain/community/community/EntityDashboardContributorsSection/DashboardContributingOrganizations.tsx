import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '@/core/utils/WithId';
import {
  ContributorCardSquare,
  ContributorCardSquareProps,
} from '../../contributor/ContributorCardSquare/ContributorCardSquare';

interface DashboardContributingOrganizationsProps {
  organizations: WithId<ContributorCardSquareProps>[] | undefined;
}

const DashboardContributingOrganizations = ({ organizations }: DashboardContributingOrganizationsProps) => {
  return (
    <Grid container spacing={2}>
      {organizations?.map(org => (
        <Grid key={org.id} item xs={3}>
          <ContributorCardSquare key={org.id} {...org} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardContributingOrganizations;
