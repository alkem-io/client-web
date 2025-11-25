import React from 'react';
import { Menu as MuiMenu, MenuItem as MuiMenuItem, MenuProps as MuiMenuProps } from '@mui/material';

export interface MenuProps extends MuiMenuProps {
  items?: {
    label: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
  }[];
}

export const Menu: React.FC<MenuProps> = ({ items, children, ...props }) => {
  return (
    <MuiMenu {...props}>
      {items
        ? items.map((item, index) => (
            <MuiMenuItem key={index} onClick={item.onClick} disabled={item.disabled} divider={item.divider}>
              {item.label}
            </MuiMenuItem>
          ))
        : children}
    </MuiMenu>
  );
};

export const MenuItem = MuiMenuItem;
