import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useChallenge } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Error404, PageProps } from '../../pages';
import ApplyRoute from '../application/apply.route';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import ChallengePageContainer from '../../containers/challenge/ChallengePageContainer';
import ChallengeTabsNew from './ChallengeTabsNew';
import ChallengeCommunityPage from '../../pages/Community/ChallengeCommunityPage';
import RestrictedRoute, { CredentialForResource } from '../RestrictedRoute';
import DiscussionsRoute from '../discussions/DiscussionsRoute';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { nameOfUrl } from '../url-params';
import { OpportunityProvider } from '../../context/OpportunityProvider';
import { CommunityProvider } from '../../context/CommunityProvider';
import OpportunityRouteNew from '../opportunity/OpportunityRouteNew';
import ChallengeDashboardPage from '../../pages/Admin/Challenge/ChallengeDashboardPage';
import ChallengeContextPage from '../../pages/Admin/Challenge/ChallengeContextPage';
import ChallengeOpportunityPage from '../../pages/Admin/Challenge/ChallengeOpportunityPage';
import ChallengeCanvasPage from '../../pages/Admin/Challenge/ChallengeCanvasPage';
import AspectProvider from '../../context/aspect/AspectProvider';
import AspectRoute from '../aspect/AspectRoute';

interface ChallengeRootProps extends PageProps {}

const ChallengeRouteNew: FC<ChallengeRootProps> = ({ paths: _paths }) => {
  const { ecoverseNameId, ecoverseId, challengeId, challengeNameId, displayName, loading } = useChallenge();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  const discussionsRequiredCredentials: CredentialForResource[] = challengeId
    ? [
        { credential: AuthorizationCredential.ChallengeMember, resourceId: challengeId },
        { credential: AuthorizationCredential.EcoverseAdmin, resourceId: ecoverseId },
      ]
    : [];

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challengeId) {
    return <Error404 />;
  }

  return (
    <DiscussionsProvider>
      <ChallengePageContainer>
        {(e, s) => (
          <Routes>
            <Route
              path={'/'}
              element={
                <ChallengeTabsNew
                  communityReadAccess={e.permissions.communityReadAccess}
                  viewerCanUpdate={e.permissions.canEdit}
                  ecoverseNameId={ecoverseNameId}
                  challengeNameId={challengeNameId}
                />
              }
            >
              <Route index element={<Navigate replace to={'dashboard'} />} />
              <Route
                path={'dashboard'}
                element={<ChallengeDashboardPage paths={currentPaths} entities={e} state={s} />}
              />
              <Route path={'context'} element={<ChallengeContextPage paths={currentPaths} />} />
              <Route path={'community'} element={<ChallengeCommunityPage paths={currentPaths} />} />
              <Route
                path={'discussions/*'}
                element={
                  <RestrictedRoute requiredCredentials={discussionsRequiredCredentials}>
                    <DiscussionsRoute paths={currentPaths} />
                  </RestrictedRoute>
                }
              />
              <Route path={'canvases'} element={<ChallengeCanvasPage paths={currentPaths} entities={e} state={s} />} />
              <Route
                path={'opportunities'}
                element={<ChallengeOpportunityPage paths={currentPaths} entities={e} state={s} />}
              />
            </Route>
            <Route
              path={'apply/*'}
              element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.challenge} />}
            />
            <Route
              path={`opportunities/:${nameOfUrl.opportunityNameId}/*`}
              element={
                <OpportunityProvider>
                  <CommunityProvider>
                    <OpportunityRouteNew paths={currentPaths} />
                  </CommunityProvider>
                </OpportunityProvider>
              }
            />
            <Route
              path={`aspects/:${nameOfUrl.aspectNameId}/*`}
              element={
                <AspectProvider>
                  <AspectRoute paths={currentPaths} />
                </AspectProvider>
              }
            />
            <Route path="*" element={<Error404 />} />
          </Routes>
        )}
      </ChallengePageContainer>
    </DiscussionsProvider>
  );
};
export default ChallengeRouteNew;
