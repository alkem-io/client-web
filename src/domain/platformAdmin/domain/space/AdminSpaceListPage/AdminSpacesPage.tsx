import React, { FC } from 'react';
import SpaceList from './SpaceList';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';

/**
 * AdminSpacesPageV2 - Optimized version
 * Uses lazy loading for license plan data - only fetched when manage license dialog is opened
 */
const AdminSpacesPage: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Space}>
      <SpaceList />
    </AdminLayout>
  );
};

export default AdminSpacesPage;
