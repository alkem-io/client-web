import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '../../../types/WithId';
import {
  ContributorCard,
  ContributorCardProps,
} from '../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import SectionHeader from '../../shared/components/Section/SectionHeader';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import { SectionSpacer } from '../../shared/components/Section/Section';

interface DashboardContributingOrganizationsProps {
  headerText: string;
  organizations: WithId<ContributorCardProps>[] | undefined;
  organizationsCount: number | undefined;
}

const DashboardContributingOrganizations = ({
  organizations,
  organizationsCount,
  headerText,
}: DashboardContributingOrganizationsProps) => {
  return (
    <>
      <SectionHeader text={withOptionalCount(headerText, organizationsCount)} />
      <SectionSpacer />
      <Grid container spacing={2}>
        {organizations?.map(org => (
          <Grid key={org.id} item xs={3}>
            <ContributorCard key={org.id} {...org} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default DashboardContributingOrganizations;
