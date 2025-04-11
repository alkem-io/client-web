import React from 'react';
import { Link } from 'react-router-dom';
import { Box, BoxProps } from '@mui/material';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { gutters } from '@/core/ui/grid/utils';

const FooterLogo = (props: BoxProps) => {
  return (
    <Box component={Link} to="/about" {...props}>
      <ImageFadeIn src="/logo.png" alt="Alkemio" height={gutters()} display="block" />
    </Box>
  );
};

export default FooterLogo;
