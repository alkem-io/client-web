import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Link, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

/*lib imports end*/
import { AdminPage, EditMode, GroupPage, ListPage, UserList, UserPage } from '../components/Admin';
import Loading from '../components/core/Loading';
import { useTransactionScope } from '../hooks/useSentry';
import {
  useChallengeGroupsQuery,
  useChallengeNameQuery,
  useChallengeOpportunitiesQuery,
  useEcoverseChallengesListQuery,
  useEcoverseGroupsListQuery,
  useOpportunityGroupsQuery,
  useOpportunityNameQuery,
  useUserQuery,
  useUsersQuery,
} from '../generated/graphql';
import { UserModel } from '../models/User';
import { FourOuFour, PageProps } from '../pages';
import Typography from '../components/core/Typography';
import ChallengePage from '../components/Admin/ChallengePage';
import { useUpdateNavigation } from '../hooks/useNavigation';
import Button from '../components/core/Button';
import ProfilePage, { ProfileSubmitMode } from '../components/Admin/ProfilePage';
import OpportunityPage from '../components/Admin/OpportunityPage';
/*local files imports end*/

export const Admin: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

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

  if (loading) return <Loading text={'Loading user...'} />;
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
  const { data: challengesListQuery } = useEcoverseChallengesListQuery();

  const challengesList = challengesListQuery?.challenges?.map(c => ({
    id: c.id,
    value: c.name,
    url: `${url}/${c.id}`,
  }));

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [
    paths,
    challengesListQuery?.challenges,
  ]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <div className={'d-flex'}>
          <Button className={'mb-4 ml-auto'} as={Link} to={`${url}/new`}>
            New
          </Button>
        </div>
        <ListPage paths={currentPaths} data={challengesList || []} />
      </Route>
      <Route path={`${path}/new`}>
        <ProfilePage mode={ProfileSubmitMode.createChallenge} paths={currentPaths} title="New challenge" />
      </Route>
      <Route exact path={`${path}/:challengeId/edit`}>
        <ProfilePage mode={ProfileSubmitMode.updateChallenge} paths={currentPaths} title="Edit challenge" />
      </Route>
      <Route path={`${path}/:challengeId`}>
        <ChallengeRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const ChallengeRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { challengeId } = useParams<Parameters>();

  const { data } = useChallengeNameQuery({ variables: { id: Number(challengeId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: data?.challenge?.name || '', real: true }], [
    paths,
    data?.challenge?.name,
  ]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ChallengePage paths={currentPaths} />
      </Route>
      <Route path={`${path}/groups`}>
        <ChallengeGroupRoutes paths={currentPaths} />
      </Route>
      <Route path={`${path}/opportunities`}>
        <OpportunitiesRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface Parameters {
  challengeId: string;
  opportunityId: string;
  groupId: string;
}

const ChallengeGroupRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  useUpdateNavigation({ currentPaths });

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ChallengeGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
    </Switch>
  );
};

const ChallengeGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<Parameters>();
  const { data } = useChallengeGroupsQuery({ variables: { id: Number(challengeId) } });

  const groups = data?.challenge?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} />;
};

const OpportunitiesRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'opportunities', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ChallengeOpportunities paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <ProfilePage title={'Create opportunity'} mode={ProfileSubmitMode.createOpportunity} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:opportunityId`}>
        <OpportunityRoutes paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

const OpportunityRoutes: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { opportunityId } = useParams<Parameters>();

  const { data } = useOpportunityNameQuery({ variables: { id: Number(opportunityId) } });

  const currentPaths = useMemo(() => [...paths, { value: url, name: data?.opportunity?.name || '', real: true }], [
    paths,
    data?.opportunity?.name,
    url,
  ]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <OpportunityPage paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/groups`}>
        <OpportunityGroups paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/edit`}>
        <ProfilePage title={'Edit opportunity'} mode={ProfileSubmitMode.updateOpportunity} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/groups/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
    </Switch>
  );
};

const ChallengeOpportunities: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { challengeId } = useParams<Parameters>();

  const { data } = useChallengeOpportunitiesQuery({ variables: { id: Number(challengeId) } });

  const opportunities = data?.challenge?.opportunities?.map(o => ({
    id: o.id,
    value: o.name,
    url: `${url}/${o.id}`,
  }));

  return (
    <>
      <div className={'d-flex'}>
        <Button className={'mb-4 ml-auto'} as={Link} to={`${url}/new`}>
          New
        </Button>
      </div>
      <ListPage paths={paths} data={opportunities || []} />
    </>
  );
};

const OpportunityGroups: FC<PageProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const { opportunityId } = useParams<Parameters>();

  const { data } = useOpportunityGroupsQuery({ variables: { id: Number(opportunityId) } });

  const groups = data?.opportunity?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  return <ListPage paths={paths} data={groups || []} />;
};
