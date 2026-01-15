import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '@/domain/platformAdmin/layout/EntitySettingsLayout/EntitySettingsTabs';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

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
    icon: SellOutlinedIcon,
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
    icon: SettingsOutlinedIcon,
  },
  {
    section: SettingsSection.Security,
    route: 'security',
    icon: SecurityOutlinedIcon,
  },
];
