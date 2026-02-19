import { TabDefinition } from '../EntitySettingsLayout/EntitySettingsTabs';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export enum AdminSection {
  Space = 'spaces',
  User = 'users',
  Organization = 'organizations',
  InnovationPacks = 'innovation-packs',
  InnovationHubs = 'innovation-hubs',
  VirtualContributors = 'virtualContributors',
  Authorization = 'authorization',
  AuthorizationPolicies = 'authorizationPolicies',
  Transfer = 'transfer',
}

export const adminTabs: TabDefinition<AdminSection>[] = [
  {
    section: AdminSection.Space,
    route: '/admin/spaces',
    icon: SpaceL0Icon,
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
    section: AdminSection.InnovationHubs,
    route: '/admin/innovation-hubs',
    icon: ForumOutlinedIcon,
  },
  {
    section: AdminSection.VirtualContributors,
    route: '/admin/virtual-contributors',
    icon: PsychologyIcon,
  },
  {
    section: AdminSection.Authorization,
    route: '/admin/authorization',
    icon: GppGoodOutlinedIcon,
  },
  {
    section: AdminSection.AuthorizationPolicies,
    route: '/admin/authorization-policies',
    icon: GppGoodOutlinedIcon,
  },
  {
    section: AdminSection.Transfer,
    route: '/admin/transfer',
    icon: SwapHorizIcon,
  },
];
