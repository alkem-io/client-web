import { PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../../grid/utils';
import { overflowBorderGradient } from '../../overflow/utils';

type Orientation = 'vertical' | 'horizontal';

interface CardsLayoutScrollerProps {
  orientation?: Orientation;
  sx?: BoxProps['sx'];
}

type Edge = 'top' | 'bottom' | 'left' | 'right';

const overflowAngle: Record<Edge, string> = {
  top: '180deg',
  bottom: '0',
  left: '90deg',
  right: '-90deg',
};

const buildPseudoElement = (position: 'start' | 'end', orientation: Orientation) => {
  const placement: Edge =
    orientation === 'vertical' ? (position === 'start' ? 'top' : 'bottom') : position === 'start' ? 'left' : 'right';

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

const CardsLayoutScroller = ({
  orientation = 'vertical',
  maxHeight,
  sx,
  children,
  ...props
}: PropsWithChildren<CardsLayoutScrollerProps> & BoxProps) => {
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
      <Box maxHeight={maxHeight} sx={{ [orientation === 'vertical' ? 'overflowY' : 'overflowX']: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default CardsLayoutScroller;
