import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface ActionsProps extends BoxProps {}

export const Actions: FC<ActionsProps> = props => {
  return <Box display="flex" gap={1} alignItems="center" {...props} />;
};
