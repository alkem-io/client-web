import React, { cloneElement, FC, ReactElement, useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Identifiable } from '../../types/Identifiable';
import getDepsValueFromObject from '../../utils/getDepsValueFromObject';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../../../core/ui/content/PageContentBlockGrid';

export interface CreateButtonProps {
  onClick?: () => void;
}
interface CardsLayoutProps<Item extends Identifiable | null | undefined> extends CardLayoutContainerProps {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
  showCreateButton?: boolean;
  createButtonComponent?: React.ReactNode;
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
  createButtonComponent: CreateButton,
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
      {CreateButton}
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
