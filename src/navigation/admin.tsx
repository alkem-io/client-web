import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
/*lib imports end*/
import { AdminPage, EditMode, GroupPage, ListPage, UserList, UserPage } from '../components/Admin';
import { SearchableListData } from '../components/Admin/SearchableList';
import Loading from '../components/core/Loading';
import { useTransactionScope } from '../hooks/useSentry';
import {
  EcoverseChallengeGroupsQuery,
  useEcoverseChallengeGroupsQuery,
  useUserQuery,
  useUsersQuery,
} from '../generated/graphql';
import { UserModel } from '../models/User';
import { FourOuFour, PageProps } from '../pages';
import { challengesMapper, groupsMapper } from '../utils';

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
    return <Loading />;
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

  if (loading) return <Loading />;
  const user = data?.user as UserModel;
  if (user) {
    return <UserPage user={user} paths={paths} mode={mode} title={title} />;
  }
  return <FourOuFour />;
};

const GroupsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useEcoverseChallengeGroupsQuery();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);

  const ecoverseName = data?.name || 'Ecoverse';

  const ecoverse = {
    id: '1',
    value: `${ecoverseName} (ecoverse)`,
    url: `${path}/ecoverse`,
  };
  const mapper = challengesMapper(`${path}`);
  const challenges = useMemo(() => [ecoverse, ...((data && data.challenges) || []).map(mapper)], [data]);

  if (loading) return <Loading />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <h3>Ecoverse/Challenges</h3>
        <ListPage data={challenges} paths={currentPaths} />
      </Route>
      <Route path={`${path}/:challengeId`}>
        <ChallengesRoute data={data} paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface ChallengesRouteProps extends PageProps {
  data: EcoverseChallengeGroupsQuery | undefined;
}

const ChallengesRoute: FC<ChallengesRouteProps> = ({ data, paths }) => {
  const { path, url } = useRouteMatch();
  const { challengeId } = useParams<{ challengeId: string }>();

  const groupsData = useMemo(() => {
    let groups: SearchableListData[] = [];
    let name = '';
    const mapper = groupsMapper(`${url}`);

    if (data) {
      if (challengeId !== 'ecoverse') {
        const challenge = data?.challenges.find(c => c.textID === challengeId);
        if (challenge) {
          name = challenge.name;
          if (challenge.groups) {
            groups = challenge.groups?.map(mapper);
          }
        }
      } else {
        name = `${data?.name} (ecoverse)`;
        groups = data?.groups.filter(g => g.name !== 'members').map(mapper);
      }
    }
    return {
      name,
      groups,
    };
  }, [challengeId, data]);

  const currentPaths = useMemo(() => [...paths, { value: url, name: groupsData.name, real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage paths={currentPaths} data={groupsData.groups} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
