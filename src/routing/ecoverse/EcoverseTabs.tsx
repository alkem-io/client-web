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
import { useRouteMatch } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { RouterLink } from '../../components/core/RouterLink';
import { EcoverseContainerEntities } from '../../containers/ecoverse/EcoversePageContainer';
import { useEcoverse } from '../../hooks';
import { buildAdminEcoverseUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: '/community/discussions',
  community: '/community',
  dashboard: '/dashboard',
  challenges: '/challenges',
  canvases: '/canvases',
  settings: '/settings',
  context: '/context',
  root: '/',
};

export type EcoverseRoutesType = typeof routes;

export interface EcoverseTabsProps {
  children: (e: {
    pathGetter: (key: keyof typeof routes) => string;
    urlGetter: (key: keyof typeof routes) => string;
    tabName: string;
    tabNames: EcoverseRoutesType;
  }) => React.ReactNode;
  entities: EcoverseContainerEntities;
}
const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

const EcoverseTabs: FC<EcoverseTabsProps> = ({ entities, children }) => {
  const { path, url } = useRouteMatch();
  const { t } = useTranslation();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { ecoverseNameId, permissions } = useEcoverse();
  const urlGetter = useMemo(() => createGetter(routes, url), [url]);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);

  const { isAuthenticated, hideChallenges } = entities;

  const tabNames = (Object.keys(routes) as Array<keyof EcoverseRoutesType>).reduce<EcoverseRoutesType>((acc, curr) => {
    acc[curr] = pathGetter(curr);
    return acc;
  }, {} as EcoverseRoutesType);

  return (
    <>
      <Tabs
        value={match?.path}
        aria-label="Ecoverse tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
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
        {isAuthenticated && (
          <NavigationTab
            disabled={!isAuthenticated}
            icon={<GroupOutlined />}
            label={t('common.community')}
            component={RouterLink}
            value={pathGetter('community')}
            to={urlGetter('community')}
          />
        )}
        {!hideChallenges && (
          <NavigationTab
            disabled={hideChallenges}
            icon={<ContentPasteOutlined />}
            label={t('common.challenges')}
            component={RouterLink}
            value={pathGetter('challenges')}
            to={urlGetter('challenges')}
          />
        )}
        {isAuthenticated && (
          <NavigationTab
            disabled={!isAuthenticated}
            icon={<ForumOutlined />}
            label={t('common.discussions')}
            component={RouterLink}
            value={pathGetter('discussions')}
            to={urlGetter('discussions')}
          />
        )}
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
            to={buildAdminEcoverseUrl(ecoverseNameId)}
          />
        )}
      </Tabs>
      {children({ pathGetter, urlGetter, tabName: match?.path || 'dashboard', tabNames })}
    </>
  );
};

export default EcoverseTabs;
