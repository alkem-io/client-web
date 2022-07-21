import { Box, styled, Tabs } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { HubPermissions } from '../../domain/hub/HubContext/HubContext';
import { useConfig } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminHubUrl } from '../../utils/urlBuilders';
import HubBanner from './HubBanner';
import { SettingsOutlined } from '@mui/icons-material';

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

const TabsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '.settings-button': {
    color: theme.palette.common.white,
    position: 'absolute',
    top: 0,
    right: 0,
    minHeight: theme.spacing(4),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 0,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  [theme.breakpoints.up('xs')]: {
    paddingLeft: 0,
    paddingRight: theme.spacing(5),
  },
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.common.white,
    bottom: 2,
    height: 2,
  },
  '& .MuiTabs-flexContainer': {
    display: 'flex',
    justifyContent: 'center',
  },
  '& .MuiTab-root': {
    fontSize: theme.typography.button.fontSize,
    flexGrow: 1,
    minHeight: theme.spacing(4),
  },
}));

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
      <HubBanner />
      <TabsContainer>
        <StyledTabs
          value={currentTab}
          aria-label="Hub tabs"
          variant="scrollable"
          scrollButtons={'auto'}
          allowScrollButtonsMobile
        >
          <NavigationTab label={t('common.dashboard')} value={tabValue('dashboard')} to={routes.dashboard} />
          <NavigationTab label={t('common.context')} value={tabValue('context')} to={'context'} />
          <NavigationTab
            disabled={!permissions.communityReadAccess}
            label={t('common.community')}
            value={tabValue('community')}
            to={routes.community}
          />
          <NavigationTab label={t('common.contribute')} value={tabValue('contribute')} to={routes.contribute} />
          <NavigationTab
            disabled={!permissions.canReadChallenges}
            label={t('common.challenges')}
            value={tabValue('challenges')}
            to={routes.challenges}
          />
          {isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS) && (
            <NavigationTab
              disabled={!permissions.communityReadAccess}
              label={t('common.discussions')}
              value={tabValue('discussions')}
              to={routes.discussions}
            />
          )}
          {isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) && (
            <NavigationTab
              disabled={!permissions.communityReadAccess}
              label={t('common.canvases')}
              value={tabValue('canvases')}
              to={routes.canvases}
            />
          )}
        </StyledTabs>
        {permissions.viewerCanUpdate && (
          <NavigationTab
            className="settings-button"
            icon={<SettingsOutlined />}
            value={tabValue('settings')}
            to={buildAdminHubUrl(hubNameId)}
          />
        )}
      </TabsContainer>
      <Outlet />
    </>
  );
};

export default HubTabs;
