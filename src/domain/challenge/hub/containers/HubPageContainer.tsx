import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo } from 'react';
import { useHub } from '../HubContext/useHub';
import { useUserContext } from '../../../community/contributor/user';
import {
  useHubDashboardReferencesAndRecommendationsQuery,
  useHubPageQuery,
  usePlatformLevelAuthorizationQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  AssociatedOrganizationDetailsFragment,
  AuthorizationPrivilege,
  ChallengeCardFragment,
  DashboardTopCalloutFragment,
  HubPageFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { useAspectsCount } from '../../../collaboration/aspect/utils/aspectsCount';
import { WithId } from '../../../../types/WithId';
import { ContributorCardProps } from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../../collaboration/canvas/utils/canvasesCount';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog';
import { useActivityOnCollaboration } from '../../../shared/components/ActivityLog/hooks/useActivityOnCollaboration';

export interface HubContainerEntities {
  hub: HubPageFragment | undefined;
  isPrivate: boolean | undefined;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    timelineReadAccess: boolean;
    hubReadAccess: boolean;
    readUsers: boolean;
  };
  challengesCount: number | undefined;
  isAuthenticated: boolean;
  isMember: boolean;
  challenges: ChallengeCardFragment[];
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  aspectsCount: number | undefined;
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
  hostOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
}

export interface HubContainerActions {}

export interface HubContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface HubPageContainerProps
  extends ContainerChildProps<HubContainerEntities, HubContainerActions, HubContainerState> {}

const EMPTY = [];
const NO_PRIVILEGES = [];

export const HubPageContainer: FC<HubPageContainerProps> = ({ children }) => {
  const { hubId, hubNameId, loading: loadingHub, isPrivate } = useHub();
  const { user, isAuthenticated } = useUserContext();

  const isMember = user?.ofHub(hubId) ?? false;

  const { data: _hub, loading: loadingHubQuery } = useHubPageQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
    skip: loadingHub,
  });
  const collaborationID = _hub?.hub?.collaboration?.id;

  // don't load references without READ privilege on Context
  const { data: referencesData } = useHubDashboardReferencesAndRecommendationsQuery({
    variables: { hubId },
    skip: !_hub?.hub?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read),
  });

  const communityReadAccess = (_hub?.hub?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const timelineReadAccess = (_hub?.hub?.timeline?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const challengesCount = useMemo(() => getMetricCount(_hub?.hub.metrics, MetricType.Challenge), [_hub]);

  const hubPrivileges = _hub?.hub?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const { data: platformPrivilegesData } = usePlatformLevelAuthorizationQuery();
  const platformPrivileges = platformPrivilegesData?.authorization.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: hubPrivileges.includes(AuthorizationPrivilege.Update),
    communityReadAccess,
    timelineReadAccess,
    hubReadAccess: hubPrivileges.includes(AuthorizationPrivilege.Read),
    readUsers: platformPrivileges.includes(AuthorizationPrivilege.ReadUsers),
  };

  const { activities, loading: activityLoading } = useActivityOnCollaboration(
    collaborationID || '',
    !permissions.hubReadAccess || !permissions.readUsers
  );

  const relevantActivities = useMemo(
    () => activities?.filter(activity => activity.__typename !== 'ActivityLogEntryMemberJoined'),
    [activities]
  );

  const challenges = _hub?.hub.challenges ?? EMPTY;

  const aspectsCount = useAspectsCount(_hub?.hub.metrics);
  const canvasesCount = useCanvasesCount(_hub?.hub.metrics);
  const membersCount = getMetricCount(_hub?.hub.metrics, MetricType.Member);
  const memberUsersCount = membersCount - (_hub?.hub.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(_hub?.hub.community, { memberUsersCount });

  const references = referencesData?.hub?.profile.references;
  const recommendations = referencesData?.hub?.context?.recommendations;

  const hostOrganizations = useMemo(() => _hub?.hub.host && [_hub?.hub.host], [_hub]);

  const topCallouts = _hub?.hub.collaboration?.callouts?.slice(0, 3);

  const communityId = _hub?.hub.community?.id ?? '';

  const [sendMessageToCommunityLeads] = useSendMessageToCommunityLeadsMutation();
  const handleSendMessageToCommunityLeads = useCallback(
    async (messageText: string) => {
      await sendMessageToCommunityLeads({
        variables: {
          messageData: {
            message: messageText,
            communityId: communityId,
          },
        },
      });
    },
    [sendMessageToCommunityLeads, communityId]
  );

  return (
    <>
      {children(
        {
          hub: _hub?.hub,
          isPrivate,
          permissions,
          challengesCount,
          isAuthenticated,
          isMember,
          challenges,
          aspectsCount,
          canvasesCount,
          references,
          recommendations,
          activities: relevantActivities,
          activityLoading,
          ...contributors,
          hostOrganizations,
          topCallouts,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
        },
        {
          loading: loadingHubQuery || loadingHub,
        },
        {}
      )}
    </>
  );
};

export default HubPageContainer;
