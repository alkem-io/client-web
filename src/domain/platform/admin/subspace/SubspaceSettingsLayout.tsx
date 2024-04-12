import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useSubSpace } from '../../../journey/subspace/hooks/useChallenge';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import SubspacePageBanner from '../../../journey/subspace/layout/SubspacePageBanner';
import SubspaceTabs from '../../../journey/subspace/layout/SubspaceTabs';
import JourneyBreadcrumbs from '../../../journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';

interface SubspaceSettingsLayoutProps {
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
  {
    section: SettingsSection.Subsubspaces,
    route: 'opportunities',
    icon: FlagOutlinedIcon,
  },
  {
    section: SettingsSection.SpaceSettings,
    route: 'settings',
    icon: GppGoodOutlinedIcon,
  },
];

const SubspaceSettingsLayout: FC<SubspaceSettingsLayoutProps> = props => {
  const entityAttrs = useSubSpace();

  return (
    <EntitySettingsLayout
      entityTypeName="subspace"
      subheaderTabs={tabs}
      pageBannerComponent={SubspacePageBanner}
      tabsComponent={SubspaceTabs}
      breadcrumbs={<JourneyBreadcrumbs settings />}
      {...entityAttrs}
      {...props}
    />
  );
};

export default SubspaceSettingsLayout;
