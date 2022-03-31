import { ComponentType } from 'react';
import { HubOutlined, PeopleOutlined, GroupsOutlined, LockOutlined } from '@mui/icons-material';
import createPageTabs from '../../../core/PageTabs/PageTabs';
import { AdminSection } from './constants';

const ADMIN_TAB_ICON_MAPPING: Record<AdminSection, ComponentType> = {
  [AdminSection.Hub]: HubOutlined,
  [AdminSection.User]: PeopleOutlined,
  [AdminSection.Organization]: GroupsOutlined,
  [AdminSection.Authorization]: LockOutlined,
};

const AdminTabs = createPageTabs(ADMIN_TAB_ICON_MAPPING, section => `common.${section}`);

export default AdminTabs;
