import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import Image from '../../../shared/components/Image';
import { gutters } from '../../../../core/ui/grid/utils';

const FooterLogo = (props: BoxProps) => {
  return (
    <Box component={RouterLink} to="/about" {...props}>
      <Image src="/logo.png" alt="Alkemio" height={gutters()} display="block" />
    </Box>
  );
};

export default FooterLogo;
