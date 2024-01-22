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
import { buildChallengeApplyUrl, buildSpaceApplyUrl, buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import { useCommunityContext } from '../../community/CommunityContext';
import clearCacheForType from '../../../../core/apollo/utils/clearCacheForType';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';

interface ApplicationContainerEntities {
  applicationButtonProps: Omit<ApplicationButtonProps, 'journeyTypeName'>;
}

interface ApplicationContainerActions {}

interface ApplicationContainerState {
  loading: boolean;
}

export interface ApplicationButtonContainerProps
  extends ContainerChildProps<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  challengeId?: string;
  challengeNameId?: string;
  challengeName?: string;
}

export const ApplicationButtonContainer: FC<ApplicationButtonContainerProps> = ({
  challengeId,
  challengeNameId,
  challengeName,
  children,
}) => {
  const { isAuthenticated } = useAuthenticationContext();
  const { user, loadingMe: membershipLoading } = useUserContext();
  const userId = user?.user?.id ?? '';

  const [getUserProfile, { loading: gettingUserProfile }] = useUserProfileLazyQuery({ variables: { input: userId } });

  const { spaceId, spaceNameId, profile: spaceProfile, refetchSpace } = useSpace();

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
    x => x.spaceId === spaceId && (challengeId ? x.challengeId === challengeId : true) && !x.opportunityId
  );

  const userInvitation = user?.pendingInvitations?.find(
    x => x.spaceId === spaceId && (challengeId ? x.challengeId === challengeId : true) && !x.opportunityId
  );

  // find an application which does not have a challengeID, meaning it's on space level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = user?.pendingApplications?.find(
    x => x.spaceId === spaceId && !x.challengeId && !x.opportunityId && challengeId
  );

  const isMember = myMembershipStatus === CommunityMembershipStatus.Member;
  const isParentMember =
    hasCommunityParent &&
    _communityPrivileges?.space?.spaceCommunity?.myMembershipStatus === CommunityMembershipStatus.Member;

  const applyUrl =
    challengeId && challengeNameId
      ? buildChallengeApplyUrl(spaceNameId, challengeNameId)
      : buildSpaceApplyUrl(spaceNameId);
  const joinParentUrl = challengeNameId && buildSpaceUrl(spaceNameId);

  const communityPrivileges = _communityPrivileges?.space?.applicationCommunity?.authorization?.myPrivileges ?? [];
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
  };

  const applicationButtonProps: Omit<ApplicationButtonProps, 'journeyTypeName'> = {
    isAuthenticated,
    isMember,
    isParentMember,
    applyUrl,
    parentApplyUrl: buildSpaceApplyUrl(spaceNameId),
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
