import React, { FC } from 'react';
import ScrollerWithGradient from '../../overflow/ScrollerWithGradient';
import PageContentBlockGrid, { PageContentBlockGridProps } from '../../content/PageContentBlockGrid';
import useCurrentBreakpoint from '../../utils/useCurrentBreakpoint';

interface ScrollableCardsLayoutContainerProps extends PageContentBlockGridProps {
  maxHeight?: PageContentBlockGridProps['maxHeight'];
  orientation?: 'horizontal' | 'vertical';
}
const ScrollableCardsLayoutContainer: FC<ScrollableCardsLayoutContainerProps> = ({
  maxHeight,
  orientation,
  ...props
}) => {
  const breakpoint = useCurrentBreakpoint();

  const scrollOrientation = orientation ? orientation : breakpoint === 'xs' ? 'horizontal' : 'vertical';

  return (
    <ScrollerWithGradient orientation={scrollOrientation} maxHeight={maxHeight}>
      <PageContentBlockGrid
        cards={scrollOrientation === 'vertical'}
        noWrap={scrollOrientation === 'horizontal'}
        sx={
          scrollOrientation === 'vertical'
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
