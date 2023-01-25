import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

const CardDetails = ({ children, transparent = false }: PropsWithChildren<{ transparent?: boolean }>) => {
  return <Box sx={{ backgroundColor: transparent ? undefined : 'background.default' }}>{children}</Box>;
};

export default CardDetails;
