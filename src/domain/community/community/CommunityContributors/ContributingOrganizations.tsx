import Grid from '@mui/material/Grid';
import LoadingOrganizationCard from '../../../shared/components/LoadingOrganizationCard';
import OrganizationCardHorizontal, {
  OrganizationCardProps,
} from '../../contributor/organization/OrganizationCardHorizontal/OrganizationCardHorizontal';
import React, { FC, ReactElement } from 'react';
import { Identifiable } from '../../../shared/types/Identifiable';

export interface ContributingOrganizationsProps {
  loading?: boolean;
  organizations: (OrganizationCardProps & Identifiable)[] | undefined;
  noOrganizationsView?: ReactElement;
}

const ContributingOrganizations: FC<ContributingOrganizationsProps> = ({
  organizations,
  loading = false,
  noOrganizationsView,
}) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        <LoadingOrganizationCard />
        <LoadingOrganizationCard />
        <LoadingOrganizationCard />
      </Grid>
    );
  }

  if (organizations?.length === 0) {
    return noOrganizationsView ?? null;
  }

  return (
    <Grid container spacing={3} columns={1}>
      {organizations?.map(org => (
        <Grid key={org.id} item xs={1}>
          <OrganizationCardHorizontal {...org} transparent />
        </Grid>
      ))}
    </Grid>
  );
};

export default ContributingOrganizations;
