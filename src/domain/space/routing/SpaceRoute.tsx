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

  if (!canRead) {
    return (
      <Routes>
        <Route path={routes.About} element={<SpaceAboutPage />} />
        <Route path="*" element={<Navigate to={routes.About} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="*" element={<SpaceTabbedLayoutRoute spaceId={spaceId} />} />
    </Routes>
  );
};

export default SpaceRoute;
