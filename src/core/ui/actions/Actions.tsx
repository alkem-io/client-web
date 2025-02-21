import { forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface ActionsProps extends BoxProps {}

export const Actions = forwardRef((props: ActionsProps, ref) => (
  <Box ref={ref} display="flex" gap={1} alignItems="center" justifyContent="flex-end" {...props} />
));
