import React, { FC } from 'react';
import { CommonTabs, SettingsSection } from '../layout/EntitySettings/constants';
import { TabDefinition } from '../../../components/core/PageTabs/PageTabs';
import { useHub } from '../../../hooks';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';
import EntitySettingsLayout from '../layout/EntitySettings/EntitySettingsLayout';

interface HubSettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const tabs: TabDefinition<SettingsSection>[] = [
  ...CommonTabs,
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

  return <EntitySettingsLayout entityTypeName="hub" tabs={tabs} {...entityAttrs} {...props} />;
};

export default HubSettingsLayout;
