import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useEcoverse, useUserContext } from '../../hooks';
import { useEcoversePageProjectsQuery, useEcoversePageQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Project } from '../../models/Project';
import { AspectCardFragment, AuthorizationPrivilege, EcoversePageFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildProjectUrl } from '../../utils/urlBuilders';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { Discussion } from '../../models/discussion/discussion';

export interface EcoverseContainerEntities {
  ecoverse?: EcoversePageFragment;
  isPrivate: boolean;
  permissions: {
    canEdit: boolean;
    communityReadAccess: boolean;
    challengesReadAccess: boolean;
  };
  projects: Project[];
  aspects: AspectCardFragment[];
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
  const { ecoverseId, ecoverseNameId, loading: loadingEcoverse } = useEcoverse();
  const { data: _ecoverse, loading: loadingEcoverseQuery } = useEcoversePageQuery({
    variables: { ecoverseId: ecoverseNameId },
    errorPolicy: 'all',
  });
  const { discussionList, loading: loadingDiscussions } = useDiscussionsContext();

  const { user, isAuthenticated } = useUserContext();

  const communityReadAccess = (_ecoverse?.ecoverse?.community?.authorization?.myPrivileges ?? []).some(
    x => x === AuthorizationPrivilege.Read
  );

  const { data: _projects, loading: loadingProjects } = useEcoversePageProjectsQuery({
    variables: { ecoverseId: ecoverseNameId },
  });

  const projects = useMemo(() => {
    const result =
      _projects?.ecoverse.challenges?.flatMap(
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
                    onSelect: () => navigate(buildProjectUrl(ecoverseNameId, c.nameID, o.nameID, p.nameID)),
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
    const _activity = _ecoverse?.ecoverse.activity || [];
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
  }, [_ecoverse]);

  const isMember = user?.ofEcoverse(ecoverseId) ?? false;
  const isGlobalAdmin = user?.isGlobalAdmin ?? false;
  const isPrivate = !(_ecoverse?.ecoverse?.authorization?.anonymousReadAccess ?? true);

  const permissions = {
    canEdit: user?.isEcoverseAdmin(ecoverseId) || false,
    communityReadAccess,
    // todo: use privileges instead when authorization on challenges is public
    challengesReadAccess: isPrivate ? isMember || isGlobalAdmin : true,
  };

  const aspects = _ecoverse?.ecoverse?.context?.aspects ?? [];

  return (
    <>
      {children(
        {
          ecoverse: _ecoverse?.ecoverse,
          discussionList,
          isPrivate,
          permissions,
          activity,
          projects,
          isAuthenticated,
          isMember,
          isGlobalAdmin,
          aspects,
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
