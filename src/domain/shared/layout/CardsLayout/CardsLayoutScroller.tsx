import { PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { gradient } from '../../../../core/ui/overflow/utils';

interface CardsLayoutScrollerProps {
  maxHeight: number;
  sx?: BoxProps['sx'];
}

const buildPseudoElement = (position: 'top' | 'bottom') => ({
  content: '""',
  display: 'block',
  position: 'absolute',
  [position]: 0,
  left: 0,
  right: 0,
  height: gutters(),
  background: gradient(position === 'top' ? '180deg' : '0'),
});

const CardsLayoutScroller = ({ maxHeight, sx, children }: PropsWithChildren<CardsLayoutScrollerProps>) => {
  /* Paddings are set to prevent cutting Paper shadow by overflow: scroll.
  Margins are compensating the visual shift. Except for the left margin, we want a bit of left shifting */
  return (
    <Box
      position="relative"
      sx={{
        ...sx,
        ':after': buildPseudoElement('bottom'),
        ':before': buildPseudoElement('top'),
      }}
    >
      <Box overflow="auto" margin={-2} maxHeight={maxHeight}>
        {children}
      </Box>
    </Box>
  );
};

export default CardsLayoutScroller;
