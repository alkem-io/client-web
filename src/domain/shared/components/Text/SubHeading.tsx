import { Box, BoxProps } from '@mui/material';
import { LINE_HEIGHT } from './Constants';

interface SubHeadingProps extends BoxProps<'h2'> {}

const SubHeading = (props: SubHeadingProps) => {
  return (
    <Box
      component="h2"
      fontSize={22}
      lineHeight={theme => theme.spacing(LINE_HEIGHT)}
      fontWeight="normal"
      margin={0}
      {...props}
    />
  );
};

export default SubHeading;
