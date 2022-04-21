import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../../../components/composite/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../components/composite/layout/EntitySettingsLayout/types';
import { OrganizationGroupsView } from './views/OrganizationGroupsView';
import OrganizationMembersView from './views/OrganizationMembersView';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SectionSpacer } from '../../../components/core/Section/Section';

const OrganizationCommunityPage: FC<SettingsPageProps> = ({ paths }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community}>
      <OrganizationMembersView />
      <SectionSpacer />
      <OrganizationGroupsView />
    </OrganizationAdminLayout>
  );
};

export default OrganizationCommunityPage;
