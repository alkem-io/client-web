import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { gutters } from '../grid/utils';

const CardFooter = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" height={gutters(2)} paddingX={1}>
      {children}
    </Box>
  );
};

export default CardFooter;
