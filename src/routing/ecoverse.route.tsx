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
import RestrictedRoute, { CredentialsForResource } from './route.extensions';
import { ChallengeProvider } from '../context/ChallengeProvider';
import { nameOfUrl } from './ulr-params';

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverseId, ecoverse: ecoverseInfo, loading: ecoverseLoading, toEcoverseId } = useEcoverse();
  const ecoverse = ecoverseInfo?.ecoverse;
  const isPrivate = ecoverse?.authorization?.anonymousReadAccess || false;

  const { data: challenges, loading: challengesLoading } = useChallengesQuery({
    variables: { ecoverseId },
    errorPolicy: 'ignore' /*todo do not ignore errors*/,
  });

  const currentPaths = useMemo(
    () => (ecoverse ? [...paths, { value: url, name: ecoverse?.displayName, real: true }] : paths),
    [paths, ecoverse]
  );
  const { user } = useUserContext();

  const isAdmin = useMemo(
    () =>
      user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
      user?.isEcoverseAdmin(toEcoverseId(ecoverseId)) ||
      false,
    [user, ecoverseId]
  );

  const loading = ecoverseLoading || challengesLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverseInfo) {
    return <FourOuFour />;
  }

  const credentialForResource: CredentialsForResource[] = isPrivate
    ? [
        {
          credential: AuthorizationCredential.EcoverseMember,
          resourceId: ecoverse?.id || '',
        },
      ]
    : [];

  return (
    <Switch>
      <Route exact path={path}>
        <EcoversePage ecoverse={ecoverseInfo} paths={currentPaths} permissions={{ edit: isAdmin }} />
      </Route>
      <Route path={`${path}/challenges/:${nameOfUrl.challengeId}`}>
        <ChallengeProvider>
          <ChallengeRoute paths={currentPaths} challenges={challenges} />
        </ChallengeProvider>
      </Route>
      <RestrictedRoute path={`${path}/community`} credentialForResource={credentialForResource}>
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
