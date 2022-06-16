import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../../components/composite/common/sections/DashboardGenericSection';
import { SectionSpacer } from '../../../components/core/Section/Section';
import { EntityDashboardContributors } from './Types';
import DashboardContributingUsers from './DashboardContributingUsers';
import DashboardContributingOrganizations from './DashboardContributingOrganizations';

const EntityDashboardContributorsSection = (props: EntityDashboardContributors) => {
  const { t } = useTranslation();

  const {
    leadUsers,
    leadUsersCount,
    leadOrganizations,
    leadOrganizationsCount,
    memberUsers,
    memberUsersCount,
    memberOrganizations,
    memberOrganizationsCount,
  } = props;

  return (
    <DashboardGenericSection
      headerText={t('contributors-section.title')}
      navText={t('buttons.see-more')}
      navLink="community"
    >
      <DashboardContributingUsers headerText={t('community.leads')} users={leadUsers} usersCount={leadUsersCount} />
      <SectionSpacer double />
      {'leadOrganizations' in props && (
        <>
          <DashboardContributingOrganizations
            headerText={t('community.leading-organizations')}
            organizations={leadOrganizations}
            organizationsCount={leadOrganizationsCount}
          />
          <SectionSpacer double />
        </>
      )}
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
