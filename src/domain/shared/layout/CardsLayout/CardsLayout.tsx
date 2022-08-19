import React, { cloneElement, FC, ReactElement, useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Identifiable } from '../../types/Identifiable';

interface CardsLayoutProps<Item extends Identifiable | null | undefined> extends CardLayoutContainerProps {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
}

/**
 * CardsLayout
 * @param items
 * @param children - a callback that renders a *single* item, pass null or undefined for an item that's loading
 * @param deps - deps to consider the render callback refreshed, as in useCallback(callback, deps)
 * @constructor
 */
const CardsLayout = <Item extends Identifiable | null | undefined>({
  items,
  children,
  deps = [],
  ...layoutProps
}: CardsLayoutProps<Item>) => {
  const cards = useMemo(
    () =>
      items.map((item, index) => {
        const card = children(item);
        const key = item ? item.id : `__loading_${index}`;
        return cloneElement(card, { key });
      }),
    [items, ...deps]
  );

  return <CardLayoutContainer {...layoutProps}>{cards}</CardLayoutContainer>;
};

export default CardsLayout;

interface CardLayoutContainerProps extends BoxProps {}

export const CardLayoutContainer: FC<CardLayoutContainerProps> = ({ sx, children, ...boxProps }) => {
  return (
    <Box gap={2} {...boxProps} sx={{ display: 'flex', flexWrap: 'wrap', ...sx }}>
      {children}
    </Box>
  );
};

interface CardLayoutItemProps extends Pick<BoxProps, 'maxWidth' | 'flexGrow'> {
  flexBasis?: '25%' | '33%' | '50%';
}

/**
 * @deprecated - just render cards directly inside CardsLayout.
 */
export const CardLayoutItem: FC<CardLayoutItemProps> = ({ children, flexBasis = '25%', flexGrow, maxWidth }) => {
  return (
    <Box flexBasis={flexBasis} maxWidth={maxWidth} flexGrow={flexGrow}>
      {children}
    </Box>
  );
};
