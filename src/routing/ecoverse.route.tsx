import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading/Loading';
import { useChallengesQuery } from '../hooks/generated/graphql';
import { useEcoverse, useUserContext } from '../hooks';
import { Ecoverse as EcoversePage, FourOuFour, PageProps } from '../pages';
import { AuthorizationCredential } from '../models/graphql-schema';
import { EcoverseApplyRoute } from './application/EcoverseApplyRoute';
import ChallengeRoute from './challenge.route';
import EcoverseCommunityPage from '../pages/community/EcoverseCommunityPage';
import RestrictedRoute, { CredentialForResource } from './route.extensions';
import { ChallengeProvider } from '../context/ChallengeProvider';
import { nameOfUrl } from './url-params';

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverseNameId, ecoverseId, ecoverse, loading: ecoverseLoading } = useEcoverse();
  const isPrivate = ecoverse?.authorization?.anonymousReadAccess || false;

  const { data: challenges, loading: challengesLoading } = useChallengesQuery({
    variables: { ecoverseId: ecoverseNameId },
    errorPolicy: 'ignore' /*todo do not ignore errors*/,
  });

  const currentPaths = useMemo(
    () => (ecoverse ? [...paths, { value: url, name: ecoverse?.displayName, real: true }] : paths),
    [paths, ecoverse]
  );
  const { user } = useUserContext();

  const isAdmin = useMemo(
    () => user?.hasCredentials(AuthorizationCredential.GlobalAdmin) || user?.isEcoverseAdmin(ecoverseId) || false,
    [user, ecoverseId]
  );

  const loading = ecoverseLoading || challengesLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverse) {
    return <FourOuFour />;
  }

  const requiredCredentials: CredentialForResource[] =
    isPrivate && ecoverseId ? [{ credential: AuthorizationCredential.EcoverseMember, resourceId: ecoverseId }] : [];

  return (
    <Switch>
      <Route exact path={path}>
        <EcoversePage ecoverse={ecoverse} paths={currentPaths} permissions={{ edit: isAdmin }} />
      </Route>
      <Route path={`${path}/challenges/:${nameOfUrl.challengeNameId}`}>
        <ChallengeProvider>
          <ChallengeRoute paths={currentPaths} challenges={challenges} />
        </ChallengeProvider>
      </Route>
      <RestrictedRoute path={`${path}/community`} requiredCredentials={requiredCredentials}>
        <EcoverseCommunityPage paths={currentPaths} />
      </RestrictedRoute>
      <Route path={path}>
        <EcoverseApplyRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
