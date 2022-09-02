import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useHub, useUserContext } from '../../hooks';
import { useHubDashboardReferencesQuery, useHubPageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { AuthorizationPrivilege, ChallengeCardFragment, HubPageFragment, Reference } from '../../models/graphql-schema';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { Discussion } from '../../models/discussion/discussion';
import { ActivityType } from '../../domain/activity/ActivityType';
import { useAspectsCount } from '../../domain/aspect/utils/aspectsCount';
import { WithId } from '../../types/WithId';
import { ContributorCardProps } from '../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import useCommunityMembersAsCardProps from '../../domain/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../domain/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../domain/callout/utils/getPublishedCallouts';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../domain/callout/useCallouts';

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
  isGlobalAdmin: boolean;
  discussionList: Discussion[];
  challenges: ChallengeCardFragment[];
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

export const HubPageContainer: FC<HubPageContainerProps> = ({ children }) => {
  const { hubId, hubNameId, loading: loadingHub } = useHub();
  const { data: _hub, loading: loadingHubQuery } = useHubPageQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
  });
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
  const isGlobalAdmin = user?.isGlobalAdmin ?? false;
  const isPrivate = !(_hub?.hub?.authorization?.anonymousReadAccess ?? true);

  const permissions = {
    canEdit: user?.isHubAdmin(hubId) || false,
    communityReadAccess,
    // todo: use privileges instead when authorization on challenges is public
    challengesReadAccess: isPrivate ? isMember || isGlobalAdmin : true,
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
          isGlobalAdmin,
          challenges,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          references,
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
