import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Text } from '../typography';
import { gutters } from '../grid/utils';
import webkitLineClamp from '../utils/webkitLineClamp';

const DESCRIPTION_TEXT_MAX_LINES = 5;

export const CardDescription = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Box height={gutters(DESCRIPTION_TEXT_MAX_LINES + 1)} paddingX={1.5} paddingY={1}>
      <Text maxHeight="100%" overflow="hidden" sx={webkitLineClamp(DESCRIPTION_TEXT_MAX_LINES)}>
        {children}
      </Text>
    </Box>
  );
};

export default CardDescription;
