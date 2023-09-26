import { ReactNode, useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BackgroundColor, overflowBorderGradient } from './utils';

export interface OverflowGradientProps extends BoxProps {
  lastLine?: boolean;
  backgroundColor?: BackgroundColor;
  overflowMarker?: ReactNode;
}

const OverflowGradient = ({
  lastLine = false,
  backgroundColor,
  sx,
  overflowMarker,
  ...props
}: OverflowGradientProps) => {
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateOverflow = (el: HTMLDivElement | null) => {
    if (!el) {
      return;
    }
    setHasOverflow(el.scrollHeight > el.clientHeight);
  };

  return (
    <>
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
                background: overflowBorderGradient(lastLine ? '-90deg' : '0', backgroundColor),
              }
            : undefined,
          ...sx,
        }}
        {...props}
      />
      {hasOverflow && overflowMarker}
    </>
  );
};

export default OverflowGradient;
