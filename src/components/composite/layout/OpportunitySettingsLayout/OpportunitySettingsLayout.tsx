import React, { FC } from 'react';
import { Box } from '@mui/material';
import SettingsTabs from '../EntitySettingsLayout/SettingsTabs';
import { SettingsSection } from '../EntitySettingsLayout/constants';
import { TabDefinition } from '../../../core/PageTabs/PageTabs';
import { useOpportunity } from '../../../../hooks';
import { EntityLinkComponent } from '../../../Admin/EntityLinkComponent';

interface OpportunitySettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

export const tabs: TabDefinition<SettingsSection>[] = [
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
];

const OpportunitySettingsLayout: FC<OpportunitySettingsLayoutProps> = ({ currentTab, tabRoutePrefix, children }) => {
  const provided = useOpportunity();

  return (
    <>
      <Box paddingY={1}>
        <EntityLinkComponent {...provided} />
      </Box>
      <SettingsTabs
        tabs={tabs}
        currentTab={currentTab}
        aria-label="Opportunity Settings tabs"
        routePrefix={tabRoutePrefix}
      />
      {children}
    </>
  );
};

export default OpportunitySettingsLayout;
