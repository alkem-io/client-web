import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

interface CardsLayoutScrollerProps {
  maxHeight: number;
}

const CardsLayoutScroller = ({ maxHeight, children }: PropsWithChildren<CardsLayoutScrollerProps>) => {
  /* Paddings are set to prevent cutting Paper shadow by overflow: scroll.
  Margins are compensating the visual shift. Except for the left margin, we want a bit of left shifting */
  return (
    <Box maxHeight={theme => theme.spacing(maxHeight + 4)} overflow="auto" padding={2} margin={-2} marginLeft={0}>
      {children}
    </Box>
  );
};

export default CardsLayoutScroller;
