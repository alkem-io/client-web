import { Box, type BoxProps } from '@mui/material';
import { GUTTER_PX } from '../grid/constants';
import { rem } from './utils';

const TextBlock = (props: BoxProps) => (
  <Box {...props} display="flex" flexDirection="column" gap={rem(GUTTER_PX / 2)} />
);

export default TextBlock;
