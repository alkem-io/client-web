import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useHub, useUserContext } from '../../hooks';
import {
  useActivityLogOnCollaborationQuery,
  useHubDashboardReferencesQuery,
  useHubPageQuery,
} from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import {
  Activity,
  AuthorizationPrivilege,
  ChallengeCardFragment,
  HubPageFragment,
  Reference,
} from '../../models/graphql-schema';
import getActivityCount from '../../domain/platform/activity/utils/getActivityCount';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { Discussion } from '../../domain/communication/discussion/models/discussion';
import { ActivityType } from '../../domain/platform/activity/ActivityType';
import { useAspectsCount } from '../../domain/collaboration/aspect/utils/aspectsCount';
import { WithId } from '../../types/WithId';
import { ContributorCardProps } from '../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import useCommunityMembersAsCardProps from '../../domain/community/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../domain/collaboration/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../domain/collaboration/callout/utils/getPublishedCallouts';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../domain/collaboration/callout/useCallouts';
import { LATEST_ACTIVITIES_COUNT } from '../../models/constants';

export interface HubContainerEntities {
  hub?: HubPageFragment;
  isPrivate: boolean;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    challengesReadAccess: boolean;
  };
  challengesCount: number | undefined;
  isAuthenticated: boolean;
  isMember: boolean;
  discussionList: Discussion[];
  challenges: ChallengeCardFragment[];
  activities: Activity[] | undefined;
  activityLoading: boolean;
  aspects: AspectFragmentWithCallout[];
  aspectsCount: number | undefined;
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
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
  const { hubId, hubNameId, loading: loadingHub } = useHub();
  const { data: _hub, loading: loadingHubQuery } = useHubPageQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
  });
  const collaborationID = _hub?.hub?.collaboration?.id;

  const { data: activityLogData, loading: activityLoading } = useActivityLogOnCollaborationQuery({
    variables: { queryData: { collaborationID: collaborationID! } },
    skip: !collaborationID,
  });
  const activities = useMemo(() => {
    if (!activityLogData) {
      return undefined;
    }

    return [...activityLogData.activityLogOnCollaboration]
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, LATEST_ACTIVITIES_COUNT);
  }, [activityLogData]);

  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();
  const { user, isAuthenticated } = useUserContext();
  // don't load references without READ privilige on Context
  const { data: referencesData } = useHubDashboardReferencesQuery({
    variables: { hubId },
    skip: !_hub?.hub?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read),
  });

  const communityReadAccess = (_hub?.hub?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const challengesCount = useMemo(() => getActivityCount(_hub?.hub.activity, ActivityType.Challenge), [_hub]);

  const isMember = user?.ofHub(hubId) ?? false;

  const isPrivate = !(_hub?.hub?.authorization?.anonymousReadAccess ?? true);
  const hubPrivileges = _hub?.hub?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = {
    canEdit: user?.isHubAdmin(hubId) || false,
    communityReadAccess,
    challengesReadAccess: hubPrivileges.includes(AuthorizationPrivilege.Read),
  };

  const challenges = _hub?.hub.challenges ?? EMPTY;

  const aspects = getAspectsFromPublishedCallouts(_hub?.hub.collaboration?.callouts).slice(0, 2);
  const aspectsCount = useAspectsCount(_hub?.hub.activity);

  const canvases = getCanvasesFromPublishedCallouts(_hub?.hub.collaboration?.callouts).slice(0, 2);
  const canvasesCount = useCanvasesCount(_hub?.hub.activity);

  const contributors = useCommunityMembersAsCardProps(_hub?.hub.community);

  const references = referencesData?.hub?.context?.references;

  return (
    <>
      {children(
        {
          hub: _hub?.hub,
          discussionList,
          isPrivate,
          permissions,
          challengesCount,
          isAuthenticated,
          isMember,
          challenges,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          references,
          activities,
          activityLoading,
          ...contributors,
        },
        {
          loading: loadingHubQuery || loadingHub || loadingDiscussions,
        },
        {}
      )}
    </>
  );
};
export default HubPageContainer;
