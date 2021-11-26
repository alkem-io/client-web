import React, { FC, useMemo } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { Ecoverse as EcoversePage, Error404, PageProps } from '../../pages';
import EcoverseCommunityPage from '../../pages/Community/EcoverseCommunityPage';
import ApplyRoute from '../application/apply.route';
import ChallengeRoute from '../challenge/ChallengeRoute';
import DiscussionsRoute from '../discussions/DiscussionsRoute';
import RestrictedRoute, { CredentialForResource } from '../route.extensions';
import { nameOfUrl } from '../url-params';
import EcoverseTabs from './EcoverseTabs';

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
    <EcoverseTabs>
      {({ pathGetter, urlGetter, tabName, tabNames }) => (
        <Switch>
          <Route exact path={pathGetter('root')}>
            <Redirect to={urlGetter('dashboard')} />
          </Route>
          <Route path={`${pathGetter('challenges')}/:${nameOfUrl.challengeNameId}`}>
            <ChallengeRoute paths={currentPaths} />
          </Route>
          <RestrictedRoute path={pathGetter('discussions')} requiredCredentials={requiredCredentials}>
            <DiscussionsRoute paths={currentPaths} />
          </RestrictedRoute>
          <RestrictedRoute path={pathGetter('community')} requiredCredentials={requiredCredentials}>
            <EcoverseCommunityPage paths={currentPaths} />
          </RestrictedRoute>
          <Route path={`${path}/apply`}>
            <ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />
          </Route>
          <Route path={pathGetter('canvases')}>Comming soon</Route>
          <Route path={path}>
            <EcoversePage paths={currentPaths} tabName={tabName} tabNames={tabNames} />
          </Route>
          <Route path="*">
            <Error404 />
          </Route>
        </Switch>
      )}
    </EcoverseTabs>
  );
};
