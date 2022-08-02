import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useChallenge } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Error404, PageProps } from '../../pages';
import ApplyRoute from '../application/apply.route';
import { nameOfUrl } from '../url-params';
import { OpportunityProvider } from '../../context/OpportunityProvider/OpportunityProvider';
import { CommunityContextProvider } from '../../domain/community/CommunityContext';
import OpportunityRoute from '../opportunity/OpportunityRoute';
import ChallengeDashboardPage from '../../pages/Admin/Challenge/ChallengeDashboardPage';
import ChallengeContextPage from '../../pages/Admin/Challenge/ChallengeContextPage';
import ChallengeOpportunityPage from '../../pages/Admin/Challenge/ChallengeOpportunityPage';
import CanvasesView from '../../domain/canvas/EntityCanvasPage/CanvasesView';
import ContributePage from '../../pages/Contribute/ContributePage';
import AspectProvider from '../../context/aspect/AspectProvider';
import AspectRoute from '../aspect/AspectRoute';
import CommunityFeedbackRoute from './CommunityContextFeedback';
import { EntityPageLayoutHolder } from '../../domain/shared/layout/PageLayout';
import { routes } from '../../domain/challenge/routes/challengeRoutes';

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
        <Route path={routes.Dashboard} element={<ChallengeDashboardPage paths={currentPaths} />} />
        <Route path={routes.Explore} element={<ContributePage entityTypeName="challenge" />} />
        <Route path={routes.About} element={<ChallengeContextPage paths={currentPaths} />} />
        <Route path="canvases" element={<CanvasesView parentUrl={resolved.pathname} entityTypeName="challenge" />} />
        <Route
          path="canvases/:canvasId"
          element={<CanvasesView parentUrl={resolved.pathname} entityTypeName="challenge" />}
        />
        <Route path={routes.Opportunities} element={<ChallengeOpportunityPage paths={currentPaths} />} />
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
      <Route
        path={`contribute/aspects/:${nameOfUrl.aspectNameId}/*`}
        element={
          <AspectProvider>
            <AspectRoute paths={currentPaths} />
          </AspectProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
export default ChallengeRoute;
