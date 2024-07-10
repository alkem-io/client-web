import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useUserContext } from '../../../community/user';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  AuthorizationPrivilege,
  CalloutGroupName,
  CommunityMembershipStatus,
  Reference,
  SubspacePageFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import {
  useLegacySubspaceDashboardPageQuery,
  useSpaceDashboardReferencesQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useCanReadSpace from '../../common/authorization/useCanReadSpace';

export interface SubspaceContainerEntities extends EntityDashboardContributors {
  challenge?: SubspacePageFragment;
  references: Reference[] | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    subspaceReadAccess: boolean;
    timelineReadAccess: boolean;
    readUsers: boolean;
  };
  isAuthenticated: boolean;
  isMember: boolean;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  callouts: UseCalloutsProvided;
}

export interface ChallengeContainerActions {}

export interface ChallengeContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengePageContainerProps
  extends ContainerChildProps<SubspaceContainerEntities, ChallengeContainerActions, ChallengeContainerState> {
  challengeId: string | undefined;
}

const NO_PRIVILEGES = [];

export const SubspacePageContainer: FC<ChallengePageContainerProps> = ({ challengeId, children }) => {
  const { user, isAuthenticated } = useUserContext();
  const { canReadCommunity } = useCanReadSpace({ spaceId: challengeId });

  const { data: subspaceData, loading: loadingProfile } = useLegacySubspaceDashboardPageQuery({
    variables: {
      subspaceId: challengeId!,
      authorizedReadAccessCommunity: canReadCommunity,
    },
    skip: !challengeId,
  });

  const subspace = subspaceData?.lookup.space;

  const challengePrivileges = subspace?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const timelineReadAccess = (subspace?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const permissions = {
    canEdit: challengePrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess: (subspace?.community?.authorization?.myPrivileges || []).some(
      x => x === AuthorizationPrivilege.Read
    ),
    subspaceReadAccess: challengePrivileges.includes(AuthorizationPrivilege.Read),
    timelineReadAccess,
    readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
  };

  const canReadReferences = subspace?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data: referenceData } = useSpaceDashboardReferencesQuery({
    variables: {
      spaceId: challengeId!, // canReadReferences implies challengeId is provided
    },
    skip: !canReadReferences,
  });

  const { metrics = [] } = subspace || {};

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (subspace?.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(subspace?.community, { memberUsersCount });

  const references = referenceData?.lookup.space?.profile.references;

  const communityId = subspace?.community?.id ?? '';

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const callouts = useCallouts({
    journeyId: challengeId,
    journeyTypeName: 'subspace',
    groupNames: [CalloutGroupName.Home],
  });

  const isMember = subspace?.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <>
      {children(
        {
          challenge: subspace,
          permissions,
          isAuthenticated,
          references,
          isMember,
          ...contributors,
          sendMessageToCommunityLeads,
          callouts,
        },
        { loading: loadingProfile },
        {}
      )}
    </>
  );
};

export default SubspacePageContainer;
