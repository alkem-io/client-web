import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface RibbonProps extends BoxProps {}

export const Ribbon: FC<RibbonProps> = ({ sx, ...rest }) => {
  return <Box padding={1.5} sx={{ color: 'neutralLight.main', backgroundColor: 'primary.main', ...sx }} {...rest} />;
};
