import { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';

export type BackgroundColor = keyof Theme['palette']['background'];

export const overflowBorderGradient =
  (angle = '0', backgroundColor: BackgroundColor = 'paper') =>
  (theme: Theme) => {
    return `linear-gradient(${angle}, ${alpha(theme.palette.background[backgroundColor], 1)} 20%, ${alpha(
      theme.palette.background[backgroundColor],
      0
    )} 100%)`;
  };
