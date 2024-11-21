import { ReactNode, useState } from 'react';
import { styled } from '@mui/styles';
import {
  Box,
  Collapse,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemIcon as MuiListItemIcon,
  Skeleton,
} from '@mui/material';
import { BlockSectionTitle, CaptionSmall } from '../typography';
import RouterLink from '../link/RouterLink';
import { gutters } from '../grid/utils';
import { times } from 'lodash';
import CardExpandButton from '../card/CardExpandButton';

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

const COLLAPSED_LIST_ITEM_LIMIT = 5;

const LinksList = ({ items = [], emptyListCaption, loading = false }: LinksListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <List>
      {loading && times(3, i => <ListItem key={i} component={Skeleton} />)}
      {!loading && items.length === 0 && emptyListCaption && <CaptionSmall>{emptyListCaption}</CaptionSmall>}
      {!loading &&
        items.length > 0 &&
        items.slice(0, COLLAPSED_LIST_ITEM_LIMIT).map(item => (
          <ListItem key={item.id} component={RouterLink} to={item.uri}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <BlockSectionTitle minWidth={0} noWrap>
              {item.title}
            </BlockSectionTitle>
          </ListItem>
        ))}
      {!loading && items.length > COLLAPSED_LIST_ITEM_LIMIT && (
        <Collapse in={isExpanded}>
          {items.slice(COLLAPSED_LIST_ITEM_LIMIT).map(item => (
            <ListItem key={item.id} component={RouterLink} to={item.uri}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <BlockSectionTitle minWidth={0} noWrap>
                {item.title}
              </BlockSectionTitle>
            </ListItem>
          ))}
        </Collapse>
      )}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="end"
        paddingX={1.5}
        sx={{ cursor: 'pointer' }}
        onClick={handleExpand}
      >
        {!loading && items.length > COLLAPSED_LIST_ITEM_LIMIT && <CardExpandButton expanded={isExpanded} />}
      </Box>
    </List>
  );
};

export default LinksList;
