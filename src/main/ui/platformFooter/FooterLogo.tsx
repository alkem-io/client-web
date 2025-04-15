import React from 'react';
import { Box, BoxProps } from '@mui/material';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';

const FooterLogo = (props: BoxProps) => {
  return (
    <Box component={RouterLink} to="/" {...props}>
      <ImageFadeIn src="/logo.png" alt="Alkemio" height={gutters()} display="block" />
    </Box>
  );
};

export default FooterLogo;
