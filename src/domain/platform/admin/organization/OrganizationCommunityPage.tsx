import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { OrganizationGroupsView } from './views/OrganizationGroupsView';
import OrganizationAssociatesView from './views/OrganizationAssociatesView';
import { useAppendBreadcrumb } from '../../../../core/routing/usePathUtils';
import { SectionSpacer } from '../../../shared/components/Section/Section';

const OrganizationCommunityPage: FC<SettingsPageProps> = ({ paths }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Community}>
      <OrganizationAssociatesView />
      <SectionSpacer />
      <OrganizationGroupsView />
    </OrganizationAdminLayout>
  );
};

export default OrganizationCommunityPage;
