import { SxProps } from '@mui/material';

const webkitLineClamp = (lines: number): SxProps => ({
  display: '-webkit-box',
  '-webkit-line-clamp': `${lines}`,
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
});

export default webkitLineClamp;
