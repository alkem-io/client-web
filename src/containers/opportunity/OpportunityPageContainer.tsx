import { ApolloError } from '@apollo/client';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useOpportunity, useUserContext } from '../../hooks';
import { useOpportunityPageQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Discussion } from '../../models/discussion/discussion';
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
import { useAspectsCount } from '../../domain/aspect/utils/aspectsCount';
import useCommunityMembersAsCardProps from '../../domain/community/utils/useCommunityMembersAsCardProps';
import { EntityDashboardContributors } from '../../domain/community/EntityDashboardContributorsSection/Types';
import { useCanvasesCount } from '../../domain/canvas/utils/canvasesCount';
import {
  getAspectsFromPublishedCallouts,
  getCanvasesFromPublishedCallouts,
} from '../../domain/callout/utils/getPublishedCallouts';
import { AspectFragmentWithCallout, CanvasFragmentWithCallout } from '../../domain/callout/useCallouts';
import { useAuthenticationContext } from '../../core/auth/authentication/hooks/useAuthenticationContext';

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

  const opportunity = (query?.hub.opportunity ?? {}) as OpportunityPageFragment;

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

  const { context, collaboration, activity = [] } = opportunity;
  // Note: Projects are removed from the graphql query until we add them back in properly.
  const projects: Project[] = [];
  const relations = collaboration?.relations ?? [];
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

  const onProjectTransition = (project?: any) => {
    navigate(project?.nameID ?? 'new');
  };

  const opportunityProjects = useMemo(() => {
    const projectList: OpportunityProject[] = projects.map(p => ({
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
  }, [projects, onProjectTransition, permissions.projectWrite, t]);

  const aspectsCount = useAspectsCount(activity);

  const canvasesCount = useCanvasesCount(activity);

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
