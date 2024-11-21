import {
  ListItemIcon,
  ListItemText,
  MenuItem as MuiMenuItem,
  MenuItemProps as MuiMenuItemProps,
  SvgIconProps,
} from '@mui/material';
import { ComponentType } from 'react';

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
