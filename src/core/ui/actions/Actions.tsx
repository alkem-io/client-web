import React, { FC, forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface ActionsProps extends BoxProps {}

export const Actions: FC<ActionsProps> = forwardRef((props, ref) => {
  return <Box ref={ref} display="flex" gap={1} alignItems="center" {...props} />;
});
