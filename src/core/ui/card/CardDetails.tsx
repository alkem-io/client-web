import React, { PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';

const CardDetails = ({
  children,
  transparent = false,
  ...props
}: PropsWithChildren<{ transparent?: boolean } & BoxProps>) => {
  return (
    <Box {...props} sx={{ backgroundColor: transparent ? undefined : 'background.default' }}>
      {children}
    </Box>
  );
};

export default CardDetails;
