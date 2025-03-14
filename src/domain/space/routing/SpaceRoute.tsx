import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpace } from '../SpaceContext/useSpace';
import SpaceAboutPage from '../about/SpaceAboutPage';
import SpaceTabbedLayoutRoute from './SpaceTabbedLayoutRoute';
import SpaceSkeletonLayout from '../layout/Skeletons/SpaceSkeletonLayout';
import SubSpaceSkeletonLayout from '../layout/Skeletons/SubSpaceSkeletonLayout';

const routes = { ...EntityPageSection };

const SpaceRoute = () => {
  const { space, permissions, loading } = useSpace();

  if (loading) {
    return (
      <Routes>
        <Route path="challenges/*" element={<SubSpaceSkeletonLayout />} />
        <Route path="*" element={<SpaceSkeletonLayout />} />
      </Routes>
    );
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
      <Route path="*" element={<SpaceTabbedLayoutRoute spaceId={space.id} />} />
    </Routes>
  );
};

export default SpaceRoute;
