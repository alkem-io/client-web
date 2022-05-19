import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../../../components/core/Section/SectionHeader';
import React from 'react';
import { Grid } from '@mui/material';
import { WithId } from '../../../types/WithId';
import {
  ContributorCard,
  ContributorCardProps,
} from '../../../components/composite/common/cards/ContributorCard/ContributorCard';
import { SectionSpacer } from '../../../components/core/Section/Section';

export interface EntityDashboardContributorsSectionProps {
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
}

const EntityDashboardContributorsSection = ({
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
}: EntityDashboardContributorsSectionProps) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={t('contributors-section.title')}
      navText={t('buttons.see-more')}
      navLink="community"
    >
      <SectionHeader text={memberUsersCount ? `${t('common.users')} (${memberUsersCount})` : t('common.users')} />
      <SectionSpacer />
      <Grid container spacing={2}>
        {memberUsers?.map(user => (
          <Grid key={user.id} item xs={3}>
            <ContributorCard {...user} />
          </Grid>
        ))}
      </Grid>
      <SectionSpacer double />
      <SectionHeader
        text={
          memberOrganizationsCount
            ? `${t('common.organizations')} (${memberOrganizationsCount})`
            : t('common.organizations')
        }
      />
      <SectionSpacer />
      <Grid container spacing={2}>
        {memberOrganizations?.map(org => (
          <Grid key={org.id} item xs={3}>
            <ContributorCard key={org.id} {...org} />
          </Grid>
        ))}
      </Grid>
    </DashboardGenericSection>
  );
};

export default EntityDashboardContributorsSection;
