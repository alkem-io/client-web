import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';

const TabExplanationHeader: FC = ({ children }) => {
  return (
    <Box paddingY={2} display="flex" justifyContent="center">
      <Typography>{children}</Typography>
    </Box>
  );
};

export default TabExplanationHeader;
