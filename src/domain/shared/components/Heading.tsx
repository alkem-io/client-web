import { Box, BoxProps, Typography, TypographyProps } from '@mui/material';
import React, { ComponentType } from 'react';

type HeadingProps = BoxProps<ComponentType, TypographyProps> & {
  sub?: boolean;
};

/**
 * Most commonly used style for headings.
 * TODO Consider extracting this style to Typography, so that no overrides are needed.
 */
const Heading = ({ sub = false, ...props }: HeadingProps) => {
  return <Box component={Typography} variant={sub ? 'h5' : 'h4'} fontWeight="bold" {...props} />;
};

export default Heading;
