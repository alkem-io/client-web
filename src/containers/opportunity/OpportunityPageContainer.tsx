import { ApolloError } from '@apollo/client';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useOpportunity, useUserContext } from '../../hooks';
import { useOpportunityPageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Discussion } from '../../domain/communication/discussion/models/discussion';
import { OpportunityProject } from '../../models/entities/opportunity';
import {
  AuthorizationCredential,
  AuthorizationPrivilege,
  OpportunityPageFragment,
  OpportunityPageRelationsFragment,
  Project,
  Reference,
} from '../../models/graphql-schema';
import { replaceAll } from '../../common/utils/replaceAll';
import { buildAdminOpportunityUrl } from '../../common/utils/urlBuilders';
import { useAspectsCount } from '../../domain/collaboration/aspect/utils/aspectsCount';
import useCommunityMembersAsCardProps from '../../domain/community/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../domain/community/community/EntityDashboardContributorsSection/Types';
import { useCanvasesCount } from '../../domain/collaboration/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../domain/collaboration/callout/utils/getPublishedCallouts';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../domain/collaboration/callout/useCallouts';
import { useAuthenticationContext } from '../../core/auth/authentication/hooks/useAuthenticationContext';
import { ActivityLogResultType } from '../../domain/shared/components/ActivityLog/ActivityComponent';
import { useActivityOnCollaboration } from '../../domain/shared/components/ActivityLog/hooks/useActivityOnCollaboration';

export interface OpportunityContainerEntities extends EntityDashboardContributors {
  hubId: string;
  opportunity: OpportunityPageFragment;
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
  url: string;
  meme?: Reference;
  links: Reference[];
  opportunityProjects: OpportunityProject[];
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
  activities: ActivityLogResultType[] | undefined;
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
  extends ContainerChildProps<OpportunityContainerEntities, OpportunityContainerActions, OpportunityContainerState> {}

// todo: Do cleanup when the aspect are extended further
const OpportunityPageContainer: FC<OpportunityPageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
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

  const opportunity = useMemo(
    () => (query?.hub.opportunity ?? {}) as OpportunityPageFragment,
    [query?.hub.opportunity]
  );
  const collaborationID = opportunity?.collaboration?.id;

  const { activities } = useActivityOnCollaboration(collaborationID);

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

  const { context, collaboration, metrics = [] } = opportunity;
  const relations = useMemo(() => collaboration?.relations ?? [], [collaboration?.relations]);
  // const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const { references } = context ?? {};
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

  const onProjectTransition = useCallback(
    (project?: any) => {
      navigate(project?.nameID ?? 'new');
    },
    [navigate]
  );

  const opportunityProjects = useMemo(() => {
    // Note: Projects are removed from the graphql query until we add them back in properly.
    const projectList: OpportunityProject[] = ([] as Project[]).map(p => ({
      title: p.displayName,
      description: p.description,
      type: 'display',
      onSelect: () => onProjectTransition(p),
    }));
    projectList.push({
      title: t('pages.opportunity.sections.projects.more-projects'),
      type: 'more',
    });

    if (permissions.projectWrite) {
      projectList.push({
        title: t('pages.opportunity.sections.projects.new-project.header'),
        type: 'add',
        onSelect: () => onProjectTransition(),
      });
    }

    return projectList;
  }, [onProjectTransition, permissions.projectWrite, t]);

  const aspectsCount = useAspectsCount(metrics);

  const canvasesCount = useCanvasesCount(metrics);

  const contributors = useCommunityMembersAsCardProps(opportunity?.community);

  return (
    <>
      {children(
        {
          hubId,
          opportunity,
          url: buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunity.nameID),
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
          opportunityProjects,
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
          activities,
          ...contributors,
        },
        {
          loading: loadingOpportunity, // || loadingDiscussions,
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
