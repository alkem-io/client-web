import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useHub } from '../HubContext/useHub';
import { useUserContext } from '../../../community/contributor/user';
import {
  useHubDashboardReferencesAndRecommendationsQuery,
  useHubPageQuery,
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
import { useDiscussionsContext } from '../../../communication/discussion/providers/DiscussionsProvider';
import { Discussion } from '../../../communication/discussion/models/discussion';
import { MetricType } from '../../../platform/metrics/MetricType';
import { useAspectsCount } from '../../../collaboration/aspect/utils/aspectsCount';
import { WithId } from '../../../../types/WithId';
import { ContributorCardProps } from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../../collaboration/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../../collaboration/callout/utils/getPublishedCallouts';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../../collaboration/callout/useCallouts';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog';
import { useActivityOnCollaboration } from '../../../shared/components/ActivityLog/hooks/useActivityOnCollaboration';

export interface HubContainerEntities {
  hub: HubPageFragment | undefined;
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
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  aspects: AspectFragmentWithCallout[];
  aspectsCount: number | undefined;
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
  memberUsers: WithId<ContributorCardProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
  hostOrganizations: AssociatedOrganizationDetailsFragment[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
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

  const { activities, loading: activityLoading } = useActivityOnCollaboration(collaborationID || '');

  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();
  const { user, isAuthenticated } = useUserContext();
  // don't load references without READ privilige on Context
  const { data: referencesData } = useHubDashboardReferencesAndRecommendationsQuery({
    variables: { hubId },
    skip: !_hub?.hub?.context?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read),
  });

  const communityReadAccess = (_hub?.hub?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const challengesCount = useMemo(() => getMetricCount(_hub?.hub.metrics, MetricType.Challenge), [_hub]);

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
  const aspectsCount = useAspectsCount(_hub?.hub.metrics);

  const canvases = getCanvasesFromPublishedCallouts(_hub?.hub.collaboration?.callouts).slice(0, 2);
  const canvasesCount = useCanvasesCount(_hub?.hub.metrics);

  const contributors = useCommunityMembersAsCardProps(_hub?.hub.community);

  const references = referencesData?.hub?.context?.references;
  const recommendations = referencesData?.hub?.context?.recommendations;

  const hostOrganizations = useMemo(() => _hub?.hub.host && [_hub?.hub.host], [_hub]);

  const topCallouts = _hub?.hub.collaboration?.callouts?.slice(0, 3);

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
          recommendations,
          activities,
          activityLoading,
          ...contributors,
          hostOrganizations,
          topCallouts,
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
