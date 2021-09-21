import { Challenge as ChallengePage, FourOuFour, PageProps } from '../pages';
import { AuthorizationCredential, Challenge as ChallengeType, ChallengesQuery } from '../models/graphql-schema';
import React, { FC, useMemo } from 'react';
import { useEcoverse, useUrlParams, useUserContext } from '../hooks';
import { Route, Switch, useRouteMatch } from 'react-router';
import { useChallengeProfileQuery } from '../hooks/generated/graphql';
import Loading from '../components/core/Loading/Loading';
import ChallengeApplyRoute from './application/ChallengeApplyRoute';
import OpportunityRoute from './opportunity.route';
import ChallengeCommunityPage from '../pages/community/ChallengeCommunityPage';
import RestrictedRoute from './route.extensions';
import { OpportunityProvider } from '../context/OpportunityProvider';
import { nameOfUrl } from './ulr-params';

interface ChallengeRootProps extends PageProps {
  challenges: ChallengesQuery | undefined;
}

const ChallengeRoute: FC<ChallengeRootProps> = ({ paths, challenges }) => {
  const { ecoverseId, ecoverseNameId } = useEcoverse();
  const { path, url } = useRouteMatch();
  const { challengeId: id } = useUrlParams();
  const challengeId = challenges?.ecoverse.challenges?.find(x => x.nameID === id)?.id || '';

  const { user } = useUserContext();

  // todo: you don't need opportunities selected here
  const { data: query, loading } = useChallengeProfileQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      challengeId,
    },
    errorPolicy: 'all',
  });

  const challenge = query?.ecoverse.challenge;

  const currentPaths = useMemo(
    () => (challenge ? [...paths, { value: url, name: challenge.displayName, real: true }] : paths),
    [paths, id, challenge]
  );

  const isAdmin = useMemo(
    () =>
      user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
      user?.isEcoverseAdmin(ecoverseId) ||
      user?.isChallengeAdmin(challenge?.id || '') ||
      false,
    [user, ecoverseId, challenge]
  );

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challenge) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route path={`${path}/opportunities/:${nameOfUrl.opportunityId}`}>
        <OpportunityProvider>
          <OpportunityRoute opportunities={challenge.opportunities} paths={currentPaths} challengeUUID={challenge.id} />
        </OpportunityProvider>
      </Route>
      <Route exact path={path}>
        <ChallengePage challenge={challenge as ChallengeType} paths={currentPaths} permissions={{ edit: isAdmin }} />
      </Route>
      <RestrictedRoute path={`${path}/community`}>
        <ChallengeCommunityPage paths={currentPaths} />
      </RestrictedRoute>
      <Route path={path}>
        <ChallengeApplyRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default ChallengeRoute;
