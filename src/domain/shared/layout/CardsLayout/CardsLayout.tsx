import React, { cloneElement, FC, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import compareDeps from '../../utils/compareDeps';

interface CardsLayoutProps<Item extends { id: string }> {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
}

/**
 * CardsLayout
 * @param items
 * @param children - a callback that renders a *single* item
 * @param deps - deps to consider the render callback refreshed, as in useCallback(callback, deps)
 * @constructor
 */
const CardsLayout = React.memo(
  <Item extends { id: string }>({ items, children }: CardsLayoutProps<Item>) => {
    return (
      <CardLayoutContainer>
        {items.map(item => {
          const card = children(item);
          return cloneElement<unknown>(card, { key: item.id });
        })}
      </CardLayoutContainer>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.items === nextProps.items && compareDeps(prevProps.deps, nextProps.deps);
  }
) as <Item extends { id: string }>(props: CardsLayoutProps<Item>) => ReactElement;

export default CardsLayout;

export const CardLayoutContainer: FC = ({ children }) => {
  return (
    <Box gap={2} display="flex" flexWrap="wrap">
      {children}
    </Box>
  );
};

interface CardLayoutItemProps extends Pick<BoxProps, 'maxWidth' | 'flexGrow'> {
  flexBasis?: '25%' | '33%' | '50%';
}

/**
 * @deprecated
 */
export const CardLayoutItem: FC<CardLayoutItemProps> = ({ children, flexBasis = '25%', flexGrow, maxWidth }) => {
  return (
    <Box flexBasis={flexBasis} maxWidth={maxWidth} flexGrow={flexGrow}>
      {children}
    </Box>
  );
};
