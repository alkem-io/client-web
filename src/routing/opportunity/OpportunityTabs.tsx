import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { OpportunityContainerEntities } from '../../containers';
import { useConfig, useOpportunity } from '../../hooks';

const routes = {
  // discussions: '/community/discussions',
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
  // const url = '';
  const { t } = useTranslation();
  // const match = useRouteMatch(Object.values(routes).map(x => `${path}${x}`));
  const { ecoverseNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  // const urlGetter = useMemo(() => createGetter(routes, url), [url]);
  // const pathGetter = useMemo(() => createGetter(routes, path), [path]);
  const { communityReadAccess } = entities.permissions;
  // const tabNames = (Object.keys(routes) as Array<keyof OpportunityRoutesType>).reduce<OpportunityRoutesType>(
  //   (acc, curr) => {
  //     acc[curr] = pathGetter(curr);
  //     return acc;
  //   },
  //   {} as OpportunityRoutesType
  // );
  const { isFeatureEnabled } = useConfig();

  return (
    <>
      {/* <Tabs value={match?.path} aria-label="opportunity tabs">
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
        <NavigationTab
          disabled={!communityReadAccess}
          icon={<GroupOutlined />}
          label={t('common.community')}
          component={RouterLink}
          value={pathGetter('community')}
          to={urlGetter('community')}
        />
        <NavigationTab
          icon={<ContentPasteOutlined />}
          label={t('common.projects')}
          component={RouterLink}
          value={pathGetter('projects')}
          to={urlGetter('projects')}
        /> */}
      {/* <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)}
          icon={<ForumOutlined />}
          label={t('common.discussions')}
          component={RouterLink}
          value={pathGetter('discussions')}
          to={urlGetter('discussions')}
        /> */}
      {/* <NavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
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
      {children({ pathGetter, urlGetter, tabName: match?.path || 'dashboard', tabNames })} */}
    </>
  );
};

export default OpportunityTabs;
