import {
  ContentPasteOutlined,
  DashboardOutlined,
  ForumOutlined,
  GroupOutlined,
  SettingsOutlined,
  TocOutlined,
  WbIncandescentOutlined,
} from '@mui/icons-material';
import { Box, Tabs } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
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
  // entities?: EcoverseContainerEntities;
}

const EcoverseTabsNew: FC<EcoverseTabsProps> = () => {
  const { t } = useTranslation();
  const resolved = useResolvedPath('.');
  const matchPatterns = useMemo(
    () => Object.values(routes).map(x => resolvePath(x, resolved.pathname)?.pathname),
    [routes, resolved, resolvePath]
  );

  const routeMatch = useRouteMatch(matchPatterns);
  const currentTab = routeMatch?.pattern?.path;

  const { ecoverseNameId, permissions } = useEcoverse();
  const { isFeatureEnabled } = useConfig();

  const communityReadAccess = true;
  const challengesReadAccess = true;

  return (
    <>
      <Tabs
        value={currentTab}
        aria-label="Ecoverse tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          value={resolvePath('dashboard', resolved.pathname)?.pathname}
          to={'dashboard'}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          value={resolvePath('context', resolved.pathname)?.pathname}
          to={'context'}
        />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          value={resolvePath('community', resolved.pathname)?.pathname}
          to={'community'}
        />
        <NavigationTab
          disabled={!challengesReadAccess}
          icon={<ContentPasteOutlined />}
          label={t('common.challenges')}
          value={resolvePath('challenges', resolved.pathname)?.pathname}
          to={'challenges'}
        />
        disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
        <NavigationTab
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          value={resolvePath(routes['discussions'], resolved.pathname)?.pathname}
          to={routes['discussions']}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          value={resolvePath('canvases', resolved.pathname)?.pathname}
          to={'canvases'}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={resolvePath('settings', resolved.pathname)?.pathname}
            to={buildAdminEcoverseUrl(ecoverseNameId)}
          />
        )}
      </Tabs>
      <Box paddingTop={3} />
      <Outlet />
    </>
  );
};

export default EcoverseTabsNew;
