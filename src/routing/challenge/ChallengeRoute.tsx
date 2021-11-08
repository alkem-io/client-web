import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import Loading from '../../components/core/Loading/Loading';
import { OpportunityProvider } from '../../context/OpportunityProvider';
import { useChallenge } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Challenge as ChallengePage, Error404, PageProps } from '../../pages';
import ChallengeCommunityPage from '../../pages/Community/ChallengeCommunityPage';
import ApplyRoute from '../application/apply.route';
import DiscussionsRoute from '../discussions/DiscussionsRoute';
import OpportunityRoute from '../opportunity/OpportunityRoute';
import RestrictedRoute from '../route.extensions';
import { nameOfUrl } from '../url-params';

interface ChallengeRootProps extends PageProps {}

const ChallengeRoute: FC<ChallengeRootProps> = ({ paths }) => {
  const { challengeId, displayName, loading } = useChallenge();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(
    () => (displayName ? [...paths, { value: url, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challengeId) {
    return <Error404 />;
  }

  return (
    <Switch>
      <Route path={`${path}/opportunities/:${nameOfUrl.opportunityNameId}`}>
        <OpportunityProvider>
          <OpportunityRoute paths={currentPaths} />
        </OpportunityProvider>
      </Route>
      <Route exact path={path}>
        <ChallengePage paths={currentPaths} />
      </Route>
      <RestrictedRoute path={`${path}/community/discussions`}>
        <DiscussionsRoute paths={currentPaths} />
      </RestrictedRoute>
      <RestrictedRoute path={`${path}/community`}>
        <ChallengeCommunityPage paths={currentPaths} />
      </RestrictedRoute>
      <Route path={path}>
        <ApplyRoute type={ApplicationTypeEnum.challenge} paths={paths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default ChallengeRoute;
