import React, { FC, ReactElement } from 'react';
import { styled } from '@mui/styles';
import { List as MuiList, ListItem as MuiListItem, ListItemIcon as MuiListItemIcon, ListItemText } from '@mui/material';
import { Text } from '../typography';
import RouterLink from '../link/RouterLink';

const List = styled(MuiList)(() => ({
  padding: 0,
}));
const ListItem = styled(MuiListItem)(() => ({
  padding: 0,
}));
const ListItemIcon = styled(MuiListItemIcon)(({ theme }) => ({ minWidth: 'auto', marginRight: theme.spacing(1) }));

interface Item {
  id: string;
  title: string;
  url: string;
  icon?: ReactElement;
}

export interface LinksListProps {
  items: Item[];
}

const LinksList: FC<LinksListProps> = ({ items }) => {
  return (
    <List>
      {items.map(item => (
        <ListItem key={item.id}>
          {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : undefined}
          <ListItemText
            primary={
              <Text component={RouterLink} to={item.url}>
                {item.title}
              </Text>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default LinksList;
