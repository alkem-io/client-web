import React, { FC } from 'react';
import { Box, BoxProps, Theme, useMediaQuery } from '@mui/material';

export interface ActionsProps extends BoxProps {}

export const Actions: FC<ActionsProps> = props => {
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.only('xs'));
  return <Box display="flex" gap={isSmallScreen ? 0 : 1} alignItems="center" {...props} />;
};
