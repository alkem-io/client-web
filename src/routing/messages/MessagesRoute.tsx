import React, { FC, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404, MessagesPage } from '../../pages';

export const MessagesRoute: FC = () => {
  const url = '';
  const currentPaths = useMemo(() => [{ value: url, name: 'messages', real: true }], []);

  return (
    <Routes>
      <Route>
        <MessagesPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
