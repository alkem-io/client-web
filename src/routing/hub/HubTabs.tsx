import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import { HubPermissions } from '../../domain/hub/HubContext/HubContext';
import { useConfig, useHub } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminHubUrl } from '../../utils/urlBuilders';
import PageBanner from '../../domain/shared/components/PageHeader/PageBanner';
import { getVisualBanner } from '../../utils/visuals.utils';
import HeaderNavigationTabs from '../../domain/shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../domain/shared/components/PageHeader/HeaderNavigationTab';

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
  const { displayName, context, loading } = useHub();

  const routeMatch = useRouteMatch(matchPatterns);
  const currentTab = useMemo(() => {
    if (routeMatch?.params?.discussionId) {
      return tabValue('discussions');
    }

    return routeMatch?.pattern?.path ?? tabValue('dashboard');
  }, [routeMatch, tabValue]);

  return (
    <>
      <PageBanner
        title={displayName}
        tagline={context?.tagline}
        loading={loading}
        bannerUrl={getVisualBanner(context?.visuals)}
      />
      <HeaderNavigationTabs
        value={currentTab}
        aria-label="Hub tabs"
        showSettings={permissions.viewerCanUpdate}
        settingsValue={tabValue('settings')}
        settingsUrl={buildAdminHubUrl(hubNameId)}
      >
        <HeaderNavigationTab label={t('common.dashboard')} value={tabValue('dashboard')} to={routes.dashboard} />
        <HeaderNavigationTab label={t('common.context')} value={tabValue('context')} to={'context'} />
        <HeaderNavigationTab
          disabled={!permissions.communityReadAccess}
          label={t('common.community')}
          value={tabValue('community')}
          to={routes.community}
        />
        <HeaderNavigationTab label={t('common.contribute')} value={tabValue('contribute')} to={routes.contribute} />
        <HeaderNavigationTab
          disabled={!permissions.canReadChallenges}
          label={t('common.challenges')}
          value={tabValue('challenges')}
          to={routes.challenges}
        />
        {isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS) && (
          <HeaderNavigationTab
            disabled={!permissions.communityReadAccess}
            label={t('common.discussions')}
            value={tabValue('discussions')}
            to={routes.discussions}
          />
        )}
        {isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) && (
          <HeaderNavigationTab
            disabled={!permissions.communityReadAccess}
            label={t('common.canvases')}
            value={tabValue('canvases')}
            to={routes.canvases}
          />
        )}
      </HeaderNavigationTabs>
      <Outlet />
    </>
  );
};

export default HubTabs;
