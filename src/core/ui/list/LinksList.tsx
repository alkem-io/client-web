import Avatar from '@/core/ui/avatar/Avatar';
import { Box, Collapse, List, ListItem, Skeleton } from '@mui/material';
import { times } from 'lodash';
import { ReactNode, useState } from 'react';
import CardExpandButton from '../card/CardExpandButton';
import { gutters } from '../grid/utils';
import RouterLink from '../link/RouterLink';
import { BlockSectionTitle, CaptionSmall } from '../typography';

interface Item {
  id: string;
  title: ReactNode;
  icon: ReactNode;
  uri: string;
  cardBanner?: string;
}

export interface LinksListProps {
  items: Item[] | undefined;
  emptyListCaption?: string;
  loading?: boolean;
}

const COLLAPSED_LIST_ITEM_LIMIT = 5;
const listItemStyles = {
  height: gutters(2),
  gap: 1,
  display: 'flex',
  alignItems: 'center',
} as const;

const LinksList = ({ items = [], emptyListCaption, loading = false }: LinksListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => setIsExpanded(!isExpanded);

  return (
    <List sx={{ p: 0 }}>
      {loading && times(3, i => <ListItem key={i} component={Skeleton} sx={listItemStyles} />)}
      {!loading && items.length === 0 && emptyListCaption && <CaptionSmall>{emptyListCaption}</CaptionSmall>}
      {!loading &&
        items.length > 0 &&
        items.slice(0, COLLAPSED_LIST_ITEM_LIMIT).map(item => (
          <ListItem
            key={item.id}
            component={RouterLink}
            to={item.uri}
            sx={{ ...listItemStyles, marginTop: gutters(0.5) }}
          >
            <Avatar variant="rounded" alt="subspace avatar" src={item.cardBanner} aria-label="Subspace avatar" />

            <BlockSectionTitle minWidth={0} noWrap>
              {item.title}
            </BlockSectionTitle>
          </ListItem>
        ))}
      {!loading && items.length > COLLAPSED_LIST_ITEM_LIMIT && (
        <Collapse in={isExpanded}>
          {items.slice(COLLAPSED_LIST_ITEM_LIMIT).map(item => (
            <ListItem
              key={item.id}
              component={RouterLink}
              to={item.uri}
              sx={{ ...listItemStyles, marginTop: gutters(0.5) }}
            >
              <Avatar variant="rounded" alt="subspace avatar" src={item.cardBanner} aria-label="Subspace avatar" />

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
