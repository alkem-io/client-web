import React from 'react';
import { Box } from '@mui/material';
import { Caption } from '@/core/ui/typography';

const TextContainer = ({ children }) => {
  return (
    <Box flex="1 0 300px" display="flex" alignItems="center">
      <Caption>{children}</Caption>
    </Box>
  );
};

export default TextContainer;
