import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../../../common/components/core/Loading/Loading';
import { useChallenge } from '../hooks/useChallenge';
import { ApplicationTypeEnum } from '../../../community/application/constants/ApplicationType';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import ApplyRoute from '../../../community/application/routing/ApplyRoute';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import { OpportunityProvider } from '../../opportunity/context/OpportunityProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import OpportunityRoute from '../../opportunity/routes/OpportunityRoute';
import ChallengeDashboardPage from '../pages/ChallengeDashboardPage';
import CommunityFeedbackRoute from './CommunityContextFeedback';
import { EntityPageLayoutHolder } from '../../common/EntityPageLayout';
import { routes } from '../routes/challengeRoutes';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import ChallengeAboutPage from '../pages/ChallengeAboutPage';
import ChallengeOpportunitiesPage from '../pages/ChallengeOpportunitiesPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import Redirect from '../../../../core/routing/Redirect';
import ChallengeCollaborationPage from '../ChallengeCollaborationPage/ChallengeCollaborationPage';
import { StorageConfigContextProvider } from '../../../platform/storage/StorageBucket/StorageConfigContext';

interface ChallengeRootProps extends PageProps {}

const ChallengeRoute: FC<ChallengeRootProps> = ({ paths: _paths }) => {
  const {
    challengeId,
    challengeNameId,
    spaceNameId,
    profile: { displayName },
    loading,
  } = useChallenge();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  if (loading) {
    return <Loading text="Loading challenge" />;
  }

  if (!challengeId) {
    return <Error404 />;
  }

  return (
    <StorageConfigContextProvider
      locationType="journey"
      journeyTypeName="challenge"
      {...{ spaceNameId, challengeNameId }}
    >
      <Routes>
        <Route path="/" element={<EntityPageLayoutHolder />}>
          <Route index element={<Navigate replace to={routes.Dashboard} />} />
          <Route path={routes.Dashboard} element={<ChallengeDashboardPage />} />
          <Route path={`${routes.Dashboard}/updates`} element={<ChallengeDashboardPage dialog="updates" />} />
          <Route path={`${routes.Dashboard}/contributors`} element={<ChallengeDashboardPage dialog="contributors" />} />
          <Route path={routes.Contribute} element={<ContributePage journeyTypeName="challenge" />} />
          <Route path={routes.About} element={<ChallengeAboutPage />} />
          <Route path={routes.Opportunities} element={<ChallengeOpportunitiesPage />} />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`}
            element={<ChallengeCollaborationPage />}
          />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<ChallengeCollaborationPage>{props => <CalloutRoute {...props} />}</ChallengeCollaborationPage>}
          />
        </Route>
        <Route
          path="apply/*"
          element={
            <ApplyRoute
              paths={currentPaths}
              type={ApplicationTypeEnum.challenge}
              journeyPageLayoutComponent={ChallengePageLayout}
            />
          }
        />
        <Route path="feedback/*" element={<CommunityFeedbackRoute paths={currentPaths} />} />
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
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default ChallengeRoute;
