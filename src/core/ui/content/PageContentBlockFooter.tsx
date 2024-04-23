import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';

const PageContentBlockFooter = (props: BoxProps) => {
  return <Box display="flex" alignItems="center" marginTop={gutters(0.5)} paddingX={gutters(0.5)} {...props} />;
};

export default PageContentBlockFooter;
