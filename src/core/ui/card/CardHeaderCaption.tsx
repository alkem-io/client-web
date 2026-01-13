import { Box, BoxProps, useTheme } from '@mui/material';
import { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface CardHeaderCaptionProps extends BoxProps {
  logoUrl?: string;
  contrast?: boolean;
}

const CardHeaderCaption = ({
  logoUrl,
  children,
  contrast,
  ...containerProps
}: PropsWithChildren<CardHeaderCaptionProps>) => {
  const theme = useTheme();

  const captionStyle = contrast
    ? {
        color: theme.palette.background.paper,
      }
    : undefined;

  return (
    <Box display="flex" alignItems="center" gap={gutters(0.5)} {...containerProps}>
      {logoUrl && <Box component="img" src={logoUrl} maxHeight={gutters()} maxWidth={gutters()} />}
      <Caption noWrap sx={{ ...captionStyle }}>
        {children}
      </Caption>
    </Box>
  );
};

export default CardHeaderCaption;
