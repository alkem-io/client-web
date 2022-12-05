import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import OrganizationPage from '../components/Organization/OrganizationPage';
import { EditMode } from '../../../../core/ui/forms/editMode';
import { SettingsPageProps } from '../layout/EntitySettings/types';

const OrganizationProfilePage: FC<SettingsPageProps> = ({ paths }) => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Profile}>
      <OrganizationPage mode={EditMode.edit} paths={paths} />
    </OrganizationAdminLayout>
  );
};

export default OrganizationProfilePage;
