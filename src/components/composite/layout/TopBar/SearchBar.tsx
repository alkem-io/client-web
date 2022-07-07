import { Box } from '@mui/material';
import React from 'react';
import TopSearchComponent from './TopSearchComponent';

const SearchBar = () => {
  return (
    <Box
      flexGrow={1}
      justifyContent="center"
      sx={{
        maxWidth: theme => theme.spacing(40),
        display: {
          xs: 'none',
          md: 'block',
        },
      }}
    >
      <TopSearchComponent />
    </Box>
  );
};

export default SearchBar;
