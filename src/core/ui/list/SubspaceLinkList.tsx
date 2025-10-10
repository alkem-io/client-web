import Avatar from '@/core/ui/avatar/Avatar';
import { Box, Collapse, List, ListItem, Skeleton, Tooltip, TooltipProps } from '@mui/material';
import { times } from 'lodash';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LockOutlined } from '@mui/icons-material';
import { Caption } from '../typography';
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
  isPrivate?: boolean;
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

/**
 * SubspaceLinkList
 *
 * Renders a vertical list of link items with optional loading state and empty caption.
 * Displays up to a fixed number of items and allows expansion for more.
 * Adds a lock icon tooltip for items marked as private to indicate restricted access.
 *
 * Props:
 * @param {Item[]} props.items - Array of link items. Each item defines id, title, uri, optional icon, banner, and isPrivate flag.
 * @param {string} [props.emptyListCaption] - Caption to display when there are no items.
 * @param {boolean} [props.loading=false] - If true, shows skeleton loaders instead of list items.
 */
const SubspaceLinkList = ({ items = [], emptyListCaption, loading = false }: LinksListProps) => {
  const { t } = useTranslation();
  const tooltipPlacement: TooltipProps['placement'] = 'right';

  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => setIsExpanded(!isExpanded);

  // Helper to render a single link item
  const renderListItem = (item: Item) => (
    <ListItem
      key={item.id}
      component={RouterLink}
      to={item.uri}
      sx={{ paddingX: 0, marginTop: gutters(1), ...listItemStyles }}
    >
      <Avatar variant="rounded" alt="subspace avatar" src={item.cardBanner} ariaLabel={t('common.avatar')} />

      <BlockSectionTitle minWidth={0} noWrap>
        {item.title}
      </BlockSectionTitle>
      {item.isPrivate && (
        <Tooltip
          title={<Caption>{t('components.dashboardNavigation.privateSubspace')}</Caption>}
          placement={tooltipPlacement}
          arrow
        >
          <LockOutlined sx={{ ml: 'auto', color: theme => theme.palette.neutral.light }} />
        </Tooltip>
      )}
    </ListItem>
  );

  return (
    <List sx={{ p: 0 }}>
      {loading && times(3, i => <ListItem key={i} component={Skeleton} sx={listItemStyles} />)}
      {!loading && items.length === 0 && emptyListCaption && <CaptionSmall>{emptyListCaption}</CaptionSmall>}
      {!loading && items.length > 0 && items.slice(0, COLLAPSED_LIST_ITEM_LIMIT).map(renderListItem)}
      {!loading && items.length > COLLAPSED_LIST_ITEM_LIMIT && (
        <Collapse in={isExpanded}>{items.slice(COLLAPSED_LIST_ITEM_LIMIT).map(renderListItem)}</Collapse>
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

export default SubspaceLinkList;
