import React, { FC } from 'react';
import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import OrganizationAdminAuthorizationView from './views/OrganizationAdminAuthorizationView';
import OrganizationOwnerAuthorizationView from './views/OrganizationOwnerAuthorizationView';
import OrganizationAuthorizationPreferencesPageView from './views/OrganizationAuthorizationPreferencesPageView';
import { SectionSpacer } from '../../../shared/components/Section/Section';

const OrganizationAuthorizationPage: FC<SettingsPageProps> = () => {
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
