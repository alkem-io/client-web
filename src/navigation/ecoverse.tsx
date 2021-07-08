import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import {
  useChallengeProfileQuery,
  useChallengesQuery,
  useOpportunityProfileQuery,
  useOpportunityUserIdsQuery,
} from '../generated/graphql';
import { useEcoverse } from '../hooks/useEcoverse';
import { useUserContext } from '../hooks/useUserContext';
import {
  Challenge as ChallengePage,
  Ecoverse as EcoversePage,
  FourOuFour,
  Opportunity as OpportunityPage,
  PageProps,
} from '../pages';
import {
  AuthorizationCredential,
  Challenge as ChallengeType,
  ChallengesQuery,
  Opportunity as OpportunityType,
  User,
} from '../types/graphql-schema';
import ChallengeApplyRoute from './application/ChallengeApplyRoute';
import { EcoverseApplyRoute } from './application/EcoverseApplyRoute';
import { Project } from './project';

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverseId, ecoverse: ecoverseInfo, loading: ecoverseLoading } = useEcoverse();

  const { data: challenges, loading: challengesLoading } = useChallengesQuery({
    variables: { ecoverseId },
    errorPolicy: 'ignore' /*todo do not ignore errors*/,
  });

  const currentPaths = useMemo(
    () => (ecoverseInfo ? [...paths, { value: url, name: ecoverseInfo.ecoverse.displayName, real: true }] : paths),
    [paths, ecoverseInfo]
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
        {!loading && <EcoversePage ecoverse={ecoverseInfo} paths={currentPaths} />}
      </Route>
      <Route path={`${path}/challenges/:id`}>
        <Challenge paths={currentPaths} challenges={challenges} />
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

interface ChallengeRootProps extends PageProps {
  challenges: ChallengesQuery | undefined;
}

const Challenge: FC<ChallengeRootProps> = ({ paths, challenges }) => {
  const { ecoverseId } = useEcoverse();
  const { path, url } = useRouteMatch();
  const { id } = useParams<{ id: string }>();
  const challengeId = challenges?.ecoverse.challenges?.find(x => x.nameID === id)?.id || '';

  // todo: you don't need opportunities selected here
  const { data: query, loading: challengeLoading } = useChallengeProfileQuery({
    variables: {
      ecoverseId,
      challengeId,
    },
    errorPolicy: 'all',
  });

  const challenge = query?.ecoverse.challenge;

  const currentPaths = useMemo(
    () => (challenge ? [...paths, { value: url, name: challenge.displayName, real: true }] : paths),
    [paths, id, challenge]
  );

  const loading = challengeLoading;

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challenge) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route path={`${path}/opportunities/:id`}>
        <Opportunity opportunities={challenge.opportunities} paths={currentPaths} />
      </Route>
      <Route exact path={path}>
        {!loading && <ChallengePage challenge={challenge as ChallengeType} paths={currentPaths} />}
      </Route>
      <Route path={path}>
        <ChallengeApplyRoute paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface OpportunityRootProps extends PageProps {
  opportunities: Pick<OpportunityType, 'id' | 'nameID'>[] | undefined;
}

const Opportunity: FC<OpportunityRootProps> = ({ paths, opportunities = [] }) => {
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const { ecoverseId } = useEcoverse();
  const opportunityId = opportunities.find(x => x.nameID === id)?.id || '';

  const { data: query, loading: opportunityLoading } = useOpportunityProfileQuery({
    variables: { ecoverseId, opportunityId },
    errorPolicy: 'all',
  });

  const { data: usersQuery, loading: usersLoading } = useOpportunityUserIdsQuery({
    variables: { ecoverseId, opportunityId },
    errorPolicy: 'all',
  });

  const opportunity = query?.ecoverse.opportunity;
  const opportunityGroups = usersQuery?.ecoverse.opportunity;
  const members = opportunityGroups?.community?.members;
  const users = useMemo(() => members || [], [members]);

  const currentPaths = useMemo(
    () => (opportunity ? [...paths, { value: url, name: opportunity.displayName, real: true }] : paths),
    [paths, id, opportunity]
  );

  const loading = opportunityLoading || usersLoading;

  if (loading) {
    return <Loading text={'Loading opportunity'} />;
  }

  if (!opportunity) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        <OpportunityPage
          opportunity={opportunity as OpportunityType}
          users={users as User[] | undefined}
          paths={currentPaths}
          onProjectTransition={project => {
            history.push(`${url}/projects/${project ? project.nameID : 'new'}`);
          }}
          permissions={{
            projectWrite: user?.hasCredentials(AuthorizationCredential.GlobalAdmin) || false,
          }}
        />
      </Route>
      <Route path={`${path}/projects`}>
        <Project paths={currentPaths} projects={opportunity.projects} opportunityId={opportunity.id} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
