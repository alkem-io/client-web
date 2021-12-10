import { Box, Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
    usersCount: number;
    user?: UserMetadata;
    organizations: ContributorCardProps[];
    organizationsCount: number;
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
  const { users, usersCount, organizations, organizationsCount } = entities;
  const { t } = useTranslation();
  return (
    <Section {...props}>
      <SectionHeader text={userTitle} />
      <Grid container spacing={1} alignItems="center">
        {loading.users &&
          Array.apply(null, { length: 12 } as any).map((_, i) => (
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
      <Box display="flex" justifyContent="end" paddingTop={2}>
        <Typography>{t('dashboard-contributors-section.more', { count: usersCount })}</Typography>
      </Box>
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
      <Box display="flex" justifyContent="end" paddingTop={2}>
        <Typography>{t('dashboard-contributors-section.more', { count: organizationsCount })}</Typography>
      </Box>
    </Section>
  );
};

export default DashboardContributorsSection;
