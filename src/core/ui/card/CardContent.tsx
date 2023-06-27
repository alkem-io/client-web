import React from 'react';
import { Box, BoxProps } from '@mui/material';

const CardContent = (props: BoxProps) => {
  return <Box paddingX={1.5} {...props} />;
};

export default CardContent;
