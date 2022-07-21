import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import HeaderNavigationTab from '../../domain/shared/components/PageHeader/HeaderNavigationTab';
import HeaderNavigationTabs from '../../domain/shared/components/PageHeader/HeaderNavigationTabs';
import PageBanner from '../../domain/shared/components/PageHeader/PageBanner';
import { useConfig, useOpportunity } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES } from '../../models/constants';
import { buildAdminOpportunityUrl } from '../../utils/urlBuilders';
import { getVisualBanner } from '../../utils/visuals.utils';

const routes = {
  community: 'community',
  dashboard: 'dashboard',
  projects: 'projects',
  canvases: 'canvases',
  settings: 'settings',
  context: 'context',
  contribute: 'contribute',
} as const;

type OpportunityRoutesType = keyof typeof routes;

export interface OpportunityTabsProps {
  communityReadAccess: boolean;
  viewerCanUpdate: boolean;
  hubNameId: string;
  challengeNameId: string;
  opportunityNameId: string;
}
// todo unify in one tab config component
const OpportunityTabs: FC<OpportunityTabsProps> = ({
  viewerCanUpdate,
  communityReadAccess,
  hubNameId,
  challengeNameId,
  opportunityNameId,
}) => {
  const { t } = useTranslation();
  const { isFeatureEnabled } = useConfig();
  const resolved = useResolvedPath('.');
  const matchPatterns = useMemo(
    () => Object.values(routes).map(x => resolvePath(x, resolved.pathname)?.pathname),
    [routes, resolved, resolvePath]
  );
  const tabValue = (route: OpportunityRoutesType) => resolvePath(route, resolved.pathname)?.pathname;
  const { opportunity, loading } = useOpportunity();

  const routeMatch = useRouteMatch(matchPatterns);
  const currentTab = useMemo(() => {
    return routeMatch?.pattern?.path ?? tabValue('dashboard');
  }, [routeMatch, routes]);

  return (
    <>
      <PageBanner
        title={opportunity?.displayName}
        tagline={opportunity?.context?.tagline}
        loading={loading}
        bannerUrl={getVisualBanner(opportunity?.context?.visuals)}
        showBreadcrumbs
        breadcrumbsTitle={t('pages.opportunity.opportunity-breadcrumbs')}
      />
      <HeaderNavigationTabs
        value={currentTab}
        aria-label="Opportunity tabs"
        showSettings={viewerCanUpdate}
        settingsValue={tabValue('settings')}
        settingsUrl={buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}
      >
        <HeaderNavigationTab label={t('common.opportunity')} value={tabValue('dashboard')} to={routes['dashboard']} />
        <HeaderNavigationTab label={t('common.context')} value={tabValue('context')} to={routes['context']} />
        <HeaderNavigationTab
          disabled={!communityReadAccess}
          label={t('common.community')}
          value={tabValue('community')}
          to={routes['community']}
        />
        <HeaderNavigationTab label={t('common.contribute')} value={tabValue('contribute')} to={routes.contribute} />
        <HeaderNavigationTab label={t('common.projects')} value={tabValue('projects')} to={routes['projects']} />
        <HeaderNavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          label={t('common.canvases')}
          value={tabValue('canvases')}
          to={routes['canvases']}
        />
      </HeaderNavigationTabs>
      <Outlet />
    </>
  );
};

export default OpportunityTabs;
