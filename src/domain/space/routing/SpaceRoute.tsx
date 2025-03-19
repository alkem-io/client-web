import { Navigate, Route, Routes } from 'react-router-dom';
import React, { useMemo } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpace } from '../SpaceContext/useSpace';
import SpaceAboutPage from '../about/SpaceAboutPage';
import SpaceTabbedLayoutRoute from './SpaceTabbedLayoutRoute';

const routes = { ...EntityPageSection };

const SpaceRoute = () => {
  const { space, permissions, loading } = useSpace();

  const { isLoading, canRead, spaceId } = useMemo(() => {
    return {
      isLoading: loading,
      canRead: permissions.canRead,
      spaceId: space.id,
    };
  }, [space, permissions, loading]);

  // TODO: revise this conditional rendering on that route level
  // everytime we navigate to different route, it rerenders the whole page
  // ideally we should have this logic inside a component/s and keep the routes rendered once

  // return null because of layout shift
  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path={routes.About} element={<SpaceAboutPage />} />
      <Route
        path="*"
        element={<ReadPrivilegeRoute element={<SpaceTabbedLayoutRoute spaceId={spaceId} />} canRead={canRead} />}
      />
    </Routes>
  );
};

export default SpaceRoute;

const ReadPrivilegeRoute = ({ element, canRead }) => {
  if (!canRead) return <Navigate to={routes.About} />;
  return element;
};
