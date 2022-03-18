import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { PageProps } from '../../pages';
import { useAspect } from '../../context/aspect/AspectProvider';
import AspectDashboardPage from '../../pages/aspect/AspectDashboardPage';
import AspectSettingsPage from '../../pages/aspect/AspectSettingsPage';
import AspectTabs from './AspectTabs';

export interface AspectRouteProps extends PageProps {}

const AspectRoute: FC<AspectRouteProps> = ({ paths }) => {
  const { displayName = '' } = useAspect();
  const { pathname } = useResolvedPath('.');
  const [lastPath] = paths.slice(-1);
  const contextPath = `${lastPath.value}/contribute`;

  const currentPaths = useMemo(
    () => [
      ...paths,
      { value: contextPath, name: 'contribute', real: true },
      { value: '', name: 'aspects', real: false },
      { value: pathname, name: displayName, real: true },
    ],
    [paths, displayName, pathname, contextPath]
  );

  return (
    <Routes>
      <Route path={'/'} element={<AspectTabs />}>
        <Route index element={<Navigate replace to={'dashboard'} />} />
        <Route path={'dashboard'} element={<AspectDashboardPage paths={currentPaths} />} />
        <Route path={'settings'} element={<AspectSettingsPage paths={currentPaths} />} />
      </Route>
    </Routes>
  );
};

export default AspectRoute;
