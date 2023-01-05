import { Box, TypographyProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';
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
          sx={theme => ({
            verticalAlign: 'middle',
            maxHeight: theme.spacing(2),
            maxWidth: theme.spacing(2),
            marginRight: theme.spacing(0.6),
          })}
        />
      )}
      {children}
    </Caption>
  );
};

export default CardHeaderCaption;
