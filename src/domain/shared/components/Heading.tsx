import { Box, BoxProps, Typography, TypographyProps } from '@mui/material';
import React, { ComponentType } from 'react';

type HeadingProps = BoxProps<ComponentType, TypographyProps> & {
  sub?: boolean;
};

/**
 @deprecated - use components exported from core/ui/typography/components
 */
const Heading = ({ sub = false, ...props }: HeadingProps) => {
  return <Box component={Typography} variant={sub ? 'h5' : 'h4'} fontWeight="bold" {...props} />;
};

export default Heading;
