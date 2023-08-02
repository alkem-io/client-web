import { ApolloError } from '@apollo/client';
import { FC, useCallback, useMemo, useState } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { useUserContext } from '../../../community/contributor/user';
import {
  useOpportunityPageQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  AuthorizationPrivilege,
  DashboardTopCalloutFragment,
  OpportunityPageFragment,
  OpportunityPageRelationsFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import { replaceAll } from '../../../../common/utils/replaceAll';
import { buildAdminOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { usePostsCount } from '../../../collaboration/post/utils/postsCount';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import { useWhiteboardsCount } from '../../../collaboration/whiteboard/utils/whiteboardsCount';
import {
  getPostsFromPublishedCallouts,
  getWhiteboardsFromPublishedCallouts,
} from '../../../collaboration/callout/utils/getPublishedCallouts';
import {
  PostFragmentWithCallout,
  WhiteboardFragmentWithCallout,
} from '../../../collaboration/callout/useCallouts/useCallouts';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';

export interface OpportunityContainerEntities extends EntityDashboardContributors {
  spaceId: string;
  spaceNameId: string;
  challengeNameId: string;
  opportunity: OpportunityPageFragment | undefined;
  permissions: {
    canEdit: boolean;
    projectWrite: boolean;
    editPost: boolean;
    editActorGroup: boolean;
    editActors: boolean;
    removeRelations: boolean;
    isMemberOfOpportunity: boolean;
    isNoRelations: boolean;
    isAuthenticated: boolean;
    communityReadAccess: boolean;
    opportunityReadAccess: boolean;
    readUsers: boolean;
  };
  hideMeme: boolean;
  showInterestModal: boolean;
  showActorGroupModal: boolean;
  url: string | undefined;
  meme?: Reference;
  links: Reference[];
  availableActorGroupNames: string[];
  existingPostNames: string[];
  relations: {
    incoming: OpportunityPageRelationsFragment[];
    outgoing: OpportunityPageRelationsFragment[];
  };
  posts: PostFragmentWithCallout[];
  postsCount: number | undefined;
  whiteboards: WhiteboardFragmentWithCallout[];
  whiteboardsCount: number | undefined;
  references: Reference[] | undefined;
  activities: ActivityLogResultType[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
}

export interface OpportunityContainerActions {
  onMemeError: () => void;
  onInterestOpen: () => void;
  onInterestClose: () => void;
  onAddActorGroupOpen: () => void;
  onAddActorGroupClose: () => void;
}

export interface OpportunityContainerState {
  loading: boolean;
  error?: ApolloError;
  activityLoading: boolean;
}

export interface OpportunityPageContainerProps
  extends ContainerChildProps<OpportunityContainerEntities, OpportunityContainerActions, OpportunityContainerState> {}

const NO_PRIVILEGES = [];

// todo: Do cleanup when the post are extended further
const OpportunityPageContainer: FC<OpportunityPageContainerProps> = ({ children }) => {
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
  // TODO don't use context, fetch all the data with a query
  const { spaceId, spaceNameId, challengeNameId, opportunityNameId } = useOpportunity();

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();

  const userName = user?.user.profile.displayName;

  const {
    data: query,
    loading: loadingOpportunity,
    error: errorOpportunity,
  } = useOpportunityPageQuery({
    variables: { spaceId: spaceNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });

  const opportunity = query?.space.opportunity;
  const collaborationID = opportunity?.collaboration?.id;
  const opportunityPrivileges = opportunity?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const communityPrivileges = opportunity?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const permissions = useMemo(() => {
    return {
      canEdit: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      projectWrite: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      editPost: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      editActorGroup: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      editActors: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      removeRelations: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      communityReadAccess: communityPrivileges.includes(AuthorizationPrivilege.Read),
      opportunityReadAccess: opportunityPrivileges?.includes(AuthorizationPrivilege.Read),
      readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
    };
  }, [opportunityPrivileges, communityPrivileges, user]);

  const { activities, loading: activityLoading } = useActivityOnCollaboration(collaborationID, {
    skipCondition: !permissions.opportunityReadAccess || !permissions.readUsers,
  });

  const { profile, collaboration, metrics = [] } = opportunity ?? {};
  const relations = useMemo(() => collaboration?.relations ?? [], [collaboration?.relations]);
  // const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const { references } = profile ?? {};
  const posts = getPostsFromPublishedCallouts(collaboration?.callouts).slice(0, 2);
  const whiteboards = getWhiteboardsFromPublishedCallouts(collaboration?.callouts).slice(0, 2);
  // const actorGroupTypes = config?.configuration.template.opportunities[0].actorGroups ?? [];

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];
  const isMemberOfOpportunity = !!relations.find(r => r.actorName === userName);

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);

  const existingPostNames = posts?.map(post => replaceAll('_', ' ', post.profile.displayName)) || [];
  // const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = []; // actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const postsCount = usePostsCount(metrics);

  const whiteboardsCount = useWhiteboardsCount(metrics);

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (opportunity?.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(opportunity?.community, { memberUsersCount });

  const topCallouts = collaboration?.callouts?.slice(0, 3);

  const communityId = opportunity?.community?.id;

  const [sendMessageToCommunityLeads] = useSendMessageToCommunityLeadsMutation();
  const handleSendMessageToCommunityLeads = useCallback(
    async (messageText: string) => {
      if (!communityId) {
        throw new Error('Community not loaded.');
      }

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
          spaceId,
          spaceNameId,
          challengeNameId,
          opportunity,
          url: opportunity && buildAdminOpportunityUrl(spaceNameId, challengeNameId, opportunity.nameID),
          meme,
          links,
          permissions: {
            ...permissions,
            isMemberOfOpportunity,
            isNoRelations,
            isAuthenticated,
          },
          hideMeme,
          showInterestModal,
          showActorGroupModal,
          availableActorGroupNames,
          existingPostNames,
          relations: {
            incoming,
            outgoing,
          },
          posts,
          postsCount,
          whiteboards,
          whiteboardsCount,
          references,
          ...contributors,
          activities,
          topCallouts,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
        },
        {
          loading: loadingOpportunity,
          error: errorOpportunity,
          activityLoading,
        },
        {
          onMemeError: () => setHideMeme(true),
          onInterestOpen: () => setShowInterestModal(true),
          onInterestClose: () => setShowInterestModal(false),
          onAddActorGroupOpen: () => setShowActorGroupModal(true),
          onAddActorGroupClose: () => setShowActorGroupModal(false),
        }
      )}
    </>
  );
};

export default OpportunityPageContainer;
