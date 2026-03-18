import {
  ListItemIcon,
  ListItemText,
  MenuItem as MuiMenuItem,
  type MenuItemProps as MuiMenuItemProps,
  type SvgIconProps,
} from '@mui/material';
import type { ComponentType } from 'react';

interface MenuItemProps extends MuiMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
}

const MenuItemWithIcon = ({ iconComponent: Icon, children, ...props }: MenuItemProps) => (
  <MuiMenuItem {...props}>
    <ListItemIcon>
      <Icon fontSize="small" color="primary" />
    </ListItemIcon>
    <ListItemText>{children}</ListItemText>
  </MuiMenuItem>
);

export default MenuItemWithIcon;
