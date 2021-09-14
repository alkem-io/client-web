import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading/Loading';
import { useChallengesQuery } from '../hooks/generated/graphql';
import { useEcoverse } from '../hooks';
import { useUserContext } from '../hooks';
import { Ecoverse as EcoversePage, FourOuFour, PageProps } from '../pages';
import { AuthorizationCredential } from '../models/graphql-schema';
import { EcoverseApplyRoute } from './application/EcoverseApplyRoute';
import CommunityRoute from './community';
import ChallengeRoute from './challenge.route';

export interface RouteParameters {
  ecoverseId: string;
  challengeId: string;
  opportunityId: string;
}

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverseId, ecoverse: ecoverseInfo, loading: ecoverseLoading, toEcoverseId } = useEcoverse();

  const { data: challenges, loading: challengesLoading } = useChallengesQuery({
    variables: { ecoverseId },
    errorPolicy: 'ignore' /*todo do not ignore errors*/,
  });

  const currentPaths = useMemo(
    () => (ecoverseInfo ? [...paths, { value: url, name: ecoverseInfo.ecoverse.displayName, real: true }] : paths),
    [paths, ecoverseInfo]
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

  return (
    <Switch>
      <Route exact path={path}>
        <EcoversePage ecoverse={ecoverseInfo} paths={currentPaths} permissions={{ edit: isAdmin }} />
      </Route>
      <Route path={`${path}/challenges/:challengeId`}>
        <ChallengeRoute paths={currentPaths} challenges={challenges} />
      </Route>
      <Route path={`${path}/community`}>
        <CommunityRoute paths={currentPaths} />
      </Route>
      <Route path={path}>
        <EcoverseApplyRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
