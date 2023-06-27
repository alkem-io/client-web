import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import { OrganizationGroupsView } from './views/OrganizationGroupsView';
import OrganizationAssociatesView from './views/OrganizationAssociatesView';
import { SectionSpacer } from '../../../shared/components/Section/Section';

const OrganizationCommunityPage: FC<SettingsPageProps> = () => {
  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community}>
      <OrganizationAssociatesView />
      <SectionSpacer />
      <OrganizationGroupsView />
    </OrganizationAdminLayout>
  );
};

export default OrganizationCommunityPage;
