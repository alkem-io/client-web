import React, { FC } from 'react';
import { CommonTabs, SettingsSection } from '../layout/EntitySettings/constants';
import { useOpportunity } from '../../../../hooks';
import EntitySettingsLayout from '../layout/EntitySettings/EntitySettingsLayout';
import OpportunityPageBanner from '../../../challenge/opportunity/layout/OpportunityPageBanner';
import OpportunityTabs from '../../../challenge/opportunity/layout/OpportunityTabs';
import { TabDefinition } from '../../../../common/components/core/PageTabs/PageTabs';
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
