import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useHub, useUserContext } from '../../hooks';
import { useHubPageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import {
  AspectCardFragment,
  AuthorizationPrivilege,
  CanvasDetailsFragment,
  ChallengeCardFragment,
  HubPageFragment,
} from '../../models/graphql-schema';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { Discussion } from '../../models/discussion/discussion';
import { ActivityType } from '../../domain/activity/ActivityType';
import { useAspectsCount } from '../../domain/aspect/utils/aspectsCount';
import { WithId } from '../../types/WithId';
import { ContributorCardProps } from '../../components/composite/common/cards/ContributorCard/ContributorCard';
import useCommunityMembersAsCardProps from '../../domain/community/utils/useCommunityMembersAsCardProps';
import { useCanvasesCount } from '../../domain/canvas/utils/canvasesCount';

export interface HubContainerEntities {
  hub?: HubPageFragment;
  isPrivate: boolean;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    challengesReadAccess: boolean;
  };
  activity: ActivityItem[];
  isAuthenticated: boolean;
  isMember: boolean;
  isGlobalAdmin: boolean;
  discussionList: Discussion[];
  challenges: ChallengeCardFragment[];
  aspects: AspectCardFragment[];
  aspectsCount: number | undefined;
  canvases: CanvasDetailsFragment[];
  canvasesCount: number | undefined;
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
  const { t } = useTranslation();
  const { hubId, hubNameId, loading: loadingHub } = useHub();
  const { data: _hub, loading: loadingHubQuery } = useHubPageQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
  });
  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();

  const { user, isAuthenticated } = useUserContext();

  const communityReadAccess = (_hub?.hub?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const activity: ActivityItem[] = useMemo(() => {
    const _activity = _hub?.hub.activity || [];
    return [
      {
        name: t('common.challenges'),
        type: ActivityType.Challenge,
        count: getActivityCount(_activity, 'challenges'),
        color: 'neutral',
      },
      {
        name: t('common.opportunities'),
        count: getActivityCount(_activity, 'opportunities'),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getActivityCount(_activity, 'members'),
        color: 'neutralMedium',
      },
    ];
  }, [_hub]);

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

  const aspects = _hub?.hub.collaboration?.callouts?.[0]?.aspects ?? EMPTY;
  const aspectsCount = useAspectsCount(_hub?.hub.activity);

  const canvases = _hub?.hub.collaboration?.callouts?.[0]?.canvases ?? EMPTY;
  const canvasesCount = useCanvasesCount(_hub?.hub.activity);

  const contributors = useCommunityMembersAsCardProps(_hub?.hub.community);

  return (
    <>
      {children(
        {
          hub: _hub?.hub,
          discussionList,
          isPrivate,
          permissions,
          activity,
          isAuthenticated,
          isMember,
          isGlobalAdmin,
          challenges,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
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
