import { Box, Grid, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMetadata } from '../../../../hooks';
import { SectionSpacer } from '../Section/Section';
import SectionHeader from '../Section/SectionHeader';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../../../../components/composite/common/cards/ContributorCard/ContributorCard';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';
import { WithId } from '../../../../types/WithId';
import { times } from 'lodash';

const MAX_USERS_TO_SHOW = 12;
const MAX_ORGANIZATIONS_TO_SHOW = 12;

export interface DashboardContributorsSectionSectionProps extends DashboardGenericSectionProps {
  userTitle: ReactNode;
  organizationTitle: ReactNode;
  entities: {
    usersCount: number;
    users: WithId<ContributorCardProps>[];
    user?: UserMetadata;
    organizationsCount: number;
    organizations: WithId<ContributorCardProps>[];
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
  const { users, organizations, user, usersCount, organizationsCount } = entities;
  const { t } = useTranslation();

  const usersRemainingCount = usersCount - users.length;
  const organizationsRemainingCount = organizationsCount - organizations.length;

  return (
    <Section {...props}>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <SectionHeader text={userTitle} />
          <SectionSpacer half />
          <Grid container spacing={1} alignItems="center">
            {loading.users &&
              times(MAX_USERS_TO_SHOW, i => (
                <Grid item flexBasis={'16.6%'} key={`__loading_${i}`}>
                  <ContributorCardSkeleton />
                </Grid>
              ))}
            {users.map(user => {
              return (
                <Grid item flexBasis={'16.6%'} key={user.id}>
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
            {usersRemainingCount > 0 && (
              <Typography>{t('dashboard-contributors-section.more', { count: usersRemainingCount })}</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} lg={6}>
          <SectionHeader text={organizationTitle} />
          <SectionSpacer half />
          <Grid container spacing={1} alignItems="center">
            {loading.organizations &&
              times(MAX_ORGANIZATIONS_TO_SHOW, i => (
                <Grid item flexBasis={'16.6%'} key={`__loading_${i}`}>
                  <ContributorCardSkeleton />
                </Grid>
              ))}
            {organizations.map(organization => {
              return (
                <Grid item flexBasis={'16.6%'} key={organization.id}>
                  <ContributorCard {...organization} />
                </Grid>
              );
            })}
          </Grid>
          <Box display="flex" justifyContent="end" paddingTop={2}>
            {organizationsRemainingCount > 0 && (
              <Typography>
                {t('dashboard-contributors-section.more', { count: organizationsRemainingCount })}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Section>
  );
};

export default DashboardContributorsSection;
