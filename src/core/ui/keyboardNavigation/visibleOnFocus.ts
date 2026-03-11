import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

const visibleOnFocus =
  ({ skip = false }: { skip?: boolean } = {}) =>
  (sx: SxProps<Theme> = {}): SxProps<Theme> =>
    skip
      ? sx
      : {
          ...sx,
          ':not(:focus)': {
            position: 'fixed',
            overflow: 'hidden',
            opacity: 0,
            width: 0,
            height: 0,
            boxSizing: 'border-box',
          },
        };

export default visibleOnFocus;
