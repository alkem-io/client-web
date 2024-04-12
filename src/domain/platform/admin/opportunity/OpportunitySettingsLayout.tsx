import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import OpportunityPageBanner from '../../../journey/opportunity/layout/OpportunityPageBanner';
import OpportunityTabs from '../../../journey/opportunity/layout/OpportunityTabs';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import JourneyBreadcrumbs from '../../../journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';

interface OpportunitySettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Profile,
    route: 'profile',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Context,
    route: 'context',
    icon: ListOutlinedIcon,
  },
  {
    section: SettingsSection.Community,
    route: 'community',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Communications,
    route: 'communications',
    icon: ForumOutlinedIcon,
  },
];

const OpportunitySettingsLayout: FC<OpportunitySettingsLayoutProps> = props => {
  const entityAttrs = useOpportunity();

  return (
    <EntitySettingsLayout
      entityTypeName="subsubspace"
      subheaderTabs={tabs}
      pageBannerComponent={OpportunityPageBanner}
      tabsComponent={OpportunityTabs}
      breadcrumbs={<JourneyBreadcrumbs settings />}
      {...entityAttrs}
      {...props}
    />
  );
};

export default OpportunitySettingsLayout;
