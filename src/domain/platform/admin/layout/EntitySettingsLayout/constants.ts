import { TabDefinition } from './EntitySettingsTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export enum SettingsSection {
  Profile = 'profile',
  Context = 'context',
  Community = 'community',
  Communications = 'communications',
  Authorization = 'authorization',
  Challenges = 'challenges',
  Opportunities = 'opportunities',
  Templates = 'templates',
  Storage = 'storage',
  MyProfile = 'my-profile',
  Membership = 'membership',
  Organizations = 'organizations',
  Notifications = 'notifications',
  Credentials = 'credentials',
  InnovationFlow = 'innovation-flow',
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

export const UserProfileTabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Membership,
    route: 'membership',
    icon: ContentPasteOutlinedIcon,
  },
  {
    section: SettingsSection.MyProfile,
    route: 'profile',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Organizations,
    route: 'organizations',
    icon: ForumOutlinedIcon,
  },
  {
    section: SettingsSection.Notifications,
    route: 'notifications',
    icon: NotificationsNoneOutlinedIcon,
  },
  {
    section: SettingsSection.Credentials,
    route: 'credentials',
    icon: VerifiedUserIcon,
  },
];
