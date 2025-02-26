import React, { FC } from 'react';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationPage from '../../../platform/admin/components/Organization/OrganizationPage';
import { EditMode } from '@/core/ui/forms/editMode';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';

const OrganizationAdminProfilePage: FC<SettingsPageProps> = () => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Index}>
      <OrganizationPage mode={EditMode.edit} />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAdminProfilePage;
