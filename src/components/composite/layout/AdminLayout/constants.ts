import { TabDefinition } from '../../../core/PageTabs/PageTabs';

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
  },
  {
    section: AdminSection.User,
    route: '/admin/users',
  },
  {
    section: AdminSection.Organization,
    route: '/admin/organizations',
  },
  {
    section: AdminSection.Authorization,
    route: '/admin/authorization',
  },
];
