import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import OrganizationPage from '../components/Organization/OrganizationPage';
import { EditMode } from '@/core/ui/forms/editMode';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';

const OrganizationProfilePage: FC<SettingsPageProps> = () => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Profile}>
      <OrganizationPage mode={EditMode.edit} />
    </OrganizationAdminLayout>
  );
};

export default OrganizationProfilePage;
