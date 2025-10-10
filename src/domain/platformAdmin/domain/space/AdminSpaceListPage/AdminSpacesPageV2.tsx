import React, { FC } from 'react';
import SpaceListV2 from './SpaceListV2';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';

/**
 * AdminSpacesPageV2 - Optimized version
 * Uses lazy loading for license plan data - only fetched when manage license dialog is opened
 */
const AdminSpacesPageV2: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Space}>
      <SpaceListV2 />
    </AdminLayout>
  );
};

export default AdminSpacesPageV2;
