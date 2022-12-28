import React, { FC, ReactNode } from 'react';
import { styled } from '@mui/styles';
import { List as MuiList, ListItem as MuiListItem, ListItemIcon as MuiListItemIcon, Skeleton } from '@mui/material';
import { BlockSectionTitle, CaptionSmall } from '../typography';
import RouterLink from '../link/RouterLink';
import { gutters } from '../grid/utils';
import { times } from 'lodash';

const List = styled(MuiList)(() => ({ padding: 0 }));

const ListItem = styled(MuiListItem)(({ theme }) => ({
  height: gutters(2)(theme),
  gap: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
})) as typeof MuiListItem;

const ListItemIcon = styled(MuiListItemIcon)({
  minWidth: 'auto',
  color: 'inherit',
});

interface Item {
  id: string;
  title: ReactNode;
  icon: ReactNode;
  uri: string;
}

export interface LinksListProps {
  items: Item[] | undefined;
  emptyListCaption?: string;
  loading?: boolean;
}

const LinksList: FC<LinksListProps> = ({ items = [], emptyListCaption, loading = false }) => {
  return (
    <List>
      {loading && times(3, i => <ListItem key={i} component={Skeleton} />)}
      {!loading && items.length === 0 && emptyListCaption && <CaptionSmall>{emptyListCaption}</CaptionSmall>}
      {!loading &&
        items.length > 0 &&
        items.map(item => (
          <ListItem key={item.id} component={RouterLink} to={item.uri}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <BlockSectionTitle minWidth={0} noWrap>
              {item.title}
            </BlockSectionTitle>
          </ListItem>
        ))}
    </List>
  );
};

export default LinksList;
