import { useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { gutters } from '../grid/utils';
import hexToRGBA from '../../../common/utils/hexToRGBA';

const gradient =
  (isVertical = true) =>
  (theme: Theme) => {
    const angle = isVertical ? '0' : '-90deg';
    return `linear-gradient(${angle}, ${hexToRGBA(theme.palette.background.paper, 1)} 0%, ${hexToRGBA(
      theme.palette.background.paper,
      0
    )} 100%)`;
  };

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
              background: gradient(!lastLine),
            }
          : undefined,
      }}
      {...props}
    />
  );
};

export default OverflowGradient;
