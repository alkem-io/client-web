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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component?: ComponentType<any>;
  isVisible: (viewEnabled: boolean, compactMoBoxTypeMapde: boolean) => boolean;
  dialog?: DashboardDialog;
}
