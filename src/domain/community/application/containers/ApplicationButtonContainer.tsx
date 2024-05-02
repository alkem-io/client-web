import React, { FC } from 'react';
import { ApplicationButtonProps } from '../applicationButton/ApplicationButton';
import { useUserContext } from '../../user';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import {
  useCommunityUserPrivilegesQuery,
  useJoinCommunityMutation,
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

export interface ApplicationButtonContainerProps
  extends ContainerChildProps<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  parentSpaceId?: string;
  subspaceId?: string;
  loading?: boolean;
}

export const ApplicationButtonContainer: FC<ApplicationButtonContainerProps> = ({
  parentSpaceId,
  subspaceId,
  loading: loadingParams = false,
  children,
}) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { isAuthenticated } = useAuthenticationContext();
  const { user, loadingMe: membershipLoading } = useUserContext();
  const userId = user?.user?.id;

  const [getUserProfile, { loading: gettingUserProfile }] = useUserProfileLazyQuery();

  // TODO consider fefeching another way, this is always top level
  const { refetchSpace } = useSpace();

  const { data: _communityPrivileges, loading: communityPrivilegesLoading } = useCommunityUserPrivilegesQuery({
    variables: {
      spaceId: subspaceId!,
      parentSpaceId,
      includeParentSpace: !!parentSpaceId,
    },
    skip: loadingParams || !subspaceId,
  });

  const applyUrl = _communityPrivileges?.space.profile.url;
  const challengeName = _communityPrivileges?.space.profile.displayName;
  const spaceName = _communityPrivileges?.parentSpace.profile.displayName;

  const [joinCommunity, { loading: joiningCommunity }] = useJoinCommunityMutation({
    update: cache => clearCacheForType(cache, 'Authorization'),
  });

  const contributionItemKeys = ['spaceId', 'subspaceId', 'subsubspaceId'] as const;

  // todo: add journeyId to ContributionItem ??
  const userApplication = user?.pendingApplications?.find(x => contributionItemKeys.some(key => x[key] === subspaceId));

  const userInvitation = user?.pendingInvitations?.find(x => contributionItemKeys.some(key => x[key] === subspaceId));

  // find an application which does not have a challengeID, meaning it's on space level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = user?.pendingApplications?.find(x =>
    contributionItemKeys.some(key => x[key] === parentSpaceId)
  );

  const isMember = _communityPrivileges?.space.community.myMembershipStatus === CommunityMembershipStatus.Member;

  const isParentMember =
    _communityPrivileges?.parentSpace?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentUrl = _communityPrivileges?.parentSpace.profile.url;

  const communityPrivileges = _communityPrivileges?.space?.community?.authorization?.myPrivileges ?? [];

  const canJoinCommunity = communityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);

  // Changed from parent to current space
  const canAcceptInvitation =
    _communityPrivileges?.space?.community?.myMembershipStatus === CommunityMembershipStatus.InvitationPending;

  const canApplyToCommunity = communityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const parentCommunityPrivileges = _communityPrivileges?.parentSpace?.community?.authorization?.myPrivileges ?? [];

  const canJoinParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);
  const canApplyToParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const loading =
    loadingParams || membershipLoading || communityPrivilegesLoading || joiningCommunity || gettingUserProfile;

  const onJoin = async () => {
    const communityId = _communityPrivileges?.space.community.id;
    if (!communityId) {
      throw new Error('Community is not loaded');
    }
    await joinCommunity({
      variables: { joiningData: { communityID: communityId } },
    });
    userId &&
      getUserProfile({
        variables: {
          input: userId,
        },
      });
    refetchSpace();
    notify(t('components.application-button.dialogApplicationSuccessful.join.body'), 'success');
  };

  const applicationButtonProps: Omit<ApplicationButtonProps, 'journeyId' | 'journeyLevel'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    applyUrl,
    parentUrl,
    applicationState: userApplication?.state,
    userInvitation,
    parentApplicationState: parentApplication?.state,
    spaceName,
    challengeName,
    canJoinCommunity,
    canAcceptInvitation,
    canApplyToCommunity,
    canJoinParentCommunity,
    canApplyToParentCommunity,
    onJoin,
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
