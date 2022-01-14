import {
  ContentPasteOutlined,
  DashboardOutlined,
  GroupOutlined,
  SettingsOutlined,
  TocOutlined,
  WbIncandescentOutlined,
} from '@mui/icons-material';
import { Tabs } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import { OpportunityContainerEntities } from '../../containers';
import { useConfig, useOpportunity } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES } from '../../models/constants';
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
  const { pathname: path } = useResolvedPath('./');
  const { t } = useTranslation();
  const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { ecoverseNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  const urlGetter = useMemo(() => createGetter(routes, ''), []);
  const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  const { communityReadAccess } = entities.permissions;

  const tabNames = (Object.keys(routes) as Array<keyof OpportunityRoutesType>).reduce<OpportunityRoutesType>(
    (acc, curr) => {
      acc[curr] = pathGetter(curr);
      return acc;
    },
    {} as OpportunityRoutesType
  );
  const { isFeatureEnabled } = useConfig();

  return (
    <>
      <Tabs value={match?.pathname} aria-label="opportunity tabs">
        <NavigationTab
          icon={<DashboardOutlined />}
          label={t('common.dashboard')}
          value={pathGetter('dashboard')}
          to={urlGetter('dashboard')}
        />
        <NavigationTab
          icon={<TocOutlined />}
          label={t('common.context')}
          value={pathGetter('context')}
          to={urlGetter('context')}
        />
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          value={pathGetter('community')}
          to={urlGetter('community')}
        />
        <NavigationTab
          icon={<ContentPasteOutlined />}
          label={t('common.projects')}
          value={pathGetter('projects')}
          to={urlGetter('projects')}
        />
        {/* <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          value={pathGetter('discussions')}
          to={urlGetter('discussions')}
        /> */}
        <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          icon={<WbIncandescentOutlined />}
          label={t('common.canvases')}
          value={pathGetter('canvases')}
          to={urlGetter('canvases')}
        />
        {permissions.viewerCanUpdate && (
          <NavigationTab
            icon={<SettingsOutlined />}
            label={t('common.settings')}
            value={pathGetter('settings')}
            to={buildAdminOpportunityUrl(ecoverseNameId, challengeNameId, opportunityNameId)}
          />
        )}
      </Tabs>
      {children({ pathGetter, urlGetter, tabName: match?.pathname || 'dashboard', tabNames })}
    </>
  );
};

export default OpportunityTabs;
