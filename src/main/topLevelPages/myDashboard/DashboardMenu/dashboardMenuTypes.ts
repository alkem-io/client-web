import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';

export type DashboardMenuProps = {
  compact?: boolean;
};

type MenuOptionType = 'invites' | 'link' | 'dialog' | 'switch' | 'divider';

export interface MenuOptionProps {
  label: string;
  type: MenuOptionType;
  icon?: ComponentType<SvgIconProps>;
  to?: string;
  isVisible: (viewEnabled: boolean, compact: boolean) => boolean;
  dialog?: DashboardDialog;
}
