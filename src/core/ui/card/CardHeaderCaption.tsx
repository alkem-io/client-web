import { Box, TypographyProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface CardHeaderCaptionProps extends TypographyProps {
  logoUrl?: string;
}

const CardHeaderCaption = ({ logoUrl, children, ...props }: PropsWithChildren<CardHeaderCaptionProps>) => {
  return (
    <Caption {...props}>
      {logoUrl && (
        <Box
          component="img"
          src={logoUrl}
          maxHeight={gutters()}
          maxWidth={gutters()}
          marginRight={gutters(0.5)}
          sx={{ verticalAlign: 'middle' }}
        />
      )}
      {children}
    </Caption>
  );
};

export default CardHeaderCaption;
