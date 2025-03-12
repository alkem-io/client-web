import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpace } from '../SpaceContext/useSpace';
import SpaceAboutPage from '../about/SpaceAboutPage';
import SpaceTabbedLayoutRoute from './SpaceTabbedLayoutRoute';
import SpaceSkeletonLayout from '../layout/SpaceSkeleton/SpaceSkeletonLayout';

const routes = { ...EntityPageSection };

const SpaceRoute = () => {
  const { permissions, loading } = useSpace();

  if (loading) {
    <Routes>
      <Route path="*" element={<SpaceSkeletonLayout />} />
    </Routes>;
  }

  if (!permissions.canRead) {
    return (
      <Routes>
        <Route path={routes.About} element={<SpaceAboutPage />} />
        <Route path="*" element={<Navigate to={routes.About} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="*" element={<SpaceTabbedLayoutRoute />} />
    </Routes>
  );
};

export default SpaceRoute;
