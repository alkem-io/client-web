import React, { FC, useMemo } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { Error404, PageProps } from '../../../pages';
import { UserListPage } from '../../../pages/Admin/User/UserListPage';
import { UserPage } from '../../../pages/Admin/User/UserPage';
import { EditMode } from '../../../models/editMode';
import { nameOfUrl } from '../../url-params';

export const UsersRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'users', real: true }], [paths]);

  return (
    <Routes>
      <Route exact path={`${path}`}>
        <UserListPage paths={currentPaths} />
      </Route>
      {/* creating users is disabled */}
      {/* <Route exact path={`${path}/new`}>
        <UserPage mode={EditMode.new} paths={currentPaths} title="New user" />
      </Route> */}
      <Route exact path={`${path}/:${nameOfUrl.userId}/edit`}>
        <UserPage paths={currentPaths} mode={EditMode.edit} />
      </Route>
      <Route exact path={`${path}/:${nameOfUrl.userId}`}>
        <UserPage paths={currentPaths} mode={EditMode.readOnly} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
