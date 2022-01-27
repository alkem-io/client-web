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
import { EcoverseContainerEntities } from '../../containers/ecoverse/EcoversePageContainer';
import { useConfig, useEcoverse } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminEcoverseUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: 'community/discussions',
  community: 'community',
  dashboard: 'dashboard',
  challenges: 'challenges',
  canvases: 'canvases',
  settings: 'settings',
  context: 'context',
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
  // TODO use NavigationTabs and refactor the routing similar to the UserSettingsRoute.
  const { pathname: path } = useResolvedPath('./');

  const { t } = useTranslation();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}/*`));
  const { ecoverseNameId, permissions } = useEcoverse();
  const urlGetter = useMemo(() => createGetter(routes, ''), []);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  const { isFeatureEnabled } = useConfig();

  const { permissions: pagePermissions } = entities;
  const { communityReadAccess, challengesReadAccess } = pagePermissions;

  const tabNames = (Object.keys(routes) as Array<keyof EcoverseRoutesType>).reduce<EcoverseRoutesType>((acc, curr) => {
    acc[curr] = pathGetter(curr);
    return acc;
  }, {} as EcoverseRoutesType);

  return (
    <>
      <Tabs
        value={match?.pathnameBase}
        aria-label="Ecoverse tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          value={pathGetter('dashboard')}
          to={urlGetter('dashboard')}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          value={pathGetter('context')}
          to={urlGetter('context')}
        />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          value={pathGetter('community')}
          to={urlGetter('community')}
        />
        <NavigationTab
          disabled={!challengesReadAccess}
          icon={<ContentPasteOutlined />}
          label={t('common.challenges')}
          value={pathGetter('challenges')}
          to={urlGetter('challenges')}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          value={pathGetter('discussions')}
          to={urlGetter('discussions')}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          value={pathGetter('canvases')}
          to={urlGetter('canvases')}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={pathGetter('settings')}
            to={buildAdminEcoverseUrl(ecoverseNameId)}
          />
        )}
      </Tabs>
      {children({ pathGetter, urlGetter, tabName: match?.pathnameBase || 'dashboard', tabNames })}
    </>
  );
};

export default EcoverseTabs;
