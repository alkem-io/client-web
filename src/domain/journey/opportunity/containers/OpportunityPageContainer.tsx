import { ApolloError } from '@apollo/client';
import { FC, useCallback, useMemo, useState } from 'react';
import { useUserContext } from '../../../community/user';
import {
  useOpportunityPageQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  ActivityEventType,
  AuthorizationPrivilege,
  CalloutGroupName,
  DashboardTopCalloutFragment,
  OpportunityPageFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ActivityLogResultType } from '../../../collaboration/activity/ActivityLog/ActivityComponent';
import useActivityOnCollaboration from '../../../collaboration/activity/useActivityLogOnCollaboration/useActivityOnCollaboration';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, TOP_CALLOUTS_LIMIT } from '../../common/journeyDashboard/constants';

export interface OpportunityContainerEntities extends EntityDashboardContributors {
  opportunity: OpportunityPageFragment | undefined;
  permissions: {
    canEdit: boolean;
    projectWrite: boolean;
    editPost: boolean;
    editActorGroup: boolean;
    editActors: boolean;
    removeRelations: boolean;
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
  extends ContainerChildProps<OpportunityContainerEntities, OpportunityContainerActions, OpportunityContainerState> {
  opportunityId: string | undefined;
}

const NO_PRIVILEGES = [];

// todo: Do cleanup when the post are extended further
const OpportunityPageContainer: FC<OpportunityPageContainerProps> = ({ opportunityId, children }) => {
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();

  const {
    data: query,
    loading: loadingOpportunity,
    error: errorOpportunity,
  } = useOpportunityPageQuery({
    variables: { opportunityId: opportunityId! },
    skip: !opportunityId,
    errorPolicy: 'all',
  });

  const opportunity = query?.lookup.opportunity;
  const collaborationID = opportunity?.collaboration?.id;
  const opportunityPrivileges = opportunity?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const communityPrivileges = opportunity?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const timelineReadAccess = (opportunity?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );
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

  const activityTypes = Object.values(ActivityEventType).filter(
    activityType => activityType !== ActivityEventType.CalloutWhiteboardContentModified
  );

  const {
    activities,
    loading: activityLoading,
    fetchMoreActivities,
  } = useActivityOnCollaboration(collaborationID, {
    skip: !permissions.opportunityReadAccess || !permissions.readUsers,
    types: activityTypes,
    limit: RECENT_ACTIVITIES_LIMIT_INITIAL,
  });

  const { profile, collaboration, metrics = [] } = opportunity ?? {};

  const { references } = profile ?? {};

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];

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
    journeyId: opportunityId,
    journeyTypeName: 'opportunity',
    groupNames: [CalloutGroupName.Home_1, CalloutGroupName.Home_2],
  });

  return (
    <>
      {children(
        {
          opportunity,
          url: `admin/${opportunity?.profile.url}`, //opportunity && buildAdminOpportunityUrl(spaceNameId, challengeNameId, opportunity.nameID),
          meme,
          links,
          permissions: {
            ...permissions,
            isAuthenticated,
          },
          hideMeme,
          showInterestModal,
          showActorGroupModal,
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
