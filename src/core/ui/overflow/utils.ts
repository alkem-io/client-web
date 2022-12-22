import { Theme } from '@mui/material/styles';
import hexToRGBA from '../../../common/utils/hexToRGBA';

export const overflowBorderGradient =
  (angle = '0') =>
  (theme: Theme) => {
    return `linear-gradient(${angle}, ${hexToRGBA(theme.palette.background.paper, 1)} 0%, ${hexToRGBA(
      theme.palette.background.paper,
      0
    )} 100%)`;
  };
