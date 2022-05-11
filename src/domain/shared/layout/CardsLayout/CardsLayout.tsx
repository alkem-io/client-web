import React, { cloneElement, FC, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import areDepsEqual from '../../utils/areDepsEqual';

interface Identifiable {
  id: string;
}

interface CardsLayoutProps<Item extends Identifiable | null | undefined> {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
}

interface CardsLayoutComponent {
  <Item extends Identifiable | null | undefined>(props: CardsLayoutProps<Item>): ReactElement;
}

/**
 * CardsLayout
 * @param items
 * @param children - a callback that renders a *single* item, pass null for an item that's loading
 * @param deps - deps to consider the render callback refreshed, as in useCallback(callback, deps)
 * @constructor
 */
const CardsLayout = React.memo(
  <Item extends Identifiable | null | undefined>({ items, children }: CardsLayoutProps<Item>) => {
    return (
      <CardLayoutContainer>
        {items.map((item, index) => {
          const card = children(item);
          const key = item ? item.id : `__loading_${index}`;
          return cloneElement(card, { key });
        })}
      </CardLayoutContainer>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.items === nextProps.items && areDepsEqual(prevProps.deps, nextProps.deps);
  }
) as CardsLayoutComponent;

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
