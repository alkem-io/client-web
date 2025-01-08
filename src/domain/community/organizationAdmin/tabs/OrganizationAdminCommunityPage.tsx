import { FC } from 'react';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '../../../platform/admin/layout/EntitySettingsLayout/types';
import { OrganizationGroupsView } from '../views/OrganizationGroupsView';
import OrganizationAssociatesView from '../views/OrganizationAssociatesView';
import { SectionSpacer } from '@/domain/shared/components/Section/Section';

const OrganizationAdminCommunityPage: FC<SettingsPageProps> = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Community}>
    <OrganizationAssociatesView />
    <SectionSpacer />
    <OrganizationGroupsView />
  </OrganizationAdminLayout>
);

export default OrganizationAdminCommunityPage;
