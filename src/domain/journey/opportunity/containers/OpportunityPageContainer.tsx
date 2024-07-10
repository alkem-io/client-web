import { ApolloError } from '@apollo/client';
import { FC, useCallback, useMemo, useState } from 'react';
import { useUserContext } from '../../../community/user';
import {
  useLegacySubspaceDashboardPageQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import {
  AuthorizationPrivilege,
  CalloutGroupName,
  Reference,
  SubspacePageFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import useCommunityMembersAsCardProps from '../../../community/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../../community/community/EntityDashboardContributorsSection/Types';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricType } from '../../../platform/metrics/MetricType';
import useCanReadSpace from '../../common/authorization/useCanReadSpace';

export interface OpportunityContainerEntities extends EntityDashboardContributors {
  subsubspace: SubspacePageFragment | undefined;
  permissions: {
    canEdit: boolean;
    projectWrite: boolean;
    editPost: boolean;
    editActorGroup: boolean;
    editActors: boolean;
    removeRelations: boolean;
    isAuthenticated: boolean;
    communityReadAccess: boolean;
    subsubspaceReadAccess: boolean;
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
  const { canReadCommunity } = useCanReadSpace({ spaceId: opportunityId });

  const {
    data: query,
    loading: loadingOpportunity,
    error: errorOpportunity,
  } = useLegacySubspaceDashboardPageQuery({
    variables: {
      subspaceId: opportunityId!,
      authorizedReadAccessCommunity: canReadCommunity,
    },
    skip: !opportunityId,
    errorPolicy: 'all',
  });

  const subsubspace = query?.lookup.space;
  const opportunityPrivileges = subsubspace?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const communityPrivileges = subsubspace?.community?.authorization?.myPrivileges ?? NO_PRIVILEGES;
  const timelineReadAccess = (subsubspace?.collaboration?.timeline?.authorization?.myPrivileges ?? []).includes(
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
      subsubspaceReadAccess: opportunityPrivileges?.includes(AuthorizationPrivilege.Read),
      readUsers: user?.hasPlatformPrivilege(AuthorizationPrivilege.ReadUsers) ?? false,
      timelineReadAccess,
    };
  }, [opportunityPrivileges, communityPrivileges, user]);

  const { profile, metrics = [] } = subsubspace ?? {};

  const { references } = profile ?? {};

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];

  const membersCount = getMetricCount(metrics, MetricType.Member);
  const memberUsersCount = membersCount - (subsubspace?.community?.memberOrganizations?.length ?? 0);
  const contributors = useCommunityMembersAsCardProps(subsubspace?.community, { memberUsersCount });

  const communityId = subsubspace?.community?.id;

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
    journeyTypeName: 'subsubspace',
    groupNames: [CalloutGroupName.Home],
  });

  return (
    <>
      {children(
        {
          subsubspace,
          url: `admin/${subsubspace?.profile.url}`, //opportunity && buildAdminOpportunityUrl(spaceNameId, challengeNameId, opportunity.nameID),
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
          sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
          callouts,
        },
        {
          loading: loadingOpportunity,
          error: errorOpportunity,
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
