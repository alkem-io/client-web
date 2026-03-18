import { Box, type BoxProps } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';

const CardFooter = ({ children, ...containerProps }: PropsWithChildren<BoxProps>) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    height={gutters(2)}
    paddingX={1}
    {...containerProps}
  >
    {children}
  </Box>
);

export default CardFooter;
