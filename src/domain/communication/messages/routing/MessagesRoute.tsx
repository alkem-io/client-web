import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { MessagesPage } from '../pages/Messages';
import { Error404 } from '../../../../core/pages/Errors/Error404';

export const MessagesRoute: FC = () => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [{ value: url, name: 'messages', real: true }], [url]);

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<MessagesPage paths={currentPaths} />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
