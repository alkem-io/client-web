import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../../common/components/core/Loading/Loading';
import { useChallenge } from '../../../hooks';
import { ApplicationTypeEnum } from '../../../models/enums/application-type';
import { Error404, PageProps } from '../../../pages';
import ApplyRoute from '../../application/routing/apply.route';
import { nameOfUrl } from '../../../routing/url-params';
import { OpportunityProvider } from '../../opportunity/context/OpportunityProvider';
import { CommunityContextProvider } from '../../community/CommunityContext';
import OpportunityRoute from '../../opportunity/routes/OpportunityRoute';
import ChallengeDashboardPage from '../pages/ChallengeDashboardPage';
import CommunityFeedbackRoute from './CommunityContextFeedback';
import { EntityPageLayoutHolder } from '../../shared/layout/PageLayout';
import { routes } from '../routes/challengeRoutes';
import CalloutsPage from '../../callout/CalloutsPage';
import CalloutRoute from '../../callout/routing/CalloutRoute';
import ChallengeContextPage from '../pages/ChallengeContextPage';
import ChallengeOpportunityPage from '../pages/ChallengeOpportunityPage';

interface ChallengeRootProps extends PageProps {}

const ChallengeRoute: FC<ChallengeRootProps> = ({ paths: _paths }) => {
  const { challengeId, displayName, loading } = useChallenge();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challengeId) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate replace to={routes.Dashboard} />} />
        <Route path={routes.Dashboard} element={<ChallengeDashboardPage />} />
        <Route path={`${routes.Dashboard}/updates`} element={<ChallengeDashboardPage dialog="updates" />} />
        <Route path={`${routes.Dashboard}/contributors`} element={<ChallengeDashboardPage dialog="contributors" />} />
        <Route
          path={routes.Explore}
          element={<CalloutsPage entityTypeName="challenge" rootUrl={`${resolved.pathname}/${routes.Explore}`} />}
        />
        <Route path={routes.About} element={<ChallengeContextPage paths={currentPaths} />} />
        <Route path={routes.Opportunities} element={<ChallengeOpportunityPage paths={currentPaths} />} />

        <Route
          path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}`}
          element={<Navigate replace to={`${resolved.pathname}/${routes.Explore}`} />}
        />
        <Route
          path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}/*`}
          element={
            <CalloutRoute parentPagePath={`${resolved.pathname}/${routes.Explore}`} entityTypeName={'challenge'} />
          }
        />
      </Route>
      <Route path={'apply/*'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.challenge} />} />
      <Route path={'feedback/*'} element={<CommunityFeedbackRoute paths={currentPaths} />} />
      <Route
        path={`${routes.Opportunities}/:${nameOfUrl.opportunityNameId}/*`}
        element={
          <OpportunityProvider>
            <CommunityContextProvider>
              <OpportunityRoute paths={currentPaths} />
            </CommunityContextProvider>
          </OpportunityProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default ChallengeRoute;
