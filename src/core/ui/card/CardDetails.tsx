import React from 'react';
import { Box, BoxProps } from '@mui/material';

const CardDetails = ({ transparent = false, sx, ...boxProps }: { transparent?: boolean } & BoxProps) => {
  const mergedSx = {
    backgroundColor: transparent ? undefined : 'background.default',
    ...sx,
  };

  return <Box sx={mergedSx} {...boxProps} />;
};

export default CardDetails;
