import type { SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';
import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface StorageAdminTreeItem {
  id: string;
  displayName: string;
  iconComponent?: ComponentType<SvgIconProps>;
  childItems?: StorageAdminTreeItem[];
  // Documents only
  size: number;
  uploadedBy?: { url: string; displayName: string };
  uploadedAt?: Date;
  url: string | undefined;
  // UI:
  collapsible: boolean;
  collapsed: boolean;
  loaded: boolean;
  loading?: boolean;
  authorization?: {
    myPrivileges: AuthorizationPrivilege[];
  };
}
