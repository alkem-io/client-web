import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/material/Box/Box';
import { gutters } from './utils';

interface GuttersProps {
  row?: boolean;
}

const Gutters = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  row = false,
  ...props
}: GuttersProps & BoxProps<D, P>) => {
  return <Box display="flex" flexDirection={row ? 'row' : 'column'} padding={gutters()} gap={gutters()} {...props} />;
};

export default Gutters;
