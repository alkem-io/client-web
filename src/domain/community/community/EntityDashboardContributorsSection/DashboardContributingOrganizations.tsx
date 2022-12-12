import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '../../../../types/WithId';
import {
  ContributorCard,
  ContributorCardProps,
} from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';

interface DashboardContributingOrganizationsProps {
  organizations: WithId<ContributorCardProps>[] | undefined;
}

const DashboardContributingOrganizations = ({ organizations }: DashboardContributingOrganizationsProps) => {
  return (
    <Grid container spacing={2}>
      {organizations?.map(org => (
        <Grid key={org.id} item xs={3}>
          <ContributorCard key={org.id} {...org} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardContributingOrganizations;
