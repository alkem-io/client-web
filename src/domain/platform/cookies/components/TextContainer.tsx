import React from 'react';
import { Box } from '@mui/material';

const TextContainer = ({ children }) => {
  return (
    <Box flex={'1 0 300px'} margin={'15px'}>
      {children}
    </Box>
  );
};

export default TextContainer;
