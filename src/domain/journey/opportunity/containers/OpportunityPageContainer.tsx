import { ApolloError } from '@apollo/client';
import { FC, useCallback, useMemo, useState } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { useUserContext } from '../../../community/user';
import {
  useOpportunityPageQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  AuthorizationPrivilege,
  CalloutDisplayLocation,
  DashboardTopCalloutFragment,
  OpportunityPageFragment,
  OpportunityPageRelationsFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import { buildAdminOpportunityUrl } from '../../../../main/routing/urlBuilders';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, TOP_CALLOUTS_LIMIT } from '../../common/journeyDashboard/constants';

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
    timelineReadAccess: boolean;
  };
  hideMeme: boolean;
  showInterestModal: boolean;
  showActorGroupModal: boolean;
  url: string | undefined;
  meme?: Reference;
  links: Reference[];
  availableActorGroupNames: string[];
  relations: {
    incoming: OpportunityPageRelationsFragment[];
    outgoing: OpportunityPageRelationsFragment[];
  };
  references: Reference[] | undefined;
  activities: ActivityLogResultType[] | undefined;
  fetchMoreActivities: (limit: number) => void;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  callouts: UseCalloutsProvided;
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
  const timelineReadAccess = (
    query?.space.opportunity?.collaboration?.timeline?.authorization?.myPrivileges ?? []
  ).includes(AuthorizationPrivilege.Read);
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
      timelineReadAccess,
    };
  }, [opportunityPrivileges, communityPrivileges, user]);

  const {
    activities,
    loading: activityLoading,
    fetchMoreActivities,
  } = useActivityOnCollaboration(collaborationID, {
    skip: !permissions.opportunityReadAccess || !permissions.readUsers,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const { profile, collaboration, metrics = [] } = opportunity ?? {};
  const relations = useMemo(() => collaboration?.relations ?? [], [collaboration?.relations]);
  // const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const { references } = profile ?? {};

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];
  const isMemberOfOpportunity = !!relations.find(r => r.actorName === userName);

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);

  // const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = []; // actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (opportunity?.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(opportunity?.community, { memberUsersCount });

  const topCallouts = collaboration?.callouts?.slice(0, TOP_CALLOUTS_LIMIT);

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

  const callouts = useCallouts({
    spaceNameId,
    opportunityNameId,
    displayLocations: [CalloutDisplayLocation.HomeLeft, CalloutDisplayLocation.HomeRight],
  });

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
          relations: {
            incoming,
            outgoing,
          },
          references,
          ...contributors,
          activities,
          fetchMoreActivities,
          topCallouts,
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
          callouts,
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
