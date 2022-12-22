import { useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { overflowBorderGradient } from './utils';

interface OverflowGradientProps extends BoxProps {
  lastLine?: boolean;
}

const OverflowGradient = ({ lastLine = false, ...props }: OverflowGradientProps) => {
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateOverflow = (el: HTMLDivElement | null) => {
    if (!el) {
      return;
    }
    setHasOverflow(el.scrollHeight > el.clientHeight);
  };

  return (
    <Box
      ref={updateOverflow}
      overflow="hidden"
      position="relative"
      sx={{
        ':after': hasOverflow
          ? {
              content: '""',
              display: 'block',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: gutters(),
              background: overflowBorderGradient(lastLine ? '-90deg' : '0'),
            }
          : undefined,
      }}
      {...props}
    />
  );
};

export default OverflowGradient;
