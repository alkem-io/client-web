import { Box } from '@mui/material';

export const ResponsiveDebugger = () => (
  <Box>
    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>XS</Box>
    <Box sx={{ display: { xs: 'none', sm: 'block', md: 'none' } }}>SM</Box>
    <Box sx={{ display: { xs: 'none', md: 'block', lg: 'none' } }}>MD</Box>
    <Box sx={{ display: { xs: 'none', lg: 'block', xl: 'none' } }}>LG</Box>
    <Box sx={{ display: { xs: 'none', xl: 'block' } }}>XL</Box>
  </Box>
);
