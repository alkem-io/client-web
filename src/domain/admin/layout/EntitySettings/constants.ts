import { TabDefinition } from '../../../../components/core/PageTabs/PageTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';

export enum SettingsSection {
  Profile = 'profile',
  Context = 'context',
  Community = 'community',
  Communications = 'communications',
  Authorization = 'authorization',
  Challenges = 'challenges',
  Opportunities = 'opportunities',
}

export const CommonTabs: TabDefinition<SettingsSection>[] = [
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
];
