import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { Ecoverse as EcoversePage, Error404, PageProps } from '../../pages';
import EcoverseCommunityPage from '../../pages/community/EcoverseCommunityPage';
import ApplyRoute from '../application/apply.route';
import ChallengeRoute from '../challenge/ChallengeRoute';
import RestrictedRoute, { CredentialForResource } from '../route.extensions';
import { nameOfUrl } from '../url-params';

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverseId, ecoverse, displayName, loading: ecoverseLoading, isPrivate } = useEcoverse();

  const currentPaths = useMemo(
    () => (ecoverse ? [...paths, { value: url, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  const loading = ecoverseLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverse) {
    return <Error404 />;
  }

  const requiredCredentials: CredentialForResource[] =
    isPrivate && ecoverseId ? [{ credential: AuthorizationCredential.EcoverseMember, resourceId: ecoverseId }] : [];

  return (
    <Switch>
      <Route exact path={path}>
        <EcoversePage paths={currentPaths} />
      </Route>
      <Route path={`${path}/challenges/:${nameOfUrl.challengeNameId}`}>
        <ChallengeProvider>
          <ChallengeRoute paths={currentPaths} />
        </ChallengeProvider>
      </Route>
      <RestrictedRoute path={`${path}/community`} requiredCredentials={requiredCredentials}>
        <EcoverseCommunityPage paths={currentPaths} />
      </RestrictedRoute>
      <Route path={`${path}/apply`}>
        <ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
