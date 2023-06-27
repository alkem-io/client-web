import { Theme } from '@mui/material/styles';
import hexToRGBA from '../../../common/utils/hexToRGBA';

export type BackgroundColor = keyof Theme['palette']['background'];

export const overflowBorderGradient =
  (angle = '0', backgroundColor: BackgroundColor = 'paper') =>
  (theme: Theme) => {
    return `linear-gradient(${angle}, ${hexToRGBA(theme.palette.background[backgroundColor], 1)} 20%, ${hexToRGBA(
      theme.palette.background[backgroundColor],
      0
    )} 100%)`;
  };
