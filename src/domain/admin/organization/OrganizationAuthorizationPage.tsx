import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../../../components/composite/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../components/composite/layout/EntitySettingsLayout/types';
import OrganizationAdminAuthorizationView from './views/OrganizationAdminAuthorizationView';
import OrganizationOwnerAuthorizationView from './views/OrganizationOwnerAuthorizationView';
import OrganizationAuthorizationPreferencesPageView from './views/OrganizationAuthorizationPreferencesPageView';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SectionSpacer } from '../../../components/core/Section/Section';

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
