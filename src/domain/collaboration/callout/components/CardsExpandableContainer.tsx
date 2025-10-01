import { useScreenSize } from '@/core/ui/grid/constants';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import { Identifiable } from '@/core/utils/Identifiable';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box } from '@mui/material';
import React from 'react';
import { ReactElement, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const ITEMS_FIRST_PAGE = 4;

interface CardsExpandableContainerProps<Item extends Identifiable> {
  items: Item[] | undefined;
  pagination?: {
    total: number;
    fetchMore?: () => Promise<unknown>;
    fetchAll?: () => Promise<unknown>;
  };
  loading?: boolean;
  children: (item: Item) => ReactElement<unknown>;
  createButton?: ReactElement<unknown>;
}

interface PaginationExpander {
  itemsCount: number;
  totalCount: number;
  onClick: () => void;
}
const PaginationExpander = ({ onClick, itemsCount, totalCount }: PaginationExpander) => {
  const { t } = useTranslation();
  if (totalCount === 0 || itemsCount === 0) {
    return (
      <Box>
        <Caption>{t('callout.contributions.noContributions')}</Caption>
      </Box>
    );
  }
  if (itemsCount === totalCount) {
    // All items are loaded
    if (itemsCount <= ITEMS_FIRST_PAGE) {
      // Less than 4 items, no need to show expander
      return <Caption>{t('callout.contributions.contributionsCount', { count: itemsCount })}</Caption>;
    } else {
      // All items are shown, show collapse option
      return (
        <Box display="flex" flexDirection="row" alignContent="end" sx={{ cursor: 'pointer' }} onClick={onClick}>
          <ExpandLess />
          <Caption>
            <Trans
              i18nKey="callout.contributions.contributionsCollapse"
              components={{
                click: <strong />,
              }}
              values={{ count: totalCount }}
            />
          </Caption>
        </Box>
      );
    }
  }
  if (totalCount > ITEMS_FIRST_PAGE && itemsCount < totalCount) {
    return (
      <Box display="flex" flexDirection="row" alignContent="end" sx={{ cursor: 'pointer' }} onClick={onClick}>
        <ExpandMore />
        <Caption>
          <Trans
            i18nKey="callout.contributions.contributionsItemsCountExpand"
            components={{
              click: <strong />,
            }}
            values={{ count: totalCount }}
          />
        </Caption>
      </Box>
    );
  }
  return <Caption>{t('callout.contributions.contributionsCount', { count: itemsCount })}</Caption>;
};

const CardsExpandableContainer = <Item extends Identifiable>({
  items = [],
  pagination,
  loading,
  createButton,
  children,
}: CardsExpandableContainerProps<Item>) => {
  const { isSmallScreen, isMediumSmallScreen } = useScreenSize();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const itemsShown = useMemo(() => {
    if (isCollapsed || !pagination) {
      return items.slice(0, ITEMS_FIRST_PAGE);
    }
    if (items.length <= pagination?.total) {
      if (pagination?.fetchAll) {
        pagination?.fetchAll?.();
      }
      return items;
    }

    return items;
  }, [items, items.length, isCollapsed]);

  return (
    <>
      <GridProvider columns={isSmallScreen ? 3 : isMediumSmallScreen ? 6 : 12} force>
        <Gutters disablePadding row flexWrap="wrap">
          {itemsShown.map(item => (
            <React.Fragment key={item.id}>{children(item)}</React.Fragment>
          ))}
        </Gutters>
      </GridProvider>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PaginationExpander
          onClick={() => setIsCollapsed(!isCollapsed)}
          itemsCount={itemsShown.length}
          totalCount={pagination?.total ?? items.length}
        />
        {loading && <Loading />}
        {!loading && createButton}
      </Box>
    </>
  );
};

export default CardsExpandableContainer;
