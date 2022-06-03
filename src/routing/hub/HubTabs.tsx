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
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { HubPermissions } from '../../domain/hub/HubContext/HubContext';
import { useConfig } from '../../hooks';
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
  hubNameId: string;
  permissions: HubPermissions;
}

// todo unify in one tab config component
const HubTabs: FC<HubTabsProps> = ({ hubNameId, permissions }) => {
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
          disabled={!permissions.communityReadAccess}
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
          disabled={!permissions.canReadChallenges}
          icon={<ContentPasteOutlined />}
          label={t('common.challenges')}
          value={tabValue('challenges')}
          to={routes.challenges}
        />
        {isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS) && (
          <NavigationTab
            disabled={!permissions.communityReadAccess}
            icon={<ForumOutlined />}
            label={t('common.discussions')}
            value={tabValue('discussions')}
            to={routes.discussions}
          />
        )}
        {isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) && (
          <NavigationTab
            disabled={!permissions.communityReadAccess}
            icon={<WbIncandescentOutlined />}
            label={t('common.canvases')}
            value={tabValue('canvases')}
            to={routes.canvases}
          />
        )}
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={tabValue('settings')}
            to={buildAdminHubUrl(hubNameId)}
          />
        )}
      </Tabs>
      <Outlet />
    </>
  );
};

export default HubTabs;
