import { ApolloError } from '@apollo/client';
import { FC, useCallback, useMemo, useState } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { useUserContext } from '../../../community/contributor/user';
import {
  useOpportunityPageQuery,
  usePlatformLevelAuthorizationQuery,
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
import { useAspectsCount } from '../../../collaboration/aspect/utils/aspectsCount';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import { useCanvasesCount } from '../../../collaboration/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../../collaboration/callout/utils/getPublishedCallouts';
import {
  AspectFragmentWithCallout,
  CanvasFragmentWithCallout,
} from '../../../collaboration/callout/useCallouts/useCallouts';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';

export interface OpportunityContainerEntities extends EntityDashboardContributors {
  hubId: string;
  hubNameId: string;
  challengeNameId: string;
  opportunity: OpportunityPageFragment | undefined;
  permissions: {
    canEdit: boolean;
    projectWrite: boolean;
    editAspect: boolean;
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
  existingAspectNames: string[];
  relations: {
    incoming: OpportunityPageRelationsFragment[];
    outgoing: OpportunityPageRelationsFragment[];
  };
  aspects: AspectFragmentWithCallout[];
  aspectsCount: number | undefined;
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
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

// todo: Do cleanup when the aspect are extended further
const OpportunityPageContainer: FC<OpportunityPageContainerProps> = ({ children }) => {
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
  // TODO don't use context, fetch all the data with a query
  const { hubId, hubNameId, challengeNameId, opportunityNameId } = useOpportunity();

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();

  const userName = user?.user.profile.displayName;

  const {
    data: query,
    loading: loadingOpportunity,
    error: errorOpportunity,
  } = useOpportunityPageQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });

  const opportunity = query?.hub.opportunity;
  const collaborationID = opportunity?.collaboration?.id;
  const opportunityPrivileges = opportunity?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const communityPrivileges = opportunity?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const { data: platformPrivilegesData } = usePlatformLevelAuthorizationQuery();
  const platformPrivileges = platformPrivilegesData?.authorization.myPrivileges ?? NO_PRIVILEGES;

  const permissions = useMemo(() => {
    return {
      canEdit: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      projectWrite: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      editAspect: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      editActorGroup: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      editActors: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      removeRelations: opportunityPrivileges?.includes(AuthorizationPrivilege.Update),
      communityReadAccess: communityPrivileges.includes(AuthorizationPrivilege.Read),
      opportunityReadAccess: opportunityPrivileges?.includes(AuthorizationPrivilege.Read),
      readUsers: platformPrivileges.includes(AuthorizationPrivilege.ReadUsers),
    };
  }, [opportunityPrivileges, communityPrivileges, platformPrivileges]);

  const { activities, loading: activityLoading } = useActivityOnCollaboration(
    collaborationID,
    [],
    !permissions.opportunityReadAccess || !permissions.readUsers
  );

  const { context, profile, collaboration, metrics = [] } = opportunity ?? {};
  const relations = useMemo(() => collaboration?.relations ?? [], [collaboration?.relations]);
  // const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const { recommendations } = context ?? {};
  const { references } = profile ?? {};
  const aspects = getAspectsFromPublishedCallouts(collaboration?.callouts).slice(0, 2);
  const canvases = getCanvasesFromPublishedCallouts(collaboration?.callouts).slice(0, 2);
  // const actorGroupTypes = config?.configuration.template.opportunities[0].actorGroups ?? [];

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];
  const isMemberOfOpportunity = !!relations.find(r => r.actorName === userName);

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);

  const existingAspectNames = aspects?.map(aspect => replaceAll('_', ' ', aspect.profile.displayName)) || [];
  // const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = []; // actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const aspectsCount = useAspectsCount(metrics);

  const canvasesCount = useCanvasesCount(metrics);

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
          hubId,
          hubNameId,
          challengeNameId,
          opportunity,
          url: opportunity && buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunity.nameID),
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
          existingAspectNames,
          relations: {
            incoming,
            outgoing,
          },
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          references,
          recommendations,
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
