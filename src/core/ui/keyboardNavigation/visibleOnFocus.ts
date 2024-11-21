import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/material';

const visibleOnFocus =
  ({ skip = false }: { skip?: boolean } = {}) =>
  (sx: SystemStyleObject<Theme> = {}): SxProps<Theme> =>
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
            ...sx,
          },
        };

export default visibleOnFocus;
