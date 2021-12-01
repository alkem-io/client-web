import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
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
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { RouterLink } from '../../components/core/RouterLink';
import { useChallenge } from '../../hooks';
import { buildAdminChallengeUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: '/community/discussions',
  community: '/community',
  dashboard: '/dashboard',
  opportunities: '/opportunities',
  canvases: '/canvases',
  settings: '/settings',
  context: '/context',
  root: '/',
};

export type ChallengeRoutesType = typeof routes;

export interface ChallengeTabsProps {
  children: (e: {
    pathGetter: (key: keyof typeof routes) => string;
    urlGetter: (key: keyof typeof routes) => string;
    tabName: string;
    tabNames: ChallengeRoutesType;
  }) => React.ReactNode;
}
const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

const ChallengeTabs: FC<ChallengeTabsProps> = ({ children }) => {
  const { path, url } = useRouteMatch();
  const { t } = useTranslation();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { challengeNameId, ecoverseNameId, permissions } = useChallenge();
  const urlGetter = useMemo(() => createGetter(routes, url), [url]);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);

  const tabNames = (Object.keys(routes) as Array<keyof ChallengeRoutesType>).reduce<ChallengeRoutesType>(
    (acc, curr) => {
      acc[curr] = pathGetter(curr);
      return acc;
    },
    {} as ChallengeRoutesType
  );

  return (
    <>
      <Tabs value={match?.path} aria-label="Challenge tabs">
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          component={RouterLink}
          value={pathGetter('dashboard')}
          to={urlGetter('dashboard')}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          component={RouterLink}
          value={pathGetter('context')}
          to={urlGetter('context')}
        />
        <NavigationTab
          icon={<GroupOutlined />}
          label={t('common.community')}
          component={RouterLink}
          value={pathGetter('community')}
          to={urlGetter('community')}
        />
        <NavigationTab
          icon={<ContentPasteOutlined />}
          label={t('common.opportunities')}
          component={RouterLink}
          value={pathGetter('opportunities')}
          to={urlGetter('opportunities')}
        />
        <NavigationTab
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          component={RouterLink}
          value={pathGetter('discussions')}
          to={urlGetter('discussions')}
        />
        <NavigationTab
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          component={RouterLink}
          value={pathGetter('canvases')}
          to={urlGetter('canvases')}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            component={RouterLink}
            value={pathGetter('settings')}
            to={buildAdminChallengeUrl(ecoverseNameId, challengeNameId)}
          />
        )}
      </Tabs>
      {children({ pathGetter, urlGetter, tabName: match?.path || 'dashboard', tabNames })}
    </>
  );
};

export default ChallengeTabs;
