import React, { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { TabDefinition } from '../layout/EntitySettingsLayout/EntitySettingsTabs';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EntitySettingsLayout from '../layout/EntitySettingsLayout/EntitySettingsLayout';
import ChallengePageBanner from '../../../challenge/challenge/layout/ChallengePageBanner';
import ChallengeTabs from '../../../challenge/challenge/layout/ChallengeTabs';
import PolylineOutlinedIcon from '@mui/icons-material/PolylineOutlined';

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
    section: SettingsSection.InnovationFlow,
    route: 'innovation-flow',
    icon: PolylineOutlinedIcon,
  },
];

const ChallengeSettingsLayout: FC<ChallengeSettingsLayoutProps> = props => {
  const entityAttrs = useChallenge();

  return (
    <EntitySettingsLayout
      entityTypeName="challenge"
      tabs={tabs}
      pageBannerComponent={ChallengePageBanner}
      tabsComponent={ChallengeTabs}
      {...entityAttrs}
      {...props}
    />
  );
};

export default ChallengeSettingsLayout;
