import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { UserMetadata } from '../../../../hooks';
import { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../cards/ContributorCard/ContributorCard';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';

export interface DashboardContributorsSectionSectionProps extends DashboardGenericSectionProps {
  userTitle: string;
  organizationTitle: string;
  entities: {
    users: ContributorCardProps[];
    user?: UserMetadata;
    organizations: ContributorCardProps[];
  };
  loading: {
    users?: boolean;
    organizations?: boolean;
  };
}

const DashboardContributorsSection: FC<DashboardContributorsSectionSectionProps> = ({
  entities,
  loading,
  children,
  userTitle,
  organizationTitle,
  ...props
}) => {
  const { users, organizations } = entities;

  return (
    <Section {...props}>
      <SectionHeader text={userTitle} />
      <Grid container spacing={1} alignItems="center">
        {loading.users &&
          Array.apply(null, { length: 6 } as any).map((_, i) => (
            <Grid item flexBasis={'16.6%'} key={i}>
              <ContributorCardSkeleton />
            </Grid>
          ))}
        {users.map((user, i) => {
          return (
            <Grid item flexBasis={'16.6%'} key={i}>
              <ContributorCard {...user} />
            </Grid>
          );
        })}
      </Grid>
      <SectionSpacer />
      <SectionHeader text={organizationTitle} />
      <Grid container spacing={1} alignItems="center">
        {loading.organizations &&
          Array.apply(null, { length: 6 } as any).map((_, i) => (
            <Grid item flexBasis={'16.6%'} key={i}>
              <ContributorCardSkeleton />
            </Grid>
          ))}
        {organizations.map((organization, i) => {
          return (
            <Grid item flexBasis={'16.6%'} key={i}>
              <ContributorCard {...organization} />
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );
};

export default DashboardContributorsSection;
