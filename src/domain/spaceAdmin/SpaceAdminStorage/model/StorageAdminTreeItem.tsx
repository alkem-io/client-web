import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { SvgIconProps } from '@mui/material';
import { ComponentType } from 'react';

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
