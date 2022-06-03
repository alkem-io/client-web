import React, { FC } from 'react';
import { ApplicationButtonProps } from '../../components/composite/common/ApplicationButton/ApplicationButton';
import { useApolloErrorHandler, useAuthenticationContext, useChallenge, useHub, useUserContext } from '../../hooks';
import {
  useCommunityUserPrivilegesQuery,
  useJoinCommunityMutation,
  useUserApplicationsQuery,
  useUserProfileLazyQuery,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { buildChallengeApplyUrl, buildHubApplyUrl, buildHubUrl } from '../../utils/urlBuilders';
import { AuthorizationPrivilege } from '../../models/graphql-schema';
import { useCommunityContext } from '../../domain/community/CommunityContext';
import clearCacheForType from '../../domain/shared/utils/clearCacheForType';

interface ApplicationContainerEntities {
  applicationButtonProps: ApplicationButtonProps;
}
interface ApplicationContainerActions {}
interface ApplicationContainerState {
  loading: boolean;
}

interface ApplicationContainerProps
  extends ContainerChildProps<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {}

export const ApplicationButtonContainer: FC<ApplicationContainerProps> = ({ children }) => {
  const { isAuthenticated } = useAuthenticationContext();
  const handleError = useApolloErrorHandler();
  const { user } = useUserContext();
  const userId = user?.user?.id ?? '';

  const [getUserProfile, { loading: gettingUserProfile }] = useUserProfileLazyQuery({ variables: { input: userId } });

  const { hubId, hubNameId, displayName: hubName, refetchHub } = useHub();
  const { challengeId, challengeNameId, displayName: challengeName } = useChallenge();

  const { communityId } = useCommunityContext();
  const { data: memberShip, loading: membershipLoading } = useUserApplicationsQuery({
    variables: { input: { userID: userId } },
    skip: !userId,
  });

  const { data: _communityPrivileges, loading: communityPrivilegesLoading } = useCommunityUserPrivilegesQuery({
    variables: { hubNameId, communityId },
    skip: !communityId,
  });
  const hasCommunityParent = _communityPrivileges?.hub?.hubCommunity?.id !== communityId;

  const [joinCommunity, { loading: joiningCommunity }] = useJoinCommunityMutation({
    onError: handleError,
    update: cache => clearCacheForType(cache, 'Authorization'),
  });

  // todo: refactor logic or use entity privileges
  const userApplication = memberShip?.membershipUser.applications?.find(
    x => x.hubID === hubId && (challengeId ? x.challengeID === challengeId : true) && !x.opportunityID
  );

  // find an application which does not have a challengeID, meaning it's on hub level,
  // but you are at least at challenge level to have a parent application
  const parentApplication = memberShip?.membershipUser.applications?.find(
    x => x.hubID === hubId && !x.challengeID && !x.opportunityID && challengeId
  );

  const isMember = (challengeId && challengeNameId ? user?.ofChallenge(challengeId) : user?.ofHub(hubId)) || false;
  const applyUrl =
    challengeId && challengeNameId ? buildChallengeApplyUrl(hubNameId, challengeNameId) : buildHubApplyUrl(hubNameId);
  const joinParentUrl = challengeNameId && buildHubUrl(hubNameId);

  const communityPrivileges = _communityPrivileges?.hub?.community?.authorization?.myPrivileges ?? [];
  const canJoinCommunity = communityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);
  const canApplyToCommunity = communityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const parentCommunityPrivileges = hasCommunityParent
    ? _communityPrivileges?.hub?.hubCommunity?.authorization?.myPrivileges ?? []
    : [];
  const canJoinParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityJoin);
  const canApplyToParentCommunity = parentCommunityPrivileges.includes(AuthorizationPrivilege.CommunityApply);

  const loading = membershipLoading || communityPrivilegesLoading || joiningCommunity || gettingUserProfile;

  const onJoin = async () => {
    await joinCommunity({
      variables: { joiningData: { communityID: communityId } },
    });
    getUserProfile();
    refetchHub();
  };

  const applicationButtonProps: ApplicationButtonProps = {
    isAuthenticated,
    isMember,
    isParentMember: Boolean(challengeId) && user?.ofHub(hubId),
    applyUrl,
    parentApplyUrl: buildHubApplyUrl(hubNameId),
    joinParentUrl,
    applicationState: userApplication?.state,
    parentApplicationState: parentApplication?.state,
    hubName,
    challengeName,
    canJoinCommunity,
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
