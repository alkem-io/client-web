import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { TabDefinition } from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsTabs';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
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
    icon: SettingsOutlinedIcon,
  },
];
