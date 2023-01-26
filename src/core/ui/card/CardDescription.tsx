import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import WrapperMarkdown from '../markdown/WrapperMarkdown';
import OverflowGradient from '../overflow/OverflowGradient';
import stopPropagationFromLinks from '../utils/stopPropagationFromLinks';

const DESCRIPTION_TEXT_MAX_LINES = 5;

interface CardDescriptionProps extends BoxProps {
  children: string;
}

export const CardDescription = ({ children, ...rest }: CardDescriptionProps) => {
  return (
    <Box paddingX={1.5} paddingY={1} onClick={stopPropagationFromLinks} {...rest}>
      <OverflowGradient height={gutters(DESCRIPTION_TEXT_MAX_LINES)} backgroundColor="default">
        <WrapperMarkdown>{children}</WrapperMarkdown>
      </OverflowGradient>
    </Box>
  );
};

export default CardDescription;
