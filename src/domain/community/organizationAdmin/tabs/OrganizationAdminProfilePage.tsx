import type { FC } from 'react';
import { EditMode } from '@/core/ui/forms/editMode';
import OrganizationPage from '../../../platformAdmin/components/Organization/OrganizationPage';
import { SettingsSection } from '../../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '../../../platformAdmin/layout/EntitySettingsLayout/types';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';

const OrganizationAdminProfilePage: FC<SettingsPageProps> = () => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Index}>
      <OrganizationPage mode={EditMode.edit} />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAdminProfilePage;
