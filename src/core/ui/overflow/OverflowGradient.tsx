import { ReactNode } from 'react';
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
  const showOverflowMarker = !!overflowMarker;

  return (
    <>
      <Box
        overflow="hidden"
        position="relative"
        sx={{
          ':after': showOverflowMarker
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
      {showOverflowMarker && overflowMarker}
    </>
  );
};

export default OverflowGradient;
