import React, { FC, useCallback, useMemo } from 'react';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Tabs } from '@mui/material';
import { DashboardOutlined, SettingsOutlined } from '@mui/icons-material';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { useAspect } from '../../context/aspect/AspectProvider';

const routes = {
  dashboard: 'dashboard',
  settings: 'settings',
};

type AspectRoutesType = keyof typeof routes;

export interface AspectTabsProps {}

const AspectTabs: FC<AspectTabsProps> = () => {
  const { t } = useTranslation();
  const { permissions } = useAspect();
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
      <Tabs
        value={currentTab}
        aria-label="Aspect tabs"
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
        {permissions.canUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={resolvePath('settings', resolved.pathname)?.pathname}
            to={'settings'}
          />
        )}
      </Tabs>
      <Box paddingTop={3} />
      <Outlet />
    </>
  );
};
export default AspectTabs;
