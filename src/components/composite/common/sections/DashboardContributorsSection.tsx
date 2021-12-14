import { Box, Grid, Typography } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMetadata } from '../../../../hooks';
import { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../cards/ContributorCard/ContributorCard';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';

const MAX_USERS_TO_SHOWN = 6;
const MAX_ORGANIZATIONS_TO_SHOWN = 6;

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
  const { users, organizations, user } = entities;
  const { t } = useTranslation();

  const usersCount = users.length - MAX_USERS_TO_SHOWN;
  const organizationsCount = organizations.length - MAX_ORGANIZATIONS_TO_SHOWN;

  const reducedUsers = useMemo(() => users.slice(0, MAX_USERS_TO_SHOWN), [users]);
  const reducedOrganizations = useMemo(() => organizations.slice(0, MAX_ORGANIZATIONS_TO_SHOWN), [organizations]);
  return (
    <Section {...props}>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <SectionHeader text={userTitle} />
          <SectionSpacer />
          <Grid container spacing={1} alignItems="center">
            {loading.users &&
              Array.apply(null, { length: MAX_USERS_TO_SHOWN } as any).map((_, i) => (
                <Grid item flexBasis={'16.6%'} key={i}>
                  <ContributorCardSkeleton />
                </Grid>
              ))}
            {reducedUsers.map((user, i) => {
              return (
                <Grid item flexBasis={'16.6%'} key={i}>
                  <ContributorCard {...user} />
                </Grid>
              );
            })}
            {!user && (
              <Grid item>
                <Typography variant="body1">
                  {t('components.backdrop.authentication', { blockName: 'Users that are contributing' })}
                </Typography>
              </Grid>
            )}
          </Grid>
          <Box display="flex" justifyContent="end" paddingTop={2}>
            {usersCount > 0 && (
              <Typography>{t('dashboard-contributors-section.more', { count: usersCount })}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} lg={6}>
          <SectionHeader text={organizationTitle} />
          <SectionSpacer />
          <Grid container spacing={1} alignItems="center">
            {loading.organizations &&
              Array.apply(null, { length: MAX_ORGANIZATIONS_TO_SHOWN } as any).map((_, i) => (
                <Grid item flexBasis={'16.6%'} key={i}>
                  <ContributorCardSkeleton />
                </Grid>
              ))}
            {reducedOrganizations.map((organization, i) => {
              return (
                <Grid item flexBasis={'16.6%'} key={i}>
                  <ContributorCard {...organization} />
                </Grid>
              );
            })}
          </Grid>
          <Box display="flex" justifyContent="end" paddingTop={2}>
            {organizationsCount > 0 && (
              <Typography>{t('dashboard-contributors-section.more', { count: organizationsCount })}</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Section>
  );
};

export default DashboardContributorsSection;
