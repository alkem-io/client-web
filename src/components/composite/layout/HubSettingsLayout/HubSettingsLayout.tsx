import React, { FC } from 'react';
import SettingsTabs from '../EntitySettingsLayout/SettingsTabs';
import { SettingsSection } from '../EntitySettingsLayout/constants';
import { TabDefinition } from '../../../core/PageTabs/PageTabs';
import { useHub } from '../../../../hooks';
import AdminLayoutEntityTitle from '../../../../domain/admin/layout/AdminLayoutEntityTitle';

interface HubSettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Profile,
    route: 'profile',
  },
  {
    section: SettingsSection.Context,
    route: 'context',
  },
  {
    section: SettingsSection.Community,
    route: 'community',
  },
  {
    section: SettingsSection.Communications,
    route: 'communications',
  },
  {
    section: SettingsSection.Authorization,
    route: 'authorization',
  },
  {
    section: SettingsSection.Challenges,
    route: 'challenges',
  },
];

const HubSettingsLayout: FC<HubSettingsLayoutProps> = ({ currentTab, tabRoutePrefix, children }) => {
  const provided = useHub();

  return (
    <>
      <AdminLayoutEntityTitle {...provided} />
      <SettingsTabs tabs={tabs} currentTab={currentTab} aria-label="Hub Settings tabs" routePrefix={tabRoutePrefix} />
      {children}
    </>
  );
};

export default HubSettingsLayout;
