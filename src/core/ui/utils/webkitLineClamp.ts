import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { gutters } from '../grid/utils';

const webkitLineClamp = (lines: number, options: { keepMinHeight?: boolean } = {}): SxProps<Theme> => ({
  display: '-webkit-box',
  WebkitLineClamp: `${lines}`,
  lineClamp: `${lines}`,
  WebkitBoxOrient: 'vertical',
  boxOrient: 'vertical',
  overflow: 'hidden',
  minHeight: options.keepMinHeight ? gutters(lines) : undefined,
});

export default webkitLineClamp;
