import React, { FC } from 'react';
import { CommonTabs, SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { useOpportunity } from '../../../challenge/opportunity/hooks/useOpportunity';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import OpportunityPageBanner from '../../../challenge/opportunity/layout/OpportunityPageBanner';
import OpportunityTabs from '../../../challenge/opportunity/layout/OpportunityTabs';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import PolylineOutlinedIcon from '@mui/icons-material/PolylineOutlined';

interface OpportunitySettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  ...CommonTabs,
  {
    section: SettingsSection.InnovationFlow,
    route: 'innovation-flow',
    icon: PolylineOutlinedIcon,
  },
];

const OpportunitySettingsLayout: FC<OpportunitySettingsLayoutProps> = props => {
  const entityAttrs = useOpportunity();

  return (
    <EntitySettingsLayout
      entityTypeName="opportunity"
      tabs={tabs}
      pageBannerComponent={OpportunityPageBanner}
      tabsComponent={OpportunityTabs}
      {...entityAttrs}
      {...props}
    />
  );
};

export default OpportunitySettingsLayout;
