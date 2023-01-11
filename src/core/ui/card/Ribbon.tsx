import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

const DEFAULT_PADDING = 1.5;

export interface RibbonProps extends BoxProps {}

export const Ribbon: FC<RibbonProps> = ({ sx, ...rest }) => {
  return (
    <Box
      padding={DEFAULT_PADDING}
      sx={{ color: 'neutralLight.main', backgroundColor: 'primary.main', ...sx }}
      {...rest}
    />
  );
};
