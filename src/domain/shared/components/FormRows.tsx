import { Box, BoxProps } from '@mui/material';

const FormRows = (props: BoxProps) => {
  return (
    <Box
      flexGrow={1}
      flexShrink={1}
      flexBasis={0}
      display="flex"
      flexDirection="column"
      gap={3}
      paddingTop={1}
      {...props}
    />
  );
};

export default FormRows;
