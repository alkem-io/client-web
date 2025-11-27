import React from 'react';
import { Drawer as MuiDrawer, DrawerProps as MuiDrawerProps } from '@mui/material';

export interface DrawerProps extends MuiDrawerProps {}

export const Drawer: React.FC<DrawerProps> = ({ children, ...props }) => {
  return <MuiDrawer {...props}>{children}</MuiDrawer>;
};
