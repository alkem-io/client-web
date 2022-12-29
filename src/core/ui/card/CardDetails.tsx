import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

const CardDetails = ({ children }: PropsWithChildren<{}>) => {
  return <Box sx={{ backgroundColor: 'background.default' }}>{children}</Box>;
};

export default CardDetails;
