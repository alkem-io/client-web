import { Box, BoxProps } from '@mui/material';

const FormCols = (props: BoxProps) => {
  return <Box display="flex" flexWrap="wrap" justifyContent="stretch" gap={4} {...props} />;
};

export default FormCols;
