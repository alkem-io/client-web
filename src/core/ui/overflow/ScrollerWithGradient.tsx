import { PropsWithChildren, Ref } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { overflowBorderGradient } from './utils';

type Orientation = 'vertical' | 'horizontal';

interface ScrollerWithGradientProps<ScrollerEl extends HTMLElement> {
  orientation?: Orientation;
  sx?: BoxProps['sx'];
  scrollerRef?: Ref<ScrollerEl>;
}

type Edge = 'top' | 'bottom' | 'left' | 'right';

const overflowAngle: Record<Edge, string> = {
  top: '180deg',
  bottom: '0',
  left: '90deg',
  right: '-90deg',
};

type Position = 'start' | 'end';

const placementMap: Record<Orientation, Record<Position, Edge>> = {
  horizontal: {
    start: 'left',
    end: 'right',
  },
  vertical: {
    start: 'top',
    end: 'bottom',
  },
};

const buildPseudoElement = (position: Position, orientation: Orientation) => {
  const placement = placementMap[orientation][position];

  const crossAxisStart = orientation === 'vertical' ? 'left' : 'top';
  const crossAxisEnd = orientation === 'vertical' ? 'right' : 'bottom';

  return {
    content: '""',
    display: 'block',
    position: 'absolute',
    [placement]: 0,
    [orientation === 'vertical' ? 'height' : 'width']: gutters(),
    [crossAxisStart]: 0,
    [crossAxisEnd]: gutters(1), // creates an offset at the side of the scrollbar
    background: overflowBorderGradient(overflowAngle[placement]),
  };
};

const ScrollerWithGradient = <ScrollerEl extends HTMLElement>({
  orientation = 'vertical',
  maxHeight,
  sx,
  scrollerRef,
  onScroll,
  children,
  ...props
}: PropsWithChildren<ScrollerWithGradientProps<ScrollerEl>> & BoxProps) => {
  return (
    <Box
      position="relative"
      margin={gutters(-1)}
      sx={{
        ...sx,
        ':before': buildPseudoElement('start', orientation),
        ':after': buildPseudoElement('end', orientation),
      }}
      {...props}
    >
      <Box
        ref={scrollerRef}
        maxHeight={maxHeight}
        sx={{ [orientation === 'vertical' ? 'overflowY' : 'overflowX']: 'auto' }}
        onScroll={onScroll}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ScrollerWithGradient;
