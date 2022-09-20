import React, { FC } from 'react';
import ChallengeSettingsLayout from './ChallengeSettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import { useChallenge, useHub } from '../../../hooks';
import { SectionSpacer } from '../../shared/components/Section/Section';
import ApplicationsAdminView from '../community/views/ApplicationsAdminView';
import useChallengeApplications from './providers/useChallengeApplications';
import { Loading } from '../../../common/components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import ChallengeCommunityAdminMembershipPreferencesSection from './ChallengeCommunityAdminMembershipPreferencesSection';
import useChallengeLeadOrganizationAssignment from '../../community/community/useCommunityAssignment/useChallengeLeadOrganizationAssignment';
import useChallengeMemberOrganizationAssignment from '../../community/community/useCommunityAssignment/useChallengeMemberOrganizationAssignment';
import {
  refetchChallengeAvailableLeadUsersQuery,
  refetchChallengeAvailableMemberUsersQuery,
  refetchChallengeCommunityMembersQuery,
  useChallengeAvailableLeadUsersLazyQuery,
  useChallengeAvailableMemberUsersLazyQuery,
  useChallengeCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditMemberUsersWithPopup from '../components/Community/EditMemberUsersWithPopup';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';

const ChallengeCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { hubId } = useHub();
  const { challenge, challengeId } = useChallenge();
  const communityId = challenge?.community?.id;

  const { applications, loading: isLoadingApplications } = useChallengeApplications();

  const leadingOrganizationsProps = useChallengeLeadOrganizationAssignment({
    hubId,
    challengeId,
  });

  const memberOrganizationsProps = useChallengeMemberOrganizationAssignment({
    hubId,
    challengeId,
  });

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: {
      hubId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.hub.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableMemberUsersLazyQuery,
      readUsers: data => data.hub.challenge.community?.availableMemberUsers,
      refetchQuery: refetchChallengeAvailableMemberUsersQuery,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      hubId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.hub.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableLeadUsersLazyQuery,
      readUsers: data => data.hub.challenge.community?.availableLeadUsers,
      refetchQuery: refetchChallengeAvailableLeadUsersQuery,
    },
  });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <EditCommunityMembersSection memberType="leads">
        <EditMemberUsersWithPopup {...leadUsersProps} />
        <EditOrganizationsWithPopup {...leadingOrganizationsProps} />
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
      <ChallengeCommunityAdminMembershipPreferencesSection hubId={hubId} challengeId={challengeId} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeCommunityAdminPage;
