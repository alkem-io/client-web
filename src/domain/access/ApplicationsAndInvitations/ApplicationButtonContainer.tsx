import {
  useApplicationButtonQuery,
  useCurrentUserFullLazyQuery,
  useJoinRoleSetMutation,
  useSpacePageLazyQuery,
  useSubspacePageLazyQuery,
  useUserPendingMembershipsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import clearCacheForType from '@/core/apollo/utils/clearCacheForType';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useCurrentUserContext } from '@/domain/community/user';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationButtonProps } from '../../community/applicationButton/ApplicationButton';

export interface ApplicationButtonContainerProps {
  parentSpaceId?: string;
  spaceId?: string;
  loading?: boolean;
  onJoin?: (params: { communityId: string }) => void;
  children: (props: Omit<ApplicationButtonProps, 'spaceId' | 'spaceLevel'>, loading: boolean) => ReactNode;
}

export const ApplicationButtonContainer = ({
  parentSpaceId,
  spaceId,
  loading: loadingParams = false,
  onJoin,
  children,
}: ApplicationButtonContainerProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { isAuthenticated } = useAuthenticationContext();
  const { userModel, loadingMe: membershipLoading } = useCurrentUserContext();
  const { data: pendingMembershipsData } = useUserPendingMembershipsQuery({
    skip: !isAuthenticated || !userModel,
  });
  const { communityApplications: pendingApplications, communityInvitations: pendingInvitations } =
    pendingMembershipsData?.me ?? {};

  const userId = userModel?.id;

  const [getCurrentUserProfile, { loading: gettingUserProfile }] = useCurrentUserFullLazyQuery();

  const {
    data: _communityPrivileges,
    loading: communityPrivilegesLoading,
    refetch,
  } = useApplicationButtonQuery({
    variables: {
      spaceId: spaceId!,
      parentSpaceId,
      includeParentSpace: !!parentSpaceId,
    },
    skip: loadingParams || !spaceId,
  });

  // TODO ideally this should be a dependency passed from the context where the button is rendered
  const [fetchSpace] = useSpacePageLazyQuery();
  const [fetchSubspace] = useSubspacePageLazyQuery();

  const refetchSpace = async () => {
    const refetchSpaceQuery = parentSpaceId ? fetchSubspace : fetchSpace;

    await refetch({
      spaceId: spaceId!,
      parentSpaceId,
      includeParentSpace: !!parentSpaceId,
    });

    refetchSpaceQuery({
      variables: {
        spaceId: spaceId!,
      },
    });

    if (userId) {
      getCurrentUserProfile({
        variables: {},
      });
    }
  };

  const space = _communityPrivileges?.lookup.space;
  const parentSpace = _communityPrivileges?.parentSpace?.space;

  const applyUrl = space?.about.profile.url;
  const subspaceName = space?.about.profile.displayName;
  const parentCommunityName = parentSpace?.about.profile.displayName;
  const parentCommunitySpaceLevel = parentSpace?.level;

  const [joinCommunity, { loading: joiningCommunity }] = useJoinRoleSetMutation({
    update: cache => clearCacheForType(cache, 'Authorization'),
  });

  const userApplication = pendingApplications?.find(x => x.spacePendingMembershipInfo.id === spaceId);

  const userInvitation = pendingInvitations?.find(x => x.spacePendingMembershipInfo.id === spaceId);

  // find an application which does not have a challengeID, meaning it's on space level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = pendingApplications?.find(x => x.spacePendingMembershipInfo.id === parentSpaceId);

  const isMember = space?.about.membership.myMembershipStatus === CommunityMembershipStatus.Member;

  const isSubspace = !!parentSpaceId;
  const isParentMember = parentSpace?.about.membership.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentUrl = parentSpace?.about.profile.url;

  const rolesetPrivileges = space?.about.membership.myPrivileges ?? [];

  const canJoinCommunity =
    (isSubspace && isParentMember && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleJoin)) ||
    (!isSubspace && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleJoin));

  // Changed from parent to current space
  const canAcceptInvitation =
    space?.about.membership.myMembershipStatus === CommunityMembershipStatus.InvitationPending;

  const canApplyToCommunity =
    (isSubspace && isParentMember && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleApply)) ||
    (!isSubspace && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleApply));

  const parentRoleSetPrivileges = parentSpace?.about.membership.myPrivileges ?? [];

  const canJoinParentCommunity = parentRoleSetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleJoin);
  const canApplyToParentCommunity = parentRoleSetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleApply);

  const loading =
    loadingParams || membershipLoading || communityPrivilegesLoading || joiningCommunity || gettingUserProfile;

  const handleJoin = async () => {
    const roleSetId = space?.about.membership.roleSetID;
    if (!roleSetId) {
      throw new Error('Community is not loaded');
    }
    await joinCommunity({
      variables: { roleSetId },
    });
    if (userId) {
      getCurrentUserProfile({
        variables: {},
      });
    }
    onJoin?.({ communityId: roleSetId });
    notify(t('components.application-button.dialogApplicationSuccessful.join.body'), 'success');
  };

  const applicationButtonProps: Omit<ApplicationButtonProps, 'spaceId' | 'spaceLevel'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    applyUrl,
    parentUrl,
    applicationState: userApplication?.application.state,
    userInvitation,
    parentApplicationState: parentApplication?.application.state,
    parentCommunityName,
    parentCommunitySpaceLevel,
    subspaceName,
    canJoinCommunity,
    canAcceptInvitation,
    canApplyToCommunity,
    canJoinParentCommunity,
    canApplyToParentCommunity,
    onJoin: handleJoin,
    onUpdateInvitation: refetchSpace,
    loading,
  };

  return <>{children(applicationButtonProps, loading)}</>;
};

export default ApplicationButtonContainer;
