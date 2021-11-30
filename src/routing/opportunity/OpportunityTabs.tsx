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
import { useRouteMatch } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { RouterLink } from '../../components/core/RouterLink';
import { OpportunityContainerEntities } from '../../containers';
import { useOpportunity } from '../../hooks';
import { buildAdminOpportunityUrl } from '../../utils/urlBuilders';

const routes = {
  discussions: '/community/discussions',
  community: '/community',
  dashboard: '/dashboard',
  projects: '/projects',
  canvases: '/canvases',
  settings: '/settings',
  context: '/context',
  root: '/',
};

export type OpportunityRoutesType = typeof routes;

export interface OpportunityTabsProps {
  children: (e: {
    pathGetter: (key: keyof typeof routes) => string;
    urlGetter: (key: keyof typeof routes) => string;
    tabName: string;
    tabNames: OpportunityRoutesType;
  }) => React.ReactNode;
  entities: OpportunityContainerEntities;
}
const createGetter = function <T>(r: T, url: string) {
  return (key: keyof T) => `${url}${r[key]}`;
};

const OpportunityTabs: FC<OpportunityTabsProps> = ({ entities, children }) => {
  const { path, url } = useRouteMatch();
  const { t } = useTranslation();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { ecoverseNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  const urlGetter = useMemo(() => createGetter(routes, url), [url]);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  const { isAuthenticated } = entities.permissions;
  const tabNames = (Object.keys(routes) as Array<keyof OpportunityRoutesType>).reduce<OpportunityRoutesType>(
    (acc, curr) => {
      acc[curr] = pathGetter(curr);
      return acc;
    },
    {} as OpportunityRoutesType
  );

  return (
    <>
      <Tabs value={match?.path} aria-label="basic tabs example">
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          component={RouterLink}
          value={pathGetter('dashboard')}
          to={urlGetter('dashboard')}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          component={RouterLink}
          value={pathGetter('context')}
          to={urlGetter('context')}
        />
        {isAuthenticated && (
          <NavigationTab
            icon={<GroupOutlined />}
            label={t('common.community')}
            component={RouterLink}
            value={pathGetter('community')}
            to={urlGetter('community')}
          />
        )}
        <NavigationTab
          icon={<ContentPasteOutlined />}
          label={t('common.projects')}
          component={RouterLink}
          value={pathGetter('projects')}
          to={urlGetter('projects')}
        />
        {isAuthenticated && (
          <NavigationTab
            icon={<ForumOutlined />}
            label={t('common.discussions')}
            component={RouterLink}
            value={pathGetter('discussions')}
            to={urlGetter('discussions')}
          />
        )}
        <NavigationTab
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          component={RouterLink}
          value={pathGetter('canvases')}
          to={urlGetter('canvases')}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            component={RouterLink}
            value={pathGetter('settings')}
            to={buildAdminOpportunityUrl(ecoverseNameId, challengeNameId, opportunityNameId)}
          />
        )}
      </Tabs>
      {children({ pathGetter, urlGetter, tabName: match?.path || 'dashboard', tabNames })}
    </>
  );
};

export default OpportunityTabs;
