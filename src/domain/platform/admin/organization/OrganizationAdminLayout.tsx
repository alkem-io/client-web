import React, { FC } from 'react';
import { CommonTabs, SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { useOrganization } from '../../../community/contributor/organization/hooks/useOrganization';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import OrganizationPageBanner from '../../../community/contributor/organization/layout/OrganizationPageBanner';
import OrganizationTabs from '../../../community/contributor/organization/layout/OrganizationTabs';

const tabs = [SettingsSection.Profile, SettingsSection.Community, SettingsSection.Authorization].map(section => {
  return CommonTabs.find(tab => tab.section === section)!;
});

interface OrganizationAdminLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = props => {
  const entityAttrs = useOrganization();

  return (
    <EntitySettingsLayout
      entityTypeName="organization"
      tabs={tabs}
      pageBannerComponent={OrganizationPageBanner}
      tabsComponent={OrganizationTabs}
      {...entityAttrs}
      {...props}
    />
  );
};

export default OrganizationAdminLayout;
