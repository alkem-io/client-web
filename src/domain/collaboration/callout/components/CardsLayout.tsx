import { Autorenew } from '@mui/icons-material';

import { Button } from '@mui/material';
import { cloneElement, type FC, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlockGrid, { type PageContentBlockGridProps } from '@/core/ui/content/PageContentBlockGrid';
import Gutters from '@/core/ui/grid/Gutters';
import type { Identifiable } from '@/core/utils/Identifiable';
import getDepsValueFromObject from '@/domain/shared/utils/getDepsValueFromObject';

export interface CardsLayoutProps<Item extends Identifiable | null | undefined>
  extends Omit<PageContentBlockGridProps, 'children'> {
  items: Item[];
  children: (item: Item) => ReactElement<unknown>;
  deps?: unknown[];
  showCreateButton?: boolean;
  createButton?: ReactNode;
  globalSearch?: boolean;
  loading?: boolean;
  isButtonDisabled?: boolean;
  onClickLoadMore?: () => void;
}

/**
 * CardsLayout
 * @deprecated - doesn't add any functionality except items.map but adds complexity and reduces flexibility
 */
const CardsLayout = <Item extends Identifiable | null | undefined>({
  items,
  loading,
  children,
  deps = [],
  createButton,
  onClickLoadMore,
  globalSearch = false,
  isButtonDisabled = false,
  ...layoutProps
}: CardsLayoutProps<Item>) => {
  const { t } = useTranslation();

  const _depsValueFromObjectDeps = getDepsValueFromObject(deps);

  const cards = items.map((item, index) => {
    const card = children(item);
    const key = item ? item.id : `__loading_${index}`;
    return cloneElement(card, { key });
  });

  if (globalSearch) {
    return (
      <Gutters disablePadding={true} sx={{ display: 'flex', alignItems: 'center' }}>
        <CardLayoutContainer {...layoutProps} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {createButton}
          {cards}
        </CardLayoutContainer>

        {cards.length > 0 && (
          <Button
            startIcon={
              <Autorenew
                sx={{
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            }
            disabled={isButtonDisabled}
            sx={{ minWidth: 'fit-content', height: 'fit-content' }}
            onClick={onClickLoadMore}
          >
            {t('buttons.load-more')}
          </Button>
        )}
      </Gutters>
    );
  }

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
  return <PageContentBlockGrid cards={true} {...props} />;
};
