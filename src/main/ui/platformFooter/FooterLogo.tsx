import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { RouterLink } from '@/_deprecated/routing/RouterLink';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { gutters } from '@/core/ui/grid/utils';

const FooterLogo = (props: BoxProps) => {
  return (
    <Box component={RouterLink} to="/about" {...props}>
      <ImageFadeIn src="/logo.png" alt="Alkemio" height={gutters()} display="block" />
    </Box>
  );
};

export default FooterLogo;
