import React, { FC, useMemo } from 'react';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { EcoverseProvider } from '../context/EcoverseProvider';
import {
  useChallengeProfileQuery,
  useChallengesQuery,
  useChallengeUserIdsQuery,
  useEcoverseUserIdsQuery,
  useOpportunityProfileQuery,
  useOpportunityUserIdsQuery,
} from '../generated/graphql';
import { useEcoverse } from '../hooks/useEcoverse';
import { useTransactionScope } from '../hooks/useSentry';
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
import { Admin } from './admin/admin';
import { Project } from './project';
import RestrictedRoute from './route.extensions';

const adminGroups = ['admin'];

export const Ecoverses: FC = () => {
  useTransactionScope({ type: 'domain' });
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/:ecoverseId`} name={'Ecoverse'}>
        <EcoverseProvider>
          <Ecoverse paths={[{ value: '/', name: 'ecoverses', real: true }]} />
        </EcoverseProvider>
      </Route>
      <Route path="*" name={'404'}>
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const Ecoverse: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const { ecoverseId, ecoverse: ecoverseInfo, loading: ecoverseLoading } = useEcoverse();

  const { data: challenges, loading: challengesLoading, error: challengesError } = useChallengesQuery({
    variables: { ecoverseId },
    errorPolicy: 'ignore' /*todo do not ignore errors*/,
  });

  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({ errorPolicy: 'all' });
  const currentPaths = useMemo(
    () => (ecoverseInfo ? [...paths, { value: url, name: ecoverseInfo.ecoverse.displayName, real: true }] : paths),
    [paths, ecoverseInfo]
  );

  const loading = ecoverseLoading || usersLoading || challengesLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverseInfo) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        {!loading && (
          <EcoversePage
            ecoverse={ecoverseInfo}
            challenges={{ data: challenges, error: challengesError }}
            users={(usersQuery?.users || undefined) as User[] | undefined}
            paths={currentPaths}
          />
        )}
      </Route>
      <Route path={`${path}/challenges/:id`}>
        <Challenge paths={currentPaths} challenges={challenges} />
      </Route>
      <RestrictedRoute path={`${path}/admin`} allowedGroups={adminGroups} strict={false}>
        <Admin />
      </RestrictedRoute>
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

  const { data: query, loading: challengeLoading } = useChallengeProfileQuery({
    variables: {
      ecoverseId,
      challengeId,
    },
    errorPolicy: 'all',
  });
  const { data: usersQuery, loading: usersLoading } = useChallengeUserIdsQuery({
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

  const loading = challengeLoading || usersLoading;

  if (loading) {
    return <Loading text={'Loading challenge'} />;
  }

  if (!challenge) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        {!loading && (
          <ChallengePage
            challenge={challenge as ChallengeType}
            users={(usersQuery?.ecoverse.challenge.community?.members || undefined) as User[] | undefined}
            paths={currentPaths}
          />
        )}
      </Route>
      <Route path={`${path}/opportunities/:id`}>
        <Opportunity opportunities={challenge.opportunities} paths={currentPaths} />
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
