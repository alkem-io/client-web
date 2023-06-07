import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import HubPageBanner from '../../../challenge/hub/layout/HubPageBanner';
import HubTabs from '../../../challenge/hub/layout/HubTabs';
import SearchDialog from '../../search/SearchDialog';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';

interface HubSettingsLayoutProps {
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
    section: SettingsSection.HubSettings,
    route: 'settings',
    icon: GppGoodOutlinedIcon,
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
  {
    section: SettingsSection.Authorization,
    route: 'authorization',
    icon: GppGoodOutlinedIcon,
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
  {
    section: SettingsSection.Storage,
    route: 'storage',
    icon: Inventory2OutlinedIcon,
  },
];

const HubSettingsLayout: FC<HubSettingsLayoutProps> = props => {
  const entityAttrs = useHub();

  const { hubNameId } = useHub();

  return (
    <>
      <EntitySettingsLayout
        entityTypeName="hub"
        tabs={tabs}
        pageBannerComponent={HubPageBanner}
        tabsComponent={HubTabs}
        {...entityAttrs}
        {...props}
      />
      <SearchDialog searchRoute={`${buildHubUrl(hubNameId)}/search`} />
    </>
  );
};

export default HubSettingsLayout;
