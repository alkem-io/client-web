import React, { FC, ReactNode } from 'react';
import { styled } from '@mui/styles';
import { List as MuiList, ListItem as MuiListItem, ListItemIcon as MuiListItemIcon } from '@mui/material';
import { CaptionSmall } from '../typography';

const List = styled(MuiList)(() => ({ padding: 0 }));

const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0, 0.5, 0),
  gap: theme.spacing(1),
}));

const ListItemIcon = styled(MuiListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  color: theme.palette.common.black,
}));

interface Item {
  id: string;
  title: ReactNode;
  icon?: ReactNode;
}

export interface LinksListProps {
  items: Item[] | undefined;
  emptyListCaption?: string;
}

const LinksList: FC<LinksListProps> = ({ items = [], emptyListCaption }) => {
  return (
    <List>
      {items.length > 0 &&
        items.map(item => (
          <ListItem key={item.id}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            {item.title}
          </ListItem>
        ))}
      {items.length === 0 && emptyListCaption && <CaptionSmall>{emptyListCaption}</CaptionSmall>}
    </List>
  );
};

export default LinksList;
