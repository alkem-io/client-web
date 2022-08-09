import React, { FC, useCallback, useMemo } from 'react';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { useAspect } from '../../context/aspect/AspectProvider';
import HeaderNavigationTab from '../../domain/shared/components/PageHeader/HeaderNavigationTab';
import HeaderNavigationTabs from '../../domain/shared/components/PageHeader/HeaderNavigationTabs';
import PageBanner from '../../domain/shared/components/PageHeader/PageBanner';
import AspectDashboardContainer from '../../containers/aspect/AspectDashboardContainer/AspectDashboardContainer';
import { useUrlParams } from '../../hooks';

const routes = {
  dashboard: 'dashboard',
  settings: 'settings',
};

type AspectRoutesType = keyof typeof routes;

export interface AspectTabsProps {}

const AspectTabs: FC<AspectTabsProps> = () => {
  const { t } = useTranslation();
  const { displayName, permissions, loading } = useAspect();
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '' } = useUrlParams();
  const resolved = useResolvedPath('.');
  const matchPatterns = useMemo(
    () => Object.values(routes).map(x => resolvePath(x, resolved.pathname)?.pathname),
    [routes, resolved, resolvePath]
  );

  const tabValue = useCallback(
    (route: AspectRoutesType | string) => resolvePath(route, resolved.pathname)?.pathname,
    [resolved]
  );

  const routeMatch = useRouteMatch(matchPatterns);
  const currentTab = useMemo(() => {
    return routeMatch?.pattern?.path ?? tabValue('dashboard');
  }, [routeMatch, routes]);

  return (
    <>
      <AspectDashboardContainer
        hubNameId={hubNameId}
        aspectNameId={aspectNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      >
        {({ aspect }) => (
          <PageBanner
            title={displayName}
            loading={loading}
            bannerUrl={aspect?.banner?.uri}
            showBreadcrumbs
            breadcrumbsTitle={t('pages.aspect.aspect-breadcrumbs')}
          />
        )}
      </AspectDashboardContainer>

      <HeaderNavigationTabs
        value={currentTab}
        aria-label="Aspect tabs"
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
        showSettings={permissions.canUpdate}
        settingsValue={resolvePath('settings', resolved.pathname)?.pathname}
        settingsUrl={'settings'}
      >
        <HeaderNavigationTab
          label={t('common.dashboard')}
          value={resolvePath('dashboard', resolved.pathname)?.pathname}
          to={'dashboard'}
        />
      </HeaderNavigationTabs>
      <Box paddingTop={3} />
      <Outlet />
    </>
  );
};
export default AspectTabs;
