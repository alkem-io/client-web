import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsTabs';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import { SettingsOutlined } from '@mui/icons-material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';

export const VCProfileTabs: TabDefinition<SettingsSection>[] = [
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
    section: SettingsSection.Settings,
    route: 'settings',
    icon: SettingsOutlined,
  },
];
