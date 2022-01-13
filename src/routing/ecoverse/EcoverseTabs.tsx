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
import { Outlet, useMatch } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { RouterLink } from '../../components/core/RouterLink';
import { EcoverseContainerEntities } from '../../containers/ecoverse/EcoversePageContainer';
import { useConfig, useEcoverse } from '../../hooks';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminEcoverseUrl } from '../../utils/urlBuilders';
import { nameOfUrl } from '../url-params';

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
  // children: (e: {
  //   pathGetter: (key: keyof typeof routes) => string;
  //   urlGetter: (key: keyof typeof routes) => string;
  //   tabName: string;
  //   tabNames: EcoverseRoutesType;
  // }) => React.ReactNode;
  // entities?: EcoverseContainerEntities;
}
const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

const EcoverseTabs: FC<EcoverseTabsProps> = () => {
  const url = '';
  const path = '';
  const { t } = useTranslation();
  const match = useMatch(`:${nameOfUrl.ecoverseNameId}`);
  debugger;
  // const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { ecoverseNameId, permissions } = useEcoverse();
  const urlGetter = useMemo(() => createGetter(routes, url), [url]);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  const { isFeatureEnabled } = useConfig();

  // const { permissions: pagePermissions } = entities;
  // const { communityReadAccess, challengesReadAccess } = pagePermissions;
  const communityReadAccess = true;
  const challengesReadAccess = true;

  const tabNames = (Object.keys(routes) as Array<keyof EcoverseRoutesType>).reduce<EcoverseRoutesType>((acc, curr) => {
    acc[curr] = pathGetter(curr);
    return acc;
  }, {} as EcoverseRoutesType);

  // TODO fix tab value.
  return (
    <>
      <Tabs
        value={'match?.path'}
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
          to={'dashboard'}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          component={RouterLink}
          value={pathGetter('context')}
          to={'context'}
        />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          component={RouterLink}
          value={pathGetter('community')}
          to={'community'}
        />
        <NavigationTab
          disabled={!challengesReadAccess}
          icon={<ContentPasteOutlined />}
          label={t('common.challenges')}
          component={RouterLink}
          value={pathGetter('challenges')}
          to={'challenges'}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          component={RouterLink}
          value={pathGetter('discussions')}
          to={'discussions'}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          component={RouterLink}
          value={pathGetter('canvases')}
          to={'canvases'}
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
      <Outlet />
    </>
  );
};

export default EcoverseTabs;
