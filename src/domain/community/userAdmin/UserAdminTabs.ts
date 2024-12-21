import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsTabs';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { SellOutlined } from '@mui/icons-material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { Settings } from '@mui/icons-material';

export const UserAdminTabs: TabDefinition<SettingsSection>[] = [
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
    section: SettingsSection.Account,
    route: 'account',
    icon: SellOutlined,
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
  {
    section: SettingsSection.Settings,
    route: 'settings',
    icon: Settings,
  },
];
