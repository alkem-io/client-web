import React from 'react';
import ScrollerWithGradient from '../../overflow/ScrollerWithGradient';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../content/PageContentBlockGrid';
import useCurrentBreakpoint from '../../utils/useCurrentBreakpoint';

const ScrollableCardsLayoutContainer = ({ maxHeight, ...props }: PageContentBlockGridProps) => {
  const breakpoint = useCurrentBreakpoint();

  const orientation = breakpoint === 'xs' ? 'horizontal' : 'vertical';

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
