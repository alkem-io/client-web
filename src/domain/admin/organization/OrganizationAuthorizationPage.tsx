import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import OrganizationAdminAuthorizationView from './views/OrganizationAdminAuthorizationView';
import OrganizationOwnerAuthorizationView from './views/OrganizationOwnerAuthorizationView';
import OrganizationAuthorizationPreferencesPageView from './views/OrganizationAuthorizationPreferencesPageView';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SectionSpacer } from '../../shared/components/Section/Section';

const OrganizationAuthorizationPage: FC<SettingsPageProps> = ({ paths }) => {
  useAppendBreadcrumb(paths, { name: 'authorization' });

  return (
    <OrganizationAdminLayout currentTab={SettingsSection.Authorization}>
      <OrganizationAdminAuthorizationView />
      <SectionSpacer />
      <OrganizationOwnerAuthorizationView />
      <SectionSpacer />
      <OrganizationAuthorizationPreferencesPageView />
    </OrganizationAdminLayout>
  );
};

export default OrganizationAuthorizationPage;
