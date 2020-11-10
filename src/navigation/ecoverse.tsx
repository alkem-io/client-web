import React, { FC, useMemo } from 'react';
import { Redirect, Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { opportunities } from '../components/core/Typography.dummy.json';
import {
  Challenge as ChallengeType,
  Opportunity as OpportunityType,
  Project as ProjectType,
  useChallengeProfileQuery,
  useChallengeUserIdsQuery,
  useEcoverseDetailsQuery,
  useEcoverseUserIdsQuery,
  useOpportunityProfileQuery,
  useOpportunityUserIdsQuery,
  User,
} from '../generated/graphql';
import {
  Challenge as ChallengePage,
  Ecoverse as EcoversePage,
  FourOuFour,
  Opportunity as OpportunityPage,
  PageProps,
} from '../pages';
import { Project } from './project';
/*local files imports end*/

interface EcoverseParameters {
  ecoverseId: string;
  challengeId: string;
  opportunityId: string;
}

export const Ecoverses: FC = () => {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/:id`}>
        <Ecoverse paths={[{ value: url, name: 'ecoverses', real: false }]} />
      </Route>
      <Route exact path={`${path}`}>
        <Redirect to="/ecoverse/1" />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const Ecoverse: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  // const { id } = useParams<{ id: string }>();
  // at some point the ecoverse needs to be queried
  const { data: ecoverse, loading: ecoverseLoading } = useEcoverseDetailsQuery({ variables: {}, errorPolicy: 'all' });
  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({ variables: {}, errorPolicy: 'all' });
  const currentPaths = useMemo(() => (ecoverse ? [...paths, { value: url, name: ecoverse.name, real: true }] : paths), [
    paths,
    ecoverse,
  ]);

  const loading = ecoverseLoading || usersLoading;

  if (loading) {
    return <Loading />;
  }

  if (!ecoverse) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route exact path={path}>
        {!loading && (
          <EcoversePage
            ecoverse={ecoverse}
            users={(usersQuery?.users || undefined) as User[] | undefined}
            paths={currentPaths}
          />
        )}
      </Route>
      <Route path={`${path}/challenges/:id`}>
        <Challenge paths={currentPaths} challenges={ecoverse.challenges} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface ChallengeRootProps extends PageProps {
  challenges: Pick<ChallengeType, 'id' | 'textID'>[];
}

const Challenge: FC<ChallengeRootProps> = ({ paths, challenges }) => {
  const { path, url } = useRouteMatch();
  const { id } = useParams<{ id: string }>();
  const target = challenges.find(x => x.textID === id);

  const { data: query, loading: challengeLoading } = useChallengeProfileQuery({
    variables: { id: Number(target?.id) },
    errorPolicy: 'all',
  });
  const { data: usersQuery, loading: usersLoading } = useChallengeUserIdsQuery({
    variables: { id: Number(target?.id) },
    errorPolicy: 'all',
  });
  const { challenge } = query || {};

  const currentPaths = useMemo(
    () => (challenge ? [...paths, { value: url, name: challenge.name, real: true }] : paths),
    [paths, id, challenge]
  );

  const loading = challengeLoading || usersLoading;

  if (loading) {
    return <Loading />;
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
            users={(usersQuery?.challenge.contributors || undefined) as User[] | undefined}
            paths={currentPaths}
          />
        )}
      </Route>
      <Route path={`${path}/opportunities/:id`}>
        <Opportnity opportunities={challenge.opportunities} paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface OpportunityRootProps extends PageProps {
  opportunities: Pick<OpportunityType, 'id' | 'textID'>[] | undefined;
}

const Opportnity: FC<OpportunityRootProps> = ({ paths, opportunities = [] }) => {
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const target = opportunities.find(x => x.textID === id);

  const { data: query, loading: opportunityLoading } = useOpportunityProfileQuery({
    variables: { id: Number(target?.id) },
  });

  const { data: usersQuery, loading: usersLoading } = useOpportunityUserIdsQuery({
    variables: { id: Number(target?.id) },
    errorPolicy: 'all',
  });

  const { opportunity } = query || {};
  const { opportunity: opportunityGroups } = usersQuery || {};
  const { groups } = opportunityGroups || {};
  const users = useMemo(() => groups?.flatMap(x => x.members) || [], [groups]);

  const currentPaths = useMemo(
    () => (opportunity ? [...paths, { value: url, name: opportunity.name, real: true }] : paths),
    [paths, id, opportunity]
  );

  const loading = opportunityLoading || usersLoading;

  if (loading) {
    return <Loading />;
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
            history.push(`${url}/projects/${project ? project.textID : 'new'}`);
          }}
        />
      </Route>
      <Route path={`${path}/projects`}>
        <Project paths={currentPaths} projects={opportunity.projects} opportunityId={Number(opportunity.id)} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
