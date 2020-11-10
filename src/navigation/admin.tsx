import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
/*lib imports end*/
import { AdminPage, GroupPage, UserPage } from '../components/Admin';
import Loading from '../components/core/Loading';
import { User, useUsersQuery } from '../generated/graphql';
import { FourOuFour, PageProps } from '../pages';
/*local files imports end*/

export const Admin: FC = () => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'admin', real: true }], []);

  return (
    <>
      <Switch>
        <Route exact path={`${path}`}>
          <AdminPage paths={currentPaths} />
        </Route>
        <Route path={`${path}/users`}>
          <Users paths={currentPaths} />
        </Route>
        <Route path={`${path}/groups`}>
          <GroupPage paths={currentPaths} />
        </Route>
        <Route path="*">
          <FourOuFour />
        </Route>
      </Switch>
    </>
  );
};

const Users: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useUsersQuery();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'user', real: true }], [paths]);

  const users = (data?.users || []) as User[];
  if (loading) {
    return <Loading />;
  }
  return (
    <Switch>
      <Route exact path={`${path}`}>
        <UserPage users={users} paths={currentPaths} />
      </Route>
      {/* <Route path={`${path}/new`}>
        <UserEdit editMode={EditMode.new} />
      </Route>
      <Route exact path={`${path}/:userId/edit`}>
        <UserEdit editMode={EditMode.edit} />
      </Route>
      <Route exact path={`${path}/:userId`}>
        <UserEdit editMode={EditMode.readOnly} />
      </Route> */}
    </Switch>
  );
};
