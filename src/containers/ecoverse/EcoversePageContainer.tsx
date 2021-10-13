import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import { useEcoverse, useUserContext } from '../../hooks';
import { useEcoversePageProjectsQuery, useEcoversePageQuery } from '../../hooks/generated/graphql';
import { Container } from '../../models/container';
import { Project } from '../../models/Project';
import { EcoversePageFragment } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildProjectUrl } from '../../utils/urlBuilders';

export interface EcoverseContainerEntities {
  ecoverse?: EcoversePageFragment;
  isPrivate: boolean;
  hideChallenges: boolean;
  permissions: {
    canEdit: boolean;
  };
  projects: Project[];
  activity: ActivityItem[];
  isAuthenticated: boolean;
  isMember: boolean;
  isGlobalAdmin: boolean;
}

export interface EcoverseContainerActions {}

export interface EcoverseContainerState {
  loading: boolean;
  loadingProjects: boolean;
  error?: ApolloError;
}

export interface EcoversePageContainerProps
  extends Container<EcoverseContainerEntities, EcoverseContainerActions, EcoverseContainerState> {}

export const EcoversePageContainer: FC<EcoversePageContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { ecoverseId, ecoverseNameId, loading } = useEcoverse();
  const { data: _ecoverse, loading: loadingEcoverse } = useEcoversePageQuery({
    variables: { ecoverseId: ecoverseNameId },
  });

  const { user, isAuthenticated } = useUserContext();

  const permissions = {
    canEdit: user?.isEcoverseAdmin(ecoverseId) || false,
  };

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
                    onSelect: () => history.replace(buildProjectUrl(ecoverseNameId, c.nameID, o.nameID, p.nameID)),
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
        name: t('pages.activity.projects'),
        digit: getActivityCount(_activity, 'projects') || 0,
        color: 'positive',
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
  const hideChallenges = isPrivate ? !isMember && !isGlobalAdmin : false;

  return (
    <>
      {children(
        {
          ecoverse: _ecoverse?.ecoverse,
          isPrivate,
          hideChallenges,
          permissions,
          activity,
          projects,
          isAuthenticated,
          isMember,
          isGlobalAdmin,
        },
        {
          loading: loading || loadingEcoverse,
          loadingProjects,
        },
        {}
      )}
    </>
  );
};
export default EcoversePageContainer;
