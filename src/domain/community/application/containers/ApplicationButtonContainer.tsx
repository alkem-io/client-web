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
import { useCommunityContext } from '../../community/CommunityContext';
import clearCacheForType from '../../../../core/apollo/utils/clearCacheForType';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { useSubSpace } from '../../../journey/subspace/hooks/useChallenge';
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
  subspaceId?: string;
  subspaceName?: string;
}

export const ApplicationButtonContainer: FC<ApplicationButtonContainerProps> = ({
  subspaceId: challengeId,
  subspaceName: challengeName,
  children,
}) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { isAuthenticated } = useAuthenticationContext();
  const { user, loadingMe: membershipLoading } = useUserContext();
  const userId = user?.user?.id ?? '';

  const [getUserProfile, { loading: gettingUserProfile }] = useUserProfileLazyQuery({ variables: { input: userId } });

  const { spaceId, spaceNameId, profile: spaceProfile, refetchSpace } = useSpace();
  const { profile: challengeProfile } = useSubSpace();

  const { communityId, myMembershipStatus } = useCommunityContext();

  const { data: _communityPrivileges, loading: communityPrivilegesLoading } = useCommunityUserPrivilegesQuery({
    variables: { spaceNameId, communityId },
    skip: !communityId,
  });

  const hasCommunityParent = _communityPrivileges?.space?.spaceCommunity?.id !== communityId;

  const [joinCommunity, { loading: joiningCommunity }] = useJoinCommunityMutation({
    update: cache => clearCacheForType(cache, 'Authorization'),
  });

  // todo: refactor logic or use entity privileges
  const userApplication = user?.pendingApplications?.find(
    x => x.spaceId === spaceId && (challengeId ? x.subspaceId === challengeId : true) && !x.subsubspaceId
  );

  const userInvitation = user?.pendingInvitations?.find(
    x => x.spaceId === spaceId && (challengeId ? x.subspaceId === challengeId : true) && !x.subsubspaceId
  );

  // find an application which does not have a challengeID, meaning it's on space level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = user?.pendingApplications?.find(
    x => x.spaceId === spaceId && !x.subspaceId && !x.subsubspaceId && challengeId
  );

  const isMember = myMembershipStatus === CommunityMembershipStatus.Member;
  const isParentMember =
    hasCommunityParent &&
    _communityPrivileges?.space?.spaceCommunity?.myMembershipStatus === CommunityMembershipStatus.Member;

  const applyUrl = challengeId ? challengeProfile.url : spaceProfile.url;

  const joinParentUrl = challengeId && spaceProfile.url;

  const communityPrivileges = _communityPrivileges?.lookup?.applicationCommunity?.authorization?.myPrivileges ?? [];
  const canJoinCommunity = communityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);
  const canAcceptInvitation =
    _communityPrivileges?.space?.spaceCommunity?.myMembershipStatus === CommunityMembershipStatus.InvitationPending;
  const canApplyToCommunity = communityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const parentCommunityPrivileges = hasCommunityParent
    ? _communityPrivileges?.space?.spaceCommunity?.authorization?.myPrivileges ?? []
    : [];
  const canJoinParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);
  const canApplyToParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const loading = membershipLoading || communityPrivilegesLoading || joiningCommunity || gettingUserProfile;

  const onJoin = async () => {
    await joinCommunity({
      variables: { joiningData: { communityID: communityId } },
    });
    getUserProfile();
    refetchSpace();
    notify(t('components.application-button.dialogApplicationSuccessful.join.body'), 'success');
  };

  const applicationButtonProps: Omit<ApplicationButtonProps, 'journeyId' | 'journeyLevel'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    applyUrl,
    parentApplyUrl: spaceProfile.url,
    joinParentUrl,
    applicationState: userApplication?.state,
    userInvitation,
    parentApplicationState: parentApplication?.state,
    spaceName: spaceProfile.displayName,
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
