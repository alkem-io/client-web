import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { EntityDashboardContributors } from './Types';
import DashboardContributingUsers from './DashboardContributingUsers';
import DashboardContributingOrganizations from './DashboardContributingOrganizations';

const EntityDashboardContributorsSection = ({
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
}: EntityDashboardContributors) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={t('contributors-section.title')}
      navText={t('buttons.see-more')}
      navLink="community"
    >
      <DashboardContributingUsers headerText={t('common.users')} users={memberUsers} usersCount={memberUsersCount} />
      <SectionSpacer double />
      <DashboardContributingOrganizations
        headerText={t('common.organizations')}
        organizations={memberOrganizations}
        organizationsCount={memberOrganizationsCount}
      />
    </DashboardGenericSection>
  );
};

export default EntityDashboardContributorsSection;
