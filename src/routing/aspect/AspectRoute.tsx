import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { PageProps } from '../../pages';
import AspectTabs from './AspectTabs';
import AspectDashboardPage from '../../pages/aspect/AspectDashboardPage';
import { useAspect } from '../../context/aspect/AspectProvider';

export interface AspectRouteProps extends PageProps {}

const AspectRoute: FC<AspectRouteProps> = ({ paths: _paths }) => {
  const { displayName = '' } = useAspect();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => [
      ..._paths,
      { value: '', name: 'aspects', real: false },
      { value: resolved.pathname, name: displayName, real: true },
    ],
    [_paths, displayName]
  );
  return (
    <Routes>
      <Route path={'/'} element={<AspectTabs />}>
        <Route index element={<Navigate replace to={'dashboard'} />} />
        <Route path={'dashboard'} element={<AspectDashboardPage paths={currentPaths} />} />
      </Route>
    </Routes>
  );
};
export default AspectRoute;
