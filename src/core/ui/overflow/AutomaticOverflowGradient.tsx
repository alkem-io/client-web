import { ReactNode, useEffect, useRef, useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BackgroundColor, overflowBorderGradient } from './utils';
import { useResizeDetector } from 'react-resize-detector';

export interface AutomaticOverflowGradientProps extends BoxProps {
  lastLine?: boolean;
  backgroundColor?: BackgroundColor;
  overflowMarker?: ReactNode;
}

const AutomaticOverflowGradient = ({
  lastLine = false,
  backgroundColor,
  sx,
  overflowMarker,
  children,
  ...props
}: AutomaticOverflowGradientProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const { ref: internalRef, height } = useResizeDetector();
  const outerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (outerRef.current && internalRef.current) {
      console.log('height changed');
      setIsOverflowing(internalRef.current.scrollHeight > outerRef.current.clientHeight);
    }
  }, [outerRef, internalRef, height, children]);

  return (
    <>
      <Box
        overflow="hidden"
        position="relative"
        ref={outerRef}
        sx={{
          ':after': isOverflowing
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
      >
        <Box ref={internalRef}>{children}</Box>
      </Box>
      {isOverflowing && overflowMarker}
    </>
  );
};

export default AutomaticOverflowGradient;
