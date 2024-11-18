import { Box, BoxProps } from '@mui/material';
import { rem } from './utils';
import { GUTTER_PX } from '../grid/constants';

const TextBlock = (props: BoxProps) => (
  <Box {...props} display="flex" flexDirection="column" gap={rem(GUTTER_PX / 2)} />
);

export default TextBlock;
