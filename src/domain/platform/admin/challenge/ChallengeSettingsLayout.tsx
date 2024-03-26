import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import ChallengePageBanner from '../../../journey/challenge/layout/ChallengePageBanner';
import ChallengeTabs from '../../../journey/challenge/layout/ChallengeTabs';
import JourneyBreadcrumbs from '../../../journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';

interface ChallengeSettingsLayoutProps {
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
    section: SettingsSection.Authorization,
    route: 'authorization',
    icon: GppGoodOutlinedIcon,
  },
  {
    section: SettingsSection.Opportunities,
    route: 'opportunities',
    icon: FlagOutlinedIcon,
  },
  {
    section: SettingsSection.SpaceSettings,
    route: 'settings',
    icon: GppGoodOutlinedIcon,
  },
];

const ChallengeSettingsLayout: FC<ChallengeSettingsLayoutProps> = props => {
  const entityAttrs = useChallenge();

  return (
    <EntitySettingsLayout
      entityTypeName="challenge"
      subheaderTabs={tabs}
      pageBannerComponent={ChallengePageBanner}
      tabsComponent={ChallengeTabs}
      breadcrumbs={<JourneyBreadcrumbs settings />}
      {...entityAttrs}
      {...props}
    />
  );
};

export default ChallengeSettingsLayout;
