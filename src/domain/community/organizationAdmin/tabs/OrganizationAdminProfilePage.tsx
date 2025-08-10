import React, { FC } from 'react';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationPage from '../../../platformAdmin/components/Organization/OrganizationPage';
import { EditMode } from '@/core/ui/forms/editMode';
import { SettingsPageProps } from '../../../platformAdmin/layout/EntitySettingsLayout/types';

const OrganizationAdminProfilePage: FC<SettingsPageProps> = () => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Index}>
      <OrganizationPage mode={EditMode.edit} />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAdminProfilePage;
