import {
  ContentPasteOutlined,
  DashboardOutlined,
  ForumOutlined,
  GroupOutlined,
  SettingsOutlined,
  TocOutlined,
  WbIncandescentOutlined,
} from '@mui/icons-material';
import { Tabs } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { ChallengeContainerEntities } from '../../containers/challenge/ChallengePageContainer';
import { useChallenge, useConfig } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminChallengeUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: 'community/discussions',
  community: 'community',
  dashboard: 'dashboard',
  opportunities: 'opportunities',
  canvases: 'canvases',
  settings: 'settings',
  context: 'context',
};

export type ChallengeRoutesType = typeof routes;

export interface ChallengeTabsProps {
  children: (e: {
    pathGetter: (key: keyof typeof routes) => string;
    tabName: string;
    tabNames: ChallengeRoutesType;
  }) => React.ReactNode;
  entities: ChallengeContainerEntities;
}
const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

const ChallengeTabs: FC<ChallengeTabsProps> = ({ entities, children }) => {
  const { pathname: path } = useResolvedPath('.');
  const { t } = useTranslation();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { challengeNameId, ecoverseNameId, permissions } = useChallenge();
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  const { isFeatureEnabled } = useConfig();

  const tabNames = useMemo(
    () =>
      (Object.keys(routes) as Array<keyof ChallengeRoutesType>).reduce<ChallengeRoutesType>((acc, curr) => {
        acc[curr] = pathGetter(curr);
        return acc;
      }, {} as ChallengeRoutesType),
    [pathGetter]
  );

  console.log(tabNames);

  const { communityReadAccess } = entities.permissions;

  return (
    <>
      <Tabs value={match?.pathname} aria-label="Challenge tabs">
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          value={pathGetter('dashboard')}
          to={'dashboard'}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          value={pathGetter('context')}
          to={'context'}
        />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          value={pathGetter('community')}
          to={'community'}
        />
        <NavigationTab
          icon={<ContentPasteOutlined />}
          label={t('common.opportunities')}
          value={pathGetter('opportunities')}
          to={'opportunities'}
        />
        <NavigationTab
          icon={<ForumOutlined />}
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
          label={t('common.discussions')}
          value={pathGetter('discussions')}
          to={'discussions'}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          value={pathGetter('canvases')}
          to={'canvases'}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={pathGetter('settings')}
            to={buildAdminChallengeUrl(ecoverseNameId, challengeNameId)}
          />
        )}
      </Tabs>
      {children({ pathGetter, tabName: match?.pathname || 'dashboard', tabNames })}
    </>
  );
};

export default ChallengeTabs;
