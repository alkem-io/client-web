import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { opportunities } from '../components/core/Typography.dummy.json';
import {
  Challenge as ChallengeType,
  useChallengeProfileQuery,
  useChallengeUserIdsQuery,
  useEcoverseDetailsQuery,
  useEcoverseUserIdsQuery,
  User,
} from '../generated/graphql';
import {
  Challenge as ChallengePage,
  Ecoverse as EcoversePage,
  FourOuFour,
  Opportunity as OpportunityPage,
  PageProps,
} from '../pages';
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
  const { data: ecoverse, loading: ecoverseLoading } = useEcoverseDetailsQuery({ variables: {} });
  const { data: usersQuery, loading: usersLoading } = useEcoverseUserIdsQuery({ variables: {} });
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
          <EcoversePage ecoverse={ecoverse} users={usersQuery?.users as User[] | undefined} paths={currentPaths} />
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
  });
  const { data: usersQuery, loading: usersLoading } = useChallengeUserIdsQuery({
    variables: { id: Number(target?.id) },
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
            users={usersQuery?.challenge.contributors as User[] | undefined}
            paths={currentPaths}
          />
        )}
      </Route>
      <Route exact path={`${path}/opportunities/:id`}>
        <Opportnity paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const Opportnity: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { id } = useParams<{ id: string }>();
  const currentPaths = useMemo(
    () => [...paths, { value: url, name: opportunities.list.find(c => c.id === Number(id))?.title || '', real: true }],
    [paths, id]
  );

  return (
    <Switch>
      <Route exact path={path}>
        <OpportunityPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
