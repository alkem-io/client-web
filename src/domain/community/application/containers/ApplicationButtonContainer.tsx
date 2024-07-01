import React, { FC } from 'react';
import { ApplicationButtonProps } from '../applicationButton/ApplicationButton';
import { useUserContext } from '../../user';
import {
  useCommunityUserPrivilegesQuery,
  useJoinCommunityMutation,
  useSpacePageLazyQuery,
  useSubspacePageLazyQuery,
  useUserPendingMembershipsQuery,
  useUserProfileLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import clearCacheForType from '../../../../core/apollo/utils/clearCacheForType';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';

interface ApplicationContainerEntities {
  applicationButtonProps: Omit<ApplicationButtonProps, 'journeyId' | 'journeyLevel'>;
}

interface ApplicationContainerActions {}

interface ApplicationContainerState {
  loading: boolean;
}

interface JoinParams {
  communityId: string;
}

export interface ApplicationButtonContainerProps
  extends ContainerChildProps<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  parentSpaceId?: string;
  journeyId?: string;
  loading?: boolean;
  onJoin?: (params: JoinParams) => void;
}

export const ApplicationButtonContainer: FC<ApplicationButtonContainerProps> = ({
  parentSpaceId,
  journeyId,
  loading: loadingParams = false,
  onJoin,
  children,
}) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { isAuthenticated } = useAuthenticationContext();
  const { user, loadingMe: membershipLoading } = useUserContext();
  const { data: pendingMembershipsData } = useUserPendingMembershipsQuery({
    skip: !isAuthenticated,
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

  const applyUrl = space?.profile.url;
  const challengeName = space?.profile.displayName;
  const spaceName = parentSpace?.profile.displayName;

  const [joinCommunity, { loading: joiningCommunity }] = useJoinCommunityMutation({
    update: cache => clearCacheForType(cache, 'Authorization'),
  });

  const userApplication = pendingApplications?.find(x => x.space.id === journeyId);

  const userInvitation = pendingInvitations?.find(x => x.space.id === journeyId);

  // find an application which does not have a challengeID, meaning it's on space level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = pendingApplications?.find(x => x.space.id === parentSpaceId);

  const isMember = space?.community.myMembershipStatus === CommunityMembershipStatus.Member;

  const isChildJourney = !!parentSpaceId;
  const isParentMember = parentSpace?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentUrl = parentSpace?.profile.url;

  const communityPrivileges = space?.community?.authorization?.myPrivileges ?? [];

  const canJoinCommunity =
    (isChildJourney && isParentMember && communityPrivileges.includes(AuthorizationPrivilege.CommunityJoin)) ||
    (!isChildJourney && communityPrivileges.includes(AuthorizationPrivilege.CommunityJoin));

  // Changed from parent to current space
  const canAcceptInvitation = space?.community?.myMembershipStatus === CommunityMembershipStatus.InvitationPending;

  const canApplyToCommunity =
    (isChildJourney && isParentMember && communityPrivileges.includes(AuthorizationPrivilege.CommunityApply)) ||
    (!isChildJourney && communityPrivileges.includes(AuthorizationPrivilege.CommunityApply));

  const parentCommunityPrivileges = parentSpace?.community?.authorization?.myPrivileges ?? [];

  const canJoinParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);
  const canApplyToParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const loading =
    loadingParams || membershipLoading || communityPrivilegesLoading || joiningCommunity || gettingUserProfile;

  const handleJoin = async () => {
    const communityId = space?.community.id;
    if (!communityId) {
      throw new Error('Community is not loaded');
    }
    await joinCommunity({
      variables: { joiningData: { communityID: communityId } },
    });
    if (userId) {
      getUserProfile({
        variables: {
          input: userId,
        },
      });
    }
    onJoin?.({ communityId });
    notify(t('components.application-button.dialogApplicationSuccessful.join.body'), 'success');
  };

  const applicationButtonProps: Omit<ApplicationButtonProps, 'journeyId' | 'journeyLevel'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    applyUrl,
    parentUrl,
    applicationState: userApplication?.application.lifecycle.state,
    userInvitation,
    parentApplicationState: parentApplication?.application.lifecycle.state,
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

  return (
    <>
      {children(
        {
          applicationButtonProps,
        },
        { loading },
        {}
      )}
    </>
  );
};

export default ApplicationButtonContainer;
