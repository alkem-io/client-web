import React, { FC } from 'react';
import { CommonTabs, SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import HubPageBanner from '../../../challenge/hub/layout/HubPageBanner';
import HubTabs from '../../../challenge/hub/layout/HubTabs';

interface HubSettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  ...CommonTabs,
  {
    // TODO: Move Calendar tabs to CommonTabs if the calendar is per journey, or remove this comment if it's per hub
    section: SettingsSection.Calendar,
    route: 'calendar',
    icon: CalendarMonthOutlinedIcon,
  },
  {
    section: SettingsSection.Challenges,
    route: 'challenges',
    icon: FlagOutlinedIcon,
  },
  {
    section: SettingsSection.Templates,
    route: 'templates',
    icon: WbIncandescentOutlinedIcon,
  },
];

const HubSettingsLayout: FC<HubSettingsLayoutProps> = props => {
  const entityAttrs = useHub();

  return (
    <EntitySettingsLayout
      entityTypeName="hub"
      tabs={tabs}
      pageBannerComponent={HubPageBanner}
      tabsComponent={HubTabs}
      {...entityAttrs}
      {...props}
    />
  );
};

export default HubSettingsLayout;
