import { TabDefinition } from '../EntitySettingsLayout/EntitySettingsTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import { SpaceIcon } from '../../../../challenge/space/icon/SpaceIcon';

export enum AdminSection {
  Space = 'spaces',
  User = 'users',
  Organization = 'organizations',
  InnovationPacks = 'innovation-packs',
  Authorization = 'authorization',
}

export const adminTabs: TabDefinition<AdminSection>[] = [
  {
    section: AdminSection.Space,
    route: '/admin/spaces',
    icon: SpaceIcon,
  },
  {
    section: AdminSection.User,
    route: '/admin/users',
    icon: PeopleOutlinedIcon,
  },
  {
    section: AdminSection.Organization,
    route: '/admin/organizations',
    icon: ForumOutlinedIcon,
  },
  {
    section: AdminSection.InnovationPacks,
    route: '/admin/innovation-packs',
    icon: ForumOutlinedIcon,
  },
  {
    section: AdminSection.Authorization,
    route: '/admin/authorization',
    icon: GppGoodOutlinedIcon,
  },
];
