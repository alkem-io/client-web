import { Box, TypographyProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface CardHeaderCaptionProps extends TypographyProps {
  logoUrl?: string;
}

const CardHeaderCaption = ({ logoUrl, children, ...props }: PropsWithChildren<CardHeaderCaptionProps>) => {
  return (
    <Box display="flex" alignItems="center" gap={gutters(0.5)} {...props}>
      {logoUrl && <Box component="img" src={logoUrl} maxHeight={gutters()} maxWidth={gutters()} />}
      <Caption noWrap>{children}</Caption>
    </Box>
  );
};

export default CardHeaderCaption;
