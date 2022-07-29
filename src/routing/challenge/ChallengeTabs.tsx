import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, resolvePath, useResolvedPath } from 'react-router-dom';
import HeaderNavigationTab from '../../domain/shared/components/PageHeader/HeaderNavigationTab';
import HeaderNavigationTabs from '../../domain/shared/components/PageHeader/HeaderNavigationTabs';
import PageBanner from '../../domain/shared/components/PageHeader/PageBanner';
import { useChallenge, useConfig } from '../../hooks';
import useRouteMatch from '../../hooks/routing/useRouteMatch';
import { FEATURE_COLLABORATION_CANVASES, FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { buildAdminChallengeUrl } from '../../utils/urlBuilders';
import { getVisualBanner } from '../../utils/visuals.utils';

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
  const { challenge, loading } = useChallenge();

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
        title={challenge?.displayName}
        tagline={challenge?.context?.tagline}
        loading={loading}
        bannerUrl={getVisualBanner(challenge?.context?.visuals)}
        showBreadcrumbs
        breadcrumbsTitle={t('pages.challenge.challenge-breadcrumbs')}
      />
      <HeaderNavigationTabs
        value={currentTab}
        aria-label="Challenge tabs"
        showSettings={viewerCanUpdate}
        settingsValue={tabValue('settings')}
        settingsUrl={buildAdminChallengeUrl(hubNameId, challengeNameId)}
      >
        <HeaderNavigationTab label={t('common.challenge')} value={tabValue('dashboard')} to={routes.dashboard} />
        <HeaderNavigationTab label={t('common.context')} value={tabValue('context')} to={routes.context} />
        <HeaderNavigationTab
          disabled={!communityReadAccess}
          label={t('common.community')}
          value={tabValue('community')}
          to={routes.community}
        />
        <HeaderNavigationTab label={t('common.contribute')} value={tabValue('contribute')} to={routes.contribute} />
        <HeaderNavigationTab
          label={t('common.opportunities')}
          value={tabValue('opportunities')}
          to={routes.opportunities}
        />
        {isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS) && (
          <HeaderNavigationTab
            disabled={!communityReadAccess}
            label={t('common.discussions')}
            value={tabValue('discussions')}
            to={routes.discussions}
          />
        )}
        <HeaderNavigationTab
          disabled={!communityReadAccess || !isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)}
          label={t('common.canvases')}
          value={tabValue('canvases')}
          to={routes.canvases}
        />
      </HeaderNavigationTabs>
      <Outlet />
    </>
  );
};

export default ChallengeTabs;
