import {
  useCommunityUserPrivilegesQuery,
  useJoinRoleSetMutation,
  useSpacePageLazyQuery,
  useSubspacePageLazyQuery,
  useUserPendingMembershipsQuery,
  useUserProfileLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import clearCacheForType from '@/core/apollo/utils/clearCacheForType';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUserContext } from '@/domain/community/user';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationButtonProps } from '../../community/application/applicationButton/ApplicationButton';

export interface ApplicationButtonContainerProps {
  parentSpaceId?: string;
  journeyId?: string;
  loading?: boolean;
  onJoin?: (params: { communityId: string }) => void;
  children: (props: Omit<ApplicationButtonProps, 'journeyId' | 'spaceLevel'>, loading: boolean) => ReactNode;
}

export const ApplicationButtonContainer = ({
  parentSpaceId,
  journeyId,
  loading: loadingParams = false,
  onJoin,
  children,
}: ApplicationButtonContainerProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { isAuthenticated } = useAuthenticationContext();
  const { user, loadingMe: membershipLoading } = useUserContext();
  const { data: pendingMembershipsData } = useUserPendingMembershipsQuery({
    skip: !isAuthenticated || !user,
  });
  const { communityApplications: pendingApplications, communityInvitations: pendingInvitations } =
    pendingMembershipsData?.me ?? {};

  const userId = user?.user?.id;

  const [getUserProfile, { loading: gettingUserProfile }] = useUserProfileLazyQuery();

  const {
    data: _communityPrivileges,
    loading: communityPrivilegesLoading,
    refetch,
  } = useCommunityUserPrivilegesQuery({
    variables: {
      spaceId: journeyId!,
      parentSpaceId,
      includeParentSpace: !!parentSpaceId,
    },
    skip: loadingParams || !journeyId,
  });

  // TODO ideally this should be a dependency passed from the context where the button is rendered
  const [fetchSpace] = useSpacePageLazyQuery();
  const [fetchSubspace] = useSubspacePageLazyQuery();

  const refetchSpace = async () => {
    const refetchSpaceQuery = parentSpaceId ? fetchSubspace : fetchSpace;

    await refetch({
      spaceId: journeyId!,
      parentSpaceId,
      includeParentSpace: !!parentSpaceId,
    });

    refetchSpaceQuery({
      variables: {
        spaceId: journeyId!,
      },
    });

    if (userId) {
      getUserProfile({
        variables: {
          input: userId,
        },
      });
    }
  };

  const space = _communityPrivileges?.lookup.space;
  const parentSpace = _communityPrivileges?.parentSpace?.space;

  const applyUrl = space?.about.profile.url;
  const challengeName = space?.about.profile.displayName;
  const spaceName = parentSpace?.about.profile.displayName;

  const [joinCommunity, { loading: joiningCommunity }] = useJoinRoleSetMutation({
    update: cache => clearCacheForType(cache, 'Authorization'),
  });

  const userApplication = pendingApplications?.find(x => x.spacePendingMembershipInfo.id === journeyId);

  const userInvitation = pendingInvitations?.find(x => x.spacePendingMembershipInfo.id === journeyId);

  // find an application which does not have a challengeID, meaning it's on space level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = pendingApplications?.find(x => x.spacePendingMembershipInfo.id === parentSpaceId);

  const isMember = space?.community.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member;

  const isChildJourney = !!parentSpaceId;
  const isParentMember = parentSpace?.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentUrl = parentSpace?.about.profile.url;

  const rolesetPrivileges = space?.community?.roleSet?.authorization?.myPrivileges ?? [];

  const canJoinCommunity =
    (isChildJourney && isParentMember && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleJoin)) ||
    (!isChildJourney && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleJoin));

  // Changed from parent to current space
  const canAcceptInvitation =
    space?.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.InvitationPending;

  const canApplyToCommunity =
    (isChildJourney && isParentMember && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleApply)) ||
    (!isChildJourney && rolesetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleApply));

  const parentRoleSetPrivileges = parentSpace?.community.roleSet?.authorization?.myPrivileges ?? [];

  const canJoinParentCommunity = parentRoleSetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleJoin);
  const canApplyToParentCommunity = parentRoleSetPrivileges.includes(AuthorizationPrivilege.RolesetEntryRoleApply);

  const loading =
    loadingParams || membershipLoading || communityPrivilegesLoading || joiningCommunity || gettingUserProfile;

  const handleJoin = async () => {
    const roleSetId = space?.community.roleSet.id;
    if (!roleSetId) {
      throw new Error('Community is not loaded');
    }
    await joinCommunity({
      variables: { roleSetId },
    });
    if (userId) {
      getUserProfile({
        variables: {
          input: userId,
        },
      });
    }
    onJoin?.({ communityId: roleSetId });
    notify(t('components.application-button.dialogApplicationSuccessful.join.body'), 'success');
  };

  const applicationButtonProps: Omit<ApplicationButtonProps, 'journeyId' | 'spaceLevel'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    applyUrl,
    parentUrl,
    applicationState: userApplication?.application.state,
    userInvitation,
    parentApplicationState: parentApplication?.application.state,
    spaceName,
    challengeName,
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
