import React from 'react';
import ScrollerWithGradient, { Orientation } from '../../overflow/ScrollerWithGradient';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../content/PageContentBlockGrid';
import useCurrentBreakpoint from '../../utils/useCurrentBreakpoint';

interface ScrollableCardsLayoutContainerProps extends PageContentBlockGridProps {
  orientation?: Orientation;
}

const ScrollableCardsLayoutContainer = ({
  maxHeight,
  orientation: orientationOverride,
  ...props
}: ScrollableCardsLayoutContainerProps) => {
  const breakpoint = useCurrentBreakpoint();

  const orientation = orientationOverride ?? (breakpoint === 'xs' ? 'horizontal' : 'vertical');

  return (
    <ScrollerWithGradient orientation={orientation} maxHeight={maxHeight}>
      <PageContentBlockGrid
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

export default ScrollableCardsLayoutContainer;
