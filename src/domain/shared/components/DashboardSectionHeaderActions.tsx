import { Box, BoxProps } from '@mui/material';
import React from 'react';

const DashboardSectionHeaderActions = (props: BoxProps) => {
  return (
    <Box
      display="flex"
      flexWrap={{ xs: 'wrap', sm: 'wrap', md: 'nowrap' }}
      gap={2}
      flexGrow={0}
      flexShrink={1}
      justifyContent="end"
      marginLeft="auto"
      {...props}
    />
  );
};

export default DashboardSectionHeaderActions;
