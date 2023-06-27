import { Box, BoxProps } from '@mui/material';

const ActionsBar = (props: BoxProps) => {
  return <Box display="flex" flexDirection="row-reverse" {...props} />;
};

export default ActionsBar;
