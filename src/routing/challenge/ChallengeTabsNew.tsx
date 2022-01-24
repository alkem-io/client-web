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
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { useConfig } from '../../hooks';
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

type ChallengeRoutesKey = keyof typeof routes;

export interface ChallengeTabsProps {
  communityReadAccess: boolean;
  viewerCanUpdate: boolean;
  ecoverseNameId: string;
  challengeNameId: string;
}

// todo unify in one tab config component
const ChallengeTabsNew: FC<ChallengeTabsProps> = ({
  communityReadAccess,
  viewerCanUpdate,
  ecoverseNameId,
  challengeNameId,
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();
  const resolved = useResolvedPath('.');
  const matchPatterns = useMemo(
    () => Object.values(routes).map(x => resolvePath(x, resolved.pathname)?.pathname),
    [routes, resolved, resolvePath]
  );
  const tabValue = useCallback(
    (route: ChallengeRoutesKey | string) => resolvePath(route, resolved.pathname)?.pathname,
    [resolved]
  );

  const routeMatch = useRouteMatch(matchPatterns);
  const currentTab = useMemo(() => {
    return routeMatch?.pattern?.path ?? tabValue('dashboard');
  }, [routeMatch, routes]);

  return (
    <>
      <Tabs
        value={currentTab}
        aria-label="Challenge tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          value={tabValue('dashboard')}
          to={routes['dashboard']}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          value={tabValue('context')}
          to={routes['context']}
        />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          value={tabValue('community')}
          to={routes['community']}
        />
        <NavigationTab
          icon={<ContentPasteOutlined />}
          label={t('common.opportunities')}
          value={tabValue('opportunities')}
          to={routes['opportunities']}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          value={tabValue(routes['discussions'])}
          to={routes['discussions']}
        />
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          value={tabValue('canvases')}
          to={routes['canvases']}
        />
        {viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={tabValue('settings')}
            /* can be provided with the tab config */
            to={buildAdminChallengeUrl(ecoverseNameId, challengeNameId)}
          />
        )}
      </Tabs>
      <Box paddingTop={3} />
      <Outlet />
    </>
  );
};

export default ChallengeTabsNew;
