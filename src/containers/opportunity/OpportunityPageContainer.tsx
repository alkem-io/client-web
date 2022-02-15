import { ApolloError } from '@apollo/client';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useResolvedPath } from 'react-router-dom';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useAuthenticationContext, useOpportunity, useUserContext } from '../../hooks';
import { useOpportunityPageQuery, useOpportunityTemplateQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Discussion } from '../../models/discussion/discussion';
import { OpportunityProject } from '../../models/entities/opportunity';
import {
  AspectCardFragment,
  AuthorizationCredential,
  AuthorizationPrivilege,
  OpportunityPageFragment,
  Reference,
} from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { replaceAll } from '../../utils/replaceAll';
import { buildAdminOpportunityUrl } from '../../utils/urlBuilders';

export interface OpportunityContainerEntities {
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
    isAspectAddAllowed: boolean;
    isAuthenticated: boolean;
    communityReadAccess: boolean;
  };
  hideMeme: boolean;
  showInterestModal: boolean;
  showActorGroupModal: boolean;
  url: string;
  meme?: Reference;
  links: Reference[];
  activity: ActivityItem[];
  opportunityProjects: OpportunityProject[];
  availableActorGroupNames: string[];
  existingAspectNames: string[];
  relations: {
    incoming: OpportunityPageFragment['relations'];
    outgoing: OpportunityPageFragment['relations'];
  };
  discussions: Discussion[];
  aspects: AspectCardFragment[];
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
  extends ContainerProps<OpportunityContainerEntities, OpportunityContainerActions, OpportunityContainerState> {}

// todo: Do cleanup when the aspect are extended further
const OpportunityPageContainer: FC<OpportunityPageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { pathname: url } = useResolvedPath('.');
  const [hideMeme, setHideMeme] = useState<boolean>(false);
  const [showInterestModal, setShowInterestModal] = useState<boolean>(false);
  const [showActorGroupModal, setShowActorGroupModal] = useState<boolean>(false);
  const { ecoverseId, ecoverseNameId, challengeId, challengeNameId, opportunityId, opportunityNameId } =
    useOpportunity();

  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();

  const userName = user?.user.displayName;

  const {
    data: query,
    loading: loadingOpportunity,
    error: errorOpportunity,
  } = useOpportunityPageQuery({
    variables: { ecoverseId: ecoverseNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });

  const opportunity = (query?.ecoverse.opportunity ?? {}) as OpportunityPageFragment;

  const permissions = useMemo(() => {
    const isAdmin = user?.isOpportunityAdmin(ecoverseId, challengeId, opportunityId) || false;
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
  }, [user, opportunity, ecoverseId, challengeId, opportunityId]);

  const { context, projects = [], relations = [], activity: _activity = [] } = opportunity;
  // const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const { references = [], aspects = [] } = context ?? {};

  const { data: config, loading: loadingTemplate, error: errorTemplate } = useOpportunityTemplateQuery();
  const aspectsTypes = config?.configuration.template.opportunities[0].aspects ?? [];
  // const actorGroupTypes = config?.configuration.template.opportunities[0].actorGroups ?? [];

  const meme = references?.find(x => x.name === 'meme') as Reference;
  const links = (references?.filter(x => ['poster', 'meme'].indexOf(x.name) === -1) ?? []) as Reference[];
  const isMemberOfOpportunity = !!relations.find(r => r.actorName === userName);

  const incoming = useMemo(() => relations.filter(x => x.type === 'incoming'), [relations]);
  const outgoing = useMemo(() => relations.filter(x => x.type === 'outgoing'), [relations]);
  const isNoRelations = !(incoming && incoming.length > 0) && !(outgoing && outgoing.length > 0);

  const existingAspectNames = aspects?.map(a => replaceAll('_', ' ', a.displayName)) || [];
  const isAspectAddAllowed = permissions.editAspect && aspectsTypes && aspectsTypes.length > existingAspectNames.length;
  // const existingActorGroupTypes = actorGroups?.map(ag => ag.name);
  const availableActorGroupNames = []; // actorGroupTypes?.filter(ag => !existingActorGroupTypes?.includes(ag)) || [];

  const onProjectTransition = (project?: any) => {
    navigate(`${url}/projects/${project?.nameID ?? 'new'}`, { replace: true });
  };

  // const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();

  const activity: ActivityItem[] = useMemo(() => {
    return [
      {
        name: t('pages.activity.projects'),
        digit: getActivityCount(_activity, 'projects') || 0,
        color: 'positive',
      },
      {
        name: t('pages.activity.interests'),
        digit: getActivityCount(_activity, 'relations') || 0,
        color: 'primary',
      },
      {
        name: t('pages.activity.members'),
        digit: getActivityCount(_activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ];
  }, [_activity]);

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

  return (
    <>
      {children(
        {
          opportunity,
          url: buildAdminOpportunityUrl(ecoverseNameId, challengeNameId, opportunity.nameID),
          activity,
          meme,
          links,
          permissions: {
            ...permissions,
            isMemberOfOpportunity,
            isNoRelations,
            isAspectAddAllowed,
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
        },
        {
          loading: loadingOpportunity || loadingTemplate, // || loadingDiscussions,
          error: errorOpportunity || errorTemplate,
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
