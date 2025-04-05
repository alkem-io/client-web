import { useRef } from 'react';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import CardsLayout, { CardsLayoutProps } from '../CardsLayout';
import { Identifiable } from '@/core/utils/Identifiable';

// If the width of the component is bigger than 600, scroll will be vertical
const HORIZONTAL_SCROLL_MAX_WIDTH = 600;

interface ScrollableCardsLayoutProps<Item extends Identifiable | null | undefined> extends CardsLayoutProps<Item> {
  noVerticalMarginTop?: boolean;
  minHeight?: number;
}

/**
 * @deprecated use ScrollableCardsLayoutContainer
 * TODO reuse ScrollableCardsLayoutContainer within this one
 */
const ScrollableCardsLayout = <Item extends Identifiable | null | undefined>({
  maxHeight,
  noVerticalMarginTop = false,
  minHeight,
  ...props
}: ScrollableCardsLayoutProps<Item>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orientation =
    containerRef.current && containerRef.current.offsetWidth <= HORIZONTAL_SCROLL_MAX_WIDTH ? 'horizontal' : 'vertical';

  return (
    <ScrollerWithGradient
      orientation={orientation}
      minHeight={minHeight}
      maxHeight={maxHeight}
      scrollerRef={containerRef}
      marginTop={orientation === 'vertical' && noVerticalMarginTop ? 0 : undefined}
    >
      <CardsLayout
        cards={orientation === 'vertical'}
        noWrap={orientation === 'horizontal'}
        sx={
          orientation === 'vertical'
            ? undefined
            : {
                // This allows to scroll past the last item / preserves padding-right
                ':after': {
                  content: '" "',
                  whiteSpace: 'pre',
                  width: '1px',
                  height: '1px',
                  visibility: 'hidden',
                },
              }
        }
        {...props}
      />
    </ScrollerWithGradient>
  );
};

export default ScrollableCardsLayout;
