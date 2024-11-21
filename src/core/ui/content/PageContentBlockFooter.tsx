import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';

const PageContentBlockFooter = (props: BoxProps) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    marginTop={gutters(0.5)}
    paddingLeft={gutters(0.5)}
    {...props}
  />
);

export default PageContentBlockFooter;
