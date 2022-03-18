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
import { useConfig } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminChallengeUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: 'discussions',
  discussion: 'discussions/:discussionId',
  community: 'community',
  contribute: 'contribute',
  dashboard: 'dashboard',
  opportunities: 'opportunities',
  canvases: 'canvases',
  settings: 'settings',
  context: 'context',
} as const;

type ChallengeRoutesKey = keyof typeof routes;

export interface ChallengeTabsProps {
  communityReadAccess: boolean;
  viewerCanUpdate: boolean;
  hubNameId: string;
  challengeNameId: string;
}

// todo unify in one tab config component
const ChallengeTabs: FC<ChallengeTabsProps> = ({
  communityReadAccess,
  viewerCanUpdate,
  hubNameId,
  challengeNameId,
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();
  const resolved = useResolvedPath('.');
  const matchPatterns = useMemo(
    () => Object.values(routes).map(x => resolvePath(x, resolved.pathname)?.pathname),
    [routes, resolved, resolvePath]
  );
  const tabValue = (route: ChallengeRoutesKey) => resolvePath(route, resolved.pathname)?.pathname;

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
        aria-label="Challenge tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.challenge')}
          value={tabValue('dashboard')}
          to={routes.dashboard}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          value={tabValue('context')}
          to={routes.context}
        />
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
          icon={<ContentPasteOutlined />}
          label={t('common.opportunities')}
          value={tabValue('opportunities')}
          to={routes.opportunities}
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
        {viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={tabValue('settings')}
            /* can be provided with the tab config */
            to={buildAdminChallengeUrl(hubNameId, challengeNameId)}
          />
        )}
      </Tabs>
      <Box paddingTop={3} />
      <Outlet />
    </>
  );
};

export default ChallengeTabs;
