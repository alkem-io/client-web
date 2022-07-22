import React, { FC } from 'react';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { Loading } from '../../../components/core';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import { useHub } from '../../../hooks';
import useHubApplications from './providers/useHubApplications';
import { HubCommunityAdminMembershipPreferencesSection } from './HubCommunityAdminMembershipPreferencesSection';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import {
  refetchHubAvailableLeadUsersQuery,
  refetchHubAvailableMemberUsersQuery,
  refetchHubCommunityMembersQuery,
  useHubAvailableLeadUsersLazyQuery,
  useHubAvailableMemberUsersLazyQuery,
  useHubCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useMemberOrganizationAssignment from '../../community/useCommunityAssignment/useMemberOrganizationAssignment';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';
import EditMemberUsersWithPopup from '../../../components/Admin/Community/EditMemberUsersWithPopup';

const HubCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

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
    refetchQueries: [refetchHubCommunityMembersQuery],
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      hubId,
    },
    existingUsersOptions: {
      useQuery: useHubCommunityMembersQuery,
      readCommunity: data => data.hub.community,
      refetchQuery: refetchHubCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useHubAvailableLeadUsersLazyQuery,
      readUsers: data => data.hub.community?.availableLeadUsers,
      refetchQuery: refetchHubAvailableLeadUsersQuery,
    },
  });

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: { hubId },
    existingUsersOptions: {
      useQuery: useHubCommunityMembersQuery,
      readCommunity: data => data.hub.community,
      refetchQuery: refetchHubCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useHubAvailableMemberUsersLazyQuery,
      readUsers: data => data.hub.community?.availableMemberUsers,
      refetchQuery: refetchHubAvailableMemberUsersQuery,
    },
  });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <EditCommunityMembersSection memberType="leads">
        <EditMemberUsersWithPopup {...leadUsersProps} />
      </EditCommunityMembersSection>
      <SectionSpacer />
      <EditCommunityMembersSection memberType="members">
        <EditMemberUsersWithPopup {...memberUsersProps} />
        <EditOrganizationsWithPopup {...memberOrganizationsProps} />
      </EditCommunityMembersSection>
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
