import React, { FC, useMemo } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityProvider } from '../../context/CommunityProvider';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Ecoverse as EcoversePage, Error404, PageProps } from '../../pages';
import ApplyRoute from '../application/apply.route';
import ChallengeRoute from '../challenge/ChallengeRoute';
import { nameOfUrl } from '../url-params';

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverse, displayName, loading: ecoverseLoading } = useEcoverse();

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

  return (
    <Switch>
      <Route exact path={path}>
        <Redirect to={`${url}/dashboard`} />
      </Route>
      <Route path={`${path}/challenges/:${nameOfUrl.challengeNameId}`}>
        <ChallengeProvider>
          <CommunityProvider>
            <ChallengeRoute paths={currentPaths} />
          </CommunityProvider>
        </ChallengeProvider>
      </Route>
      <Route path={`${path}/apply`}>
        <ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />
      </Route>
      <Route path={path}>
        <EcoversePage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
