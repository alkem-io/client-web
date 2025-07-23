import { Box, BoxProps } from '@mui/material';

export interface ActionsProps extends BoxProps {}

export const Actions = ({
  ref,
  ...props
}: ActionsProps & {
  ref?: React.RefObject<unknown>;
}) => <Box ref={ref} display="flex" gap={1} alignItems="center" justifyContent="flex-end" {...props} />;
