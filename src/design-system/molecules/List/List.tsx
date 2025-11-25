import React from 'react';
import {
  List as MuiList,
  ListItem as MuiListItem,
  ListItemText,
  ListItemIcon,
  ListProps as MuiListProps,
  ListItemButton,
} from '@mui/material';

export interface ListItemData {
  id: string | number;
  primary: string;
  secondary?: string;
  icon?: React.ReactElement;
  onClick?: () => void;
}

export interface ListProps extends MuiListProps {
  items: ListItemData[];
}

export const List: React.FC<ListProps> = ({ items, ...props }) => {
  return (
    <MuiList {...props}>
      {items.map(item => (
        <MuiListItem key={item.id} disablePadding>
          <ListItemButton onClick={item.onClick}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.primary} secondary={item.secondary} />
          </ListItemButton>
        </MuiListItem>
      ))}
    </MuiList>
  );
};
