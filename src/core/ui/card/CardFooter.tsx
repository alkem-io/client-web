import React, { PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';

const CardFooter = ({ children, ...rest }: PropsWithChildren<BoxProps>) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" height={gutters(2)} paddingX={1} {...rest}>
      {children}
    </Box>
  );
};

export default CardFooter;
