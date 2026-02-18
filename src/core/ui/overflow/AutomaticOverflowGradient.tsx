import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { BackgroundColor, overflowBorderGradient } from './utils';
import { useResizeDetector } from 'react-resize-detector';

export interface AutomaticOverflowGradientProps extends BoxProps {
  lastLine?: boolean;
  backgroundColor?: BackgroundColor;
  overflowMarker?: ReactNode;
  expanderButton?: ReactNode;
  onOverflowChange?: (isOverflowing: boolean) => void;
}

const AutomaticOverflowGradient = ({
  lastLine = false,
  backgroundColor,
  sx,
  overflowMarker,
  expanderButton,
  onOverflowChange,
  children,
  ...props
}: AutomaticOverflowGradientProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const { ref: internalRef, height } = useResizeDetector();
  const outerRef = useRef<HTMLElement>(null);
  const prevOverflowingRef = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    if (outerRef.current && internalRef.current) {
      const overflowing = internalRef.current.scrollHeight > outerRef.current.clientHeight;
      setIsOverflowing(overflowing);
      if (prevOverflowingRef.current !== overflowing) {
        prevOverflowingRef.current = overflowing;
        onOverflowChange?.(overflowing);
      }
    }
  }, [outerRef, internalRef, height, children, onOverflowChange]);

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
        <Box ref={internalRef} sx={{ paddingBottom: gutters(0.5) }}>
          {children}
        </Box>
      </Box>
      {isOverflowing && overflowMarker}
      {isOverflowing && expanderButton}
    </>
  );
};

export default AutomaticOverflowGradient;
