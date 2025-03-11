import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export const organizationAdminTabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Index,
    route: 'profile',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Account,
    route: 'account',
    icon: SellOutlinedIcon,
  },
  {
    section: SettingsSection.Community,
    route: 'community',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Authorization,
    route: 'authorization',
    icon: GppGoodOutlinedIcon,
  },
  {
    section: SettingsSection.Settings,
    route: 'settings',
    icon: SettingsOutlinedIcon,
  },
];
