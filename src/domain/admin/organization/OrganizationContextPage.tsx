import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../../../components/composite/layout/EntitySettingsLayout/constants';
import OrganizationPage from '../../../components/Admin/Organization/OrganizationPage';
import { EditMode } from '../../../models/editMode';
import { SettingsPageProps } from '../../../components/composite/layout/EntitySettingsLayout/types';

const OrganizationContextPage: FC<SettingsPageProps> = ({ paths }) => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Context}>
      <OrganizationPage mode={EditMode.edit} paths={paths} />
    </OrganizationAdminLayout>
  );
};

export default OrganizationContextPage;
