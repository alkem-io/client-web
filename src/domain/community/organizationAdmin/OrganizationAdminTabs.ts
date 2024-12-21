import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import { Settings, LocalOfferOutlined } from '@mui/icons-material';

export const organizationAdminTabs: TabDefinition<SettingsSection>[] = [
  {
    section: SettingsSection.Profile,
    route: 'profile',
    icon: PeopleOutlinedIcon,
  },
  {
    section: SettingsSection.Account,
    route: 'account',
    icon: LocalOfferOutlined,
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
    icon: Settings,
  },
];
