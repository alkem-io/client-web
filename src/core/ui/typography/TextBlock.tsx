import { Box, BoxProps } from '@mui/material';
import { rem } from './utils';
import { gutter } from '../grid/constants';

const TextBlock = (props: BoxProps) => {
  return <Box {...props} display="flex" flexDirection="column" gap={rem(gutter / 2)} />;
};

export default TextBlock;
