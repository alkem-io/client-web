import React, { FC, useMemo } from 'react';
import { FourOuFour, PageProps } from '../../pages';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUserQuery, useUsersQuery } from '../../hooks/generated/graphql';
import { UserModel } from '../../models/User';
import Loading from '../../components/core/Loading/Loading';
import { UserList } from '../../components/Admin/User/UserList';
import { UserPage } from '../../pages/Admin/User/UserPage';
import { EditMode } from '../../utils/editMode';
import { useUrlParams } from '../../hooks';
import { nameOfUrl } from '../url-params';

export const UsersRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useUsersQuery({ fetchPolicy: 'cache-and-network' });

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
      {/* creating users is disabled */}
      {/* <Route exact path={`${path}/new`}>
        <UserPage mode={EditMode.new} paths={currentPaths} title="New user" />
      </Route> */}
      <Route exact path={`${path}/:${nameOfUrl.userId}/edit`}>
        <UserRoute mode={EditMode.edit} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:${nameOfUrl.userId}`}>
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

export const UserRoute: FC<UserProps> = ({ paths, mode, title }) => {
  const { userId } = useUrlParams();
  const { data, loading } = useUserQuery({ variables: { id: userId }, fetchPolicy: 'cache-and-network' });

  if (loading) return <Loading text={'Loading user...'} />;
  const user = data?.user as UserModel;
  if (user) {
    return <UserPage user={user} paths={paths} mode={mode} title={title} />;
  }
  return <FourOuFour />;
};
