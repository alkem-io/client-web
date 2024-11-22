import { Box, BoxProps } from '@mui/material';
import { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface CardHeaderCaptionProps extends BoxProps {
  logoUrl?: string;
}

const CardHeaderCaption = ({ logoUrl, children, ...containerProps }: PropsWithChildren<CardHeaderCaptionProps>) => (
  <Box display="flex" alignItems="center" gap={gutters(0.5)} {...containerProps}>
    {logoUrl && <Box component="img" src={logoUrl} maxHeight={gutters()} maxWidth={gutters()} />}
    <Caption noWrap>{children}</Caption>
  </Box>
);

export default CardHeaderCaption;
