import React, { FC, useMemo } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { Error404, MessagesPage } from '../../pages';

export const MessagesRoute: FC = () => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: 'messages', real: true }], []);

  return (
    <Routes>
      <Route exact path={`${path}`}>
        <MessagesPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
