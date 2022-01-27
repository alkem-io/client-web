import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { Error404, MessagesPage } from '../../pages';

export const MessagesRoute: FC = () => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'messages', real: true }], []);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<MessagesPage paths={currentPaths} />}></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
