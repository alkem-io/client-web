import { PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';
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
