import { FC } from 'react';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import OrganizationAssociatesView from '../views/OrganizationAssociatesView';

const OrganizationAdminCommunityPage: FC<SettingsPageProps> = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Community}>
    <OrganizationAssociatesView />
  </OrganizationAdminLayout>
);

export default OrganizationAdminCommunityPage;
