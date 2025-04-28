import ScrollerWithGradient, { Orientation } from '@/core/ui/overflow/ScrollerWithGradient';
import PageContentBlockGrid, { PageContentBlockGridProps } from '@/core/ui/content/PageContentBlockGrid';
import { useScreenSize } from '../../grid/constants';
import { BoxProps } from '@mui/material';

interface ScrollableCardsLayoutContainerProps extends PageContentBlockGridProps {
  orientation?: Orientation;
  containerProps?: BoxProps;
}

const ScrollableCardsLayoutContainer = ({
  maxHeight,
  orientation: orientationOverride,
  containerProps,
  ...props
}: ScrollableCardsLayoutContainerProps) => {
  const { isSmallScreen } = useScreenSize();
  const orientation = orientationOverride ?? (isSmallScreen ? 'horizontal' : 'vertical');

  return (
    <ScrollerWithGradient orientation={orientation} maxHeight={maxHeight} {...containerProps}>
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
