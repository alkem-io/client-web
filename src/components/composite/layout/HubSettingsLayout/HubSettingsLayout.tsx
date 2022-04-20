import React, { FC } from 'react';
import { Box } from '@mui/material';
import SettingsTabs from '../EntitySettingsLayout/SettingsTabs';
import { SettingsSection } from '../EntitySettingsLayout/constants';
import { TabDefinition } from '../../../core/PageTabs/PageTabs';
import { useHub } from '../../../../hooks';
import { EntityLinkComponent } from '../../../Admin/EntityLinkComponent';

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
      <Box paddingY={1}>
        <EntityLinkComponent {...provided} />
      </Box>
      <SettingsTabs tabs={tabs} currentTab={currentTab} aria-label="Hub Settings tabs" routePrefix={tabRoutePrefix} />
      {children}
    </>
  );
};

export default HubSettingsLayout;
