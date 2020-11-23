import React, { FC, useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Route, Switch, useParams, useRouteMatch, useLocation } from 'react-router-dom';

/*lib imports end*/
import { AdminPage, EditMode, GroupPage, ListPage, UserList, UserPage } from '../components/Admin';
import Loading from '../components/core/Loading';
import { useTransactionScope } from '../hooks/useSentry';
import {
  useChallengeGroupsQuery,
  useChallengeOpportunitiesQuery,
  useEcoverseChallengesListQuery,
  useEcoverseGroupsListQuery,
  useOpportunityGroupsQuery,
  useOpportunityNameLazyQuery,
  useUserQuery,
  useUsersQuery,
} from '../generated/graphql';
import { UserModel } from '../models/User';
import { FourOuFour, PageProps } from '../pages';
import Typography from '../components/core/Typography';
import ChallengePage from '../components/Admin/ChallengePage';
/*local files imports end*/

export const Admin: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);
  // cosnt []
  return (
    <Container>
      <Switch>
        <Route exact path={`${path}`}>
          <AdminPage paths={currentPaths} />
        </Route>
        <Route path={`${path}/users`}>
          <UsersRoute paths={currentPaths} />
        </Route>
        <Route path={`${path}/groups`}>
          <GroupsRoute paths={currentPaths} />
        </Route>
        <Route path={`${path}/challenges`}>
          <ChallengesRoute paths={currentPaths} />
        </Route>
        <Route path="*">
          <FourOuFour />
        </Route>
      </Switch>
    </Container>
  );
};

const UsersRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useUsersQuery();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'users', real: true }], [paths]);

  const users = (data?.users || []) as UserModel[];
  if (loading) {
    return <Loading text={'Loading Users ...'} />;
  }
  return (
    <Switch>
      <Route exact path={`${path}`}>
        <UserList users={users} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <UserPage mode={EditMode.new} paths={currentPaths} title="New user" />
      </Route>
      <Route exact path={`${path}/:userId/edit`}>
        <UserRoute mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:userId`}>
        <UserRoute mode={EditMode.readOnly} paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface UserProps extends PageProps {
  mode: EditMode;
  title?: string;
}

const UserRoute: FC<UserProps> = ({ paths, mode, title }) => {
  const { userId } = useParams<{ userId: string }>();
  const { data, loading } = useUserQuery({ variables: { id: userId } });

  if (loading) return <Loading text={'Loading user ...'} />;
  const user = data?.user as UserModel;
  if (user) {
    return <UserPage user={user} paths={paths} mode={mode} title={title} />;
  }
  return <FourOuFour />;
};

const GroupsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useEcoverseGroupsListQuery();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);
  const groupsList = data?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` }));

  if (loading) return <Loading text={'Loading Groups ...'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <Typography variant={'h3'} className={'mb-4'}>
          Ecoverse groups
        </Typography>
        <ListPage data={groupsList || []} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { pathname } = useLocation();
  const { data: challengesListQuery } = useEcoverseChallengesListQuery();

  const routes = pathname.split('/').splice(2);

  const challengesList = challengesListQuery?.challenges?.map(c => ({
    id: c.id,
    value: c.name,
    url: `${url}/${c.id}`,
  }));

  const challengeId = routes[1];
  const subRoute = routes[2];
  const opportunityId = routes[3];

  const [getOpportunityName, { data: opportunityNameQuery }] = useOpportunityNameLazyQuery();

  const challengeName =
    useMemo(() => challengesListQuery?.challenges?.find(c => c.id === challengeId), [
      pathname,
      challengesListQuery?.challenges,
    ])?.name || '';
  const opportunityName = useMemo(() => opportunityNameQuery?.opportunity?.name || 'Opportunity', [
    opportunityNameQuery,
  ]);

  useEffect(() => {
    if (opportunityId === undefined) return;

    getOpportunityName({ variables: { id: Number(opportunityId) } });
  }, [opportunityId]);

  const currentPaths = useMemo(() => {
    const initial = [...paths, { value: url, name: 'challenges', real: true }];
    if (routes.length === 3) {
      return [...initial, { value: `${url}/${challengeId}`, name: challengeName, real: true }];
    }
    if (routes.length === 4) {
      return [
        ...initial,
        { value: `${url}/${challengeId}`, name: challengeName, real: true },
        { value: `${url}/${challengeId}/${subRoute}`, name: subRoute, real: true },
      ];
    }
    if (routes.length === 5) {
      return [
        ...initial,
        { value: `${url}/${challengeId}`, name: challengeName, real: true },
        { value: `${url}/${challengeId}/${subRoute}`, name: subRoute, real: true },
        { value: `${url}/${challengeId}/${subRoute}/${opportunityId}/groups`, name: opportunityName, real: true },
      ];
    }
    if (routes.length === 6) {
      return [
        ...initial,
        { value: `${url}/${challengeId}`, name: challengeName, real: true },
        { value: `${url}/${challengeId}/${subRoute}`, name: subRoute, real: true },
        { value: `${url}/${challengeId}/${subRoute}/${opportunityId}/groups`, name: opportunityName, real: true },
        { value: `${url}/${challengeId}/${subRoute}/${opportunityId}/groups`, name: 'groups', real: true },
      ];
    }
    return initial;
  }, [paths, pathname, challengesListQuery?.challenges, opportunityName]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage paths={currentPaths} data={challengesList || []} />
      </Route>
      <Route exact path={`${path}/:challengeId`}>
        <ChallengePage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:challengeId/groups`}>
        <ChallengeGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:challengeId/opportunities`}>
        <ChallengeOpportunities paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:challengeId/groups/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:challengeId/opportunities/:opportunityId/groups`}>
        <OpportunityGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:challengeId/opportunities/:opportunityId/groups/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface ChallengeParameters {
  challengeId: string;
}

const ChallengeGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<ChallengeParameters>();

  const { data } = useChallengeGroupsQuery({ variables: { id: Number(challengeId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, data]);
  const groups = data?.challenge?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={currentPaths} data={groups || []} />;
};

const ChallengeOpportunities: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<ChallengeParameters>();

  const { data } = useChallengeOpportunitiesQuery({ variables: { id: Number(challengeId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths, data]);
  const opportunities = data?.challenge?.opportunities?.map(o => ({
    id: o.id,
    value: o.name,
    url: `${url}/${o.id}/groups`,
  }));

  return <ListPage paths={currentPaths} data={opportunities || []} />;
};

interface OpportunityParameters {
  opportunityId: string;
}

const OpportunityGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { opportunityId } = useParams<OpportunityParameters>();

  const { data } = useOpportunityGroupsQuery({ variables: { id: Number(opportunityId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, data]);
  const groups = data?.opportunity?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={currentPaths} data={groups || []} />;
};
