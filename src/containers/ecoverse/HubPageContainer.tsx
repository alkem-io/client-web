import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useEcoverse, useUserContext } from '../../hooks';
import { useEcoversePageProjectsQuery, useEcoversePageQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Project } from '../../models/Project';
import { AuthorizationPrivilege, EcoversePageFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildProjectUrl } from '../../utils/urlBuilders';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { Discussion } from '../../models/discussion/discussion';

export interface EcoverseContainerEntities {
  hub?: EcoversePageFragment;
  isPrivate: boolean;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    challengesReadAccess: boolean;
  };
  projects: Project[];
  activity: ActivityItem[];
  isAuthenticated: boolean;
  isMember: boolean;
  isGlobalAdmin: boolean;
  discussionList: Discussion[];
}

export interface EcoverseContainerActions {}

export interface EcoverseContainerState {
  loading: boolean;
  loadingProjects: boolean;
  error?: ApolloError;
}

export interface EcoversePageContainerProps
  extends ContainerProps<EcoverseContainerEntities, EcoverseContainerActions, EcoverseContainerState> {}

export const EcoversePageContainer: FC<EcoversePageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hubId, hubNameId, loading: loadingEcoverse } = useEcoverse();
  const { data: _hub, loading: loadingEcoverseQuery } = useEcoversePageQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
  });
  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();

  const { user, isAuthenticated } = useUserContext();

  const communityReadAccess = (_hub?.hub?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const { data: _projects, loading: loadingProjects } = useEcoversePageProjectsQuery({
    variables: { hubId: hubNameId },
  });

  const projects = useMemo(() => {
    const result =
      _projects?.hub.challenges?.flatMap(
        c =>
          c.opportunities?.flatMap(
            o =>
              o.projects?.map(
                p =>
                  ({
                    title: p.displayName || '',
                    description: p.description || '',
                    caption: c.displayName || '',
                    tag: { status: 'positive', text: p?.lifecycle?.state || '' },
                    type: 'display',
                    onSelect: () => navigate(buildProjectUrl(hubNameId, c.nameID, o.nameID, p.nameID)),
                  } as Project)
              ) || []
          ) || []
      ) || [];

    return [
      ...result,
      {
        title: t('pages.opportunity.sections.projects.more-projects'),
        type: 'more',
      } as Project,
    ];
  }, [_projects]);

  const activity: ActivityItem[] = useMemo(() => {
    const _activity = _hub?.hub.activity || [];
    return [
      {
        name: t('pages.activity.challenges'),
        digit: getActivityCount(_activity, 'challenges') || 0,
        color: 'neutral',
      },
      {
        name: t('pages.activity.opportunities'),
        digit: getActivityCount(_activity, 'opportunities') || 0,
        color: 'primary',
      },
      {
        name: t('pages.activity.members'),
        digit: getActivityCount(_activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ];
  }, [_hub]);

  const isMember = user?.ofEcoverse(hubId) ?? false;
  const isGlobalAdmin = user?.isGlobalAdmin ?? false;
  const isPrivate = !(_hub?.hub?.authorization?.anonymousReadAccess ?? true);

  const permissions = {
    canEdit: user?.isEcoverseAdmin(hubId) || false,
    communityReadAccess,
    // todo: use privileges instead when authorization on challenges is public
    challengesReadAccess: isPrivate ? isMember || isGlobalAdmin : true,
  };

  return (
    <>
      {children(
        {
          hub: _hub?.hub,
          discussionList,
          isPrivate,
          permissions,
          activity,
          projects,
          isAuthenticated,
          isMember,
          isGlobalAdmin,
        },
        {
          loading: loadingEcoverseQuery || loadingEcoverse || loadingDiscussions,
          loadingProjects,
        },
        {}
      )}
    </>
  );
};
export default EcoversePageContainer;
