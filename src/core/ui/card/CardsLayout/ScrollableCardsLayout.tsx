import React from 'react';
import ScrollerWithGradient from '../../overflow/ScrollerWithGradient';
import CardsLayout, { CardsLayoutProps } from './CardsLayout';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';
import useCurrentBreakpoint from '../../utils/useCurrentBreakpoint';

const ScrollableCardsLayout = <Item extends Identifiable | null | undefined>({
  maxHeight,
  ...props
}: CardsLayoutProps<Item>) => {
  const breakpoint = useCurrentBreakpoint();

  const orientation = breakpoint === 'xs' ? 'horizontal' : 'vertical';

  return (
    <ScrollerWithGradient orientation={orientation} maxHeight={maxHeight}>
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
