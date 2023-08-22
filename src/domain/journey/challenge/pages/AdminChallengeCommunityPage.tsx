import { FC } from 'react';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import CommunityApplications from '../../../community/community/CommunityAdmin/CommunityApplications';
import CommunityOrganizations from '../../../community/community/CommunityAdmin/CommunityOrganizations';
import CommunityUsers from '../../../community/community/CommunityAdmin/CommunityUsers';
import useCommunityAdmin from '../../../community/community/CommunityAdmin/useCommunityAdmin';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { useChallenge } from '../hooks/useChallenge';
import ChallengeSettingsLayout from '../../../platform/admin/challenge/ChallengeSettingsLayout';
import ChallengeCommunityAdminMembershipPreferencesSection from '../../../platform/admin/challenge/ChallengeCommunityAdminMembershipPreferencesSection';
import CommunityApplicationForm from '../../../community/community/CommunityApplicationForm/CommunityApplicationForm';

const AdminChallengeCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading: loadingChallenge, communityId, challengeId } = useChallenge();

  const {
    users,
    organizations,
    applications,
    communityPolicy,
    permissions,
    onApplicationStateChange,
    onUserLeadChange,
    onUserAuthorizationChange,
    onOrganizationLeadChange,
    onAddUser,
    onAddOrganization,
    onRemoveUser,
    onRemoveOrganization,
    getAvailableUsers,
    getAvailableOrganizations,
    loading,
  } = useCommunityAdmin(communityId, false); //!!

  if (!spaceId || loadingChallenge) {
    return null;
  }

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <PageContent background="transparent">
        <PageContentColumn columns={12}>
          <PageContentBlock columns={12}>
            <CommunityApplications
              applications={applications}
              onApplicationStateChange={onApplicationStateChange}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityUsers
              users={users}
              onUserLeadChange={onUserLeadChange}
              onUserAuthorizationChange={onUserAuthorizationChange}
              canAddMembers={permissions.canAddMembers}
              onAddMember={onAddUser}
              onRemoveMember={onRemoveUser}
              fetchAvailableUsers={getAvailableUsers}
              communityPolicy={communityPolicy}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlock>
            <CommunityOrganizations
              organizations={organizations}
              onOrganizationLeadChange={onOrganizationLeadChange}
              canAddMembers={permissions.canAddMembers}
              onAddMember={onAddOrganization}
              onRemoveMember={onRemoveOrganization}
              fetchAvailableOrganizations={getAvailableOrganizations}
              communityPolicy={communityPolicy}
              loading={loading}
            />
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
      <ChallengeCommunityAdminMembershipPreferencesSection spaceId={spaceId} challengeId={challengeId} />
      <CommunityApplicationForm spaceId={spaceId} challengeId={challengeId} />
    </ChallengeSettingsLayout>
  );
};

export default AdminChallengeCommunityPage;
/*
// OLD
  Delete? //!! ??
useChallengeMemberOrganizationAssignment
useCommunityUserAssignment

const ChallengeCommunityAdminPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId } = useSpace();
  const { challenge, challengeId } = useChallenge();
  const { t } = useTranslation();

  const communityId = challenge?.community?.id;

  const memberOrganizationsProps = useChallengeMemberOrganizationAssignment({
    spaceId,
    challengeId,
  });

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: {
      spaceId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.space.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useChallengeAvailableMemberUsersLazyQuery,
      readUsers: data => data.space.challenge.community?.availableMemberUsers,
      refetchQuery: refetchChallengeAvailableMemberUsersQuery,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      spaceId,
      challengeId,
    },
    existingUsersOptions: {
      useQuery: useChallengeCommunityMembersQuery,
      readCommunity: data => data?.space.challenge.community,
      refetchQuery: refetchChallengeCommunityMembersQuery,
    },
  });


  );
};

export default ChallengeCommunityAdminPage;
*/
