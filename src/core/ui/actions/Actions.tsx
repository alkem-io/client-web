import { forwardRef, PropsWithChildren } from 'react';

import { Box, BoxProps } from '@mui/material';

export const Actions = forwardRef((props: PropsWithChildren<ActionsProps>, ref) => (
  <Box ref={ref} display="flex" gap={1} alignItems="center" {...props} />
));

export interface ActionsProps extends BoxProps {}
