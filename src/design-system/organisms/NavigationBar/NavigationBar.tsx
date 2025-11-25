import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

export interface NavigationItem {
  label: string;
  onClick: () => void;
}

export interface NavigationBarProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ items, logo }) => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {logo && <Box sx={{ flexGrow: 1 }}>{logo}</Box>}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {items.map((item, index) => (
            <Button key={index} onClick={item.onClick} color="inherit">
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
