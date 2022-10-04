import { TabDefinition } from '../../../../common/components/core/PageTabs/PageTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import { HubIcon } from '../../../../common/icons/HubIcon';

export enum AdminSection {
  Hub = 'hubs',
  User = 'users',
  Organization = 'organizations',
  Authorization = 'authorization',
}

export const adminTabs: TabDefinition<AdminSection>[] = [
  {
    section: AdminSection.Hub,
    route: '/admin/hubs',
    icon: HubIcon,
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
    section: AdminSection.Authorization,
    route: '/admin/authorization',
    icon: GppGoodOutlinedIcon,
  },
];
