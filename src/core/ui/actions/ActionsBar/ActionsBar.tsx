import { Box, BoxProps } from '@mui/material';

const ActionsBar = (props: BoxProps) => (
  <Box display="flex" flexDirection="row-reverse" alignItems="center" {...props} />
);

export default ActionsBar;
