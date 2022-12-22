import { ApolloError } from '@apollo/client';
import { FC, useMemo, useState } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { useUserContext } from '../../../community/contributor/user';
import { useOpportunityPageQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { Discussion } from '../../../communication/discussion/models/discussion';
import {
  AuthorizationCredential,
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
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../../collaboration/callout/useCallouts';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { ActivityLogResultType } from '../../../shared/components/ActivityLog/ActivityComponent';
import { useActivityOnCollaboration } from '../../../shared/components/ActivityLog/hooks/useActivityOnCollaboration';

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
  discussions: Discussion[];
  aspects: AspectFragmentWithCallout[];
  aspectsCount: number | undefined;
  canvases: CanvasFragmentWithCallout[];
  canvasesCount: number | undefined;
  references: Reference[] | undefined;
  recommendations: Reference[] | undefined;
  activities: ActivityLogResultType[] | undefined;
  topCallouts: DashboardTopCalloutFragment[] | undefined;
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

// todo: Do cleanup when the aspect are extended further
const OpportunityPageContainer: FC<OpportunityPageContainerProps> = ({ children }) => {
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
  // TODO don't use context, fetch all the data with a query
  const { hubId, hubNameId, challengeId, challengeNameId, opportunityId, opportunityNameId } = useOpportunity();

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();

  const userName = user?.user.displayName;

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

  const { activities, loading: activityLoading } = useActivityOnCollaboration(collaborationID);

  const permissions = useMemo(() => {
    const isAdmin = user?.isOpportunityAdmin(hubId, challengeId, opportunityId) || false;
    return {
      canEdit: isAdmin,
      projectWrite: isAdmin,
      editAspect: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
      editActorGroup: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
      editActors: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
      removeRelations: user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) || isAdmin,
      communityReadAccess: (opportunity?.community?.authorization?.myPrivileges ?? []).some(
        x => x === AuthorizationPrivilege.Read
      ),
    };
  }, [user, opportunity, hubId, challengeId, opportunityId]);

  const { context, collaboration, metrics = [] } = opportunity ?? {};
  const relations = useMemo(() => collaboration?.relations ?? [], [collaboration?.relations]);
  // const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const { references, recommendations } = context ?? {};
  const aspects = getAspectsFromPublishedCallouts(collaboration?.callouts).slice(0, 2);
  const canvases = getCanvasesFromPublishedCallouts(collaboration?.callouts).slice(0, 2);
  // const actorGroupTypes = config?.configuration.template.opportunities[0].actorGroups ?? [];

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];
  const isMemberOfOpportunity = !!relations.find(r => r.actorName === userName);

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);

  const existingAspectNames = aspects?.map(a => replaceAll('_', ' ', a.displayName)) || [];
  // const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = []; // actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const aspectsCount = useAspectsCount(metrics);

  const canvasesCount = useCanvasesCount(metrics);

  const contributors = useCommunityMembersAsCardProps(opportunity?.community);

  const topCallouts = collaboration?.callouts?.slice(0, 3);

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
          discussions: [], //discussionList,
          aspects,
          aspectsCount,
          canvases,
          canvasesCount,
          references,
          recommendations,
          ...contributors,
          activities,
          topCallouts,
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
