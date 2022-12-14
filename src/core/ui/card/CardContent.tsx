import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';

const CardContent = (props: BoxProps) => {
  return <Box paddingX={1.5} paddingY={1} display="flex" flexDirection="column" gap={gutters()} {...props} />;
};

export default CardContent;
