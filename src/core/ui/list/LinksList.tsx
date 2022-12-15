import React, { FC, ReactElement } from 'react';
import { styled } from '@mui/styles';
import { List as MuiList, ListItem as MuiListItem, ListItemIcon as MuiListItemIcon, ListItemText } from '@mui/material';
import { BlockSectionTitle, CaptionSmall } from '../typography';
import RouterLink from '../link/RouterLink';

const List = styled(MuiList)(() => ({ padding: 0 }));

const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0, 0.6, 0),
}));

const ListItemIcon = styled(MuiListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.7),
  color: theme.palette.common.black,
}));

// Override links color in these LinksLists
const Link = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.common.black,
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

interface Item {
  id: string;
  title: string;
  url: string;
  icon?: ReactElement;
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
            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : undefined}
            <ListItemText
              primary={
                <BlockSectionTitle component={Link} to={item.url}>
                  {item.title}
                </BlockSectionTitle>
              }
            />
          </ListItem>
        ))}
      {items.length === 0 && emptyListCaption && <CaptionSmall>{emptyListCaption}</CaptionSmall>}
    </List>
  );
};

export default LinksList;
