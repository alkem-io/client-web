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
import { useConfig, useHub } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminHubUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: 'discussions',
  discussion: 'discussions/:discussionId',
  community: 'community',
  dashboard: 'dashboard',
  challenges: 'challenges',
  canvases: 'canvases',
  settings: 'settings',
  context: 'context',
  contribute: 'contribute',
} as const;

type HubRoutesType = keyof typeof routes;

export interface HubTabsProps {
  communityReadAccess: boolean;
  challengesReadAccess: boolean;
}

// todo unify in one tab config component
const HubTabs: FC<HubTabsProps> = ({ communityReadAccess, challengesReadAccess }) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();
  const resolved = useResolvedPath('.');
  const matchPatterns = useMemo(
    () =>
      Object.values(routes).map(x => {
        const path = resolvePath(x, resolved.pathname);
        return path?.pathname;
      }),
    [routes, resolved, resolvePath]
  );

  // todo provided it as an input
  const { hubNameId, permissions } = useHub();

  const tabValue = (route: HubRoutesType) => resolvePath(route, resolved.pathname)?.pathname;

  const routeMatch = useRouteMatch(matchPatterns);
  const currentTab = useMemo(() => {
    if (routeMatch?.params?.discussionId) {
      return tabValue('discussions');
    }

    return routeMatch?.pattern?.path ?? tabValue('dashboard');
  }, [routeMatch, tabValue]);

  return (
    <>
      <Tabs
        value={currentTab}
        aria-label="Hub tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          value={tabValue('dashboard')}
          to={routes.dashboard}
        />
        <NavigationTab icon={<TocOutlined />} label={t('common.context')} value={tabValue('context')} to={'context'} />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          value={tabValue('community')}
          to={routes.community}
        />
        <NavigationTab
          icon={<ForumOutlined />}
          label={t('common.contribute')}
          value={tabValue('contribute')}
          to={routes.contribute}
        />
        <NavigationTab
          disabled={!challengesReadAccess}
          icon={<ContentPasteOutlined />}
          label={t('common.challenges')}
          value={tabValue('challenges')}
          to={routes.challenges}
        />
        {isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS) && (
          <NavigationTab
            disabled={!communityReadAccess}
            icon={<ForumOutlined />}
            label={t('common.discussions')}
            value={tabValue('discussions')}
            to={routes.discussions}
          />
        )}
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          value={tabValue('canvases')}
          to={routes.canvases}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={tabValue('settings')}
            to={buildAdminHubUrl(hubNameId)}
          />
        )}
      </Tabs>
      <Box paddingTop={3} />
      <Outlet />
    </>
  );
};

export default HubTabs;
