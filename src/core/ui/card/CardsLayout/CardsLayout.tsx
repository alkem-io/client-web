import React, { cloneElement, FC, ReactElement, ReactNode, useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';
import getDepsValueFromObject from '../../../../domain/shared/utils/getDepsValueFromObject';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../content/PageContentBlockGrid';

export interface CardsLayoutProps<Item extends Identifiable | null | undefined> extends CardLayoutContainerProps {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
  showCreateButton?: boolean;
  createButton?: ReactNode;
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
  createButton,
  ...layoutProps
}: CardsLayoutProps<Item>) => {
  const depsValueFromObjectDeps = getDepsValueFromObject(deps);

  const cards = useMemo(
    () =>
      items.map((item, index) => {
        const card = children(item);
        const key = item ? item.id : `__loading_${index}`;
        return cloneElement(card, { key });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, depsValueFromObjectDeps, children]
  );

  return (
    <CardLayoutContainer {...layoutProps}>
      {createButton}
      {cards}
    </CardLayoutContainer>
  );
};

export default CardsLayout;

interface CardLayoutContainerProps extends PageContentBlockGridProps {}

export const CardLayoutContainer: FC<CardLayoutContainerProps> = props => {
  return <PageContentBlockGrid cards {...props} />;
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
