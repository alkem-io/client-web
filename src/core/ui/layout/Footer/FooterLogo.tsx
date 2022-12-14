import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import Image from '../../../../domain/shared/components/Image';

const FooterLogo = (props: BoxProps) => {
  return (
    <Box component={RouterLink} to="/about" {...props}>
      <Image src="/logo.png" alt="Alkemio" height={theme => theme.spacing(2)} />
    </Box>
  );
};

export default FooterLogo;
