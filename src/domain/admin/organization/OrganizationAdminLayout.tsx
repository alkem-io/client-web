import React, { FC } from 'react';
import SettingsTabs from '../../../components/composite/layout/EntitySettingsLayout/SettingsTabs';
import { TabDefinition } from '../../../components/core/PageTabs/PageTabs';
import { SettingsSection } from '../../../components/composite/layout/EntitySettingsLayout/constants';
import AdminLayoutEntityTitle from '../layout/AdminLayoutEntityTitle';
import { useOrganization } from '../../../hooks';

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Context,
    route: 'context',
  },
  {
    section: SettingsSection.Community,
    route: 'community',
  },
  {
    section: SettingsSection.Authorization,
    route: 'authorization',
  },
];

interface OrganizationAdminLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const OrganizationAdminLayout: FC<OrganizationAdminLayoutProps> = ({
  currentTab,
  tabRoutePrefix = '../',
  children,
}) => {
  const provided = useOrganization();

  return (
    <>
      <AdminLayoutEntityTitle {...provided} />
      <SettingsTabs
        tabs={tabs}
        currentTab={currentTab}
        aria-label="Challenge Settings tabs"
        routePrefix={tabRoutePrefix}
      />
      {children}
    </>
  );
};

export default OrganizationAdminLayout;
