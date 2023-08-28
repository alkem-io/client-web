import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import WrapperMarkdown from '../markdown/WrapperMarkdown';
import OverflowGradient, { OverflowGradientProps } from '../overflow/OverflowGradient';
import stopPropagationFromLinks from '../utils/stopPropagationFromLinks';

const DEFAULT_HEIGHT_GUTTERS = 5;

interface CardDescriptionProps extends BoxProps {
  children: string;
  overflowGradientColor?: OverflowGradientProps['backgroundColor'];
  heightGutters?: number;
}

export const CardDescription = ({
  children,
  overflowGradientColor = 'default',
  heightGutters = DEFAULT_HEIGHT_GUTTERS,
  ...containerProps
}: CardDescriptionProps) => {
  return (
    <Box paddingX={1.5} paddingY={1} onClick={stopPropagationFromLinks} {...containerProps}>
      <OverflowGradient height={gutters(heightGutters)} backgroundColor={overflowGradientColor}>
        <WrapperMarkdown>{children}</WrapperMarkdown>
      </OverflowGradient>
    </Box>
  );
};

export default CardDescription;
