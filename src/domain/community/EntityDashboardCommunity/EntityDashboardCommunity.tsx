import { EntityDashboardContributors, EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import EntityDashboardLeadsSection from '../EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import EntityDashboardContributorsSection from '../EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../shared/components/Section/Section';

export interface EntityDashboardCommunityProps
  extends Partial<EntityDashboardLeads>,
    Partial<EntityDashboardContributors> {
  communityReadAccess: boolean | undefined;
}

const EntityDashboardCommunity = ({
  communityReadAccess = false,
  leadUsers,
  leadOrganizations,
  memberUsers,
  memberUsersCount,
  memberOrganizations,
  memberOrganizationsCount,
}: EntityDashboardCommunityProps) => {
  const { t } = useTranslation();

  if (!communityReadAccess) {
    return null;
  }

  return (
    <>
      <EntityDashboardLeadsSection
        usersHeader={t('community.leads')}
        organizationsHeader={t('community.leading-organizations')}
        leadUsers={leadUsers}
        leadOrganizations={leadOrganizations}
      />
      <SectionSpacer />
      <EntityDashboardContributorsSection
        memberUsers={memberUsers}
        memberUsersCount={memberUsersCount}
        memberOrganizations={memberOrganizations}
        memberOrganizationsCount={memberOrganizationsCount}
      />
    </>
  );
};

export default EntityDashboardCommunity;
