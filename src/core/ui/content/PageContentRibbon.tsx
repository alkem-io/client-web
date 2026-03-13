import { Box, type BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

const PageContentRibbon = ({ sx, children, ...props }: BoxProps) => (
  <Box
    component={Caption}
    sx={{ color: 'background.paper', backgroundColor: 'primary.main', ...sx }}
    display="flex"
    gap={gutters(0.5)}
    alignItems="center"
    justifyContent="center"
    padding={0.5}
    {...props}
  >
    <Caption>{children}</Caption>
  </Box>
);

export default PageContentRibbon;
