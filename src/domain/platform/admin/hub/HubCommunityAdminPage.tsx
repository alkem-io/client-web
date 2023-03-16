import React, { FC } from 'react';
import HubSettingsLayout from './HubSettingsLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import { Loading } from '../../../../common/components/core';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import CommunityGroupListPage from '../community/CommunityListPage';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
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
} from '../../../../core/apollo/generated/apollo-hooks';
import useMemberOrganizationAssignment from '../../../community/community/useCommunityAssignment/useMemberOrganizationAssignment';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';
import EditMemberUsersWithPopup from '../components/Community/EditMemberUsersWithPopup';
import Gutters from '../../../../core/ui/grid/Gutters';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import CommunityApplicationForm from '../../../community/community/CommunityApplicationForm/CommunityApplicationForm';
import { Trans, useTranslation } from 'react-i18next';
import { Text } from '../../../../core/ui/typography';

const HubCommunityAdminPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
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
      <Gutters>
        <EditCommunityMembersSection memberType="leads">
          <EditMemberUsersWithPopup {...leadUsersProps} />
        </EditCommunityMembersSection>
        <EditCommunityMembersSection memberType="members">
          <EditMemberUsersWithPopup {...memberUsersProps} />
          <EditOrganizationsWithPopup {...memberOrganizationsProps} />
        </EditCommunityMembersSection>
        {isLoadingApplications ? <Loading /> : <ApplicationsAdminView applications={applications} />}
        {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
        <HubCommunityAdminMembershipPreferencesSection />
        <DashboardGenericSection
          headerText={t('community.application-form.title')}
          subHeaderText={
            <Text>
              <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
            </Text>
          }
        >
          <CommunityApplicationForm hubId={hubId} />
        </DashboardGenericSection>
      </Gutters>
    </HubSettingsLayout>
  );
};

export default HubCommunityAdminPage;
