import React, { FC } from 'react';
import HubSettingsTabs from './HubSettingsTabs';
import { HubSettingsSection, tabs } from './constants';

interface HubSettingsLayoutProps {
  currentTab: HubSettingsSection;
  tabRoutePrefix?: string;
}

const HubSettingsLayout: FC<HubSettingsLayoutProps> = ({ currentTab, tabRoutePrefix, children }) => {
  return (
    <>
      <HubSettingsTabs
        tabs={tabs}
        currentTab={currentTab}
        aria-label="Hub Settings tabs"
        routePrefix={tabRoutePrefix}
      />
      {children}
    </>
  );
};

export default HubSettingsLayout;
