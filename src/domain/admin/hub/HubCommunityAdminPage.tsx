import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { SectionSpacer } from '../../../components/core/Section/Section';
import CommunityAdminView from '../community/views/CommunityAdminView';
import { Loading } from '../../../components/core';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import { useHub } from '../../../hooks';
import useHubApplications from './providers/useHubApplications';
import { HubCommunityAdminMembershipPreferencesSection } from './HubCommunityAdminMembershipPreferencesSection';
import AdminCommunityOrganizationsView from '../challenge/views/AdminCommunityOrganizationsView';
import { refetchHubCommunityMembersQuery, useHubCommunityMembersQuery } from '../../../hooks/generated/graphql';
import useMemberOrganizationAssignment from '../../community/useCommunityAssignment/useMemberOrganizationAssignment';
import useMemberUserAssignment from '../../community/useCommunityAssignment/useMemberUserAssignment';
import useLeadUserAssignment from '../../community/useCommunityAssignment/useLeadUserAssignment';

const HubCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { t } = useTranslation();

  const { hubId, communityId } = useHub();

  const { applications, loading: isLoadingApplications } = useHubApplications();

  const memberOrganizationsProps = useMemberOrganizationAssignment({
    variables: { hubId },
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useHubCommunityMembersQuery({ variables, skip });

      return {
        communityId,
        existingMembers: data?.hub.community?.memberOrganizations,
      };
    },
    refetchMembersQuery: refetchHubCommunityMembersQuery,
  });

  const leadUsersProps = useLeadUserAssignment({
    variables: {
      hubId,
    },
    useExistingMembersQuery: options => {
      const { data } = useHubCommunityMembersQuery(options);

      return {
        communityId: data?.hub.community?.id,
        existingMembers: data?.hub.community?.leadUsers,
      };
    },
    refetchMembersQuery: refetchHubCommunityMembersQuery,
  });

  const editMembersProps = useMemberUserAssignment({
    variables: { hubId },
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useHubCommunityMembersQuery({ variables, skip });

      return {
        communityId,
        existingMembers: data?.hub.community?.memberUsers,
      };
    },
    refetchMembersQuery: refetchHubCommunityMembersQuery,
  });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <CommunityAdminView headerText={t('community.leading-users')} {...leadUsersProps} />
      <SectionSpacer />
      <CommunityAdminView headerText={t('common.users')} {...editMembersProps} />
      <SectionSpacer />
      <AdminCommunityOrganizationsView headerText={t('community.member-organizations')} {...memberOrganizationsProps} />
      <SectionSpacer />
      {isLoadingApplications ? <Loading /> : <ApplicationsAdminView applications={applications} />}
      <SectionSpacer />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
      <SectionSpacer />
      <HubCommunityAdminMembershipPreferencesSection />
    </HubSettingsLayout>
  );
};

export default HubCommunityAdminPage;
