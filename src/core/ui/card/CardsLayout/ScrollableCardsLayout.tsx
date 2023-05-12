import React, { useRef } from 'react';
import ScrollerWithGradient from '../../overflow/ScrollerWithGradient';
import CardsLayout, { CardsLayoutProps } from './CardsLayout';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';

// If the width of the component is bigger than 600, scroll will be vertical
const HORIZONTAL_SCROLL_MAX_WIDTH = 600;

/**
 * @deprecated use ScrollableCardsLayoutContainer
 * TODO reuse ScrollableCardsLayoutContainer within this one
 */
const ScrollableCardsLayout = <Item extends Identifiable | null | undefined>({
  maxHeight,
  ...props
}: CardsLayoutProps<Item>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orientation =
    containerRef.current && containerRef.current.offsetWidth <= HORIZONTAL_SCROLL_MAX_WIDTH ? 'horizontal' : 'vertical';

  return (
    <ScrollerWithGradient orientation={orientation} maxHeight={maxHeight} scrollerRef={containerRef}>
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
